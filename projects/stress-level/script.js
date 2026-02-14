        (function() {
            // ---------- QUIZ DATA ----------
            const questions = [
                {
                    text: "In the last month, how often have you felt unable to control the important things in your life?",
                    options: ["never", "almost never", "sometimes", "fairly often", "very often"]
                },
                {
                    text: "How often have you felt nervous or 'stressed'?",
                    options: ["never", "almost never", "sometimes", "fairly often", "very often"]
                },
                {
                    text: "How often have you found that you could not cope with all the things you had to do?",
                    options: ["never", "almost never", "sometimes", "fairly often", "very often"]
                },
                {
                    text: "How often have you been angered because of things that were outside of your control?",
                    options: ["never", "almost never", "sometimes", "fairly often", "very often"]
                },
                {
                    text: "How often have you felt difficulties were piling up so high that you could not overcome them?",
                    options: ["never", "almost never", "sometimes", "fairly often", "very often"]
                },
                {
                    text: "How often have you felt that you were on top of things? (reverse scored)",
                    options: ["never", "almost never", "sometimes", "fairly often", "very often"]
                }
            ];

            // map answers to numeric 1-5 (for last question we reverse later)
            const OPTION_VALUES = [1, 2, 3, 4, 5]; // 1=never, 5=very often

            // reverse scoring for question index 5 (the 6th question, zero-based 5)
            const REVERSE_INDEXES = [5];   // "on top of things"

            // state
            let currentIndex = 0;
            const totalQuestions = questions.length;
            // store answers as numbers (1-5), null = not answered
            let answers = new Array(totalQuestions).fill(null);

            // DOM elements
            const questionText = document.getElementById('questionText');
            const optionsContainer = document.getElementById('optionsContainer');
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const resetBtn = document.getElementById('resetBtn');
            const currentQDisplay = document.getElementById('currentQDisplay');
            const answeredCountSpan = document.getElementById('answeredCount');
            const progressFill = document.getElementById('progressFill');
            const quizArea = document.getElementById('quizArea');
            const resultPanel = document.getElementById('resultPanel');
            const scoreDisplay = document.getElementById('scoreDisplay');
            const interpretationText = document.getElementById('interpretationText');

            // ----- helpers -----
            function countAnswered() {
                return answers.filter(a => a !== null).length;
            }

            function updateMetaAndProgress() {
                // question indicator
                currentQDisplay.textContent = `${currentIndex+1} / ${totalQuestions}`;
                const answered = countAnswered();
                answeredCountSpan.textContent = `${answered} answered`;
                const percent = (answered / totalQuestions) * 100;
                progressFill.style.width = percent + '%';
            }

            // get numeric value for option index (0-4) at given question index
            function getScoreForOption(questionIdx, optionIdx) {
                let val = OPTION_VALUES[optionIdx]; // 1 .. 5
                if (REVERSE_INDEXES.includes(questionIdx)) {
                    // reverse: 1<->5, 2<->4, 3 stays
                    return 6 - val;   // because 1->5, 2->4, 3->3, 4->2, 5->1
                }
                return val;
            }

            // render current question + show selected option
            function renderQuestion() {
                const q = questions[currentIndex];
                questionText.textContent = q.text;

                // build options html
                let htmlStr = '';
                q.options.forEach((optText, idx) => {
                    const letter = String.fromCharCode(65 + idx); // A, B, C, D, E
                    const isSelected = answers[currentIndex] !== null && 
                                       answers[currentIndex] === getScoreForOption(currentIndex, idx);
                    const selectedClass = isSelected ? 'selected' : '';
                    htmlStr += `
                        <div class="option ${selectedClass}" data-opt-index="${idx}">
                            <span class="option-letter">${letter}</span>
                            <span>${optText}</span>
                        </div>
                    `;
                });
                optionsContainer.innerHTML = htmlStr;

                // attach click listeners
                document.querySelectorAll('.option').forEach(optDiv => {
                    optDiv.addEventListener('click', (e) => {
                        const idx = parseInt(optDiv.dataset.optIndex, 10);
                        setAnswer(currentIndex, idx);
                    });
                });

                // update prev/next button states
                prevBtn.disabled = currentIndex === 0;
                // next button enabled always (but if it's last question we change text to "finish")
                if (currentIndex === totalQuestions - 1) {
                    nextBtn.textContent = 'finish ✓';
                } else {
                    nextBtn.textContent = 'next ▶';
                }

                // special: if all questions answered, we might highlight something
                // but keep next enabled.
            }

            // set answer for given question by option index (0-4)
            function setAnswer(questionIdx, optionIdx) {
                const numericVal = getScoreForOption(questionIdx, optionIdx);
                answers[questionIdx] = numericVal;

                // re-render current question to show selected style (and update progress)
                renderQuestion();
                updateMetaAndProgress();

                // if all questions have been answered AND we are on the last question,
                // we could auto-show result? we let user click finish. but we also enable finish
            }

            // navigation: next
            function goNext() {
                // if it's the last question, attempt to show result (only if current question answered? but we allow incomplete)
                if (currentIndex === totalQuestions - 1) {
                    // finish quiz -> compute & show result, hide quiz area?
                    showResult();
                } else {
                    if (currentIndex < totalQuestions - 1) {
                        currentIndex++;
                        renderQuestion();
                        updateMetaAndProgress();
                    }
                }
            }

            // prev
            function goPrev() {
                if (currentIndex > 0) {
                    currentIndex--;
                    renderQuestion();
                    updateMetaAndProgress();
                }
            }

            // compute total stress score (sum of answers 1..5 per item, after reverse)
            function computeTotalScore() {
                let sum = 0;
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] !== null) {
                        sum += answers[i];
                    }
                    // treat null as 0? but we want to encourage full quiz. if any null, sum is partial, we'll show warning
                }
                return sum;
            }

            // show result panel with interpretation
            function showResult() {
                const answered = countAnswered();
                let totalScore = computeTotalScore();
                let maxPossible = totalQuestions * 5; // 30
                let minPossible = totalQuestions * 1; // 6

                let message = '';
                let severity = '';

                if (answered === 0) {
                    message = 'No answers yet — complete some questions to see your stress level.';
                    scoreDisplay.textContent = '?';
                    interpretationText.textContent = message;
                    quizArea.classList.remove('hidden');
                    resultPanel.classList.remove('hidden'); // show it anyway with warning
                    return;
                }

                // if some missing, we note it, but still compute based on answered.
                let averageScore = totalScore / answered;  // range 1..5
                let scaledPercent = (averageScore - 1) / 4 * 100; // 0% (low stress) to 100% (high stress)
                let displayScore = Math.round(averageScore * 10) / 10; // like 2.4

                const allAnswered = answered === totalQuestions;
                if (!allAnswered) {
                    message = `⚠️ based on ${answered} of ${totalQuestions} questions. `;
                } else {
                    message = '';
                }

                // interpretive categories
                if (averageScore < 2.2) {
                    severity = 'low stress · good balance';
                    message += `Your average score is ${displayScore} (low). You seem to be managing well — keep nurturing your calm.`;
                } else if (averageScore >= 2.2 && averageScore < 3.2) {
                    severity = 'moderate stress · manageable';
                    message += `Average stress level: ${displayScore} (moderate). Some tension but likely manageable. Consider small rest breaks.`;
                } else if (averageScore >= 3.2 && averageScore < 4.0) {
                    severity = 'high stress · tension rising';
                    message += `Average score: ${displayScore} (high). You may be feeling overloaded. Try relaxation or talking to someone.`;
                } else {
                    severity = 'very high stress · seek support';
                    message += `Average score: ${displayScore} (very high). Chronic stress can take a toll — consider reaching out to a professional.`;
                }

                scoreDisplay.textContent = `${displayScore} / 5  (${Math.round(scaledPercent)}% stress)`;
                interpretationText.innerHTML = `<strong>${severity}</strong><br>${message}`;
                
                // hide question area, show result
                quizArea.classList.add('hidden');
                resultPanel.classList.remove('hidden');
            }

            // reset everything
            function resetQuiz() {
                answers = new Array(totalQuestions).fill(null);
                currentIndex = 0;

                // hide result if visible, show quiz
                resultPanel.classList.add('hidden');
                quizArea.classList.remove('hidden');

                renderQuestion();
                updateMetaAndProgress();
            }

            // ----- event listeners -----
            prevBtn.addEventListener('click', goPrev);
            nextBtn.addEventListener('click', goNext);
            resetBtn.addEventListener('click', resetQuiz);

            // initial render
            renderQuestion();
            updateMetaAndProgress();

            // optional: keyboard / or any other
            // ensure result panel hidden at start
            resultPanel.classList.add('hidden');
        })();