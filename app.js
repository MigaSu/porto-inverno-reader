/**
 * PORTO INVERNO - Interactive Web Reader & Telegram Hub
 * Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const data = window.PORTO_DATA || { summaries: [], characters: [] };
  
  // State
  let currentChapterIndex = data.summaries.length > 0 ? data.summaries.length - 1 : 0; // Default to latest
  let activeStoryline = 'all';
  let activeCharStatus = 'all';
  let activeCharFaction = 'all';
  let searchQuery = '';
  let readerFontSize = 1.15;

  // DOM Elements
  const navTabs = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const chaptersCountEl = document.getElementById('chaptersCount');
  const charactersCountEl = document.getElementById('charactersCount');
  const globalSearchInput = document.getElementById('globalSearch');
  const clearSearchBtn = document.getElementById('clearSearch');
  const readingProgressBar = document.getElementById('readingProgress');

  // Chapter Reader Elements
  const chapterListContainer = document.getElementById('chapterListContainer');
  const storylineFilters = document.getElementById('storylineFilters');
  const readerStoryline = document.getElementById('readerStoryline');
  const readerDate = document.getElementById('readerDate');
  const readerReadTime = document.getElementById('readerReadTime');
  const readerTitle = document.getElementById('readerTitle');
  const readerBody = document.getElementById('readerBody');
  const btnPrevChapter = document.getElementById('btnPrevChapter');
  const btnNextChapter = document.getElementById('btnNextChapter');
  const btnCopyTelegram = document.getElementById('btnCopyTelegram');
  const btnFontDown = document.getElementById('btnFontDown');
  const btnFontUp = document.getElementById('btnFontUp');

  // Character Elements
  const characterGrid = document.getElementById('characterGrid');
  const charStatusFilters = document.getElementById('charStatusFilters');
  const charFactionFilters = document.getElementById('charFactionFilters');
  const charModal = document.getElementById('charModal');
  const modalClose = document.getElementById('modalClose');
  const modalName = document.getElementById('modalName');
  const modalRole = document.getElementById('modalRole');
  const modalStatus = document.getElementById('modalStatus');
  const modalFaction = document.getElementById('modalFaction');
  const modalBio = document.getElementById('modalBio');
  const modalRelations = document.getElementById('modalRelations');
  const modalRelationsSection = document.getElementById('modalRelationsSection');
  const modalCopyTgBtn = document.getElementById('modalCopyTgBtn');

  // Telegram Hub Elements
  const tgContentType = document.getElementById('tgContentType');
  const tgChapterSelectGroup = document.getElementById('tgChapterSelectGroup');
  const tgChapterSelect = document.getElementById('tgChapterSelect');
  const tgPreviewContent = document.getElementById('tgPreviewContent');
  const btnCopyActiveTg = document.getElementById('btnCopyActiveTg');
  const toast = document.getElementById('toast');

  let activeModalCharacter = null;

  // Initialize Counts
  chaptersCountEl.textContent = data.summaries.length;
  charactersCountEl.textContent = data.characters.length;

  // ----------------------------------------------------
  // Markdown & Text Helpers
  // ----------------------------------------------------
  function parseMarkdown(md) {
    if (!md) return '';
    // Strip leading # headers if redundant
    let text = md.replace(/^#\s+[^\n]+\n+/, '');

    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs.map(p => {
      let trimmed = p.trim();
      if (!trimmed) return '';

      if (trimmed.startsWith('> ')) {
        return `<blockquote>${formatInline(trimmed.replace(/^>\s+/, ''))}</blockquote>`;
      }
      if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
        return `<h3>${formatInline(trimmed.replace(/^#+\s+/, ''))}</h3>`;
      }
      return `<p>${formatInline(trimmed)}</p>`;
    }).join('');
  }

  function formatInline(str) {
    return str
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }

  function showToast(msg = 'Скопировано для Telegram!') {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  function copyToClipboard(text, successMsg) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(err => {
      console.error('Copy failed:', err);
    });
  }

  // ----------------------------------------------------
  // Navigation Tabs
  // ----------------------------------------------------
  navTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      navTabs.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const tabId = 'tab-' + btn.getAttribute('data-tab');
      const targetPane = document.getElementById(tabId);
      if (targetPane) targetPane.classList.add('active');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // ----------------------------------------------------
  // Search Functionality
  // ----------------------------------------------------
  globalSearchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    clearSearchBtn.style.display = searchQuery ? 'block' : 'none';
    renderChapterList();
    renderCharacters();
  });

  clearSearchBtn.addEventListener('click', () => {
    globalSearchInput.value = '';
    searchQuery = '';
    clearSearchBtn.style.display = 'none';
    renderChapterList();
    renderCharacters();
  });

  // ----------------------------------------------------
  // Chapter List & Reader
  // ----------------------------------------------------
  function renderChapterList() {
    chapterListContainer.innerHTML = '';

    const filtered = data.summaries.filter(item => {
      const matchStoryline = activeStoryline === 'all' || item.category === activeStoryline;
      const matchSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery) || 
        item.content.toLowerCase().includes(searchQuery);
      return matchStoryline && matchSearch;
    });

    if (filtered.length === 0) {
      chapterListContainer.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-dim);">Ничего не найдено</div>';
      return;
    }

    filtered.forEach((item) => {
      const actualIndex = data.summaries.findIndex(s => s.id === item.id);
      const card = document.createElement('div');
      card.className = `chapter-card ${actualIndex === currentChapterIndex ? 'active' : ''}`;
      
      let tagClass = 'tag-solo';
      if (item.category === 'Молли и Хизер') tagClass = 'tag-molly';
      else if (item.category === 'Эйден и Малкольм') tagClass = 'tag-aiden';

      card.innerHTML = `
        <div class="chapter-card-top">
          <span class="chapter-card-tag ${tagClass}">${item.category}</span>
          <span class="chapter-card-date">${item.date || ''}</span>
        </div>
        <div class="chapter-card-title">${item.title}</div>
      `;

      card.addEventListener('click', () => {
        currentChapterIndex = actualIndex;
        renderChapterList();
        loadChapter(currentChapterIndex);
      });

      chapterListContainer.appendChild(card);
    });
  }

  function loadChapter(index) {
    if (!data.summaries[index]) return;
    const chapter = data.summaries[index];

    readerStoryline.textContent = chapter.category;
    readerDate.textContent = chapter.date ? `📅 ${chapter.date}` : '';
    
    // Estimate reading time
    const words = chapter.content.split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 180));
    readerReadTime.textContent = `⏱ ~${minutes} мин чтения (${words} слов)`;

    readerTitle.textContent = chapter.title;
    readerBody.innerHTML = parseMarkdown(chapter.content);

    // Prev/Next buttons
    btnPrevChapter.disabled = index <= 0;
    btnNextChapter.disabled = index >= data.summaries.length - 1;

    // Scroll to reader top on mobile
    if (window.innerWidth < 1080) {
      document.getElementById('readerView').scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Storyline Filter Buttons
  storylineFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('pill-btn')) {
      storylineFilters.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeStoryline = e.target.getAttribute('data-filter');
      renderChapterList();
    }
  });

  // Chapter Navigation Footer
  btnPrevChapter.addEventListener('click', () => {
    if (currentChapterIndex > 0) {
      currentChapterIndex--;
      renderChapterList();
      loadChapter(currentChapterIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  btnNextChapter.addEventListener('click', () => {
    if (currentChapterIndex < data.summaries.length - 1) {
      currentChapterIndex++;
      renderChapterList();
      loadChapter(currentChapterIndex);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Font Resizing
  btnFontUp.addEventListener('click', () => {
    if (readerFontSize < 1.6) {
      readerFontSize += 0.08;
      document.documentElement.style.setProperty('--reader-font-size', `${readerFontSize}rem`);
    }
  });

  btnFontDown.addEventListener('click', () => {
    if (readerFontSize > 0.9) {
      readerFontSize -= 0.08;
      document.documentElement.style.setProperty('--reader-font-size', `${readerFontSize}rem`);
    }
  });

  // Copy Chapter for Telegram
  btnCopyTelegram.addEventListener('click', () => {
    const chapter = data.summaries[currentChapterIndex];
    if (!chapter) return;

    let tgText = `🍸 **ХРОНИКИ ПОРТО-ИНВЕРНО: ${chapter.title.toUpperCase()}**\n\n`;
    tgText += `> 📍 *${chapter.category} • ${chapter.date || '1931 год'}*\n\n`;
    
    const cleanContent = chapter.content.replace(/^#\s+[^\n]+\n+/, '').trim();
    tgText += cleanContent + '\n\n';
    tgText += `🔖 #ПортоИнверно #${chapter.category.replace(/\s+/g, '')} #Хроники`;

    copyToClipboard(tgText, 'Глава скопирована для Telegram!');
  });

  // ----------------------------------------------------
  // Character Dossier
  // ----------------------------------------------------
  function renderCharacters() {
    characterGrid.innerHTML = '';

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
      characterGrid.innerHTML = '<div style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--text-dim);">Персонажи по заданным критериям не найдены</div>';
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
        <div class="char-card-header">
          <div class="char-badges">
            <span class="status-pill ${statusClass}">${char.status}</span>
            <span class="faction-pill">${char.faction}</span>
          </div>
          <h3 class="char-name">${char.name}</h3>
          <div class="char-role">${char.role || 'Персонаж'}</div>
          <p class="char-bio-excerpt">${char.bio || ''}</p>
        </div>
        <div class="char-footer-action">
          <span>Подробнее в досье</span> →
        </div>
      `;

      card.addEventListener('click', () => {
        openCharacterModal(char);
      });

      characterGrid.appendChild(card);
    });
  }

  function openCharacterModal(char) {
    activeModalCharacter = char;
    modalName.textContent = char.name;
    modalRole.textContent = char.role || 'Персонаж';
    modalStatus.textContent = char.status;
    modalFaction.textContent = char.faction;

    let statusClass = 'status-alive';
    if (char.status === 'Погиб') statusClass = 'status-dead';
    else if (char.status === 'В бегах') statusClass = 'status-run';
    else if (char.status === 'Ранен') statusClass = 'status-injured';
    else if (char.status === 'Пропал') statusClass = 'status-missing';

    modalStatus.className = `status-badge ${statusClass}`;
    modalBio.textContent = char.bio || 'Данные засекречены.';

    if (char.relations) {
      modalRelationsSection.style.display = 'block';
      modalRelations.textContent = char.relations;
    } else {
      modalRelationsSection.style.display = 'none';
    }

    charModal.style.display = 'flex';
  }

  modalClose.addEventListener('click', () => {
    charModal.style.display = 'none';
  });

  charModal.addEventListener('click', (e) => {
    if (e.target === charModal) {
      charModal.style.display = 'none';
    }
  });

  modalCopyTgBtn.addEventListener('click', () => {
    if (!activeModalCharacter) return;
    const c = activeModalCharacter;
    let tgDossier = `👤 **ДОСЬЕ: ${c.name.toUpperCase()}**\n`;
    tgDossier += `🏷 **Статус:** ${c.status} | **Фракция:** ${c.faction}\n`;
    tgDossier += `🎯 **Роль:** ${c.role}\n\n`;
    tgDossier += `📝 **Характер и факты:**\n${c.bio}\n\n`;
    if (c.relations) {
      tgDossier += `🔗 **Связи:** ${c.relations}\n\n`;
    }
    tgDossier += `🔖 #ПортоИнверно #ДосьеПерсонажей #${c.status.replace(/\s+/g, '')}`;

    copyToClipboard(tgDossier, 'Досье персонажа скопировано для Telegram!');
  });

  // Character Filter Listeners
  charStatusFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('pill-btn')) {
      charStatusFilters.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCharStatus = e.target.getAttribute('data-status');
      renderCharacters();
    }
  });

  charFactionFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('pill-btn')) {
      charFactionFilters.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCharFaction = e.target.getAttribute('data-faction');
      renderCharacters();
    }
  });

  // ----------------------------------------------------
  // Telegram Hub / Live Preview
  // ----------------------------------------------------
  // Populate Chapter Selector in TG Hub
  data.summaries.forEach((s, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = s.title;
    tgChapterSelect.appendChild(opt);
  });
  if (data.summaries.length > 0) {
    tgChapterSelect.value = data.summaries.length - 1;
  }

  function getGeneratedTelegramPost() {
    const type = tgContentType.value;

    if (type === 'navigator') {
      return `🍸 **ХРОНИКИ ПОРТО-ИНВЕРНО | ЧИКАГО, 1931 ГОД**
*Архив детективной ролевой кампании в жанре нуар и криминальная драма*

> *«В этом городе либо ты держишь револьвер, либо на тебя уже примеряют деревянный бушлат...»*

🗂 **БАЗА ЗНАНИЙ И ДОСЬЕ:**
• Полный реестр действующих лиц и фракций (Фишеры, Винсент, Эль Гринго, Мэрия)

📖 **СЮЖЕТНЫЕ ВЕТКИ:**
🍷 **Ветка Молли и Хизер** — борьба за империю Фишеров, ядовитые тайны семьи и взрывной юбилей мэра
🔫 **Ветка Эйдена и Малкольма** — кровавый след в Порто-Инверно, охота за семьей Кроу и урановый след
🔍 **Сольные дела** — личные расследования и тайные операции в тени сухого закона

🔖 #ПортоИнверно #Навигатор #Архив`;
    }

    if (type === 'latest') {
      const latest = data.summaries[data.summaries.length - 1];
      if (!latest) return '';
      const clean = latest.content.replace(/^#\s+[^\n]+\n+/, '').trim();
      return `🍸 **ХРОНИКИ ПОРТО-ИНВЕРНО: ${latest.title.toUpperCase()}**\n\n> 📍 *Свежий отчет сессии • ${latest.date || '1931'}*\n\n${clean}\n\n🔖 #ПортоИнверно #СаммариСессий #Хроники`;
    }

    if (type === 'chapter') {
      const idx = parseInt(tgChapterSelect.value, 10);
      const ch = data.summaries[idx] || data.summaries[0];
      if (!ch) return '';
      const clean = ch.content.replace(/^#\s+[^\n]+\n+/, '').trim();
      return `🍸 **ХРОНИКИ ПОРТО-ИНВЕРНО: ${ch.title.toUpperCase()}**\n\n> 📍 *${ch.category} • ${ch.date || '1931'}*\n\n${clean}\n\n🔖 #ПортоИнверно #${ch.category.replace(/\s+/g, '')}`;
    }

    if (type === 'characters_summary') {
      let res = `👤 **СВОДКА КЛЮЧЕВЫХ ПЕРСОНАЖЕЙ | ПОРТО-ИНВЕРНО**\n\n`;
      const keyChars = data.characters.slice(0, 8);
      keyChars.forEach(c => {
        res += `• **${c.name}** (${c.status}) — ${c.role}\n`;
      });
      res += `\n...и еще более 25 персонажей в полном досье архива.\n\n🔖 #ПортоИнверно #Персонажи`;
      return res;
    }

    return '';
  }

  function updateTgPreview() {
    const rawText = getGeneratedTelegramPost();
    // Simple HTML formatter for preview
    let previewHtml = rawText
      .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
      .replace(/\*([^*]+)\*/g, '<i>$1</i>')
      .replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>')
      .replace(/\n/g, '<br>');

    tgPreviewContent.innerHTML = previewHtml;
  }

  tgContentType.addEventListener('change', () => {
    tgChapterSelectGroup.style.display = tgContentType.value === 'chapter' ? 'block' : 'none';
    updateTgPreview();
  });

  tgChapterSelect.addEventListener('change', updateTgPreview);

  btnCopyActiveTg.addEventListener('click', () => {
    const post = getGeneratedTelegramPost();
    copyToClipboard(post, 'Пост скопирован для Telegram!');
  });

  // ----------------------------------------------------
  // Reading Progress Bar
  // ----------------------------------------------------
  window.addEventListener('scroll', () => {
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollTotal > 0 ? (window.scrollY / scrollTotal) * 100 : 0;
    readingProgressBar.style.width = `${progress}%`;
  });

  // Initial Boot
  renderChapterList();
  if (data.summaries.length > 0) {
    loadChapter(currentChapterIndex);
  }
  renderCharacters();
  updateTgPreview();
});
