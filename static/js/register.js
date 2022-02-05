const formElement = document.querySelector("[data-form]")
const errorAlert = document.querySelector("[data-alert]");
const usernameElement = document.querySelector("[data-username]")
const emailElement = document.querySelector("[data-email]")
const passwordElement = document.querySelector("[data-password]")
const password2Element = document.querySelector("[data-password2]")


formElement.addEventListener("submit", async (e) => {
    e.preventDefault()
    const password_hash = passwordElement.value
    const username = usernameElement.value
    const email = emailElement.value
    const password2 = password2Element.value
    if (password_hash === password2) {
        try {
            await axios.post("/users", {username, password_hash, email})
            window.location = "/login"
        } catch (error) {
            openErrorAlert(error.response.data.detail, error)
        }
    } else {
        openErrorAlert("Passwörter stimmen nicht überein", null)
    }
})

const openErrorAlert = (text, e) => {
    errorAlert.className = "alert alert-danger p-1"
    if (e !== null) {
        errorAlert.textContent = text + ": " + e.response.status + " - " + e.response.statusText
    } else {
        errorAlert.textContent = text
    }
    errorAlert.removeAttribute("hidden")
}

const checkLogin = async () => {
    try {
        await axios.get("/refresh_token")
        window.location = "/"
    } catch (error) {

    }
}
checkLogin()