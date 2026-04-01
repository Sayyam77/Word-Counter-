const textInput = document.getElementById("textInput");
const statusMessage = document.getElementById("statusMessage");
const excludeCommonWords = document.getElementById("excludeCommonWords");

const statFields = {
  wordCount: document.getElementById("wordCount"),
  charCount: document.getElementById("charCount"),
  charNoSpaceCount: document.getElementById("charNoSpaceCount"),
  sentenceCount: document.getElementById("sentenceCount"),
  paragraphCount: document.getElementById("paragraphCount"),
  avgWordLength: document.getElementById("avgWordLength"),
  readingTime: document.getElementById("readingTime"),
  speakingTime: document.getElementById("speakingTime"),
  longestWord: document.getElementById("longestWord"),
  uniqueWords: document.getElementById("uniqueWords"),
  lexicalDiversity: document.getElementById("lexicalDiversity"),
  heroWords: document.getElementById("heroWords"),
  heroReadingTime: document.getElementById("heroReadingTime"),
  heroCharacters: document.getElementById("heroCharacters")
};

const keywordList = document.getElementById("keywordList");

const commonWords = new Set([
  "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "for", "from",
  "had", "has", "have", "he", "her", "his", "i", "if", "in", "is", "it", "its",
  "me", "my", "of", "on", "or", "our", "she", "so", "that", "the", "their", "them",
  "there", "they", "this", "to", "was", "we", "were", "will", "with", "you", "your"
]);

const sampleText = `A strong piece of writing is more than a word count target. It has rhythm, clarity, and a sense of direction.

This mini studio helps you inspect what you wrote, clean it up quickly, and spot repetition before you publish it.`;

function getWords(text) {
  return text.trim().match(/\b[\w'-]+\b/g) || [];
}

function getSentences(text) {
  return text.trim().match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
}

function getParagraphs(text) {
  return text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
}

function formatMinutes(words, rate) {
  if (!words) {
    return "0 min";
  }

  const minutes = words / rate;

  if (minutes < 1) {
    return "<1 min";
  }

  return `${Math.ceil(minutes)} min`;
}

function toSentenceCase(text) {
  return text
    .toLowerCase()
    .replace(/(^\s*\w|[.!?]\s+\w)/g, (match) => match.toUpperCase());
}

function renderKeywords(words) {
  keywordList.innerHTML = "";

  if (!words.length) {
    keywordList.innerHTML = '<p class="empty-state">Add some text to see the most frequent words.</p>';
    return;
  }

  const counts = new Map();
  const filteredWords = words
    .map((word) => word.toLowerCase())
    .filter((word) => !excludeCommonWords.checked || !commonWords.has(word));

  filteredWords.forEach((word) => {
    counts.set(word, (counts.get(word) || 0) + 1);
  });

  const topWords = [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 8);

  if (!topWords.length) {
    keywordList.innerHTML = '<p class="empty-state">No keywords left after filtering common words.</p>';
    return;
  }

  topWords.forEach(([word, count]) => {
    const chip = document.createElement("div");
    chip.className = "keyword-chip";
    chip.innerHTML = `<strong>${word}</strong>${count}x`;
    keywordList.appendChild(chip);
  });
}

function updateStats() {
  const text = textInput.value;
  const trimmedText = text.trim();
  const words = getWords(text);
  const sentences = getSentences(text);
  const paragraphs = getParagraphs(text);
  const uniqueWords = new Set(words.map((word) => word.toLowerCase()));
  const longestWord = words.reduce((longest, word) => {
    return word.length > longest.length ? word : longest;
  }, "");
  const characterCount = text.length;
  const charactersWithoutSpaces = text.replace(/\s/g, "").length;
  const averageWordLength = words.length
    ? (words.reduce((total, word) => total + word.length, 0) / words.length).toFixed(1)
    : 0;
  const lexicalDiversity = words.length
    ? `${Math.round((uniqueWords.size / words.length) * 100)}%`
    : "0%";

  statFields.wordCount.textContent = words.length;
  statFields.charCount.textContent = characterCount;
  statFields.charNoSpaceCount.textContent = charactersWithoutSpaces;
  statFields.sentenceCount.textContent = sentences.length;
  statFields.paragraphCount.textContent = paragraphs.length;
  statFields.avgWordLength.textContent = averageWordLength;
  statFields.readingTime.textContent = formatMinutes(words.length, 200);
  statFields.speakingTime.textContent = formatMinutes(words.length, 130);
  statFields.longestWord.textContent = longestWord || "-";
  statFields.uniqueWords.textContent = uniqueWords.size;
  statFields.lexicalDiversity.textContent = lexicalDiversity;
  statFields.heroWords.textContent = words.length;
  statFields.heroReadingTime.textContent = formatMinutes(words.length, 200);
  statFields.heroCharacters.textContent = characterCount;

  renderKeywords(words);

  if (!trimmedText) {
    statusMessage.textContent = "Ready for text analysis.";
    return;
  }

  statusMessage.textContent = `${words.length} words across ${sentences.length} sentences and ${paragraphs.length} paragraph${paragraphs.length === 1 ? "" : "s"}.`;
}

document.getElementById("copyBtn").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(textInput.value);
    statusMessage.textContent = "Text copied to clipboard.";
  } catch (error) {
    statusMessage.textContent = "Clipboard copy was blocked in this browser.";
  }
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const blob = new Blob([textInput.value], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "word-counter-text.txt";
  link.click();
  URL.revokeObjectURL(url);
  statusMessage.textContent = "Text file downloaded.";
});

document.getElementById("trimBtn").addEventListener("click", () => {
  textInput.value = textInput.value
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n");
  updateStats();
  statusMessage.textContent = "Extra line spacing and edge spaces trimmed.";
});

document.getElementById("uppercaseBtn").addEventListener("click", () => {
  textInput.value = textInput.value.toUpperCase();
  updateStats();
  statusMessage.textContent = "Converted to uppercase.";
});

document.getElementById("lowercaseBtn").addEventListener("click", () => {
  textInput.value = textInput.value.toLowerCase();
  updateStats();
  statusMessage.textContent = "Converted to lowercase.";
});

document.getElementById("sentenceCaseBtn").addEventListener("click", () => {
  textInput.value = toSentenceCase(textInput.value);
  updateStats();
  statusMessage.textContent = "Converted to sentence case.";
});

document.getElementById("clearBtn").addEventListener("click", () => {
  textInput.value = "";
  updateStats();
  statusMessage.textContent = "Editor cleared.";
});

document.getElementById("sampleBtn").addEventListener("click", () => {
  textInput.value = sampleText;
  updateStats();
  statusMessage.textContent = "Sample text loaded.";
});

textInput.addEventListener("input", updateStats);
excludeCommonWords.addEventListener("change", updateStats);

updateStats();
