async function handleSubmit(){
    // do create logic
    // console.log("handle submit called")
    const _user = document.getElementById("user");
    const _password = document.getElementById("password")
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const request = new Request("/api/createAccount", {
        method: "POST",
        headers: myHeaders,
        body: JSON.stringify({user: _user.value, password:_password.value}),
        credentials: "same-origin"
    });
    const response = await fetch(request)
    let status = response.status

    if(status == 403){
        alert("Incorrect Password")
    }
    else if(status == 404){
        alert("User not found")
    }
    else{
        // https://stackoverflow.com/questions/503093/how-do-i-redirect-to-another-webpage
        // let json = await response.json()
        // document.cookie = `userId=${json.userId}; Path=/; Max-Age=86400`
        window.location.replace("/todo");
    }
    return false
}