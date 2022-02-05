import {user, axiosInstance} from "./repo.js";

const calenderDiv = document.getElementById("calenderContent")
const participantsDiv = document.getElementById("participantsContent")
const participantsButton = document.getElementById("addParticipant")
const formElement = document.querySelector("[data-form]")
const invitesContent = document.getElementById("invitesContent")
const titleElement = document.getElementById("Titel")
const startElement = document.getElementById("Start")
const endElement = document.getElementById("Ende")
const descriptionElement = document.getElementById("Beschreibung")
const locationElement = document.getElementById("Ort")
const inviteCount = document.querySelector("[data-invite-count]")

const errorAlert = document.querySelector("[data-alert]");

const editTitleElement = document.getElementById("edit-Titel")
const editStartElement = document.getElementById("edit-Start")
const editEndElement = document.getElementById("edit-Ende")
const editDescriptionElement = document.getElementById("edit-Beschreibung")
const editLocationElement = document.getElementById("edit-Ort")
const editUUIDElement = document.querySelector("[data-edit-uuid]")
const editFormElement = document.querySelector("[data-form-edit]")

let eventObject;

const getSelectContactContainer = async () => {
    const resp = await axiosInstance.get('/contacts')

    const selectElement = document.createElement('select')
    resp.data.forEach(contact => {
        const optionElement = document.createElement('option')
        optionElement.innerText = `${contact.firstname} ${contact.name}`
        optionElement.value = contact.uuid
        selectElement.appendChild(optionElement)
    })
    return selectElement
}

const getCalenderParticipantElement = (me, event, participant) => {
    const userDiv = document.createElement("div")

    if (participant.status === "Pending") {
        userDiv.className = "alert-warning p-2 mb-2 d-flex"
    } else if (participant.status === "Accepted") {
        userDiv.className = "alert-success p-2 mb-2 d-flex"
    } else if (participant.status === "Declined") {
        userDiv.className = "alert-danger p-2 mb-2 d-flex"
    }
    userDiv.innerHTML = `<div class="m-2">${participant.contact_firstname}, ${participant.contact_name}</div>`

    if (me.email === event.creator_email && me.username === event.creator_username) {
        const btn = document.createElement("button")
        btn.className = "btn btn-danger "
        btn.innerText = "Person ausladen"
        btn.addEventListener("click", async () => {
            try {
                await axiosInstance.delete(`/events/${event.uuid}/entries/${participant.contact_uuid}`)
                closeErrorAlertIfThere()
                userDiv.remove()
            } catch (e) {
                openErrorAlert(e.response.data.detail, e)
            }
        })
        userDiv.appendChild(btn)
    }
    return userDiv
}

