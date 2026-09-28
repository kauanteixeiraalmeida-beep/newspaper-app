const KEY_USERS='jornal-users',KEY_PREFS='jornal-prefs',KEY_ISSUES='jornal-issues',KEY_CURRENT='jornal-current',DB='jornal-db',STORE='issues';
const $=id=>document.getElementById(id);
let currentUser=null,issues=[],carouselIndex=0;

const demo=[{id:'demo-1',title:'Jornal de Vargem Grande',edition:'204',date:'2026-09-28',category:'Local',summary:'Edição especial com destaques da feira, eventos culturais e entrevistas com moradores locais.',author:'Admin',files:[{name:'capa.svg',type:'image/svg+xml',data:'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#f2e7d3"/><text x="400" y="200" text-anchor="middle" font-family="Georgia" font-size="72">JORNAL</text><text x="400" y="280" text-anchor="middle" font-family="Georgia" font-size="40" fill="#8b1e1e">VARGEM GRANDE</text><text x="400" y="380" text-anchor="middle" font-family="Arial" font-size="24">Edição 204 - 28 de Setembro</text></svg>')}]},{id:'demo-2',title:'Destaque Regional',edition:'203',date:'2026-09-21',category:'Regional',summary:'Coberta completa dos últimos eventos regionais e notícias importantes.',author:'Admin',files:[{name:'capa2.svg',type:'image/svg+xml',data:'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#d4e3d9"/><text x="400" y="250" text-anchor="middle" font-family="Georgia" font-size="60" fill="#2d5016">DESTAQUE REGIONAL</text><text x="400" y="350" text-anchor="middle" font-size="28">Cobertura completa de eventos</text></svg>')}]},{id:'demo-3',title:'Esportes em Foco',edition:'202',date:'2026-09-14',category:'Esportes',summary:'Campeonatos, resultados e análises dos principais esportes.',author:'Admin',files:[{name:'capa3.svg',type:'image/svg+xml',data:'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#e3d4b9"/><text x="400" y="200" text-anchor="middle" font-family="Georgia" font-size="70" fill="#c41e1e">ESPORTES</text><text x="400" y="320" text-anchor="middle" font-family="Arial" font-size="32">Edição 202</text></svg>')}]};

async function openDb(){return new Promise((r,e)=>{const x=indexedDB.open(DB,1);x.onupgradeneeded=()=>x.result.createObjectStore(STORE,{keyPath:'id'});x.onsuccess=()=>r(x.result);x.onerror=()=>e(x.error)})}
async function getAll(){const db=await openDb();return new Promise((r,e)=>{const x=db.transaction(STORE,'readonly').objectStore(STORE).getAll();x.onsuccess=()=>r(x.result);x.onerror=()=>e(x.error)})}
async function put(item){const db=await openDb();return new Promise((r,e)=>{const x=db.transaction(STORE,'readwrite').objectStore(STORE).put(item);x.onsuccess=r;x.onerror=()=>e(x.error)})}
async function remove(id){const db=await openDb();return new Promise((r,e)=>{const x=db.transaction(STORE,'readwrite').objectStore(STORE).delete(id);x.onsuccess=r;x.onerror=()=>e(x.error)})}

function loadUsers(){const x=JSON.parse(localStorage.getItem(KEY_USERS)||'[]');return x.length?x:[{id:1,username:'Admin Demo',role:'admin'},{id:2,username:'Jornalista Demo',role:'jornalista'},{id:3,username:'Leitor Demo',role:'leitor'}]}
function saveUsers(users){localStorage.setItem(KEY_USERS,JSON.stringify(users))}
function loadPrefs(){return JSON.parse(localStorage.getItem(KEY_PREFS)||'{"theme":"light","fontSize":"medium"}')}
function savePrefs(prefs){localStorage.setItem(KEY_PREFS,JSON.stringify(prefs))}
function loadCurrentUser(){return JSON.parse(localStorage.getItem(KEY_CURRENT)||'null')}
function saveCurrentUser(user){localStorage.setItem(KEY_CURRENT,JSON.stringify(user))}

