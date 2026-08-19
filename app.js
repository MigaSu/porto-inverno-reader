/**
 * ПОРТО-ИНВЕРНО - Логика читального зала
 */

document.addEventListener('DOMContentLoaded', () => {
  const data = window.PORTO_DATA || { summaries: [], characters: [] };

  // State
  let activeTab = 'games';
  let activeStoryline = 'all';
  let activeCharStatus = 'all';
  let activeCharFaction = 'all';
  let currentReaderIndex = -1;
  let searchQuery = '';

  // Elements
  const navItems = document.querySelectorAll('.nav-item');
  const viewPanels = document.querySelectorAll('.view-panel');
  const viewGames = document.getElementById('view-games');
  const viewReader = document.getElementById('view-reader');
  const viewCharacters = document.getElementById('view-characters');
  const viewPlayerNotes = document.getElementById('view-player-notes');

  const gamesCountEl = document.getElementById('gamesCount');
  const charsCountEl = document.getElementById('charsCount');
  const appSearch = document.getElementById('appSearch');

  // Games
  const gamesGrid = document.getElementById('gamesGrid');
  const storylineChips = document.getElementById('storylineChips');

  // Reader
  const btnBackToGames = document.getElementById('btnBackToGames');
  const btnBackToGamesBottom = document.getElementById('btnBackToGamesBottom');
  const readerCategory = document.getElementById('readerCategory');
  const readerDate = document.getElementById('readerDate');
  const readerTitle = document.getElementById('readerTitle');
  const readerThesis = document.getElementById('readerThesis');
  const readerBody = document.getElementById('readerBody');
  const btnPrevGame = document.getElementById('btnPrevGame');
  const btnNextGame = document.getElementById('btnNextGame');

  // Characters
  const charactersGrid = document.getElementById('charactersGrid');
  const charStatusChips = document.getElementById('charStatusChips');
  const charFactionChips = document.getElementById('charFactionChips');
  const charModal = document.getElementById('charModal');
  const modalClose = document.getElementById('modalClose');
  const modalAvatar = document.getElementById('modalAvatar');
  const modalName = document.getElementById('modalName');
  const modalRole = document.getElementById('modalRole');
  const modalStatus = document.getElementById('modalStatus');
  const modalFaction = document.getElementById('modalFaction');
  const modalBio = document.getElementById('modalBio');
  const modalRelations = document.getElementById('modalRelations');
  const modalRelationsWrap = document.getElementById('modalRelationsWrap');

  // Initialize Counts
  gamesCountEl.textContent = data.summaries.length;
  charsCountEl.textContent = data.characters.length;

  // ----------------------------------------------------
  // Markdown parser
  // ----------------------------------------------------
  function parseMarkdown(md) {
    if (!md) return '';
    let text = md.replace(/^#\s+[^\n]+\n+/, '');

    return text.split(/\n\s*\n/).map(p => {
      let t = p.trim();
      if (!t) return '';
      if (t.startsWith('> ')) {
        return `<blockquote>${formatInline(t.replace(/^>\s+/, ''))}</blockquote>`;
      }
      if (t.startsWith('## ') || t.startsWith('### ')) {
        return `<h3>${formatInline(t.replace(/^#+\s+/, ''))}</h3>`;
      }
      return `<p>${formatInline(t)}</p>`;
    }).join('');
  }

  function formatInline(str) {
    return str
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  // ----------------------------------------------------
  // Sidebar Navigation
  // ----------------------------------------------------
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const target = item.getAttribute('data-tab');
      switchTab(target);
    });
  });

  function switchTab(tabKey) {
    activeTab = tabKey;
    navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-tab') === tabKey);
    });

    viewPanels.forEach(p => p.style.display = 'none');

    if (tabKey === 'games') {
      viewGames.style.display = 'block';
    } else if (tabKey === 'characters') {
      viewCharacters.style.display = 'block';
    } else if (tabKey === 'player-notes') {
      viewPlayerNotes.style.display = 'block';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ----------------------------------------------------
  // Search
  // ----------------------------------------------------
  appSearch.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    if (activeTab === 'games') {
      renderGamesGrid();
    } else if (activeTab === 'characters') {
      renderCharacters();
    }
  });

  // ----------------------------------------------------
  // Render Games Grid
  // ----------------------------------------------------
  function renderGamesGrid() {
    gamesGrid.innerHTML = '';

    const filtered = data.summaries.filter(item => {
      const matchStoryline = activeStoryline === 'all' || item.category === activeStoryline;
      const matchSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery) || 
        item.thesis.toLowerCase().includes(searchQuery) ||
        item.content.toLowerCase().includes(searchQuery);
      return matchStoryline && matchSearch;
    });

    if (filtered.length === 0) {
      gamesGrid.innerHTML = '<div style="grid-column: 1/-1; padding: 4rem; text-align: center; color: var(--text-muted);">Игры по заданным критериям не найдены</div>';
      return;
    }

    filtered.forEach(item => {
      const actualIdx = data.summaries.findIndex(s => s.id === item.id);
      const card = document.createElement('div');
      card.className = 'game-card';

      let tagClass = 'tag-solo';
      if (item.category === 'Молли и Хизер') tagClass = 'tag-molly';
      else if (item.category === 'Эйден и Малкольм') tagClass = 'tag-aiden';

      card.innerHTML = `
        <div>
          <div class="game-card-meta">
            <span class="game-date-badge">📅 ${item.date}</span>
            <span class="game-tag ${tagClass}">${item.category}</span>
          </div>
          <h3 class="game-card-title">${item.title}</h3>
          <p class="game-card-thesis">${item.thesis}</p>
        </div>
        <div class="game-card-action">
          <span>Читать главу</span> →
        </div>
      `;

      card.addEventListener('click', () => {
        openReader(actualIdx);
      });

      gamesGrid.appendChild(card);
    });
  }

  // ----------------------------------------------------
  // Open Chapter Reader
  // ----------------------------------------------------
  function openReader(index) {
    currentReaderIndex = index;
    const game = data.summaries[index];
    if (!game) return;

    // Switch views
    viewPanels.forEach(p => p.style.display = 'none');
    viewReader.style.display = 'block';

    readerCategory.textContent = game.category;
    readerDate.textContent = `📅 ${game.date}`;
    readerTitle.textContent = game.title;
    readerThesis.textContent = `«${game.thesis}»`;
    readerBody.innerHTML = parseMarkdown(game.content);

    btnPrevGame.disabled = index <= 0;
    btnNextGame.disabled = index >= data.summaries.length - 1;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  btnBackToGames.addEventListener('click', () => {
    switchTab('games');
  });

  btnBackToGamesBottom.addEventListener('click', () => {
    switchTab('games');
  });

  btnPrevGame.addEventListener('click', () => {
    if (currentReaderIndex > 0) {
      openReader(currentReaderIndex - 1);
    }
  });

  btnNextGame.addEventListener('click', () => {
    if (currentReaderIndex < data.summaries.length - 1) {
      openReader(currentReaderIndex + 1);
    }
  });

  storylineChips.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
      storylineChips.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeStoryline = e.target.getAttribute('data-filter');
      renderGamesGrid();
    }
  });

  // ----------------------------------------------------
  // Characters Grid
  // ----------------------------------------------------
  function renderCharacters() {
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
      charactersGrid.innerHTML = '<div style="grid-column: 1/-1; padding: 4rem; text-align: center; color: var(--text-muted);">Персонажи не найдены</div>';
      return;
    }

    filtered.forEach(char => {
      const card = document.createElement('div');
      card.className = 'character-card';

      let statusClass = 'status-alive';
      if (char.status === 'Погиб') statusClass = 'status-dead';
      else if (char.status === 'В бегах') statusClass = 'status-run';
      else if (char.status === 'Ранен') statusClass = 'status-injured';
      else if (char.status === 'Пропал') statusClass = 'status-missing';

      card.innerHTML = `
        <div>
          <div class="char-badges">
            <span class="badge-status ${statusClass}">${char.status}</span>
            <span class="badge-faction">${char.faction}</span>
          </div>
          <h3 class="char-name">${char.name}</h3>
          <div class="char-role">${char.role || 'Персонаж'}</div>
          <p class="char-bio">${char.bio || ''}</p>
        </div>
        <div class="char-link">
          Подробнее в досье →
        </div>
      `;

      card.addEventListener('click', () => openCharacterModal(char));
      charactersGrid.appendChild(card);
    });
  }

  function openCharacterModal(char) {
    modalAvatar.textContent = char.name.charAt(0).toUpperCase();
    modalName.textContent = char.name;
    modalRole.textContent = char.role || 'Персонаж';
    modalStatus.textContent = char.status;
    modalFaction.textContent = char.faction;

    let statusClass = 'status-alive';
    if (char.status === 'Погиб') statusClass = 'status-dead';
    else if (char.status === 'В бегах') statusClass = 'status-run';
    else if (char.status === 'Ранен') statusClass = 'status-injured';
    else if (char.status === 'Пропал') statusClass = 'status-missing';

    modalStatus.className = `badge-status ${statusClass}`;
    modalBio.textContent = char.bio || 'Данные засекречены.';

    if (char.relations) {
      modalRelationsWrap.style.display = 'block';
      modalRelations.textContent = char.relations;
    } else {
      modalRelationsWrap.style.display = 'none';
    }

    charModal.style.display = 'flex';
  }

  modalClose.addEventListener('click', () => charModal.style.display = 'none');
  charModal.addEventListener('click', (e) => {
    if (e.target === charModal) charModal.style.display = 'none';
  });

  charStatusChips.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
      charStatusChips.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCharStatus = e.target.getAttribute('data-status');
      renderCharacters();
    }
  });

  charFactionChips.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
      charFactionChips.querySelectorAll('.chip').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCharFaction = e.target.getAttribute('data-faction');
      renderCharacters();
    }
  });

  // Initial Boot
  renderGamesGrid();
  renderCharacters();
});
