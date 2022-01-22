import {user, axiosInstance} from "./repo.js";

const tableElement = document.querySelector("[data-table]")
const formElement = document.querySelector("[data-form]")
const logoutButton = document.getElementById("logout")
const nameElement = document.getElementById("name")
const firstnameElement = document.getElementById("firstname")
const emailElement = document.getElementById("email")

logoutButton.addEventListener("click", async (e) => {
    console.log("SSSSSSSSSSS")
    try {
        await axiosInstance.get("/logout")
    } catch (error) {

    }
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
        const contacts = await axiosInstance.get("/contacts")

        contacts.forEach(element => {
            const contact = document.createElement("td")
            contact.innerHTML = element.name
            tableElement.appendChild(contact)
        })
    } catch (error) {

    }
}

loadData()