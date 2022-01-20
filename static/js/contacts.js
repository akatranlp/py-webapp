import {axiosInstance} from "./repo";

const tableElement = document.querySelector("[data-table]")
const formElement = document.querySelector("[data-form]")
const nameElement = document.getElementById("name")
const firstnameElement = document.getElementById("firstname")
const emailElement = document.getElementById("email")

formElement.addEventListener("submit", async (e) => {
    e.preventDefault()
    const name = nameElement.value
    const firstname = firstnameElement.value
    const email = emailElement.value
        try {
            const response = await axiosInstance.post("/contacts", {name, firstname, email})
            window.location = "/contact"
        } catch (error) {
            const data = error.response.data
            alert(data.detail + " " + error.response.status)
        }
})

const loadData = async () => {
    try {
        const contacts = await axiosInstance.get("/contacts")

        contacts.forEach(element => {
            const contact = document.createElement("td")
            contact.innerHTML = element
            tableElement.appendChild(contact)
        })
    }catch (error) {

    }
}

loadData()