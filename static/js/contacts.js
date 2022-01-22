import {axiosInstance} from "./repo.js";

const tableElement = document.querySelector("[data-table]")
const formElement = document.querySelector("[data-form]")
const logoutButton = document.getElementById("logout")
const nameElement = document.getElementById("name")
const firstnameElement = document.getElementById("firstname")
const emailElement = document.getElementById("email")

logoutButton.addEventListener("click", async (e) => {
    window.location = "/logout"
})

formElement.addEventListener("submit", async (e) => {
    e.preventDefault()
    const name = nameElement.value
    const firstname = firstnameElement.value
    const email = emailElement.value
    try {
        const response = await axiosInstance.post("/contacts", {name, firstname, email})
        console.log(response)
        window.location = "/contact"
    } catch (error) {
        const data = error.response.data
        alert(data.detail + " " + error.response.status)
    }
})

const loadData = async () => {
    try {
        const response = await axiosInstance.get("/contacts")
        const contacts = response.data
        console.log(contacts)
        contacts.forEach(element => {
            const row = document.createElement("tr")
            const contactName = document.createElement("td")
            contactName.innerHTML = element.name
            const contactFirstname = document.createElement("td")
            contactFirstname.innerHTML = element.firstname
            const contactEmail = document.createElement("td")
            contactEmail.innerHTML = element.email

            const deleteButton = document.createElement("button")
            deleteButton.innerHTML = "Nutzer entfernen"
            deleteButton.className = "btn btn-danger mr-sm-2"
            deleteButton.addEventListener("click", async (event) => {
                try {
                    await axiosInstance.delete("/contacts/" + element.uuid)
                    window.location = "/contact"
                } catch (error) {

                }
            })

            tableElement.appendChild(row)
            tableElement.appendChild(contactName)
            tableElement.appendChild(contactFirstname)
            tableElement.appendChild(contactEmail)
            tableElement.appendChild(deleteButton)
        })
    } catch (error) {

    }
}

loadData()