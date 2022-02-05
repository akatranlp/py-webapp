const formElement = document.querySelector("[data-form]")
const errorAlert = document.querySelector("[data-alert]");

formElement.addEventListener("submit", async (e) => {
    e.preventDefault()

    // Wir benutzen hier fetch, da axios aktuell bugs mit form-data hat
    const data = new URLSearchParams(new FormData(formElement))
    try {
        const response = await fetch("/login", {method: "post", body: data})
        const jsonData = await response.json()
        if (response.status === 200) {
            window.location = "/"
        } else if (response.status === 401) {
            openErrorAlert("Passwort ist falsch: " + response.status + " - " + jsonData.detail, null)
        } else {
            openErrorAlert("Username ist falsch: " + response.status + " - " + jsonData.detail, null)
        }
    } catch (error) {
        openErrorAlert("Es ist ein Fehler aufgetreten", null)
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