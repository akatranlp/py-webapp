import {user, axiosInstance} from "./repo.js";

const deleteButton = document.querySelector("[data-delete-user-button]");
const userText = document.querySelector("[data-user-currentLoggedInUser]");
const currentUser = await user.getMe()


function init(){
    userText.innerText = currentUser.username
    deleteButton.addEventListener("click", ()=>deleteUser())
}

async function deleteUser(uuid) {
    await axiosInstance.delete("/users/"+currentUser.username)
}
init()