function applyTheme(prefs){document.body.classList.remove('dark-mode');document.body.classList.remove('font-small','font-medium','font-large');if(prefs.theme==='dark')document.body.classList.add('dark-mode');if(prefs.fontSize==='small')document.body.classList.add('font-small');if(prefs.fontSize==='large')document.body.classList.add('font-large')}

function showLoginModal(){$('loginModal').classList.remove('hidden');$('appContainer').classList.add('hidden')}
function hideLoginModal(){$('loginModal').classList.add('hidden');$('appContainer').classList.remove('hidden')}

$('loginForm').onsubmit=(e)=>{e.preventDefault();const username=$('username').value.trim();const role=$('userRole').value;if(!username)return;const users=loadUsers();let user=users.find(u=>u.username===username);if(!user){user={id:Date.now(),username,role};users.push(user);saveUsers(users)}else{user.role=role}currentUser=user;saveCurrentUser(user);$('username').value='';hideLoginModal();updateUI();renderIssues()};

function logout(){currentUser=null;localStorage.removeItem(KEY_CURRENT);showLoginModal()}

$('logoutBtn').onclick=logout;
$('settingsBtn').onclick=()=>{const prefs=loadPrefs();$('settingsUsername').textContent=currentUser.username;$('settingsRole').textContent=currentUser.role==='admin'?'Administrador':currentUser.role==='jornalista'?'Jornalista':'Leitor';$('themeSelect').value=prefs.theme;$('fontSizeSelect').value=prefs.fontSize;$('settingsModal').classList.remove('hidden')};

$('themeSelect').onchange=$('fontSizeSelect').onchange=(e)=>{const prefs=loadPrefs();prefs.theme=$('themeSelect').value;prefs.fontSize=$('fontSizeSelect').value;savePrefs(prefs);applyTheme(prefs)};

$('changeUserBtn').onclick=()=>{$('settingsModal').classList.add('hidden');logout()};

function updateUI(){
  const isJournalist=currentUser.role==='jornalista'||currentUser.role==='admin';
  $('publishSection').classList.toggle('hidden',!isJournalist);
  if(isJournalist)$('publishBtn').onclick=()=>$('publishModal').classList.remove('hidden');
}

function niceDate(v){return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(v+'T00:00:00'))}

function media(file,cls=''){if(!file?.data)return '<div class="empty-state">Sem arquivo</div>';if((file.type||'').startsWith('image/'))return `<img class="${cls}" src="${file.data}" alt="Imagem">`;
if((file.type||'').startsWith('video/'))return `<video class="${cls}" src="${file.data}" controls></video>`;
if(file.type==='application/pdf'||file.name?.toLowerCase().endsWith('.pdf'))return `<iframe class="${cls}" src="${file.data}"></iframe>`;
return `<div class="empty-state"><strong>${file.name}</strong></div>`}

async function renderCarousel(){
  const recent=issues.slice().reverse().slice(0,5);
  if(!recent.length)return;
  const item=recent[carouselIndex];
  const files=item.files||[];
  const cover=files.find(f=>(f.type||'').startsWith('image/'))||files[0];
  $('carousel').innerHTML=cover?media(cover):'<div class="carousel-item"></div>';
  $('carouselDots').innerHTML=recent.map((_,i)=>`<div class="carousel-dot ${i===carouselIndex?'active':''}" data-idx="${i}"></div>`).join('');
  document.querySelectorAll('.carousel-dot').forEach(d=>d.onclick=()=>{carouselIndex=Number(d.dataset.idx);renderCarousel()});
}

$('prevCarousel').onclick=()=>{const recent=issues.slice().reverse().slice(0,5);carouselIndex=(carouselIndex-1+recent.length)%recent.length;renderCarousel()};
$('nextCarousel').onclick=()=>{const recent=issues.slice().reverse().slice(0,5);carouselIndex=(carouselIndex+1)%recent.length;renderCarousel()};

