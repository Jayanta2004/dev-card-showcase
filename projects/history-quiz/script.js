        (function() {
            // ---------- HISTORICAL QUESTIONS DATASET ----------
            const questions = [
                // ancient
                { era: 'ancient', question: 'In which modern country is the ancient city of Babylon located?', options: ['Iran', 'Iraq', 'Syria', 'Egypt'], correct: 1, explanation: 'Babylon was in Mesopotamia, now central Iraq.' },
                { era: 'ancient', question: 'Which empire built Machu Picchu?', options: ['Aztec', 'Inca', 'Maya', 'Olmec'], correct: 1, explanation: 'Machu Picchu is a 15th-century Inca citadel in Peru.' },
                { era: 'ancient', question: 'Who was the first Roman emperor?', options: ['Julius Caesar', 'Augustus', 'Nero', 'Trajan'], correct: 1, explanation: 'Augustus (Octavian) became the first emperor in 27 BC.' },
                { era: 'ancient', question: 'The ancient Chinese philosophy of Daoism is attributed to:', options: ['Confucius', 'Laozi', 'Sun Tzu', 'Mencius'], correct: 1, explanation: 'Laozi is traditionally regarded as the author of the Tao Te Ching.' },
                // medieval
                { era: 'medieval', question: 'Which dynasty ruled England from 1154 to 1485?', options: ['Tudor', 'Plantagenet', 'Stuart', 'Norman'], correct: 1, explanation: 'The Plantagenets ruled from Henry II to Richard III.' },
                { era: 'medieval', question: 'What was the primary language of learning in medieval Europe?', options: ['Latin', 'Greek', 'Arabic', 'French'], correct: 0, explanation: 'Latin was the lingua franca of scholars and the Church.' },
                { era: 'medieval', question: 'The Battle of Hastings took place in which year?', options: ['1066', '1215', '1065', '1154'], correct: 0, explanation: 'William the Conqueror defeated Harold II in 1066.' },
                { era: 'medieval', question: 'Which city was the capital of the Byzantine Empire?', options: ['Rome', 'Athens', 'Constantinople', 'Antioch'], correct: 2, explanation: 'Constantinople (now Istanbul) fell in 1453.' },
                // early modern
                { era: 'earlyModern', question: 'Who painted the Sistine Chapel ceiling?', options: ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Donatello'], correct: 1, explanation: 'Michelangelo painted it between 1508 and 1512.' },
                { era: 'earlyModern', question: 'The Spanish Armada was defeated in which year?', options: ['1588', '1603', '1568', '1642'], correct: 0, explanation: 'The English fleet defeated the Armada in 1588.' },
                { era: 'earlyModern', question: 'Which explorer first circumnavigated the globe?', options: ['Magellan', 'Columbus', 'Drake', 'da Gama'], correct: 0, explanation: 'Magellan led the expedition (though he died en route) in 1519–1522.' },
                { era: 'earlyModern', question: 'The Thirty Years\' War ended with which treaty?', options: ['Versailles', 'Westphalia', 'Utrecht', 'Tordesillas'], correct: 1, explanation: 'Peace of Westphalia (1648) ended the war.' },
                // modern
                { era: 'modern', question: 'Which year did the French Revolution begin?', options: ['1776', '1789', '1799', '1804'], correct: 1, explanation: 'Storming of the Bastille: 14 July 1789.' },
                { era: 'modern', question: 'Who was the US president during the Cuban Missile Crisis?', options: ['Truman', 'Eisenhower', 'Kennedy', 'Johnson'], correct: 2, explanation: 'John F. Kennedy in 1962.' },
                { era: 'modern', question: 'The first transcontinental railroad in the US was completed in:', options: ['1869', '1885', '1848', '1901'], correct: 0, explanation: 'The Golden Spike at Promontory Summit, 1869.' },
                { era: 'modern', question: 'Which empire collapsed after World War I?', options: ['British', 'Ottoman', 'Spanish', 'Portuguese'], correct: 1, explanation: 'The Ottoman Empire dissolved in 1922.' },
            ];

            // ----- DOM elements -----
            const eraBtns = document.querySelectorAll('.era-btn');
            const questionEl = document.getElementById('questionText');
            const optionsContainer = document.getElementById('optionsContainer');
            const feedbackEl = document.getElementById('feedbackMessage');
            const scoreDisplay = document.getElementById('scoreDisplay');
            const questionIndexSpan = document.getElementById('questionIndex');
            const eraTagSpan = document.getElementById('eraTag');
            const nextBtn = document.getElementById('nextQuestionBtn');
            const resetBtn = document.getElementById('resetQuizBtn');
            const remainingSpan = document.getElementById('remainingCounter');
            const correctCountSpan = document.getElementById('correctCountSpan');

            // ----- state -----
            let currentEra = 'all';
            let filteredQuestions = [...questions]; // initially all
            let currentIndex = 0; // index within filteredQuestions
            let userAnswers = [];   // track selected option index per question (or -1 if not answered)
            let score = 0;           // number of correct answers in this filtered set (recalc each time)
            let quizCompleted = false;

            // ----- helper functions -----
            function shuffleArray(arr) {
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                }
                return arr;
            }

            // filter by era, then shuffle, limit to 5 (or fewer)
            function applyFilterAndReset(era) {
                let newList = era === 'all' ? [...questions] : questions.filter(q => q.era === era);
                // shuffle to keep game fresh
                newList = shuffleArray(newList);
                // take up to 5
                if (newList.length > 5) newList = newList.slice(0, 5);
                filteredQuestions = newList;
                currentIndex = 0;
                userAnswers = new Array(filteredQuestions.length).fill(-1); // -1 = unanswered
                quizCompleted = false;
                updateScoreAndCounters();
                renderQuestion();
            }

            // update score (count correct based on userAnswers)
            function recalcScore() {
                let correctCount = 0;
                for (let i = 0; i < filteredQuestions.length; i++) {
                    if (userAnswers[i] === filteredQuestions[i].correct) {
                        correctCount++;
                    }
                }
                score = correctCount;
                return correctCount;
            }

            function updateScoreAndCounters() {
                const correct = recalcScore();
                const total = filteredQuestions.length;
                scoreDisplay.textContent = `${correct}/${total}`;
                correctCountSpan.innerHTML = `✅ ${correct} correct`;
                const remaining = total - (userAnswers.filter(a => a !== -1).length);
                remainingSpan.textContent = `${remaining} question${remaining !==1?'s':''} left`;
            }

            // render current question (at currentIndex)
            function renderQuestion() {
                if (filteredQuestions.length === 0) {
                    questionEl.textContent = 'No questions for this era.';
                    optionsContainer.innerHTML = '';
                    feedbackEl.textContent = 'Try another era.';
                    nextBtn.disabled = true;
                    return;
                }

                const q = filteredQuestions[currentIndex];
                questionEl.textContent = q.question;
                eraTagSpan.textContent = q.era;

                // build options
                let htmlStr = '';
                q.options.forEach((opt, idx) => {
                    let extraClass = '';
                    const answered = userAnswers[currentIndex] !== -1;
                    const selectedIdx = userAnswers[currentIndex];
                    // if question answered: apply styles
                    if (answered) {
                        if (idx === q.correct) extraClass = ' correct-highlight';
                        if (idx === selectedIdx && selectedIdx === q.correct) extraClass = ' selected-correct';
                        else if (idx === selectedIdx && selectedIdx !== q.correct) extraClass = ' selected-wrong';
                    }
                    const disabledAttr = answered ? 'disabled' : '';
                    htmlStr += `<button class="option-btn${extraClass}" data-opt-index="${idx}" ${disabledAttr}><span>${String.fromCharCode(65+idx)}.</span> ${opt}</button>`;
                });
                optionsContainer.innerHTML = htmlStr;

                // attach listeners to active (non-disabled) buttons
                if (userAnswers[currentIndex] === -1) {
                    document.querySelectorAll('.option-btn').forEach(btn => {
                        if (!btn.disabled) {
                            btn.addEventListener('click', optionClickHandler);
                        }
                    });
                    feedbackEl.textContent = 'select an option above';
                } else {
                    // already answered, show explanation
                    const selectedIdx = userAnswers[currentIndex];
                    const isCorrect = (selectedIdx === q.correct);
                    feedbackEl.innerHTML = isCorrect 
                        ? `✅ correct! ${q.explanation}` 
                        : `❌ nope. the correct answer is "${q.options[q.correct]}". ${q.explanation}`;
                }

                questionIndexSpan.textContent = `question ${currentIndex+1} / ${filteredQuestions.length}`;
                nextBtn.disabled = filteredQuestions.length === 0;
            }

            // option click handler
            function optionClickHandler(e) {
                const btn = e.currentTarget;
                const selectedIndex = parseInt(btn.dataset.optIndex, 10);
                const q = filteredQuestions[currentIndex];

                // record answer
                userAnswers[currentIndex] = selectedIndex;

                // re-render question to reflect correct/wrong styles
                renderQuestion();
                updateScoreAndCounters();

                // auto-show explanation
                const isCorrect = (selectedIndex === q.correct);
                feedbackEl.innerHTML = isCorrect 
                    ? `✅ correct! ${q.explanation}` 
                    : `❌ the correct answer is "${q.options[q.correct]}". ${q.explanation}`;
            }

            // next question
            function goToNext() {
                if (filteredQuestions.length === 0) return;
                // if current unanswered, maybe prevent? but we allow skip, but we'll not force answer.
                if (currentIndex < filteredQuestions.length - 1) {
                    currentIndex++;
                    renderQuestion();
                } else {
                    // end of quiz
                    quizCompleted = true;
                    const totalCorrect = recalcScore();
                    feedbackEl.innerHTML = `🏁 quiz finished! you got ${totalCorrect} out of ${filteredQuestions.length} correct.`;
                    nextBtn.disabled = true;
                }
                updateScoreAndCounters();
            }

            // reset (current era)
            function resetQuiz() {
                applyFilterAndReset(currentEra);
            }

            // era switch
            function setEra(era) {
                currentEra = era;
                eraBtns.forEach(btn => {
                    if (btn.dataset.era === era) btn.classList.add('active');
                    else btn.classList.remove('active');
                });
                applyFilterAndReset(era);
            }

            // ----- event listeners -----
            eraBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    setEra(btn.dataset.era);
                });
            });

            nextBtn.addEventListener('click', goToNext);

            resetBtn.addEventListener('click', resetQuiz);

            // initialization: all eras (active = all)
            setEra('all');
        })();