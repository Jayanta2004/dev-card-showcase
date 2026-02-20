document.addEventListener('DOMContentLoaded', function() {
    Tracker.init();
    Predictor.init();
    UI.init();

    console.log('MindTrace initialized successfully');
});

window.addEventListener('beforeunload', function() {
    Tracker.saveSession();
});
