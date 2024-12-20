
const mysql = require(`mysql-await`); // npm install mysql-await
const tunnel = require('./tunnel.js')

var connPool = mysql.createPool({
  connectionLimit: 5,
  host: "127.0.0.1",
  user: "***",
  database: "***",
  password: "***",
});
async function createUser(user, pass){
    let result = await connPool.awaitQuery("INSERT INTO USER (user, pass) VALUES (?, ?)", [user, pass])
    if(result.affectedRows == 0){
      // console.log("0 affected rows")
      return -1
    }
    return result.insertId

}
async function usernameIsUnique(user){
    let result = await connPool.awaitQuery("SELECT * FROM USER WHERE user=?", [user])
    if(result.length == 0){
      return true
    }
    return false
}
async function login(user, pass){
  // return list [id, name]
  // if login succesful, returns userId
    let id = -1
    let result = await connPool.awaitQuery("SELECT * FROM USER WHERE user=?", [user])
    // id = -2: user not found
    // id = -1: incorrect password
    // otherwise, id = userId
    // 
    if(result.length == 0){
      return [-2, ""]
    }
    if(result[0]["pass"] != pass){
      return [-1, ""]
    }
    return [result[0]["id"], user]
}
async function deleteTodoItem(id){
    let result = await connPool.awaitQuery("DELETE FROM TODO_ITEM WHERE id=?", [id])
    if(result.affectedRows > 0){
      return true
    }
    return false
}
async function createTodoItems(data){
    let result = await connPool.awaitQuery("INSERT INTO TODO_ITEM (userId, task, done, deadline) VALUES (?, ?, ?, ?)", [data["userId"], data["task"], data["done"], data["deadline"]])
    if(result.affectedRows > 0){
      return result.insertId
    }
    return -1
}
async function updateTodoItemStatus(itemId, newStatus){
    let result = await connPool.awaitQuery("UPDATE TODO_ITEM SET done = ? WHERE id = ?", [newStatus, itemId])
    if(result.affectedRows > 0){
      return true
    }
    return false
}
async function validateUser(userId){
  let result = await connPool.awaitQuery("SELECT * FROM USER WHERE id=?", [userId])
  if(result.length == 0){
    return false
  }
  return true
}

async function getTodoItems(userId){
    // https://www.geeksforgeeks.org/date_format-function-in-mysql/
    let items = await connPool.awaitQuery(`SELECT id, userId, task, done, DATE_FORMAT(deadline, "%Y-%m-%d") AS deadline FROM TODO_ITEM WHERE userId=?`, [userId])
    // console.log(items.length)
    return items
}
module.exports = {
  createUser,
  usernameIsUnique,
  login,
  validateUser,
  deleteTodoItem,
  updateTodoItemStatus,
  createTodoItems,
  getTodoItems
};