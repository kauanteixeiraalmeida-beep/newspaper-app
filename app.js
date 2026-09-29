const KEY_USERS = 'jornal-users';
const KEY_PREFS = 'jornal-prefs';
const KEY_CURRENT = 'jornal-current';
const KEY_ISSUES = 'jornal-issues';

const demoIssues = [
  {
    id: 'demo-1',
    title: 'Jornal de Vargem Grande',
    edition: '204',
    date: '2026-09-28',
    category: 'Local',
    summary: 'Edição especial com destaques da feira, eventos culturais e entrevistas com moradores locais.',
    files: [{
      name: 'capa-jornal.svg',
      type: 'image/svg+xml',
      data: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700">
          <rect width="1000" height="700" fill="#f2e7d3"/>
          <rect x="70" y="70" width="860" height="560" fill="#fffaf3" stroke="#222" stroke-width="4"/>
          <text x="500" y="230" text-anchor="middle" font-family="Georgia" font-size="72" fill="#1a1a1a">JORNAL</text>
          <text x="500" y="310" text-anchor="middle" font-family="Georgia" font-size="42" fill="#8b1e1e">VARGEM GRANDE</text>
          <line x1="180" y1="360" x2="820" y2="360" stroke="#222" stroke-width="3"/>
          <text x="500" y="450" text-anchor="middle" font-family="Arial" font-size="26">ED. 204 • 28 DE SETEMBRO</text>
          <text x="500" y="520" text-anchor="middle" font-family="Arial" font-size="22">Feira local • Cultura • Esportes</text>
        </svg>
      `)
    }]
  },
  {
    id: 'demo-2',
    title: 'Destaque Regional',
    edition: '203',
    date: '2026-09-21',
    category: 'Regional',
    summary: 'Cobertura completa dos eventos regionais e discussão sobre desenvolvimento local.',
    files: [{
      name: 'destaque-regional.svg',
      type: 'image/svg+xml',
      data: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700">
          <rect width="1000" height="700" fill="#d9e8dc"/>
          <text x="500" y="260" text-anchor="middle" font-family="Georgia" font-size="62" fill="#214c1c">DESTAQUE REGIONAL</text>
          <text x="500" y="380" text-anchor="middle" font-family="Arial" font-size="28">Eventos, pessoas e história do município</text>
        </svg>
      `)
    }]
  },
  {
    id: 'demo-3',
    title: 'Esportes em Foco',
    edition: '202',
    date: '2026-09-14',
    category: 'Esportes',
    summary: 'Acompanhe jogos, mobilidade esportiva e destaques da semana.',
    files: [{
      name: 'esportes.svg',
      type: 'image/svg+xml',
      data: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="700">
          <rect width="1000" height="700" fill="#eadcc0"/>
          <text x="500" y="250" text-anchor="middle" font-family="Georgia" font-size="70" fill="#b82929">ESPORTES</text>
          <text x="500" y="380" text-anchor="middle" font-family="Arial" font-size="28">Resultados, análise e destaques da semana</text>
        </svg>
      `)
    }]
  }
];

const $ = (id) => document.getElementById(id);

let issues = [];
let currentUser = null;
let carouselIndex = 0;
let selectedFiles = [];

function getUsers() {
  return JSON.parse(localStorage.getItem(KEY_USERS) || '[]');
}

function saveUsers(users) {
  localStorage.setItem(KEY_USERS, JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(KEY_CURRENT) || 'null');
}

function saveCurrentUser(user) {
  localStorage.setItem(KEY_CURRENT, JSON.stringify(user));
}

function getPrefs() {
  return JSON.parse(localStorage.getItem(KEY_PREFS) || '{"theme":"light","fontSize":"medium"}');
}

function savePrefs(prefs) {
  localStorage.setItem(KEY_PREFS, JSON.stringify(prefs));
}

function getIssues() {
  return JSON.parse(localStorage.getItem(KEY_ISSUES) || '[]');
}

function saveIssues(items) {
  localStorage.setItem(KEY_ISSUES, JSON.stringify(items));
}

function applyAppearance() {
  const prefs = getPrefs();
  document.body.classList.toggle('dark-mode', prefs.theme === 'dark');
  document.body.classList.remove('font-small', 'font-large');
  if (prefs.fontSize === 'small') document.body.classList.add('font-small');
  if (prefs.fontSize === 'large') document.body.classList.add('font-large');
}

function showLoginModal() {
  $('loginModal').classList.remove('hidden');
  $('appContainer').classList.add('hidden');
}

function hideLoginModal() {
  $('loginModal').classList.add('hidden');
  $('appContainer').classList.remove('hidden');
}

function setUpInitialData() {
  if (!getIssues().length) {
    saveIssues(demoIssues);
  }
  issues = getIssues();

  const storedUser = getCurrentUser();
  if (storedUser) {
    currentUser = storedUser;
    hideLoginModal();
  } else {
    showLoginModal();
  }

  applyAppearance();
}

function canPublish() {
  return currentUser && (currentUser.role === 'jornalista' || currentUser.role === 'admin');
}

function renderIssueList() {
  const items = [...issues].reverse();

  if (!items.length) {
    $('issueList').innerHTML = '<div class="empty-state">Nenhuma edição publicada ainda.</div>';
    return;
  }

  $('issueList').innerHTML = items.map((issue) => {
    const cover = getCoverFile(issue);
    return `
      <article class="issue-card" data-id="${issue.id}">
        ${cover ? mediaHtml(cover, 'issue-cover') : '<div class="empty-state">Sem capa</div>'}
        <div class="issue-header">
          <span class="issue-tag">${issue.category}</span>
          <span class="issue-meta">Ed. ${issue.edition}</span>
        </div>
        <div>
          <h3>${issue.title}</h3>
          <div class="issue-meta">
            <span>${formatDate(issue.date)}</span>
            <span>•</span>
            <span>${issue.files?.length || 0} arquivo(s)</span>
          </div>
        </div>
        <p class="issue-summary">${issue.summary || 'Sem resumo.'}</p>
        <div class="issue-actions">
          <button type="button" class="action-btn" data-view-id="${issue.id}">Abrir</button>
        </div>
      </article>
    `;
  }).join('');

  document.querySelectorAll('[data-view-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const item = issues.find((it) => it.id === button.dataset.viewId);
      if (item) openIssueModal(item);
    });
  });
}

function getCoverFile(issue) {
  const files = issue.files || [];
  return files.find(file => (file.type || '').startsWith('image/')) || files[0] || null;
}

function renderCarousel() {
  const list = [...issues].reverse().slice(0, 5);
  if (!list.length) {
    $('carousel').innerHTML = '<div class="empty-state">Nenhuma edição na home.</div>';
    $('carouselDots').innerHTML = '';
    return;
  }

  const current = list[carouselIndex % list.length];
  const cover = getCoverFile(current);

  $('carousel').innerHTML = `
    <div class="carousel-item">
      ${cover ? mediaHtml(cover) : '<div class="empty-state">Sem capa</div>'}
      <div class="carousel-info">
        <h3>${current.title}</h3>
        <div class="carousel-meta">
          <span>${current.category}</span>
          <span>•</span>
          <span>Ed. ${current.edition}</span>
          <span>•</span>
          <span>${formatDate(current.date)}</span>
        </div>
      </div>
    </div>
  `;

  $('carouselDots').innerHTML = list.map((_, index) => {
    const active = index === (carouselIndex % list.length) ? 'active' : '';
    return `<div class="carousel-dot ${active}" data-index="${index}"></div>`;
  }).join('');

  document.querySelectorAll('.carousel-dot').forEach((dot) => {
    dot.addEventListener('click', () => {
      carouselIndex = Number(dot.dataset.index);
      renderCarousel();
    });
  });
}

function openIssueModal(issue) {
  const files = issue.files || [];
  const firstFile = files[0];

  $('modalContent').innerHTML = `
    <div class="modal-content">
      <div class="modal-preview">
        ${firstFile ? mediaHtml(firstFile) : '<div class="empty-state">Sem visualização</div>'}
      </div>
      <div class="modal-details">
        <div class="modal-tag">${issue.category}</div>
        <h3>${issue.title}</h3>
        <div class="issue-meta">
          <span>Ed. ${issue.edition}</span>
          <span>•</span>
          <span>${formatDate(issue.date)}</span>
        </div>
        <p class="modal-summary">${issue.summary || 'Sem resumo.'}</p>

        ${files.length > 1 ? `
          <div>
            <h4>Arquivos</h4>
            <div class="file-list">
              ${files.map((file, index) => `
                <button type="button" class="file-choice" data-file-index="${index}">${file.name}</button>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div class="modal-actions">
          ${canPublish() ? '<button type="button" id="deleteIssueBtn" class="secondary-btn">Excluir</button>' : ''}
        </div>
      </div>
    </div>
  `;

  document.querySelectorAll('.file-choice').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.fileIndex);
      const selected = files[idx];
      const preview = $('modalContent').querySelector('.modal-preview');
      preview.innerHTML = selected ? mediaHtml(selected) : '<div class="empty-state">Arquivo indisponível</div>';
    });
  });

  const deleteBtn = $('deleteIssueBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (!confirm('Deseja excluir esta edição?')) return;
      const updated = issues.filter((item) => item.id !== issue.id);
      issues = updated;
      saveIssues(issues);
      closeModal('view');
      renderIssueList();
      renderCarousel();
    });
  }

  $('viewModal').classList.remove('hidden');
  $('viewModal').setAttribute('aria-hidden', 'false');
}

function closeModal(name) {
  const modal = $(name === 'view' ? 'viewModal' : name === 'publish' ? 'publishModal' : 'settingsModal');
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

function processFiles(fileList) {
  return Promise.all(Array.from(fileList).map(file => new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        type: file.type || '',
        data: String(reader.result || '')
      });
    };
    reader.readAsDataURL(file);
  })));
}

function renderSelectedFiles() {
  if (!selectedFiles.length) {
    $('filePreview').className = 'file-preview empty';
    $('filePreview').textContent = 'Nenhum arquivo selecionado';
    return;
  }

  $('filePreview').className = 'file-preview';
  $('filePreview').innerHTML = selectedFiles.map(file => `<div>✓ ${file.name}</div>`).join('');
}

async function handleFileSelection(event) {
  selectedFiles = await processFiles(event.target.files || []);
  renderSelectedFiles();
}

function updatePublishControls() {
  const isAllowed = canPublish();
  $('publishSection').classList.toggle('hidden', !isAllowed);
}

function handleLogin(event) {
  event.preventDefault();
  const username = $('username').value.trim();
  const role = $('userRole').value;

  if (!username) return;

  const users = getUsers();
  let user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());

  if (!user) {
    user = { id: Date.now(), username, role };
    users.push(user);
    saveUsers(users);
  } else {
    user.role = role;
    saveUsers(users);
  }

  currentUser = user;
  saveCurrentUser(user);

  $('username').value = '';
  $('userRole').value = 'leitor';

  hideLoginModal();
  updatePublishControls();
}

function logout() {
  currentUser = null;
  localStorage.removeItem(KEY_CURRENT);
  showLoginModal();
}

function populateSettings() {
  if (!currentUser) return;
  $('settingsUsername').textContent = currentUser.username;
  $('settingsRole').textContent = currentUser.role === 'admin'
    ? 'Administrador'
    : currentUser.role === 'jornalista'
      ? 'Jornalista'
      : 'Leitor';

  const prefs = getPrefs();
  $('themeSelect').value = prefs.theme || 'light';
  $('fontSizeSelect').value = prefs.fontSize || 'medium';
}

function bindSettingsEvents() {
  $('themeSelect').addEventListener('change', () => {
    const prefs = getPrefs();
    prefs.theme = $('themeSelect').value;
    savePrefs(prefs);
    applyAppearance();
  });

  $('fontSizeSelect').addEventListener('change', () => {
    const prefs = getPrefs();
    prefs.fontSize = $('fontSizeSelect').value;
    savePrefs(prefs);
    applyAppearance();
  });

  $('settingsBtn').addEventListener('click', () => {
    populateSettings();
    $('settingsModal').classList.remove('hidden');
  });

  $('closeSettingsModal').addEventListener('click', () => closeModal('settings'));
  $('changeUserBtn').addEventListener('click', () => {
    closeModal('settings');
    logout();
  });
}

function bindGlobalEvents() {
  $('loginForm').addEventListener('submit', handleLogin);
  $('logoutBtn').addEventListener('click', logout);
  $('publishBtn').addEventListener('click', () => $('publishModal').classList.remove('hidden'));
  $('closePublishModal').addEventListener('click', () => closeModal('publish'));
  $('closeViewModal').addEventListener('click', () => closeModal('view'));
  $('fileInput').addEventListener('change', handleFileSelection);

  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', () => {
      const modalType = overlay.dataset.close;
      if (modalType === 'publish') closeModal('publish');
      if (modalType === 'view') closeModal('view');
      if (modalType === 'settings') closeModal('settings');
    });
  });

  $('prevCarousel').addEventListener('click', () => {
    const total = Math.min(issues.length, 5);
    if (!total) return;
    carouselIndex = (carouselIndex - 1 + total) % total;
    renderCarousel();
  });

  $('nextCarousel').addEventListener('click', () => {
    const total = Math.min(issues.length, 5);
    if (!total) return;
    carouselIndex = (carouselIndex + 1) % total;
    renderCarousel();
  });

  $('issueForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!canPublish()) {
      alert('Você não tem permissão para publicar.');
      return;
    }

    const title = $('title').value.trim();
    const edition = $('edition').value.trim();
    const date = $('date').value;
    const summary = $('summary').value.trim();

    if (!title || !edition || !date || !selectedFiles.length) {
      alert('Preencha pelo menos título, edição, data e selecione um arquivo.');
      return;
    }

    const newIssue = {
      id: crypto.randomUUID(),
      title,
      edition,
      date,
      category: $('category').value,
      summary,
      author: currentUser.username,
      files: selectedFiles
    };

    issues.push(newIssue);
    saveIssues(issues);
    renderIssueList();
    renderCarousel();
    $('issueForm').reset();
    selectedFiles = [];
    renderSelectedFiles();
    closeModal('publish');
  });

  $('resetDemo').addEventListener('click', () => {
    issues = [...demoIssues];
    saveIssues(issues);
    renderIssueList();
    renderCarousel();
    $('issueForm').reset();
    selectedFiles = [];
    renderSelectedFiles();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal('publish');
      closeModal('view');
      closeModal('settings');
    }
  });
}

function mediaHtml(file, className = '') {
  if (!file || !file.data) return '<div class="empty-state">Arquivo indisponível</div>';

  if ((file.type || '').startsWith('image/')) {
    return `<img class="${className}" src="${file.data}" alt="${file.name}" />`;
  }

  if ((file.type || '').startsWith('video/')) {
    return `<video class="${className}" src="${file.data}" controls playsinline></video>`;
  }

  if (file.type === 'application/pdf' || (file.name || '').toLowerCase().endsWith('.pdf')) {
    return `<iframe class="${className}" src="${file.data}" title="${file.name}"></iframe>`;
  }

  return `<div class="empty-state"><strong>${file.name}</strong><br />Arquivo anexado</div>`;
}

window.addEventListener('load', () => {
  setUpInitialData();
  bindGlobalEvents();
  bindSettingsEvents();
  updatePublishControls();
  renderIssueList();
  renderCarousel();
  renderSelectedFiles();
  populateSettings();

  if (currentUser) {
    hideLoginModal();
    updatePublishControls();
  }
});

window.logout = logout;
