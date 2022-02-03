import {user, axiosInstance} from "./repo.js";

const usersContainerElement = document.querySelector("[data-user-container]");

const getAllUsers = async () => {
    usersContainerElement.innerHTML = ''
    const resp = await axiosInstance.get('/users')
    resp.data.forEach(user => {
        const userRow = document.createElement('tr');
        //userRow.className = "d-flex flex-row justify-content-between p-1 border border-info rounded highlight mb-1"
        {
            const nameElement = document.createElement('td');
            nameElement.innerText = user.username
            nameElement.className = "align-middle"
            userRow.appendChild(nameElement)
        }
        {
            const emailElement = document.createElement('td');
            emailElement.innerText = user.email
            emailElement.className = "align-middle"
            userRow.appendChild(emailElement)
        }

        const buttonElement = document.createElement('td');
        buttonElement.className = "d-flex justify-content-end"
        userRow.appendChild(buttonElement)

        const isAdminBtn = document.createElement('button');
        isAdminBtn.className = `btn text-white mr-sm-2 ${user.is_admin ? "btn-danger" : "btn-success"}`
        isAdminBtn.innerText = user.is_admin ? 'Adminrechte entfernen' : 'Adminrechte geben'
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

        const isActiveBtn = document.createElement('button');
        isActiveBtn.className = `btn text-white mr-sm-2 ${user.is_active ? "btn-danger" : "btn-success"}`
        isActiveBtn.innerText = user.is_active ? 'Deaktivieren' : 'Reaktivieren'
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

        const deleteBtnPre = document.createElement('button');
        deleteBtnPre.className = 'btn text-white mr-sm-2 btn-danger'
        deleteBtnPre.innerText = 'Löschen'
        buttonElement.appendChild(deleteBtnPre);
        deleteBtnPre.addEventListener('click', async () => {
            //Beim klicken wird der Nachfrageknopf erstellt und deleteBtnPre gelöscht
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn text-white mr-sm-2 btn-dark'
            deleteBtn.innerText = 'Sicher?'
            buttonElement.appendChild(deleteBtn);

            deleteBtn.addEventListener('click', async () => {
                try {
                    await axiosInstance.delete('/users/' + user.username)
                    await getAllUsers()
                } catch (e) {
                    alert(e)
                }
            })
            deleteBtnPre.remove()
        })


        usersContainerElement.appendChild(userRow);
    })
}


const init = async () => {
    const me = await user.getMe();
    if (!me.is_admin)
        window.location.replace("/")

    await getAllUsers()
}

init()
