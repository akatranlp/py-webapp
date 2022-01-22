import {user, axiosInstance} from "./repo.js";


const createButton = document.querySelector("[data-create-button]");
const openCreateForm = document.querySelector("[data-open-create-form-button]");
const closeCreateForm = document.querySelector("[data-close-create-form-button]");
const createTitle = document.querySelector("[data-create-title]");
const createDescription = document.querySelector("[data-create-description]");
const createForm = document.querySelector("[data-create-form]");
const activeContainer = document.querySelector("[data-active-container]");
const finishedContainer = document.querySelector("[data-finished-container]");

function init(){
    openCreateForm.addEventListener("click", ()=>toggleCreateForm())
    closeCreateForm.addEventListener("click", ()=>toggleCreateForm())
    createButton.addEventListener("click", ()=>createTodo())
    loadData()
}

async function loadData() {
    //Wird beim Laden aufgerufen und gibt dem HTML alles, was wir brauchen
    const resp = await axiosInstance.get("/todos")
    const todos = resp.data

    todos.forEach(el => loadTodo(el))
}

async function changeStatus(uuid) {
    const resp = await axiosInstance.put("/todos/" + uuid)
    loadTodo(resp.data)
}

async function deleteTodo(uuid) {
    await axiosInstance.delete("/todos/" + uuid)
}
function toggleCreateForm(){
    const cur = createForm.getAttribute("hidden")
    if(cur) {
        createForm.removeAttribute("hidden")
        openCreateForm.setAttribute("hidden", "Bananenbrot")
    } else {
        createForm.setAttribute("hidden", "NoValueNeeded")
        openCreateForm.removeAttribute("hidden")
    }

}
async function createTodo(){
    const resp = await axiosInstance.post("/todos", { //Laut https://axios-http.com/docs/post_example die struktur
        title: createTitle.value,
        description: createDescription.value
    })
    loadTodo(resp.data)
}
//Lädt die Todos
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
    if(curTodo.status) {
        buttonChangeStatus.className = "btn btn-warning ml-2"
        buttonChangeStatus.innerText = "Reaktivieren"
    }
    else{
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



init()