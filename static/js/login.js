const formElement = document.querySelector("[data-form]")


formElement.addEventListener("submit", async(e) => {
    e.preventDefault()

    const data = new URLSearchParams(new FormData(formElement))
    try {
        const response = await fetch("/login", {method: "post", body: data})
        console.log(response)
        const jsonData = await response.json()
        console.log(jsonData)
    } catch (error){
        console.log(error.response.data)
    }
})

const checkLogin = async () => {
    try {
        await axios.get("/refresh_token")
        window.location = "/"
    }catch (error){

    }
}
checkLogin()