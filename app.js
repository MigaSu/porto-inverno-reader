
/**
 * PORTO-INVERNO | UNIFIED APPLICATION ARCHITECTURE
 * Fully Encapsulated & DRY-Compliant
 */
(function() {
  'use strict';

  // Master Data Store
  const DataStore = window.PORTO_DATA || { summaries: [], characters: [], transcripts: [], feedbacks: [] };

  // Application State
  const AppState = {
    activeTab: 'games',
    filters: {
      storyline: 'all',
      transcriptStoryline: 'all',
      feedbackChar: 'all',
      charStatus: 'all',
      charFaction: 'all'
    },
    searchQuery: '',
    transcriptQuery: '',
    reader: {
      docType: null, // 'chapter' | 'transcript' | 'feedback'
      sourceTab: 'games',
      currentIndex: -1,
      fontSize: 1.08
    }
  };

  // DOM Elements Cache
  const DOM = {
    navLinks: document.querySelectorAll('.nav-link'),
    viewPanels: document.querySelectorAll('.view-panel'),
    appSearch: document.getElementById('appSearch'),
    sidebar: document.getElementById('appSidebar'),
    mobileToggle: document.getElementById('mobileToggle'),
    progressBar: document.getElementById('readingProgress'),
    toast: document.getElementById('appToast'),

    // Mobile Menu Controls
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
    sidebarBackdrop: document.getElementById('sidebarBackdrop'),

    // Badges
    gamesCount: document.getElementById('gamesCount'),
    transcriptsCount: document.getElementById('transcriptsCount'),
    feedbacksCount: document.getElementById('feedbacksCount'),
    charsCount: document.getElementById('charsCount'),

    // Grids
    gamesGrid: document.getElementById('gamesGrid'),
    transcriptsGrid: document.getElementById('transcriptsGrid'),
    feedbacksGrid: document.getElementById('feedbacksGrid'),
    charactersGrid: document.getElementById('charactersGrid'),

    // Segmented Controls
    storylineControls: document.getElementById('storylineControls'),
    transcriptStorylineControls: document.getElementById('transcriptStorylineControls'),
    feedbackCharControls: document.getElementById('feedbackCharControls'),
    statusControls: document.getElementById('statusControls'),
    factionControls: document.getElementById('factionControls'),

    // Unified Reader
    viewReader: document.getElementById('view-reader'),
    btnBack: document.getElementById('readerBtnBack'),
    btnBackBottom: document.getElementById('readerBtnBackBottom'),
    readerCategory: document.getElementById('readerCategory'),
    readerDate: document.getElementById('readerDate'),
    readerReadTime: document.getElementById('readerReadTime'),
    readerTitle: document.getElementById('readerTitle'),
    readerThesis: document.getElementById('readerThesis'),
    readerBody: document.getElementById('readerBody'),
    readerFilterBar: document.getElementById('readerFilterBar'),
    readerFilterInput: document.getElementById('readerFilterInput'),
    btnContextSwitch: document.getElementById('readerBtnContextSwitch'),
    btnCopy: document.getElementById('readerBtnCopy'),
    btnPrev: document.getElementById('readerBtnPrev'),
    btnNext: document.getElementById('readerBtnNext'),
    btnFontSans: document.getElementById('btnFontSans'),
    btnFontSerif: document.getElementById('btnFontSerif'),
    btnSizeMinus: document.getElementById('btnSizeMinus'),
    btnSizePlus: document.getElementById('btnSizePlus'),

    // Character Modal
    charModal: document.getElementById('charModal'),
    modalClose: document.getElementById('modalClose'),
    modalAvatar: document.getElementById('modalAvatar'),
    modalName: document.getElementById('modalName'),
    modalRole: document.getElementById('modalRole'),
    modalStatus: document.getElementById('modalStatus'),
    modalFaction: document.getElementById('modalFaction'),
    modalBio: document.getElementById('modalBio'),
    modalRelationsWrap: document.getElementById('modalRelationsWrap'),
    modalRelationsList: document.getElementById('modalRelationsList'),

    themeBtns: document.querySelectorAll('.theme-btn')
  };

  // Utilities
  const Utils = {
    showToast(msg) {
      if (!DOM.toast) return;
      DOM.toast.textContent = msg;
      DOM.toast.classList.add('visible');
      setTimeout(() => DOM.toast.classList.remove('visible'), 2400);
    },

    escapeHtml(str) {
      return (str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    },

    escapeRegex(str) {
      return (str || '').split('').map(c => ('[]{}()*+?.,\\^$|#'.indexOf(c) !== -1 ? '\\' + c : c)).join('');
    },

    parseMarkdown(md) {
      if (!md) return '';
      let text = md.replace(/^#\s+[^\n]+\n+/, '');

      return text.split(/\n\s*\n/).map(p => {
        let t = p.trim();
        if (!t) return '';
        if (t.startsWith('> ')) {
          return '<blockquote>' + Utils.formatInline(t.replace(/^>\s+/, '')) + '</blockquote>';
        }
        if (t.startsWith('## ') || t.startsWith('### ')) {
          return '<h3 style="font-size: 1.3rem; margin: 1.8rem 0 0.8rem 0; font-weight: 600; color: var(--text-primary);">' + Utils.formatInline(t.replace(/^#+\s+/, '')) + '</h3>';
        }
        return '<p>' + Utils.formatInline(t) + '</p>';
      }).join('');
    },

    formatInline(str) {
      const codeRegex = new RegExp(String.fromCharCode(96) + '([^' + String.fromCharCode(96) + ']+)' + String.fromCharCode(96), 'g');
      return str
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(codeRegex, '<code style="background: var(--bg-input); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.85em;">$1</code>');
    },

    formatTranscript(text, filterQuery = '') {
      if (!text) return '<p style="color: var(--text-tertiary);">Текст транскрибации пуст</p>';
      const lines = text.split(/\r?\n/);
      let html = '';
      let currentSpeaker = '';
      let currentEntryLines = [];
      let isGM = false;

      function flush() {
        if (currentEntryLines.length > 0) {
          const cls = isGM ? 'speaker-gm' : 'speaker-player';
          html += '<div class="transcript-entry ' + cls + '">';
          if (currentSpeaker) {
            html += '<div class="entry-speaker">🗣️ ' + Utils.escapeHtml(currentSpeaker) + '</div>';
          }
          currentEntryLines.forEach(l => {
            let lineHtml = Utils.escapeHtml(l);
            lineHtml = lineHtml.replace(/\[(\d{2}:\d{2}:\d{2})\]/g, '<span class="timestamp-pill">$1</span>');

            if (filterQuery) {
              const re = new RegExp('(' + Utils.escapeRegex(filterQuery) + ')', 'gi');
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
          flush();
          currentSpeaker = line.replace(/:$/, '');
          isGM = currentSpeaker.toLowerCase().includes('михаил') || currentSpeaker.toLowerCase().includes('мастер');
        } else {
          currentEntryLines.push(line);
        }
      }
      flush();
      return html;
    },

    getBranchClass(cat) {
      if (!cat) return 'tag-solo';
      if (cat.includes('Молли')) return 'tag-molly';
      if (cat.includes('Хизер')) return 'tag-heather';
      if (cat.includes('Эйден')) return 'tag-aiden';
      if (cat.includes('Грейвз') || cat.includes('Малкольм')) return 'tag-graves';
      return 'tag-solo';
    }
  };

  // Navigation Controller
  const Navigation = {
    switchTab(tabKey, push = true) {
      AppState.activeTab = tabKey;
      DOM.navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-tab') === tabKey);
      });

      DOM.viewPanels.forEach(p => p.classList.remove('active'));

      if (tabKey === 'reader') {
        DOM.viewReader.classList.add('active');
      } else {
        const panel = document.getElementById('view-' + tabKey);
        if (panel) panel.classList.add('active');

        // Re-render corresponding grid
        if (tabKey === 'games') Grids.renderGames();
        else if (tabKey === 'transcripts') Grids.renderTranscripts();
        else if (tabKey === 'player-notes') Grids.renderFeedbacks();
        else if (tabKey === 'characters') Grids.renderCharacters();

        if (push) {
          history.pushState({ view: 'tab', tab: tabKey }, '', '#' + tabKey);
        }
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Grids Rendering Engine (DRY)
  const Grids = {
    renderCard(container, item, options) {
      const card = document.createElement('div');
      card.className = 'app-card';
      card.innerHTML = `
        <div>
          <div class="card-meta-row">
            <span class="date-pill">${options.metaTopLeft}</span>
            <span class="badge-tag ${options.badgeClass}">${options.badgeText}</span>
          </div>
          <h3 class="card-title">${options.title}</h3>
          <p class="card-thesis">${options.thesis}</p>
        </div>
        <div class="card-footer-row">
          <span class="card-subtitle">${options.footerLeft}</span>
          <span class="card-action-link">${options.actionText} →</span>
        </div>
      `;
      card.addEventListener('click', options.onClick);
      container.appendChild(card);
    },

    renderGames() {
      if (!DOM.gamesGrid) return;
      DOM.gamesGrid.innerHTML = '';

      const query = AppState.searchQuery;
      const filter = AppState.filters.storyline;

      const items = DataStore.summaries.filter(item => {
        const matchFilter = filter === 'all' || 
          (filter === 'Соло' ? item.category.includes('Соло') : (item.branch === filter || item.category === filter));
        const matchSearch = !query || 
          item.title.toLowerCase().includes(query) || 
          item.thesis.toLowerCase().includes(query) ||
          item.gameDate.toLowerCase().includes(query);
        return matchFilter && matchSearch;
      });

      if (items.length === 0) {
        DOM.gamesGrid.innerHTML = '<div style="grid-column:1/-1; padding:4rem 1rem; text-align:center; color:var(--text-tertiary);">Сессии не найдены</div>';
        return;
      }

      items.forEach(item => {
        const idx = DataStore.summaries.findIndex(s => s.id === item.id);
        Grids.renderCard(DOM.gamesGrid, item, {
          metaTopLeft: '📅 ' + item.gameDate,
          badgeClass: Utils.getBranchClass(item.category),
          badgeText: item.category,
          title: item.title,
          thesis: item.thesis,
          footerLeft: '🎮 Игра: ' + item.realDate,
          actionText: 'Читать главу',
          onClick: () => UnifiedReader.open('chapter', idx, true)
        });
      });
    },

    renderTranscripts() {
      if (!DOM.transcriptsGrid) return;
      DOM.transcriptsGrid.innerHTML = '';

      const query = AppState.searchQuery;
      const filter = AppState.filters.transcriptStoryline;

      const items = DataStore.transcripts.filter(item => {
        const matchFilter = filter === 'all' || 
          (filter === 'Соло' ? item.category.includes('Соло') : (item.branch === filter || item.category === filter));
        const matchSearch = !query || 
          item.title.toLowerCase().includes(query) || 
          item.id.toLowerCase().includes(query) ||
          item.gameDate.toLowerCase().includes(query);
        return matchFilter && matchSearch;
      });

      if (items.length === 0) {
        DOM.transcriptsGrid.innerHTML = '<div style="grid-column:1/-1; padding:4rem 1rem; text-align:center; color:var(--text-tertiary);">Транскрибации не найдены</div>';
        return;
      }

      items.forEach(item => {
        const idx = DataStore.transcripts.findIndex(t => t.id === item.id);
        Grids.renderCard(DOM.transcriptsGrid, item, {
          metaTopLeft: '📅 ' + item.gameDate,
          badgeClass: Utils.getBranchClass(item.category),
          badgeText: item.category,
          title: item.title,
          thesis: '📜 Файл стенограммы: ' + item.id + '.txt',
          footerLeft: '📊 ' + item.linesCount + ' строк (' + item.sizeKb + ')',
          actionText: 'Открыть стенограмму',
          onClick: () => UnifiedReader.open('transcript', idx, true)
        });
      });
    },

    renderFeedbacks() {
      if (!DOM.feedbacksGrid) return;
      DOM.feedbacksGrid.innerHTML = '';

      const query = AppState.searchQuery;
      const filter = AppState.filters.feedbackChar;

      const items = DataStore.feedbacks.filter(item => {
        const matchFilter = filter === 'all' || item.characterKey === filter;
        const matchSearch = !query || 
          item.title.toLowerCase().includes(query) || 
          item.characterName.toLowerCase().includes(query) || 
          item.excerpt.toLowerCase().includes(query);
        return matchFilter && matchSearch;
      });

      if (items.length === 0) {
        DOM.feedbacksGrid.innerHTML = '<div style="grid-column:1/-1; padding:4rem 1rem; text-align:center; color:var(--text-tertiary);">Записи ОС не найдены</div>';
        return;
      }

      items.forEach(item => {
        const idx = DataStore.feedbacks.findIndex(f => f.id === item.id);
        Grids.renderCard(DOM.feedbacksGrid, item, {
          metaTopLeft: '⏳ ' + item.readTime,
          badgeClass: item.badgeClass,
          badgeText: item.characterName,
          title: item.title,
          thesis: item.excerpt,
          footerLeft: '📊 ' + item.wordCount + ' слов',
          actionText: 'Читать запись',
          onClick: () => UnifiedReader.open('feedback', idx, true)
        });
      });
    },

    renderCharacters() {
      if (!DOM.charactersGrid) return;
      DOM.charactersGrid.innerHTML = '';

      const query = AppState.searchQuery;
      const statusF = AppState.filters.charStatus;
      const factionF = AppState.filters.charFaction;

      const items = DataStore.characters.filter(char => {
        const matchStatus = statusF === 'all' || char.status === statusF;
        const matchFaction = factionF === 'all' || char.faction === factionF;
        const matchSearch = !query || 
          char.name.toLowerCase().includes(query) || 
          char.role.toLowerCase().includes(query) || 
          char.bio.toLowerCase().includes(query);
        return matchStatus && matchFaction && matchSearch;
      });

      if (items.length === 0) {
        DOM.charactersGrid.innerHTML = '<div style="grid-column:1/-1; padding:4rem 1rem; text-align:center; color:var(--text-tertiary);">Персонажи не найдены</div>';
        return;
      }

      items.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';

        let statusClass = 'status-alive';
        if (char.status === 'Погиб') statusClass = 'status-dead';
        else if (char.status === 'Пропал' || char.status === 'Ранен' || char.status === 'В бегах') statusClass = 'status-warn';

        card.innerHTML = `
          <div>
            <div class="char-header">
              <div class="char-avatar">${char.name.charAt(0).toUpperCase()}</div>
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
        card.addEventListener('click', () => CharactersModal.open(char, true));
        DOM.charactersGrid.appendChild(card);
      });
    }
  };

  // Unified Single Reader Engine
  const UnifiedReader = {
    open(docType, index, push = true) {
      AppState.reader.docType = docType;
      AppState.reader.currentIndex = index;

      let doc = null;
      let totalCount = 0;
      let backTab = 'games';
      let backLabel = '← К хронологии';

      if (docType === 'chapter') {
        doc = DataStore.summaries[index];
        totalCount = DataStore.summaries.length;
        backTab = 'games';
        backLabel = '← К хронологии';
      } else if (docType === 'transcript') {
        doc = DataStore.transcripts[index];
        totalCount = DataStore.transcripts.length;
        backTab = 'transcripts';
        backLabel = '← К стенограммам';
      } else if (docType === 'feedback') {
        doc = DataStore.feedbacks[index];
        totalCount = DataStore.feedbacks.length;
        backTab = 'player-notes';
        backLabel = '← К дневнику ОС';
      }

      if (!doc) return;
      AppState.reader.sourceTab = backTab;

      Navigation.switchTab('reader', false);

      if (push) {
        history.pushState({ view: 'reader', docType, index, sourceTab: backTab }, '', '#reader:' + docType + ':' + index);
      }

      // Update Toolbar & Back Buttons
      DOM.btnBack.textContent = backLabel;
      DOM.btnBackBottom.textContent = backLabel.replace('← ', 'Назад к ');

      // Context switcher (Стенограмма <-> Саммари)
      if (docType === 'chapter') {
        DOM.btnContextSwitch.style.display = 'inline-block';
        DOM.btnContextSwitch.textContent = '📜 Стенограмма';
      } else if (docType === 'transcript') {
        DOM.btnContextSwitch.style.display = 'inline-block';
        DOM.btnContextSwitch.textContent = '📖 Саммари главы';
      } else {
        DOM.btnContextSwitch.style.display = 'none';
      }

      // Transcript in-document search bar
      if (docType === 'transcript') {
        DOM.readerFilterBar.style.display = 'flex';
        DOM.readerFilterInput.value = '';
        AppState.transcriptQuery = '';
      } else {
        DOM.readerFilterBar.style.display = 'none';
      }

      // Render Meta
      DOM.readerCategory.textContent = doc.category || doc.characterName;
      DOM.readerCategory.className = 'badge-tag ' + (doc.badgeClass || Utils.getBranchClass(doc.category));
      DOM.readerDate.textContent = '📅 ' + (doc.gameDate || doc.date || doc.readTime);
      DOM.readerReadTime.textContent = '⏳ ' + (doc.readTime || (doc.linesCount ? doc.linesCount + ' строк' : ''));
      DOM.readerTitle.textContent = doc.title;
      DOM.readerThesis.textContent = doc.thesis ? '«' + doc.thesis + '»' : (doc.role ? '«' + doc.role + '»' : '');
      DOM.readerThesis.style.display = (doc.thesis || doc.role) ? 'block' : 'none';

      // Prev / Next
      DOM.btnPrev.disabled = index <= 0;
      DOM.btnNext.disabled = index >= totalCount - 1;

      // Render Body with on-demand fetch
      UnifiedReader.loadContent(docType, doc, index);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    loadContent(docType, doc, index) {
      if (doc.content || doc.rawText) {
        UnifiedReader.renderBodyText(docType, doc.content || doc.rawText);
        return;
      }

      DOM.readerBody.innerHTML = '<div style="padding:3.5rem 1rem; text-align:center; color:var(--text-tertiary);">⏳ Загрузка содержимого...</div>';

      let folder = 'summaries';
      let filename = doc.file;
      if (docType === 'transcript') folder = 'transcripts';
      else if (docType === 'feedback') folder = 'feedbacks';

      fetch('./' + folder + '/' + encodeURIComponent(filename))
        .then(res => res.text())
        .then(text => {
          if (docType === 'transcript') doc.rawText = text;
          else doc.content = text;

          if (AppState.activeTab === 'reader' && AppState.reader.currentIndex === index && AppState.reader.docType === docType) {
            UnifiedReader.renderBodyText(docType, text);
          }
        })
        .catch(() => {
          DOM.readerBody.innerHTML = '<div style="padding:3.5rem 1rem; text-align:center; color:var(--text-tertiary);">Не удалось загрузить документ</div>';
        });
    },

    renderBodyText(docType, text) {
      if (docType === 'chapter') {
        DOM.readerBody.innerHTML = Utils.parseMarkdown(text);
      } else if (docType === 'transcript') {
        DOM.readerBody.innerHTML = Utils.formatTranscript(text, AppState.transcriptQuery);
      } else if (docType === 'feedback') {
        const paragraphs = text.split(/\r?\n\s*\r?\n/).filter(Boolean);
        let bodyHtml = '';
        paragraphs.forEach(p => {
          let pText = Utils.escapeHtml(p.trim());
          pText = pText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
          bodyHtml += '<p>' + pText.replace(/\n/g, '<br>') + '</p>';
        });
        DOM.readerBody.innerHTML = bodyHtml;
      }
    }
  };

  // Character Dossier Modal
  const CharactersModal = {
    open(char, push = true) {
      if (!DOM.charModal) return;
      DOM.modalAvatar.textContent = char.name.charAt(0).toUpperCase();
      DOM.modalName.textContent = char.name;
      DOM.modalRole.textContent = char.role || 'Персонаж';

      let statusClass = 'status-alive';
      if (char.status === 'Погиб') statusClass = 'status-dead';
      else if (char.status === 'Пропал' || char.status === 'Ранен' || char.status === 'В бегах') statusClass = 'status-warn';

      DOM.modalStatus.textContent = char.status;
      DOM.modalStatus.className = 'status-pill ' + statusClass;
      DOM.modalFaction.textContent = char.faction;
      DOM.modalBio.textContent = char.bio || 'Данные засекречены.';

      if (char.relations) {
        DOM.modalRelationsWrap.style.display = 'block';
        DOM.modalRelationsList.innerHTML = '';
        const relArr = char.relations.split(/[,;]+/).map(s => s.trim()).filter(Boolean);
        relArr.forEach(relName => {
          const chip = document.createElement('span');
          chip.className = 'rel-chip';
          chip.textContent = relName;
          chip.addEventListener('click', (e) => {
            e.stopPropagation();
            const target = DataStore.characters.find(c => c.name.toLowerCase().includes(relName.toLowerCase()) || relName.toLowerCase().includes(c.name.toLowerCase()));
            if (target) CharactersModal.open(target, true);
            else Utils.showToast('Персонаж ' + relName + ' не найден');
          });
          DOM.modalRelationsList.appendChild(chip);
        });
      } else {
        DOM.modalRelationsWrap.style.display = 'none';
      }

      if (push) {
        history.pushState({ view: 'modal', charId: char.id }, '', '#char:' + char.id);
      }

      DOM.charModal.style.display = 'flex';
    },

    close(pop = true) {
      if (DOM.charModal) DOM.charModal.style.display = 'none';
      if (pop && window.location.hash.startsWith('#char:')) {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.hash = '#' + AppState.activeTab;
        }
      }
    }
  };

  // Setup Event Listeners (DRY & Encapsulated)
  function initEvents() {
    function openSidebar() {
      if (DOM.sidebar) DOM.sidebar.classList.add('open');
      if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.classList.add('visible');
    }

    function closeSidebar() {
      if (DOM.sidebar) DOM.sidebar.classList.remove('open');
      if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.classList.remove('visible');
    }

    // Navigation Links
    DOM.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        const tab = link.getAttribute('data-tab');
        Navigation.switchTab(tab, true);
        closeSidebar();
      });
    });

    // Mobile Menu Toggles
    if (DOM.mobileMenuBtn) DOM.mobileMenuBtn.addEventListener('click', openSidebar);
    if (DOM.sidebarCloseBtn) DOM.sidebarCloseBtn.addEventListener('click', closeSidebar);
    if (DOM.sidebarBackdrop) DOM.sidebarBackdrop.addEventListener('click', closeSidebar);

    // Global Search
    if (DOM.appSearch) {
      DOM.appSearch.addEventListener('input', (e) => {
        AppState.searchQuery = e.target.value.toLowerCase().trim();
        if (AppState.activeTab === 'reader') {
          Navigation.switchTab(AppState.reader.sourceTab, true);
        } else {
          Navigation.switchTab(AppState.activeTab, false);
        }
      });

      window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          DOM.appSearch.focus();
        } else if (e.key === 'Escape') {
          CharactersModal.close(true);
        }
      });
    }

    // Reading Progress
    window.addEventListener('scroll', () => {
      if (AppState.activeTab === 'reader' && DOM.progressBar) {
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / (docHeight || 1)) * 100;
        DOM.progressBar.style.width = Math.min(100, Math.max(0, scrolled)) + '%';
      }
    });

    // Reader Navigation & Controls
    function handleReaderBack() {
      if (window.history.length > 1 && window.location.hash.startsWith('#reader:')) {
        window.history.back();
      } else {
        Navigation.switchTab(AppState.reader.sourceTab, true);
      }
    }

    DOM.btnBack.addEventListener('click', handleReaderBack);
    DOM.btnBackBottom.addEventListener('click', handleReaderBack);

    DOM.btnPrev.addEventListener('click', () => {
      if (AppState.reader.currentIndex > 0) {
        UnifiedReader.open(AppState.reader.docType, AppState.reader.currentIndex - 1, true);
      }
    });

    DOM.btnNext.addEventListener('click', () => {
      UnifiedReader.open(AppState.reader.docType, AppState.reader.currentIndex + 1, true);
    });

    DOM.btnContextSwitch.addEventListener('click', () => {
      const type = AppState.reader.docType;
      const idx = AppState.reader.currentIndex;
      if (type === 'chapter') {
        const chapter = DataStore.summaries[idx];
        const tIdx = DataStore.transcripts.findIndex(t => t.id === chapter.id);
        if (tIdx >= 0) UnifiedReader.open('transcript', tIdx, true);
        else Utils.showToast('Стенограмма не найдена');
      } else if (type === 'transcript') {
        const transcript = DataStore.transcripts[idx];
        const sIdx = DataStore.summaries.findIndex(s => s.id === transcript.id);
        if (sIdx >= 0) UnifiedReader.open('chapter', sIdx, true);
        else Utils.showToast('Саммари не найдено');
      }
    });

    DOM.btnCopy.addEventListener('click', () => {
      const type = AppState.reader.docType;
      const idx = AppState.reader.currentIndex;
      let text = '';
      if (type === 'chapter' && DataStore.summaries[idx]) text = DataStore.summaries[idx].content;
      else if (type === 'transcript' && DataStore.transcripts[idx]) text = DataStore.transcripts[idx].rawText;
      else if (type === 'feedback' && DataStore.feedbacks[idx]) text = DataStore.feedbacks[idx].content;

      if (text) {
        navigator.clipboard.writeText(text).then(() => Utils.showToast('✓ Текст скопирован в буфер!'));
      } else {
        Utils.showToast('Текст еще не загружен');
      }
    });

    // Transcript Query Filter inside reader
    DOM.readerFilterInput.addEventListener('input', (e) => {
      AppState.transcriptQuery = e.target.value.trim();
      const t = DataStore.transcripts[AppState.reader.currentIndex];
      if (t && t.rawText) {
        UnifiedReader.renderBodyText('transcript', t.rawText);
      }
    });

    // Font and Size
    DOM.btnFontSerif.addEventListener('click', () => {
      document.documentElement.style.setProperty('--font-reader', 'var(--font-serif)');
      DOM.btnFontSerif.classList.add('active');
      DOM.btnFontSans.classList.remove('active');
    });

    DOM.btnFontSans.addEventListener('click', () => {
      document.documentElement.style.setProperty('--font-reader', 'var(--font-sans)');
      DOM.btnFontSans.classList.add('active');
      DOM.btnFontSerif.classList.remove('active');
    });

    DOM.btnSizePlus.addEventListener('click', () => {
      if (AppState.reader.fontSize < 1.35) {
        AppState.reader.fontSize += 0.06;
        document.documentElement.style.setProperty('--reader-size', AppState.reader.fontSize + 'rem');
      }
    });

    DOM.btnSizeMinus.addEventListener('click', () => {
      if (AppState.reader.fontSize > 0.9) {
        AppState.reader.fontSize -= 0.06;
        document.documentElement.style.setProperty('--reader-size', AppState.reader.fontSize + 'rem');
      }
    });

    // Segmented Controls Helper (DRY)
    function setupSegmented(container, filterKey, renderFn) {
      if (!container) return;
      container.addEventListener('click', (e) => {
        if (e.target.classList.contains('segment-btn')) {
          container.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          AppState.filters[filterKey] = e.target.getAttribute('data-filter') || e.target.getAttribute('data-char') || e.target.getAttribute('data-status') || e.target.getAttribute('data-faction');
          renderFn();
        }
      });
    }

    setupSegmented(DOM.storylineControls, 'storyline', Grids.renderGames);
    setupSegmented(DOM.transcriptStorylineControls, 'transcriptStoryline', Grids.renderTranscripts);
    setupSegmented(DOM.feedbackCharControls, 'feedbackChar', Grids.renderFeedbacks);
    setupSegmented(DOM.statusControls, 'charStatus', Grids.renderCharacters);
    setupSegmented(DOM.factionControls, 'charFaction', Grids.renderCharacters);

    // Modal
    DOM.modalClose.addEventListener('click', () => CharactersModal.close(true));
    DOM.charModal.addEventListener('click', (e) => {
      if (e.target === DOM.charModal) CharactersModal.close(true);
    });

    // Theme Switcher
    DOM.themeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', theme);
        DOM.themeBtns.forEach(b => b.classList.toggle('active', b === btn));
        localStorage.setItem('porto_theme', theme);
      });
    });

    const savedTheme = localStorage.getItem('porto_theme') || 'dark';
    if (savedTheme !== 'dark') {
      document.documentElement.setAttribute('data-theme', savedTheme);
      DOM.themeBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-theme') === savedTheme));
    }

    // Native Browser / Mobile Gesture "Back" Navigation Listener
    window.addEventListener('popstate', (e) => {
      if (DOM.sidebar && DOM.sidebar.classList.contains('open')) {
        closeSidebar();
      }

      const hash = window.location.hash.replace(/^#/, '');

      // Handle Modal State
      if (!hash.startsWith('char:') && DOM.charModal && DOM.charModal.style.display === 'flex') {
        CharactersModal.close(false);
      }

      if (e.state && e.state.view) {
        if (e.state.view === 'tab') {
          Navigation.switchTab(e.state.tab, false);
        } else if (e.state.view === 'reader') {
          UnifiedReader.open(e.state.docType, e.state.index, false);
        } else if (e.state.view === 'modal') {
          const char = DataStore.characters.find(c => c.id === e.state.charId);
          if (char) CharactersModal.open(char, false);
        }
      } else {
        restoreFromHash(hash);
      }
    });
  }

  function restoreFromHash(hash) {
    if (hash.startsWith('reader:')) {
      const parts = hash.split(':');
      const docType = parts[1];
      const idx = parseInt(parts[2] || '0', 10);
      UnifiedReader.open(docType, idx, false);
    } else if (hash.startsWith('char:')) {
      const charId = hash.replace('char:', '');
      const char = DataStore.characters.find(c => c.id === charId);
      if (char) {
        Navigation.switchTab('characters', false);
        CharactersModal.open(char, false);
      } else {
        Navigation.switchTab('games', false);
      }
    } else if (hash && ['games', 'transcripts', 'player-notes', 'characters'].includes(hash)) {
      Navigation.switchTab(hash, false);
    } else {
      Navigation.switchTab('games', false);
    }
  }

  // Update counts
  if (DOM.gamesCount) DOM.gamesCount.textContent = DataStore.summaries.length;
  if (DOM.transcriptsCount) DOM.transcriptsCount.textContent = DataStore.transcripts.length;
  if (DOM.feedbacksCount) DOM.feedbacksCount.textContent = DataStore.feedbacks.length;
  if (DOM.charsCount) DOM.charsCount.textContent = DataStore.characters.length;

  // Initialize
  initEvents();
  const initialHash = window.location.hash.replace(/^#/, '');
  restoreFromHash(initialHash);
})();
