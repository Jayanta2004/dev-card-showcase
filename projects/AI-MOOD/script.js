        // Mood analysis database (local keyword analysis)
        const moodKeywords = {
            positive: [
                "happy", "joy", "excited", "great", "good", "awesome", "wonderful", 
                "fantastic", "amazing", "love", "loved", "glad", "pleased", "content",
                "optimistic", "hopeful", "energetic", "productive", "success", "achieved",
                "proud", "grateful", "thankful", "blessed", "relaxed", "calm", "peaceful",
                "fun", "enjoy", "laughter", "smile", "positive", "better", "best", "improved"
            ],
            negative: [
                "sad", "unhappy", "angry", "mad", "annoyed", "frustrated", "stressed",
                "anxious", "worried", "nervous", "scared", "afraid", "terrible", "awful",
                "horrible", "bad", "tired", "exhausted", "fatigued", "sick", "ill",
                "pain", "hurt", "disappointed", "lonely", "alone", "depressed", "down",
                "negative", "failure", "failed", "lost", "confused", "overwhelmed", "hard",
                "difficult", "struggle", "hate", "regret", "guilty", "jealous", "envy"
            ],
            neutral: [
                "okay", "fine", "alright", "normal", "regular", "usual", "meh",
                "neutral", "average", "moderate", "steady", "stable", "same"
            ]
        };

        // Emoji mapping for moods
        const moodEmojis = {
            positive: ["😊", "😄", "😁", "🤗", "🥳", "😎", "🤩"],
            neutral: ["😐", "🙂", "🤔", "😶", "😌"],
            negative: ["😔", "😟", "😠", "😢", "😞", "😩", "😫"]
        };

        // Local storage key
        const STORAGE_KEY = "aiMoodJournalEntries";

        // Get current date in YYYY-MM-DD format
        function getCurrentDate() {
            const now = new Date();
            return now.toISOString().split('T')[0];
        }

        // Format date for display
        function formatDisplayDate(dateString) {
            const options = { weekday: 'short', month: 'short', day: 'numeric' };
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', options);
        }

        // Analyze mood based on text input
        function analyzeMood(text) {
            let positiveCount = 0;
            let negativeCount = 0;
            let neutralCount = 0;
            
            // Convert text to lowercase for case-insensitive matching
            const lowerText = text.toLowerCase();
            
            // Count positive keywords
            moodKeywords.positive.forEach(keyword => {
                if (lowerText.includes(keyword)) {
                    positiveCount++;
                }
            });
            
            // Count negative keywords
            moodKeywords.negative.forEach(keyword => {
                if (lowerText.includes(keyword)) {
                    negativeCount++;
                }
            });
            
            // Count neutral keywords
            moodKeywords.neutral.forEach(keyword => {
                if (lowerText.includes(keyword)) {
                    neutralCount++;
                }
            });
            
            // Calculate mood score (0-10 scale)
            let score = 5; // Start at neutral
            
            // Adjust score based on keyword counts
            score += (positiveCount * 0.5);
            score -= (negativeCount * 0.5);
            score += (neutralCount * 0.1);
            
            // Ensure score stays within 0-10 range
            score = Math.max(0, Math.min(10, score));
            
            // Determine mood type
            let moodType;
            if (score >= 7) {
                moodType = "Positive";
            } else if (score >= 4) {
                moodType = "Neutral";
            } else {
                moodType = "Negative";
            }
            
            // Extract found keywords for display
            const foundKeywords = [];
            const allKeywords = [...moodKeywords.positive, ...moodKeywords.negative, ...moodKeywords.neutral];
            
            allKeywords.forEach(keyword => {
                if (lowerText.includes(keyword) && !foundKeywords.includes(keyword)) {
                    foundKeywords.push(keyword);
                }
            });
            
            // Limit to top 8 keywords
            const topKeywords = foundKeywords.slice(0, 8);
            
            return {
                score: score.toFixed(1),
                type: moodType,
                keywords: topKeywords,
                positiveCount,
                negativeCount,
                neutralCount
            };
        }

        // Get emoji based on mood type
        function getMoodEmoji(moodType) {
            const emojis = moodEmojis[moodType.toLowerCase()];
            return emojis[Math.floor(Math.random() * emojis.length)];
        }

        // Get mood color based on score
        function getMoodColor(score) {
            if (score >= 7) return "#68d391"; // Positive green
            if (score >= 4) return "#ecc94b"; // Neutral yellow
            return "#fc8181"; // Negative red
        }

        // Save entry to local storage
        function saveEntry(entry) {
            let entries = getEntries();
            
            // Check if entry for today already exists
            const existingIndex = entries.findIndex(e => e.date === entry.date);
            
            if (existingIndex !== -1) {
                // Replace existing entry for today
                entries[existingIndex] = entry;
            } else {
                // Add new entry
                entries.push(entry);
            }
            
            // Sort entries by date (newest first)
            entries.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Limit to last 30 entries
            if (entries.length > 30) {
                entries = entries.slice(0, 30);
            }
            
            // Save to local storage
            localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
            
            return entries;
        }

        // Get all entries from local storage
        function getEntries() {
            const entriesJson = localStorage.getItem(STORAGE_KEY);
            return entriesJson ? JSON.parse(entriesJson) : [];
        }

        // Display mood result
        function displayMoodResult(analysis, text) {
            const moodResult = document.getElementById('moodResult');
            const moodEmoji = document.getElementById('moodEmoji');
            const moodType = document.getElementById('moodType');
            const moodScore = document.getElementById('moodScore');
            const moodDescription = document.getElementById('moodDescription');
            const moodKeywords = document.getElementById('moodKeywords');
            
            // Set mood emoji
            const emoji = getMoodEmoji(analysis.type);
            moodEmoji.textContent = emoji;
            moodEmoji.style.backgroundColor = getMoodColor(analysis.score);
            
            // Set mood type and score
            moodType.textContent = analysis.type;
            moodType.style.color = getMoodColor(analysis.score);
            moodScore.textContent = analysis.score;
            
            // Set description
            let description = `Your entry was analyzed and scored ${analysis.score}/10. `;
            if (analysis.positiveCount > analysis.negativeCount) {
                description += "You used more positive than negative words.";
            } else if (analysis.negativeCount > analysis.positiveCount) {
                description += "You used more negative than positive words.";
            } else {
                description += "Your words were fairly balanced between positive and negative.";
            }
            moodDescription.textContent = description;
            
            // Display keywords
            moodKeywords.innerHTML = '';
            analysis.keywords.forEach(keyword => {
                const keywordElement = document.createElement('span');
                keywordElement.className = 'keyword';
                
                // Check if keyword is positive, negative or neutral
                if (moodKeywords.positive.includes(keyword)) {
                    keywordElement.classList.add('positive-keyword');
                } else if (moodKeywords.negative.includes(keyword)) {
                    keywordElement.classList.add('negative-keyword');
                }
                
                keywordElement.textContent = keyword;
                moodKeywords.appendChild(keywordElement);
            });
            
            // Show result container
            moodResult.style.display = 'flex';
        }

        // Render mood graph
        function renderMoodGraph(entries) {
            const moodGraph = document.getElementById('moodGraph');
            moodGraph.innerHTML = '';
            
            // Get last 7 entries for the graph
            const graphEntries = entries.slice(0, 7).reverse();
            
            if (graphEntries.length === 0) {
                moodGraph.innerHTML = '<div class="empty-state"><p>No mood data yet. Start by writing a journal entry!</p></div>';
                return;
            }
            
            // Create bars for each entry
            graphEntries.forEach(entry => {
                const barContainer = document.createElement('div');
                barContainer.className = 'graph-bar';
                
                const bar = document.createElement('div');
                bar.className = 'bar';
                bar.style.height = `${entry.score * 10}%`;
                bar.style.backgroundColor = getMoodColor(entry.score);
                
                const barLabel = document.createElement('div');
                barLabel.className = 'bar-label';
                barLabel.textContent = formatDisplayDate(entry.date);
                
                barContainer.appendChild(bar);
                barContainer.appendChild(barLabel);
                moodGraph.appendChild(barContainer);
            });
        }

        // Render history table
        function renderHistoryTable(entries) {
            const historyTable = document.getElementById('historyTable');
            
            if (entries.length === 0) {
                historyTable.innerHTML = `
                    <div class="empty-state">
                        <i class="far fa-calendar-plus"></i>
                        <h3>No Entries Yet</h3>
                        <p>Your mood history will appear here after you write your first journal entry.</p>
                    </div>
                `;
                return;
            }
            
            let tableHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Mood</th>
                            <th>Score</th>
                            <th>Preview</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            entries.forEach(entry => {
                const emoji = getMoodEmoji(entry.type);
                const preview = entry.text.length > 50 
                    ? entry.text.substring(0, 50) + '...' 
                    : entry.text;
                
                tableHTML += `
                    <tr>
                        <td>${formatDisplayDate(entry.date)}</td>
                        <td>
                            <div class="mood-entry">
                                <span class="mood-entry-emoji">${emoji}</span>
                                <span>${entry.type}</span>
                            </div>
                        </td>
                        <td>${entry.score}/10</td>
                        <td>${preview}</td>
                    </tr>
                `;
            });
            
            tableHTML += `
                    </tbody>
                </table>
            `;
            
            historyTable.innerHTML = tableHTML;
        }

        // Initialize the application
        function initApp() {
            // Load existing entries
            const entries = getEntries();
            
            // Render graph and history
            renderMoodGraph(entries);
            renderHistoryTable(entries);
            
            // Set up form submission
            const moodForm = document.getElementById('moodForm');
            const moodEntry = document.getElementById('moodEntry');
            
            moodForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const text = moodEntry.value.trim();
                
                if (text.length < 5) {
                    alert("Please write at least 5 characters about your day.");
                    return;
                }
                
                // Analyze the mood
                const analysis = analyzeMood(text);
                
                // Create entry object
                const entry = {
                    date: getCurrentDate(),
                    text: text,
                    score: analysis.score,
                    type: analysis.type,
                    positiveCount: analysis.positiveCount,
                    negativeCount: analysis.negativeCount,
                    neutralCount: analysis.neutralCount
                };
                
                // Save entry
                const updatedEntries = saveEntry(entry);
                
                // Display result
                displayMoodResult(analysis, text);
                
                // Update graph and history
                renderMoodGraph(updatedEntries);
                renderHistoryTable(updatedEntries);
                
                // Clear the textarea
                moodEntry.value = '';
                
                // Scroll to result
                document.getElementById('moodResult').scrollIntoView({ behavior: 'smooth' });
            });
            
            // Add sample data button for demonstration
            const header = document.querySelector('header');
            const demoButton = document.createElement('button');
            demoButton.innerHTML = '<i class="fas fa-magic"></i> Load Sample Data';
            demoButton.style.cssText = `
                background-color: #38a169;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-size: 0.9rem;
                cursor: pointer;
                margin-top: 10px;
                display: inline-flex;
                align-items: center;
                gap: 5px;
            `;
            demoButton.addEventListener('click', loadSampleData);
            header.appendChild(demoButton);
        }

        // Load sample data for demonstration
        function loadSampleData() {
            const sampleEntries = [
                {
                    date: getCurrentDate(),
                    text: "I had a really great day today! Work was productive and I had fun with friends in the evening.",
                    score: 8.5,
                    type: "Positive",
                    positiveCount: 4,
                    negativeCount: 0,
                    neutralCount: 1
                },
                {
                    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
                    text: "Felt a bit tired and stressed about upcoming deadlines. Could have been better.",
                    score: 4.2,
                    type: "Neutral",
                    positiveCount: 1,
                    negativeCount: 2,
                    neutralCount: 1
                },
                {
                    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0], // 2 days ago
                    text: "Absolutely awful day. Nothing went right and I felt frustrated all day long.",
                    score: 2.1,
                    type: "Negative",
                    positiveCount: 0,
                    negativeCount: 3,
                    neutralCount: 0
                },
                {
                    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], // 3 days ago
                    text: "It was an okay day. Nothing special happened, just regular routine work.",
                    score: 5.8,
                    type: "Neutral",
                    positiveCount: 0,
                    negativeCount: 0,
                    neutralCount: 3
                },
                {
                    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0], // 4 days ago
                    text: "Wonderful time with family. We laughed a lot and had amazing food together.",
                    score: 9.0,
                    type: "Positive",
                    positiveCount: 3,
                    negativeCount: 0,
                    neutralCount: 0
                }
            ];
            
            // Save sample entries
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleEntries));
            
            // Update UI
            const entries = getEntries();
            renderMoodGraph(entries);
            renderHistoryTable(entries);
            
            // Show notification
            alert("Sample data loaded! You can now see how the mood journal works.");
        }

        // Initialize the app when page loads
        document.addEventListener('DOMContentLoaded', initApp);