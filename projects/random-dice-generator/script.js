const dice = document.getElementById('dice');
const rollButton = document.getElementById('roll-button');

const rollDice = () => {
    const random = Math.floor(Math.random() * 6) + 1;
    rotateDice(random);
};

const rotateDice = (random) => {
    let x, y;
    switch (random) {
        case 1:
            x = 0;
            y = 0;
            break;
        case 2:
            x = 0;
            y = 180;
            break;
        case 3:
            x = -90;
            y = 0;
            break;
        case 4:
            x = 90;
            y = 0;
            break;
        case 5:
            x = 0;
            y = 90;
            break;
        case 6:
            x = 0;
            y = -90;
            break;
        default:
            break;
    }
    dice.style.transform = `rotateX(${x}deg) rotateY(${y}deg)`;
};

rollButton.addEventListener('click', rollDice);
window.addEventListener('load', rollDice);