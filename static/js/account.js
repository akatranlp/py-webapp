import {user, axiosInstance} from "./repo.js";

const changeButton = document.querySelector("[data-change-password-button]");
const oldPassword = document.querySelector("[data-old-password]");
const newPassword = document.querySelector("[data-new-password]");
const passwordAlert = document.querySelector("[data-password-alert]");

const deleteButton = document.querySelector("[data-delete-user-button]");

const userText = document.querySelector("[data-user-currentLoggedInUser]");
const currentUser = await user.getMe()


function init() {
    userText.innerText = currentUser.username
    deleteButton.addEventListener("click", () => deleteUser())
    changeButton.addEventListener("click", () => changePassword())
}

async function changePassword() {
    try {
        const resp = await axiosInstance.put("/change_password", {
            old_password: oldPassword.value,
            new_password: newPassword.value
        })
        passwordAlert.className = "alert alert-success p-1"
        passwordAlert.innerText = "Passwort erfolgreich geändert"

    } catch (e) {
        passwordAlert.className = "alert alert-danger p-1"
        switch (e.response.status) {
            case 401: //ggf. responsecode bei falschem altpasswort von 401 zu etwas anderes ändern
                passwordAlert.innerText = "Fehler beim ändern des Passwortes: Das eingegebene alte Passwort ist falsch"
                break;
            default:
                passwordAlert.innerText = "Es ist ein unerwarteter Fehler aufgetreten: "+e.response.status
        }
    }
    passwordAlert.removeAttribute("hidden")
}

async function deleteUser() {
    await axiosInstance.delete("/users/" + currentUser.username)
}

init()