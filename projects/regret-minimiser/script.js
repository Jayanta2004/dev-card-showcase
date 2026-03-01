        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const decisionInput = document.getElementById('decision');
            const categorySelect = document.getElementById('category');
            const importanceSelect = document.getElementById('importance');
            const simulateBtn = document.getElementById('simulate-btn');
            const resetBtn = document.getElementById('reset-btn');
            const resultsPlaceholder = document.getElementById('results-placeholder');
            const resultsContent = document.getElementById('results-content');
            const loading = document.getElementById('loading');
            const decisionDisplay = document.getElementById('decision-display');
            const timeline = document.getElementById('timeline');
            const outcomeTitle = document.getElementById('outcome-title');
            const outcomeDescription = document.getElementById('outcome-description');
            const regretMeterFill = document.getElementById('regret-meter-fill');
            const regretValue = document.getElementById('regret-value');
            const regretTag = document.getElementById('regret-tag');
            const exampleCards = document.querySelectorAll('.example-card');
            const resultDate = document.getElementById('result-date');
            
            // Example data for simulations
            const examples = {
                career: {
                    decision: "Leaving my stable corporate marketing job to become a freelance graphic designer.",
                    category: "career",
                    importance: "high"
                },
                education: {
                    decision: "Taking out $80,000 in student loans to get a Master's degree in Data Science.",
                    category: "education",
                    importance: "high"
                },
                relationship: {
                    decision: "Moving from New York to Berlin to live with my partner who I've been in a long-distance relationship with for 2 years.",
                    category: "relationship",
                    importance: "high"
                },
                financial: {
                    decision: "Investing 60% of my savings into starting an eco-friendly product business.",
                    category: "financial",
                    importance: "high"
                }
            };
            
            // Simulation data based on categories
            const simulationTemplates = {
                career: {
                    timeline: [
                        {year: "Year 1", event: "Initial income drop as you build client portfolio. Learning curve with new tools and workflows."},
                        {year: "Year 2-3", event: "Establishing reputation in niche market. Income reaches 70% of previous corporate salary."},
                        {year: "Year 4-5", event: "Strong network leads to consistent high-value projects. Income surpasses previous corporate salary."},
                        {year: "Year 6-8", event: "Specialization in a profitable niche leads to premium rates. Consider hiring subcontractors."},
                        {year: "Year 9-10", event: "Established as expert in field. Option to create passive income through digital products or teaching."}
                    ],
                    outcomes: [
                        "This career change leads to greater personal fulfillment and autonomy. After initial financial uncertainty, you build a sustainable business that aligns with your values and provides flexibility.",
                        "The transition proves challenging with periods of financial instability. However, the personal growth and satisfaction from pursuing your passion outweigh the initial struggles.",
                        "While financially rewarding, the freelance life brings isolation and inconsistent workflow that affects work-life balance more than anticipated."
                    ],
                    regretRange: {min: 20, max: 60}
                },
                education: {
                    timeline: [
                        {year: "Year 1", event: "Intensive study period while possibly working part-time. Initial financial strain from tuition costs."},
                        {year: "Year 2", event: "Completion of degree. Job search in competitive market. Student loan repayment begins."},
                        {year: "Year 3-4", event: "Entry-level position in field. Income may not immediately justify educational investment."},
                        {year: "Year 5-7", event: "Career advancement with degree as differentiator. Salary increase accelerates debt repayment."},
                        {year: "Year 8-10", event: "Advanced to senior role. Return on investment becomes clear as earnings potential expands significantly."}
                    ],
                    outcomes: [
                        "The advanced degree opens doors to specialized roles with higher earning potential. The initial financial burden is outweighed by long-term career trajectory and job satisfaction.",
                        "While the knowledge gained is valuable, the competitive job market makes it difficult to secure roles that fully utilize the degree, extending the ROI timeline.",
                        "The networking opportunities during the program prove invaluable, leading to unexpected career paths that wouldn't have been accessible otherwise."
                    ],
                    regretRange: {min: 25, max: 70}
                },
                relationship: {
                    timeline: [
                        {year: "Year 1", event: "Cultural adjustment period. Language barriers and homesickness. Building new social circle."},
                        {year: "Year 2-3", event: "Improved language skills and cultural integration. Career transition or restart in new location."},
                        {year: "Year 4-5", event: "Relationship deepens through shared adaptation. Potential marriage or long-term commitment discussions."},
                        {year: "Year 6-8", event: "Establishing dual-career equilibrium. Potential family planning decisions. Navigating international family dynamics."},
                        {year: "Year 9-10", event: "Reflection on decision. Either strong integration into new life or consideration of returning to home country."}
                    ],
                    outcomes: [
                        "The move strengthens your relationship through shared challenges and growth. You develop a bicultural identity that enriches your personal and professional life.",
                        "While the relationship thrives, career setbacks in the new country create financial stress and personal frustration that impacts relationship dynamics.",
                        "The experience builds incredible resilience and adaptability. You discover new aspects of yourself and your partner through navigating international life together."
                    ],
                    regretRange: {min: 30, max: 80}
                },
                financial: {
                    timeline: [
                        {year: "Year 1", event: "Business launch with high initial costs. Long hours establishing operations and finding first customers."},
                        {year: "Year 2-3", event: "Critical growth phase. Either gaining market traction or struggling to find product-market fit."},
                        {year: "Year 4-5", event: "Pivot point: business either becomes sustainable or requires significant changes to survive."},
                        {year: "Year 6-8", event: "For successful ventures: scaling operations. For others: winding down or selling the business."},
                        {year: "Year 9-10", event: "Either established business with steady income or lessons learned applied to new endeavors."}
                    ],
                    outcomes: [
                        "The business succeeds beyond expectations, providing not only financial returns but also personal fulfillment from creating something meaningful.",
                        "While the business eventually fails, the skills and experience gained lead to unexpected career opportunities that justify the initial investment.",
                        "Financial stress from the business venture creates personal strain, but the resilience developed becomes a valuable asset in future endeavors."
                    ],
                    regretRange: {min: 40, max: 90}
                },
                default: {
                    timeline: [
                        {year: "Year 1-2", event: "Initial adjustment period with both challenges and opportunities emerging from your decision."},
                        {year: "Year 3-4", event: "Patterns established. Either positive momentum builds or challenges require course correction."},
                        {year: "Year 5-6", event: "Mid-point reflection. Clearer long-term implications of the decision become apparent."},
                        {year: "Year 7-8", event: "Integration of decision outcomes into your life narrative and identity."},
                        {year: "Year 9-10", event: "Mature perspective on the decision with understanding of its role in your life journey."}
                    ],
                    outcomes: [
                        "The decision proves to be a defining moment that leads to personal growth and opportunities you couldn't have anticipated.",
                        "While not without challenges, the decision aligns with your core values and contributes to a sense of authenticity in your life path.",
                        "The outcome is mixed with both gains and losses, but overall contributes to your life experience and wisdom."
                    ],
                    regretRange: {min: 10, max: 90}
                }
            };
            
            // Set up example card click events
            exampleCards.forEach(card => {
                card.addEventListener('click', function() {
                    const exampleType = this.getAttribute('data-example');
                    const example = examples[exampleType];
                    
                    decisionInput.value = example.decision;
                    categorySelect.value = example.category;
                    importanceSelect.value = example.importance;
                    
                    // Briefly highlight the selected card
                    this.style.transform = "scale(0.98)";
                    setTimeout(() => {
                        this.style.transform = "";
                    }, 200);
                });
            });
            
            // Set up simulate button
            simulateBtn.addEventListener('click', function() {
                const decision = decisionInput.value.trim();
                
                if (!decision) {
                    alert("Please describe your decision before simulating.");
                    decisionInput.focus();
                    return;
                }
                
                // Show loading state
                loading.style.display = 'block';
                resultsPlaceholder.style.display = 'none';
                resultsContent.style.display = 'none';
                
                // Simulate processing time
                setTimeout(() => {
                    runSimulation(decision);
                }, 1500);
            });
            
            // Set up reset button
            resetBtn.addEventListener('click', function() {
                decisionInput.value = '';
                categorySelect.value = 'career';
                importanceSelect.value = 'medium';
                
                resultsPlaceholder.style.display = 'flex';
                resultsContent.style.display = 'none';
                loading.style.display = 'none';
            });
            
            // Function to run the simulation
            function runSimulation(decision) {
                // Hide loading, show results
                loading.style.display = 'none';
                resultsContent.style.display = 'block';
                
                // Display the decision
                decisionDisplay.textContent = `"${decision}"`;
                
                // Get category and importance
                const category = categorySelect.value;
                const importance = importanceSelect.value;
                
                // Get appropriate template
                const template = simulationTemplates[category] || simulationTemplates.default;
                
                // Generate timeline
                timeline.innerHTML = '';
                template.timeline.forEach(item => {
                    const timelineItem = document.createElement('div');
                    timelineItem.className = 'timeline-item';
                    
                    const year = document.createElement('div');
                    year.className = 'timeline-year';
                    year.textContent = item.year;
                    
                    const event = document.createElement('div');
                    event.className = 'timeline-event';
                    event.textContent = item.event;
                    
                    timelineItem.appendChild(year);
                    timelineItem.appendChild(event);
                    timeline.appendChild(timelineItem);
                });
                
                // Generate random outcome based on importance
                const outcomeIndex = Math.floor(Math.random() * template.outcomes.length);
                outcomeDescription.textContent = template.outcomes[outcomeIndex];
                
                // Generate appropriate title based on importance
                const importanceTitles = {
                    low: "Moderate Impact Decision",
                    medium: "Significant Life Decision",
                    high: "Life-Changing Decision"
                };
                outcomeTitle.textContent = `10-Year Outcome: ${importanceTitles[importance]}`;
                
                // Calculate regret probability
                const baseRegret = template.regretRange.min + 
                                 Math.random() * (template.regretRange.max - template.regretRange.min);
                
                // Adjust based on importance
                let regretProbability = baseRegret;
                if (importance === 'low') regretProbability *= 0.7;
                if (importance === 'high') regretProbability *= 1.2;
                
                // Ensure within bounds
                regretProbability = Math.min(95, Math.max(5, Math.round(regretProbability)));
                
                // Update regret meter
                regretMeterFill.style.width = `${regretProbability}%`;
                regretValue.textContent = `Regret Probability: ${regretProbability}%`;
                
                // Update regret tag
                regretTag.innerHTML = '';
                let tagText, tagClass;
                
                if (regretProbability < 30) {
                    tagText = "LOW REGRET LIKELIHOOD";
                    tagClass = "success-tag";
                } else if (regretProbability < 60) {
                    tagText = "MODERATE REGRET LIKELIHOOD";
                    tagClass = "neutral-tag";
                } else {
                    tagText = "HIGH REGRET LIKELIHOOD";
                    tagClass = "regret-tag";
                }
                
                const tagElement = document.createElement('div');
                tagElement.textContent = tagText;
                tagElement.className = `regret-tag ${tagClass}`;
                regretTag.appendChild(tagElement);
                
                // Set future date (10 years from now)
                const futureDate = new Date();
                futureDate.setFullYear(futureDate.getFullYear() + 10);
                const dateString = futureDate.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                });
                resultDate.textContent = `Future View: ${dateString}`;
            }
            
            // Pre-load with an example
            decisionInput.value = examples.career.decision;
            categorySelect.value = examples.career.category;
            importanceSelect.value = examples.career.importance;
        });