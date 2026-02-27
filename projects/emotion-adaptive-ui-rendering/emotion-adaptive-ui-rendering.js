document.addEventListener('DOMContentLoaded', function() {
    const emotionButtons = document.querySelectorAll('.emotion-btn');
    const emotionContainer = document.querySelector('.emotion-container');
    const contentTitle = document.getElementById('contentTitle');
    const contentText = document.getElementById('contentText');
    const actionBtn = document.getElementById('actionBtn');
    const progressFill = document.getElementById('progressFill');
    const currentEmotion = document.getElementById('currentEmotion');
    const adaptationLevel = document.getElementById('adaptationLevel');
    const uiChanges = document.getElementById('uiChanges');

    let selectedEmotion = null;
    let changeCount = 0;

    const emotionData = {
        happy: {
            title: "You're feeling great! 🎉",
            text: "Let's keep that positive energy flowing! The interface is now bright and cheerful to match your mood.",
            buttonText: "Spread Joy!",
            progress: 80,
            adaptation: 85
        },
        sad: {
            title: "It's okay to feel down sometimes 😔",
            text: "The interface has softened its colors and animations to provide a gentle, comforting experience.",
            buttonText: "Find Comfort",
            progress: 30,
            adaptation: 70
        },
        angry: {
            title: "Take a deep breath 😤",
            text: "Cool, calming colors are now active to help you relax and regain your composure.",
            buttonText: "Calm Down",
            progress: 20,
            adaptation: 90
        },
        calm: {
            title: "Peace and tranquility 🧘",
            text: "The interface maintains a balanced, serene design that complements your calm state.",
            buttonText: "Stay Zen",
            progress: 60,
            adaptation: 75
        },
        excited: {
            title: "Wow, so much energy! 🤩",
            text: "Vibrant colors and dynamic elements are now engaged to match your excitement!",
            buttonText: "Channel Energy!",
            progress: 90,
            adaptation: 95
        },
        anxious: {
            title: "You're not alone in this 😰",
            text: "The layout has become more structured and reassuring to help ease your anxiety.",
            buttonText: "Find Stability",
            progress: 40,
            adaptation: 80
        },
        neutral: {
            title: "Balanced and focused 🤔",
            text: "A clean, neutral design that supports clear thinking and productivity.",
            buttonText: "Stay Focused",
            progress: 50,
            adaptation: 60
        }
    };

    emotionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const emotion = this.dataset.emotion;
            selectEmotion(emotion);
        });
    });

    function selectEmotion(emotion) {
        // Remove previous emotion class
        if (selectedEmotion) {
            emotionContainer.classList.remove(`emotion-${selectedEmotion}`);
            document.querySelector(`[data-emotion="${selectedEmotion}"]`).classList.remove('active');
        }

        // Add new emotion class
        selectedEmotion = emotion;
        emotionContainer.classList.add(`emotion-${emotion}`);
        document.querySelector(`[data-emotion="${emotion}"]`).classList.add('active');

        // Update content
        const data = emotionData[emotion];
        contentTitle.textContent = data.title;
        contentText.textContent = data.text;
        actionBtn.textContent = data.buttonText;
        progressFill.style.width = `${data.progress}%`;

        // Update stats
        currentEmotion.textContent = emotion.charAt(0).toUpperCase() + emotion.slice(1);
        adaptationLevel.textContent = `${data.adaptation}%`;
        changeCount++;
        uiChanges.textContent = changeCount;

        // Animate changes
        animateChanges();
    }

    function animateChanges() {
        // Add a subtle animation to the content card
        const contentCard = document.querySelector('.content-card');
        contentCard.style.animation = 'none';
        setTimeout(() => {
            contentCard.style.animation = 'fadeIn 0.5s ease-in-out';
        }, 10);
    }

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(style);
});