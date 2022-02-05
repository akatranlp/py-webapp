import {user, axiosInstance} from "./repo.js";

const changePasswordForm = document.querySelector("[data-change-password-form]");
const oldPassword = document.querySelector("[data-old-password]");
const newPassword = document.querySelector("[data-new-password]");
const newPassword2 = document.querySelector("[data-new-password-again]");
const passwordAlert = document.querySelector("[data-password-alert]");


const deleteButton = document.querySelector("[data-delete-user-button]");
const deleteUserAlert = document.querySelector("[data-delete-user-alert]");

const init = () => {
    deleteButton.addEventListener("click", async () => {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn text-white mr-sm-2 btn-dark'
        deleteBtn.textContent = 'Sicher?'
        deleteButton.parentNode.appendChild(deleteBtn);

        deleteBtn.addEventListener('click', async () => {
            await deleteUser()
        })
        deleteButton.remove()
    })
    changePasswordForm.addEventListener("submit", async (e) => changePassword(e))
}

const changePassword = async (e) => {
    e.preventDefault()
    if (newPassword.value !== newPassword2.value) {
        passwordAlert.className = "alert alert-danger p-1"
        passwordAlert.textContent = "'Neues Passwort'-Eingaben stimmen nicht überein"
    } else {
        try {
            await axiosInstance.put("/change_password", {
                old_password: oldPassword.value,
                new_password: newPassword.value
            })
            passwordAlert.className = "alert alert-success p-1"
            passwordAlert.textContent = "Passwort erfolgreich geändert"
            oldPassword.value = ''
            newPassword.value = ''
            newPassword2.value = ''

        } catch (e) {
            passwordAlert.className = "alert alert-danger p-1"
            switch (e.response.status) {
                case 401:
                    if (e.response.data.detail === "False old password")
                        passwordAlert.textContent = "Fehler: Das eingegebene alte Passwort ist falsch"
                    else
                        passwordAlert.textContent = "Fehler: Du hast keine Rechte das Passwort zu ändern"
                    break;
                default:
                    passwordAlert.textContent = "Es ist ein unerwarteter Fehler aufgetreten: " + e.response.status + " - " + e.response.statusText
            }
        }
    }
    passwordAlert.removeAttribute("hidden")
}

const deleteUser = async () => {
    const currentUser = await user.getMe()
    try {
        await axiosInstance.delete("/users/" + currentUser.username)
        window.location.replace("/login")
    } catch (e) {
        deleteUserAlert.className = "alert alert-danger p-1"
        deleteUserAlert.textContent = "Fehler beim Löschen des Accounts: " + e.response.status + " - " + e.response.statusText
        deleteUserAlert.removeAttribute("hidden")
    }

}

init()