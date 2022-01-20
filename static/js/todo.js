import {user, axiosInstance} from "./repo.js";

const deleteButton = document.querySelector("[data-delete-button]");
const changeStateButton = document.querySelector("[data-change-state-button]");
const activeContainer = document.querySelector("[data-active-container]");
const finishedContainer = document.querySelector("[data-finished-container]");

async function loadData() {
    //Wird beim Laden aufgerufen und gibt dem HTML alles, was wir brauchen
    const resp = await axiosInstance.get("/todos")
    const todos = resp.data
    console.log(todos)
    todos.forEach(el => loadTodo(el))
}

function changeStatus(uuid) {
    console.log("HAHAHAHAHAHAH")
}

function deleteTodo(uuid) {

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

    buttonChangeStatus.addEventListener("click", () => changeStatus(curTodo.uuid))
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
    buttonDelete.addEventListener("click", () => deleteTodo(curTodo.uuid))
    buttonDelete.innerText = "Löschen"
    buttonDiv.appendChild(buttonDelete)

}

loadData()