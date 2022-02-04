import {user, axiosInstance} from "./repo.js";

const calenderDiv = document.getElementById("calenderContent")
const participantsDiv = document.getElementById("participantsContent")
const participantsButton = document.getElementById("addParticipant")
const formElement = document.querySelector("[data-form]")
const invitesContent = document.getElementById("invitesContent")
const invitesButton = document.getElementById("createEinladung")
const titleElement = document.getElementById("Titel")
const startElement = document.getElementById("Start")
const endElement = document.getElementById("Ende")
const descriptionElement = document.getElementById("Beschreibung")
const locationElement = document.getElementById("Ort")


const getCalenderElement = (event, me) => {
    const calenderElement = document.createElement('div');
    calenderElement.className = "p-2 border border-success rounded highlight mb-1"
    calenderElement.classList.add('calenderCSS')

    const startDate = JSON.stringify(event.start_date)
    const spilttetStart = startDate.split("T")
    const start = spilttetStart[0].split("-")
    const startYear = start[0].substring(1)
    const startMonth = start[1]
    const startDay = start[2]
    const startHour = spilttetStart[1].split(":")[0]
    const startMinute = spilttetStart[1].split(":")[1]

    const endDate = JSON.stringify(event.end_date)
    const splittetEnd = endDate.split("T")
    const end = splittetEnd[0].split("-")
    const endYear = end[0].substring(1)
    const endMonth = end[1]
    const endDay = end[2]
    const endHour = splittetEnd[1].split(":")[0]
    const endMinute = splittetEnd[1].split(":")[1]

    const ort = event.location !== "" ? `Ort: ${event.location}` : ""

    calenderElement.innerHTML = `
            <h1>${event.title}</h1> 
            <p>${event.description}</p>
            <p>${ort}</p>
            <p><b>von:</b> ${startDay}.${startMonth}.${startYear} - ${startHour}:${startMinute}<br>
            <b>bis:&nbsp;</b> ${endDay}.${endMonth}.${endYear} - ${endHour}:${endMinute}<br>
            <b>Teilnehmer:</b>
            </p>
            `
    event.participants.forEach((participant) => {
        const userDiv = document.createElement("div")

        if (participant.status === "Pending") {
            userDiv.className = "alert-warning p-2 d-flex"
        } else if (participant.status === "Accepted") {
            userDiv.className = "alert-success p-2 d-flex"
        } else if (participant.status === "Declined") {
            userDiv.className = "alert-danger p-2 d-flex"
        }
        userDiv.innerHTML = `<div class="m-2">${participant.contact_firstname}, ${participant.contact_name}</div>`

        if (me.email === event.creator_email && me.username === event.creator_username) {
            const btn = document.createElement("button")
            btn.className = "btn btn-danger "
            btn.innerText = "Person ausladen"
            btn.addEventListener("click", async () => {
                try {
                    await axiosInstance.delete(`/events/${event.uuid}/entries/${participant.contact_uuid}`)
                    userDiv.remove()
                } catch (e) {
                    alert(e)
                }
            })
            userDiv.appendChild(btn)
        }
        calenderElement.appendChild(userDiv)
    })

    const btn = document.createElement("button")
    btn.className = "btn btn-danger mr-sm-2"
    btn.innerText = "Termin absagen"
    btn.addEventListener("click", async () => {
        try {
            if (me.email === event.creator_email && me.username === event.creator_username) {
                await axiosInstance.delete(`/events/${event.uuid}`)
                calenderElement.remove()
            } else {
                await axiosInstance.put(`/invitations/${event.uuid}`, {status_id: 3})
                calenderElement.remove()
            }
        } catch (e) {
            alert(e)
        }
    })
    calenderElement.appendChild(btn)
    return calenderElement
}


const createCalender = async (me) => {
    calenderDiv.innerHTML = ''
    const myEvents = await axiosInstance.get("/events")
    const invitedEvents = await axiosInstance.get("/invitations?status_id=1")

    const events = [...myEvents.data, ...invitedEvents.data]

    events.sort((a, b) => {
        return new Date(a.start_date) - new Date(b.start_date)
    })

    events.forEach(event => {
        calenderDiv.appendChild(getCalenderElement(event, me))
    });
}

participantsButton.addEventListener("click", async () => {
    const response = await axiosInstance.get("/contacts")
    participantsDiv.innerHTML = ""

    response.data.forEach((participant) => {
        participantsDiv.innerHTML += ` 
        <p><input type="checkbox" class="checkboxOfParticipants" value="${participant.uuid}">${participant.firstname} ${participant.name}</p>
        `
    })
})

const init = async () => {

    const me = await user.getMe()

    invitesButton.addEventListener("click", async () => {
        const response = await axiosInstance.get("/invitations?status_id=2")
        invitesContent.innerHTML = ""

        response.data.forEach(event => {
            const inviterName = event.creator_username
            const eventTitel = event.title
            const uuid = event.uuid
            const inviteElement = document.createElement("div")

            inviteElement.innerHTML = ` 
            <p>Eingeladen von: ${inviterName} <br>
             zum event: ${eventTitel}</p>
            `

            invitesContent.appendChild(inviteElement)

            let btnAbsage = document.createElement("button")
            btnAbsage.className = "btn btn-danger mr-sm-2"
            btnAbsage.innerText = "Termin absagen"
            btnAbsage.addEventListener("click", async () => {
                await axiosInstance.put(`/invitations/${uuid}`, {status_id: 3})
                inviteElement.remove()
            })
            inviteElement.appendChild(btnAbsage)

            let btnZusage = document.createElement("button")
            btnZusage.className = "btn btn-success mr-sm-2"
            btnZusage.innerText = "Termin zusagen"

            btnZusage.addEventListener("click", async () => {
                await axiosInstance.put(`/invitations/${uuid}`, {status_id: 1})
                inviteElement.remove()
                await createCalender(me)
            })
            inviteElement.appendChild(btnZusage)
        })
    })


    formElement.addEventListener("submit", async (e) => {
        e.preventDefault()
        const checkbox = document.getElementsByClassName("checkboxOfParticipants")

        const participants = []

        for (const cb of checkbox) {
            if (cb.checked) {
                participants.push({contact_uuid: cb.value})
            }
        }

        const data = {
            title: titleElement.value,
            start_date: startElement.value,
            end_date: endElement.value,
            description: descriptionElement.value,
            location: locationElement.value,
            participants
        }
        try {
            await axiosInstance.post("/events", data)
            await createCalender(me)
            titleElement.value = ''
            startElement.value = ''
            endElement.value = ''
            descriptionElement.value = ''
            locationElement.value = ''
            $('#createModal').modal('hide');
        } catch (e) {
            console.log(e)
            alert(e.response.data.detail)
        }
    })

    await createCalender(me)
}

init()
