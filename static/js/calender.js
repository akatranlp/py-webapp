console.log("hello?")
window.onload = createCalender()

function f() {
        return fetch('http://localhost:8000/getItems')
            .then(response => response.json())
            .then(data => {
                console.log(data.D)
                return data.D
            });
    }

    function deleteItem(ID) {
        console.log(ID)
    }

    function createCalender() {
        f().then(response => {
            console.log(response)
            var Items = document.createElement("div")

            response.forEach(element => {
                element.Ausgeliehen.forEach(e => {
                    p(e.itemID).then(picRes => {
                        console.log(picRes)

                        document.getElementsByTagName('body')[0].appendChild(Items)
                        var aItem = document.createElement('div');

                        let btn = document.createElement("button")
                        btn.innerHTML = "Zurückgeben"
                        btn.onclick = function () {
                            console.log("click")
                            Items.removeChild(aItem)
                            deleteItem(e.itemID)
                        }
                        aItem.innerHTML = '                ' +
                            '  <img src=' + picRes.url + ' style="width:90px;height:100px">  ' +
                            '  ' + e.itemName + '' +
                            '  ' +
                            ''
                        Items.appendChild(aItem);

                        aItem.appendChild(btn);
                    })

                })
            });
        })
    }

    function newMeeting(){

    }