async function logout(){
    // https://www.tutorialspoint.com/how-to-clear-all-cookies-with-javascript
    var cookies = document.cookie.split(';');
    for(let i = 0 ; i < cookies.length; i++){
        document.cookie = cookies[i]+"=; expires="+ new Date(0).toUTCString();
    }
}