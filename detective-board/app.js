/**
 * ДЕТЕКТИВНАЯ ДОСКА ПОРТО-ИНВЕРНО (1931) — APPLICATION ENGINE
 */

(function () {
  'use strict';

  const data = window.BOARD_DATA;
  if (!data) {
    console.error('BOARD_DATA not found');
    return;
  }

  // DOM Elements
  const viewport = document.getElementById('board-viewport');
  const canvas = document.getElementById('board-canvas');
  const itemsContainer = document.getElementById('board-items');
  const stringsSvg = document.getElementById('strings-svg');
  const modal = document.getElementById('dossier-modal');
  const modalContent = document.getElementById('modal-content');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // Controls
  const btnZoomIn = document.getElementById('btn-zoom-in');
  const btnZoomOut = document.getElementById('btn-zoom-out');
  const btnResetView = document.getElementById('btn-reset-view');
  const btnToggleStrings = document.getElementById('btn-toggle-strings');
  const btnAudio = document.getElementById('btn-audio');

  // State
  let showStrings = true;
  let isAudioPlaying = false;
  let audioCtx = null;
  let audioNodes = null;

  // Viewport Pan/Zoom state
  let scale = 1.0;
  let panX = 0;
  let panY = 0;
  let isPanning = false;
  let startX = 0;
  let startY = 0;

  // Element positions map: id -> { x, y, width, height, pinOffset: {x, y} }
  const itemPositions = new Map();

  // Initialize
  function init() {
    renderItems();
    updateItemPositions();
    renderStrings();
    centerBoard();
    setupEventListeners();
  }

  // Render Characters & Notes
  function renderItems() {
    itemsContainer.innerHTML = '';

    // 1. Render Characters (Polaroids)
    data.characters.forEach((char) => {
      const card = document.createElement('div');
      card.className = 'polaroid-card';
      card.id = `item-${char.id}`;
      card.style.left = `${char.pos.x}px`;
      card.style.top = `${char.pos.y}px`;
      card.style.transform = `rotate(${char.rotation || 0}deg)`;

      // Push pin color
      let pinClass = '';
      if (char.pinColor === '#457b9d') pinClass = 'pin-blue';
      else if (char.pinColor === '#2a9d8f') pinClass = 'pin-green';
      else if (char.pinColor === '#d4af37') pinClass = 'pin-gold';
      else if (char.pinColor === '#1d3557') pinClass = 'pin-navy';

      card.innerHTML = `
        <div class="push-pin ${pinClass}"></div>
        <div class="polaroid-img-wrapper">
          <img class="polaroid-img" src="${char.photo}" alt="${char.name}" loading="lazy">
        </div>
        <div class="polaroid-caption">
          <div class="polaroid-name">${char.name}</div>
          <div class="polaroid-alias">${char.alias || ''}</div>
          <div class="polaroid-role">${char.role}</div>
          <div class="polaroid-status ${char.status === 'alive' ? 'alive' : 'danger'}">${char.statusLabel}</div>
        </div>
      `;

      // Click to open dossier
      card.addEventListener('click', (e) => {
        if (!card.dataset.dragged) {
          openCharacterDossier(char);
        }
      });

      makeDraggable(card, char);
      itemsContainer.appendChild(card);

      // 2. Render Character's Notes
      if (char.notes && char.notes.length > 0) {
        char.notes.forEach((note) => {
          const noteEl = document.createElement('div');
          noteEl.className = `sticky-note ${note.type || 'sticker-yellow'}`;
          noteEl.id = `item-${note.id}`;
          noteEl.style.left = `${note.pos.x}px`;
          noteEl.style.top = `${note.pos.y}px`;
          noteEl.style.transform = `rotate(${note.rotation || 0}deg)`;

          noteEl.innerHTML = `
            <div class="note-tape"></div>
            <div class="note-title">${note.title}</div>
            <div class="note-text">${note.text}</div>
          `;

          noteEl.addEventListener('click', () => {
            if (!noteEl.dataset.dragged) {
              openNoteModal(note, char);
            }
          });

          makeDraggable(noteEl, note);
          itemsContainer.appendChild(noteEl);
        });
      }
    });
  }

  // Update item position registry
  function updateItemPositions() {
    itemPositions.clear();

    data.characters.forEach((char) => {
      const el = document.getElementById(`item-${char.id}`);
      if (el) {
        itemPositions.set(char.id, {
          x: char.pos.x + 130, // center x of 260px card
          y: char.pos.y + 10,  // top pin position
          el: el
        });
      }

      if (char.notes) {
        char.notes.forEach((note) => {
          const noteEl = document.getElementById(`item-${note.id}`);
          if (noteEl) {
            itemPositions.set(note.id, {
              x: note.pos.x + 100, // center x of 200px note
              y: note.pos.y + 10,  // top pin position
              el: noteEl
            });
          }
        });
      }
    });
  }

  // Render Red Wool Strings
  function renderStrings() {
    if (!showStrings) {
      stringsSvg.innerHTML = '';
      // Remove tags if any
      document.querySelectorAll('.thread-tag').forEach(t => t.remove());
      return;
    }

    stringsSvg.innerHTML = '';
    document.querySelectorAll('.thread-tag').forEach(t => t.remove());

    data.connections.forEach((conn) => {
      const fromPos = itemPositions.get(conn.from.id);
      const toPos = itemPositions.get(conn.to.id);

      if (!fromPos || !toPos) return;

      const p1 = { x: fromPos.x, y: fromPos.y };
      const p2 = { x: toPos.x, y: toPos.y };

      // Calculate Bézier curve with gravity sag (catenary curve approximation)
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const sag = (conn.tension !== undefined ? conn.tension : 0.2) * dist;

      const ctrlX = midX;
      const ctrlY = midY + sag;

      const pathD = `M ${p1.x} ${p1.y} Q ${ctrlX} ${ctrlY} ${p2.x} ${p2.y}`;

      // 1. Shadow path
      const shadowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      shadowPath.setAttribute('d', pathD);
      shadowPath.setAttribute('class', 'wool-shadow');
      stringsSvg.appendChild(shadowPath);

      // 2. Red wool thread
      const threadPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      threadPath.setAttribute('d', pathD);
      threadPath.setAttribute('class', `wool-thread ${conn.style === 'dashed' ? 'dashed' : ''}`);
      if (conn.color) threadPath.style.stroke = conn.color;
      stringsSvg.appendChild(threadPath);

      // 3. Label tag if present
      if (conn.label) {
        const tag = document.createElement('div');
        tag.className = 'thread-tag';
        // Position at midpoint of curve
        const tagX = (p1.x + 2 * ctrlX + p2.x) / 4;
        const tagY = (p1.y + 2 * ctrlY + p2.y) / 4;

        tag.style.left = `${tagX}px`;
        tag.style.top = `${tagY}px`;
        tag.innerHTML = `📌 ${conn.label}`;
        tag.title = `Связь: ${conn.label}`;

        canvas.appendChild(tag);
      }
    });
  }

  // Draggable logic for items
  function makeDraggable(element, itemData) {
    let isDragging = false;
    let startMouseX = 0;
    let startMouseY = 0;
    let initialItemX = 0;
    let initialItemY = 0;

    // Prevent browser native image/text drag-and-drop
    element.setAttribute('draggable', 'false');
    element.addEventListener('dragstart', (e) => e.preventDefault());

    element.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // only left click
      e.preventDefault();
      e.stopPropagation();

      isDragging = true;
      element.dataset.dragged = 'false';
      element.classList.add('is-dragging');

      startMouseX = e.clientX;
      startMouseY = e.clientY;
      initialItemX = itemData.pos.x;
      initialItemY = itemData.pos.y;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const dx = (e.clientX - startMouseX) / scale;
      const dy = (e.clientY - startMouseY) / scale;

      if (Math.hypot(dx, dy) > 3) {
        element.dataset.dragged = 'true';
      }

      itemData.pos.x = initialItemX + dx;
      itemData.pos.y = initialItemY + dy;

      element.style.left = `${itemData.pos.x}px`;
      element.style.top = `${itemData.pos.y}px`;

      updateItemPositions();
      renderStrings();
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        element.classList.remove('is-dragging');
        setTimeout(() => {
          element.dataset.dragged = 'false';
        }, 60);
      }
    });
  }

  // Center board in viewport based on bounding box of all items
  function centerBoard() {
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    data.characters.forEach((char) => {
      minX = Math.min(minX, char.pos.x);
      maxX = Math.max(maxX, char.pos.x + 280);
      minY = Math.min(minY, char.pos.y);
      maxY = Math.max(maxY, char.pos.y + 400);

      if (char.notes) {
        char.notes.forEach((note) => {
          minX = Math.min(minX, note.pos.x);
          maxX = Math.max(maxX, note.pos.x + 220);
          minY = Math.min(minY, note.pos.y);
          maxY = Math.max(maxY, note.pos.y + 180);
        });
      }
    });

    if (minX === Infinity) {
      minX = 600; maxX = 1800; minY = 300; maxY = 1500;
    }

    const padding = 120;
    const bboxWidth = (maxX - minX) + padding * 2;
    const bboxHeight = (maxY - minY) + padding * 2;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const scaleX = vw / bboxWidth;
    const scaleY = vh / bboxHeight;
    scale = Math.min(scaleX, scaleY, 1.0);
    if (scale < 0.12) scale = 0.12;

    panX = vw / 2 - centerX * scale;
    panY = vh / 2 - centerY * scale;

    applyTransform();
  }

  // Apply canvas transform
  function applyTransform() {
    canvas.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  }

  // Event Listeners for Pan/Zoom & Controls
  function setupEventListeners() {
    // Viewport Panning
    viewport.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      isPanning = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
      viewport.classList.add('grabbing');
    });

    window.addEventListener('mousemove', (e) => {
      if (!isPanning) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      applyTransform();
    });

    window.addEventListener('mouseup', () => {
      isPanning = false;
      viewport.classList.remove('grabbing');
    });

    // Wheel Zoom towards cursor
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();

      const zoomFactor = 1.1;
      const newScale = e.deltaY < 0 ? scale * zoomFactor : scale / zoomFactor;
      const clampedScale = Math.min(Math.max(newScale, 0.12), 2.5);

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Adjust pan to zoom into cursor point
      panX = mouseX - ((mouseX - panX) / scale) * clampedScale;
      panY = mouseY - ((mouseY - panY) / scale) * clampedScale;
      scale = clampedScale;

      applyTransform();
    }, { passive: false });

    // HUD Buttons
    btnZoomIn.addEventListener('click', () => {
      scale = Math.min(scale * 1.2, 2.5);
      applyTransform();
    });

    btnZoomOut.addEventListener('click', () => {
      scale = Math.max(scale / 1.2, 0.12);
      applyTransform();
    });

    btnResetView.addEventListener('click', () => {
      centerBoard();
    });

    btnToggleStrings.addEventListener('click', () => {
      showStrings = !showStrings;
      btnToggleStrings.textContent = showStrings ? '🧶 Нити: ВКЛ' : '🧶 Нити: ВЫКЛ';
      btnToggleStrings.classList.toggle('active', showStrings);
      renderStrings();
    });

    btnAudio.addEventListener('click', () => {
      toggleAudio();
    });

    // Modal Close
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // Open Dossier Modal for Character
  function openCharacterDossier(char) {
    modalContent.innerHTML = `
      <div class="dossier-left">
        <img class="dossier-portrait" src="${char.photo}" alt="${char.name}">
        <div class="dossier-left-info">
          <p><strong>СТАТУС:</strong> <span style="color: #c1121f;">${char.statusLabel}</span></p>
          <p><strong>ВЕТКА:</strong> ${char.branch}</p>
          <p><strong>ПЕРИОД:</strong> Октябрь 1931 г.</p>
          <p><strong>ГОРОД:</strong> Порто-Инверно</p>
        </div>
      </div>
      <div class="dossier-right">
        <div>
          <h2>${char.name}</h2>
          <div class="dossier-alias-sub">${char.alias || ''}</div>
        </div>

        <div class="dossier-section">
          <h4>Роль в синдикате & биография</h4>
          <p>${char.dossier.background}</p>
        </div>

        <div class="dossier-section">
          <h4>Ключевые инциденты & улики</h4>
          <ul class="dossier-events-list">
            ${char.dossier.keyEvents.map(ev => `<li>${ev}</li>`).join('')}
          </ul>
        </div>

        ${char.dossier.quote ? `
          <div class="dossier-quote-box">
            ${char.dossier.quote}
          </div>
        ` : ''}
      </div>
    `;

    modal.classList.add('active');
  }

  // Open Note Modal
  function openNoteModal(note, char) {
    modalContent.innerHTML = `
      <div class="dossier-left" style="justify-content: center;">
        <div class="sticky-note ${note.type || 'sticker-yellow'}" style="position: relative; transform: none; width: 100%; min-height: 200px;">
          <div class="note-tape"></div>
          <div class="note-title">${note.title}</div>
          <div class="note-text" style="font-size: 22px;">${note.text}</div>
        </div>
      </div>
      <div class="dossier-right">
        <div>
          <h2>Заметка к делу: ${char.name}</h2>
          <div class="dossier-alias-sub">${note.title}</div>
        </div>

        <div class="dossier-section">
          <h4>Контекст улики</h4>
          <p>${note.text}</p>
          <p style="margin-top: 10px; font-size: 13px; color: #666; font-family: 'Courier Prime', monospace;">
            Прикреплено к досье персонажа: <strong>${char.name}</strong> (${char.role}).
          </p>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
  }

  // Procedural Noir Rain & Vinyl Sound Synth (Zero external files needed)
  function toggleAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    if (isAudioPlaying) {
      stopAudio();
      btnAudio.textContent = '📻 Звук';
      btnAudio.classList.remove('active');
      isAudioPlaying = false;
    } else {
      startAudio();
      btnAudio.textContent = '📻 Дождь: ВКЛ';
      btnAudio.classList.add('active');
      isAudioPlaying = true;
    }
  }

  function startAudio() {
    // 1. Rain Noise Generator
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to make it sound like gentle rain outside
    const lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 850;

    const rainGain = audioCtx.createGain();
    rainGain.gain.value = 0.08;

    whiteNoise.connect(lowpass);
    lowpass.connect(rainGain);
    rainGain.connect(audioCtx.destination);
    whiteNoise.start();

    // 2. Vinyl Crackle Generator
    const crackleBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const crackleOut = crackleBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      crackleOut[i] = Math.random() > 0.998 ? (Math.random() * 2 - 1) : 0;
    }

    const crackle = audioCtx.createBufferSource();
    crackle.buffer = crackleBuffer;
    crackle.loop = true;

    const crackleGain = audioCtx.createGain();
    crackleGain.gain.value = 0.12;

    crackle.connect(crackleGain);
    crackleGain.connect(audioCtx.destination);
    crackle.start();

    audioNodes = { whiteNoise, crackle, rainGain, crackleGain };
  }

  function stopAudio() {
    if (audioNodes) {
      if (audioNodes.whiteNoise) audioNodes.whiteNoise.stop();
      if (audioNodes.crackle) audioNodes.crackle.stop();
      audioNodes = null;
    }
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
