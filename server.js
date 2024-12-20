const express = require("express")
var cookieParser = require('cookie-parser')
const app = express()
const port = 4131

app.use("/", express.static("resources/"))
app.use(cookieParser())
app.set("views", "templates");
app.set("view engine", "pug");
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

const db = require('./data.js');

app.get(["/", "/todo"], async (req, res)=>{
    try{
        let id = req.cookies["userId"]
        if(!("userId" in req.cookies) || !(await db.validateUser(id))){
            res.set("Location", "/create")
            res.status(302)
            res.send()
        }
        let todoItems = await db.getTodoItems(id)
        // console.log(todoItems)
        res.render("todo_list", {items: todoItems, userId: id})
    }
    catch(error){
        res.status(500)
        res.send()
    }

})
app.post("/api/deleteItem", async (req, res)=>{
    try{
        if(await db.deleteTodoItem(req.body.id)){
            res.set(200)
            res.send()
        }
        else{
            res.set(400)
            res.send()
        }   
    }
    catch(error){
        res.status(500)
        res.send()
    }
})
app.post("/api/updateItemDone", async (req, res) => {
    try{
            // console.log("updatingItemStatus to: " + req.body.newStatus)
        if(await db.updateTodoItemStatus(req.body.id, req.body.newStatus)){
            res.set(200)
            res.send()
        }
        else{
            res.set(400)
            res.send()
        }
    }
    catch(error){
        res.status(500)
        res.send()
    }
})
app.post("/api/createItem", async (req, res)=>{
    try{
            // (userId, task, done, deadline)
        item = {
            "userId":req.body.userId,
            "task":req.body.title,
            "done":false,
            "deadline":req.body.deadline
        }
        let newId = await db.createTodoItems(item)
        // console.log(newId)
        if(newId != -1){
            res.status(200)
            res.send({id: newId})
        }
        else{
            res.status(500)
            res.send()
        }
    }
    catch(error){
        res.status(500)
        res.send()
    }
    
})
app.get("/login", (req, res) =>{
    res.render("login", 
        {
            action: "/api/login", 
            actionString:"Log In", 
            linkToOtherPage:"/create", 
            otherActionString:"Create Account",
            jsFile:"js/login.js"

        })
})
app.get("/create", (req, res) =>{
    res.render("login", 
        {
            action: "/api/create", 
            actionString:"Create Account", 
            linkToOtherPage:"/login", 
            otherActionString:"Log In",
            jsFile:"js/create.js"
        })
            
})
app.post("/api/login", async (req, res) => {
    try{
        let result = await db.login(req.body.user, req.body.password)
        let status = result[0]
        if(status == -2){
            res.status(404)
        }
        else if (status == -1){
            res.status(403)
        }
        else{
            res.status(204)
            res.setHeader('Set-Cookie', [
                `userId=${status}; Path=/; Max-Age=86400`,
                `userName=${result[1]}; Path=/; Max-Age=86400`
              ]);
        }
        res.send()
    }
    catch(error){
        res.status(500)
        res.send()
    }
})
app.post("/api/createAccount", async (req, res) => {
    try{
        let result = await db.createUser(req.body.user, req.body.password)
        // console.log(result)
        if (result == -1){
            res.status(500)
        }
        else{
            result = await db.login(req.body.user, req.body.password)
            let status = result[0]
            if(status == -2){
                res.status(404)
            }
            else if (status == -1){
                res.status(403)
            }
            else{
                res.status(204)
                res.setHeader('Set-Cookie', [
                    `userId=${status}; Path=/; Max-Age=86400`,
                    `userName=${result[1]}; Path=/; Max-Age=86400`
                  ]);
            }
        }
        res.send()
    }
    catch(error){
        res.status(500)
        res.send()
    }
})
app.get('*', (req, res)=>{
    res.render("404", {})
})


app.listen(port, console.log("App running on http://localhost:" + port))