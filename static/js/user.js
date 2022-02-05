import {user, axiosInstance} from "./repo.js";

const usersContainerElement = document.querySelector("[data-user-container]");
const errorAlert = document.querySelector("[data-alert]");

const getUserElement = (user) => {
    const userRow = document.createElement('tr');
    {
        const nameElement = document.createElement('td');
        nameElement.textContent = user.username
        nameElement.className = "align-middle"
        userRow.appendChild(nameElement)
    }
    {
        const emailElement = document.createElement('td');
        emailElement.textContent = user.email
        emailElement.className = "align-middle"
        userRow.appendChild(emailElement)
    }

    const buttonElement = document.createElement('td');
    buttonElement.className = "d-flex justify-content-end"
    userRow.appendChild(buttonElement)

    const isAdminBtn = document.createElement('button');
    isAdminBtn.className = `btn text-white mr-sm-2 ${user.is_admin ? "btn-danger" : "btn-success"}`
    isAdminBtn.textContent = user.is_admin ? 'Adminrechte entfernen' : 'Adminrechte geben'
    buttonElement.appendChild(isAdminBtn);

    isAdminBtn.addEventListener('click', async () => {
        const is_admin = !user.is_admin

        try {
            const resp = await axiosInstance.put('/users/' + user.username, {is_admin})
            const newUserRow = getUserElement(resp.data)

            closeErrorAlertIfThere()
            usersContainerElement.insertBefore(newUserRow, userRow)
            userRow.remove()
        } catch (e) {
            openErrorAlert(e.response.data.detail, e)
        }
    })

    const isActiveBtn = document.createElement('button');
    isActiveBtn.className = `btn text-white mr-sm-2 ${user.is_active ? "btn-danger" : "btn-success"}`
    isActiveBtn.textContent = user.is_active ? 'Deaktivieren' : 'Reaktivieren'
    buttonElement.appendChild(isActiveBtn);

    isActiveBtn.addEventListener('click', async () => {
        const is_active = !user.is_active

        try {
            const resp = await axiosInstance.put('/users/' + user.username, {is_active})
            const newUserRow = getUserElement(resp.data)

            closeErrorAlertIfThere()
            usersContainerElement.insertBefore(newUserRow, userRow)
            userRow.remove()
        } catch (e) {
            openErrorAlert(e.response.data.detail, e)
        }
    })

    const deleteBtnPre = document.createElement('button');
    deleteBtnPre.className = 'btn text-white mr-sm-2 btn-danger'
    deleteBtnPre.textContent = 'Löschen'
    buttonElement.appendChild(deleteBtnPre);
    deleteBtnPre.addEventListener('click', async () => {
        //Beim klicken wird der Nachfrageknopf erstellt und deleteBtnPre gelöscht
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn text-white mr-sm-2 btn-dark'
        deleteBtn.textContent = 'Sicher?'
        buttonElement.appendChild(deleteBtn);

        deleteBtn.addEventListener('click', async () => {
            try {
                await axiosInstance.delete('/users/' + user.username)
                closeErrorAlertIfThere()
                userRow.remove()
            } catch (e) {
                openErrorAlert(e.response.data.detail, e)
            }
        })
        deleteBtnPre.remove()
    })
    return userRow
}

const getAllUsers = async () => {
    usersContainerElement.innerHTML = ''
    const resp = await axiosInstance.get('/users')
    resp.data.forEach(user => {
        usersContainerElement.appendChild(getUserElement(user));
    })
}


const init = async () => {
    const me = await user.getMe();
    if (!me.is_admin)
        window.location.replace("/")

    await getAllUsers()
}

const openErrorAlert = (text, e) => {
    errorAlert.className = "alert alert-danger p-1"
    if (e !== null) {
        errorAlert.textContent = text + ": " + e.response.status + " - " + e.response.statusText
    } else {
        errorAlert.textContent = text
    }
    errorAlert.removeAttribute("hidden")
}

const closeErrorAlertIfThere = () => {
    errorAlert.setAttribute("hidden", "")
}


init()
