        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+Enter to log sleep
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('logSleepBtn').click();
            }
            
            // Ctrl+L for quick log
            if (e.ctrlKey && e.key === 'l') {
                e.preventDefault();
                document.getElementById('quickLogBtn').click();
            }
        });