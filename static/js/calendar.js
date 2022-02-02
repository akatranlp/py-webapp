import {user, axiosInstance} from "./repo.js";

const calenderDiv = document.getElementById("calenderContent")
const participantsDiv = document.getElementById("participantsContent")
const participantsButton = document.getElementById("addParticipant")
const formElement = document.querySelector("[data-form]")
const invitesContent = document.getElementById("invitesContent")
const invitesButton = document.getElementById("createEinladnung")

async function getEvents() {

    const response = await axiosInstance.get("/events")

    const jsonData = response.data

    console.log(jsonData)
    return jsonData
}

async function inviteAndAccept() {
    const response = await axiosInstance.get("/invitations?status_id=1")

    const jsonData = response.data

    console.log(jsonData)
    return jsonData
}

async function deleteItem(ID) {
    console.log(ID)

    try {
        const response = await axiosInstance.delete(`/events/${ID}`)
        console.log(response)
    } catch (e) {
        console.log(e)

        try {
           const response = await axiosInstance.put(`/invitations/${ID}`, {
                "status_id": 3
            })
            console.log(response)
        } catch (e) {
            console.log(e)
        }
    }


}


async function createCalender() {

    let response1 = await getEvents()

    console.log(response1)

    let response2 = await inviteAndAccept()

    console.log(response2)

    const response = response1.concat(response2)

    response.sort(function (a, b) {
        return new Date(a.start_date) - new Date(b.start_date)
    })

    console.log(response)

    response.forEach(element => {

        console.log(element)


        const calenderElement = document.createElement('div');
        calenderElement.className = "p-2 border border-success rounded highlight mb-1"
        calenderElement.classList.add('calenderCSS')

        let startDate = JSON.stringify(element.start_date)
        let spilttetStart = startDate.split("T")
        let start = spilttetStart[0].split("-")
        let startYear = start[0].substring(1)
        let startMonth = start[1]
        let startDay = start[2]
        let startHour = spilttetStart[1].split(":")[0]
        let startMinute = spilttetStart[1].split(":")[1]

        let endDate = JSON.stringify(element.end_date)
        let splittetEnd = endDate.split("T")
        let end = splittetEnd[0].split("-")
        let endYear = end[0].substring(1)
        let endMonth = end[1]
        let endDay = end[2]
        let endHour = splittetEnd[1].split(":")[0]
        let endMinute = splittetEnd[1].split(":")[1]

        let ort
        if (element.location !== "") {
            ort = "Ort: " + element.location
        } else {
            ort = ""
        }


        calenderElement.innerHTML = `
            <h1>${element.title}</h1> 
            <p>${element.description}</p>
            <p>${ort}</p>
            <p><b>von:</b> ${startDay}.${startMonth}.${startYear} - ${startHour}:${startMinute}<br>
            <b>bis:&nbsp;</b> ${endDay}.${endMonth}.${endYear} - ${endHour}:${endMinute}<br>
            <b>Teilnehmer:</b>
            </p>
            `

        const user = element.participants.map((user) => {
            return {
                contactName: user.contact_name,
                contactFirstname: user.contact_firstname,
                status: user.status,
                uuid: user.contact_uuid
            }
        })

        user.forEach((user) => {
            const userWrapperDiv = document.createElement("div")
            const userDiv = document.createElement("div")
            if (user.status === "Pending") {
                userDiv.className += "alert-warning mb-2"
            } else if (user.status === "Accepted") {
                userDiv.className += "alert-success mb-2"
            } else if (user.status === "Declined") {
                userDiv.className += "alert-danger mb-2"
            }
            userDiv.innerHTML += `
              ${JSON.stringify(user.contactFirstname).replaceAll('"', '')}, ${JSON.stringify(user.contactName).replaceAll('"', '')} 
            `


            let btn = document.createElement("button")
            btn.className = "btn btn-danger "
            btn.innerText = "Person ausladen"
            btn.addEventListener("click", async () => {

                const response = await axiosInstance.delete("/events/" + element.uuid + "/entries/" + user.uuid + "")
                console.log(await response)
                userWrapperDiv.removeChild(userDiv)
            })
            userDiv.appendChild(btn)
            userWrapperDiv.appendChild(userDiv)
            calenderElement.appendChild(userWrapperDiv)

        })


        calenderDiv.appendChild(calenderElement)
        //Button zum Termin absagen hinzufügen
        let btn = document.createElement("button")
        btn.className = "btn btn-danger mr-sm-2"
        btn.innerText = "Termin absagen"
        btn.addEventListener("click", () => {
            calenderDiv.removeChild(calenderElement)
            deleteItem(element.uuid)
        })
        calenderElement.appendChild(btn)


    });

}


participantsButton.addEventListener("click", async (e) => {
    const response = await axiosInstance.get("/contacts")
    let contacts = await response.data
    participantsDiv.innerHTML = ""

    contacts.forEach((element) => {
        const firstName = element.firstname
        const lastName = element.name
        const uuid = element.uuid

        participantsDiv.innerHTML += ` 
        <p><input type="checkbox" class="checkboxOfParticipants" value="${uuid}"> ${firstName} ${lastName} </p>
        `
    })
})

invitesButton.addEventListener("click", async (e) => {
    const response = await axiosInstance.get("/invitations?status_id=2")
    let invites = await response.data
    invitesContent.innerHTML = ""
    console.log(invites)


    invites.forEach((element, i) => {
        const stringElement = JSON.stringify(element)
        const inviterName = element.creator_username
        const eventTitel = element.title
        const uuid = element.uuid
        const inviteElement = document.createElement("div")
        console.log(stringElement)

        inviteElement.innerHTML += ` 
        <p>Eingeladen von: ${inviterName} <br>
         zum event: ${eventTitel}</p>
        `

        invitesContent.appendChild(inviteElement)

        let btnAbsage = document.createElement("button")
        btnAbsage.className = "btn btn-danger mr-sm-2"
        btnAbsage.innerText = "Termin absagen"
        btnAbsage.addEventListener("click", async () => {

            const response = await axiosInstance.put(`/invitations/${uuid}`, {
                "status_id": 3
            })
            console.log(await response)

            invitesContent.removeChild(inviteElement)
            location.reload()
        })
        inviteElement.appendChild(btnAbsage)


        let btnZusage = document.createElement("button")
        btnZusage.className = "btn btn-success mr-sm-2"
        btnZusage.innerText = "Termin zusagen"

        btnZusage.addEventListener("click", async () => {
            const response = await axiosInstance.put(`/invitations/${uuid}`, {
                "status_id": 1
            })
            console.log(await response)

            invitesContent.removeChild(inviteElement)
            location.reload()
        })
        inviteElement.appendChild(btnZusage)


    })

})

formElement.addEventListener("submit", async (e) => {
    e.preventDefault()
    const checkbox = document.getElementsByClassName("checkboxOfParticipants")

    let user = []

    for (let i = 0; i < checkbox.length; i++) {
        if (checkbox[i].checked) {
            user.push(checkbox[i].value)
        }
    }


    const partic = user.map((user) => {
        return {contact_uuid: user}
    })


    console.log(partic)

    let data = {
        "title": document.getElementById("Titel").value,
        "start_date": document.getElementById("Start").value,
        "end_date": document.getElementById("Ende").value,
        "description": document.getElementById("Beschreibung").value,
        "location": document.getElementById("Ort").value,
        "participants": partic
    }

    console.log(data)
    try {
        await axiosInstance.post("/events", data)
        location.reload()
    } catch (e) {
        console.log(e.response.data.detail)
    }
})

createCalender()

