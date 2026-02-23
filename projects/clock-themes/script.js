        (function() {
            // ---------- CANVAS ANALOG CLOCK ----------
            const canvas = document.getElementById('clockCanvas');
            const ctx = canvas.getContext('2d');
            const digitalEl = document.getElementById('digitalTime');
            const meridiemEl = document.getElementById('meridiem');
            const dateEl = document.getElementById('dateDisplay');

            // ---------- THEME SYSTEM ----------
            const body = document.body;
            const themeBtns = document.querySelectorAll('.theme-btn');

            // set active theme and update UI
            function setTheme(themeName) {
                // remove all theme classes
                body.classList.remove('light-theme', 'dark-theme', 'gold-theme', 'ocean-theme');
                body.classList.add(themeName + '-theme');

                // update active button
                themeBtns.forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.theme === themeName) {
                        btn.classList.add('active');
                    }
                });
            }

            // attach click listeners to theme buttons
            themeBtns.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const theme = this.dataset.theme;
                    setTheme(theme);
                });
            });

            // ---------- CLOCK UPDATE (every second) ----------
            function updateClock() {
                const now = new Date();

                // ----- DIGITAL TIME (HH:MM:SS) with AM/PM -----
                let hours = now.getHours();
                let minutes = now.getMinutes();
                let seconds = now.getSeconds();
                const ampm = hours >= 12 ? 'PM' : 'AM';

                // convert to 12-hour format for display
                let displayHours = hours % 12;
                displayHours = displayHours === 0 ? 12 : displayHours; // 0 -> 12
                
                // pad minutes & seconds
                const minutesStr = minutes < 10 ? '0' + minutes : minutes;
                const secondsStr = seconds < 10 ? '0' + seconds : seconds;
                
                // update digital display (showing 12h format with seconds)
                digitalEl.innerText = `${displayHours}:${minutesStr}:${secondsStr}`;
                meridiemEl.innerText = ampm;

                // ----- DATE FORMAT: Weekday, DD Month YYYY -----
                const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                
                const weekday = weekdays[now.getDay()];
                const day = now.getDate();
                const month = months[now.getMonth()];
                const year = now.getFullYear();
                
                dateEl.innerText = `${weekday}, ${day} ${month} ${year}`;

                // ----- DRAW ANALOG CLOCK -----
                drawAnalogClock(now);
            }

            function drawAnalogClock(now) {
                const width = canvas.width;
                const height = canvas.height;
                const radius = width / 2;

                ctx.clearRect(0, 0, width, height);
                
                // dynamic colors based on theme (adapt to background)
                const isDark = body.classList.contains('dark-theme');
                const isGold = body.classList.contains('gold-theme');
                const isOcean = body.classList.contains('ocean-theme');
                
                // face background (transparent-ish to blend with glass)
                ctx.save();
                ctx.translate(radius, radius);
                
                // draw clock face
                ctx.beginPath();
                ctx.arc(0, 0, radius - 2, 0, 2 * Math.PI);
                ctx.fillStyle = isDark ? 'rgba(20, 40, 55, 0.65)' : (isGold ? 'rgba(255, 245, 220, 0.7)' : (isOcean ? 'rgba(210, 245, 240, 0.65)' : 'rgba(255,255,255,0.55)'));
                ctx.fill();
                ctx.shadowBlur = 15;
                ctx.shadowColor = isDark ? '#0077AA' : (isGold ? '#C6A15B' : '#0077BE');
                ctx.strokeStyle = isDark ? 'rgba(100, 220, 255, 0.6)' : (isGold ? '#BB9B6A' : (isOcean ? '#2B9B9B' : 'rgba(60, 140, 200, 0.6)'));
                ctx.lineWidth = 4;
                ctx.stroke();
                ctx.shadowBlur = 0;

                // hour markers (modern minimal)
                for (let i = 1; i <= 12; i++) {
                    const angle = (i * 30) * Math.PI / 180;
                    const x = Math.sin(angle) * (radius - 24);
                    const y = -Math.cos(angle) * (radius - 24);
                    
                    ctx.font = 'bold 18px "Inter", sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = isDark ? '#DFF6FF' : (isGold ? '#4F3A1C' : (isOcean ? '#0E6B6B' : '#164D60'));
                    ctx.shadowBlur = isDark ? 6 : 2;
                    ctx.shadowColor = isDark ? '#00C8FF' : (isGold ? '#FFD49F' : '#7FC8FF');
                    ctx.fillText(i.toString(), x, y);
                    ctx.shadowBlur = 0;
                }

                // get time components
                const hours = now.getHours();
                const minutes = now.getMinutes();
                const seconds = now.getSeconds();

                // hour hand (30° per hour, 0.5° per minute)
                const hourAngle = ((hours % 12) * 30 + minutes * 0.5) * (Math.PI / 180);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.sin(hourAngle) * (radius * 0.5), -Math.cos(hourAngle) * (radius * 0.5));
                ctx.strokeStyle = isDark ? '#D6F0FF' : (isGold ? '#6B4F32' : (isOcean ? '#0F5C5C' : '#1E5268'));
                ctx.lineWidth = 6;
                ctx.lineCap = 'round';
                ctx.shadowBlur = 8;
                ctx.shadowColor = isDark ? '#0099DD' : (isGold ? '#D8A75C' : '#0099CC');
                ctx.stroke();

                // minute hand
                const minuteAngle = (minutes * 6 + seconds * 0.1) * (Math.PI / 180);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.sin(minuteAngle) * (radius * 0.72), -Math.cos(minuteAngle) * (radius * 0.72));
                ctx.strokeStyle = isDark ? '#B2ECFF' : (isGold ? '#8F6E45' : (isOcean ? '#1A7E7E' : '#226D86'));
                ctx.lineWidth = 4;
                ctx.stroke();

                // second hand (with accent)
                const secondAngle = (seconds * 6) * (Math.PI / 180);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.sin(secondAngle) * (radius * 0.8), -Math.cos(secondAngle) * (radius * 0.8));
                ctx.strokeStyle = '#FF5E7E';
                ctx.lineWidth = 2.5;
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#FF3B6F';
                ctx.stroke();

                // center dot
                ctx.beginPath();
                ctx.arc(0, 0, 6, 0, 2 * Math.PI);
                ctx.fillStyle = isDark ? '#BBF0FF' : (isGold ? '#C99E5A' : (isOcean ? '#149999' : '#197A99'));
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.restore();
            }

            // initial call
            updateClock();
            // update every second
            setInterval(updateClock, 1000);

            // minor: add micro-interaction to location (just UI)
            // set default theme light is active, but sync with body class
            // ensure active class matches initial state (light-theme)
            // but if body already light-theme, set light button active.
            // on load, we have light-theme, so we manually set active.
            document.querySelectorAll('.theme-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.theme === 'light') {
                    btn.classList.add('active');
                }
            });
        })();