const getCalenderElement = (event, me) => {
    const calenderElement = document.createElement('div');
    calenderElement.className = "p-2 border border-success rounded highlight mb-1"
    calenderElement.classList.add('calenderCSS')

    const startDate = JSON.stringify(event.start_date)
    const splittetStart = startDate.split("T")
    const start = splittetStart[0].split("-")
    const startYear = start[0].substring(1)
    const startMonth = start[1]
    const startDay = start[2]
    const startHour = splittetStart[1].split(":")[0]
    const startMinute = splittetStart[1].split(":")[1]

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
        calenderElement.appendChild(getCalenderParticipantElement(me, event, participant))
    })

    if (me.email === event.creator_email && me.username === event.creator_username) {

        const container = document.createElement('div')
        container.className = 'm-2'

        const inviteButton = document.createElement("button")
        inviteButton.textContent = '+'
        inviteButton.className = 'btn btn-primary'

        inviteButton.addEventListener('click', async () => {
            const formElement = document.createElement("form")
            formElement.action = ''
            formElement.method = 'post'
            formElement.className = 'mb-2'

            const selectContainer = await getSelectContactContainer()
            formElement.appendChild(selectContainer)

            const btn = document.createElement("input");
            btn.type = 'submit'
            btn.className = 'btn btn-success'
            btn.value = 'Einladen'

            formElement.appendChild(btn)

            const cancelBtnElement = document.createElement('button')
            cancelBtnElement.innerText = '×'
            cancelBtnElement.className = 'btn btn-danger text-white mr-sm-2'
            formElement.appendChild(cancelBtnElement)

            cancelBtnElement.addEventListener('click', () => {
                formElement.remove()
            })

            formElement.addEventListener('submit', async (e) => {
                e.preventDefault()
                const contact_uuid = selectContainer.value
                try {
                    const resp = await axiosInstance.post(`/events/${event.uuid}/entries`, {contact_uuid})
                    const newParticipantElement = getCalenderParticipantElement(me, event, resp.data)
                    calenderElement.insertBefore(newParticipantElement, container)
                    closeErrorAlertIfThere()
                } catch (e) {
                    openErrorAlert(e.response.data.detail, e)
                }
                formElement.remove()
            })

            calenderElement.insertBefore(formElement, container)
        })
        container.appendChild(inviteButton)
        calenderElement.appendChild(container)

        const editBtn = document.createElement("button")
        editBtn.className = "btn btn-warning mr-sm-2"
        editBtn.innerText = "Termin verändern"
        editBtn.setAttribute("data-toggle", "modal")
        editBtn.setAttribute("data-target", "#editModal")
        editBtn.addEventListener('click', () => {
            editTitleElement.value = event.title
            editStartElement.value = event.start_date.replace('+00:00', '')
            editEndElement.value = event.end_date.replace('+00:00', '')
            editDescriptionElement.value = event.description
            editLocationElement.value = event.location
            editUUIDElement.value = event.uuid
            eventObject = calenderElement
        })
        calenderElement.appendChild(editBtn)
    }

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
            closeErrorAlertIfThere()
        } catch (e) {
            openErrorAlert(e.response.data.detail, e)
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

//Holt sich alle Einladungen zu Events und zeigt diese im Einladungenfenster an
const getInvites = async (me) => {
    const response = await axiosInstance.get("/invitations?status_id=2")
    invitesContent.innerHTML = ""
    if (response.data.length !== 0)
        inviteCount.innerText = response.data.length
    response.data.forEach(event => {
        const inviterName = event.creator_username
        const eventTitel = event.title
        const uuid = event.uuid
        const inviteElement = document.createElement("div")

        inviteElement.innerHTML = ` 
            <p>Eingeladen von: ${inviterName} <br>
             Zum Event: ${eventTitel}</p>
            `

        invitesContent.appendChild(inviteElement)

        const btnAbsage = document.createElement("button")
        btnAbsage.className = "btn btn-danger mr-sm-2"
        btnAbsage.innerText = "Termin absagen"
        btnAbsage.addEventListener("click", async () => {
            await axiosInstance.put(`/invitations/${uuid}`, {status_id: 3})
            inviteElement.remove()
        })
        inviteElement.appendChild(btnAbsage)

        const btnZusage = document.createElement("button")
        btnZusage.className = "btn btn-success mr-sm-2"
        btnZusage.innerText = "Termin zusagen"

        btnZusage.addEventListener("click", async () => {
            await axiosInstance.put(`/invitations/${uuid}`, {status_id: 1})
            inviteElement.remove()
            await createCalender(me)
        })
        inviteElement.appendChild(btnZusage)
    })
}

const init = async () => {

    const me = await user.getMe()

    await getInvites(me)

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
            closeErrorAlertIfThere()
        } catch (e) {
            openErrorAlert(e.response.data.detail, e)
        }
    })

    editFormElement.addEventListener('submit', async (e) => {
        e.preventDefault()
        const uuid = editUUIDElement.value
        const title = editTitleElement.value
        const start_date = editStartElement.value
        const end_date = editEndElement.value
        const description = editDescriptionElement.value
        const location = editLocationElement.value

        try {
            const resp = await axiosInstance.put(`/events/${uuid}`, {
                title,
                start_date,
                end_date,
                description,
                location
            })
            const newEventElement = getCalenderElement(resp.data, me)
            closeErrorAlertIfThere()
            $('#editModal').modal('hide');
            editUUIDElement.value = ''
            editTitleElement.value = ''
            editStartElement.value = ''
            editEndElement.value = ''
            editDescriptionElement.value = ''
            editLocationElement.value = ''
            eventObject.parentNode.replaceChild(newEventElement, eventObject)
        } catch (e) {
            openErrorAlert(e.response.data.detail, e)
        }
    })

    await createCalender(me)
}

const openErrorAlert = (text, e) => {
    errorAlert.className = "alert alert-danger p-1"
    if (e !== null) {
        errorAlert.innerText = text + ": " + e.response.status + " - " + e.response.statusText
    } else {
        errorAlert.innerText = text
    }
    errorAlert.removeAttribute("hidden")
}

const closeErrorAlertIfThere = () => {
    errorAlert.setAttribute("hidden", "")
}


init()
