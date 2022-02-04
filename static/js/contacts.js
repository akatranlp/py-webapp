import {axiosInstance} from "./repo.js";

const tableElement = document.querySelector("[data-table]")
const formElement = document.querySelector("[data-form]")
const errorAlert = document.querySelector("[data-alert]");
const nameElement = document.querySelector("[data-name]")
const firstnameElement = document.querySelector("[data-firstname]")
const emailElement = document.querySelector("[data-email]")

formElement.addEventListener("submit", async (e) => {
    e.preventDefault()
    const name = nameElement.value
    const firstname = firstnameElement.value
    const email = emailElement.value

    try {
        const response = await axiosInstance.post("/contacts", {name, firstname, email})
        tableElement.appendChild(getContactElement(response.data))
    } catch (error) {
        openErrorAlert(error.response.data.detail, error)
    }
})

const getContactElement = (contact) => {
    const row = document.createElement("tr")
    const contactName = document.createElement("td")
    contactName.innerHTML = contact.name
    const contactFirstname = document.createElement("td")
    contactFirstname.innerHTML = contact.firstname
    const contactEmail = document.createElement("td")
    contactEmail.innerHTML = contact.email
    contactEmail.className = "text-wrap text-break"

    const deleteButton = document.createElement("button")
    deleteButton.innerHTML = "Nutzer entfernen"
    deleteButton.className = "btn btn-danger mr-sm-2"
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
    row.appendChild(deleteButton)
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
        errorAlert.innerText = text + ": " + e.response.status + " - " + e.response.statusText
    } else {
        errorAlert.innerText = text
    }
    errorAlert.removeAttribute("hidden")
}

loadData()