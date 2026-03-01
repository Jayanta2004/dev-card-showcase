const textInput = document.getElementById("textInput");
const analyzeBtn = document.getElementById("analyzeBtn");

const wordCountEl = document.getElementById("wordCount");
const sentenceCountEl = document.getElementById("sentenceCount");
const avgWordLenEl = document.getElementById("avgWordLen");
const avgSentenceLenEl = document.getElementById("avgSentenceLen");
const fleschScoreEl = document.getElementById("fleschScore");
const fkGradeEl = document.getElementById("fkGrade");
const fogIndexEl = document.getElementById("fogIndex");
const smogIndexEl = document.getElementById("smogIndex");

analyzeBtn.addEventListener("click", () => {
  const text = textInput.value.trim();
  if (!text) return;

  const words = text.match(/\b\w+\b/g) || [];
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];

  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const avgWordLen = words.reduce((a,b) => a + b.length, 0)/Math.max(wordCount,1);
  const avgSentenceLen = wordCount / Math.max(sentenceCount,1);

  // Flesch Reading Ease
  const syllables = words.reduce((a,w)=> a + countSyllables(w),0);
  const fleschScore = 206.835 - 1.015*(avgSentenceLen) - 84.6*(syllables/Math.max(wordCount,1));

  // Flesch-Kincaid Grade
  const fkGrade = 0.39*(avgSentenceLen) + 11.8*(syllables/Math.max(wordCount,1)) - 15.59;

  // Gunning Fog Index
  const complexWords = words.filter(w=>countSyllables(w)>=3).length;
  const fogIndex = 0.4*(avgSentenceLen + 100*(complexWords/Math.max(wordCount,1)));

  // SMOG Index
  const smogIndex = 1.0430 * Math.sqrt(complexWords*(30/Math.max(sentenceCount,1))) + 3.1291;

  // Update UI
  wordCountEl.textContent = wordCount;
  sentenceCountEl.textContent = sentenceCount;
  avgWordLenEl.textContent = avgWordLen.toFixed(2);
  avgSentenceLenEl.textContent = avgSentenceLen.toFixed(2);
  fleschScoreEl.textContent = fleschScore.toFixed(2);
  fkGradeEl.textContent = fkGrade.toFixed(2);
  fogIndexEl.textContent = fogIndex.toFixed(2);
  smogIndexEl.textContent = smogIndex.toFixed(2);
});

// Simple syllable counter (approx)
function countSyllables(word){
  word = word.toLowerCase();
  if(word.length <= 3) return 1;
  const syl = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
                  .replace(/^y/, '')
                  .match(/[aeiouy]{1,2}/g);
  return syl ? syl.length : 1;
}