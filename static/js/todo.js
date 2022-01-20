import {user, axiosInstance} from "./repo.js";

const deleteButton = document.querySelector("[data-delete-button]");
const changeStateButton = document.querySelector("[data-change-state-button]");
const activeContainer = document.querySelector("[data-active-container]");
const finishedContainer = document.querySelector("[data-finished-container]");
async function loadData(){
    //Wird beim Laden aufgerufen und gibt dem HTML alles, was wir brauchen
    const resp = await axiosInstance.get("/todos")
    const todos = resp.data
    loadTodo("a")

}
function changeStatus(uuid){
console.log("HAHAHAHAHAHAH")
}

function deleteTodo(uuid){

}
//Lädt die Daten
function loadTodo(curTodo){
    let todoObject
        todoObject = finishedContainer.createElement('div')
        todoObject.className = "p-2 border border-info rounded highlight"
        let title = todoObject.createElement('h2')
        title.innerText = curTodo.title;
        let description = todoObject.createElement('p')
        description.innerText = curTodo.description;
        let buttonDiv = todoObject.createElement('div')
        let buttonChangeStatus = buttonDiv.createElement('a')
        buttonChangeStatus.className="btn btn-success ml-2"
        buttonChangeStatus.onclick = changeStatus(curTodo.uuid);
        let buttonDelete = buttonDiv.createElement('a')
        buttonDelete.className="btn btn-danger ml-2"
        buttonDelete.onclick = deleteTodo(curTodo.uuid);

}
loadData()