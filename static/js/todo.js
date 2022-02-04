import {user, axiosInstance} from "./repo.js";

const formCreate = document.querySelector("[data-form-create]")
const formEdit = document.querySelector("[data-form-edit]")
const errorAlert = document.querySelector("[data-alert]");
const editTitle = document.querySelector("[data-edit-title]");
const editDescription = document.querySelector("[data-edit-description]");
const editUUID = document.querySelector("[data-edit-uuid]");
const activeContainer = document.querySelector("[data-active-container]");
const finishedContainer = document.querySelector("[data-finished-container]");

//Speichert die Referenz zum todoObject, welches gerade das Editieren Fenster geöffnet hat
let toEditObject

const init = async () => {
    formCreate.addEventListener("submit", async (event) => {
        event.preventDefault()
        await createTodo(event)
        $('#createModal').modal('hide'); //Bisschen JQuery für Bootstrap Modal, da das auf JQuery basiert
    })
    formEdit.addEventListener("submit", async (event) => {
        event.preventDefault()
        await changeTitleDescription(event)
        $('#editModal').modal('hide'); //Bisschen JQuery für Bootstrap Modal, da das auf JQuery basiert

    })
    await loadData()
}
//-- Funktionen mit Backendanfrage --//
const loadData = async () => {
    //Wird beim Laden aufgerufen und gibt dem HTML alle Todos
    try {
        const resp = await axiosInstance.get("/todos")
        const todos = resp.data
        todos.forEach(el => loadTodo(el))
    } catch (e) {
        openErrorAlert("Fehler beim Laden der Todos", e)
    }
}

const changeStatus = async (uuid) => {
    try {
        const resp = await axiosInstance.put("/todos/" + uuid, {
            toggle: true
        })
        loadTodo(resp.data)

    } catch (e) {
        openErrorAlert("Fehler beim Ändern des Todo-Status", e)
    }
}

const changeTitleDescription = async (event) => {

    try {
        const resp = await axiosInstance.put("/todos/" + event.target[1].value, {
            title: event.target[2].value,
            description: event.target[3].value
        })
        toEditObject.children[0].innerHTML = resp.data.title
        toEditObject.children[1].innerHTML = resp.data.description
    } catch (e) {
        openErrorAlert("Fehler beim Ändern des Todos", e)
    }
}

const deleteTodo = async (uuid) => {
    try {
        await axiosInstance.delete("/todos/" + uuid)
    } catch (e) {
        openErrorAlert("Fehler beim Ändern des Passworts", e)
    }
}

const createTodo = async (event) => {
    try {
        const resp = await axiosInstance.post("/todos", { //Laut https://axios-http.com/docs/post_example die struktur
            title: event.target[1].value,
            description: event.target[2].value
        })
        loadTodo(resp.data)
    } catch (error) {
        openErrorAlert("Fehler beim Erstellen des Todos", error)
    }
}

//---- Normale Funktionen ----//
//Lädt das To-Do 'curTodo'
const loadTodo = (curTodo) => {
    //Generelles Objekt ------------------------------------------------------------------------------------------------
    let todoObject = document.createElement('div')
    curTodo.status ? finishedContainer.appendChild(todoObject) : activeContainer.appendChild(todoObject)
    todoObject.className = "p-2 border border-info rounded highlight mb-1"
    // Titel -----------------------------------------------------------------------------------------------------------
    let title = document.createElement('h2')
    title.innerText = curTodo.title;
    title.className = "text-wrap text-break"
    todoObject.appendChild(title)
    // Beschreibung ----------------------------------------------------------------------------------------------------
    let description = document.createElement('p')
    description.innerText = curTodo.description;
    description.className = "text-wrap text-break"
    todoObject.appendChild(description)
    //Div für die Knopfe -----------------------------------------------------------------------------------------------
    let buttonDiv = document.createElement('div')
    buttonDiv.className = "d-flex justify-content-between"
    todoObject.appendChild(buttonDiv)
    //-- Knopf zum Löschen des Todos -----------------------------------------------------------------------------------
    let buttonDelete = document.createElement('a')
    buttonDelete.className = "btn btn-danger ml-2 text-white"
    buttonDelete.addEventListener("click", () => {
        deleteTodo(curTodo.uuid)
        buttonDelete.parentElement.parentElement.remove() //Löscht das TodoObjekt
    })
    buttonDelete.innerText = "Löschen"
    buttonDiv.appendChild(buttonDelete)
    //Div für Bearbeiten/Statusändern ----------------------------------------------------------------------------------
    let divEditButtons = document.createElement('div')
    buttonDiv.appendChild(divEditButtons)
    //Knopf zum Editieren ----------------------------------------------------------------------------------------------
    let buttonEdit = document.createElement('a')
    buttonEdit.className = "btn btn-info ml-2 text-white"
    buttonEdit.setAttribute("data-toggle", "modal")
    buttonEdit.setAttribute("data-target", "#editModal")
    buttonEdit.addEventListener("click", () => {
        editTitle.value = title.innerText
        editDescription.value = description.innerText
        editUUID.value = curTodo.uuid
        toEditObject = todoObject
    })
    buttonEdit.innerHTML = "Editieren"
    divEditButtons.appendChild(buttonEdit)
    //Knopf zum Status Ändern ------------------------------------------------------------------------------------------
    let buttonChangeStatus = document.createElement('a')
    buttonChangeStatus.addEventListener("click", () => {
        changeStatus(curTodo.uuid)
        buttonChangeStatus.parentElement.parentElement.parentElement.remove() //Löscht das TodoObjekt
    })
    if (curTodo.status) {
        buttonChangeStatus.className = "btn btn-warning ml-2"
        buttonChangeStatus.innerText = "Reaktivieren"
    } else {
        buttonChangeStatus.className = "btn btn-success ml-2 text-white"
        buttonChangeStatus.innerText = "Erledigt"
    }
    divEditButtons.appendChild(buttonChangeStatus)

}

const openErrorAlert = (text, e) => {
    errorAlert.className = "alert alert-danger p-1"
    errorAlert.innerText = text + ": " + e.response.status + " - " + e.response.statusText
    errorAlert.removeAttribute("hidden")
}

//Aufruf von Init
init()