async function renderIssues(){
  const items=issues.slice().reverse();
  if(!items.length){$('issueList').innerHTML='<div class="empty-state">Nenhuma edição publicada.</div>';return}
  $('issueList').innerHTML=items.map(i=>{const files=i.files||[];const cover=files.find(f=>(f.type||'').startsWith('image/'));return `<article class="issue-card" data-id="${i.id}">${cover?media(cover,'issue-cover'):''}<div class="issue-header"><span class="issue-tag">${i.category}</span><span class="issue-meta">Ed. ${i.edition}</span></div><div><h3>${i.title}</h3><div class="issue-meta">${niceDate(i.date)}</div></div><p class="issue-summary">${i.summary||''}</p><div class="issue-actions"><button class="action-btn" data-view="${i.id}">Abrir</button></div></article>`}).join('');
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>openView(items.find(i=>i.id===b.dataset.view)));
}

function openView(issue){
  const files=issue.files||[];
  $('viewModal').classList.remove('hidden');
  $('modalContent').innerHTML=`<div class="modal-content"><div class="modal-preview">${media(files[0])}</div><div class="modal-details"><div class="modal-tag">${issue.category}</div><h3>${issue.title}</h3><div class="issue-meta"><b>Ed. ${issue.edition}</b> · ${niceDate(issue.date)}</div><p class="modal-summary">${issue.summary||''}</p>${files.length>1?`<h4>Arquivos</h4><div class="file-list">${files.map((f,i)=>`<button class="action-btn" onclick="document.querySelector('.modal-preview').innerHTML='${media(f).replace(/'/g,"\\'")}'">${f.name}</button>`).join('')}</div>`:''}<div class="modal-actions"><button class="secondary-btn" id="delBtn">Excluir</button></div></div></div>`;
  $('delBtn').onclick=async()=>{if(!confirm('Tem certeza?'))return;await remove(issue.id);issues=await getAll();$('viewModal').classList.add('hidden');renderIssues();renderCarousel()}
}

let selectedFiles=[];
$('fileInput').onchange=async(e)=>{selectedFiles=await Promise.all([...(e.target.files||[])].map(f=>new Promise(r=>{const rd=new FileReader();rd.onload=()=>r({name:f.name,type:f.type||'',data:rd.result});rd.readAsDataURL(f)})));$('filePreview').className='file-preview';$('filePreview').innerHTML=selectedFiles.length?`<div>${selectedFiles.map(f=>`<div>✓ ${f.name}</div>`).join('')}</div>`:'Nenhum arquivo'};

$('issueForm').onsubmit=async(e)=>{e.preventDefault();if(!selectedFiles.length){alert('Anexe um arquivo');return}
const issue={id:crypto.randomUUID(),title:$('title').value.trim(),edition:$('edition').value.trim(),date:$('date').value,category:$('category').value,summary:$('summary').value.trim(),author:currentUser.username,files:selectedFiles};
if(!issue.title||!issue.edition||!issue.date){alert('Preencha título, edição e data.');return}
try{await put(issue);issues=await getAll();renderIssues();renderCarousel();$('issueForm').reset();selectedFiles=[];$('filePreview').innerHTML='Nenhum arquivo';$('fileInput').value='';$('publishModal').classList.add('hidden')}catch(err){alert('Erro ao salvar. Tente arquivos menores.')}};

$('resetDemo').onclick=async()=>{for(const issue of issues)await remove(issue.id);for(const item of demo)await put(item);issues=await getAll();renderIssues();renderCarousel();$('issueForm').reset()};

$('closePublishModal').onclick=()=>$('publishModal').classList.add('hidden');
$('closeViewModal').onclick=()=>$('viewModal').classList.add('hidden');
$('closeSettingsModal').onclick=()=>$('settingsModal').classList.add('hidden');

document.querySelectorAll('.modal-overlay').forEach(o=>o.onclick=()=>{
  if(o.dataset.close==='publish')$('publishModal').classList.add('hidden');
  if(o.dataset.close==='view')$('viewModal').classList.add('hidden');
  if(o.dataset.close==='settings')$('settingsModal').classList.add('hidden');
});

document.onkeydown=e=>{if(e.key==='Escape'){$('publishModal').classList.add('hidden');$('viewModal').classList.add('hidden');$('settingsModal').classList.add('hidden')}};

(async()=>{issues=await getAll();if(!issues.length){for(const item of demo)await put(item);issues=await getAll()}currentUser=loadCurrentUser();const prefs=loadPrefs();applyTheme(prefs);if(currentUser){hideLoginModal();updateUI();renderIssues();renderCarousel()}else{showLoginModal()}})();
