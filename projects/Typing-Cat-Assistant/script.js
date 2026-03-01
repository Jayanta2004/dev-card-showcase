const catElement = document.getElementById('cat');
const messageElement = document.getElementById('message');
const lineCountElement = document.getElementById('lineCount');

const expressions = {
    default: {
        art: ` /\\_/\\  
( o.o ) 
 > ^ < `,
        message: "The cat is sleeping... Wake it up by typing!"
    },
    happy: {
        art: ` /\\_/\\  
( ^.^ ) 
 > ^ < `,
        message: "Purr... The cat is happy!"
    },
    surprised: {
        art: ` /\\_/\\  
( O.O ) 
 > ^ < `,
        message: "Whoa! The cat is surprised!"
    },
    angry: {
        art: ` /\\_/\\  
( >.< ) 
 > ^ < `,
        message: "Hiss! The cat is annoyed!"
    },
    excited: {
        art: ` /\\_/\\  
( o.o ) 
 > w < `,
        message: "Meow! The cat is excited!"
    },
    celebration: {
        art: ` /\\_/\\  
( ^.^ ) 
 > ^ < 
   🎉`,
        message: "Congratulations! You've typed 1000 lines! The cat is celebrating! 🎊"
    }
};

let currentExpression = 'default';
let timeoutId;
let lineCount = 0;

function changeExpression(event) {
    // Check if Enter key is pressed to count lines
    if (event.key === 'Enter') {
        lineCount++;
        updateLineCount();
        if (lineCount === 1000) {
            currentExpression = 'celebration';
            updateCat();
            // Don't reset for celebration
            clearTimeout(timeoutId);
            return;
        }
    }

    // Only change expression if not celebrating
    if (currentExpression !== 'celebration') {
        const keys = Object.keys(expressions).filter(key => key !== 'celebration');
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        currentExpression = randomKey;
        updateCat();
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            currentExpression = 'default';
            updateCat();
        }, 2000);
    }
}

function updateCat() {
    catElement.querySelector('pre').textContent = expressions[currentExpression].art;
    messageElement.textContent = expressions[currentExpression].message;
}

function updateLineCount() {
    lineCountElement.textContent = `Lines typed: ${lineCount} / 1000`;
}

document.addEventListener('keydown', changeExpression);

// Initial display
updateCat();
updateLineCount();