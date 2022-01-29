import {user, axiosInstance} from "./repo.js";

const usersContainerElement = document.querySelector("[data-user-container]");

const getAllUsers = async () => {
    usersContainerElement.innerHTML = ''
    const resp = await axiosInstance.get('/users')

    resp.data.forEach(user => {
        const userContainer = document.createElement('div');

        {
            const tempElement = document.createElement('p');
            tempElement.innerText = user.username
            userContainer.appendChild(tempElement)
        }
        {
            const tempElement = document.createElement('p');
            tempElement.innerText = user.email
            userContainer.appendChild(tempElement)
        }

        const isActiveBtn = document.createElement('button');
        isActiveBtn.className = `btn text-white mr-sm-2 ${user.is_active ? "btn-danger" : "btn-success"}`
        isActiveBtn.innerText = user.is_active ? 'Deactivate' : 'Reactivate'
        userContainer.appendChild(isActiveBtn);

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
        userContainer.appendChild(isAdminBtn);

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
        userContainer.appendChild(deleteBtn);

        deleteBtn.addEventListener('click', async () => {
            // TODO: Popup ob man wirklich den User löschen möchte
            try {
                await axiosInstance.delete('/users/' + user.username)
                await getAllUsers()
            } catch (e) {
                alert(e)
            }
        })

        usersContainerElement.appendChild(userContainer);
    })
}


const init = async () => {
    const me = await user.getMe();
    if (!me.is_admin)
        window.location.replace("/")

    await getAllUsers()
}

init()
