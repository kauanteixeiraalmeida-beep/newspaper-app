const STORAGE_KEY = 'jornal-digital-edicoes';

const form = document.getElementById('issueForm');
const list = document.getElementById('issueList');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const closeModalBtn = document.getElementById('closeModal');
const resetDemoBtn = document.getElementById('resetDemo');

let activeFileData = '';
let activeFileName = '';
let activeFileType = '';
let selectedIssue = null;

const sampleIssues = [
  {
    id: crypto.randomUUID(),
    title: 'Jornal de Vargem Grande',
    edition: '204',
    date: '2026-09-28',
    category: 'Local',
    summary: 'Edição especial com destaques da feira, eventos culturais e entrevistas com moradores locais.',
    fileName: 'capa-jornal.png',
    fileType: 'image/png',
    fileData: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100">
        <defs>
          <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stop-color="#f8f2ea"/>
            <stop offset="100%" stop-color="#e5d7ba"/>
          </linearGradient>
        </defs>
        <rect width="800" height="1100" fill="url(#bg)"/>
        <rect x="70" y="70" width="660" height="960" fill="#fffaf3" stroke="#1f1f1f" stroke-width="4"/>
        <text x="400" y="250" text-anchor="middle" font-family="Georgia, serif" font-size="80" fill="#1d1d1d">JORNAL</text>
        <text x="400" y="330" text-anchor="middle" font-family="Georgia, serif" font-size="42" fill="#8b1e1e" letter-spacing="6">VARGEM GRANDE</text>
        <line x1="150" y1="390" x2="650" y2="390" stroke="#1d1d1d" stroke-width="3"/>
        <text x="400" y="520" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#444">ED. 204 · 28 DE SETEMBRO</text>
        <text x="400" y="680" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="#444">Feira local • Cultura • Esportes</text>
        <text x="400" y="915" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#333">www.jornaldevargem.com.br</text>
      </svg>
    `)
  }
];

function readLocalIssues() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleIssues));
      return [...sampleIssues];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : [...sampleIssues];
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleIssues));
    return [...sampleIssues];
  }
}

let issues = readLocalIssues();

function saveIssues() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(issues));
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function getFilePreviewMarkup(issue) {
  if (!issue.fileData) {
    return '<div class="empty-state">Arquivo não anexado</div>';
  }

  const mime = issue.fileType || '';

  if (mime.startsWith('image/')) {
    return `<img src="${issue.fileData}" alt="Capa da edição ${issue.title}" />`;
  }

  if (mime === 'application/pdf' || issue.fileName.toLowerCase().endsWith('.pdf')) {
    return `<iframe src="${issue.fileData}" title="Visualização do PDF"></iframe>`;
  }

  return `
    <div class="empty-state">
      <div>
        <strong>${issue.fileName}</strong><br />
        Arquivo de texto ou documento anexado.
      </div>
    </div>
  `;
}

function renderIssues() {
  if (!issues.length) {
    list.innerHTML = '<div class="empty-state">Nenhuma edição publicada ainda. Cadastre a primeira edição do jornal.</div>';
    return;
  }

  list.innerHTML = issues
    .slice()
    .reverse()
    .map((issue) => `
      <article class="issue-card">
        <div class="issue-header">
          <span class="issue-tag">${issue.category}</span>
          <span class="issue-meta">Edição ${issue.edition}</span>
        </div>

        <div>
          <h3>${issue.title}</h3>
          <div class="issue-meta">
            <span>${formatDate(issue.date)}</span>
            <span>•</span>
            <span>${issue.fileName ? 'Arquivo anexado' : 'Sem arquivo'}</span>
          </div>
        </div>

        <p class="issue-summary">${issue.summary}</p>

        <div class="issue-actions">
          <button type="button" class="action-btn" data-view-id="${issue.id}">Visualizar</button>
          ${issue.fileData ? `<a class="issue-download" href="${issue.fileData}" target="_blank" rel="noreferrer">Abrir arquivo</a>` : '<span></span>'}
        </div>
      </article>
    `)
    .join('');

  document.querySelectorAll('[data-view-id]').forEach((button) => {
    button.addEventListener('click', () => {
      const current = issues.find((item) => item.id === button.dataset.viewId);
      if (!current) return;
      openModal(current);
    });
  });
}

function updateFilePreview() {
  if (!activeFileData) {
    filePreview.classList.add('empty');
    filePreview.innerHTML = '<span>Nenhum arquivo selecionado</span>';
    return;
  }

  filePreview.classList.remove('empty');
  const filetype = activeFileType || '';

  if (filetype.startsWith('image/')) {
    filePreview.innerHTML = `<img src="${activeFileData}" alt="Prévia do material enviado" />`;
    return;
  }

  if (filetype === 'application/pdf' || activeFileName.toLowerCase().endsWith('.pdf')) {
    filePreview.innerHTML = `<iframe src="${activeFileData}" title="Prévia do PDF"></iframe>`;
    return;
  }

  filePreview.innerHTML = `<div><strong>${activeFileName}</strong><br /><span>Arquivo anexado com sucesso.</span></div>`;
}

function openModal(issue) {
  selectedIssue = issue;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  modalContent.innerHTML = `
    <div class="modal-content">
      <div class="modal-preview">
        ${getFilePreviewMarkup(issue)}
      </div>
      <div class="modal-details">
        <div class="modal-tag">${issue.category}</div>
        <h3 id="modalTitle">${issue.title}</h3>
        <div class="meta-stack">
          <div><strong>Edição:</strong> ${issue.edition}</div>
          <div><strong>Data:</strong> ${formatDate(issue.date)}</div>
        </div>
        <p class="modal-summary">${issue.summary}</p>
        <div class="modal-actions">
          ${issue.fileData ? `<a class="modal-action" href="${issue.fileData}" target="_blank" rel="noreferrer">Abrir documento</a>` : ''}
          <button type="button" class="secondary-btn" data-delete-id="${issue.id}">Excluir</button>
        </div>
      </div>
    </div>
  `;

  const deleteBtn = modalContent.querySelector('[data-delete-id]');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      issues = issues.filter((item) => item.id !== issue.id);
      saveIssues();
      renderIssues();
      closeModal();
    });
  }
}

function closeModal() {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  selectedIssue = null;
}

async function handleFileSelection(event) {
  const file = event.target.files?.[0];
  if (!file) {
    activeFileData = '';
    activeFileName = '';
    activeFileType = '';
    updateFilePreview();
    return;
  }

  activeFileName = file.name;
  activeFileType = file.type || 'application/octet-stream';

  const reader = new FileReader();
  reader.onload = () => {
    activeFileData = String(reader.result || '');
    updateFilePreview();
  };
  reader.readAsDataURL(file);
}

function handleSubmit(event) {
  event.preventDefault();

  const title = document.getElementById('title').value.trim();
  const edition = document.getElementById('edition').value.trim();
  const date = document.getElementById('date').value;
  const category = document.getElementById('category').value;
  const summary = document.getElementById('summary').value.trim();

  if (!title || !edition || !date || !summary) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }

  const newIssue = {
    id: crypto.randomUUID(),
    title,
    edition,
    date,
    category,
    summary,
    fileName: activeFileName,
    fileType: activeFileType,
    fileData: activeFileData
  };

  issues.push(newIssue);
  saveIssues();
  renderIssues();
  form.reset();
  activeFileData = '';
  activeFileName = '';
  activeFileType = '';
  updateFilePreview();
}

function resetDemo() {
  issues = [...sampleIssues];
  saveIssues();
  renderIssues();
  form.reset();
  activeFileData = '';
  activeFileName = '';
  activeFileType = '';
  updateFilePreview();
}

fileInput.addEventListener('change', handleFileSelection);
form.addEventListener('submit', handleSubmit);
closeModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
  if (event.target.dataset.close === 'true') {
    closeModal();
  }
});
resetDemoBtn.addEventListener('click', resetDemo);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

renderIssues();
updateFilePreview();
