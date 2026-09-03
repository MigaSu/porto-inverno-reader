/**
 * PORTO-INVERNO | UNIFIED APPLICATION ARCHITECTURE
 * Fully Encapsulated, Modular & DRY-Compliant
 */
(function() {
  'use strict';

  // Master Data Store
  const DataStore = window.PORTO_DATA || { summaries: [], characters: [], transcripts: [], feedbacks: [], npcFeedbacks: [], quotes: [], psycho: [], relationships: {} };

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
      allNotesAuthor: 'all'
    },
    isAdmin: localStorage.getItem('porto_admin_mode') === 'true',
    isNpcOsUnlocked: localStorage.getItem('porto_npc_os_unlocked') === 'true',
    selectedRelationshipPair: 'molly-heather',
    selectedRelationshipStageIndex: 0,
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
    navNpcOs: document.getElementById('navNpcOs'),
    npcOsIcon: document.getElementById('npcOsIcon'),
    npcOsBadge: document.getElementById('npcOsBadge'),
    npcHeaderLockBadge: document.getElementById('npcHeaderLockBadge'),
    btnRelockNpcOs: document.getElementById('btnRelockNpcOs'),
    npcOsLockedPlaceholder: document.getElementById('npcOsLockedPlaceholder'),
    btnOpenNpcAuthModal: document.getElementById('btnOpenNpcAuthModal'),
    npcOsContentWrap: document.getElementById('npcOsContentWrap'),
    npcFeedbacksGrid: document.getElementById('npcFeedbacksGrid'),
    btnNpcOsFilter: document.getElementById('btnNpcOsFilter'),
    // NPC Auth Modal
    npcAuthModal: document.getElementById('npcAuthModal'),
    btnCloseNpcAuthModal: document.getElementById('btnCloseNpcAuthModal'),
    btnCancelNpcAuth: document.getElementById('btnCancelNpcAuth'),
    btnSubmitNpcAuth: document.getElementById('btnSubmitNpcAuth'),
    npcAuthForm: document.getElementById('npcAuthForm'),
    npcPassInput: document.getElementById('npcPassInput'),
    npcAuthError: document.getElementById('npcAuthError'),
    charsCount: document.getElementById('charsCount'),
    quotesCount: document.getElementById('quotesCount'),
    allNotesCount: document.getElementById('allNotesCount'),
    psychoCount: document.getElementById('psychoCount'),
    relationshipsCount: document.getElementById('relationshipsCount'),

    // Grids & Dashboards
    gamesGrid: document.getElementById('gamesGrid'),
    transcriptsGrid: document.getElementById('transcriptsGrid'),
    allNotesGrid: document.getElementById('allNotesGrid'),
    allNotesAuthorControls: document.getElementById('allNotesAuthorControls'),
    feedbacksGrid: document.getElementById('feedbacksGrid'),
    charactersGrid: document.getElementById('charactersGrid'),
    psychoGrid: document.getElementById('psychoGrid'),
    relationshipPairControls: document.getElementById('relationshipPairControls'),
    relationshipsContainer: document.getElementById('relationshipsContainer'),

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
    btnSyncNotes: document.getElementById('btnSyncNotes'),
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

    pluralize(n, forms) {
      n = Math.abs(n) % 100;
      const n1 = n % 10;
      if (n > 10 && n < 20) return forms[2];
      if (n1 > 1 && n1 < 5) return forms[1];
      if (n1 === 1) return forms[0];
      return forms[2];
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
          else if (tabKey === 'relationships') Grids.renderRelationships();
          else if (tabKey === 'player-notes') Grids.renderFeedbacks();
          else if (tabKey === 'npc-os') Grids.renderNpcOs();
          else if (tabKey === 'all-notes') Grids.renderAllNotes();
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

    renderNpcOs() {
      NpcAuth.updateUiState();
      if (!AppState.isNpcOsUnlocked) return;
      if (!DOM.npcFeedbacksGrid) return;

      DOM.npcFeedbacksGrid.innerHTML = '';
      const items = DataStore.npcFeedbacks || [];

      if (items.length === 0) {
        DOM.npcFeedbacksGrid.innerHTML = `
          <div style="grid-column: 1 / -1; padding: 4rem 1.5rem; text-align: center; background: rgba(255, 255, 255, 0.02); border: 1px dashed rgba(212, 175, 55, 0.3); border-radius: 12px; margin: 1rem auto; max-width: 600px;">
            <div style="font-size: 2.5rem; margin-bottom: 1rem;">🗂️</div>
            <h3 style="color: #f4ece1; font-size: 1.25rem; margin-bottom: 0.5rem; font-family: 'Cinzel', serif;">Папка пуста. Пока что.</h3>
            <p style="color: var(--text-tertiary); font-size: 0.9rem; line-height: 1.6; margin-bottom: 1rem;">
              Секретный сектор архива активирован. Журналы, донесения и личные мысли неигровых персонажей (Крауч, Джек Риган, Ковальски и др.) будут расшифровываться и публиковаться по мере развития расследования.
            </p>
            <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; background: rgba(46, 196, 182, 0.15); border: 1px solid rgba(46, 196, 182, 0.4); color: #2ec4b6; font-weight: 600; letter-spacing: 0.5px;">
              ✓ ДОСТУП АВТОРИЗОВАН (КОД 226180)
            </div>
          </div>
        `;
        return;
      }

      items.forEach(item => {
        const idx = (DataStore.feedbacks || []).findIndex(f => f.id === item.id);
        Grids.renderCard(DOM.npcFeedbacksGrid, item, {
          metaTopLeft: '⏳ ' + item.readTime,
          badgeClass: 'tag-solo',
          badgeText: item.characterName,
          title: item.title,
          thesis: item.excerpt,
          footerLeft: '📊 ' + item.wordCount + ' слов',
          actionText: 'Читать запись',
          onClick: () => UnifiedReader.open('feedback', idx >= 0 ? idx : 0, true)
        });
      });
    },

    renderAllNotes() {
      if (!DOM.allNotesGrid) return;
      DOM.allNotesGrid.innerHTML = '';

      const query = (AppState.searchQuery || '').toLowerCase();
      const authorFilter = AppState.filters.allNotesAuthor;

      let notes = AnnotationsService.getAllNotesFlat();

      // Sort newest first
      notes.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

      // Filter by Author & Search
      notes = notes.filter(n => {
        let matchAuthor = true;
        if (authorFilter !== 'all') {
          matchAuthor = (n.author || '').includes(authorFilter);
        }

        const matchSearch = !query ||
          (n.text || '').toLowerCase().includes(query) ||
          (n.quote || '').toLowerCase().includes(query) ||
          (n.author || '').toLowerCase().includes(query) ||
          (n.docTitle || '').toLowerCase().includes(query);

        return matchAuthor && matchSearch;
      });

      if (DOM.allNotesCount) {
        DOM.allNotesCount.textContent = AnnotationsService.getAllNotesFlat().length;
      }

      if (notes.length === 0) {
        DOM.allNotesGrid.innerHTML = `
          <div style="grid-column:1/-1; padding:5rem 1rem; text-align:center; color:var(--text-tertiary);">
            <span style="font-size:3rem; display:block; margin-bottom:1rem;">📌</span>
            <strong style="font-size:1.1rem; color:var(--text-secondary);">Заметок не найдено</strong>
            <p style="margin-top:0.5rem; font-size:0.88rem;">Откройте любую главу в ридере и выделите текст, чтобы оставить заметку!</p>
          </div>
        `;
        return;
      }

      notes.forEach(note => {
        const card = document.createElement('div');
        card.className = `app-card border-color-${note.color || 'amber'}`;
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.justifyContent = 'space-between';

        const dateStr = note.createdAt ? new Date(note.createdAt).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

        let avatar = '👤';
        if (note.author.includes('Молли') || note.author.includes('🥀')) avatar = '🥀';
        else if (note.author.includes('Хизер') || note.author.includes('❄️')) avatar = '❄️';
        else if (note.author.includes('Эйден') || note.author.includes('⚖️')) avatar = '⚖️';
        else if (note.author.includes('Грейвз') || note.author.includes('🕯️')) avatar = '🕯️';
        else if (note.author.includes('Мастер') || note.author.includes('🎭')) avatar = '🎭';
        else if (note.author.includes('Зритель') || note.author.includes('👀')) avatar = '👀';

        card.innerHTML = `
          <div>
            <div class="card-meta-row" style="margin-bottom:0.75rem;">
              <span class="badge-tag tag-solo" style="font-size:0.72rem; max-width:260px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">📖 ${Utils.escapeHtml(note.docTitle || 'Документ')}</span>
              <span class="date-pill" style="font-size:0.72rem;">${dateStr}</span>
            </div>

            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.6rem;">
              <span style="font-size:1.1rem;">${avatar}</span>
              <strong style="font-size:0.92rem; color:var(--gold-accent);">${Utils.escapeHtml(note.author)}</strong>
            </div>

            ${note.quote ? `<div class="drawer-note-quote" style="margin-bottom:0.75rem;">«${Utils.escapeHtml(note.quote)}»</div>` : ''}
            <div class="drawer-note-text" style="font-size:0.9rem; line-height:1.5;">${Utils.escapeHtml(note.text)}</div>
          </div>

          <div class="card-footer-row" style="margin-top:1.25rem; padding-top:0.75rem; border-top:1px solid rgba(255,255,255,0.06); align-items:center;">
            <button type="button" class="card-action-link btn-jump-note" style="background:none; border:none; color:var(--accent-cyan); font-weight:600; cursor:pointer; padding:0;">
              📖 Читать в главе →
            </button>
            ${AppState.isAdmin ? `<button type="button" class="btn-delete-note-feed" style="background:none; border:none; color:var(--accent); font-size:0.75rem; cursor:pointer; padding:3px 6px; border-radius:4px;">🗑️ Удалить</button>` : ''}
          </div>
        `;

        const jumpBtn = card.querySelector('.btn-jump-note');
        if (jumpBtn) {
          jumpBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            NotesUI.jumpToNoteDocument(note);
          });
        }

        const delBtn = card.querySelector('.btn-delete-note-feed');
        if (delBtn) {
          delBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (confirm('Удалить эту заметку навсегда?')) {
              await AnnotationsService.removeNote(note.docKey, note.id);
              Utils.showToast('Заметка удалена');
              Grids.renderAllNotes();
            }
          });
        }

        DOM.allNotesGrid.appendChild(card);
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
  // ANNOTATIONS & PLAYER NOTES SERVICE (GLOBAL REALTIME SSE + LOCAL CACHE)
  // =========================================================================
  const AnnotationsService = {
    storageKey: 'porto_player_notes_v1',
    topicUrl: 'https://ntfy.sh/porto_inverno_shared_notes_prod_991823',
    cache: {}, // { [docKey]: [Note, Note, ...] }
    eventSource: null,
    deletedIdsKey: 'porto_deleted_note_ids_v1',

    getDeletedIds() {
      try {
        return JSON.parse(localStorage.getItem(this.deletedIdsKey)) || [];
      } catch (e) { return []; }
    },

    markDeleted(noteId) {
      const ids = this.getDeletedIds();
      if (!ids.includes(noteId)) {
        ids.push(noteId);
        localStorage.setItem(this.deletedIdsKey, JSON.stringify(ids.slice(-500)));
      }
    },

    init() {
      // 1. Load LocalStorage cache
      try {
        const local = localStorage.getItem(this.storageKey);
        if (local) {
          this.cache = JSON.parse(local) || {};
        }
      } catch (e) {
        console.warn('LocalStorage error:', e);
        this.cache = {};
      }

      // 2. Initial cloud catch-up
      this.syncFromCloud();

      // 3. Connect real-time Server-Sent Events stream (instant millisecond sync)
      this.connectRealtimeStream();
    },

    connectRealtimeStream() {
      try {
        if (typeof EventSource !== 'undefined') {
          if (this.eventSource) {
            try { this.eventSource.close(); } catch (e) {}
          }
          this.eventSource = new EventSource(this.topicUrl + '/sse');
          this.eventSource.onmessage = (event) => {
            try {
              const raw = JSON.parse(event.data);
              if (raw.event === 'message' && raw.message) {
                const payload = JSON.parse(raw.message);
                if (payload.action === 'add' && payload.data) {
                  this.applyRemoteNote(payload.data);
                } else if (payload.action === 'delete' && payload.data) {
                  this.applyRemoteDelete(payload.data.docKey, payload.data.id);
                }
              }
            } catch (e) {
              console.warn('SSE message parse error:', e);
            }
          };
          this.eventSource.onerror = () => {
            // Auto-reconnection handled natively by EventSource
          };
        }
      } catch (err) {
        console.warn('EventSource initialization error:', err);
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

    getAllNotesFlat() {
      const all = [];
      Object.keys(this.cache).forEach(docKey => {
        (this.cache[docKey] || []).forEach(n => all.push(n));
      });
      return all;
    },

    async addNote(note) {
      if (!note.docKey) return null;
      if (!this.cache[note.docKey]) {
        this.cache[note.docKey] = [];
      }
      this.cache[note.docKey].push(note);
      this.saveToLocal();

      // Broadcast immediately across all devices
      this.broadcastAction('add', note);
      return note;
    },

    async removeNote(docKey, noteId) {
      this.markDeleted(noteId);
      if (!this.cache[docKey]) return false;
      const idx = this.cache[docKey].findIndex(n => n.id === noteId);
      if (idx !== -1) {
        this.cache[docKey].splice(idx, 1);
        this.saveToLocal();
        this.broadcastAction('delete', { docKey, id: noteId });
        return true;
      }
      return false;
    },

    broadcastAction(action, data) {
      try {
        fetch(this.topicUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain', 'Title': 'Porto Note', 'Tags': 'pushpin' },
          body: JSON.stringify({ action, data, time: Date.now() })
        }).catch(err => console.warn('Broadcast failed:', err));
      } catch (err) {
        console.warn('Broadcast exception:', err);
      }
    },

    applyRemoteNote(note) {
      if (!note || !note.docKey || !note.id) return;
      const deletedIds = new Set(this.getDeletedIds());
      if (deletedIds.has(note.id)) return;

      if (!this.cache[note.docKey]) this.cache[note.docKey] = [];
      const localIdx = this.cache[note.docKey].findIndex(n => n.id === note.id);
      if (localIdx === -1) {
        this.cache[note.docKey].push(note);
      } else {
        this.cache[note.docKey][localIdx] = { ...this.cache[note.docKey][localIdx], ...note };
      }

      this.saveToLocal();
      this.updateUIAfterSync();
    },

    applyRemoteDelete(docKey, noteId) {
      this.markDeleted(noteId);
      if (this.cache[docKey]) {
        this.cache[docKey] = this.cache[docKey].filter(n => n.id !== noteId);
        this.saveToLocal();
        this.updateUIAfterSync();
      }
    },

    async syncFromCloud() {
      try {
        const res = await fetch(this.topicUrl + '/json?poll=1&since=24h');
        if (res.ok) {
          const text = await res.text();
          const lines = text.trim().split('\n').filter(Boolean);
          const deletedIds = new Set(this.getDeletedIds());

          lines.forEach(l => {
            try {
              const raw = JSON.parse(l);
              if (raw.event === 'message' && raw.message) {
                const payload = JSON.parse(raw.message);
                if (payload.action === 'add' && payload.data && payload.data.id && !deletedIds.has(payload.data.id)) {
                  const note = payload.data;
                  if (!this.cache[note.docKey]) this.cache[note.docKey] = [];
                  const localIdx = this.cache[note.docKey].findIndex(n => n.id === note.id);
                  if (localIdx === -1) {
                    this.cache[note.docKey].push(note);
                  } else {
                    this.cache[note.docKey][localIdx] = { ...this.cache[note.docKey][localIdx], ...note };
                  }
                } else if (payload.action === 'delete' && payload.data && payload.data.id) {
                  this.markDeleted(payload.data.id);
                  if (this.cache[payload.data.docKey]) {
                    this.cache[payload.data.docKey] = this.cache[payload.data.docKey].filter(n => n.id !== payload.data.id);
                  }
                }
              }
            } catch (e) {}
          });

          // Clean local cache of deleted IDs
          Object.keys(this.cache).forEach(dk => {
            this.cache[dk] = this.cache[dk].filter(n => !deletedIds.has(n.id));
          });

          this.saveToLocal();
          this.updateUIAfterSync();
        }
      } catch (err) {
        console.warn('Sync from cloud failed, using offline cache:', err);
      }
    },

    updateUIAfterSync() {
      if (AppState.activeTab === 'reader') {
        NotesUI.renderDocHighlights();
        NotesUI.updateNotesBadge();
        NotesUI.updateDrawer();
      }
      if (AppState.activeTab === 'all-notes') {
        Grids.renderAllNotes();
      }
      if (DOM.allNotesCount) {
        DOM.allNotesCount.textContent = this.getAllNotesFlat().length;
      }
    },

    fetchDocNotes(docKey) {
      this.syncFromCloud();
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

      // Drawer close & sync buttons
      if (DOM.btnCloseNotesDrawer) {
        DOM.btnCloseNotesDrawer.addEventListener('click', () => this.closeDrawer());
      }
      if (DOM.btnSyncNotes) {
        DOM.btnSyncNotes.addEventListener('click', async () => {
          DOM.btnSyncNotes.style.transform = 'rotate(360deg)';
          DOM.btnSyncNotes.style.transition = 'transform 0.5s ease';
          setTimeout(() => { DOM.btnSyncNotes.style.transform = 'none'; }, 600);
          Utils.showToast('⏳ Синхронизация с облаком...');
          await AnnotationsService.syncFromCloud();
          this.updateDrawer();
          this.renderDocHighlights();
          this.updateNotesBadge();
          Utils.showToast('✓ Заметки обновлены!');
        });
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
      if (AppState.activeTab !== 'reader') {
        this.hideSelectionPill();
        return;
      }

      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        this.hideSelectionPill();
        return;
      }

      const text = sel.toString().trim();
      if (text.length < 2) {
        this.hideSelectionPill();
        return;
      }

      const range = sel.getRangeAt(0);
      const containerNode = range.commonAncestorContainer;
      const ancestor = containerNode.nodeType === 1 ? containerNode : containerNode.parentElement;
      const readerDoc = document.querySelector('.reader-doc') || DOM.viewReader;
      if (!readerDoc || !readerDoc.contains(ancestor)) {
        this.hideSelectionPill();
        return;
      }

      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
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
      document.body.style.overflow = 'hidden';
      setTimeout(() => {
        if (DOM.noteTextInput) DOM.noteTextInput.focus({ preventScroll: true });
      }, 50);
    },

    closeModal() {
      if (DOM.noteModal) DOM.noteModal.style.display = 'none';
      document.body.style.overflow = '';
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
      if (AppState.activeTab === 'all-notes') Grids.renderAllNotes();
    },

    jumpToNoteDocument(note) {
      if (!note.docKey) return;
      const parts = note.docKey.split(':');
      const docType = parts[0];
      const docId = parts.slice(1).join(':');

      let list = [];
      if (docType === 'chapter') list = DataStore.summaries;
      else if (docType === 'transcript') list = DataStore.transcripts;
      else if (docType === 'feedback') list = DataStore.feedbacks;
      else if (docType === 'psycho') list = DataStore.psycho;

      const idx = list.findIndex(d => (d.id === docId || d.file === docId || d.title === docId));
      if (idx !== -1) {
        UnifiedReader.open(docType, idx, true);
        if (note.quote) {
          setTimeout(() => {
            const container = document.querySelector('.reader-doc') || DOM.readerBody;
            const mark = container ? container.querySelector(`.player-note-highlight[data-note-id="${note.id}"]`) : null;
            if (mark) {
              mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
              mark.classList.add('active-note-target');
              setTimeout(() => mark.classList.remove('active-note-target'), 3600);
              this.showPopoverForHighlight(mark, note);
            }
          }, 350);
        }
      } else {
        Utils.showToast('Документ не найден в архиве');
      }
    },

    renderDocHighlights() {
      const docKey = this.getCurrentDocKey();
      if (!docKey) return;

      const notes = AnnotationsService.getNotes(docKey).filter(n => Boolean(n.quote));
      if (notes.length === 0) return;

      // Wrap text occurrences safely without corrupting HTML
      notes.forEach(note => {
        this.highlightQuoteInBody(note);
      });
    },

    highlightQuoteInBody(note) {
      if (!note.quote) return;
      const quoteClean = note.quote.trim();
      if (quoteClean.length < 2) return;

      const container = document.querySelector('.reader-doc') || DOM.readerBody;
      if (!container) return;

      // Check if already highlighted
      if (container.querySelector(`.player-note-highlight[data-note-id="${note.id}"]`)) return;

      const treeWalker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
            if (node.parentElement && (
              node.parentElement.closest('.player-note-highlight') ||
              node.parentElement.closest('.btn-copy-doc') ||
              node.parentElement.closest('.doc-nav-btn') ||
              node.parentElement.tagName === 'SCRIPT' ||
              node.parentElement.tagName === 'STYLE' ||
              node.parentElement.tagName === 'BUTTON'
            )) {
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
          try {
            const afterNode = textNode.splitText(idx + quoteClean.length);
            const targetNode = textNode.splitText(idx);

            const mark = document.createElement('mark');
            mark.className = `player-note-highlight note-color-${note.color || 'amber'}`;
            mark.setAttribute('data-note-id', note.id);
            mark.title = `Заметка от ${note.author}`;

            targetNode.parentNode.insertBefore(mark, targetNode);
            mark.appendChild(targetNode);

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
            console.warn('Highlight injection skipped:', e);
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

      if (DOM.popoverBtnDelete) {
        DOM.popoverBtnDelete.style.display = AppState.isAdmin ? 'inline-block' : 'none';
      }

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
      if (DOM.allNotesCount) {
        DOM.allNotesCount.textContent = AnnotationsService.getAllNotesFlat().length;
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
            ${AppState.isAdmin ? `<button class="btn-delete-note" data-note-id="${note.id}">🗑️ Удалить</button>` : ''}
          </div>
        `;

        const gotoBtn = card.querySelector('.btn-goto-quote');
        if (gotoBtn) {
          gotoBtn.addEventListener('click', () => {
            this.closeDrawer();
            const container = document.querySelector('.reader-doc') || DOM.readerBody;
            const mark = container ? container.querySelector(`.player-note-highlight[data-note-id="${note.id}"]`) : null;
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
        const container = document.querySelector('.reader-doc') || DOM.readerBody;
        const mark = container ? container.querySelector(`.player-note-highlight[data-note-id="${noteId}"]`) : null;
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
        if (AppState.activeTab === 'all-notes') Grids.renderAllNotes();
      }
    }
  };

  // NpcAuth Module: Password protection for ОС NPC (Code: 226180)
  const NpcAuth = {
    init() {
      this.updateUiState();

      if (DOM.btnOpenNpcAuthModal) {
        DOM.btnOpenNpcAuthModal.addEventListener('click', () => this.openModal());
      }
      if (DOM.btnCloseNpcAuthModal) {
        DOM.btnCloseNpcAuthModal.addEventListener('click', () => this.closeModal());
      }
      if (DOM.btnCancelNpcAuth) {
        DOM.btnCancelNpcAuth.addEventListener('click', () => this.closeModal());
      }
      if (DOM.npcAuthModal) {
        DOM.npcAuthModal.addEventListener('click', (e) => {
          if (e.target === DOM.npcAuthModal) this.closeModal();
        });
      }
      if (DOM.npcAuthForm) {
        DOM.npcAuthForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.submitPassword();
        });
      }
      if (DOM.btnRelockNpcOs) {
        DOM.btnRelockNpcOs.addEventListener('click', () => this.relock());
      }
      if (DOM.navNpcOs) {
        DOM.navNpcOs.addEventListener('click', (e) => {
          if (!AppState.isNpcOsUnlocked) {
            e.preventDefault();
            this.openModal();
          }
        });
      }
      if (DOM.btnNpcOsFilter) {
        DOM.btnNpcOsFilter.addEventListener('click', (e) => {
          e.preventDefault();
          Navigation.switchTab('npc-os');
          if (!AppState.isNpcOsUnlocked) {
            this.openModal();
          }
        });
      }
    },

    openModal() {
      if (DOM.npcAuthModal) {
        DOM.npcAuthModal.style.display = 'flex';
        if (DOM.npcPassInput) {
          DOM.npcPassInput.value = '';
          DOM.npcPassInput.style.borderColor = 'rgba(212, 175, 55, 0.4)';
          setTimeout(() => DOM.npcPassInput.focus(), 50);
        }
        if (DOM.npcAuthError) {
          DOM.npcAuthError.style.display = 'none';
        }
      }
    },

    closeModal() {
      if (DOM.npcAuthModal) DOM.npcAuthModal.style.display = 'none';
    },

    submitPassword() {
      const val = (DOM.npcPassInput ? DOM.npcPassInput.value : '').trim();
      if (val === '226180') {
        AppState.isNpcOsUnlocked = true;
        localStorage.setItem('porto_npc_os_unlocked', 'true');
        this.closeModal();
        this.updateUiState();
        Utils.showToast('🔓 Доступ к секретной папке «ОС NPC» разрешён!');
        if (AppState.activeTab !== 'npc-os') {
          Navigation.switchTab('npc-os');
        } else {
          Grids.renderNpcOs();
        }
      } else {
        if (DOM.npcAuthError) {
          DOM.npcAuthError.textContent = '⛔ Неверный код допуска. Доступ запрещен.';
          DOM.npcAuthError.style.display = 'block';
        }
        if (DOM.npcPassInput) {
          DOM.npcPassInput.style.borderColor = '#ff4d4d';
          DOM.npcPassInput.select();
        }
      }
    },

    relock() {
      AppState.isNpcOsUnlocked = false;
      localStorage.removeItem('porto_npc_os_unlocked');
      this.updateUiState();
      Utils.showToast('🔒 Папка «ОС NPC» заблокирована');
      if (AppState.activeTab === 'npc-os') {
        Grids.renderNpcOs();
      }
    },

    updateUiState() {
      const unlocked = AppState.isNpcOsUnlocked;
      const count = (DataStore.npcFeedbacks || []).length;
      
      if (DOM.npcOsIcon) DOM.npcOsIcon.textContent = unlocked ? '📂' : '🔒';
      if (DOM.npcOsBadge) {
        DOM.npcOsBadge.textContent = unlocked ? String(count) : 'LOCK';
        DOM.npcOsBadge.style.background = unlocked ? 'rgba(46, 196, 182, 0.3)' : 'rgba(193, 18, 31, 0.4)';
        DOM.npcOsBadge.style.borderColor = unlocked ? 'rgba(46, 196, 182, 0.5)' : 'rgba(212, 175, 55, 0.4)';
      }
      if (DOM.npcHeaderLockBadge) {
        DOM.npcHeaderLockBadge.textContent = unlocked ? '🔓 ДОСТУП РАЗРЕШЕН' : '🔒 ЗАСЕКРЕЧЕНО';
        DOM.npcHeaderLockBadge.style.color = unlocked ? '#2ec4b6' : '#d4af37';
        DOM.npcHeaderLockBadge.style.borderColor = unlocked ? 'rgba(46, 196, 182, 0.4)' : 'rgba(212, 175, 55, 0.4)';
      }
      if (DOM.btnRelockNpcOs) {
        DOM.btnRelockNpcOs.style.display = unlocked ? 'inline-block' : 'none';
      }
      if (DOM.npcOsLockedPlaceholder) {
        DOM.npcOsLockedPlaceholder.style.display = unlocked ? 'none' : 'block';
      }
      if (DOM.npcOsContentWrap) {
        DOM.npcOsContentWrap.style.display = unlocked ? 'block' : 'none';
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

    // Global Search & Admin Toggle (Password: 22618)
    if (DOM.appSearch) {
      DOM.appSearch.addEventListener('input', (e) => {
        AppState.searchQuery = e.target.value.toLowerCase().trim();
        if (AppState.activeTab === 'reader') {
          Navigation.switchTab(AppState.reader.sourceTab, true);
        } else if (AppState.activeTab === 'all-notes') {
          Grids.renderAllNotes();
        } else {
          Navigation.switchTab(AppState.activeTab, false);
        }
      });

      DOM.appSearch.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = DOM.appSearch.value.trim();
          if (val === '226180') {
            e.preventDefault();
            AppState.isNpcOsUnlocked = true;
            localStorage.setItem('porto_npc_os_unlocked', 'true');
            DOM.appSearch.value = '';
            AppState.searchQuery = '';
            NpcAuth.updateUiState();
            Utils.showToast('🔓 Папка «ОС NPC» разблокирована кодом допуска');
            Navigation.switchTab('npc-os');
            return;
          }
          if (val === '22618') {
            e.preventDefault();
            AppState.isAdmin = !AppState.isAdmin;
            localStorage.setItem('porto_admin_mode', AppState.isAdmin ? 'true' : 'false');
            DOM.appSearch.value = '';
            AppState.searchQuery = '';
            Utils.showToast(AppState.isAdmin ? '👑 Режим Администратора ВКЛЮЧЕН (доступно удаление)' : '🔒 Режим Администратора ВЫКЛЮЧЕН');
            if (AppState.activeTab === 'all-notes') Grids.renderAllNotes();
            NotesUI.updateDrawer();
            return;
          }
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
    setupSegmented(DOM.allNotesAuthorControls, 'allNotesAuthor', Grids.renderAllNotes);
    setupSegmented(DOM.psychoCharControls, 'psychoChar', Grids.renderPsycho);
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

    // NPC OS Auth init
    NpcAuth.init();

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
    } else if (hash && ['games', 'transcripts', 'quotes', 'all-notes', 'player-notes', 'characters', 'psycho', 'relationships'].includes(hash)) {
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
  if (DOM.allNotesCount) DOM.allNotesCount.textContent = AnnotationsService.getAllNotesFlat().length;
  if (DOM.relationshipsCount) DOM.relationshipsCount.textContent = Object.keys(DataStore.relationships || {}).length || 12;
  if (DOM.quotesCount) {
    const totalQuotesAll = (DataStore.quotes || []).reduce((sum, q) => sum + (q.totalQuotesCount || 0), 0);
    DOM.quotesCount.textContent = totalQuotesAll;
  }

  // Initialize
  initEvents();
  const initialHash = window.location.hash.replace(/^#/, '');
  restoreFromHash(initialHash);
})();
