import {user, axiosInstance} from "./repo.js";

const calenderDiv = document.getElementById("calenderContent")
const participantsDiv = document.getElementById("participantsContent")
const participantsButton = document.getElementById("addParticipant")
const formElement = document.querySelector("[data-form]")

async function f() {

    const response = await axiosInstance.get("/events")

    const jsonData = response.data

    console.log(jsonData)
    return jsonData
}

async function deleteItem(ID) {
    console.log(ID)

    const response = await axiosInstance.delete(`/events/${ID}`)
    console.log(response)
}

async function createCalender() {

    let calenderEntries = document.createElement("div")
    let response = await f()

    console.log(response)

    response.sort(function (a, b) {
        return new Date(a.start_date) - new Date(b.start_date)
    })

    console.log(response)

    response.forEach(element => {

        console.log(element)

        calenderDiv.appendChild(calenderEntries)
        var aItem = document.createElement('div');
        aItem.className = "p-2 border border-success rounded highlight mb-1"
        aItem.classList.add('calenderCSS')

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
        if (element.location != "") {
            ort = "Ort: " + element.location
        } else {
            ort = ""
        }

        aItem.innerHTML = `
            <h1>${element.title}</h1> 
            <p>${element.description}</p>
            <p>${ort}</p>
            <p><b>von:</b> ${startDay}.${startMonth}.${startYear} - ${startHour}:${startMinute}<br>
            <b>bis:&nbsp;</b> ${endDay}.${endMonth}.${endYear} - ${endHour}:${endMinute}</p>`

        calenderEntries.appendChild(aItem);
        //Button zum Termin absagen hinzufügen
        let btn = document.createElement("button")
        btn.className = "btn btn-danger mr-sm-2"
        btn.innerText = "Termin absagen"
        btn.addEventListener("click", () => {
            calenderEntries.removeChild(aItem)
            deleteItem(element.uuid)
        })
        aItem.appendChild(btn);
    });

}

participantsButton.addEventListener("click", async (e) => {
    const response = await axiosInstance.get("/contacts")
    let contacts = await response.data


    contacts.forEach((element, i) => {
        const firstName = element.firstname
        const lastName = element.name
        const uuid = element.uuid

        participantsDiv.innerHTML += ` 
        <p>${firstName} ${lastName} <input type="checkbox" class="checkboxOfParticipants" name="klaus" value="${uuid}"></p>
        `
    })
})

formElement.addEventListener("submit", async (e) => {
    e.preventDefault()
    const checkbox = document.getElementsByClassName("checkboxOfParticipants")

    var user = []

    for (var i = 0; i < checkbox.length; i++) {
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

