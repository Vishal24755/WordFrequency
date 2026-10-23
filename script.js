document.addEventListener('DOMContentLoaded', () => {
  const textInput = document.getElementById('textInput');
  const chkStopwords = document.getElementById('chkStopwords');
  const chkCase = document.getElementById('chkCase');
  const btnAnalyze = document.getElementById('btnAnalyze');
  const btnSample = document.getElementById('btnSample');
  const btnClear = document.getElementById('btnClear');
  const toast = document.getElementById('toast');

  const resultsSection = document.getElementById('resultsSection');
  const totalWordsEl = document.getElementById('totalWords');
  const uniqueWordsEl = document.getElementById('uniqueWords');
  const lexicalDiversityEl = document.getElementById('lexicalDiversity');
  const barChart = document.getElementById('barChart');
  const tableBody = document.getElementById('tableBody');

  const STOP_WORDS = new Set([
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'could',
    'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
    'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if',
    'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor',
    'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over',
    'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them',
    'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until',
    'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
    'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
  ]);

  function showToast(message, isError = false) {
    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.background = isError ? '#991b1b' : '#065f46';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 2500);
  }

  function analyze() {
    const rawText = textInput.value.trim();
    if (!rawText) {
      showToast('Please enter a paragraph to analyze.', true);
      resultsSection.style.display = 'none';
      return;
    }

    const caseInsensitive = chkCase.checked;
    const filterStopwords = chkStopwords.checked;

    const processedText = caseInsensitive ? rawText.toLowerCase() : rawText;
    const tokens = processedText.match(/\b[a-zA-Z0-9'’-]+\b/g) || [];

    if (tokens.length === 0) {
      showToast('No valid words found in the text.', true);
      resultsSection.style.display = 'none';
      return;
    }

    const freqMap = new Map();
    let totalCount = 0;

    for (const token of tokens) {
      const checkWord = token.toLowerCase();
      if (filterStopwords && STOP_WORDS.has(checkWord)) {
        continue;
      }
      totalCount++;
      freqMap.set(token, (freqMap.get(token) || 0) + 1);
    }

    if (freqMap.size === 0) {
      showToast('All words were filtered as stop words. Uncheck "Ignore stop words" to view them.', true);
      resultsSection.style.display = 'none';
      return;
    }

    // Sort by frequency descending
    const sorted = Array.from(freqMap.entries()).sort((a, b) => b[1] - a[1]);
    const uniqueCount = sorted.length;
    const diversity = ((uniqueCount / totalCount) * 100).toFixed(1);

    totalWordsEl.textContent = totalCount.toLocaleString();
    uniqueWordsEl.textContent = uniqueCount.toLocaleString();
    lexicalDiversityEl.textContent = `${diversity}%`;

    // Render Top 10 Bar Chart
    const top10 = sorted.slice(0, 10);
    const maxFreq = top10[0][1];

    barChart.innerHTML = '';
    top10.forEach(([word, count]) => {
      const widthPct = Math.round((count / maxFreq) * 100);
      const row = document.createElement('div');
      row.className = 'chart-row';
      row.innerHTML = `
        <span class="chart-label" title="${word}">${word}</span>
        <div class="chart-bar-bg">
          <div class="chart-bar-fill" style="width: ${widthPct}%;"></div>
        </div>
        <span class="chart-val">${count}</span>
      `;
      barChart.appendChild(row);
    });

    // Render Full Table
    tableBody.innerHTML = '';
    sorted.forEach(([word, count], idx) => {
      const pct = ((count / totalCount) * 100).toFixed(1);
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>#${idx + 1}</strong></td>
        <td><code>${word}</code></td>
        <td><strong>${count}</strong></td>
        <td>${pct}%</td>
      `;
      tableBody.appendChild(tr);
    });

    resultsSection.style.display = 'block';
    showToast(`Analyzed ${totalCount} words (${uniqueCount} unique).`);
  }

  btnAnalyze.addEventListener('click', analyze);

  btnClear.addEventListener('click', () => {
    textInput.value = '';
    resultsSection.style.display = 'none';
    showToast('Input cleared.');
  });

  btnSample.addEventListener('click', () => {
    textInput.value = `Artificial intelligence and machine learning are revolutionizing text analysis and speech processing. Text analysis helps computers understand written language, calculate word frequencies, and discover patterns. Speech processing transforms audio signals into words. Together, artificial intelligence, text analysis, and speech processing allow modern computers to communicate naturally with humans across the world.`;
    analyze();
  });
});
