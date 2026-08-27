/**
 * PORTO-INVERNO | UNIFIED APPLICATION ARCHITECTURE
 * Fully Encapsulated, Modular & DRY-Compliant
 */
(function() {
  'use strict';

  // Master Data Store
  const DataStore = window.PORTO_DATA || { summaries: [], characters: [], transcripts: [], feedbacks: [], quotes: [], psycho: [], sanityTimeline: {}, relationships: {}, calendar: { days: {}, monthInfo: {} } };

  // Application State
  const AppState = {
    activeTab: 'games',
    filters: {
      storyline: 'all',
      transcriptStoryline: 'all',
      feedbackChar: 'all',
      charStatus: 'all',
      charFaction: 'all',
      quotesStoryline: 'all',
      quotesAuthor: 'all',
      quotesCategory: 'all',
      psychoChar: 'all',
      calendarBranch: 'all',
      calendarThreat: 'all'
    },
    sanityHero: 'molly',
    sanitySelectedPointIndex: 0,
    selectedRelationshipPair: 'molly-heather',
    selectedRelationshipStageIndex: 0,
    selectedCalendarDate: '1931-10-14',
    quotesSelectedSession: null,
    searchQuery: '',
    transcriptQuery: '',
    reader: {
      docType: null, // 'chapter' | 'transcript' | 'feedback' | 'psycho'
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
    quotesCount: document.getElementById('quotesCount'),
    psychoCount: document.getElementById('psychoCount'),
    sanityCount: document.getElementById('sanityCount'),
    relationshipsCount: document.getElementById('relationshipsCount'),
    calendarCount: document.getElementById('calendarCount'),

    // Grids & Dashboards
    gamesGrid: document.getElementById('gamesGrid'),
    transcriptsGrid: document.getElementById('transcriptsGrid'),
    feedbacksGrid: document.getElementById('feedbacksGrid'),
    charactersGrid: document.getElementById('charactersGrid'),
    psychoGrid: document.getElementById('psychoGrid'),
    sanityHeroControls: document.getElementById('sanityHeroControls'),
    sanityDashboardContainer: document.getElementById('sanityDashboardContainer'),
    relationshipPairControls: document.getElementById('relationshipPairControls'),
    relationshipsContainer: document.getElementById('relationshipsContainer'),
    calendarBranchControls: document.getElementById('calendarBranchControls'),
    calendarThreatControls: document.getElementById('calendarThreatControls'),
    calendarContainer: document.getElementById('calendarContainer'),

    // Quotes Controls and Views
    quotesGrid: document.getElementById('quotesGamesView'),
    quotesDetailView: document.getElementById('quotesDetailView'),
    quoteDetailTitle: document.getElementById('quoteDetailTitle'),
    quoteDetailBranch: document.getElementById('quoteDetailBranch'),
    quoteDetailDate: document.getElementById('quoteDetailDate'),
    quoteDetailTotal: document.getElementById('quoteDetailTotal'),
    quotesDetailSections: document.getElementById('quotesDetailSections'),
    quotesBtnBack: document.getElementById('quotesBtnBack'),
    quotesStorylineControls: document.getElementById('quotesStorylineControls'),
    quotesAuthorControls: document.getElementById('quotesAuthorControls'),
    quotesCategoryControls: document.getElementById('quotesCategoryControls'),

    // Segmented Controls
    storylineControls: document.getElementById('storylineControls'),
    transcriptStorylineControls: document.getElementById('transcriptStorylineControls'),
    feedbackCharControls: document.getElementById('feedbackCharControls'),
    statusControls: document.getElementById('statusControls'),
    factionControls: document.getElementById('factionControls'),
    psychoCharControls: document.getElementById('psychoCharControls'),

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
    fontSizeDisplay: document.getElementById('fontSizeDisplay'),

    // Notes & Annotations Elements
    btnNotes: document.getElementById('readerBtnNotes'),
    notesBadge: document.getElementById('readerNotesBadge'),
    selectionPill: document.getElementById('noteSelectionPill'),
    btnCreateNoteFromSelection: document.getElementById('btnCreateNoteFromSelection'),
    noteModal: document.getElementById('noteModal'),
    btnCloseNoteModal: document.getElementById('btnCloseNoteModal'),
    btnCancelNoteModal: document.getElementById('btnCancelNoteModal'),
    btnSaveNote: document.getElementById('btnSaveNote'),
    noteQuotePreview: document.getElementById('noteQuotePreview'),
    noteQuoteText: document.getElementById('noteQuoteText'),
    noteAuthorChips: document.getElementById('noteAuthorChips'),
    noteAuthorInput: document.getElementById('noteAuthorInput'),
    noteColorPicker: document.getElementById('noteColorPicker'),
    noteTextInput: document.getElementById('noteTextInput'),
    notesDrawer: document.getElementById('notesDrawer'),
    notesDrawerBackdrop: document.getElementById('notesDrawerBackdrop'),
    btnCloseNotesDrawer: document.getElementById('btnCloseNotesDrawer'),
    notesDrawerCount: document.getElementById('notesDrawerCount'),
    btnAddGeneralNote: document.getElementById('btnAddGeneralNote'),
    notesDrawerList: document.getElementById('notesDrawerList'),
    notePopoverCard: document.getElementById('notePopoverCard'),
    popoverAvatar: document.getElementById('popoverAvatar'),
    popoverAuthor: document.getElementById('popoverAuthor'),
    popoverTime: document.getElementById('popoverTime'),
    popoverQuote: document.getElementById('popoverQuote'),
    popoverBody: document.getElementById('popoverBody'),
    popoverBtnDelete: document.getElementById('popoverBtnDelete'),

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
      let raw = md.replace(/^#\s+[^\n]+\n+/, '');

      const blocks = raw.split(/\r?\n\s*\r?\n/);
      let html = '';

      for (let block of blocks) {
        let b = block.trim();
        if (!b) continue;

        // Horizontal rule
        if (/^---+$/.test(b) || /^\*\*\*+$/.test(b)) {
          html += '<hr style="border:0; border-top:1px solid var(--border-subtle); margin: 2rem 0;">';
          continue;
        }

        // Headers
        if (b.startsWith('#### ')) {
          html += '<h4 style="font-size: 1.08rem; margin: 1.5rem 0 0.5rem 0; font-weight: 600; color: var(--gold-accent);">' + Utils.formatInline(b.replace(/^####\s+/, '')) + '</h4>';
          continue;
        }
        if (b.startsWith('### ')) {
          html += '<h3 style="font-size: 1.25rem; margin: 1.8rem 0 0.6rem 0; font-weight: 600; color: var(--text-primary); border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.35rem;">' + Utils.formatInline(b.replace(/^###\s+/, '')) + '</h3>';
          continue;
        }
        if (b.startsWith('## ')) {
          html += '<h2 style="font-size: 1.45rem; margin: 2.2rem 0 0.75rem 0; font-weight: 700; color: var(--text-primary); border-bottom: 1px solid var(--border-card); padding-bottom: 0.5rem;">' + Utils.formatInline(b.replace(/^##\s+/, '')) + '</h2>';
          continue;
        }

        // Blockquote
        if (b.startsWith('> ')) {
          const lines = b.split(/\r?\n/).map(l => l.replace(/^>\s*/, '')).join('<br>');
          html += '<blockquote style="border-left: 3px solid var(--gold-accent); margin: 1.25rem 0; padding: 0.8rem 1.1rem; background: var(--bg-input); border-radius: var(--radius-sm); font-style: italic; color: var(--text-secondary);">' + Utils.formatInline(lines) + '</blockquote>';
          continue;
        }

        // Unordered List
        if (/^[-*]\s+/m.test(b)) {
          const items = b.split(/\r?\n/).filter(l => /^[-*]\s+/.test(l.trim()));
          if (items.length > 0) {
            html += '<ul style="margin: 0.85rem 0 1.25rem 1.4rem; line-height: 1.65; color: var(--text-secondary);">';
            items.forEach(it => {
              html += '<li style="margin-bottom: 0.35rem;">' + Utils.formatInline(it.replace(/^[-*]\s+/, '')) + '</li>';
            });
            html += '</ul>';
            continue;
          }
        }

        // Numbered List
        if (/^\d+\.\s+/m.test(b)) {
          const items = b.split(/\r?\n/).filter(l => /^\d+\.\s+/.test(l.trim()));
          if (items.length > 0) {
            html += '<ol style="margin: 0.85rem 0 1.25rem 1.4rem; line-height: 1.65; color: var(--text-secondary);">';
            items.forEach(it => {
              html += '<li style="margin-bottom: 0.35rem;">' + Utils.formatInline(it.replace(/^\d+\.\s+/, '')) + '</li>';
            });
            html += '</ol>';
            continue;
          }
        }

        // Fenced Code Block
        if (b.startsWith('```')) {
          const lines = b.split(/\r?\n/);
          const codeText = lines.slice(1, lines[lines.length - 1].startsWith('```') ? -1 : undefined).join('\n');
          html += '<pre style="background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1rem 1.25rem; overflow-x: auto; margin: 1.5rem 0; font-family: var(--font-mono); font-size: 0.86rem; line-height: 1.5; color: var(--gold-accent);"><code>' + Utils.escapeHtml(codeText) + '</code></pre>';
          continue;
        }

        // Table
        if (b.includes('|') && b.split(/\r?\n/).length >= 2) {
          const rows = b.split(/\r?\n/).map(r => r.trim()).filter(r => r.startsWith('|') && r.endsWith('|'));
          if (rows.length >= 2) {
            html += '<div class="reader-table-wrap"><table class="reader-table">';
            rows.forEach((r, rIdx) => {
              if (r.includes('---')) return;
              const cells = r.split('|').slice(1, -1).map(c => c.trim());
              const tag = rIdx === 0 ? 'th' : 'td';
              html += '<tr>' + cells.map(c => '<' + tag + '>' + Utils.formatInline(c) + '</' + tag + '>').join('') + '</tr>';
            });
            html += '</table></div>';
            continue;
          }
        }

        // Regular Paragraph
        const pLines = b.split(/\r?\n/).join('<br>');
        html += '<p style="margin-bottom: 1.1rem; line-height: 1.7; color: var(--text-secondary); font-size: 1rem;">' + Utils.formatInline(pLines) + '</p>';
      }

      return html;
    },

    formatInline(str) {
      const codeRegex = new RegExp(String.fromCharCode(96) + '([^' + String.fromCharCode(96) + ']+)' + String.fromCharCode(96), 'g');
      return str
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="reader-link" data-href="$2">$1</a>')
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

        const speakerMatch = line.match(/^([А-ЯЁа-яёA-Za-z0-9_\s\(\)\.-]+):\s*(.*)$/);
        if (speakerMatch && !line.startsWith('[') && speakerMatch[1].length < 35) {
          flush();
          currentSpeaker = speakerMatch[1].trim();
          isGM = /мастер|гм|ведущий|gm/i.test(currentSpeaker);
          if (speakerMatch[2]) {
            currentEntryLines.push(speakerMatch[2]);
          }
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
    },

    renderQuoteParticipants(item) {
      const list = item.participants || [];
      if (list.length === 0) return '';
      const chips = list.map(p => `<span class="quote-chip ${p.badgeClass || 'tag-npc'}"><span class="quote-chip-dot"></span>${Utils.escapeHtml(p.name)}</span>`).join('');
      return `<div class="quote-participants">${chips}</div>`;
    },

    renderQuoteDialogue(item) {
      const blocks = item.blocks || [];

      if (blocks.length === 0) {
        return item.text ? `<div class="quote-narration">${Utils.escapeHtml(item.text)}</div>` : '';
      }

      const html = blocks.map(b => {
        if (b.type === 'narration') {
          return `<div class="quote-narration">${Utils.escapeHtml(b.text)}</div>`;
        }

        const who = (b.speaker || '').toLowerCase();
        const list = item.participants || [];
        const meta = who
          ? (list.find(p => p.name.toLowerCase() === who)
            || list.find(p => {
              const n = p.name.toLowerCase();
              return n.includes(who) || who.includes(n);
            }))
          : null;
        const cls = b.speaker ? ((meta && meta.badgeClass) || 'tag-npc') : '';

        let head = '';
        if (b.speaker || b.action) {
          const name = b.speaker ? `<span class="quote-line-speaker">${Utils.escapeHtml(b.speaker)}</span>` : '';
          const act = b.action ? `<span class="quote-line-action">(${Utils.escapeHtml(b.action)})</span>` : '';
          head = `<div>${name}${name && act ? ' ' : ''}${act}</div>`;
        }

        const body = b.text ? `<div class="quote-line-text">${Utils.escapeHtml(b.text)}</div>` : '';
        return `<div class="quote-line ${cls}">${head}${body}</div>`;
      }).join('');

      return `<div class="quote-dialogue">${html}</div>`;
    },

    quoteShareText(item, sessionTitle) {
      const lines = [];
      const parts = (item.participants || []).map(p => p.name).join(', ');
      const head = `«${sessionTitle || 'Порто-Инверно'}»` + (parts ? ` — ${parts}` : '');
      lines.push(head);
      if (item.title) lines.push(`*${item.title}*`);
      lines.push('');

      if (item.blocks && item.blocks.length > 0) {
        item.blocks.forEach(b => {
          if (b.type === 'narration') {
            lines.push(`_${b.text}_`);
          } else {
            const prefix = b.speaker ? `${b.speaker}${b.action ? ' (' + b.action + ')' : ''}: ` : '';
            lines.push(`${prefix}${b.text}`);
          }
        });
      } else if (item.text) {
        lines.push(item.text);
      }

      if (item.context) {
        lines.push('');
        lines.push(`(Контекст: ${item.context})`);
      }
      return lines.join('\n');
    }
  };

  // Encapsulated Navigation Manager
  const Navigation = {
    switchTab(tabKey, push = true) {
      AppState.activeTab = tabKey;

      DOM.navLinks.forEach(link => {
        const isTarget = link.getAttribute('data-tab') === tabKey;
        link.classList.toggle('active', isTarget);
      });

      DOM.viewPanels.forEach(panel => {
        panel.classList.remove('active');
      });

      if (tabKey === 'reader') {
        if (DOM.viewReader) DOM.viewReader.classList.add('active');
      } else {
        const activePanel = document.getElementById('view-' + tabKey);
        if (activePanel) activePanel.classList.add('active');

        // Re-render corresponding grid with individual error boundary
        try {
          if (tabKey === 'games') Grids.renderGames();
          else if (tabKey === 'transcripts') Grids.renderTranscripts();
          else if (tabKey === 'quotes') Grids.renderQuotes();
          else if (tabKey === 'psycho') Grids.renderPsycho();
          else if (tabKey === 'sanity') Grids.renderSanity();
          else if (tabKey === 'relationships') Grids.renderRelationships();
          else if (tabKey === 'calendar') Grids.renderCalendar();
          else if (tabKey === 'player-notes') Grids.renderFeedbacks();
          else if (tabKey === 'characters') Grids.renderCharacters();
        } catch (err) {
          console.error(`Error rendering tab ${tabKey}:`, err);
        }

        if (push) {
          history.pushState({ view: 'tab', tab: tabKey }, '', '#' + tabKey);
        }
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Grids Rendering Engine (DRY & Encapsulated)
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
          thesis: 'Стенограмма: ' + (item.linesCount ? item.linesCount + ' реплик' : 'полный текст диалогов'),
          footerLeft: '🎮 Игра: ' + item.realDate,
          actionText: 'Открыть запись',
          onClick: () => UnifiedReader.open('transcript', idx, true)
        });
      });
    },

    renderQuotes() {
      const sFilter = AppState.filters.quotesStoryline;
      const aFilter = AppState.filters.quotesAuthor;
      const cFilter = AppState.filters.quotesCategory;
      const query = AppState.searchQuery;

      if (AppState.quotesSelectedSession) {
        // Detailed View for single session
        if (DOM.quotesGrid) DOM.quotesGrid.style.display = 'none';
        if (DOM.quotesDetailView) DOM.quotesDetailView.style.display = 'block';

        const session = (DataStore.quotes || []).find(q => q.id === AppState.quotesSelectedSession);
        if (!session) {
          AppState.quotesSelectedSession = null;
          Grids.renderQuotes();
          return;
        }

        if (DOM.quoteDetailTitle) DOM.quoteDetailTitle.textContent = session.title;
        if (DOM.quoteDetailBranch) {
          DOM.quoteDetailBranch.textContent = session.category;
          DOM.quoteDetailBranch.className = 'badge-tag ' + Utils.getBranchClass(session.category);
        }
        if (DOM.quoteDetailDate) DOM.quoteDetailDate.textContent = '📅 ' + session.gameDate;
        if (DOM.quoteDetailTotal) DOM.quoteDetailTotal.textContent = '💬 ' + session.totalQuotesCount + ' цитат';

        if (DOM.quotesDetailSections) {
          DOM.quotesDetailSections.innerHTML = '';
          let totalRendered = 0;

          session.sections.forEach(sec => {
            if (cFilter !== 'all' && sec.category !== cFilter) return;

            const filteredItems = sec.items.filter(item => {
              const keys = item.participantKeys || [item.playerKey];
              const matchAuthor = aFilter === 'all' || keys.includes(aFilter);
              if (!matchAuthor) return false;

              if (!query) return true;
              const hay = [
                item.text,
                item.title || '',
                item.context || '',
                (item.participants || []).map(p => p.name).join(' ')
              ].join(' ').toLowerCase();
              return hay.includes(query);
            });

            if (filteredItems.length === 0) return;
            totalRendered += filteredItems.length;

            const block = document.createElement('div');
            block.className = 'quote-category-block';
            block.innerHTML = `
              <div class="quote-category-header">
                <span class="quote-cat-icon">${sec.icon}</span>
                <span class="quote-cat-name">${sec.category}</span>
                <span class="quote-cat-count">${filteredItems.length}</span>
              </div>
              <div class="quotes-category-list"></div>
            `;

            const listEl = block.querySelector('.quotes-category-list');
            filteredItems.forEach(item => {
              const card = document.createElement('div');
              card.className = 'quote-item-card';

              const titleHtml = item.title ? `<div class="quote-card-title">${Utils.escapeHtml(item.title)}</div>` : '';
              const contextHtml = item.context ? `<div class="quote-context-line">Контекст: ${Utils.escapeHtml(item.context)}</div>` : '';
              const participantsHtml = Utils.renderQuoteParticipants(item);

              card.innerHTML = `
                <div>
                  ${participantsHtml ? `<div class="quote-card-header">${participantsHtml}</div>` : ''}
                  ${titleHtml}
                  ${Utils.renderQuoteDialogue(item)}
                  ${contextHtml}
                </div>
                <div class="quote-footer-actions">
                  <button class="btn-quote-action btn-copy-quote">📋 Скопировать</button>
                  <button class="btn-quote-action btn-find-transcript">📜 В стенограмму</button>
                </div>
              `;

              // Copy button
              card.querySelector('.btn-copy-quote').addEventListener('click', (e) => {
                e.stopPropagation();
                const shareText = Utils.quoteShareText(item, session.title);
                navigator.clipboard.writeText(shareText).then(() => {
                  Utils.showToast('✓ Цитата скопирована для Telegram');
                }).catch(() => {
                  Utils.showToast('✓ Цитата скопирована');
                });
              });

              // Find in transcript button
              card.querySelector('.btn-find-transcript').addEventListener('click', (e) => {
                e.stopPropagation();
                const tIdx = DataStore.transcripts.findIndex(t => t.id === session.id);
                if (tIdx !== -1) {
                  UnifiedReader.open('transcript', tIdx, true);
                  if (DOM.readerFilterInput) {
                    const seed = item.searchSeed || item.text || '';
                    DOM.readerFilterInput.value = seed.slice(0, 40);
                    DOM.readerFilterInput.dispatchEvent(new Event('input'));
                  }
                } else {
                  Utils.showToast('Стенограмма сессии не найдена');
                }
              });

              listEl.appendChild(card);
            });

            DOM.quotesDetailSections.appendChild(block);
          });

          if (totalRendered === 0) {
            DOM.quotesDetailSections.innerHTML = '<div style="padding:4rem 1rem; text-align:center; color:var(--text-tertiary);">В этой игре нет цитат по выбранным фильтрам</div>';
          }
        }

      } else {
        // Grid View of all sessions with quotes
        if (DOM.quotesDetailView) DOM.quotesDetailView.style.display = 'none';
        if (DOM.quotesGrid) DOM.quotesGrid.style.display = 'grid';
        DOM.quotesGrid.innerHTML = '';

        const quotesData = DataStore.quotes || [];

        const items = quotesData.filter(session => {
          const matchFilter = sFilter === 'all' || 
            (sFilter === 'Соло' ? session.category.includes('Соло') : (session.branch === sFilter || session.category === sFilter));
          
          let hasMatchingQuotes = false;
          session.sections.forEach(sec => {
            if (cFilter !== 'all' && sec.category !== cFilter) return;
            sec.items.forEach(item => {
              const keys = item.participantKeys || [item.playerKey];
              if (aFilter !== 'all' && !keys.includes(aFilter)) return;
              if (query) {
                const hay = [
                  item.text,
                  item.title || '',
                  item.context || '',
                  (item.participants || []).map(p => p.name).join(' ')
                ].join(' ').toLowerCase();
                if (!hay.includes(query)) return;
              }
              hasMatchingQuotes = true;
            });
          });

          const matchSessionTitle = !query || session.title.toLowerCase().includes(query) || session.gameDate.toLowerCase().includes(query);

          return matchFilter && (hasMatchingQuotes || (!aFilter && !cFilter && matchSessionTitle));
        });

        if (items.length === 0) {
          DOM.quotesGrid.innerHTML = '<div style="grid-column:1/-1; padding:4rem 1rem; text-align:center; color:var(--text-tertiary);">Цитаты не найдены. Попробуйте изменить фильтр или поисковый запрос.</div>';
          return;
        }

        items.forEach(session => {
          const card = document.createElement('div');
          card.className = 'app-card';

          const categoryPills = session.sections.map(s => {
            return `<span class="badge-tag" style="background: var(--bg-input);">${s.icon} ${s.items.length}</span>`;
          }).join(' ');

          card.innerHTML = `
            <div>
              <div class="card-meta-row">
                <span class="date-pill">📅 ${session.gameDate}</span>
                <span class="badge-tag ${Utils.getBranchClass(session.category)}">${session.category}</span>
              </div>
              <h3 class="card-title">${session.title}</h3>
              <p class="card-thesis" style="margin-bottom: 0.75rem;">Сборник ярких цитат, диалогов и решений эпизода.</p>
              <div style="display: flex; gap: 0.35rem; flex-wrap: wrap; margin-bottom: 1rem;">
                ${categoryPills}
              </div>
            </div>
            <div class="card-footer-row">
              <span class="card-subtitle">💬 Всего цитат: ${session.totalQuotesCount}</span>
              <span class="card-action-link">Открыть цитатник →</span>
            </div>
          `;

          card.addEventListener('click', () => {
            AppState.quotesSelectedSession = session.id;
            history.pushState({ view: 'quotes-detail', sessionId: session.id }, '', '#quotes:' + session.id);
            Grids.renderQuotes();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          });

          DOM.quotesGrid.appendChild(card);
        });
      }
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
    },

    renderPsycho() {
      if (!DOM.psychoGrid) return;
      DOM.psychoGrid.innerHTML = '';

      const query = AppState.searchQuery;
      const filter = AppState.filters.psychoChar;

      const items = (DataStore.psycho || []).filter(item => {
        const matchFilter = filter === 'all' || item.characterKey === filter || (filter === 'duets' && item.characterKey === 'duets') || (filter === 'overview' && item.characterKey === 'overview');
        const matchSearch = !query ||
          item.title.toLowerCase().includes(query) ||
          (item.archetype && item.archetype.toLowerCase().includes(query)) ||
          (item.diagnosis1931 && item.diagnosis1931.toLowerCase().includes(query)) ||
          (item.summaryText && item.summaryText.toLowerCase().includes(query));
        return matchFilter && matchSearch;
      });

      if (items.length === 0) {
        DOM.psychoGrid.innerHTML = '<div style="grid-column:1/-1; padding:4rem 1rem; text-align:center; color:var(--text-tertiary);">Психологические досье не найдены</div>';
        return;
      }

      items.forEach(item => {
        const idx = DataStore.psycho.findIndex(p => p.id === item.id);
        const card = document.createElement('div');
        card.className = 'psycho-card';

        const avatarCls = item.badgeClass || 'tag-solo';
        const quoteHtml = item.manifestQuote ? `<div class="psycho-quote-snippet">${Utils.escapeHtml(item.manifestQuote)}</div>` : '';
        const riskCls = item.riskClass || 'risk-high';
        const riskTxt = item.riskLevel || 'Экспертиза';
        const initTxt = item.initial || '🧠';

        card.innerHTML = `
          <div>
            <div class="psycho-stamp ${riskCls}">${Utils.escapeHtml(riskTxt)}</div>
            <div class="psycho-header">
              <div class="psycho-avatar ${avatarCls}">${Utils.escapeHtml(initTxt)}</div>
              <div>
                <h3 class="card-title" style="margin-bottom:0.15rem;">${Utils.escapeHtml(item.title)}</h3>
                <span class="badge-tag ${avatarCls}">${Utils.escapeHtml(item.archetype || item.role)}</span>
              </div>
            </div>

            <div class="psycho-diag-block">
              <div class="psycho-diag-item">
                <span class="psycho-diag-label">Диагноз (1931 г.):</span>
                <span class="psycho-diag-val">${Utils.escapeHtml(item.diagnosis1931)}</span>
              </div>
              <div class="psycho-diag-item">
                <span class="psycho-diag-label">Клинический срез:</span>
                <span class="psycho-diag-val" style="font-size:0.78rem; color:var(--text-secondary);">${Utils.escapeHtml(item.diagnosisModern)}</span>
              </div>
            </div>

            <p class="card-thesis" style="font-size:0.84rem; line-height:1.55; margin-bottom:0.6rem;">${Utils.escapeHtml(item.summaryText)}</p>
            ${quoteHtml}
          </div>

          <div class="card-footer-row" style="margin-top:1rem; padding-top:0.75rem; border-top:1px solid var(--border-subtle);">
            <span class="card-subtitle">📁 Судебная экспертиза</span>
            <span class="card-action-link">Читать полный разбор →</span>
          </div>
        `;

        card.addEventListener('click', () => UnifiedReader.open('psycho', idx, true));
        DOM.psychoGrid.appendChild(card);
      });
    },

    renderSanity() {
      if (!DOM.sanityDashboardContainer) return;
      DOM.sanityDashboardContainer.innerHTML = '';

      const heroKey = AppState.sanityHero || 'molly';
      const allSanity = DataStore.sanityTimeline || {};
      const hero = allSanity[heroKey];

      if (!hero || !hero.points || hero.points.length === 0) {
        DOM.sanityDashboardContainer.innerHTML = '<div style="padding:4rem 1rem; text-align:center; color:var(--text-tertiary);">Данные ментальной шкалы недоступны</div>';
        return;
      }

      const points = hero.points;
      let selIdx = AppState.sanitySelectedPointIndex;
      if (selIdx < 0 || selIdx >= points.length) selIdx = points.length - 1;
      const selPoint = points[selIdx];

      // 1. Hero Summary Header Card
      const heroAvatarInitial = heroKey === 'molly' ? 'М' : heroKey === 'heather' ? 'Х' : heroKey === 'aiden' ? 'Э' : 'Г';
      const currentScoreColor = hero.currentScore >= 70 ? 'var(--status-alive-text)' : hero.currentScore >= 40 ? 'var(--status-warning-text)' : 'var(--status-dead-text)';

      const dashboard = document.createElement('div');
      dashboard.className = 'sanity-dashboard';

      dashboard.innerHTML = `
        <div class="sanity-hero-card">
          <div class="sanity-hero-top">
            <div class="sanity-hero-info">
              <div class="sanity-hero-avatar ${hero.badgeClass}">${heroAvatarInitial}</div>
              <div class="sanity-hero-title-group">
                <h3>${Utils.escapeHtml(hero.characterName)}</h3>
                <span class="badge-tag ${hero.badgeClass}">${Utils.escapeHtml(hero.archetype)}</span>
              </div>
            </div>
            <div class="sanity-score-badge">
              <span style="font-size:0.78rem; color:var(--text-tertiary); text-transform:uppercase; font-weight:700;">Текущая стабильность:</span>
              <span class="sanity-score-num" style="color:${currentScoreColor};">${hero.currentScore}%</span>
            </div>
          </div>

          <div class="sanity-hero-meta-grid">
            <div class="sanity-meta-box">
              <span class="sanity-meta-label">Базовая травма:</span>
              <span class="sanity-meta-val">${Utils.escapeHtml(hero.baseTrauma)}</span>
            </div>
            <div class="sanity-meta-box">
              <span class="sanity-meta-label">Ключевой фактор риска:</span>
              <span class="sanity-meta-val">${Utils.escapeHtml(hero.primaryRisk)}</span>
            </div>
          </div>
        </div>

        <!-- Chart Card -->
        <div class="sanity-chart-card">
          <div class="sanity-chart-header">
            <div>
              <h4 style="font-size:1.05rem; font-weight:700; color:var(--text-primary);">Интерактивная кардиограмма стабильности</h4>
              <p style="font-size:0.8rem; color:var(--text-tertiary);">Нажмите на любую точку хронологии, чтобы изучить фактор слома и реакцию героя</p>
            </div>
            <div class="sanity-chart-legend">
              <span><span class="legend-dot" style="background:#30d158;"></span>Контроль (>70%)</span>
              <span><span class="legend-dot" style="background:#ff9f0a;"></span>Тревога (40–70%)</span>
              <span><span class="legend-dot" style="background:#ff453a;"></span>Кризис / Срыв (&lt;40%)</span>
            </div>
          </div>

          <div class="sanity-svg-wrap">
            <svg class="sanity-svg" viewBox="0 0 900 280" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="sanityLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stop-color="var(--accent)" />
                  <stop offset="100%" stop-color="var(--gold-accent)" />
                </linearGradient>
                <linearGradient id="zoneGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(48, 209, 88, 0.12)" />
                  <stop offset="100%" stop-color="rgba(48, 209, 88, 0.02)" />
                </linearGradient>
                <linearGradient id="zoneOrange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(255, 159, 10, 0.1)" />
                  <stop offset="100%" stop-color="rgba(255, 159, 10, 0.02)" />
                </linearGradient>
                <linearGradient id="zoneRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(255, 69, 58, 0.15)" />
                  <stop offset="100%" stop-color="rgba(255, 69, 58, 0.04)" />
                </linearGradient>
              </defs>

              <!-- Background Risk Zones -->
              <rect x="50" y="20" width="820" height="70" fill="url(#zoneGreen)" rx="4" />
              <rect x="50" y="90" width="820" height="75" fill="url(#zoneOrange)" rx="4" />
              <rect x="50" y="165" width="820" height="75" fill="url(#zoneRed)" rx="4" />

              <!-- Horizontal Grid Lines -->
              <line x1="50" y1="20" x2="870" y2="20" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4" />
              <text x="42" y="24" fill="var(--text-tertiary)" font-size="10" text-anchor="end" font-family="var(--font-mono)">100%</text>

              <line x1="50" y1="90" x2="870" y2="90" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4" />
              <text x="42" y="94" fill="var(--text-tertiary)" font-size="10" text-anchor="end" font-family="var(--font-mono)">70%</text>

              <line x1="50" y1="165" x2="870" y2="165" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4" />
              <text x="42" y="169" fill="var(--text-tertiary)" font-size="10" text-anchor="end" font-family="var(--font-mono)">40%</text>

              <line x1="50" y1="240" x2="870" y2="240" stroke="rgba(255,255,255,0.08)" stroke-dasharray="4" />
              <text x="42" y="244" fill="var(--text-tertiary)" font-size="10" text-anchor="end" font-family="var(--font-mono)">0%</text>

              <!-- Main Curve -->
              <polyline id="sanityPolyline" fill="none" stroke="url(#sanityLineGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

              <!-- Nodes Container -->
              <g id="sanitySvgNodes"></g>
            </svg>
          </div>
        </div>

        <!-- Detail Breakdown Card -->
        <div class="sanity-detail-card">
          <div class="sanity-detail-header">
            <div class="sanity-detail-title-group">
              <h4>${Utils.escapeHtml(selPoint.title)}</h4>
              <span class="sanity-detail-date">📅 ${Utils.escapeHtml(selPoint.gameDate)}</span>
            </div>
            <span class="badge-tag ${selPoint.statusClass}" style="font-size:0.88rem; font-weight:700; background:rgba(255,255,255,0.06); padding:0.4rem 0.85rem;">
              Стабильность: ${selPoint.score}% (${selPoint.status})
            </span>
          </div>

          <div class="sanity-detail-body">
            <div class="sanity-detail-field">
              <span class="sanity-detail-label">⚡ Триггерное событие / Фактор слома:</span>
              <p style="color:var(--text-primary);">${Utils.escapeHtml(selPoint.trigger)}</p>
            </div>
            <div class="sanity-detail-field">
              <span class="sanity-detail-label">🧠 Психологическая реакция:</span>
              <p style="color:var(--text-secondary);">${Utils.escapeHtml(selPoint.reaction)}</p>
            </div>
            <div class="sanity-quote-box">
              ${Utils.escapeHtml(selPoint.quote)}
            </div>
          </div>

          <div class="sanity-detail-actions">
            ${selPoint.chapterId ? `<button class="btn-quote-action" id="btnSanityOpenChapter">📖 Читать главу сессии</button>` : ''}
          </div>
        </div>
      `;

      DOM.sanityDashboardContainer.appendChild(dashboard);

      // Compute node coordinates and populate SVG
      const padX = 70;
      const chartW = 870 - padX;
      const topY = 20;
      const botY = 240;
      const rangeY = botY - topY;

      const coords = points.map((p, idx) => {
        const x = points.length === 1 ? padX + chartW / 2 : padX + (idx / (points.length - 1)) * chartW;
        const y = botY - (p.score / 100) * rangeY;
        return { x, y, p, idx };
      });

      const polylineEl = dashboard.querySelector('#sanityPolyline');
      if (polylineEl) {
        polylineEl.setAttribute('points', coords.map(c => `${c.x},${c.y}`).join(' '));
      }

      const nodesGroup = dashboard.querySelector('#sanitySvgNodes');
      if (nodesGroup) {
        coords.forEach(c => {
          const isAct = c.idx === selIdx;
          const isCritical = c.p.score < 30;
          const nodeColor = c.p.score >= 70 ? '#30d158' : c.p.score >= 40 ? '#ff9f0a' : '#ff453a';

          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.setAttribute('class', `sanity-node ${isAct ? 'active' : ''}`);
          g.style.color = nodeColor;

          let pulseHtml = '';
          if (isCritical) {
            pulseHtml = `<circle class="sanity-pulse-ring" cx="${c.x}" cy="${c.y}" r="12" fill="none" stroke="${nodeColor}" stroke-width="1.5" />`;
          }

          g.innerHTML = `
            <title>${Utils.escapeHtml(c.p.title)} (${c.p.gameDate}): Стабильность ${c.p.score}% — ${Utils.escapeHtml(c.p.status)}</title>
            ${pulseHtml}
            <circle class="point-circle" cx="${c.x}" cy="${c.y}" r="${isAct ? '10' : '7'}" fill="${nodeColor}" stroke="${isAct ? '#ffffff' : 'rgba(0,0,0,0.6)'}" stroke-width="${isAct ? '3' : '2'}" />
            <text x="${c.x}" y="${botY + 22}" fill="${isAct ? 'var(--text-primary)' : 'var(--text-tertiary)'}" font-size="10" font-weight="${isAct ? '700' : '500'}" text-anchor="middle" font-family="var(--font-sans)">
              ${c.p.gameDate.split(',')[0].replace(' 1931', '').trim()}
            </text>
            <text x="${c.x}" y="${c.y - 12}" fill="${nodeColor}" font-size="10" font-weight="700" text-anchor="middle" font-family="var(--font-mono)">
              ${c.p.score}%
            </text>
          `;

          g.addEventListener('click', () => {
            AppState.sanitySelectedPointIndex = c.idx;
            Grids.renderSanity();
          });

          nodesGroup.appendChild(g);
        });
      }

      // Action Button listener
      const btnOpenChapter = dashboard.querySelector('#btnSanityOpenChapter');
      if (btnOpenChapter && selPoint.chapterId) {
        btnOpenChapter.addEventListener('click', () => {
          const sumIdx = (DataStore.summaries || []).findIndex(s => s.id === selPoint.chapterId);
          if (sumIdx !== -1) {
            UnifiedReader.open('chapter', sumIdx, true);
          } else {
            Navigation.switchTab('games', true);
          }
        });
      }
    },

    renderRelationships() {
      if (!DOM.relationshipsContainer) return;
      DOM.relationshipsContainer.innerHTML = '';

      const pairKey = AppState.selectedRelationshipPair || 'molly-heather';
      const allRels = DataStore.relationships || {};
      const rel = allRels[pairKey];

      if (!rel || !rel.stages || rel.stages.length === 0) {
        DOM.relationshipsContainer.innerHTML = '<div style="padding:4rem 1rem; text-align:center; color:var(--text-tertiary);">Данные динамики отношений недоступны</div>';
        return;
      }

      const stages = rel.stages;
      let selIdx = AppState.selectedRelationshipStageIndex;
      if (selIdx < 0 || selIdx >= stages.length) selIdx = 0;
      const currentStage = stages[selIdx];

      const getInitial = (name) => {
        if (!name) return '?';
        if (name.includes('Молли')) return 'М';
        if (name.includes('Хизер')) return 'Х';
        if (name.includes('Эйден')) return 'Э';
        if (name.includes('Грейвз') || name.includes('Малкольм')) return 'Г';
        if (name.includes('Адам')) return 'А';
        if (name.includes('Крауч')) return 'К';
        if (name.includes('Риган') || name.includes('Джек')) return 'Р';
        if (name.includes('Сильвия')) return 'С';
        if (name.includes('Оливер')) return 'О';
        if (name.includes('Иван')) return 'И';
        if (name.includes('Гектор') || name.includes('Гринго')) return 'Г';
        return name.charAt(0);
      };

      const getTagClass = (name) => {
        if (!name) return 'tag-solo';
        if (name.includes('Молли')) return 'tag-molly';
        if (name.includes('Хизер')) return 'tag-heather';
        if (name.includes('Эйден')) return 'tag-aiden';
        if (name.includes('Грейвз') || name.includes('Малкольм')) return 'tag-graves';
        if (name.includes('Адам')) return 'tag-solo';
        if (name.includes('Крауч')) return 'tag-aiden';
        if (name.includes('Риган')) return 'tag-molly';
        if (name.includes('Сильвия') || name.includes('Оливер') || name.includes('Иван')) return 'tag-heather';
        if (name.includes('Гектор') || name.includes('Гринго')) return 'tag-aiden';
        return 'tag-solo';
      };

      const container = document.createElement('div');
      container.className = 'relationship-dashboard';

      container.innerHTML = `
        <!-- 1. Hero Pair Header Card -->
        <div class="rel-hero-card">
          <div class="rel-hero-top">
            <div class="rel-duo-avatars">
              <div class="rel-avatar ${getTagClass(rel.char1)}">${getInitial(rel.char1)}</div>
              <div class="rel-avatar-connector">⟷</div>
              <div class="rel-avatar ${getTagClass(rel.char2)}">${getInitial(rel.char2)}</div>
            </div>
            <div class="rel-hero-title-group">
              <h3>${Utils.escapeHtml(rel.pairName)}</h3>
              <div class="rel-badges-row">
                <span class="badge-tag ${rel.badgeClass || 'tag-molly'}">${Utils.escapeHtml(rel.archetype)}</span>
                <span class="rel-status-pill">${Utils.escapeHtml(rel.status)}</span>
              </div>
            </div>
          </div>
          <p class="rel-hero-summary">${Utils.escapeHtml(rel.summary)}</p>
        </div>

        <!-- 2. Interactive Stepper Timeline / Time Slider -->
        <div class="rel-stepper-card">
          <div class="rel-stepper-header">
            <div>
              <h4>Хронологический слайдер динамики отношений (1931)</h4>
              <p>Нажмите на любую фазу, чтобы изучить смещение баланса доверия, напряжения и привязанности</p>
            </div>
            <span class="rel-step-counter">Фаза ${selIdx + 1} из ${stages.length}</span>
          </div>

          <div class="rel-timeline-track">
            ${stages.map((st, idx) => {
              const isAct = idx === selIdx;
              const isPassed = idx < selIdx;
              return `
                <div class="rel-step-node ${isAct ? 'active' : ''} ${isPassed ? 'passed' : ''}" data-stage-idx="${idx}">
                  <div class="rel-step-circle">
                    <span class="rel-step-num">${idx + 1}</span>
                  </div>
                  <div class="rel-step-labels">
                    <span class="rel-step-date">${Utils.escapeHtml(st.gameDate)}</span>
                    <span class="rel-step-title">${Utils.escapeHtml(st.title)}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 3. Dynamic Multi-Metric Level Meters -->
        <div class="rel-metrics-card">
          <h4 class="rel-metrics-title">Психологический баланс фазы: «${Utils.escapeHtml(currentStage.title)}»</h4>
          <div class="rel-metrics-grid">
            <!-- Trust Meter -->
            <div class="rel-metric-box">
              <div class="rel-metric-top">
                <span class="rel-metric-label">🟢 Уровень взаимного доверия:</span>
                <span class="rel-metric-val" style="color:#30d158;">${currentStage.trust}%</span>
              </div>
              <div class="metric-bar-wrap">
                <div class="metric-bar-fill" style="width:${currentStage.trust}%; background: linear-gradient(90deg, #30d158, #34c759);"></div>
              </div>
            </div>

            <!-- Codependency Meter -->
            <div class="rel-metric-box">
              <div class="rel-metric-top">
                <span class="rel-metric-label">🟣 Созависимость / Привязанность:</span>
                <span class="rel-metric-val" style="color:#bf5af2;">${currentStage.codependency}%</span>
              </div>
              <div class="metric-bar-wrap">
                <div class="metric-bar-fill" style="width:${currentStage.codependency}%; background: linear-gradient(90deg, #af52de, #bf5af2);"></div>
              </div>
            </div>

            <!-- Tension Meter -->
            <div class="rel-metric-box">
              <div class="rel-metric-top">
                <span class="rel-metric-label">🔴 Напряжение / Уровень конфликта:</span>
                <span class="rel-metric-val" style="color:#ff453a;">${currentStage.tension}%</span>
              </div>
              <div class="metric-bar-wrap">
                <div class="metric-bar-fill" style="width:${currentStage.tension}%; background: linear-gradient(90deg, #ff9f0a, #ff453a);"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. Detailed Stage Breakdown Card -->
        <div class="rel-detail-card">
          <div class="rel-detail-header">
            <div class="rel-detail-title-group">
              <div class="rel-detail-badge-row">
                <span class="date-pill">${Utils.escapeHtml(currentStage.gameDate)}</span>
                <span class="badge-tag ${rel.badgeClass || 'tag-molly'}">${Utils.escapeHtml(currentStage.sessionKey)}</span>
                <span class="${currentStage.statusClass || 'status-alive-text'}" style="font-weight:700; font-size:0.85rem;">● ${Utils.escapeHtml(currentStage.status)}</span>
              </div>
              <h3 class="rel-detail-heading">${Utils.escapeHtml(currentStage.title)}</h3>
            </div>

            ${currentStage.chapterId ? `
              <button class="btn-icon-text" id="btnRelOpenChapter" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-card); padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; cursor: pointer; color: var(--gold-accent);">
                📖 Читать главу
              </button>
            ` : ''}
          </div>

          <div class="rel-detail-body">
            <!-- Event Trigger Description -->
            <div class="rel-info-section">
              <h5 class="rel-section-label">⚡ Событийный триггер и поворот сюжета:</h5>
              <p class="rel-section-text">${Utils.escapeHtml(currentStage.description)}</p>
            </div>

            <!-- Dialogue / Quote Box -->
            ${currentStage.quote ? `
              <div class="rel-quote-box">
                <div class="rel-quote-icon">💬</div>
                <div class="rel-quote-content">
                  <span class="rel-quote-label">Знаковый диалог / Манифест:</span>
                  <p class="rel-quote-text">${Utils.escapeHtml(currentStage.quote)}</p>
                </div>
              </div>
            ` : ''}

            <!-- Clinical / Psychological Analysis -->
            <div class="rel-psychology-box">
              <div class="rel-psych-icon">🧠</div>
              <div class="rel-psych-content">
                <span class="rel-psych-label">Клинико-психологический анализ динамики:</span>
                <p class="rel-psych-text">${Utils.escapeHtml(currentStage.psychology)}</p>
              </div>
            </div>
          </div>
        </div>
      `;

      // Attach Step Nodes listeners
      container.querySelectorAll('.rel-step-node').forEach(node => {
        node.addEventListener('click', () => {
          const idx = parseInt(node.getAttribute('data-stage-idx') || '0', 10);
          AppState.selectedRelationshipStageIndex = idx;
          Grids.renderRelationships();
        });
      });

      // Attach Open Chapter button
      const btnOpenChapter = container.querySelector('#btnRelOpenChapter');
      if (btnOpenChapter && currentStage.chapterId) {
        btnOpenChapter.addEventListener('click', () => {
          const sumIdx = (DataStore.summaries || []).findIndex(s => s.id === currentStage.chapterId);
          if (sumIdx !== -1) {
            UnifiedReader.open('chapter', sumIdx, true);
          } else {
            Navigation.switchTab('games', true);
          }
        });
      }

      DOM.relationshipsContainer.appendChild(container);
    },

    renderCalendar() {
      if (!DOM.calendarContainer) return;
      DOM.calendarContainer.innerHTML = '';

      const calendarData = DataStore.calendar || { days: {}, monthInfo: {} };
      const daysMap = calendarData.days || {};
      const monthInfo = calendarData.monthInfo || { year: 1931, month: 10, totalDays: 31, startDayOfWeek: 4 };

      // Apply branch and threat filters
      const filterBranch = AppState.filters.calendarBranch || 'all';
      const filterThreat = AppState.filters.calendarThreat || 'all';

      let selDateKey = AppState.selectedCalendarDate || '1931-10-14';
      if (!daysMap[selDateKey]) {
        const availableDates = Object.keys(daysMap).sort();
        selDateKey = availableDates[0] || '1931-10-09';
        AppState.selectedCalendarDate = selDateKey;
      }

      const selDayData = daysMap[selDateKey] || null;

      // Filter incidents for currently selected day
      let displayedIncidents = [];
      if (selDayData && selDayData.incidents) {
        displayedIncidents = selDayData.incidents.filter(inc => {
          if (filterBranch !== 'all' && inc.branch !== filterBranch) return false;
          if (filterThreat === 'critical' && selDayData.threatClass !== 'threat-critical') return false;
          if (filterThreat === 'high' && selDayData.threatClass !== 'threat-high' && selDayData.threatClass !== 'threat-critical') return false;
          return true;
        });
      }

      const container = document.createElement('div');
      container.className = 'calendar-dashboard';

      // 1. Quick Presets Bar
      const presetsHtml = `
        <div class="calendar-presets-bar">
          <span class="preset-label">Ключевые даты:</span>
          <div class="preset-chips">
            <button class="preset-btn ${selDateKey === '1931-10-09' ? 'active' : ''}" data-date="1931-10-09">🌉 9 окт (Мост & Захват)</button>
            <button class="preset-btn ${selDateKey === '1931-10-10' ? 'active' : ''}" data-date="1931-10-10">🌧️ 10 окт (Покушение на Хизер)</button>
            <button class="preset-btn ${selDateKey === '1931-10-13' ? 'active' : ''}" data-date="1931-10-13">🪜 13 окт (Форточка & Тюрьма)</button>
            <button class="preset-btn ${selDateKey === '1931-10-14' ? 'active' : ''}" data-date="1931-10-14">🩸 14 окт (Кровавая среда)</button>
            <button class="preset-btn ${selDateKey === '1931-10-20' ? 'active' : ''}" data-date="1931-10-20">💔 20 окт (Гибель Каролины)</button>
            <button class="preset-btn ${selDateKey === '1931-10-24' ? 'active' : ''}" data-date="1931-10-24">🎖️ 24 окт (Сбор Крауча & Риган)</button>
            <button class="preset-btn ${selDateKey === '1931-10-25' ? 'active' : ''}" data-date="1931-10-25">🔥 25 окт (Пекарня & Суд Крауча)</button>
            <button class="preset-btn ${selDateKey === '1931-10-26' ? 'active' : ''}" data-date="1931-10-26">🕊️ 26 окт (Кухонный пакт)</button>
          </div>
        </div>
      `;

      // 2. Monthly Grid Calculation
      const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      let offset = (monthInfo.startDayOfWeek === 0 ? 7 : monthInfo.startDayOfWeek) - 1; // for Thu (4): offset = 3

      let gridCellsHtml = '';
      for (let i = 0; i < offset; i++) {
        gridCellsHtml += `<div class="cal-cell empty"></div>`;
      }

      for (let d = 1; d <= monthInfo.totalDays; d++) {
        const dayStr = d < 10 ? '0' + d : '' + d;
        const dateKey = `1931-10-${dayStr}`;
        const dayObj = daysMap[dateKey];
        const isSelected = dateKey === selDateKey;
        const hasIncidents = Boolean(dayObj && dayObj.incidents && dayObj.incidents.length > 0);

        let threatClass = dayObj ? (dayObj.threatClass || 'threat-medium') : '';
        let incCount = dayObj && dayObj.incidents ? dayObj.incidents.length : 0;

        gridCellsHtml += `
          <div class="cal-cell ${hasIncidents ? 'has-events' : ''} ${isSelected ? 'selected' : ''} ${threatClass}" data-date="${dateKey}">
            <div class="cal-cell-header">
              <span class="cal-cell-day">${d}</span>
              ${incCount > 0 ? `<span class="cal-inc-badge">${incCount}</span>` : ''}
            </div>
            ${hasIncidents ? `
              <div class="cal-dots-row">
                ${dayObj.incidents.some(i => i.branch.includes('Молли')) ? '<span class="cal-dot dot-molly" title="Молли & Хизер"></span>' : ''}
                ${dayObj.incidents.some(i => i.branch.includes('Эйден')) ? '<span class="cal-dot dot-aiden" title="Эйден & Малкольм"></span>' : ''}
              </div>
            ` : ''}
          </div>
        `;
      }

      container.innerHTML = `
        <!-- Quick Preset Jumps -->
        ${presetsHtml}

        <!-- Month Grid Card -->
        <div class="cal-month-card">
          <div class="cal-month-header">
            <div class="cal-month-title">
              <span class="cal-month-icon">🗓️</span>
              <h3>Октябрь 1931</h3>
            </div>
            <div class="cal-legend">
              <span class="legend-item"><span class="legend-dot dot-critical"></span> Чрезвычайный</span>
              <span class="legend-item"><span class="legend-dot dot-high"></span> Высокая угроза</span>
              <span class="legend-item"><span class="cal-dot dot-molly"></span> Ветка Девушек</span>
              <span class="legend-item"><span class="cal-dot dot-aiden"></span> Ветка Парней</span>
            </div>
          </div>

          <div class="cal-weekdays-row">
            ${weekdays.map(w => `<div class="cal-weekday">${w}</div>`).join('')}
          </div>

          <div class="cal-grid">
            ${gridCellsHtml}
          </div>
        </div>

        <!-- Selected Day Dossier Inspector -->
        ${selDayData ? `
          <div class="cal-day-inspector">
            <div class="cal-inspector-header">
              <div class="cal-inspector-title-group">
                <div class="cal-inspector-meta">
                  <span class="date-pill" style="font-size:0.95rem; font-weight:700;">📅 ${Utils.escapeHtml(selDayData.displayDate)}, ${Utils.escapeHtml(selDayData.dayOfWeek)}</span>
                  <span class="threat-pill ${selDayData.threatClass || 'threat-high'}">⚠️ ${Utils.escapeHtml(selDayData.threatLevel)}</span>
                </div>
                <h3 class="cal-inspector-headline">${Utils.escapeHtml(selDayData.headline)}</h3>
                <p class="cal-inspector-summary">${Utils.escapeHtml(selDayData.summary)}</p>
              </div>
            </div>

            <!-- Incidents Timeline for Selected Day -->
            <div class="cal-incidents-timeline">
              <h4 class="cal-timeline-title">Хроника операций дня (${displayedIncidents.length} инцидентов)</h4>
              
              ${displayedIncidents.length === 0 ? `
                <div style="padding:2rem; text-align:center; color:var(--text-tertiary);">Нет инцидентов, соответствующих выбранным фильтрам.</div>
              ` : displayedIncidents.map((inc, iIdx) => `
                <div class="cal-incident-card">
                  <div class="cal-inc-header">
                    <div class="cal-inc-time-group">
                      <span class="cal-time-pill">${Utils.escapeHtml(inc.time)} (${Utils.escapeHtml(inc.timeOfDay)})</span>
                      <span class="badge-tag ${inc.badgeClass || 'tag-solo'}">${Utils.escapeHtml(inc.branch)}</span>
                    </div>
                    ${inc.chapterId ? `
                      <button class="btn-icon-text btn-cal-read" data-chapter-id="${Utils.escapeHtml(inc.chapterId)}" style="background: var(--bg-surface-elevated); border: 1px solid var(--border-card); padding: 6px 14px; border-radius: 8px; font-size: 0.82rem; font-weight: 600; cursor: pointer; color: var(--gold-accent);">
                        📖 Читать главу
                      </button>
                    ` : ''}
                  </div>

                  <h4 class="cal-inc-title">${Utils.escapeHtml(inc.title)}</h4>
                  
                  <div class="cal-inc-location">
                    <span class="loc-icon">📍</span>
                    <span class="loc-text">${Utils.escapeHtml(inc.location)}</span>
                  </div>

                  <p class="cal-inc-desc">${Utils.escapeHtml(inc.description)}</p>

                  <!-- Participants -->
                  ${inc.participants && inc.participants.length > 0 ? `
                    <div class="cal-inc-participants">
                      <span class="part-label">Участники:</span>
                      <div class="part-chips">
                        ${inc.participants.map(p => `<span class="part-chip">${Utils.escapeHtml(p)}</span>`).join('')}
                      </div>
                    </div>
                  ` : ''}

                  <!-- Quote Callout -->
                  ${inc.quote ? `
                    <div class="cal-inc-quote">
                      <span class="quote-icon">💬</span>
                      <span class="quote-text">${Utils.escapeHtml(inc.quote)}</span>
                    </div>
                  ` : ''}

                  <!-- Intelligence Box -->
                  ${inc.intel ? `
                    <div class="cal-inc-intel">
                      <span class="intel-icon">🕵️</span>
                      <div class="intel-content">
                        <span class="intel-label">Разведданные заговора:</span>
                        <span class="intel-text">${Utils.escapeHtml(inc.intel)}</span>
                      </div>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="cal-day-inspector" style="text-align:center; padding:3rem 1rem; color:var(--text-tertiary);">
            В этот день в Порто-Инверно не зафиксировано боевых операций синдиката.
          </div>
        `}
      `;

      // Attach Click handlers to calendar cells
      container.querySelectorAll('.cal-cell.has-events').forEach(cell => {
        cell.addEventListener('click', () => {
          const dt = cell.getAttribute('data-date');
          if (dt) {
            AppState.selectedCalendarDate = dt;
            Grids.renderCalendar();
          }
        });
      });

      // Attach Click handlers to preset buttons
      container.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const dt = btn.getAttribute('data-date');
          if (dt) {
            AppState.selectedCalendarDate = dt;
            Grids.renderCalendar();
          }
        });
      });

      // Attach Chapter Read buttons
      container.querySelectorAll('.btn-cal-read').forEach(btn => {
        btn.addEventListener('click', () => {
          const chapId = btn.getAttribute('data-chapter-id');
          const sumIdx = (DataStore.summaries || []).findIndex(s => s.id === chapId);
          if (sumIdx !== -1) {
            UnifiedReader.open('chapter', sumIdx, true);
          } else {
            Navigation.switchTab('games', true);
          }
        });
      });

      DOM.calendarContainer.appendChild(container);
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
      } else if (docType === 'psycho') {
        doc = DataStore.psycho[index];
        totalCount = (DataStore.psycho || []).length;
        backTab = 'psycho';
        backLabel = '← К псих. архиву';
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
      DOM.readerCategory.textContent = doc.category || doc.archetype || doc.characterName || 'Психологический профиль';
      DOM.readerCategory.className = 'badge-tag ' + (doc.badgeClass || Utils.getBranchClass(doc.category));
      DOM.readerDate.textContent = '📅 ' + (doc.gameDate || doc.date || doc.readTime || 'Октябрь 1931');
      DOM.readerReadTime.textContent = '⏳ ' + (doc.riskLevel ? 'Риск: ' + doc.riskLevel : (doc.readTime || (doc.linesCount ? doc.linesCount + ' строк' : '')));
      DOM.readerTitle.textContent = doc.title;
      DOM.readerThesis.textContent = doc.thesis ? '«' + doc.thesis + '»' : (doc.diagnosis1931 ? '«' + doc.diagnosis1931 + '»' : (doc.role ? '«' + doc.role + '»' : ''));
      DOM.readerThesis.style.display = (doc.thesis || doc.role || doc.diagnosis1931) ? 'block' : 'none';

      // Prev / Next
      DOM.btnPrev.disabled = index <= 0;
      DOM.btnNext.disabled = index >= totalCount - 1;

      // Update Notes Counter & Cloud Fetch
      NotesUI.updateNotesBadge();
      const currentDocKey = NotesUI.getCurrentDocKey();
      if (currentDocKey) {
        AnnotationsService.fetchDocNotes(currentDocKey);
      }

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
      else if (docType === 'psycho') folder = 'psycho';

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
      if (docType === 'chapter' || docType === 'psycho') {
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

      // Inject Player Annotations and Stickers
      setTimeout(() => {
        NotesUI.renderDocHighlights();
      }, 70);
    }
  };

  // =========================================================================
  // ANNOTATIONS & PLAYER NOTES SERVICE (CLOUD + LOCAL STORAGE)
  // =========================================================================
  const AnnotationsService = {
    storageKey: 'porto_player_notes_v1',
    cloudApiUrl: 'https://api.restful-api.dev/objects',
    cloudIndexKey: 'porto_inverno_notes_registry_v1',
    cache: {}, // { [docKey]: [Note, Note, ...] }

    init() {
      try {
        const local = localStorage.getItem(this.storageKey);
        if (local) {
          this.cache = JSON.parse(local) || {};
        }
      } catch (e) {
        console.warn('LocalStorage error:', e);
        this.cache = {};
      }
    },

    saveToLocal() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.cache));
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
    },

    getNotes(docKey) {
      return this.cache[docKey] || [];
    },

    getDocCount(docKey) {
      return (this.cache[docKey] || []).length;
    },

    async addNote(note) {
      if (!note.docKey) return null;
      if (!this.cache[note.docKey]) {
        this.cache[note.docKey] = [];
      }
      this.cache[note.docKey].push(note);
      this.saveToLocal();

      // Background Cloud Sync
      this.syncNoteToCloud(note).catch(err => console.warn('Cloud sync error:', err));
      return note;
    },

    async removeNote(docKey, noteId) {
      if (!this.cache[docKey]) return false;
      const idx = this.cache[docKey].findIndex(n => n.id === noteId);
      if (idx !== -1) {
        const removed = this.cache[docKey].splice(idx, 1)[0];
        this.saveToLocal();
        if (removed && removed.cloudId) {
          this.deleteFromCloud(removed.cloudId).catch(err => console.warn('Cloud delete error:', err));
        }
        return true;
      }
      return false;
    },

    async syncNoteToCloud(note) {
      try {
        const payload = {
          name: 'porto_note_' + note.docKey,
          data: {
            noteId: note.id,
            docKey: note.docKey,
            docTitle: note.docTitle || '',
            quote: note.quote || '',
            author: note.author || 'Зритель',
            color: note.color || 'amber',
            text: note.text || '',
            createdAt: note.createdAt || new Date().toISOString()
          }
        };

        const res = await fetch(this.cloudApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const json = await res.json();
          if (json && json.id) {
            note.cloudId = json.id;
            this.saveToLocal();
            this.updateRegistry(json.id);
          }
        }
      } catch (err) {
        console.warn('Cloud save failed, note kept locally:', err);
      }
    },

    async deleteFromCloud(cloudId) {
      try {
        await fetch(`${this.cloudApiUrl}/${cloudId}`, { method: 'DELETE' });
      } catch (e) {
        console.warn('Cloud delete error:', e);
      }
    },

    async updateRegistry(cloudId) {
      try {
        let registry = JSON.parse(localStorage.getItem(this.cloudIndexKey) || '[]');
        if (!registry.includes(cloudId)) {
          registry.push(cloudId);
          localStorage.setItem(this.cloudIndexKey, JSON.stringify(registry));
        }
      } catch (e) {}
    },

    async fetchDocNotes(docKey) {
      // In addition to local notes, tries to sync latest from registry / cloud
      try {
        const registry = JSON.parse(localStorage.getItem(this.cloudIndexKey) || '[]');
        if (registry.length > 0) {
          const idsQuery = registry.slice(-40).join(',');
          const res = await fetch(`${this.cloudApiUrl}?id=${idsQuery}`);
          if (res.ok) {
            const list = await res.json();
            if (Array.isArray(list)) {
              let updated = false;
              list.forEach(item => {
                if (item && item.data && item.data.docKey) {
                  const dK = item.data.docKey;
                  if (!this.cache[dK]) this.cache[dK] = [];
                  const exists = this.cache[dK].some(n => n.id === item.data.noteId);
                  if (!exists) {
                    this.cache[dK].push({
                      id: item.data.noteId,
                      cloudId: item.id,
                      docKey: item.data.docKey,
                      docTitle: item.data.docTitle,
                      quote: item.data.quote,
                      author: item.data.author,
                      color: item.data.color,
                      text: item.data.text,
                      createdAt: item.data.createdAt
                    });
                    updated = true;
                  }
                }
              });
              if (updated) {
                this.saveToLocal();
                NotesUI.renderDocHighlights();
                NotesUI.updateDrawer();
                NotesUI.updateNotesBadge();
              }
            }
          }
        }
      } catch (e) {
        console.warn('Background sync note fetch failed:', e);
      }
    }
  };

  // =========================================================================
  // NOTES UI & SELECTION CONTROLLER
  // =========================================================================
  const NotesUI = {
    pendingSelection: null,
    activePopoverNoteId: null,

    init() {
      AnnotationsService.init();

      // Selection Listener on document & readerBody
      document.addEventListener('selectionchange', () => this.handleSelectionChange());
      document.addEventListener('mouseup', () => this.handleSelectionChange());
      document.addEventListener('touchend', () => setTimeout(() => this.handleSelectionChange(), 120));

      // Click on floating selection pill
      if (DOM.btnCreateNoteFromSelection) {
        DOM.btnCreateNoteFromSelection.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openCreateModalFromSelection();
        });
      }

      // Toolbar Notes button (opens drawer)
      if (DOM.btnNotes) {
        DOM.btnNotes.addEventListener('click', () => this.openDrawer());
      }

      // Drawer close buttons
      if (DOM.btnCloseNotesDrawer) {
        DOM.btnCloseNotesDrawer.addEventListener('click', () => this.closeDrawer());
      }
      if (DOM.notesDrawerBackdrop) {
        DOM.notesDrawerBackdrop.addEventListener('click', () => this.closeDrawer());
      }

      // Modal close & cancel buttons
      if (DOM.btnCloseNoteModal) {
        DOM.btnCloseNoteModal.addEventListener('click', () => this.closeModal());
      }
      if (DOM.btnCancelNoteModal) {
        DOM.btnCancelNoteModal.addEventListener('click', () => this.closeModal());
      }
      if (DOM.noteModal) {
        DOM.noteModal.addEventListener('click', (e) => {
          if (e.target === DOM.noteModal) this.closeModal();
        });
      }

      // Author Chips click
      if (DOM.noteAuthorChips) {
        DOM.noteAuthorChips.querySelectorAll('.author-chip').forEach(chip => {
          chip.addEventListener('click', () => {
            DOM.noteAuthorChips.querySelectorAll('.author-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const name = chip.getAttribute('data-name');
            if (DOM.noteAuthorInput && name) {
              DOM.noteAuthorInput.value = name;
              localStorage.setItem('porto_last_author', name);
            }
          });
        });
      }

      // Author Input change (remember last entered name)
      if (DOM.noteAuthorInput) {
        const lastAuthor = localStorage.getItem('porto_last_author');
        if (lastAuthor) DOM.noteAuthorInput.value = lastAuthor;
        DOM.noteAuthorInput.addEventListener('input', () => {
          localStorage.setItem('porto_last_author', DOM.noteAuthorInput.value);
        });
      }

      // Color Picker click
      if (DOM.noteColorPicker) {
        DOM.noteColorPicker.querySelectorAll('.color-opt').forEach(opt => {
          opt.addEventListener('click', () => {
            DOM.noteColorPicker.querySelectorAll('.color-opt').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
          });
        });
      }

      // Save Note Button
      if (DOM.btnSaveNote) {
        DOM.btnSaveNote.addEventListener('click', () => this.saveNoteFromModal());
      }

      // Add General Note Button in Drawer
      if (DOM.btnAddGeneralNote) {
        DOM.btnAddGeneralNote.addEventListener('click', () => {
          this.closeDrawer();
          this.openCreateModalGeneral();
        });
      }

      // Popover Delete Button
      if (DOM.popoverBtnDelete) {
        DOM.popoverBtnDelete.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.activePopoverNoteId) {
            this.deleteNote(this.activePopoverNoteId);
            this.hidePopover();
          }
        });
      }

      // Close Popover on clicks outside
      document.addEventListener('click', (e) => {
        if (DOM.notePopoverCard && DOM.notePopoverCard.style.display !== 'none') {
          if (!DOM.notePopoverCard.contains(e.target) && !e.target.closest('.player-note-highlight')) {
            this.hidePopover();
          }
        }
      });
    },

    getCurrentDocKey() {
      if (AppState.activeTab !== 'reader') return null;
      const { docType, currentIndex } = AppState.reader;
      let doc = null;
      if (docType === 'chapter') doc = DataStore.summaries[currentIndex];
      else if (docType === 'transcript') doc = DataStore.transcripts[currentIndex];
      else if (docType === 'feedback') doc = DataStore.feedbacks[currentIndex];
      else if (docType === 'psycho') doc = DataStore.psycho[currentIndex];
      if (!doc) return null;
      return docType + ':' + (doc.id || doc.file || doc.title);
    },

    getCurrentDocTitle() {
      const { docType, currentIndex } = AppState.reader;
      let doc = null;
      if (docType === 'chapter') doc = DataStore.summaries[currentIndex];
      else if (docType === 'transcript') doc = DataStore.transcripts[currentIndex];
      else if (docType === 'feedback') doc = DataStore.feedbacks[currentIndex];
      else if (docType === 'psycho') doc = DataStore.psycho[currentIndex];
      return doc ? doc.title : 'Документ';
    },

    handleSelectionChange() {
      if (AppState.activeTab !== 'reader' || !DOM.readerBody) {
        this.hideSelectionPill();
        return;
      }

      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        this.hideSelectionPill();
        return;
      }

      const text = sel.toString().trim();
      if (text.length < 3) {
        this.hideSelectionPill();
        return;
      }

      const range = sel.getRangeAt(0);
      if (!DOM.readerBody.contains(range.commonAncestorContainer)) {
        this.hideSelectionPill();
        return;
      }

      const rect = range.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        this.hideSelectionPill();
        return;
      }

      this.pendingSelection = {
        text: text,
        rect: rect
      };

      this.showSelectionPill(rect);
    },

    showSelectionPill(rect) {
      if (!DOM.selectionPill) return;
      const top = rect.top + window.scrollY;
      const left = rect.left + rect.width / 2 + window.scrollX;
      DOM.selectionPill.style.top = top + 'px';
      DOM.selectionPill.style.left = left + 'px';
      DOM.selectionPill.style.display = 'flex';
    },

    hideSelectionPill() {
      if (DOM.selectionPill) {
        DOM.selectionPill.style.display = 'none';
      }
      this.pendingSelection = null;
    },

    openCreateModalFromSelection() {
      if (!this.pendingSelection || !this.pendingSelection.text) return;
      const quote = this.pendingSelection.text;
      this.hideSelectionPill();
      this.openModalWithQuote(quote);
    },

    openCreateModalGeneral() {
      this.openModalWithQuote('');
    },

    openModalWithQuote(quote) {
      if (!DOM.noteModal) return;
      if (quote) {
        DOM.noteQuotePreview.style.display = 'flex';
        DOM.noteQuoteText.textContent = '«' + quote + '»';
        DOM.noteQuoteText.setAttribute('data-full-quote', quote);
      } else {
        DOM.noteQuotePreview.style.display = 'none';
        DOM.noteQuoteText.removeAttribute('data-full-quote');
      }

      if (DOM.noteTextInput) DOM.noteTextInput.value = '';
      DOM.noteModal.style.display = 'flex';
      setTimeout(() => {
        if (DOM.noteTextInput) DOM.noteTextInput.focus();
      }, 100);
    },

    closeModal() {
      if (DOM.noteModal) DOM.noteModal.style.display = 'none';
    },

    async saveNoteFromModal() {
      const docKey = this.getCurrentDocKey();
      if (!docKey) {
        Utils.showToast('Ошибка: документ не открыт');
        return;
      }

      const text = DOM.noteTextInput ? DOM.noteTextInput.value.trim() : '';
      if (!text) {
        Utils.showToast('Пожалуйста, введите текст заметки');
        if (DOM.noteTextInput) DOM.noteTextInput.focus();
        return;
      }

      let author = DOM.noteAuthorInput ? DOM.noteAuthorInput.value.trim() : 'Зритель';
      if (!author) author = 'Зритель';

      const checkedColor = DOM.noteColorPicker ? DOM.noteColorPicker.querySelector('input[name="noteColor"]:checked') : null;
      const color = checkedColor ? checkedColor.value : 'amber';

      const quote = DOM.noteQuoteText ? (DOM.noteQuoteText.getAttribute('data-full-quote') || '') : '';

      const note = {
        id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        docKey: docKey,
        docTitle: this.getCurrentDocTitle(),
        quote: quote,
        author: author,
        color: color,
        text: text,
        createdAt: new Date().toISOString()
      };

      await AnnotationsService.addNote(note);
      this.closeModal();
      Utils.showToast('📌 Заметка прикреплена!');

      this.renderDocHighlights();
      this.updateNotesBadge();
      this.updateDrawer();
    },

    renderDocHighlights() {
      const docKey = this.getCurrentDocKey();
      if (!docKey || !DOM.readerBody) return;

      const notes = AnnotationsService.getNotes(docKey).filter(n => Boolean(n.quote));
      if (notes.length === 0) return;

      // Wrap text occurrences safely without corrupting HTML
      notes.forEach(note => {
        this.highlightQuoteInBody(note);
      });
    },

    highlightQuoteInBody(note) {
      if (!note.quote || !DOM.readerBody) return;
      const quoteClean = note.quote.trim();
      if (quoteClean.length < 3) return;

      // Check if already highlighted
      if (DOM.readerBody.querySelector(`.player-note-highlight[data-note-id="${note.id}"]`)) return;

      const treeWalker = document.createTreeWalker(
        DOM.readerBody,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
            if (node.parentElement && (node.parentElement.closest('.player-note-highlight') || node.parentElement.tagName === 'SCRIPT' || node.parentElement.tagName === 'STYLE')) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      let textNode = null;
      while ((textNode = treeWalker.nextNode())) {
        const idx = textNode.textContent.indexOf(quoteClean);
        if (idx !== -1) {
          const matchRange = document.createRange();
          matchRange.setStart(textNode, idx);
          matchRange.setEnd(textNode, idx + quoteClean.length);

          const mark = document.createElement('mark');
          mark.className = `player-note-highlight note-color-${note.color || 'amber'}`;
          mark.setAttribute('data-note-id', note.id);
          mark.title = `Заметка от ${note.author}`;

          try {
            matchRange.surroundContents(mark);
            const pin = document.createElement('span');
            pin.className = 'note-pin-badge';
            pin.textContent = '📌';
            mark.appendChild(pin);

            mark.addEventListener('click', (e) => {
              e.stopPropagation();
              this.showPopoverForHighlight(mark, note);
            });
            mark.addEventListener('mouseenter', (e) => {
              this.showPopoverForHighlight(mark, note);
            });
          } catch (e) {
            // Range spans multiple nodes, skip
          }
          break;
        }
      }
    },

    showPopoverForHighlight(markEl, note) {
      if (!DOM.notePopoverCard) return;
      this.activePopoverNoteId = note.id;

      // Set avatar icon
      let avatar = '👤';
      if (note.author.includes('Молли') || note.author.includes('🥀')) avatar = '🥀';
      else if (note.author.includes('Хизер') || note.author.includes('❄️')) avatar = '❄️';
      else if (note.author.includes('Эйден') || note.author.includes('⚖️')) avatar = '⚖️';
      else if (note.author.includes('Грейвз') || note.author.includes('🕯️')) avatar = '🕯️';
      else if (note.author.includes('Мастер') || note.author.includes('🎭')) avatar = '🎭';
      else if (note.author.includes('Зритель') || note.author.includes('👀')) avatar = '👀';

      if (DOM.popoverAvatar) DOM.popoverAvatar.textContent = avatar;
      if (DOM.popoverAuthor) DOM.popoverAuthor.textContent = note.author;

      const dateStr = note.createdAt ? new Date(note.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Сегодня';
      if (DOM.popoverTime) DOM.popoverTime.textContent = dateStr;

      if (DOM.popoverQuote) {
        if (note.quote) {
          DOM.popoverQuote.style.display = 'block';
          DOM.popoverQuote.textContent = '«' + note.quote + '»';
        } else {
          DOM.popoverQuote.style.display = 'none';
        }
      }

      if (DOM.popoverBody) DOM.popoverBody.textContent = note.text;

      // Position Popover
      const rect = markEl.getBoundingClientRect();
      const top = rect.bottom + window.scrollY;
      const left = rect.left + rect.width / 2 + window.scrollX;

      DOM.notePopoverCard.style.top = top + 'px';
      DOM.notePopoverCard.style.left = left + 'px';
      DOM.notePopoverCard.style.display = 'block';
    },

    hidePopover() {
      if (DOM.notePopoverCard) {
        DOM.notePopoverCard.style.display = 'none';
      }
      this.activePopoverNoteId = null;
    },

    updateNotesBadge() {
      const docKey = this.getCurrentDocKey();
      if (!docKey || !DOM.notesBadge) return;
      const count = AnnotationsService.getDocCount(docKey);
      DOM.notesBadge.textContent = count;
      DOM.notesBadge.style.display = count > 0 ? 'inline-flex' : 'none';
      if (DOM.notesDrawerCount) {
        DOM.notesDrawerCount.textContent = count + ' ' + Utils.pluralize(count, ['заметка', 'заметки', 'заметок']);
      }
    },

    openDrawer() {
      if (!DOM.notesDrawer) return;
      this.updateDrawer();
      DOM.notesDrawer.style.display = 'flex';
      if (DOM.notesDrawerBackdrop) DOM.notesDrawerBackdrop.style.display = 'block';
    },

    closeDrawer() {
      if (DOM.notesDrawer) DOM.notesDrawer.style.display = 'none';
      if (DOM.notesDrawerBackdrop) DOM.notesDrawerBackdrop.style.display = 'none';
    },

    updateDrawer() {
      const docKey = this.getCurrentDocKey();
      if (!docKey || !DOM.notesDrawerList) return;

      const notes = AnnotationsService.getNotes(docKey);
      this.updateNotesBadge();

      if (notes.length === 0) {
        DOM.notesDrawerList.innerHTML = `
          <div class="drawer-empty-state">
            <span style="font-size:2.5rem; display:block; margin-bottom:0.75rem;">📝</span>
            <strong>Заметок пока нет</strong>
            <p style="margin-top:0.4rem; color:var(--text-tertiary); font-size:0.82rem;">Выделите любую фразу в тексте или нажмите кнопку выше, чтобы оставить первую заметку!</p>
          </div>
        `;
        return;
      }

      DOM.notesDrawerList.innerHTML = '';
      notes.forEach(note => {
        const card = document.createElement('div');
        card.className = `drawer-note-card border-color-${note.color || 'amber'}`;

        const dateStr = note.createdAt ? new Date(note.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

        card.innerHTML = `
          <div class="drawer-note-header">
            <span class="drawer-note-author">${Utils.escapeHtml(note.author)}</span>
            <span class="drawer-note-time">${dateStr}</span>
          </div>
          ${note.quote ? `<div class="drawer-note-quote">«${Utils.escapeHtml(note.quote)}»</div>` : ''}
          <div class="drawer-note-text">${Utils.escapeHtml(note.text)}</div>
          <div class="drawer-note-actions">
            ${note.quote ? `<button class="btn-goto-quote" data-note-id="${note.id}">🎯 Найти в тексте</button>` : '<span></span>'}
            <button class="btn-delete-note" data-note-id="${note.id}">🗑️ Удалить</button>
          </div>
        `;

        const gotoBtn = card.querySelector('.btn-goto-quote');
        if (gotoBtn) {
          gotoBtn.addEventListener('click', () => {
            this.closeDrawer();
            const mark = DOM.readerBody.querySelector(`.player-note-highlight[data-note-id="${note.id}"]`);
            if (mark) {
              mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
              mark.classList.add('active-note-target');
              setTimeout(() => mark.classList.remove('active-note-target'), 3600);
              this.showPopoverForHighlight(mark, note);
            } else {
              Utils.showToast('Фраза находится в тексте');
            }
          });
        }

        const delBtn = card.querySelector('.btn-delete-note');
        if (delBtn) {
          delBtn.addEventListener('click', () => {
            this.deleteNote(note.id);
          });
        }

        DOM.notesDrawerList.appendChild(card);
      });
    },

    async deleteNote(noteId) {
      const docKey = this.getCurrentDocKey();
      if (!docKey) return;
      if (confirm('Удалить эту заметку?')) {
        await AnnotationsService.removeNote(docKey, noteId);
        Utils.showToast('Заметка удалена');
        
        // Remove mark element
        const mark = DOM.readerBody ? DOM.readerBody.querySelector(`.player-note-highlight[data-note-id="${noteId}"]`) : null;
        if (mark) {
          const parent = mark.parentNode;
          while (mark.firstChild) {
            if (mark.firstChild.classList && mark.firstChild.classList.contains('note-pin-badge')) {
              mark.removeChild(mark.firstChild);
            } else {
              parent.insertBefore(mark.firstChild, mark);
            }
          }
          parent.removeChild(mark);
        }

        this.updateNotesBadge();
        this.updateDrawer();
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
      else if (type === 'psycho' && DataStore.psycho[idx]) text = DataStore.psycho[idx].content;

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

    // Font Family and Sizing Controls
    function setReaderFontSize(sizeRem) {
      AppState.reader.fontSize = Math.min(1.65, Math.max(0.8, Math.round(sizeRem * 100) / 100));
      document.documentElement.style.setProperty('--reader-size', AppState.reader.fontSize + 'rem');
      const percent = Math.round((AppState.reader.fontSize / 1.08) * 100);
      const disp = document.getElementById('fontSizeDisplay');
      if (disp) disp.textContent = percent + '%';
      localStorage.setItem('porto_font_size', AppState.reader.fontSize.toString());
    }

    function setReaderFontFamily(fam) {
      if (fam === 'serif') {
        document.documentElement.style.setProperty('--font-reader', 'var(--font-serif)');
        if (DOM.btnFontSerif) DOM.btnFontSerif.classList.add('active');
        if (DOM.btnFontSans) DOM.btnFontSans.classList.remove('active');
        localStorage.setItem('porto_font_family', 'serif');
      } else {
        document.documentElement.style.setProperty('--font-reader', 'var(--font-sans)');
        if (DOM.btnFontSans) DOM.btnFontSans.classList.add('active');
        if (DOM.btnFontSerif) DOM.btnFontSerif.classList.remove('active');
        localStorage.setItem('porto_font_family', 'sans');
      }
    }

    DOM.btnFontSerif.addEventListener('click', (e) => {
      e.preventDefault();
      setReaderFontFamily('serif');
    });

    DOM.btnFontSans.addEventListener('click', (e) => {
      e.preventDefault();
      setReaderFontFamily('sans');
    });

    DOM.btnSizePlus.addEventListener('click', (e) => {
      e.preventDefault();
      setReaderFontSize(AppState.reader.fontSize + 0.1);
      Utils.showToast('Размер текста: ' + Math.round((AppState.reader.fontSize / 1.08) * 100) + '%');
    });

    DOM.btnSizeMinus.addEventListener('click', (e) => {
      e.preventDefault();
      setReaderFontSize(AppState.reader.fontSize - 0.1);
      Utils.showToast('Размер текста: ' + Math.round((AppState.reader.fontSize / 1.08) * 100) + '%');
    });

    // Restore Font Preferences
    const savedFontSize = parseFloat(localStorage.getItem('porto_font_size'));
    if (savedFontSize && !isNaN(savedFontSize)) {
      setReaderFontSize(savedFontSize);
    }
    const savedFontFam = localStorage.getItem('porto_font_family');
    if (savedFontFam) {
      setReaderFontFamily(savedFontFam);
    }

    // Segmented Controls Helper (DRY)
    function setupSegmented(container, filterKey, renderFn) {
      if (!container) return;
      container.addEventListener('click', (e) => {
        if (e.target.classList.contains('segment-btn')) {
          container.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          AppState.filters[filterKey] = e.target.getAttribute('data-filter') || e.target.getAttribute('data-char') || e.target.getAttribute('data-status') || e.target.getAttribute('data-faction') || e.target.getAttribute('data-author') || e.target.getAttribute('data-category');
          renderFn();
        }
      });
    }

    setupSegmented(DOM.storylineControls, 'storyline', Grids.renderGames);
    setupSegmented(DOM.transcriptStorylineControls, 'transcriptStoryline', Grids.renderTranscripts);
    setupSegmented(DOM.feedbackCharControls, 'feedbackChar', Grids.renderFeedbacks);
    setupSegmented(DOM.statusControls, 'charStatus', Grids.renderCharacters);
    setupSegmented(DOM.factionControls, 'charFaction', Grids.renderCharacters);
    setupSegmented(DOM.quotesStorylineControls, 'quotesStoryline', Grids.renderQuotes);
    setupSegmented(DOM.quotesAuthorControls, 'quotesAuthor', Grids.renderQuotes);
    setupSegmented(DOM.quotesCategoryControls, 'quotesCategory', Grids.renderQuotes);
    setupSegmented(DOM.psychoCharControls, 'psychoChar', Grids.renderPsycho);
    setupSegmented(DOM.calendarBranchControls, 'calendarBranch', Grids.renderCalendar);
    setupSegmented(DOM.calendarThreatControls, 'calendarThreat', Grids.renderCalendar);

    // Sanity Hero Controls
    if (DOM.sanityHeroControls) {
      DOM.sanityHeroControls.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment-btn');
        if (!btn) return;
        DOM.sanityHeroControls.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.sanityHero = btn.getAttribute('data-hero');
        AppState.sanitySelectedPointIndex = 0;
        Grids.renderSanity();
      });
    }

    // Relationship Pair Controls
    if (DOM.relationshipPairControls) {
      DOM.relationshipPairControls.addEventListener('click', (e) => {
        const btn = e.target.closest('.segment-btn');
        if (!btn) return;
        DOM.relationshipPairControls.querySelectorAll('.segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        AppState.selectedRelationshipPair = btn.getAttribute('data-pair');
        AppState.selectedRelationshipStageIndex = 0;
        Grids.renderRelationships();
      });
    }

    // Quotes Back Button
    if (DOM.quotesBtnBack) {
      DOM.quotesBtnBack.addEventListener('click', (e) => {
        e.preventDefault();
        AppState.quotesSelectedSession = null;
        history.pushState({ view: 'tab', tab: 'quotes' }, '', '#quotes');
        Grids.renderQuotes();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Interactive Markdown Links in Reader
    if (DOM.readerBody) {
      DOM.readerBody.addEventListener('click', (e) => {
        const link = e.target.closest('a.reader-link');
        if (!link) return;
        const href = decodeURIComponent(link.getAttribute('data-href') || link.getAttribute('href') || '');
        if (!href) return;

        if (href.startsWith('http://') || href.startsWith('https://')) {
          link.target = '_blank';
          return;
        }

        e.preventDefault();

        // 1. Check if it points to a psycho profile (.md or baseId)
        const cleanHref = href.replace(/\.md$/, '').replace(/^\.\//, '');
        const psychoIdx = (DataStore.psycho || []).findIndex(p => p.id === cleanHref || p.file === href || p.id === href);
        if (psychoIdx !== -1) {
          UnifiedReader.open('psycho', psychoIdx, true);
          return;
        }

        // 2. Check if it points to a chapter summary
        const summaryIdx = (DataStore.summaries || []).findIndex(s => s.id === cleanHref || s.id === href);
        if (summaryIdx !== -1) {
          UnifiedReader.open('chapter', summaryIdx, true);
          return;
        }

        // 3. Check if it points to a character modal
        const char = (DataStore.characters || []).find(c => c.id === cleanHref || c.name.toLowerCase() === cleanHref.toLowerCase());
        if (char) {
          CharactersModal.open(char, true);
          return;
        }
      });
    }

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
          if (e.state.tab === 'quotes') AppState.quotesSelectedSession = null;
          Navigation.switchTab(e.state.tab, false);
        } else if (e.state.view === 'quotes-detail') {
          AppState.quotesSelectedSession = e.state.sessionId;
          Navigation.switchTab('quotes', false);
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

    // Initialize Notes & Annotations Controller
    NotesUI.init();
  }

  function restoreFromHash(hash) {
    if (hash.startsWith('quotes:')) {
      const sessionId = decodeURIComponent(hash.replace('quotes:', ''));
      AppState.quotesSelectedSession = sessionId;
      Navigation.switchTab('quotes', false);
    } else if (hash.startsWith('reader:')) {
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
    } else if (hash && ['games', 'transcripts', 'quotes', 'player-notes', 'characters', 'psycho', 'sanity', 'relationships', 'calendar'].includes(hash)) {
      if (hash === 'quotes') AppState.quotesSelectedSession = null;
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
  if (DOM.psychoCount) DOM.psychoCount.textContent = (DataStore.psycho || []).length;
  if (DOM.sanityCount) DOM.sanityCount.textContent = Object.keys(DataStore.sanityTimeline || {}).length || 4;
  if (DOM.relationshipsCount) DOM.relationshipsCount.textContent = Object.keys(DataStore.relationships || {}).length || 12;
  if (DOM.calendarCount) DOM.calendarCount.textContent = Object.keys(DataStore.calendar.days || {}).length || 15;
  if (DOM.quotesCount) {
    const totalQuotesAll = (DataStore.quotes || []).reduce((sum, q) => sum + (q.totalQuotesCount || 0), 0);
    DOM.quotesCount.textContent = totalQuotesAll;
  }

  // Initialize
  initEvents();
  const initialHash = window.location.hash.replace(/^#/, '');
  restoreFromHash(initialHash);
})();
