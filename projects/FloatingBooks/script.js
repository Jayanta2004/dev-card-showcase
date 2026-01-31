        // DOM Elements
        const floatingArea = document.getElementById('floatingArea');
        const genreButtons = document.querySelectorAll('.control-btn');
        const floatSpeedSlider = document.getElementById('floatSpeed');
        const bookSizeSlider = document.getElementById('bookSize');
        const bookInfo = document.getElementById('bookInfo');
        const bookCountElement = document.getElementById('bookCount');
        const openCountElement = document.getElementById('openCount');

        // Configuration
        let currentGenre = 'all';
        let floatSpeed = 0.5;
        let bookSizeMultiplier = 1;
        let books = [];
        let openCount = 0;
        let currentOpenBook = null;

        // Book data with titles, authors, descriptions, and genres
        const bookData = [
            {
                id: 1,
                title: "The Starless Sea",
                author: "Erin Morgenstern",
                genre: "fantasy",
                color: "#8a2be2",
                spineColor: "#6a1bb8",
                content: {
                    title: "The Starless Sea",
                    author: "Erin Morgenstern",
                    summary: "A timeless love story set in a secret underground world—a place of pirates, painters, lovers, liars, and ships that sail upon a starless sea.",
                    chapters: [
                        "The Sweetheart Sea",
                        "The King of the Wild Things",
                        "The Ballad of Simon and Eleanor",
                        "The Owl King",
                        "The Pirate and the Painter"
                    ],
                    description: "Zachary Ezra Rawlins is a graduate student in Vermont when he discovers a mysterious book hidden in the stacks. As he turns the pages, entranced by tales of lovelorn prisoners, key collectors, and nameless acolytes, he reads something strange: a story from his own childhood..."
                }
            },
            {
                id: 2,
                title: "Sapiens",
                author: "Yuval Noah Harari",
                genre: "science",
                color: "#1e90ff",
                spineColor: "#1c86ee",
                content: {
                    title: "Sapiens: A Brief History of Humankind",
                    author: "Yuval Noah Harari",
                    summary: "From a renowned historian comes a groundbreaking narrative of humanity's creation and evolution that explores the ways in which biology and history have defined us.",
                    chapters: [
                        "The Cognitive Revolution",
                        "The Agricultural Revolution",
                        "The Unification of Humankind",
                        "The Scientific Revolution"
                    ],
                    description: "One hundred thousand years ago, at least six different species of humans inhabited Earth. Yet today there is only one—homo sapiens. What happened to the others? And what may happen to us?"
                }
            },
            {
                id: 3,
                title: "Pride and Prejudice",
                author: "Jane Austen",
                genre: "fiction",
                color: "#dc143c",
                spineColor: "#b22222",
                content: {
                    title: "Pride and Prejudice",
                    author: "Jane Austen",
                    summary: "A romantic novel of manners that depicts the emotional development of protagonist Elizabeth Bennet.",
                    chapters: [
                        "Chapter 1: The Bennet Family",
                        "Chapter 2: The Arrival of Mr. Bingley",
                        "Chapter 3: The Ball at Netherfield",
                        "Chapter 4: The Proposal",
                        "Chapter 5: The Truth About Mr. Darcy"
                    ],
                    description: "The story follows the main character Elizabeth Bennet as she deals with issues of manners, upbringing, morality, education, and marriage in the society of the landed gentry of early 19th-century England."
                }
            },
            {
                id: 4,
                title: "The Silent Patient",
                author: "Alex Michaelides",
                genre: "mystery",
                color: "#2e8b57",
                spineColor: "#228b22",
                content: {
                    title: "The Silent Patient",
                    author: "Alex Michaelides",
                    summary: "A psychological thriller about a woman who shoots her husband and then stops speaking.",
                    chapters: [
                        "Part One: Theo",
                        "Part Two: Alicia",
                        "Part Three: The Truth",
                        "Epilogue"
                    ],
                    description: "Alicia Berenson's life is seemingly perfect. A famous painter married to an in-demand fashion photographer, she lives in a grand house with big windows overlooking a park in one of London's most desirable areas. One evening her husband Gabriel returns home late from a fashion shoot, and Alicia shoots him five times in the face, and then never speaks another word."
                }
            },
            {
                id: 5,
                title: "A Brief History of Time",
                author: "Stephen Hawking",
                genre: "science",
                color: "#20b2aa",
                spineColor: "#1e9c95",
                content: {
                    title: "A Brief History of Time",
                    author: "Stephen Hawking",
                    summary: "A landmark volume in science writing by one of the great minds of our time, exploring profound questions of existence.",
                    chapters: [
                        "Our Picture of the Universe",
                        "Space and Time",
                        "The Expanding Universe",
                        "The Uncertainty Principle",
                        "Elementary Particles and the Forces of Nature"
                    ],
                    description: "Was there a beginning of time? Could time run backwards? Is the universe infinite or does it have boundaries? These are just some of the questions considered in an internationally acclaimed masterpiece which begins by reviewing the great theories of the cosmos from Newton to Einstein."
                }
            },
            {
                id: 6,
                title: "The Hobbit",
                author: "J.R.R. Tolkien",
                genre: "fantasy",
                color: "#daa520",
                spineColor: "#b8860b",
                content: {
                    title: "The Hobbit",
                    author: "J.R.R. Tolkien",
                    summary: "A fantasy novel about the adventures of hobbit Bilbo Baggins in Middle-earth.",
                    chapters: [
                        "An Unexpected Party",
                        "Roast Mutton",
                        "A Short Rest",
                        "Over Hill and Under Hill",
                        "Riddles in the Dark"
                    ],
                    description: "Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely travelling further than the pantry of his hobbit-hole in Bag End. But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep to whisk him away on an adventure."
                }
            },
            {
                id: 7,
                title: "The Guns of August",
                author: "Barbara Tuchman",
                genre: "history",
                color: "#cd853f",
                spineColor: "#a0522d",
                content: {
                    title: "The Guns of August",
                    author: "Barbara Tuchman",
                    summary: "A historical account of the first month of World War I.",
                    chapters: [
                        "Plans",
                        "The Outbreak",
                        "The Battle of the Frontiers",
                        "Retreat",
                        "The Marne"
                    ],
                    description: "In this landmark account, renowned historian Barbara Tuchman re-creates the first month of World War I: thirty days in the summer of 1914 that determined the course of the conflict, the century, and ultimately our present world."
                }
            },
            {
                id: 8,
                title: "Dune",
                author: "Frank Herbert",
                genre: "science",
                color: "#b22222",
                spineColor: "#8b0000",
                content: {
                    title: "Dune",
                    author: "Frank Herbert",
                    summary: "A epic science fiction novel set in the distant future amidst a feudal interstellar society.",
                    chapters: [
                        "Book One: Dune",
                        "Book Two: Muad'Dib",
                        "Book Three: The Prophet",
                        "Appendix"
                    ],
                    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange, a drug capable of extending life and enhancing consciousness."
                }
            },
            {
                id: 9,
                title: "Murder on the Orient Express",
                author: "Agatha Christie",
                genre: "mystery",
                color: "#4682b4",
                spineColor: "#36648b",
                content: {
                    title: "Murder on the Orient Express",
                    author: "Agatha Christie",
                    summary: "A detective novel featuring the Belgian detective Hercule Poirot.",
                    chapters: [
                        "Part One: The Facts",
                        "Part Two: The Evidence",
                        "Part Three: Hercule Poirot Sits Back and Thinks"
                    ],
                    description: "Just after midnight, a snowstorm stops the Orient Express in its tracks. The luxurious train is surprisingly full for the time of the year, but by the morning it is one passenger fewer. An American tycoon lies dead in his compartment, stabbed a dozen times, his door locked from the inside."
                }
            },
            {
                id: 10,
                title: "The Great Gatsby",
                author: "F. Scott Fitzgerald",
                genre: "fiction",
                color: "#ff6347",
                spineColor: "#ee5c42",
                content: {
                    title: "The Great Gatsby",
                    author: "F. Scott Fitzgerald",
                    summary: "A novel about the American dream and the roaring twenties.",
                    chapters: [
                        "Chapter 1",
                        "Chapter 2",
                        "Chapter 3",
                        "Chapter 4",
                        "Chapter 5",
                        "Chapter 6",
                        "Chapter 7",
                        "Chapter 8",
                        "Chapter 9"
                    ],
                    description: "The Great Gatsby, F. Scott Fitzgerald's third book, stands as the supreme achievement of his career. This exemplary novel of the Jazz Age has been acclaimed by generations of readers."
                }
            },
            {
                id: 11,
                title: "A People's History",
                author: "Howard Zinn",
                genre: "history",
                color: "#5f9ea0",
                spineColor: "#4f8688",
                content: {
                    title: "A People's History of the United States",
                    author: "Howard Zinn",
                    summary: "A history book presenting American history through the eyes of common people.",
                    chapters: [
                        "Columbus, the Indians, and Human Progress",
                        "Drawing the Color Line",
                        "Persons of Mean and Vile Condition",
                        "Tyranny is Tyranny",
                        "A Kind of Revolution"
                    ],
                    description: "Known for its lively, clear prose as well as its scholarly research, A People's History of the United States is the only volume to tell America's story from the point of view of—and in the words of—America's women, factory workers, African-Americans, Native Americans, the working poor, and immigrant laborers."
                }
            },
            {
                id: 12,
                title: "Harry Potter",
                author: "J.K. Rowling",
                genre: "fantasy",
                color: "#9932cc",
                spineColor: "#7a29a3",
                content: {
                    title: "Harry Potter and the Sorcerer's Stone",
                    author: "J.K. Rowling",
                    summary: "The first novel in the Harry Potter series about a young wizard.",
                    chapters: [
                        "The Boy Who Lived",
                        "The Vanishing Glass",
                        "The Letters from No One",
                        "The Keeper of the Keys",
                        "Diagon Alley"
                    ],
                    description: "Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat at number four, Privet Drive. Addressed in green ink on yellowish parchment with a purple seal, they are swiftly confiscated by his grisly aunt and uncle."
                }
            }
        ];

        // Initialize the library
        function initLibrary() {
            createBooks();
            updateBookCount();
            startFloatingAnimation();
        }

        // Create book elements
        function createBooks() {
            floatingArea.innerHTML = '';
            books = [];
            
            const areaRect = floatingArea.getBoundingClientRect();
            const centerX = areaRect.width / 2;
            const centerY = areaRect.height / 2;
            
            bookData.forEach((book, index) => {
                if (currentGenre !== 'all' && book.genre !== currentGenre) return;
                
                // Create book element
                const bookEl = document.createElement('div');
                bookEl.className = 'book';
                bookEl.id = `book-${book.id}`;
                bookEl.dataset.bookId = book.id;
                
                // Set size based on slider
                const width = 80 + (bookSizeMultiplier * 20);
                const height = width * 1.5;
                const thickness = 15;
                
                bookEl.style.width = `${width}px`;
                bookEl.style.height = `${height}px`;
                
                // Position book in a circular arrangement
                const angle = (index / bookData.length) * Math.PI * 2;
                const radius = Math.min(areaRect.width, areaRect.height) * 0.3;
                const x = centerX + Math.cos(angle) * radius - width/2;
                const y = centerY + Math.sin(angle) * radius - height/2;
                
                bookEl.style.left = `${x}px`;
                bookEl.style.top = `${y}px`;
                
                // Create book cover
                const cover = document.createElement('div');
                cover.className = 'book-cover';
                cover.style.background = `linear-gradient(45deg, ${book.color} 0%, ${adjustColor(book.color, -30)} 100%)`;
                cover.style.boxShadow = `inset 5px 0 10px rgba(0,0,0,0.2)`;
                
                // Add title to spine
                const title = document.createElement('div');
                title.className = 'book-title';
                title.textContent = book.title;
                cover.appendChild(title);
                
                // Add author to spine
                const author = document.createElement('div');
                author.className = 'book-author';
                author.textContent = book.author;
                cover.appendChild(author);
                
                // Create spine
                const spine = document.createElement('div');
                spine.className = 'book-spine';
                spine.style.background = book.spineColor;
                
                // Create pages
                const pages = document.createElement('div');
                pages.className = 'book-pages';
                
                // Add page content
                const pageContent = document.createElement('div');
                pageContent.className = 'page-content';
                pageContent.innerHTML = `
                    <h3>${book.content.title}</h3>
                    <p><strong>Author:</strong> ${book.content.author}</p>
                    <p><strong>Summary:</strong> ${book.content.summary}</p>
                    <h4>Chapters:</h4>
                    <ul>
                        ${book.content.chapters.map(chapter => `<li>${chapter}</li>`).join('')}
                    </ul>
                    <p>${book.content.description}</p>
                `;
                
                // Add close button
                const closeBtn = document.createElement('button');
                closeBtn.className = 'close-book';
                closeBtn.innerHTML = '<i class="fas fa-times"></i>';
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    closeBook(bookEl);
                });
                
                pages.appendChild(pageContent);
                pages.appendChild(closeBtn);
                
                // Assemble book
                bookEl.appendChild(cover);
                bookEl.appendChild(spine);
                bookEl.appendChild(pages);
                
                // Add click event to open book
                bookEl.addEventListener('click', (e) => {
                    if (!bookEl.classList.contains('open')) {
                        openBook(bookEl, book);
                    }
                });
                
                floatingArea.appendChild(bookEl);
                
                // Store book object
                books.push({
                    element: bookEl,
                    id: book.id,
                    data: book,
                    x: x,
                    y: y,
                    angle: angle,
                    radius: radius,
                    floatOffset: Math.random() * Math.PI * 2,
                    floatSpeed: 0.5 + Math.random() * 1
                });
            });
        }

        // Open a book
        function openBook(bookEl, bookData) {
            // Close any currently open book
            if (currentOpenBook) {
                closeBook(currentOpenBook);
            }
            
            // Add open class to animate
            bookEl.classList.add('open');
            currentOpenBook = bookEl;
            
            // Update book info panel
            updateBookInfo(bookData);
            
            // Increment open count
            openCount++;
            openCountElement.textContent = openCount;
            
            // Add overlay to dim other books
            const overlay = document.createElement('div');
            overlay.id = 'bookOverlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.background = 'rgba(0, 0, 0, 0.7)';
            overlay.style.zIndex = '999';
            overlay.addEventListener('click', () => closeBook(bookEl));
            document.body.appendChild(overlay);
        }

        // Close a book
        function closeBook(bookEl) {
            if (!bookEl) return;
            
            bookEl.classList.remove('open');
            
            // Remove overlay
            const overlay = document.getElementById('bookOverlay');
            if (overlay) {
                overlay.remove();
            }
            
            if (currentOpenBook === bookEl) {
                currentOpenBook = null;
            }
        }

        // Update book info panel
        function updateBookInfo(bookData) {
            bookInfo.innerHTML = `
                <div class="info-title">${bookData.content.title}</div>
                <div class="info-author">by ${bookData.content.author}</div>
                <div class="info-description">${bookData.content.description}</div>
            `;
        }

        // Update book count display
        function updateBookCount() {
            const visibleBooks = currentGenre === 'all' 
                ? bookData.length 
                : bookData.filter(book => book.genre === currentGenre).length;
            bookCountElement.textContent = visibleBooks;
        }

        // Start floating animation
        function startFloatingAnimation() {
            function animate() {
                const time = Date.now() / 1000;
                const areaRect = floatingArea.getBoundingClientRect();
                const centerX = areaRect.width / 2;
                const centerY = areaRect.height / 2;
                
                books.forEach(book => {
                    // Calculate floating position
                    const floatX = Math.sin(time * book.floatSpeed * floatSpeed + book.floatOffset) * 20;
                    const floatY = Math.cos(time * book.floatSpeed * floatSpeed * 0.7 + book.floatOffset) * 15;
                    const rotation = Math.sin(time * book.floatSpeed * floatSpeed * 0.5 + book.floatOffset) * 5;
                    
                    // Update position if book is not open
                    if (!book.element.classList.contains('open')) {
                        // Gentle orbit around center
                        const orbitX = Math.cos(time * 0.2 + book.angle) * book.radius * 0.1;
                        const orbitY = Math.sin(time * 0.2 + book.angle) * book.radius * 0.1;
                        
                        const newX = centerX + Math.cos(book.angle) * book.radius - book.element.offsetWidth/2 + orbitX + floatX;
                        const newY = centerY + Math.sin(book.angle) * book.radius - book.element.offsetHeight/2 + orbitY + floatY;
                        
                        book.x = newX;
                        book.y = newY;
                        
                        book.element.style.left = `${newX}px`;
                        book.element.style.top = `${newY}px`;
                        book.element.style.transform = `rotate(${rotation}deg)`;
                    }
                });
                
                requestAnimationFrame(animate);
            }
            
            animate();
        }

        // Helper function to adjust color brightness
        function adjustColor(color, amount) {
            let usePound = false;
            
            if (color[0] === "#") {
                color = color.slice(1);
                usePound = true;
            }
            
            const num = parseInt(color, 16);
            let r = (num >> 16) + amount;
            let g = ((num >> 8) & 0x00FF) + amount;
            let b = (num & 0x0000FF) + amount;
            
            r = Math.min(Math.max(0, r), 255);
            g = Math.min(Math.max(0, g), 255);
            b = Math.min(Math.max(0, b), 255);
            
            return (usePound ? "#" : "") + (b | (g << 8) | (r << 16)).toString(16).padStart(6, '0');
        }

        // Event listeners
        genreButtons.forEach(button => {
            button.addEventListener('click', () => {
                genreButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                currentGenre = button.dataset.genre;
                createBooks();
                updateBookCount();
            });
        });

        floatSpeedSlider.addEventListener('input', () => {
            floatSpeed = parseFloat(floatSpeedSlider.value) / 5;
        });

        bookSizeSlider.addEventListener('input', () => {
            bookSizeMultiplier = parseFloat(bookSizeSlider.value) / 5;
            createBooks();
        });

        // Initialize library
        window.addEventListener('load', initLibrary);
        
        // Close book when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && currentOpenBook) {
                closeBook(currentOpenBook);
            }
        });