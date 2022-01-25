import {user, axiosInstance} from "./repo.js";

const calenderDiv = document.getElementById("calenderContent")
const formElement = document.querySelector("[data-form]")


let openOrClosed = false

async function f() {

    const response = await axiosInstance.get("/events")

    const jsonData = response.data

    console.log(jsonData)
    return jsonData
}

async function deleteItem(ID) {
    console.log(ID)

    const response = await axiosInstance.delete(`/events/${ID}`)
    console.log(response)
}

async function createCalender() {

    let calenderEntries = document.createElement("div")
    let response = await f()

    console.log(response)

    response.sort(function (a, b) {
        return new Date(a.start_date) - new Date(b.start_date)
    })

    console.log(response)

    response.forEach(element => {

        console.log(element)

        calenderDiv.appendChild(calenderEntries)
        var aItem = document.createElement('div');
        aItem.className = "p-2 border border-success rounded highlight mb-1"
        aItem.classList.add('calenderCSS')

        let startDate = JSON.stringify(element.start_date)
        let spilttetStart = startDate.split("T")
        let start = spilttetStart[0].split("-")
        let startYear = parseInt(start[0].substring(1))
        let startMonth = parseInt(start[1])
        let startDay = parseInt(start[2])
        let startHour = parseInt(spilttetStart[1].split(":")[0])
        let startMinute = parseInt(spilttetStart[1].split(":")[1])

        let endDate = JSON.stringify(element.end_date)
        let splittetEnd = endDate.split("T")
        let end = splittetEnd[0].split("-")
        let endYear = parseInt(end[0].substring(1))
        let endMonth = parseInt(end[1])
        let endDay = parseInt(end[2])
        let endHour = parseInt(splittetEnd[1].split(":")[0])
        let endMinute = splittetEnd[1].split(":")[1]


        aItem.innerHTML = `
            <h1>${element.title}</h1> 
            <p>${element.description}</p>
            <p>Ort: ${element.location}</p>
            <p><b>von</b> ${startDay}.${startMonth}.${startYear} - ${startHour}:${startMinute}<br>
            <b>bis</b> ${endDay}.${endMonth}.${endYear} - ${endHour}:${endMinute}</p>`

        calenderEntries.appendChild(aItem);
        //Button zum Termin absagen hinzufügen
        let btn = document.createElement("button")
        btn.className = "btn btn-danger mr-sm-2"
        btn.innerText = "Termin absagen"
        btn.addEventListener("click", () => {
            calenderEntries.removeChild(aItem)
            deleteItem(element.uuid)
        })
        aItem.appendChild(btn);
    });

}

formElement.addEventListener("submit", async (e) => {
    e.preventDefault()

    let data = {
        "title": document.getElementById("Titel").value,
        "start_date": document.getElementById("Start").value,
        "end_date": document.getElementById("Ende").value,
        "description": document.getElementById("Beschreibung").value,
        "location": document.getElementById("Ort").value
    }
    console.log(data)
    try {
        const response = await axiosInstance.post("/events", data)
        const jsonData = response.data
        location.reload()
    } catch (e) {
        console.log(e.response.data.detail)
    }
})

createCalender()
