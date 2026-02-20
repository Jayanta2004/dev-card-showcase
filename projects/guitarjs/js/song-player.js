/**
 * GuitarJS - Song Player
 * Handles automated playback of songs.
 */

const SongPlayer = (() => {
    let isPlaying = false;
    let timeouts = [];

    // Seven Nation Army Riff (Key of E Minor) - Played on String 1 (A String/5th String) for deep sound
    // Sequence: E -> E -> G -> E -> D -> C -> B
    // Timing relative to start in ms
    // BPM approx 120. Quarter note = 500ms.
    const SEVEN_NATION_ARMY = [
        { string: 1, fret: 7, time: 0, duration: 700 }, // E (Dotted Quarter)
        { string: 1, fret: 7, time: 750, duration: 250 }, // E (Eighth)
        { string: 1, fret: 10, time: 1000, duration: 250 }, // G (Eighth)
        { string: 1, fret: 7, time: 1500, duration: 250 }, // E (Eighth)
        { string: 1, fret: 5, time: 2000, duration: 500 }, // D (Quarter)
        { string: 1, fret: 3, time: 2500, duration: 1000 }, // C (Half)
        { string: 1, fret: 2, time: 3500, duration: 1000 }  // B (Half)
    ];

    function playSong() {
        if (isPlaying) return;
        isPlaying = true;

        console.log("Starting Auto-Play: Seven Nation Army");
        const status = document.querySelector('.status');
        if (status) status.innerText = "Now Playing: Seven Nation Army";

        SEVEN_NATION_ARMY.forEach(note => {
            const timeout = setTimeout(() => {
                Fretboard.pluckString(note.string, note.fret);
            }, note.time);
            timeouts.push(timeout);
        });

        // Cleanup after song
        const totalDuration = 5000;
        const cleanupTimeout = setTimeout(() => {
            isPlaying = false;
            timeouts = [];
            if (status) status.innerText = "Song Complete. Ready to Rock.";
        }, totalDuration);
        timeouts.push(cleanupTimeout);
    }

    function stop() {
        timeouts.forEach(clearTimeout);
        timeouts = [];
        isPlaying = false;
    }

    return {
        play: playSong,
        stop
    };
})();
