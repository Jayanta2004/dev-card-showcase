        (function() {
            "use strict";

            // ----- DOM elements -----
            const chapters = document.querySelectorAll('.chapter');
            const bgLayers = document.querySelectorAll('.chapter-bg');
            const progressFill = document.getElementById('progressFill');
            const navDots = document.querySelectorAll('.nav-dot');

            // ----- state: current active chapter index (for dots) -----
            let activeIndex = 0;
            const chapterCount = chapters.length;

            // ----- throttling helper for rAF -----
            let ticking = false;

            // ----- update scroll progress bar & parallax + active dot -----
            function updateScroll() {
                const scrollY = window.scrollY;
                const winHeight = window.innerHeight;
                const docHeight = document.documentElement.scrollHeight - winHeight;
                const scrollPercent = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
                progressFill.style.width = scrollPercent + '%';

                // ----- determine active chapter (for nav dot) -----
                // find which chapter is most visible in viewport
                let maxVisible = 0;
                let newActiveIndex = activeIndex; // fallback

                chapters.forEach((ch, idx) => {
                    const rect = ch.getBoundingClientRect();
                    const visible = Math.min(rect.bottom, winHeight) - Math.max(rect.top, 0);
                    if (visible > maxVisible && visible > winHeight * 0.2) {
                        maxVisible = visible;
                        newActiveIndex = idx;
                    }
                });

                if (newActiveIndex !== activeIndex) {
                    activeIndex = newActiveIndex;
                    updateActiveDot(activeIndex);
                }

                // ----- parallax effect on background layers -----
                // shift each bg at different speed based on scroll & chapter position
                chapters.forEach((ch, idx) => {
                    const rect = ch.getBoundingClientRect();
                    const chapterTop = rect.top;  // relative to viewport
                    const chapterHeight = rect.height;
                    const bg = ch.querySelector('.chapter-bg');
                    if (!bg) return;

                    // calculate how far the chapter is from viewport center
                    // factor: 0 when chapter is exactly at center? we want smooth movement.
                    // formula: shift based on chapter's relative position to window.
                    // speed factor ~0.3 (slower than scroll)
                    const viewportCenter = winHeight / 2;
                    const chapterCenter = chapterTop + chapterHeight / 2;
                    const distanceFromCenter = chapterCenter - viewportCenter;

                    // translate bg vertically: max 20% of its extra height (120% => 20% overflow)
                    // map distance to a shift range [-15%, 15%] of bg height
                    const maxShift = 15; // percent of bg element height
                    const shiftPercent = (distanceFromCenter / (winHeight * 0.8)) * maxShift;
                    // clamp to avoid extreme sliding
                    const clampShift = Math.min(maxShift, Math.max(-maxShift, shiftPercent));

                    // apply as translateY in percentage (relative to bg itself)
                    bg.style.transform = `translateY(${clampShift}%)`;
                });

                ticking = false;
            }

            // ----- update active class on nav dots -----
            function updateActiveDot(index) {
                navDots.forEach((dot, i) => {
                    if (i === index) {
                        dot.classList.add('active');
                    } else {
                        dot.classList.remove('active');
                    }
                });
            }

            // ----- scroll listener with requestAnimationFrame -----
            window.addEventListener('scroll', function() {
                if (!ticking) {
                    window.requestAnimationFrame(updateScroll);
                    ticking = true;
                }
            });

            // ----- also run on resize to recalc dimensions -----
            window.addEventListener('resize', function() {
                if (!ticking) {
                    window.requestAnimationFrame(updateScroll);
                    ticking = true;
                }
            });

            // ----- nav dot click: scroll to chapter -----
            navDots.forEach((dot, idx) => {
                dot.addEventListener('click', function() {
                    chapters[idx].scrollIntoView({ behavior: 'smooth' });
                });
            });

            // ----- initial update to set correct progress and parallax & dot -----
            updateScroll();

            // optional: subtle parallax on mouse move? not needed, pure scroll

            // also ensure background layers start correctly
            // preload images / no flash
            window.addEventListener('load', function() {
                updateScroll(); // recalc after all images
            });

            // manually trigger after a tiny delay to catch any layout shift
            setTimeout(updateScroll, 150);
        })();