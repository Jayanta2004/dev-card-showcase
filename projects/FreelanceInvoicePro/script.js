
let items = [];

function addItem() {
    const desc = document.getElementById("itemDesc").value.trim();
    const qty = parseFloat(document.getElementById("itemQty").value);
    const price = parseFloat(document.getElementById("itemPrice").value);
    if (!desc || !qty || !price) return;
    items.push({desc, qty, price});
    document.getElementById("itemDesc").value = "";
    document.getElementById("itemQty").value = "";
    document.getElementById("itemPrice").value = "";
    renderItems();
}

function renderItems() {
    const table = document.getElementById("itemsTable");
    table.innerHTML = "";
    let subtotal = 0;
    items.forEach((item, index) => {
        const total = item.qty * item.price;
        subtotal += total;
        table.innerHTML += "<tr><td>"+item.desc+"</td><td>"+item.qty+"</td><td>"+item.price+"</td><td>"+total.toFixed(2)+"</td><td><button onclick='removeItem("+index+")'>X</button></td></tr>";
    });
    const gst = subtotal * 0.18;
    const grand = subtotal + gst;
    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("gst").textContent = gst.toFixed(2);
    document.getElementById("grandTotal").textContent = grand.toFixed(2);
}

function removeItem(index) {
    items.splice(index,1);
    renderItems();
}

function generateInvoice() {
    window.print();
}
