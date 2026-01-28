function decide() {
    const questionInput = document.getElementById("question");
    const answerEl = document.getElementById("answer");
    const reasonEl = document.getElementById("reason");
    const btn = document.getElementById("decideBtn");

    const question = questionInput.value.trim().toLowerCase();

    // RESET UI
    answerEl.className = "think";
    answerEl.textContent = "Thinking...";
    reasonEl.textContent = "";
    btn.disabled = true;

    if (question === "") {
        answerEl.textContent = "Ask something!";
        reasonEl.textContent = "A clear question leads to a clear decision.";
        btn.disabled = false;
        return;
    }

    setTimeout(() => {
        const positiveWords = [
            "study", "learn", "exercise", "practice", "help", "save"
        ];
        const negativeWords = [
            "skip", "cheat", "fight", "waste", "quit", "ignore"
        ];

        let score = 0;

        positiveWords.forEach(word => {
            if (question.includes(word)) score++;
        });

        negativeWords.forEach(word => {
            if (question.includes(word)) score--;
        });

        if (score > 0) {
            answerEl.textContent = "YES";
            answerEl.className = "yes";
            reasonEl.textContent =
                "This choice supports growth and long-term benefits.";
        } 
        else if (score < 0) {
            answerEl.textContent = "NO";
            answerEl.className = "no";
            reasonEl.textContent =
                "This decision may lead to negative consequences.";
        } 
        else {
            answerEl.textContent = "THINK AGAIN";
            answerEl.className = "think";
            reasonEl.textContent =
                "The outcome depends on context. Consider pros and cons.";
        }

        // Clear input & enable button
        questionInput.value = "";
        btn.disabled = false;

    }, 900); // thinking delay
}
