async function attemptItemCreate(_userId){
    // console.log("attempt create called")
    // console.log("user id: "+_userId)
    const _title = document.getElementById("title");
    const _deadline = document.getElementById("deadline")
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const request = new Request("/api/createItem", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({title: _title.value, 
            deadline:_deadline.value, 
            userId:_userId}),
        credentials: "same-origin"
    });
    const response = await fetch(request)
    // console.log(response)
    let status = response.status
    const json = await response.json();
    // console.log(json)
    let newId = json.id;
    // console.log(newId)
    newId = response.body.id
    if(status == 500){
        alert("An error occurred")
    }
    let newDiv = document.createElement('div')
    newDiv.className="item"
    newDiv.id=`item_${newId}`
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/prepend
    newDiv.innerHTML = `
    <div class="row">
        <div class="column">
            <span class="itemTask">${_title.value}</span>
        </div>
        <div class="column">
            <input class="doneCheckbox" type="checkbox" id="done_${newId}" name="done_${newId}" value="false" onclick="handleDoneToggle(${newId})">
        </div>
    </div>
    <div class="row"> 
        <div class="column"> 
            <span class="itemDeadline">
                ${_deadline.value}
            </span>
        </div>
        <div class="column">
            <button class="deleteButton" type="button" id="deleteButton" name="deleteButton" onclick="doDelete(${newId})">Delete</button>
        </div>
    </div>
    `
    const items = document.getElementById('items');
    items.prepend(newDiv);
}
async function doDelete(itemId){
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const request = new Request("/api/deleteItem", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({id:itemId}),
        credentials: "same-origin"
    });
    const response = await fetch(request)
    // console.log(response)
    let status = response.status
    if(status == 200){
        const item = document.getElementById('item_'+itemId);
        item.remove()
    }
    else{
        alert("delete failed")
    }
}
async function handleDoneToggle(itemId){
    // console.log("done_"+itemId)
    const checkBox = document.getElementById("done_"+itemId);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const request = new Request("/api/updateItemDone", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({id:itemId, newStatus: checkBox.checked}),
        credentials: "same-origin"
    });
    const response = await fetch(request)
    let status = response.status

    if(status != 200){
        alert("Error updating done status in database")
    }
}
async function sortByDeadline(){
    // console.log("trying to sort")
    const parent = document.getElementById("items")
    let nodeList = Array.prototype.slice.call(parent.children, 0);
    nodeList.sort((a, b) => {
        let deadlineA = a.querySelector(".itemDeadline")
        let deadlineB = b.querySelector(".itemDeadline")
        // console.log(deadlineA)
        let dateA = new Date(deadlineA.innerHTML)
        // console.log(deadlineA.innerHTML)
        let dateB = new Date(deadlineB.innerHTML)
        // console.log(deadlineA.innerHTML)
        return dateA - dateB
    })
    parent.innerHTML=""
    for(let i of nodeList){
        parent.appendChild(i)
    }
}
async function hideFinished(){
    const checkBox = document.getElementById("hideDone");
    let hide = checkBox.checked
    let display = (hide == true ? "none" : "block")
    const parent = document.getElementById("items")
    for(let i of parent.children){
        let childFinished = i.querySelector(".doneCheckbox").checked
        if(childFinished){
            i.style.display = display
        }
    }
}

async function hideNotOverdue(){
    const checkBox = document.getElementById("hideNotOverdue");
    let hide = checkBox.checked
    let display = (hide == true ? "none" : "block")
    const parent = document.getElementById("items")
    for(let i of parent.children){
        let childDeadline = new Date(i.querySelector(".itemDeadline").innerHTML)
        let childOverdue = (new Date() < childDeadline ? false : true)
        if(!childOverdue){
            i.style.display = display
        }
    }
}
// https://stackoverflow.com/questions/5066925/javascript-only-sort-a-bunch-of-divs
// https://stackoverflow.com/questions/1992114/how-do-you-create-a-hidden-div-that-doesnt-create-a-line-break-or-horizontal-sp