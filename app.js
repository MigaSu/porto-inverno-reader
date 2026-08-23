
(function() {
  const data = window.PORTO_DATA || { summaries: [], characters: [], transcripts: [], feedbacks: [] };

  let activeTab = 'games';
  let activeStoryline = 'all';
  let activeTranscriptStoryline = 'all';
  let activeCharStatus = 'all';
  let activeCharFaction = 'all';
  let activeFeedbackChar = 'all';
  let currentReaderIndex = -1;
  let currentTranscriptIndex = -1;
  let currentFeedbackIndex = -1;
  let searchQuery = '';
  let transcriptSearchQuery = '';

  // Elements
  const navLinks = document.querySelectorAll('.nav-link');
  const viewPanels = document.querySelectorAll('.view-panel');
  const viewGames = document.getElementById('view-games');
  const viewReader = document.getElementById('view-reader');
  const viewTranscripts = document.getElementById('view-transcripts');
  const viewTranscriptReader = document.getElementById('view-transcript-reader');
  const viewFeedbacks = document.getElementById('view-feedbacks');
  const viewFeedbackReader = document.getElementById('view-feedback-reader');
  const viewCharacters = document.getElementById('view-characters');

  const gamesCountEl = document.getElementById('gamesCount');
  const transcriptsCountEl = document.getElementById('transcriptsCount');
  const charsCountEl = document.getElementById('charsCount');
  const feedbacksCountEl = document.getElementById('feedbacksCount');
  const appSearch = document.getElementById('appSearch');
  const sidebar = document.getElementById('appSidebar');
  const mobileToggle = document.getElementById('mobileToggle');

  // Games View Elements
  const gamesGrid = document.getElementById('gamesGrid');
  const storylineControls = document.getElementById('storylineControls');

  // Reader View Elements
  const btnBackToGames = document.getElementById('btnBackToGames');
  const btnBackBottom = document.getElementById('btnBackBottom');
  const btnOpenTranscript = document.getElementById('btnOpenTranscript');
  const readerCategory = document.getElementById('readerCategory');
  const readerDate = document.getElementById('readerDate');
  const readerRealDate = document.getElementById('readerRealDate');
  const readerReadTime = document.getElementById('readerReadTime');
  const readerTitle = document.getElementById('readerTitle');
  const readerThesis = document.getElementById('readerThesis');
  const readerBody = document.getElementById('readerBody');
  const btnPrevGame = document.getElementById('btnPrevGame');
  const btnNextGame = document.getElementById('btnNextGame');
  const btnFontSerif = document.getElementById('btnFontSerif');
  const btnFontSans = document.getElementById('btnFontSans');
  const btnSizeMinus = document.getElementById('btnSizeMinus');
  const btnSizePlus = document.getElementById('btnSizePlus');
  const btnCopyChapter = document.getElementById('btnCopyChapter');
  const progressBar = document.getElementById('readingProgress');

  // Transcripts View Elements
  const transcriptsGrid = document.getElementById('transcriptsGrid');
  const transcriptStorylineControls = document.getElementById('transcriptStorylineControls');
  const btnBackToTranscripts = document.getElementById('btnBackToTranscripts');
  const btnBackToTranscriptsBottom = document.getElementById('btnBackToTranscriptsBottom');
  const btnOpenSummaryFromTranscript = document.getElementById('btnOpenSummaryFromTranscript');
  const btnCopyFullTranscript = document.getElementById('btnCopyFullTranscript');
  const transcriptTitle = document.getElementById('transcriptTitle');
  const transcriptMetaDate = document.getElementById('transcriptMetaDate');
  const transcriptMetaLines = document.getElementById('transcriptMetaLines');
  const transcriptMetaSize = document.getElementById('transcriptMetaSize');
  const transcriptBody = document.getElementById('transcriptBody');
  const transcriptSearchInput = document.getElementById('transcriptSearchInput');

  // Feedback (ОС) View Elements
  const feedbacksGrid = document.getElementById('feedbacksGrid');
  const feedbackCharControls = document.getElementById('feedbackCharControls');
  const btnBackToFeedbacks = document.getElementById('btnBackToFeedbacks');
  const btnBackToFeedbacksBottom = document.getElementById('btnBackToFeedbacksBottom');
  const feedbackReaderCategory = document.getElementById('feedbackReaderCategory');
  const feedbackReaderReadTime = document.getElementById('feedbackReaderReadTime');
  const feedbackReaderTitle = document.getElementById('feedbackReaderTitle');
  const feedbackReaderThesis = document.getElementById('feedbackReaderThesis');
  const feedbackReaderBody = document.getElementById('feedbackReaderBody');
  const btnPrevFeedback = document.getElementById('btnPrevFeedback');
  const btnNextFeedback = document.getElementById('btnNextFeedback');
  const btnCopyFeedbackDoc = document.getElementById('btnCopyFeedbackDoc');

  // Characters View Elements
  const charactersGrid = document.getElementById('charactersGrid');
  const statusControls = document.getElementById('statusControls');
  const factionControls = document.getElementById('factionControls');

  // Modal Elements
  const charModal = document.getElementById('charModal');
  const modalClose = document.getElementById('modalClose');
  const modalAvatar = document.getElementById('modalAvatar');
  const modalName = document.getElementById('modalName');
  const modalRole = document.getElementById('modalRole');
  const modalStatus = document.getElementById('modalStatus');
  const modalFaction = document.getElementById('modalFaction');
  const modalBio = document.getElementById('modalBio');
  const modalRelationsWrap = document.getElementById('modalRelationsWrap');
  const modalRelationsList = document.getElementById('modalRelationsList');

  // Theme Elements
  const themeBtns = document.querySelectorAll('.theme-btn');
  const toast = document.getElementById('appToast');

  // Update Badges
  if (gamesCountEl) gamesCountEl.textContent = data.summaries ? data.summaries.length : 25;
  if (transcriptsCountEl) transcriptsCountEl.textContent = data.transcripts ? data.transcripts.length : 25;
  if (charsCountEl) charsCountEl.textContent = data.characters ? data.characters.length : 59;
  if (feedbacksCountEl) feedbacksCountEl.textContent = data.feedbacks ? data.feedbacks.length : 41;

  // Reading progress tracking
  window.addEventListener('scroll', () => {
    if (activeTab === 'reader' || activeTab === 'transcript-reader' || activeTab === 'feedback-reader') {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = (window.scrollY / (docHeight || 1)) * 100;
      if (progressBar) progressBar.style.width = Math.min(100, Math.max(0, scrolled)) + '%';
    }
  });

  // Markdown Parser
  function parseMarkdown(md) {
    if (!md) return '';
    let text = md.replace(/^#\s+[^\n]+\n+/, '');

    return text.split(/\n\s*\n/).map(p => {
      let t = p.trim();
      if (!t) return '';
      if (t.startsWith('> ')) {
        return '<blockquote>' + formatInline(t.replace(/^>\s+/, '')) + '</blockquote>';
      }
      if (t.startsWith('## ') || t.startsWith('### ')) {
        return '<h3 style="font-size: 1.3rem; margin: 1.8rem 0 0.8rem 0; font-weight: 600; color: var(--text-primary);">' + formatInline(t.replace(/^#+\s+/, '')) + '</h3>';
      }
      return '<p>' + formatInline(t) + '</p>';
    }).join('');
  }

  function formatInline(str) {
    const codeRegex = new RegExp(String.fromCharCode(96) + '([^' + String.fromCharCode(96) + ']+)' + String.fromCharCode(96), 'g');
    return str
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(codeRegex, '<code style="background: var(--bg-input); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.85em;">$1</code>');
  }

  // Navigation Logic
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const tab = link.getAttribute('data-tab');
      switchTab(tab);
      if (window.innerWidth <= 900 && sidebar) sidebar.classList.remove('open');
    });
  });

  function switchTab(tabKey) {
    activeTab = tabKey;
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-tab') === tabKey);
    });

    viewPanels.forEach(p => p.classList.remove('active'));

    if (tabKey === 'games') {
      if (viewGames) viewGames.classList.add('active');
    } else if (tabKey === 'reader') {
      if (viewReader) viewReader.classList.add('active');
    } else if (tabKey === 'transcripts') {
      if (viewTranscripts) viewTranscripts.classList.add('active');
      renderTranscriptsGrid();
    } else if (tabKey === 'transcript-reader') {
      if (viewTranscriptReader) viewTranscriptReader.classList.add('active');
    } else if (tabKey === 'player-notes') {
      if (viewFeedbacks) viewFeedbacks.classList.add('active');
      renderFeedbacksGrid();
    } else if (tabKey === 'feedback-reader') {
      if (viewFeedbackReader) viewFeedbackReader.classList.add('active');
    } else if (tabKey === 'characters') {
      if (viewCharacters) viewCharacters.classList.add('active');
      renderCharacters();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.switchTab = switchTab;

  // Search Logic
  if (appSearch) {
    appSearch.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      if (activeTab === 'games' || activeTab === 'reader') {
        if (activeTab === 'reader') switchTab('games');
        renderGamesGrid();
      } else if (activeTab === 'transcripts' || activeTab === 'transcript-reader') {
        if (activeTab === 'transcript-reader') switchTab('transcripts');
        renderTranscriptsGrid();
      } else if (activeTab === 'player-notes' || activeTab === 'feedback-reader') {
        if (activeTab === 'feedback-reader') switchTab('player-notes');
        renderFeedbacksGrid();
      } else if (activeTab === 'characters') {
        renderCharacters();
      }
    });

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        appSearch.focus();
      } else if (e.key === 'Escape') {
        if (charModal && charModal.style.display === 'flex') {
          charModal.style.display = 'none';
        }
      }
    });
  }

  // Mobile Toggle
  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Theme Switcher
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', theme);
      themeBtns.forEach(b => b.classList.toggle('active', b === btn));
      localStorage.setItem('porto_theme', theme);
    });
  });

  const savedTheme = localStorage.getItem('porto_theme') || 'dark';
  if (savedTheme !== 'dark') {
    document.documentElement.setAttribute('data-theme', savedTheme);
    themeBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-theme') === savedTheme));
  }

  function matchStoryFilter(filter, category, branch) {
    if (filter === 'all') return true;
    if (filter === 'Соло') {
      return (category && category.toLowerCase().includes('соло')) || (branch && branch.toLowerCase().includes('соло'));
    }
    return branch === filter || category === filter;
  }

  // Render Games Grid
  function renderGamesGrid() {
    if (!gamesGrid) return;
    gamesGrid.innerHTML = '';

    const filtered = data.summaries.filter(item => {
      const matchStoryline = matchStoryFilter(activeStoryline, item.category, item.branch);
      const matchSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery) || 
        item.thesis.toLowerCase().includes(searchQuery) ||
        item.gameDate.toLowerCase().includes(searchQuery) ||
        item.realDate.toLowerCase().includes(searchQuery) ||
        item.content.toLowerCase().includes(searchQuery);
      return matchStoryline && matchSearch;
    });

    if (filtered.length === 0) {
      gamesGrid.innerHTML = '<div style="grid-column: 1/-1; padding: 4rem 1rem; text-align: center; color: var(--text-tertiary);">Сессии по заданным критериям не найдены</div>';
      return;
    }

    filtered.forEach(item => {
      const actualIdx = data.summaries.findIndex(s => s.id === item.id);
      const card = document.createElement('div');
      card.className = 'game-card';

      let tagClass = 'tag-solo';
      if (item.category.includes('Молли')) tagClass = 'tag-molly';
      else if (item.category.includes('Эйден') || item.category.includes('Малкольм')) tagClass = 'tag-aiden';

      card.innerHTML = `
        <div>
          <div class="game-meta-row">
            <span class="game-date-pill">📅 ${item.gameDate || item.date}</span>
            <span class="game-branch-tag ${tagClass}">${item.category}</span>
          </div>
          <h3 class="game-title">${item.title}</h3>
          <p class="game-thesis">${item.thesis}</p>
        </div>
        <div class="game-footer-row">
          <span class="game-real-date">🎮 Игра: ${item.realDate}</span>
          <span class="game-action-link">Читать главу →</span>
        </div>
      `;

      card.addEventListener('click', () => {
        openReader(actualIdx);
      });

      gamesGrid.appendChild(card);
    });
  }

  // Reader Open
  function openReader(index) {
    currentReaderIndex = index;
    const game = data.summaries[index];
    if (!game) return;

    switchTab('reader');

    let tagClass = 'tag-solo';
    if (game.category.includes('Молли')) tagClass = 'tag-molly';
    else if (game.category.includes('Эйден') || game.category.includes('Малкольм')) tagClass = 'tag-aiden';

    if (readerCategory) {
      readerCategory.textContent = game.category;
      readerCategory.className = 'game-branch-tag ' + tagClass;
    }
    if (readerDate) readerDate.textContent = '📅 ' + (game.gameDate || game.date);
    if (readerRealDate) readerRealDate.textContent = '🎮 Дата сессии: ' + (game.realDate || '1931');
    if (readerReadTime) readerReadTime.textContent = '⏳ ' + (game.readTime || '5 мин чтения');
    if (readerTitle) readerTitle.textContent = game.title;
    if (readerThesis) readerThesis.textContent = '«' + game.thesis + '»';
    if (readerBody) readerBody.innerHTML = parseMarkdown(game.content);

    if (btnPrevGame) btnPrevGame.disabled = index <= 0;
    if (btnNextGame) btnNextGame.disabled = index >= data.summaries.length - 1;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.openReader = openReader;

  if (btnBackToGames) btnBackToGames.addEventListener('click', () => switchTab('games'));
  if (btnBackBottom) btnBackBottom.addEventListener('click', () => switchTab('games'));

  if (btnOpenTranscript) {
    btnOpenTranscript.addEventListener('click', () => {
      const game = data.summaries[currentReaderIndex];
      if (game) {
        const tIdx = data.transcripts.findIndex(t => t.id === game.id);
        if (tIdx >= 0) openTranscriptReader(tIdx);
        else showToast('Транскрибация для этой сессии не найдена');
      }
    });
  }

  if (btnPrevGame) {
    btnPrevGame.addEventListener('click', () => {
      if (currentReaderIndex > 0) openReader(currentReaderIndex - 1);
    });
  }

  if (btnNextGame) {
    btnNextGame.addEventListener('click', () => {
      if (currentReaderIndex < data.summaries.length - 1) openReader(currentReaderIndex + 1);
    });
  }

  // Reader Typography Controls
  let currentReaderSize = 1.08;
  if (btnFontSerif && btnFontSans) {
    btnFontSerif.addEventListener('click', () => {
      document.documentElement.style.setProperty('--font-reader', 'var(--font-serif)');
      btnFontSerif.classList.add('active');
      btnFontSans.classList.remove('active');
    });
    btnFontSans.addEventListener('click', () => {
      document.documentElement.style.setProperty('--font-reader', 'var(--font-sans)');
      btnFontSans.classList.add('active');
      btnFontSerif.classList.remove('active');
    });
  }

  if (btnSizePlus) {
    btnSizePlus.addEventListener('click', () => {
      if (currentReaderSize < 1.35) {
        currentReaderSize += 0.06;
        document.documentElement.style.setProperty('--reader-size', currentReaderSize + 'rem');
      }
    });
  }

  if (btnSizeMinus) {
    btnSizeMinus.addEventListener('click', () => {
      if (currentReaderSize > 0.9) {
        currentReaderSize -= 0.06;
        document.documentElement.style.setProperty('--reader-size', currentReaderSize + 'rem');
      }
    });
  }

  if (btnCopyChapter) {
    btnCopyChapter.addEventListener('click', () => {
      const game = data.summaries[currentReaderIndex];
      if (game) {
        navigator.clipboard.writeText(game.content).then(() => {
          showToast('✓ Текст главы скопирован в буфер');
        });
      }
    });
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('visible');
    setTimeout(() => {
      toast.classList.remove('visible');
    }, 2400);
  }

  if (storylineControls) {
    storylineControls.addEventListener('click', (e) => {
      if (e.target.classList.contains('segment-btn')) {
        storylineControls.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeStoryline = e.target.getAttribute('data-filter');
        renderGamesGrid();
      }
    });
  }

  // ================= TRANSCRIPTS LOGIC =================
  function renderTranscriptsGrid() {
    if (!transcriptsGrid) return;
    transcriptsGrid.innerHTML = '';

    const filtered = data.transcripts.filter(item => {
      const matchStoryline = matchStoryFilter(activeTranscriptStoryline, item.category, item.branch);
      const matchSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery) || 
        item.id.toLowerCase().includes(searchQuery) ||
        item.gameDate.toLowerCase().includes(searchQuery) ||
        item.realDate.toLowerCase().includes(searchQuery);
      return matchStoryline && matchSearch;
    });

    if (filtered.length === 0) {
      transcriptsGrid.innerHTML = '<div style="grid-column: 1/-1; padding: 4rem 1rem; text-align: center; color: var(--text-tertiary);">Транскрибации не найдены</div>';
      return;
    }

    filtered.forEach(item => {
      const actualIdx = data.transcripts.findIndex(t => t.id === item.id);
      const card = document.createElement('div');
      card.className = 'transcript-card';

      let tagClass = 'tag-solo';
      if (item.category.includes('Молли')) tagClass = 'tag-molly';
      else if (item.category.includes('Эйден') || item.category.includes('Малкольм')) tagClass = 'tag-aiden';

      card.innerHTML = `
        <div>
          <div class="transcript-meta-row">
            <span class="game-date-pill">📅 ${item.gameDate}</span>
            <span class="game-branch-tag ${tagClass}">${item.category}</span>
          </div>
          <h3 class="transcript-title">${item.title}</h3>
          <p class="transcript-info-line">📜 Файл: ${item.id}.txt</p>
        </div>
        <div class="transcript-footer">
          <span>📊 ${item.linesCount} строк (${item.sizeKb})</span>
          <span class="transcript-view-btn">Открыть стенограмму →</span>
        </div>
      `;

      card.addEventListener('click', () => {
        openTranscriptReader(actualIdx);
      });

      transcriptsGrid.appendChild(card);
    });
  }

  function formatTranscript(text, filterQuery = '') {
    if (!text) return '<p style="color: var(--text-tertiary);">Текст транскрибации пуст</p>';

    const lines = text.split(/\r?\n/);
    let html = '';
    let currentSpeaker = '';
    let currentEntryLines = [];
    let isGM = false;

    function flushEntry() {
      if (currentEntryLines.length > 0) {
        const cls = isGM ? 'speaker-gm' : 'speaker-player';
        html += '<div class="transcript-entry ' + cls + '">';
        if (currentSpeaker) {
          html += '<div class="entry-speaker">🗣️ ' + escapeHtml(currentSpeaker) + '</div>';
        }
        currentEntryLines.forEach(l => {
          let lineHtml = escapeHtml(l);
          lineHtml = lineHtml.replace(/\[(\d{2}:\d{2}:\d{2})\]/g, '<span class="timestamp-pill">$1</span>');

          if (filterQuery) {
            const re = new RegExp('(' + escapeRegex(filterQuery) + ')', 'gi');
            lineHtml = lineHtml.replace(re, '<span class="hl-match">$1</span>');
          }

          html += '<div class="entry-text-line">' + lineHtml + '</div>';
        });
        html += '</div>';
        currentEntryLines = [];
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.endsWith(':') && !line.startsWith('[')) {
        flushEntry();
        currentSpeaker = line.replace(/:$/, '');
        isGM = currentSpeaker.toLowerCase().includes('михаил') || currentSpeaker.toLowerCase().includes('мастер');
      } else {
        currentEntryLines.push(line);
      }
    }
    flushEntry();

    return html;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeRegex(str) {
    return str.split('').map(function(c) {
      if ('[]{}()*+?.,\^$|#'.indexOf(c) !== -1) return '\\' + c;
      return c;
    }).join('');
  }

  function openTranscriptReader(index) {
    currentTranscriptIndex = index;
    const t = data.transcripts[index];
    if (!t) return;

    switchTab('transcript-reader');

    if (transcriptTitle) transcriptTitle.textContent = t.title + ' (' + t.id + ')';
    if (transcriptMetaDate) transcriptMetaDate.textContent = '📅 ' + t.gameDate + ' (Сессия: ' + t.realDate + ')';
    if (transcriptMetaLines) transcriptMetaLines.textContent = '📊 ' + t.linesCount + ' строк';
    if (transcriptMetaSize) transcriptMetaSize.textContent = '💾 ' + t.sizeKb;

    if (transcriptSearchInput) transcriptSearchInput.value = '';
    transcriptSearchQuery = '';

    if (transcriptBody) {
      transcriptBody.innerHTML = formatTranscript(t.rawText);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (transcriptSearchInput) {
    transcriptSearchInput.addEventListener('input', (e) => {
      transcriptSearchQuery = e.target.value.trim();
      const t = data.transcripts[currentTranscriptIndex];
      if (t && transcriptBody) {
        transcriptBody.innerHTML = formatTranscript(t.rawText, transcriptSearchQuery);
      }
    });
  }

  if (btnBackToTranscripts) btnBackToTranscripts.addEventListener('click', () => switchTab('transcripts'));
  if (btnBackToTranscriptsBottom) btnBackToTranscriptsBottom.addEventListener('click', () => switchTab('transcripts'));

  if (btnOpenSummaryFromTranscript) {
    btnOpenSummaryFromTranscript.addEventListener('click', () => {
      const t = data.transcripts[currentTranscriptIndex];
      if (t) {
        const sIdx = data.summaries.findIndex(s => s.id === t.id);
        if (sIdx >= 0) openReader(sIdx);
        else showToast('Саммари для этой сессии не найдено');
      }
    });
  }

  if (btnCopyFullTranscript) {
    btnCopyFullTranscript.addEventListener('click', () => {
      const t = data.transcripts[currentTranscriptIndex];
      if (t) {
        navigator.clipboard.writeText(t.rawText).then(() => {
          showToast('✓ Полный текст транскрибации скопирован!');
        });
      }
    });
  }

  if (transcriptStorylineControls) {
    transcriptStorylineControls.addEventListener('click', (e) => {
      if (e.target.classList.contains('segment-btn')) {
        transcriptStorylineControls.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeTranscriptStoryline = e.target.getAttribute('data-filter');
        renderTranscriptsGrid();
      }
    });
  }

  // ================= FEEDBACK (ОС) GRID & READER =================
  function renderFeedbacksGrid() {
    if (!feedbacksGrid) return;
    feedbacksGrid.innerHTML = '';

    const filtered = data.feedbacks.filter(item => {
      const matchChar = activeFeedbackChar === 'all' || item.characterKey === activeFeedbackChar;
      const matchSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery) || 
        item.characterName.toLowerCase().includes(searchQuery) || 
        item.excerpt.toLowerCase().includes(searchQuery) ||
        item.content.toLowerCase().includes(searchQuery);
      return matchChar && matchSearch;
    });

    if (filtered.length === 0) {
      feedbacksGrid.innerHTML = '<div style="grid-column: 1/-1; padding: 4rem 1rem; text-align: center; color: var(--text-tertiary);">Записи обратной связи не найдены</div>';
      return;
    }

    filtered.forEach(item => {
      const actualIdx = data.feedbacks.findIndex(f => f.id === item.id);
      const card = document.createElement('div');
      card.className = 'game-card';

      card.innerHTML = `
        <div>
          <div class="game-meta-row">
            <span class="game-date-pill">⏳ ${item.readTime}</span>
            <span class="game-branch-tag ${item.badgeClass}">${item.characterName}</span>
          </div>
          <h3 class="game-title">${item.title}</h3>
          <p class="game-thesis">${item.excerpt}</p>
        </div>
        <div class="game-footer-row">
          <span class="game-real-date">📊 ${item.wordCount} слов</span>
          <span class="game-action-link">Читать запись →</span>
        </div>
      `;

      card.addEventListener('click', () => {
        openFeedbackReader(actualIdx);
      });

      feedbacksGrid.appendChild(card);
    });
  }

  function openFeedbackReader(index) {
    currentFeedbackIndex = index;
    const fb = data.feedbacks[index];
    if (!fb) return;

    switchTab('feedback-reader');

    if (feedbackReaderCategory) {
      feedbackReaderCategory.textContent = fb.characterName;
      feedbackReaderCategory.className = 'game-branch-tag ' + fb.badgeClass;
    }
    if (feedbackReaderReadTime) feedbackReaderReadTime.textContent = '⏳ ' + fb.readTime + ' • ' + fb.wordCount + ' слов';
    if (feedbackReaderTitle) feedbackReaderTitle.textContent = fb.title;
    if (feedbackReaderThesis) feedbackReaderThesis.textContent = '«' + fb.role + '»';

    // Format paragraphs
    const paragraphs = fb.content.split(/\r?\n\s*\r?\n/).filter(Boolean);
    let bodyHtml = '';
    paragraphs.forEach(p => {
      let pText = escapeHtml(p.trim());
      pText = pText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      bodyHtml += '<p>' + pText.replace(/\n/g, '<br>') + '</p>';
    });

    if (feedbackReaderBody) feedbackReaderBody.innerHTML = bodyHtml;

    if (btnPrevFeedback) btnPrevFeedback.disabled = index <= 0;
    if (btnNextFeedback) btnNextFeedback.disabled = index >= data.feedbacks.length - 1;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  window.openFeedbackReader = openFeedbackReader;

  if (btnBackToFeedbacks) btnBackToFeedbacks.addEventListener('click', () => switchTab('player-notes'));
  if (btnBackToFeedbacksBottom) btnBackToFeedbacksBottom.addEventListener('click', () => switchTab('player-notes'));

  if (btnPrevFeedback) {
    btnPrevFeedback.addEventListener('click', () => {
      if (currentFeedbackIndex > 0) openFeedbackReader(currentFeedbackIndex - 1);
    });
  }

  if (btnNextFeedback) {
    btnNextFeedback.addEventListener('click', () => {
      if (currentFeedbackIndex < data.feedbacks.length - 1) openFeedbackReader(currentFeedbackIndex + 1);
    });
  }

  if (btnCopyFeedbackDoc) {
    btnCopyFeedbackDoc.addEventListener('click', () => {
      const fb = data.feedbacks[currentFeedbackIndex];
      if (fb) {
        navigator.clipboard.writeText(`⭐ ДНЕВНИК ОС: ${fb.characterName} (${fb.title})

${fb.content}`).then(() => {
          showToast('✓ Текст записи скопирован в буфер');
        });
      }
    });
  }

  if (feedbackCharControls) {
    feedbackCharControls.addEventListener('click', (e) => {
      if (e.target.classList.contains('segment-btn')) {
        feedbackCharControls.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeFeedbackChar = e.target.getAttribute('data-char');
        renderFeedbacksGrid();
      }
    });
  }

  // ================= CHARACTERS LOGIC =================
  function renderCharacters() {
    if (!charactersGrid) return;
    charactersGrid.innerHTML = '';

    const filtered = data.characters.filter(char => {
      const matchStatus = activeCharStatus === 'all' || char.status === activeCharStatus;
      const matchFaction = activeCharFaction === 'all' || char.faction === activeCharFaction;
      const matchSearch = !searchQuery || 
        char.name.toLowerCase().includes(searchQuery) || 
        char.role.toLowerCase().includes(searchQuery) ||
        char.bio.toLowerCase().includes(searchQuery);
      return matchStatus && matchFaction && matchSearch;
    });

    if (filtered.length === 0) {
      charactersGrid.innerHTML = '<div style="grid-column: 1/-1; padding: 4rem 1rem; text-align: center; color: var(--text-tertiary);">Персонажи не найдены</div>';
      return;
    }

    filtered.forEach(char => {
      const card = document.createElement('div');
      card.className = 'character-card';

      let statusClass = 'status-alive';
      if (char.status === 'Погиб') statusClass = 'status-dead';
      else if (char.status === 'Пропал' || char.status === 'Ранен' || char.status === 'В бегах') statusClass = 'status-warn';

      const initial = char.name.charAt(0).toUpperCase();

      card.innerHTML = `
        <div>
          <div class="char-header">
            <div class="char-avatar">${initial}</div>
            <div class="char-name-group">
              <h3 class="char-name">${char.name}</h3>
              <span class="char-role">${char.role || 'Персонаж'}</span>
            </div>
          </div>
          <div class="char-pill-row">
            <span class="status-pill ${statusClass}">${char.status}</span>
            <span class="faction-pill">${char.faction}</span>
          </div>
          <p class="char-summary">${char.bio || ''}</p>
        </div>
        <div class="char-action-footer">
          Открыть досье →
        </div>
      `;

      card.addEventListener('click', () => openCharacterModal(char));
      charactersGrid.appendChild(card);
    });
  }

  function openCharacterModal(char) {
    if (!charModal) return;
    if (modalAvatar) modalAvatar.textContent = char.name.charAt(0).toUpperCase();
    if (modalName) modalName.textContent = char.name;
    if (modalRole) modalRole.textContent = char.role || 'Персонаж';
    if (modalStatus) {
      modalStatus.textContent = char.status;
      let statusClass = 'status-alive';
      if (char.status === 'Погиб') statusClass = 'status-dead';
      else if (char.status === 'Пропал' || char.status === 'Ранен' || char.status === 'В бегах') statusClass = 'status-warn';
      modalStatus.className = 'status-pill ' + statusClass;
    }
    if (modalFaction) modalFaction.textContent = char.faction;
    if (modalBio) modalBio.textContent = char.bio || 'Данные засекречены.';

    if (modalRelationsWrap && modalRelationsList) {
      if (char.relations) {
        modalRelationsWrap.style.display = 'block';
        modalRelationsList.innerHTML = '';
        const relArr = char.relations.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
        relArr.forEach(relName => {
          const chip = document.createElement('span');
          chip.className = 'rel-chip';
          chip.textContent = relName;
          
          chip.addEventListener('click', (e) => {
            e.stopPropagation();
            const targetChar = data.characters.find(c => c.name.toLowerCase().includes(relName.toLowerCase()) || relName.toLowerCase().includes(c.name.toLowerCase()));
            if (targetChar) {
              openCharacterModal(targetChar);
            } else {
              showToast('Персонаж ' + relName + ' не найден в досье');
            }
          });

          modalRelationsList.appendChild(chip);
        });
      } else {
        modalRelationsWrap.style.display = 'none';
      }
    }

    charModal.style.display = 'flex';
  }

  if (modalClose) modalClose.addEventListener('click', () => charModal.style.display = 'none');
  if (charModal) {
    charModal.addEventListener('click', (e) => {
      if (e.target === charModal) charModal.style.display = 'none';
    });
  }

  if (statusControls) {
    statusControls.addEventListener('click', (e) => {
      if (e.target.classList.contains('segment-btn')) {
        statusControls.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeCharStatus = e.target.getAttribute('data-status');
        renderCharacters();
      }
    });
  }

  if (factionControls) {
    factionControls.addEventListener('click', (e) => {
      if (e.target.classList.contains('segment-btn')) {
        factionControls.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeCharFaction = e.target.getAttribute('data-faction');
        renderCharacters();
      }
    });
  }

  // Initial immediate renders
  renderGamesGrid();
  renderTranscriptsGrid();
  renderFeedbacksGrid();
  renderCharacters();
})();
