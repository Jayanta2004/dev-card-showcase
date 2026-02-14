// app.js

const visualizer = document.getElementById('visualizer');
const algorithmSelect = document.getElementById('algorithm');
const randomizeBtn = document.getElementById('randomize');
const startBtn = document.getElementById('start');

let array = [];
const ARRAY_SIZE = 25;
const DELAY = 200;

function randomArray(size = ARRAY_SIZE) {
    return Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 10);
}

function renderArray(arr, activeIndices = [], foundIndices = []) {
    visualizer.innerHTML = '';
    arr.forEach((value, idx) => {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${value * 2}px`;
        if (activeIndices.includes(idx)) bar.classList.add('active');
        if (foundIndices.includes(idx)) bar.classList.add('found');
        visualizer.appendChild(bar);
    });
}

async function bubbleSort(arr) {
    let a = arr.slice();
    for (let i = 0; i < a.length - 1; i++) {
        for (let j = 0; j < a.length - i - 1; j++) {
            renderArray(a, [j, j + 1]);
            await sleep(DELAY);
            if (a[j] > a[j + 1]) {
                [a[j], a[j + 1]] = [a[j + 1], a[j]];
            }
        }
    }
    renderArray(a);
}

async function selectionSort(arr) {
    let a = arr.slice();
    for (let i = 0; i < a.length; i++) {
        let minIdx = i;
        for (let j = i + 1; j < a.length; j++) {
            renderArray(a, [minIdx, j]);
            await sleep(DELAY);
            if (a[j] < a[minIdx]) minIdx = j;
        }
        [a[i], a[minIdx]] = [a[minIdx], a[i]];
    }
    renderArray(a);
}

async function insertionSort(arr) {
    let a = arr.slice();
    for (let i = 1; i < a.length; i++) {
        let key = a[i];
        let j = i - 1;
        while (j >= 0 && a[j] > key) {
            renderArray(a, [j, j + 1]);
            await sleep(DELAY);
            a[j + 1] = a[j];
            j--;
        }
        a[j + 1] = key;
    }
    renderArray(a);
}

async function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        renderArray(arr, [i]);
        await sleep(DELAY);
        if (arr[i] === target) {
            renderArray(arr, [], [i]);
            return;
        }
    }
    renderArray(arr);
}

async function binarySearch(arr, target) {
    let a = arr.slice().sort((x, y) => x - y);
    let left = 0, right = a.length - 1;
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        renderArray(a, [mid]);
        await sleep(DELAY);
        if (a[mid] === target) {
            renderArray(a, [], [mid]);
            return;
        } else if (a[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    renderArray(a);
}

function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
}

function reset() {
    array = randomArray();
    renderArray(array);
}

randomizeBtn.addEventListener('click', reset);

startBtn.addEventListener('click', async () => {
    const algo = algorithmSelect.value;
    if (algo === 'bubble') await bubbleSort(array);
    else if (algo === 'selection') await selectionSort(array);
    else if (algo === 'insertion') await insertionSort(array);
    else if (algo === 'linear') {
        const target = prompt('Enter value to search for:');
        if (target !== null) await linearSearch(array, Number(target));
    } else if (algo === 'binary') {
        const target = prompt('Enter value to search for:');
        if (target !== null) await binarySearch(array, Number(target));
    }
});

// Initialize
reset();
