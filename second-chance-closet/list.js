// Item listing logic
const listForm = document.getElementById('listForm');
const itemList = document.getElementById('itemList');

listForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const type = listForm.type.value;
    const condition = listForm.condition.value;
    const size = listForm.size.value;
    const desc = listForm.desc.value;
    const item = { type, condition, size, desc, owner: 'User', requests: [] };
    let items = JSON.parse(localStorage.getItem('closetItems') || '[]');
    items.push(item);
    localStorage.setItem('closetItems', JSON.stringify(items));
    showItems(items);
    listForm.reset();
});

function showItems(items) {
    if (items.length === 0) {
        itemList.innerHTML = '<p>No items listed yet.</p>';
        return;
    }
    itemList.innerHTML = '<ul>' + items.map((i, idx) => `<li>${i.type} (${i.condition}, Size: ${i.size}) - ${i.desc} <button onclick='requestItem(${idx})'>Request</button></li>`).join('') + '</ul>';
}

window.requestItem = function(idx) {
    let items = JSON.parse(localStorage.getItem('closetItems') || '[]');
    items[idx].requests.push('User');
    localStorage.setItem('closetItems', JSON.stringify(items));
    showItems(items);
};

window.onload = function() {
    const items = JSON.parse(localStorage.getItem('closetItems') || '[]');
    showItems(items);
};