const formElement = document.querySelector("[data-form]")
const usernameElement = document.getElementById("registerUsername")
const emailElement = document.getElementById("registerEmail")
const passwordElement = document.getElementById("registerPassword")
const password2Element = document.getElementById("registerPassword2")


formElement.addEventListener("submit", async (e) => {
    e.preventDefault()
    const password_hash = passwordElement.value
    const username = usernameElement.value
    const email = emailElement.value
    const password2 = password2Element.value
    if (password_hash === password2) {
        try {
            const response = await axios.post("/users", {username, password_hash, email})
            window.location = "/login"
        } catch (error) {
            const data = error.response.data
            alert(data.detail + " " + error.response.status)
        }
    } else {
        alert("Passwörter stimmen nicht überein")
    }
})

const checkLogin = async () => {
    try {
        await axios.get("/refresh_token")
        window.location = "/"
    } catch (error) {

    }
}
checkLogin()