import {user, axiosInstance} from "./repo.js";

const usersContainerElement = document.querySelector("[data-user-container]");

const getAllUsers = async () => {
    usersContainerElement.innerHTML = ''
    const resp = await axiosInstance.get('/users')
    // Table erstellen mit Header
    const table = document.createElement('table')
    const tableHeader = document.createElement('thead')
    table.appendChild(tableHeader)
    const tableHeaderRow = document.createElement('tr')
    tableHeader.appendChild(tableHeaderRow)
    {
        const tableHead = document.createElement('th')
        tableHead.innerText = "Name"
        tableHeaderRow.appendChild(tableHead)
    }
    {
        const tableHead = document.createElement('th')
        tableHead.innerText = "E-Mail"
        tableHeaderRow.appendChild(tableHead)
    }
    {
        const tableHead = document.createElement('th')
        tableHead.innerText = "Einstellungen"
        tableHeaderRow.appendChild(tableHead)
    }
    const tableBody = document.createElement('tbody')
    table.appendChild(tableBody)
    resp.data.forEach(user => {
        const userRow = document.createElement('tr');
        //userRow.className = "d-flex flex-row justify-content-between p-1 border border-info rounded highlight mb-1"
        {
            const nameElement = document.createElement('td');
            nameElement.innerText = user.username
            userRow.appendChild(nameElement)
        }
        {
            const emailElement = document.createElement('td');
            emailElement.innerText = user.email
            userRow.appendChild(emailElement)
        }
        const buttonElement = document.createElement('td');
        userRow.appendChild(buttonElement)
        const isActiveBtn = document.createElement('button');
        isActiveBtn.className = `btn text-white mr-sm-2 ${user.is_active ? "btn-danger" : "btn-success"}`
        isActiveBtn.innerText = user.is_active ? 'Deactivate' : 'Reactivate'
        buttonElement.appendChild(isActiveBtn);

        isActiveBtn.addEventListener('click', async () => {
            const is_active = !user.is_active

            try {
                await axiosInstance.put('/users/' + user.username, {is_active})
                await getAllUsers()
            } catch (e) {
                alert(e)
            }
        })

        const isAdminBtn = document.createElement('button');
        isAdminBtn.className = `btn text-white mr-sm-2 ${user.is_admin ? "btn-danger" : "btn-success"}`
        isAdminBtn.innerText = user.is_admin ? 'Demote' : 'Promote'
        buttonElement.appendChild(isAdminBtn);

        isAdminBtn.addEventListener('click', async () => {
            const is_admin = !user.is_admin

            try {
                await axiosInstance.put('/users/' + user.username, {is_admin})
                await getAllUsers()
            } catch (e) {
                alert(e)
            }
        })

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn text-white mr-sm-2 btn-danger'
        deleteBtn.innerText = 'Delete'
        buttonElement.appendChild(deleteBtn);

        deleteBtn.addEventListener('click', async () => {
            // TODO: Popup ob man wirklich den User löschen möchte
            try {
                await axiosInstance.delete('/users/' + user.username)
                await getAllUsers()
            } catch (e) {
                alert(e)
            }
        })

        tableBody.appendChild(userRow);
    })
    usersContainerElement.appendChild(table);
}


const init = async () => {
    const me = await user.getMe();
    if (!me.is_admin)
        window.location.replace("/")

    await getAllUsers()
}

init()
