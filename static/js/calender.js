var calenderDiv = document.getElementById("calenderContent")
const formElement = document.querySelector("[data-form]")
let openOrClosed = false
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaXNfYWRtaW4iOnRydWUsIm5iZiI6MTY0MzA2NTQ0OCwiZXhwIjoxNjQzMDY2MzQ4fQ.3m0FcqK9EUtRWJOOutdUN6syOM7BrwgWE7Alpnwi8_I"

window.onload = createCalender()


async function f() {

    const response = await fetch("/events", {
        method: "get",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token + '  '
        }
    })

    const jsonData = await response.json()

    console.log(jsonData)
    return (jsonData)
}

async function deleteItem(ID) {
    console.log(ID)

    const response = await fetch("/events/" + ID, {
        method: "delete",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token + '  '
        }
    })

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


        aItem.innerHTML = '' +
            ' <h1> ' + element.title + '</h1> <br>' +
            ' vom ' + startDay + '.' + startMonth + '.' + startYear + ' ' + startHour + ':' + startMinute + ' <br> ' +
            ' bis ' + endDay + '.' + endMonth + '.' + endYear + ' ' + endHour + ':' + endMinute + '           <br>' +
            '  ' +
            ''
        calenderEntries.appendChild(aItem);

        let btn = document.createElement("button")
        btn.innerHTML = "Cancel"
        btn.onclick = function () {
            console.log("click")
            calenderEntries.removeChild(aItem)
            deleteItem(element.uuid)

        }

        aItem.appendChild(btn);

    });

}

function openForm() {
    if (openOrClosed == false) {
        document.getElementById("myForm").style.display = "block";
        openOrClosed = true
    } else {
        document.getElementById("myForm").style.display = "none";
        openOrClosed = false
    }
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
        const response = await fetch("/events", {
            method: "post",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token + '  '
            },
            body: JSON.stringify(data)
        })
        const jsonData = await response.json()
        if (response.status === 200) {
            location.reload()
        } else {
            console.log(jsonData.detail)
        }
    } catch (error) {
        console.log(error)
    }
})


