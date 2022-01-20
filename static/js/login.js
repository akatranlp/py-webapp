const formElement = document.querySelector("[data-form]")


formElement.addEventListener("submit", async(e) => {
    e.preventDefault()

    const data = new URLSearchParams(new FormData(formElement))
    try {
        const response = await fetch("/login", {method: "post", body: data})
        if (response.status === 200) {
            window.location = "/"
        } else {
            const jsonData = await response.json()
            alert(jsonData.detail + " " + response.status)
        }
    } catch (error) {
        alert("Fehler")
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