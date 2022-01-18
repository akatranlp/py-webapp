import {user, axiosInstance} from "./repo.js";

const div = document.querySelector("[data-list]");

const apiRequests = async () => {
    const text = await user.getMe()
    console.log(text)
    div.innerText = text.username
}

apiRequests()
