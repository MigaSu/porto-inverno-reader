/**
 * PORTO INVERNO - Web Portal & Feedback Hub
 * Ultra-Modern Application Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const data = window.PORTO_DATA || { summaries: [], characters: [] };
  
  // State
  let currentChapterIndex = data.summaries.length > 0 ? data.summaries.length - 1 : 0;
  let activeStoryline = 'all';
  let activeCharStatus = 'all';
  let activeCharFaction = 'all';
  let searchQuery = '';
  let readerFontSize = 1.15;
  let currentRating = 10;

  // DOM Elements
  const navTabs = document.querySelectorAll('.tab-pill');
  const tabViews = document.querySelectorAll('.tab-view');
  const chaptersCountEl = document.getElementById('chaptersCount');
  const charactersCountEl = document.getElementById('charactersCount');
  const globalSearchInput = document.getElementById('globalSearch');
  const clearSearchBtn = document.getElementById('clearSearch');
  const readingProgressBar = document.getElementById('readingProgress');

  // Reader Elements
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
  const modalAvatarInitials = document.getElementById('modalAvatarInitials');
  const modalName = document.getElementById('modalName');
  const modalRole = document.getElementById('modalRole');
  const modalStatus = document.getElementById('modalStatus');
  const modalFaction = document.getElementById('modalFaction');
  const modalBio = document.getElementById('modalBio');
  const modalRelations = document.getElementById('modalRelations');
  const modalRelationsSection = document.getElementById('modalRelationsSection');
  const modalCopyTgBtn = document.getElementById('modalCopyTgBtn');

  // Feedback Elements (ОС)
  const fbAuthor = document.getElementById('fbAuthor');
  const fbSessionSelect = document.getElementById('fbSessionSelect');
  const fbRatingVal = document.getElementById('fbRatingVal');
  const ratingStars = document.querySelectorAll('#ratingStars .star');
  const fbMvp = document.getElementById('fbMvp');
  const fbHighlights = document.getElementById('fbHighlights');
  const fbTheories = document.getElementById('fbTheories');
  const fbWishes = document.getElementById('fbWishes');
  const fbTgLivePreview = document.getElementById('fbTgLivePreview');
  const btnGenerateTgFeedback = document.getElementById('btnGenerateTgFeedback');
  const btnSaveLocalFeedback = document.getElementById('btnSaveLocalFeedback');
  const savedFeedbackList = document.getElementById('savedFeedbackList');

  // Telegram Hub Elements
  const tgContentType = document.getElementById('tgContentType');
  const tgChapterSelectGroup = document.getElementById('tgChapterSelectGroup');
  const tgChapterSelect = document.getElementById('tgChapterSelect');
  const tgPreviewContent = document.getElementById('tgPreviewContent');
  const btnCopyActiveTg = document.getElementById('btnCopyActiveTg');
  const toast = document.getElementById('toast');

  let activeModalCharacter = null;

  // Set Counts
  chaptersCountEl.textContent = data.summaries.length;
  charactersCountEl.textContent = data.characters.length;

  // ----------------------------------------------------
  // Toast & Helpers
  // ----------------------------------------------------
  function showToast(msg = 'Скопировано!') {
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function copyToClipboard(text, successMsg) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(err => {
      console.error('Copy error:', err);
    });
  }

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
  // Tab Navigation
  // ----------------------------------------------------
  navTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      navTabs.forEach(b => b.classList.remove('active'));
      tabViews.forEach(v => v.classList.remove('active'));

      btn.classList.add('active');
      const tabId = 'tab-' + btn.getAttribute('data-tab');
      const targetView = document.getElementById(tabId);
      if (targetView) targetView.classList.add('active');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // ----------------------------------------------------
  // Global Search
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
  // Chapter Reader
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
      chapterListContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-dim);">Главы не найдены</div>';
      return;
    }

    filtered.forEach(item => {
      const actualIdx = data.summaries.findIndex(s => s.id === item.id);
      const card = document.createElement('div');
      card.className = `chapter-item ${actualIdx === currentChapterIndex ? 'active' : ''}`;
      
      let tagClass = 'tag-solo';
      if (item.category === 'Молли и Хизер') tagClass = 'tag-molly';
      else if (item.category === 'Эйден и Малкольм') tagClass = 'tag-aiden';

      card.innerHTML = `
        <div class="chapter-item-top">
          <span class="chapter-tag ${tagClass}">${item.category}</span>
          <span class="chapter-date">${item.date || ''}</span>
        </div>
        <div class="chapter-title">${item.title}</div>
      `;

      card.addEventListener('click', () => {
        currentChapterIndex = actualIdx;
        renderChapterList();
        loadChapter(currentChapterIndex);
      });

      chapterListContainer.appendChild(card);
    });
  }

  function loadChapter(index) {
    if (!data.summaries[index]) return;
    const ch = data.summaries[index];

    readerStoryline.textContent = ch.category;
    readerDate.textContent = ch.date ? `📅 ${ch.date}` : '';
    
    const words = ch.content.split(/\s+/).length;
    const mins = Math.max(1, Math.ceil(words / 180));
    readerReadTime.textContent = `⏱ ~${mins} мин (${words} слов)`;

    readerTitle.textContent = ch.title;
    readerBody.innerHTML = parseMarkdown(ch.content);

    btnPrevChapter.disabled = index <= 0;
    btnNextChapter.disabled = index >= data.summaries.length - 1;

    if (window.innerWidth < 1080) {
      document.getElementById('readerView').scrollIntoView({ behavior: 'smooth' });
    }
  }

  storylineFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-chip')) {
      storylineFilters.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeStoryline = e.target.getAttribute('data-filter');
      renderChapterList();
    }
  });

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

  btnFontUp.addEventListener('click', () => {
    if (readerFontSize < 1.6) {
      readerFontSize += 0.08;
      document.documentElement.style.setProperty('--reader-size', `${readerFontSize}rem`);
    }
  });

  btnFontDown.addEventListener('click', () => {
    if (readerFontSize > 0.9) {
      readerFontSize -= 0.08;
      document.documentElement.style.setProperty('--reader-size', `${readerFontSize}rem`);
    }
  });

  btnCopyTelegram.addEventListener('click', () => {
    const ch = data.summaries[currentChapterIndex];
    if (!ch) return;

    let tgText = `🍸 **ХРОНИКИ ПОРТО-ИНВЕРНО: ${ch.title.toUpperCase()}**\n\n`;
    tgText += `> 📍 *${ch.category} • ${ch.date || '1931 год'}*\n\n`;
    const clean = ch.content.replace(/^#\s+[^\n]+\n+/, '').trim();
    tgText += clean + '\n\n';
    tgText += `🔖 #ПортоИнверно #${ch.category.replace(/\s+/g, '')} #Хроники`;

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
      characterGrid.innerHTML = '<div style="grid-column: 1/-1; padding: 4rem; text-align: center; color: var(--text-dim);">Персонажи не найдены</div>';
      return;
    }

    filtered.forEach(char => {
      const card = document.createElement('div');
      card.className = 'dossier-card';

      let chipClass = 'chip-alive';
      let icon = '🟢';
      if (char.status === 'Погиб') { chipClass = 'chip-dead'; icon = '🔴'; }
      else if (char.status === 'В бегах') { chipClass = 'chip-run'; icon = '🟣'; }
      else if (char.status === 'Ранен') { chipClass = 'chip-injured'; icon = '🟡'; }
      else if (char.status === 'Пропал') { chipClass = 'chip-missing'; icon = '⚪'; }

      // Get initial
      const initial = char.name.replace(/[^А-ЯЁA-Zа-яёa-z]/g, '').charAt(0).toUpperCase() || 'П';

      card.innerHTML = `
        <div>
          <div class="card-top-row">
            <div class="avatar-ring">${initial}</div>
            <div class="card-names-col">
              <h3 class="card-char-name">${char.name}</h3>
              <div class="card-char-role">${char.role || 'Персонаж'}</div>
            </div>
          </div>
          
          <div class="card-badges-row">
            <span class="status-chip ${chipClass}">${icon} ${char.status}</span>
            <span class="faction-chip">${char.faction}</span>
          </div>

          <p class="card-bio-snippet">${char.bio || ''}</p>
        </div>

        <div class="card-action-link">
          <span>Открыть полное досье</span> →
        </div>
      `;

      card.addEventListener('click', () => openCharacterModal(char, initial));
      characterGrid.appendChild(card);
    });
  }

  function openCharacterModal(char, initial) {
    activeModalCharacter = char;
    modalAvatarInitials.textContent = initial || char.name.charAt(0);
    modalName.textContent = char.name;
    modalRole.textContent = char.role || 'Персонаж';
    modalStatus.textContent = char.status;
    modalFaction.textContent = char.faction;

    let chipClass = 'chip-alive';
    if (char.status === 'Погиб') chipClass = 'chip-dead';
    else if (char.status === 'В бегах') chipClass = 'chip-run';
    else if (char.status === 'Ранен') chipClass = 'chip-injured';
    else if (char.status === 'Пропал') chipClass = 'chip-missing';

    modalStatus.className = `status-chip ${chipClass}`;
    modalBio.textContent = char.bio || 'Данные засекречены.';

    if (char.relations) {
      modalRelationsSection.style.display = 'block';
      modalRelations.textContent = char.relations;
    } else {
      modalRelationsSection.style.display = 'none';
    }

    charModal.style.display = 'flex';
  }

  modalClose.addEventListener('click', () => charModal.style.display = 'none');
  charModal.addEventListener('click', (e) => {
    if (e.target === charModal) charModal.style.display = 'none';
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

    copyToClipboard(tgDossier, 'Досье скопировано для Telegram!');
  });

  charStatusFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-chip')) {
      charStatusFilters.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCharStatus = e.target.getAttribute('data-status');
      renderCharacters();
    }
  });

  charFactionFilters.addEventListener('click', (e) => {
    if (e.target.classList.contains('filter-chip')) {
      charFactionFilters.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      activeCharFaction = e.target.getAttribute('data-faction');
      renderCharacters();
    }
  });

  // ----------------------------------------------------
  // Feedback Hub (ОС)
  // ----------------------------------------------------
  // Populate feedback session select
  data.summaries.forEach((s, idx) => {
    const opt = document.createElement('option');
    opt.value = s.title;
    opt.textContent = s.title;
    fbSessionSelect.appendChild(opt);
  });
  if (data.summaries.length > 0) {
    fbSessionSelect.value = data.summaries[data.summaries.length - 1].title;
  }

  // Star Rating Click Listeners
  ratingStars.forEach(star => {
    star.addEventListener('click', () => {
      currentRating = parseInt(star.getAttribute('data-rate'), 10);
      ratingStars.forEach(s => {
        const r = parseInt(s.getAttribute('data-rate'), 10);
        s.classList.toggle('active', r <= currentRating);
      });
      let emoji = currentRating >= 9 ? '🔥' : currentRating >= 7 ? '⭐' : '💀';
      fbRatingVal.textContent = `${currentRating} / 10 ${emoji}`;
      updateFeedbackPreview();
    });
  });

  function generateFeedbackPost() {
    const author = fbAuthor.value.trim() || 'Игрок';
    const session = fbSessionSelect.value;
    const mvp = fbMvp.value.trim();
    const highlights = fbHighlights.value.trim();
    const theories = fbTheories.value.trim();
    const wishes = fbWishes.value.trim();

    let starsStr = '★'.repeat(currentRating) + '☆'.repeat(10 - currentRating);

    let text = `⭐ **ОБРАТНАЯ СВЯЗЬ ПО СЕССИИ | ПОРТО-ИНВЕРНО**\n\n`;
    text += `👤 **Автор отзыва:** ${author}\n`;
    text += `📖 **Сессия:** ${session}\n`;
    text += `📊 **Оценка игры:** ${currentRating}/10  (${starsStr})\n\n`;

    if (mvp) {
      text += `🏆 **MVP сессии:** ${mvp}\n\n`;
    }

    if (highlights) {
      text += `🔥 **Что зацепило / Впечатления:**\n> ${highlights.replace(/\n/g, '\n> ')}\n\n`;
    }

    if (theories) {
      text += `🕵️ **Теории, догадки и планы:**\n${theories}\n\n`;
    }

    if (wishes) {
      text += `✨ **Звезда и Желание:**\n${wishes}\n\n`;
    }

    text += `🔖 #ПортоИнверно #ОбратнаяСвязь #ОС #НРИ`;
    return text;
  }

  function updateFeedbackPreview() {
    const raw = generateFeedbackPost();
    fbTgLivePreview.textContent = raw;
  }

  [fbAuthor, fbSessionSelect, fbMvp, fbHighlights, fbTheories, fbWishes].forEach(el => {
    el.addEventListener('input', updateFeedbackPreview);
    el.addEventListener('change', updateFeedbackPreview);
  });

  btnGenerateTgFeedback.addEventListener('click', () => {
    const post = generateFeedbackPost();
    copyToClipboard(post, 'Отзыв (ОС) скопирован для Telegram!');
  });

  // Local storage for feedback history
  function loadLocalFeedback() {
    const list = JSON.parse(localStorage.getItem('porto_feedback_history') || '[]');
    if (list.length === 0) {
      savedFeedbackList.innerHTML = '<p class="empty-hint">История пока пуста</p>';
      return;
    }
    savedFeedbackList.innerHTML = '';
    list.slice(-5).reverse().forEach(item => {
      const div = document.createElement('div');
      div.className = 'saved-item';
      div.innerHTML = `
        <div>
          <b>${item.session}</b> (${item.rating}/10) — <i>${item.author}</i>
        </div>
        <button class="btn-glass" style="padding: 0.2rem 0.5rem; font-size: 0.7rem;">Копировать</button>
      `;
      div.querySelector('button').addEventListener('click', () => {
        copyToClipboard(item.text, 'Сохраненный отзыв скопирован!');
      });
      savedFeedbackList.appendChild(div);
    });
  }

  btnSaveLocalFeedback.addEventListener('click', () => {
    const post = generateFeedbackPost();
    const list = JSON.parse(localStorage.getItem('porto_feedback_history') || '[]');
    list.push({
      date: new Date().toLocaleDateString(),
      session: fbSessionSelect.value,
      author: fbAuthor.value.trim() || 'Игрок',
      rating: currentRating,
      text: post
    });
    localStorage.setItem('porto_feedback_history', JSON.stringify(list));
    loadLocalFeedback();
    showToast('Отзыв сохранен в историю!');
  });

  // ----------------------------------------------------
  // Telegram Hub
  // ----------------------------------------------------
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
• Полный реестр действующих лиц и банд (Фишеры, Банда Крауча, Эль Гринго, Мэрия)

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
      return `👤 **СВОДКА КЛЮЧЕВЫХ ФРАКЦИЙ И БАНД | ПОРТО-ИНВЕРНО**

🗡 **Банда Крауча (8 человек):**
1. Крауч (Лидер) • 2. Гаред Венц (Тактик) • 3. Сильвия Дюпре (Снайпер)
4. Калиб Маккой (Взрывотехник, †) • 5. Джонатан Кроули (Врач)
6. Рой Маршал (Штурмовик) • 7. Бернард Кляйн (Инженер) • 8. Беатрис (Водитель)

🇲🇽 **Картель «Эль Гринго»:**
• Матео (Лидер) • Исабель (И.о. лидера) • Сантьяго (Снайпер)
• Карлос (Водитель) • Пикля (Координатор)

🏢 **Семья Фишеров:**
• Адам Фишер • Молли Фишер • Хизер Реймонд • Иван • Марта • Ной

🔖 #ПортоИнверно #Персонажи #Банды`;
    }

    return '';
  }

  function updateTgPreview() {
    const raw = getGeneratedTelegramPost();
    let previewHtml = raw
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

  // Reading Progress Bar
  window.addEventListener('scroll', () => {
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const progress = total > 0 ? (window.scrollY / total) * 100 : 0;
    readingProgressBar.style.width = `${progress}%`;
  });

  // Initial Load
  renderChapterList();
  if (data.summaries.length > 0) {
    loadChapter(currentChapterIndex);
  }
  renderCharacters();
  updateFeedbackPreview();
  loadLocalFeedback();
  updateTgPreview();
});
