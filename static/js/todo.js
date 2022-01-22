import {user, axiosInstance} from "./repo.js";

const errorAlert = document.querySelector("[data-alert]");
const createButton = document.querySelector("[data-create-button]");
const openCreateForm = document.querySelector("[data-open-create-form-button]");
const closeCreateForm = document.querySelector("[data-close-create-form-button]");
const createTitle = document.querySelector("[data-create-title]");
const createDescription = document.querySelector("[data-create-description]");
const createForm = document.querySelector("[data-create-form]");
const activeContainer = document.querySelector("[data-active-container]");
const finishedContainer = document.querySelector("[data-finished-container]");

const userText = document.querySelector("[data-user-currentLoggedInUser]");
const currentUser = await user.getMe()

function init() {
    userText.innerText = currentUser.username
    openCreateForm.addEventListener("click", () => toggleCreateForm())
    closeCreateForm.addEventListener("click", () => toggleCreateForm())
    createButton.addEventListener("click", () => createTodo())
    loadData()
}

async function loadData() {
    //Wird beim Laden aufgerufen und gibt dem HTML alle Todos
    try {
        const resp = await axiosInstance.get("/todos")
        const todos = resp.data
        todos.forEach(el => loadTodo(el))
    } catch (e) {
        openErrorAlert("Fehler beim laden der Todos",e)
    }
}

async function changeStatus(uuid) {
    try {
        const resp = await axiosInstance.put("/todos/" + uuid)
        loadTodo(resp.data)
    } catch (e) {
        openErrorAlert("Fehler beim ändern des Todo-Status",e)
    }
}

async function deleteTodo(uuid) {
    try {
        await axiosInstance.delete("/todos/" + uuid)
    }catch(e){
        openErrorAlert("Fehler beim ändern des Passworts",e)
    }
}

async function createTodo() {
    try {
        const resp = await axiosInstance.post("/todos", { //Laut https://axios-http.com/docs/post_example die struktur
            title: createTitle.value,
            description: createDescription.value
        })
        loadTodo(resp.data)
    }catch (e) {
        openErrorAlert("Fehler beim erstellen des Todos",e)
    }
}

//---- Normale Funktionen ----//
//Lädt das To-Do 'curTodo'
function loadTodo(curTodo) {
    let todoObject
    todoObject = document.createElement('div')
    curTodo.status ? finishedContainer.appendChild(todoObject) : activeContainer.appendChild(todoObject)
    todoObject.className = "p-2 border border-info rounded highlight mb-1"
    let title = document.createElement('h2')
    title.innerText = curTodo.title;
    todoObject.appendChild(title)
    let description = document.createElement('p')
    description.innerText = curTodo.description;
    todoObject.appendChild(description)
    let buttonDiv = document.createElement('div')
    buttonDiv.className = "d-flex justify-content-end"
    todoObject.appendChild(buttonDiv)
    let buttonChangeStatus = document.createElement('a')

    buttonChangeStatus.addEventListener("click", () => {
        changeStatus(curTodo.uuid)
        buttonChangeStatus.parentElement.parentElement.remove() //Löscht das TodoObjekt
    })
    if (curTodo.status) {
        buttonChangeStatus.className = "btn btn-warning ml-2"
        buttonChangeStatus.innerText = "Reaktivieren"
    } else {
        buttonChangeStatus.className = "btn btn-success ml-2"
        buttonChangeStatus.innerText = "Erledigt"
    }
    buttonDiv.appendChild(buttonChangeStatus)
    let buttonDelete = document.createElement('a')
    buttonDelete.className = "btn btn-danger ml-2"
    buttonDelete.addEventListener("click", () => {
        deleteTodo(curTodo.uuid)
        buttonDelete.parentElement.parentElement.remove() //Löscht das TodoObjekt
    })
    buttonDelete.innerText = "Löschen"
    buttonDiv.appendChild(buttonDelete)
}

function toggleCreateForm() {
    const cur = createForm.getAttribute("hidden")
    if (cur) {
        createForm.removeAttribute("hidden")
        openCreateForm.setAttribute("hidden", "Bananenbrot")
    } else {
        createForm.setAttribute("hidden", "NoValueNeeded")
        openCreateForm.removeAttribute("hidden")
    }
}

function openErrorAlert(text,e) {
    errorAlert.className = "alert alert-danger p-1"
    errorAlert.innerText = text+": "+e.response.status+" - "+e.response.statusText
    errorAlert.removeAttribute("hidden")
}
//Aufruf von Init
init()