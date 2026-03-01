// AI logic for wallpaper selection and mood analysis
// ...existing code...
class WallpaperAI {
  constructor(gallery) {
    this.gallery = gallery;
  }
  analyzeMood(mood, history) {
    // ...existing code...
    let moodCount = {};
    history.forEach(h => {
      const img = this.gallery.find(g => g.url === h.url);
      if (img) {
        moodCount[img.mood] = (moodCount[img.mood] || 0) + 1;
      }
    });
    let mostUsedMood = Object.keys(moodCount).reduce((a,b) => moodCount[a] > moodCount[b] ? a : b, 'happy');
    if (mood === mostUsedMood) {
      return 'You seem to prefer wallpapers matching your current mood.';
    } else {
      return 'Try a wallpaper for a different mood to boost your spirits!';
    }
  }
  recommendWallpaper(mood, timeOfDay) {
    // ...existing code...
    const filtered = this.gallery.filter(img => img.mood === mood && img.time === timeOfDay);
    if (filtered.length > 0) return filtered[0].url;
    // fallback
    const fallback = this.gallery.filter(img => img.mood === mood);
    return fallback.length > 0 ? fallback[0].url : this.gallery[0].url;
  }
}

chrome.storage.local.get(['gallery', 'history'], (data) => {
  const ai = new WallpaperAI(data.gallery || []);
  const mood = 'happy'; // Example, replace with actual mood
  const timeOfDay = 'morning'; // Example, replace with actual time
  const analysis = ai.analyzeMood(mood, data.history || []);
  const recommendation = ai.recommendWallpaper(mood, timeOfDay);
  // Display analysis and recommendation in popup or log
  console.log(analysis, recommendation);
});
