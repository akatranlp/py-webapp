import {axiosInstance} from "./repo.js";

const tableElement = document.querySelector("[data-table]")
const formElement = document.querySelector("[data-form]")
const errorAlert = document.querySelector("[data-alert]");
const nameElement = document.querySelector("[data-name]")
const firstnameElement = document.querySelector("[data-firstname]")
const emailElement = document.querySelector("[data-email]")

const formEditElement = document.querySelector("[data-edit-form]")
const nameEditElement = document.querySelector("[data-edit-name]")
const firstnameEditElement = document.querySelector("[data-edit-firstname]")
const emailEditElement = document.querySelector("[data-edit-email]")

const uuidEditElement = document.querySelector("[data-edit-uuid]");

let editContactElement;

formElement.addEventListener("submit", async (e) => {
    e.preventDefault()
    const name = nameElement.value
    const firstname = firstnameElement.value
    const email = emailElement.value

    try {
        const response = await axiosInstance.post("/contacts", {name, firstname, email})
        tableElement.appendChild(getContactElement(response.data))
        nameElement.value = ''
        firstnameElement.value = ''
        emailElement.value = ''
        $('#createModal').modal('hide')
    } catch (error) {
        openErrorAlert(error.response.data.detail, error)
    }
})

formEditElement.addEventListener("submit", async (e) => {
    e.preventDefault()
    const uuid = uuidEditElement.value
    const name = nameEditElement.value
    const firstname = firstnameEditElement.value
    const email = emailEditElement.value

    try {
        const response = await axiosInstance.put(`/contacts/${uuid}`, {name, firstname, email})
        const newContactElement = getContactElement(response.data)

        uuidEditElement.value = ''
        nameEditElement.value = ''
        firstnameEditElement.value = ''
        emailEditElement.value = ''
        $('#editModal').modal('hide')
        editContactElement.parentNode.replaceChild(newContactElement, editContactElement)
    } catch (error) {
        openErrorAlert(error.response.data.detail, error)
    }
})

const getContactElement = (contact) => {
    const row = document.createElement("tr")
    const contactName = document.createElement("td")
    contactName.innerHTML = contact.name
    contactName.className = "text-wrap text-break"
    const contactFirstname = document.createElement("td")
    contactFirstname.innerHTML = contact.firstname
    contactFirstname.className = "text-wrap text-break"
    const contactEmail = document.createElement("td")
    contactEmail.innerHTML = contact.email
    contactEmail.className = "text-wrap text-break"
    const settings = document.createElement("td")
    settings.className="p-0"
    const changeButton = document.createElement("button")
    changeButton.innerHTML = "Nutzer bearbeiten"
    changeButton.className = "btn btn-warning m-1"
    changeButton.setAttribute("data-toggle", "modal")
    changeButton.setAttribute("data-target", "#editModal")
    changeButton.addEventListener("click", async (event) => {
        uuidEditElement.value = contact.uuid
        nameEditElement.value = contact.name
        firstnameEditElement.value = contact.firstname
        emailEditElement.value = contact.email
        editContactElement = row
    })

    const deleteButton = document.createElement("button")
    deleteButton.innerHTML = "Nutzer entfernen"
    deleteButton.className = "btn btn-danger m-1"
    deleteButton.addEventListener("click", async (event) => {
        try {
            await axiosInstance.delete("/contacts/" + contact.uuid)
            row.remove()
        } catch (error) {
            openErrorAlert(error.response.data.detail, error)
        }
    })
    row.appendChild(contactName)
    row.appendChild(contactFirstname)
    row.appendChild(contactEmail)
    row.appendChild(settings)
    settings.appendChild(changeButton)
    settings.appendChild(deleteButton)
    return row
}

const loadData = async () => {
    try {
        const response = await axiosInstance.get("/contacts")
        const contacts = response.data
        contacts.forEach(element => {
            tableElement.appendChild(getContactElement(element))
        })
    } catch (error) {
        openErrorAlert("Fehler beim laden der Daten", error)
    }
}

const openErrorAlert = (text, e) => {
    errorAlert.className = "alert alert-danger p-1"
    if (e !== null) {
        errorAlert.textContent = text + ": " + e.response.status + " - " + e.response.statusText
    } else {
        errorAlert.textContent = text
    }
    errorAlert.removeAttribute("hidden")
}

loadData()