import {user, axiosInstance} from "./repo.js";

const changePasswordForm = document.querySelector("[data-change-password-form]");
const oldPassword = document.querySelector("[data-old-password]");
const newPassword = document.querySelector("[data-new-password]");
const newPassword2 = document.querySelector("[data-new-password-again]");
const passwordAlert = document.querySelector("[data-password-alert]");


const deleteButton = document.querySelector("[data-delete-user-button]");
const deleteUserAlert = document.querySelector("[data-delete-user-alert]");

function init() {
    deleteButton.addEventListener("click", () => deleteUser())
    changePasswordForm.addEventListener("submit", (e) => changePassword(e))
}

async function changePassword(e) {
    e.preventDefault()
    if (newPassword.value !== newPassword2.value) {
        passwordAlert.className = "alert alert-danger p-1"
        passwordAlert.innerText = "'Neues Passwort'-Eingaben stimmen nicht überein"
    } else {
        try {
            const resp = await axiosInstance.put("/change_password", {
                old_password: oldPassword.value,
                new_password: newPassword.value
            })
            passwordAlert.className = "alert alert-success p-1"
            passwordAlert.innerText = "Passwort erfolgreich geändert"
            oldPassword.value = ''
            newPassword.value = ''
            newPassword2.value = ''

        } catch (e) {
            passwordAlert.className = "alert alert-danger p-1"
            switch (e.response.status) {
                case 401:
                    if (e.response.data.detail === "False old password")
                        passwordAlert.innerText = "Fehler: Das eingegebene alte Passwort ist falsch"
                    else
                        passwordAlert.innerText = "Fehler: Du hast keine Rechte das Passwort zu ändern"
                    break;
                default:
                    passwordAlert.innerText = "Es ist ein unerwarteter Fehler aufgetreten: " + e.response.status + " - " + e.response.statusText
            }
        }
    }
    passwordAlert.removeAttribute("hidden")
}

async function deleteUser() {
    // TODO: vielleicht noch eine messagebox aufpoppen lassen
    // ob man sich wirklich sicher ist
    try {
        await axiosInstance.delete("/users/" + currentUser.username)
        window.location.replace("/login")
    } catch (e) {
        deleteUserAlert.className = "alert alert-danger p-1"
        deleteUserAlert.innerText = "Fehler beim Löschen des Accounts: " + e.response.status + " - " + e.response.statusText
        deleteUserAlert.removeAttribute("hidden")
    }

}

init()