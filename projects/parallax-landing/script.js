    (function() {
      // 1. Dynamic header color changer (just for fun)
      const mainHeadings = document.querySelectorAll('h1, h2');
      const colors = ['#f43f5e', '#8b5cf6', '#10b981', '#f59e0b', '#3b82f6'];

      function flashHeader() {
        // pick a random heading and give it a quick color pop
        const randomIndex = Math.floor(Math.random() * mainHeadings.length);
        const heading = mainHeadings[randomIndex];
        if (!heading) return;

        const originalColor = heading.style.color;
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        heading.style.transition = 'color 0.2s';
        heading.style.color = randomColor;
        setTimeout(() => {
          heading.style.color = ''; // revert to original (CSS)
        }, 400);
      }

      // attach to buttons
      const surpriseBtn = document.getElementById('actionBtn');
      if (surpriseBtn) {
        surpriseBtn.addEventListener('click', function(e) {
          e.preventDefault();
          flashHeader();
          // also show an alert? maybe too intrusive, but we do a tiny toast-like via console
          console.log('🎉 color flash triggered! look at headings.');
          // subtle alert alternative: change something else
          document.querySelector('.footer p').innerHTML = '🌈 magic happened! · keep scrolling';
        });
      }

      const ctaBtn = document.getElementById('ctaBtn');
      if (ctaBtn) {
        ctaBtn.addEventListener('click', function(e) {
          e.preventDefault();
          flashHeader();
          alert('✨ welcome to the parallax club (demo interaction)');
        });
      }

      const contactBtn = document.getElementById('contactBtn');
      if (contactBtn) {
        contactBtn.addEventListener('click', function(e) {
          e.preventDefault();
          flashHeader();
          // dynamic background hint
          document.body.style.backgroundColor = '#f1f5f9';
          setTimeout(() => document.body.style.backgroundColor = '', 500);
        });
      }

      // 2. minor parallax enhancement with scroll event (just for demonstration)
      // we log depth – not needed but shows we can interact
      window.addEventListener('scroll', function() {
        // you could do something fancy here, but it's optional.
        // let's update a data attribute on body for fun
        const scrollY = window.scrollY;
        const maxScroll = document.body.scrollHeight - window.innerHeight;
        const percent = (scrollY / maxScroll * 100).toFixed(0);
        // show percentage in console only every 100ms to avoid spam (throttle not needed for demo)
        // we put a small message in the footer while scrolling
        const footer = document.querySelector('.footer p');
        if (footer && !footer.innerHTML.includes('🌈')) {
          // avoid overriding too often, just first touch
        }
      });

      // 3. small hover effect on cards (already in css)
      // 4. add a tiny class to the first h1 on load to show we can
      console.log('✅ parallax landing page ready — background fixed active!');
    })();