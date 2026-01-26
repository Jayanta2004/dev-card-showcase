function loadHTML(id,file){
    fetch(file)
    .then(response=>response.text())
    .then(data=>{
        document.getElementById(id).innerHTML=data;
    })
    .catch(error=>console.log("Error loading file: ",file));
}
loadHTML("navbar","navbar.html");
loadHTML("footer","footer.html");