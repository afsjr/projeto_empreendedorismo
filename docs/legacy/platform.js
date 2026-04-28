/* ============================================
   Empreendedores Exponenciais — CSM
   Platform JavaScript (empreendedores-platform.html)
   ============================================ */

const TEORIA_URL = 'https://claude.ai/public/artifacts/7c23c233-a288-45ff-8339-4e43d59a15e8';
const DRIVE_URL = 'https://drive.google.com/drive/folders/1Pkxd6CRWMOaLIGzNMZvzdgNt3IoKae1h?usp=sharing';
const SP = 'empreendedorismocsm2026';
const SM = 'adelino_csm@santamonicaceq';
const LS = 'ee_csm_v5';
const SK = 'ee_csm_sess';
const MAX_LOG = 200;

// ── TOAST NOTIFICATIONS ──
function showToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── LOADING OVERLAY ──
let loadingCount = 0;
function showLoading() {
  loadingCount++;
  let ov = document.getElementById('loadingOverlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'loadingOverlay';
    ov.className = 'loading-overlay';
    ov.innerHTML = `<div class="loading-box"><div class="loading-spinner"></div><span class="loading-text">Carregando...</span></div>`;
    document.body.appendChild(ov);
  }
  ov.classList.remove('hidden');
}
function hideLoading() {
  loadingCount = Math.max(0, loadingCount - 1);
  if (loadingCount === 0) {
    const ov = document.getElementById('loadingOverlay');
    if (ov) ov.classList.add('hidden');
  }
}

// ── NETWORK STATUS ──
function updateNetworkStatus() {
  let bar = document.getElementById('networkBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'networkBar';
    document.body.appendChild(bar);
  }
  if (navigator.onLine) {
    bar.className = 'online';
    bar.textContent = '🟢 Conectado';
    setTimeout(() => { bar.style.display = 'none'; }, 2000);
  } else {
    bar.className = 'offline';
    bar.textContent = '🔴 Sem conexão — dados salvos localmente, sincronizarão quando voltar';
  }
}
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

// ── SAFE SAVE with network check ──
function safeSaveState() {
  try {
    localStorage.setItem(LS, JSON.stringify({
      view: state.view, filter: state.filter, filterT: state.filterT,
      progress: state.progress, notes: state.notes, openEtapas: state.openEtapas,
      teacherObs: state.teacherObs, groups: state.groups, log: state.log, gic: gic
    }));
    return true;
  } catch (e) {
    console.error('localStorage save failed:', e);
    showToast('Erro ao salvar dados locais. Verifique o armazenamento.', 'error');
    return false;
  }
}

// ── LINK MODALS ──
function openTeoria() { showLinkModal('📚 Material Teórico do Programa', TEORIA_URL); }
function openDrive() { showLinkModal('📁 Google Drive — Evidências', DRIVE_URL); }
function showLinkModal(title, url) {
  let ov = document.getElementById('linkModal');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'linkModal';
    ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:500;display:flex;align-items:center;justify-content:center;padding:16px';
    ov.innerHTML = `<div style="background:#fff;border-radius:14px;border:2px solid var(--cr);padding:24px;max-width:460px;width:100%;position:relative">
      <button onclick="document.getElementById('linkModal').style.display='none'" style="position:absolute;top:10px;right:12px;background:var(--crl);border:1px solid var(--cb2);border-radius:50%;width:26px;height:26px;font-size:13px;color:var(--crd);cursor:pointer">✕</button>
      <div id="lmTitle" style="font-size:15px;font-weight:700;color:var(--crd);margin-bottom:12px"></div>
      <p style="font-size:12px;color:var(--cyd);margin-bottom:12px;line-height:1.6">Clique no link abaixo para abrir em nova aba, ou copie o endereço:</p>
      <a id="lmLink" href="#" target="_blank" rel="noopener noreferrer" style="display:block;font-size:12px;color:var(--cr);word-break:break-all;background:var(--crl);border:1px solid var(--cb2);border-radius:8px;padding:10px 12px;margin-bottom:14px;text-decoration:underline"></a>
      <button onclick="navigator.clipboard&&navigator.clipboard.writeText(document.getElementById('lmLink').href).then(()=>showToast('Link copiado!','success'))" style="background:var(--cy);color:#1a0a0a;border:none;padding:7px 16px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer">Copiar link</button>
    </div>`;
    document.body.appendChild(ov);
  }
  document.getElementById('lmTitle').textContent = title;
  const lnk = document.getElementById('lmLink');
  lnk.href = url; lnk.textContent = url;
  ov.style.display = 'flex';
}

// ── AUTH ──
let authCB = null;
function gs() { try { return JSON.parse(sessionStorage.getItem(SK)) || {}; } catch (e) { return {}; } }
function setSession(l) { sessionStorage.setItem(SK, JSON.stringify({ l, t: Date.now() })); }
function clearSession() { sessionStorage.removeItem(SK); }
function getLevel() { const s = gs(); return (s.l && (Date.now() - s.t) < 1800000) ? s.l : null; }
function isMaster() { return getLevel() === 'master'; }
function isProf() { const l = getLevel(); return l === 'master' || l === 'professor'; }

function requireAuth(need, cb) {
  if (need === 'professor' && isProf()) { cb(); return; }
  if (need === 'master' && isMaster()) { cb(); return; }
  authCB = cb;
  document.getElementById('authTitle').textContent = need === 'master' ? 'Acesso Master' : 'Área do Professor';
  document.getElementById('authSubtitle').textContent = need === 'master' ? 'Digite a senha master.' : 'Digite a senha do professor.';
  document.getElementById('authPassword').value = '';
  document.getElementById('authError').style.display = 'none';
  document.getElementById('authDialog').classList.remove('hidden');
  setTimeout(() => document.getElementById('authPassword').focus(), 80);
}
function submitAuth() {
  const v = document.getElementById('authPassword').value;
  if (v === SM) { setSession('master'); closeAuthDialog(); if (authCB) { authCB(); authCB = null; } return; }
  if (v === SP) { setSession('professor'); closeAuthDialog(); if (authCB) { authCB(); authCB = null; } return; }
  document.getElementById('authError').style.display = 'block';
  document.getElementById('authPassword').value = '';
  document.getElementById('authPassword').focus();
}
function closeAuthDialog() { document.getElementById('authDialog').classList.add('hidden'); authCB = null; }

// ── MASTER PANEL ──
function openMasterPanel() {
  requireAuth('master', () => {
    document.getElementById('masterActions').innerHTML = `
      <div style="background:var(--crl);border:1px solid var(--cb2);border-radius:var(--r);padding:14px;display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div><div style="font-size:13px;font-weight:600">Excluir todos os grupos</div><div style="font-size:11px;color:var(--cyd);margin-top:2px">Remove todos os grupos e seus progressos.</div></div>
        <button class="btn-danger" style="font-size:12px" onclick="masterDelAll()">Excluir tudo</button>
      </div>
      <div style="background:var(--crl);border:1px solid var(--cb2);border-radius:var(--r);padding:14px;display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div><div style="font-size:13px;font-weight:600">Resetar todo o progresso</div><div style="font-size:11px;color:var(--cyd);margin-top:2px">Zera etapas e anotações de todos os projetos.</div></div>
        <button class="btn-danger" style="font-size:12px" onclick="masterReset()">Resetar</button>
      </div>
      <div style="background:var(--cyl);border:1px solid var(--cy);border-radius:var(--r);padding:14px;display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div><div style="font-size:13px;font-weight:600">Encerrar sessão master</div><div style="font-size:11px;color:var(--cyd);margin-top:2px">Sai do acesso privilegiado desta sessão.</div></div>
        <button class="btn-cancel" style="font-size:12px" onclick="masterLogout()">Sair</button>
      </div>`;
    document.getElementById('masterDialog').classList.remove('hidden');
  });
}
function closeMasterDialog() { document.getElementById('masterDialog').classList.add('hidden'); }
function masterDelAll() {
  if (!confirm('Excluir TODOS os grupos? Esta ação não pode ser desfeita.')) return;
  state.groups = []; cloudSave(); closeMasterDialog(); renderGroups(); renderLanding();
  if (state.view === 'teacher') renderTeacher();
  addLog('Master: todos os grupos excluídos');
  showToast('Todos os grupos foram excluídos.', 'info');
  // Também limpa no Supabase
  if (isOnline() && typeof supabase !== 'undefined') {
    supabase.from('grupos').delete().neq('id', '');
    supabase.from('progresso_grupo').delete().neq('id', '');
  }
}
function masterReset() {
  if (!confirm('Resetar TODO o progresso e anotações? Esta ação não pode ser desfeita.')) return;
  state.progress = {}; state.notes = {}; state.openEtapas = {}; state.teacherObs = {};
  cloudSave(); closeMasterDialog(); renderCards(); renderGroups();
  if (state.view === 'teacher') renderTeacher();
  addLog('Master: progresso e anotações resetados');
  showToast('Progresso e anotações foram resetados.', 'info');
  // Também limpa progresso no Supabase
  if (isOnline() && typeof supabase !== 'undefined') {
    supabase.from('progresso_grupo').delete().neq('id', '');
  }
}
function masterLogout() { clearSession(); closeMasterDialog(); showToast('Sessão master encerrada.', 'info'); }

// ── STATE ──
function loadSt() { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; } }
// saveState delegates to cloudSave (defined in sync-supabase.js if loaded)
function saveState() { if (typeof cloudSave === 'function') { cloudSave(); } else { safeSaveState(); } }

const saved = loadSt();
let gic = saved.gic || 1;
const state = {
  view: saved.view || 'landing',
  filter: saved.filter || 'all',
  filterT: saved.filterT || 'all',
  progress: saved.progress || {},
  notes: saved.notes || {},
  openEtapas: saved.openEtapas || {},
  teacherObs: saved.teacherObs || {},
  groups: saved.groups || [],
  log: saved.log || [],
  editingGid: null,
  curModal: null
};

// ── LOG ──
function addLog(msg) {
  const now = new Date();
  const ts = now.toLocaleDateString('pt-BR') + ' ' + now.toTimeString().slice(0, 5);
  state.log.unshift({ ts, msg });
  if (state.log.length > MAX_LOG) state.log = state.log.slice(0, MAX_LOG);
  cloudSave();

  // Também salva log direto no Supabase (independente do debounce)
  if (isOnline() && typeof supabase !== 'undefined') {
    supabase
      .from('atividades_log')
      .insert([{ timestamp: ts, mensagem: msg }])
      .then(({ error }) => { if (error) console.warn('⚠️ Log sync falhou:', error.message); })
      .catch(() => { });
  }
}
function clearLog() {
  if (!confirm('Limpar o registro de atividades?')) return;
  state.log = []; cloudSave(); renderLog();
  showToast('Log de atividades limpo.', 'info');
  // Também limpa no Supabase
  if (isOnline() && typeof supabase !== 'undefined') {
    supabase.from('atividades_log').delete().neq('id', '')
      .then(({ error }) => { if (error) console.warn('⚠️ Log cloud clear falhou:', error.message); })
      .catch(() => { });
  }
}
function renderLog() {
  const el = document.getElementById('logList'); if (!el) return;
  if (!state.log.length) { el.innerHTML = '<span style="color:var(--cyd);font-size:11px">Nenhuma atividade registrada ainda.</span>'; return; }
  el.innerHTML = state.log.map(l => `<div class="log-item"><span class="log-ts">${l.ts}</span>${l.msg}</div>`).join('');
}

// ── HELPERS ──
function bc(a) { return (a === 7 || a === 9) ? 'b7 b9' : 'b6 b8'; }
function getProgress(pid, gid) {
  const p = PROJECTS.find(x => x.id === pid); if (!p) return 0;
  const ns = gid ? `${gid}_${pid}` : pid;
  return Math.round(p.etapas.filter((_, i) => state.progress[ns + '_' + i]).length / p.etapas.length * 100);
}
function enrolledPids() { return new Set(state.groups.map(g => g.projectId)); }

// ── VIEWS ──
function setView(v) {
  if ((v === 'teacher' || v === 'projects-teacher') && !isProf()) { requireAuth('professor', () => setView(v)); return; }
  state.view = v; safeSaveState();
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  const el = document.getElementById('view-' + v); if (el) el.classList.add('active');
  const lbl = { landing: 'Início', groups: 'Grupos', projects: 'Projetos', teacher: 'Professor', 'projects-teacher': 'Professor' };
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.textContent.trim() === lbl[v]));
  if (v === 'landing') renderLanding();
  if (v === 'groups') renderGroups();
  if (v === 'projects') renderCards();
  if (v === 'teacher') { renderTeacher(); renderLog(); }
  if (v === 'projects-teacher') renderCardsT();
}

// ── LANDING ──
function renderLanding() {
  const g = state.groups.length;
  document.getElementById('landingStats').innerHTML = [
    { n: PROJECTS.length, l: 'projetos no programa' },
    { n: '6º–9º', l: 'anos do ensino fundamental' },
    { n: 2, l: 'semestres por ano' },
    { n: g, l: `grupo${g !== 1 ? 's' : ''} cadastrado${g !== 1 ? 's' : ''}` },
  ].map(s => `<div class="stat-c"><div class="stat-n">${s.n}</div><div class="stat-l">${s.l}</div></div>`).join('');
}

// ── GROUPS ──
function renderGroups() {
  const g = document.getElementById('groupsGrid');
  if (!state.groups.length) { g.innerHTML = `<div class="empty-state"><p>Nenhum grupo cadastrado ainda.</p><button class="btn-p" onclick="openGroupForm()">Criar primeiro grupo</button></div>`; return; }
  g.innerHTML = state.groups.map(gr => {
    const pct = getProgress(gr.projectId, gr.id);
    const p = PROJECTS.find(x => x.id === gr.projectId);
    return `<div class="group-card" onclick="openModal('${gr.projectId}','${gr.id}',false)">
      <div class="group-card-top"><div class="group-name">${gr.name}</div><span class="badge-ano ${(gr.ano === 7 || gr.ano === 9) ? 'b7' : 'b6'}">${gr.ano}º Ano</span></div>
      <div class="group-project">${p ? p.title : '—'}</div>
      <div class="group-members">${gr.members.filter(Boolean).map(m => `<span class="member-chip">${m}</span>`).join('')}</div>
      <div class="group-prog-label"><span>Progresso</span><span>${pct}%</span></div>
      <div class="group-prog-bar"><div class="group-prog-fill" style="width:${pct}%"></div></div>
      <div style="margin-top:10px;text-align:right">
        <button style="font-size:11px;background:transparent;border:1.5px solid var(--cb2);border-radius:20px;padding:3px 10px;color:var(--crd);font-weight:500" onclick="event.stopPropagation();openGroupForm('${gr.id}')">Editar</button>
      </div>
    </div>`;
  }).join('');
}

function populateProjectSelect(ano) {
  document.getElementById('gProject').innerHTML = PROJECTS.filter(p => p.ano === +ano).map(p => `<option value="${p.id}">${p.sem}º Sem · Op. ${p.opt} — ${p.title}</option>`).join('');
}
function openGroupForm(gid) {
  const ano = document.getElementById('gAno');
  ano.onchange = () => populateProjectSelect(ano.value);
  if (gid) {
    const gr = state.groups.find(g => g.id === gid);
    state.editingGid = gid;
    document.getElementById('groupDialogTitle').textContent = 'Editar grupo';
    document.getElementById('gName').value = gr.name;
    ano.value = gr.ano; populateProjectSelect(gr.ano);
    document.getElementById('gProject').value = gr.projectId;
    document.getElementById('membersFields').querySelectorAll('input').forEach((inp, i) => inp.value = gr.members[i] || '');
    document.getElementById('btnDeleteGroup').classList.remove('hidden');
  } else {
    state.editingGid = null;
    document.getElementById('groupDialogTitle').textContent = 'Novo grupo';
    document.getElementById('gName').value = ''; ano.value = '6'; populateProjectSelect('6');
    document.getElementById('membersFields').querySelectorAll('input').forEach(inp => inp.value = '');
    document.getElementById('btnDeleteGroup').classList.add('hidden');
  }
  document.getElementById('groupDialog').classList.remove('hidden');
}
function closeGroupDialog() { document.getElementById('groupDialog').classList.add('hidden'); state.editingGid = null; }
function saveGroup() {
  const name = document.getElementById('gName').value.trim();
  if (!name) { showToast('Informe o nome do grupo.', 'error'); return; }
  const ano = document.getElementById('gAno').value;
  const projectId = document.getElementById('gProject').value;
  const members = Array.from(document.getElementById('membersFields').querySelectorAll('input')).map(i => i.value.trim()).filter(Boolean);
  if (state.editingGid) {
    const gr = state.groups.find(g => g.id === state.editingGid);
    if (gr) { gr.name = name; gr.ano = +ano; gr.projectId = projectId; gr.members = members; }
    addLog(`Grupo editado: "${name}" (${ano}º Ano)`);
    showToast('Grupo atualizado com sucesso!', 'success');
  } else {
    const id = 'g' + (gic++);
    state.groups.push({ id, name, ano: +ano, projectId, members });
    addLog(`Novo grupo: "${name}" (${ano}º Ano) → ${PROJECTS.find(p => p.id === projectId)?.title || projectId}`);
    showToast('Grupo criado com sucesso!', 'success');
  }
  safeSaveState(); closeGroupDialog(); renderGroups(); renderLanding();
}
function askDeleteGroup() {
  requireAuth('master', () => {
    if (!confirm('Excluir este grupo permanentemente? Esta ação não pode ser desfeita.')) return;
    const gr = state.groups.find(g => g.id === state.editingGid);
    addLog(`Grupo excluído: "${gr?.name || state.editingGid}"`);
    state.groups = state.groups.filter(g => g.id !== state.editingGid);
    safeSaveState(); closeGroupDialog(); renderGroups(); renderLanding();
    if (state.view === 'teacher') renderTeacher();
    showToast('Grupo excluído.', 'info');
  });
}

// ── FILTERS ──
function setFilter(f, el) { state.filter = f; safeSaveState(); document.querySelectorAll('#filterBar .filter-btn').forEach(b => b.classList.remove('active')); el.classList.add('active'); renderCards(); }
function setFilterT(f, el) { state.filterT = f; safeSaveState(); document.querySelectorAll('#filterBarT .filter-btn').forEach(b => b.classList.remove('active')); el.classList.add('active'); renderCardsT(); }
function matchF(p, f) {
  if (f === 'all') return true;
  if (['6', '7', '8', '9'].includes(f)) return p.ano === +f;
  if (f === 's1') return p.sem === 1; if (f === 's2') return p.sem === 2; return true;
}

// ── CARDS (student) ──
function renderCards() {
  const enrolled = enrolledPids();
  const list = PROJECTS.filter(p => enrolled.has(p.id) && matchF(p, state.filter));
  const g = document.getElementById('projectsGrid');
  if (!list.length) { g.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><p style="font-size:13px">Nenhum projeto com grupo inscrito.<br>Peça ao professor para cadastrar o seu grupo.</p></div>`; return; }
  g.innerHTML = list.map(p => {
    const pct = getProgress(p.id);
    const grps = state.groups.filter(g => g.projectId === p.id);
    return `<div class="project-card" onclick="openStudentModal('${p.id}')">
      <div class="card-top"><span class="badge-ano ${(p.ano === 7 || p.ano === 9) ? 'b7' : 'b6'}">${p.ano}º Ano</span><span class="sem-badge">${p.sem}º Sem · Op. ${p.opt}</span></div>
      <div class="card-title">${p.title}</div>
      <div class="card-desc">${p.desc}</div>
      ${grps.length ? `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:8px">${grps.map(g => `<span class="member-chip">${g.name}</span>`).join('')}</div>` : ''}
      <div class="progress-wrap">
        <div class="progress-label"><span>Progresso</span><span>${pct}%</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="card-footer"><span>${p.duracao}</span><span class="team-size">${p.equipe}</span></div>
    </div>`;
  }).join('');
}

// ── CARDS (teacher) ──
function renderCardsT() {
  document.getElementById('projectsGridT').innerHTML = PROJECTS.filter(p => matchF(p, state.filterT)).map(p => {
    const pct = getProgress(p.id);
    return `<div class="project-card" onclick="openModal('${p.id}',null,true)">
      <div class="card-top"><span class="badge-ano ${(p.ano === 7 || p.ano === 9) ? 'b7' : 'b6'}">${p.ano}º Ano</span><span class="sem-badge">${p.sem}º Sem · Op. ${p.opt}</span></div>
      <div class="card-title">${p.title}</div>
      <div class="card-desc">${p.desc}</div>
      <div class="progress-wrap">
        <div class="progress-label"><span>Progresso</span><span>${pct}%</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="card-footer"><span>${p.duracao}</span><span class="team-size">${p.equipe}</span></div>
    </div>`;
  }).join('');
}

// ── STUDENT MODAL ──
function openStudentModal(pid) {
  const grps = state.groups.filter(g => g.projectId === pid);
  if (grps.length === 0) { openModal(pid, null, false); return; }
  if (grps.length === 1) { openModal(pid, grps[0].id, false); return; }
  const names = grps.map(g => g.name);
  const sel = window.prompt(`Qual grupo você é?\n${names.map((n, i) => `${i + 1}. ${n}`).join('\n')}\n\nDigite o número:`);
  const idx = parseInt(sel) - 1;
  if (idx >= 0 && idx < grps.length) openModal(pid, grps[idx].id, false);
}

// ── MODAL ──
function openModal(pid, gid, isT) {
  const p = PROJECTS.find(x => x.id === pid); if (!p) return;
  const teacherMode = isT || isProf();
  state.curModal = { pid, gid: gid || null, isT: teacherMode };
  document.getElementById('mBadges').innerHTML = `<span class="badge-ano ${(p.ano === 7 || p.ano === 9) ? 'b7' : 'b6'}">${p.ano}º Ano</span><span class="sem-badge">${p.sem}º Semestre · Opção ${p.opt}</span>${teacherMode ? '<span class="mi mi-t">professor</span>' : '<span class="mi mi-s">aluno</span>'}`;
  document.getElementById('mTitle').textContent = p.title;
  document.getElementById('mDesc').textContent = p.desc;
  document.getElementById('mMeta').innerHTML = [`<span class="meta-chip">Equipe: ${p.equipe}</span>`, `<span class="meta-chip">${p.duracao}</span>`, `<span class="meta-chip">${p.formato}</span>`].join('');
  const gr = gid ? state.groups.find(g => g.id === gid) : null;
  const gt = document.getElementById('mGroupTag');
  if (gr) { gt.innerHTML = `Grupo: <span>${gr.name}</span> &nbsp;·&nbsp; ${gr.members.filter(Boolean).join(', ')}`; gt.style.display = 'flex'; }
  else gt.style.display = 'none';
  const ns = gid ? `${gid}_${pid}` : pid;
  const pct = getProgress(pid, gid);
  document.getElementById('mPctLabel').textContent = `Progresso: ${pct}%`;
  document.getElementById('mOverallBar').style.width = pct + '%';
  document.getElementById('mBody').innerHTML = p.etapas.map((e, i) => buildEtapa(e, i, ns, pid, gid, teacherMode)).join('');
  document.getElementById('modalOverlay').classList.remove('hidden');
}

function buildEtapa(e, i, ns, pid, gid, isT) {
  const key = ns + '_' + i;
  const obsKey = pid + '_etapa_' + i;
  const done = !!state.progress[key];
  const open = !!state.openEtapas[key];
  const note = state.notes[key] || '';
  const tObs = state.teacherObs[obsKey] || '';

  let obsBlock = '';
  if (isT) {
    obsBlock = `<div class="teacher-obs-box" id="tob_${obsKey}">
      <div class="teacher-obs-label">📌 Observação do professor</div>
      <textarea class="teacher-obs-input" id="tobinput_${obsKey}" placeholder="Deixe uma observação para os alunos desta etapa...">${tObs}</textarea>
      <div class="obs-actions">
        <button class="obs-save-btn" onclick="saveTeacherObs('${obsKey}','${pid}',${i})">Salvar obs.</button>
        ${tObs ? `<button class="obs-del-btn" id="tobdel_${obsKey}" onclick="delTeacherObs('${obsKey}','${pid}',${i})">Remover</button>` : ''}
      </div>
    </div>`;
  } else if (tObs) {
    obsBlock = `<div class="teacher-obs-box">
      <div class="teacher-obs-label">📌 Observação do professor</div>
      <div class="teacher-obs-text">${tObs}</div>
    </div>`;
  }

  return `<div class="etapa" id="etapa_${key}">
    <div class="etapa-header" onclick="toggleEtapa('${key}')">
      <div class="etapa-check ${done ? 'done' : ''}" onclick="toggleCheck(event,'${key}','${pid}','${gid || ''}')"></div>
      <div class="etapa-label">${i + 1}. ${e.label}</div>
      <div class="etapa-week">${e.semana}</div>
    </div>
    <div class="etapa-body ${open ? '' : 'hidden'}" id="body_${key}">
      <div class="task-list">${e.tasks.map(t => `<div class="task-item"><div class="task-dot"></div><span>${t}</span></div>`).join('')}</div>
      ${obsBlock}
      <div class="notes-section">
        <div class="notes-label">Anotações da equipe</div>
        <textarea class="notes-input" placeholder="Escreva as observações desta etapa..." oninput="saveNote('${key}',this.value,'${gid || ''}','${pid}',${i})">${note}</textarea>
        <div class="drive-box" style="margin-top:10px">
          <span style="font-size:18px;flex-shrink:0">📁</span>
          <div class="drive-box-text">
            <strong>Enviar evidências (fotos, documentos, apresentações)</strong>
            <span>Faça o upload no Google Drive do programa. Organize em uma pasta com o nome do grupo.</span>
            <button class="drive-btn" onclick="openDrive()"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> Abrir Drive</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}

function saveTeacherObs(obsKey, pid, i) {
  const val = document.getElementById('tobinput_' + obsKey)?.value || '';
  state.teacherObs[obsKey] = val;
  safeSaveState();
  addLog(`Obs. professor salva: projeto ${pid}, etapa ${i + 1}`);
  const delBtn = document.getElementById('tobdel_' + obsKey);
  const acts = document.getElementById('tob_' + obsKey)?.querySelector('.obs-actions');
  if (acts) {
    if (val && !delBtn) {
      const b = document.createElement('button'); b.className = 'obs-del-btn'; b.id = 'tobdel_' + obsKey;
      b.textContent = 'Remover'; b.setAttribute('onclick', `delTeacherObs('${obsKey}','${pid}',${i})`);
      acts.appendChild(b);
    }
    if (!val && delBtn) delBtn.remove();
  }
  showToast('Observação salva!', 'success');
}

function delTeacherObs(obsKey, pid, i) {
  requireAuth('master', () => {
    if (!confirm('Remover esta observação?')) return;
    delete state.teacherObs[obsKey];
    safeSaveState();
    addLog(`Obs. professor removida: projeto ${pid}, etapa ${i + 1}`);
    const ta = document.getElementById('tobinput_' + obsKey); if (ta) ta.value = '';
    const db = document.getElementById('tobdel_' + obsKey); if (db) db.remove();
    showToast('Observação removida.', 'info');
  });
}

function toggleEtapa(key) {
  state.openEtapas[key] = !state.openEtapas[key];
  safeSaveState();
  document.getElementById('body_' + key)?.classList.toggle('hidden', !state.openEtapas[key]);
}

function toggleCheck(e, key, pid, gid) {
  e.stopPropagation();
  state.progress[key] = !state.progress[key];
  safeSaveState();
  document.getElementById('etapa_' + key)?.querySelector('.etapa-check')?.classList.toggle('done', state.progress[key]);
  const pct = getProgress(pid, gid || null);
  document.getElementById('mPctLabel').textContent = `Progresso: ${pct}%`;
  document.getElementById('mOverallBar').style.width = pct + '%';
  const grName = gid ? state.groups.find(g => g.id === gid)?.name : 'geral';
  addLog(`Etapa ${state.progress[key] ? 'concluída' : 'reaberta'}: ${PROJECTS.find(p => p.id === pid)?.title || pid} [${grName}]`);
  renderCards(); renderGroups();
  if (state.view === 'teacher') renderTeacher();
  if (state.view === 'projects-teacher') renderCardsT();
}

function saveNote(key, val, gid, pid, i) {
  state.notes[key] = val;
  safeSaveState();
  clearTimeout(saveNote._t);
  saveNote._t = setTimeout(() => {
    const grName = gid ? state.groups.find(g => g.id === gid)?.name : 'geral';
    addLog(`Anotação atualizada: ${PROJECTS.find(p => p.id === pid)?.title || pid} [${grName}] etapa ${i + 1}`);
  }, 2000);
}

function closeModal(e) { if (e.target === document.getElementById('modalOverlay')) closeModalBtn(); }
function closeModalBtn() { document.getElementById('modalOverlay').classList.add('hidden'); state.curModal = null; }

// ── TEACHER PANEL ──
function renderTeacher() {
  const turmas = [6, 7, 8, 9].map(a => ({ ano: a, projs: PROJECTS.filter(p => p.ano === a) }));
  let tot = 0, ini = 0;
  PROJECTS.forEach(p => { const pct = getProgress(p.id); tot += pct; if (pct > 0) ini++; });
  document.getElementById('sumCards').innerHTML = [
    { v: PROJECTS.length, l: 'Projetos totais' }, { v: state.groups.length, l: 'Grupos cadastrados' },
    { v: ini, l: 'Em andamento' }, { v: PROJECTS.filter(p => getProgress(p.id) === 100).length, l: 'Concluídos' },
    { v: Math.round(tot / PROJECTS.length) + '%', l: 'Progresso médio' },
  ].map(s => `<div class="sum-card"><div class="sum-val">${s.v}</div><div class="sum-lbl">${s.l}</div></div>`).join('');

  document.getElementById('turmasContainer').innerHTML = turmas.map(t => {
    const avg = Math.round(t.projs.reduce((s, p) => s + getProgress(p.id), 0) / t.projs.length);
    const gy = state.groups.filter(g => g.ano === t.ano);
    return `<div class="turma-block">
      <div class="turma-header"><div class="turma-name">${t.ano}º Ano</div><div class="turma-avg">${avg}% médio</div></div>
      ${t.projs.map(p => {
      const pct = getProgress(p.id);
      const fc = pct >= 70 ? '' : pct >= 40 ? 'fw' : 'fl';
      const pg = gy.filter(g => g.projectId === p.id);
      return `<div class="project-row" onclick="openModal('${p.id}',null,true)">
          <div class="proj-name">Op. ${p.opt} · ${p.title}</div>
          <div class="proj-prog"><div class="mini-bar"><div class="mini-fill ${fc}" style="width:${pct}%"></div></div></div>
          <div class="proj-pct">${pct}%</div>
        </div>
        ${pg.length ? `<div class="group-rows">${pg.map(gr => {
        const gp = getProgress(gr.projectId, gr.id);
        const gf = gp >= 70 ? '' : gp >= 40 ? 'fw' : 'fl';
        return `<div class="group-sub-row" onclick="openModal('${gr.projectId}','${gr.id}',true);event.stopPropagation()">
            <div class="gsub-name">${gr.name}</div>
            <div class="gsub-members">${gr.members.filter(Boolean).join(' · ')}</div>
            <div style="flex:1;min-width:60px"><div class="mini-bar"><div class="mini-fill ${gf}" style="width:${gp}%"></div></div></div>
            <div class="gsub-pct">${gp}%</div>
          </div>`;
      }).join('')}</div>` : ''}`
    }).join('')}
    </div>`;
  }).join('');
}

// ── PROJECTS DATA ──
const PROJECTS = [
  {
    id: '6A1', ano: 6, sem: 1, opt: 'A', title: 'Feira do Centavo Consciente', desc: 'Criem uma mini-empresa real: escolhem produto, calculam custos, definem preço, produzem e vendem na Feira.', duracao: '4 semanas', equipe: '3-4 alunos', formato: 'Stand na Feira + painel DRE', etapas: [
      { label: 'Escolha do Produto e Pesquisa de Mercado', semana: 'Semana 1', tasks: ['Listar 5 ideias de produto', 'Aplicar questionário com 20 pessoas', 'Tabular resultados e escolher produto', 'Definir nome da mini-empresa e slogan'] },
      { label: 'Planejamento Financeiro', semana: 'Semana 2', tasks: ['Listar todos os custos', 'Calcular custo unitário', 'Definir preço de venda (custo + 50-100%)', 'Preencher DRE projetado', 'Definir meta de vendas'] },
      { label: 'Produção e Marketing', semana: 'Semana 3', tasks: ['Produzir lote-teste (5 unidades)', 'Ajustar receita/processo', 'Produzir lote final', 'Criar cartaz do stand', 'Preparar sistema de troco'] },
      { label: 'Feira + DRE Final', semana: 'Semana 4', tasks: ['Montar stand', 'Registrar cada venda', 'Somar receita e subtrair custos', 'Preencher DRE final', 'Apresentar aprendizados'] }]
  },
  {
    id: '6B1', ano: 6, sem: 1, opt: 'B', title: 'Detetives Financeiros de Limoeiro', desc: 'Investigam vida financeira da comunidade: entrevistas, pesquisa de preços e jornal/documentário.', duracao: '4 semanas', equipe: '3-4 alunos', formato: 'Painel jornalístico + apresentação oral', etapas: [
      { label: 'Planejamento da Investigação', semana: 'Semana 1', tasks: ['Escolher tema', 'Criar 8-10 perguntas', 'Definir quem entrevistar', 'Distribuir papéis'] },
      { label: 'Pesquisa de Campo', semana: 'Semana 2', tasks: ['Realizar entrevistas', 'Comparar preços em 3 lojas', 'Fotografar locais', 'Anotar observações'] },
      { label: 'Análise e Produção', semana: 'Semana 3', tasks: ['Tabular dados', 'Criar 2 gráficos', 'Escrever 3-4 matérias', 'Montar jornal mural'] },
      { label: 'Apresentação na Feira', semana: 'Semana 4', tasks: ['Ensaiar (2 min cada)', 'Preparar dicas financeiras', 'Montar stand', 'Interagir com visitantes'] }]
  },
  {
    id: '6C1', ano: 6, sem: 1, opt: 'C', title: 'O Jogo que Ensina a Poupar', desc: 'Criam jogo de tabuleiro original que ensine conceitos de educação financeira.', duracao: '4 semanas', equipe: '3-4 alunos', formato: 'Stand com jogo jogável', etapas: [
      { label: 'Game Design', semana: 'Semana 1', tasks: ['Jogar jogos de referência', 'Definir tipo e objetivo', 'Listar 5 conceitos financeiros', 'Rascunho do tabuleiro'] },
      { label: 'Produção das Peças', semana: 'Semana 2', tasks: ['Desenhar e colorir tabuleiro', 'Criar 20-30 cartas', 'Produzir dinheiro do jogo', 'Criar peões e manual'] },
      { label: 'Playtest e Ajustes', semana: 'Semana 3', tasks: ['Jogar 1 partida completa', 'Convidar outra equipe', 'Coletar feedback', 'Fazer ajustes'] },
      { label: 'Finalização e Feira', semana: 'Semana 4', tasks: ['Acabamento final', 'Criar cartaz', 'Preparar 2-3 cópias', 'Ensaiar explicação de 1 minuto'] }]
  },
  {
    id: '6A2', ano: 6, sem: 2, opt: 'A', title: 'Inventor da Escola', desc: 'Identificam problema real na escola e criam protótipo funcional de solução inovadora.', duracao: '4 semanas', equipe: '3-4 alunos', formato: 'Stand com protótipo + painel do processo', etapas: [
      { label: 'Caça ao Problema', semana: 'Semana 1', tasks: ['Caminhar anotando problemas', 'Entrevistar 10 pessoas', 'Listar 5 problemas', 'Escolher 1'] },
      { label: 'Chuva de Ideias + Seleção', semana: 'Semana 2', tasks: ['3 ideias por membro', 'Avaliar viabilidade e impacto', 'Selecionar ideia', 'Fazer esboço'] },
      { label: 'Construção do Protótipo', semana: 'Semana 3', tasks: ['Listar materiais', 'Construir protótipo v1', 'Testar', 'Versão melhorada'] },
      { label: 'Teste + Feira', semana: 'Semana 4', tasks: ['Testar com 5 pessoas', 'Coletar feedback', 'Criar painel do processo', 'Montar stand'] }]
  },
  {
    id: '6B2', ano: 6, sem: 2, opt: 'B', title: 'Minha Voz, Nossa Causa', desc: 'Escolhem causa social e criam campanha completa: slogan, cartaz, vídeo e ação na escola.', duracao: '4 semanas', equipe: '3-4 alunos', formato: 'Stand com campanha + vídeo + panfletos', etapas: [
      { label: 'Escolha da Causa + Pesquisa', semana: 'Semana 1', tasks: ['2 causas por membro', 'Votar', 'Pesquisar dados reais', 'Entrevistar 5 afetados'] },
      { label: 'Criação da Campanha', semana: 'Semana 2', tasks: ['Criar nome e slogan', 'Desenhar cartaz', 'Criar panfleto', 'Definir mensagem-chave'] },
      { label: 'Produção de Vídeo', semana: 'Semana 3', tasks: ['Escrever roteiro', 'Gravar cenas', 'Editar no celular', 'Ajustes finais'] },
      { label: 'Lançamento na Feira', semana: 'Semana 4', tasks: ['Montar stand', 'Imprimir panfletos', 'Definir papéis', 'Coletar assinaturas'] }]
  },
  {
    id: '6C2', ano: 6, sem: 2, opt: 'C', title: 'Talk Show Empreendedor', desc: 'Criam e gravam talk show entrevistando empreendedor real de Limoeiro.', duracao: '4 semanas', equipe: '3-4 alunos', formato: 'Stand com exibição + cenário para fotos', etapas: [
      { label: 'Pré-Produção', semana: 'Semana 1', tasks: ['Listar 5 empreendedores', 'Fazer contato', 'Pesquisar negócio', 'Criar roteiro 10-12 perguntas'] },
      { label: 'Gravação', semana: 'Semana 2', tasks: ['Montar cenário', 'Testar áudio', 'Gravar entrevista', 'Gravar abertura e encerramento'] },
      { label: 'Edição', semana: 'Semana 3', tasks: ['Selecionar melhores trechos', 'Montar sequência', 'Adicionar música e títulos', 'Exportar versão final'] },
      { label: 'Exibição na Feira', semana: 'Semana 4', tasks: ['Criar cartaz', 'Montar exibição em loop', 'Preparar apresentação', 'Convidar empreendedor'] }]
  },
  {
    id: '7A1', ano: 7, sem: 1, opt: 'A', title: 'Consultoria Financeira Mirim', desc: 'Atuam como consultores: analisam finanças de comerciante e entregam plano profissional.', duracao: '5 semanas', equipe: '3-4 alunos', formato: 'Stand profissional + entrega simbólica', etapas: [
      { label: 'Formação da Consultoria', semana: 'Semana 1', tasks: ['Criar nome e logo', 'Estudar diagnóstico financeiro', 'Definir papéis', 'Preparar formulário'] },
      { label: 'Diagnóstico de Campo', semana: 'Semana 2', tasks: ['Entrevistar comerciante', 'Fotografar', 'Preencher formulário', 'Coletar dados financeiros'] },
      { label: 'Análise e Plano', semana: 'Semanas 3-4', tasks: ['Organizar em planilha', 'Calcular DRE', 'Identificar oportunidades', 'Redigir plano financeiro'] },
      { label: 'Apresentação na Feira', semana: 'Semana 5', tasks: ['Montar stand', 'Imprimir plano em envelope', 'Ensaiar', 'Convidar comerciante'] }]
  },
  {
    id: '7B1', ano: 7, sem: 1, opt: 'B', title: 'Mapa Empreendedor de Limoeiro', desc: 'Mapeamento de negócios de um bairro: tipos, oportunidades e perfil.', duracao: '4 semanas', equipe: '3-4 alunos', formato: 'Stand com mapa ilustrado + relatório', etapas: [
      { label: 'Planejamento do Mapeamento', semana: 'Semana 1', tasks: ['Definir área', 'Criar categorias', 'Preparar ficha de coleta'] },
      { label: 'Coleta de Campo', semana: 'Semana 2', tasks: ['Percorrer ruas', 'Preencher ficha', 'Fotografar fachadas', 'Anotar terrenos vazios'] },
      { label: 'Análise + Mapa', semana: 'Semana 3', tasks: ['Tabular dados', 'Desenhar mapa ilustrado', 'Calcular por categoria', 'Listar oportunidades'] },
      { label: 'Feira', semana: 'Semana 4', tasks: ['Montar stand com mapa', 'Criar mini-relatório', 'Apresentar'] }]
  },
  {
    id: '7C1', ano: 7, sem: 1, opt: 'C', title: 'Shark Tank CSM', desc: 'Criam negócio completo e apresentam em formato Shark Tank para banca de investidores.', duracao: '4 semanas', equipe: '3-4 alunos', formato: 'Pitch 5 min para banca + stand', etapas: [
      { label: 'Ideação + Canvas', semana: 'Semana 1', tasks: ['Brainstorming: 10 ideias', 'Selecionar a melhor', 'Preencher Canvas', 'Definir nome, logo, slogan'] },
      { label: 'Finanças + Marketing', semana: 'Semana 2', tasks: ['Calcular custos e preço', 'Projetar DRE 3 meses', 'Estratégia de marketing', 'Material visual'] },
      { label: 'Protótipo + Pitch', semana: 'Semana 3', tasks: ['Construir protótipo', 'Montar slides (máx 8)', 'Ensaiar pitch', 'Preparar respostas'] },
      { label: 'Shark Tank + Feira', semana: 'Semana 4', tasks: ['Pitch 5 min + 3 min perguntas', 'Montar stand', 'Interagir', 'Coletar feedback'] }]
  },
  {
    id: '7A2', ano: 7, sem: 2, opt: 'A', title: 'Hackathon da Comunidade', desc: 'Sprint de Design Thinking para resolver problema real da comunidade.', duracao: '4 semanas', equipe: '3-4 alunos', formato: 'Stand com painel DT + protótipo', etapas: [
      { label: 'Empatia + Definição', semana: 'Semana 1', tasks: ['10 entrevistas de empatia', 'Mapa de Empatia', 'Definir problema (HMW)', 'Validar com 5 pessoas'] },
      { label: 'Ideação', semana: 'Semana 2', tasks: ['Brainstorming livre', 'SCAMPER', 'Dot-voting', 'Detalhar ideia'] },
      { label: 'Prototipagem + Teste', semana: 'Semana 3', tasks: ['Construir protótipo', 'Testar com 5', 'Coletar feedback', 'Iterar'] },
      { label: 'Feira', semana: 'Semana 4', tasks: ['Painel DT', 'Exibir protótipo', 'Vídeo dos testes', 'Explicar aprendizados'] }]
  },
  {
    id: '7B2', ano: 7, sem: 2, opt: 'B', title: 'Agência de Comunicação CSM', desc: 'Atuam como agência: atendem comerciante criando marca, posts e estratégia digital.', duracao: '4 semanas', equipe: '3-4 alunos', formato: 'Stand com portfólio + depoimento', etapas: [
      { label: 'Briefing do Cliente', semana: 'Semana 1', tasks: ['Visitar e entrevistar', 'Preencher briefing', 'Fotografar', 'Analisar presença digital'] },
      { label: 'Criação de Marca', semana: 'Semana 2', tasks: ['3 propostas de logo', 'Apresentar ao cliente', 'Definir paleta', 'Criar template'] },
      { label: 'Produção de Conteúdo', semana: 'Semana 3', tasks: ['Calendário semanal', '5-8 artes no Canva', 'Escrever legendas', '1 Reels'] },
      { label: 'Entrega + Feira', semana: 'Semana 4', tasks: ['Compilar portfólio', 'Entregar ao cliente', 'Stand antes/depois', 'Mostrar métricas'] }]
  },
  {
    id: '7C2', ano: 7, sem: 2, opt: 'C', title: 'TEDx CSM', desc: 'Cada aluno prepara palestra de 5 minutos no formato TED Talk, gravada profissionalmente.', duracao: '4 semanas', equipe: '4 alunos', formato: 'Exibição na Feira + stand com QR code', etapas: [
      { label: 'Escolha do Tema + Roteiro', semana: 'Semana 1', tasks: ['Escolher tema individual', 'Escrever roteiro (~700 palavras)', 'Feedback cruzado'] },
      { label: 'Ensaio', semana: 'Semana 2', tasks: ['Ensaiar 3+ vezes de pé', 'Gravar e assistir', 'Receber feedback', 'Ajustar'] },
      { label: 'Gravação', semana: 'Semana 3', tasks: ['Montar cenário tipo TED', 'Gravar (máx 2 takes)', 'Editar e finalizar'] },
      { label: 'Exibição na Feira', semana: 'Semana 4', tasks: ['Criar playlist', 'Montar espaço', 'Gerar QR code', 'Apresentar ao vivo'] }]
  },
  {
    id: '8A1', ano: 8, sem: 1, opt: 'A', title: 'Startup Weekend Escolar', desc: 'Em 5 semanas criam startup real: validação, MVP digital, lançamento e métricas.', duracao: '5 semanas', equipe: '3-4 alunos', formato: 'MVP + painel de métricas + pitch 3 min', etapas: [
      { label: 'Validação do Problema', semana: 'Semana 1', tasks: ['Brainstorming de problemas', 'Entrevistar 15 pessoas', 'Criar persona', 'Calcular validação'] },
      { label: 'MVP: Landing Page', semana: 'Semanas 2-3', tasks: ['Escrever texto da página', 'Criar (Carrd/Google Sites)', 'Configurar coleta de emails', 'Divulgar'] },
      { label: 'Métricas e Análise', semana: 'Semana 4', tasks: ['Coletar dados', 'Calcular conversão', 'Criar dashboard', 'Decidir: pivotar?'] },
      { label: 'Feira', semana: 'Semana 5', tasks: ['Pitch com dados reais', 'Stand com MVP', 'Demonstrar ao vivo'] }]
  },
  {
    id: '8B1', ano: 8, sem: 1, opt: 'B', title: 'Fintech da Escola', desc: 'Projetam app financeiro para jovens: wireframes, protótipo clicável e teste de usabilidade.', duracao: '4 semanas', equipe: '3-4 alunos', formato: 'Stand com protótipo clicável + painel UX', etapas: [
      { label: 'Pesquisa + Persona', semana: 'Semana 1', tasks: ['Entrevistar 15 adolescentes', 'Criar persona', 'Definir problema', 'Benchmarking: 3 apps'] },
      { label: 'Wireframes', semana: 'Semana 2', tasks: ['Desenhar fluxo', 'Wireframes em papel', 'Testar com 3 colegas', 'Digitalizar'] },
      { label: 'Protótipo + Teste', semana: 'Semana 3', tasks: ['Criar protótipo clicável', 'Testar com 5', 'Documentar', 'Corrigir 3 maiores problemas'] },
      { label: 'Feira', semana: 'Semana 4', tasks: ['Montar stand', 'Criar painel UX', 'Visitantes testam'] }]
  },
  {
    id: '8C1', ano: 8, sem: 1, opt: 'C', title: 'Economia Circular de Limoeiro', desc: 'Identificam resíduo da comunidade e transformam em produto com valor comercial.', duracao: '4 semanas', equipe: '3-4 alunos', formato: 'Stand com produtos + painel do ciclo', etapas: [
      { label: 'Diagnóstico de Resíduos', semana: 'Semana 1', tasks: ['Observar lixeiras', 'Entrevistar 3 comerciantes', 'Listar 5 resíduos', 'Escolher 1'] },
      { label: 'Ideação do Produto', semana: 'Semana 2', tasks: ['Brainstorming: 10 ideias', 'Pesquisar referências', 'Selecionar ideia', 'Calcular custo'] },
      { label: 'Produção', semana: 'Semana 3', tasks: ['Coletar matéria-prima', 'Lote-teste', 'Avaliar e ajustar', 'Lote final + embalagem'] },
      { label: 'Feira', semana: 'Semana 4', tasks: ['Stand antes/depois', 'Vender produtos', 'DRE real', 'Painel de impacto ambiental'] }]
  },
  {
    id: '8A2', ano: 8, sem: 2, opt: 'A', title: 'Lab de Tecnologia Aplicada', desc: 'Escolhem tecnologia exponencial (IA, IoT, RA) e criam aplicação prática para Limoeiro.', duracao: '5 semanas', equipe: '3-4 alunos', formato: 'Demonstração funcional + painel explicativo', etapas: [
      { label: 'Escolha da Tecnologia', semana: 'Semana 1', tasks: ['Pesquisa individual', 'Apresentação interna', 'Escolher tecnologia', 'Definir problema local'] },
      { label: 'Projeto Técnico', semana: 'Semana 2', tasks: ['Desenhar arquitetura', 'Listar recursos', 'Definir escopo', 'Criar cronograma'] },
      { label: 'Desenvolvimento', semana: 'Semanas 3-4', tasks: ['Desenvolver iterativamente', 'Testar diariamente', 'Documentar', 'Preparar demonstração'] },
      { label: 'Feira', semana: 'Semana 5', tasks: ['Demonstração interativa', 'Painel explicativo', 'Preparar para leigos', 'Documentar reações'] }]
  },
  {
    id: '8B2', ano: 8, sem: 2, opt: 'B', title: 'Redesign de Experiência', desc: 'Escolhem serviço escolar e fazem redesign completo da experiência do usuário com UX.', duracao: '4 semanas', equipe: '3-4 alunos', formato: 'Painel antes/depois + protótipo + vídeo', etapas: [
      { label: 'Pesquisa UX', semana: 'Semana 1', tasks: ['Observação silenciosa', 'Entrevistar 10 usuários', 'Mapear jornada', 'Criar persona'] },
      { label: 'Ideação + Wireframe', semana: 'Semana 2', tasks: ['Brainstorming de melhorias', 'Matriz impacto vs esforço', 'Criar wireframes', 'Validar com 3'] },
      { label: 'Protótipo + Teste', semana: 'Semana 3', tasks: ['Criar protótipo', 'Testar com 5', 'Documentar', 'Iterar'] },
      { label: 'Feira', semana: 'Semana 4', tasks: ['Painel antes/depois', 'Demonstração', 'Vídeo dos testes', 'Relatório ao responsável'] }]
  },
  {
    id: '8C2', ano: 8, sem: 2, opt: 'C', title: 'Podcast Inovação & Futuro', desc: 'Produzem 3 episódios de podcast sobre tecnologias exponenciais e Limoeiro.', duracao: '4 semanas', equipe: '3-4 alunos', formato: 'Stand com QR code + estúdio montado', etapas: [
      { label: 'Pauta + Roteiro', semana: 'Semana 1', tasks: ['Escolher 3 temas', 'Pesquisar', 'Escrever roteiros', 'Identificar entrevistados'] },
      { label: 'Gravação Ep. 1 e 2', semana: 'Semana 2', tasks: ['Preparar ambiente', 'Gravar ep. 1', 'Gravar ep. 2', 'Gravar entrevistas'] },
      { label: 'Ep. 3 + Edição', semana: 'Semana 3', tasks: ['Gravar ep. 3', 'Editar os 3', 'Criar capa', 'Publicar'] },
      { label: 'Feira', semana: 'Semana 4', tasks: ['Montar mini-estúdio', 'QR code', 'Exibir trechos', 'Ep. bônus ao vivo'] }]
  },
  {
    id: '9A1', ano: 9, sem: 1, opt: 'A', title: 'Startup Real: Do Problema ao 1º Cliente', desc: 'Criam startup real, validam problema, constroem MVP e realizam pelo menos 1 transação real.', duracao: '6 semanas', equipe: '3-4 alunos', formato: 'MVP + métricas reais + pitch 5 min', etapas: [
      { label: 'Discovery', semana: 'Semanas 1-2', tasks: ['Entrevistar 20+ clientes', 'Criar persona', 'Mapear concorrentes', 'Validar disposição a pagar'] },
      { label: 'MVP + Lançamento', semana: 'Semanas 3-4', tasks: ['Definir MVP mínimo', 'Construir em 2 semanas', 'Lançar e divulgar', '1 transação real'] },
      { label: 'Métricas + Iteração', semana: 'Semana 5', tasks: ['Compilar métricas', 'Calcular CAC, conversão, NPS', 'Dashboard financeiro', 'Pivotar ou perseverar?'] },
      { label: 'Demo Day na Feira', semana: 'Semana 6', tasks: ['Pitch Deck com dados reais', 'Ensaiar 5+ vezes', 'Stand profissional', 'Pitch para banca'] }]
  },
  {
    id: '9B1', ano: 9, sem: 1, opt: 'B', title: 'Fundo de Investimento Estudantil', desc: 'Simulam fundo com R$100K fictícios. Decisões semanais baseadas em cenários econômicos reais.', duracao: '5 semanas', equipe: '3-4 alunos', formato: 'Dashboard + timeline de decisões + pitch', etapas: [
      { label: 'Tese de Investimento', semana: 'Semana 1', tasks: ['Estudar tipos de ativos', 'Definir tese', 'Criar regras do fundo', 'Alocação inicial R$100K'] },
      { label: 'Operações Semanais', semana: 'Semanas 2-4', tasks: ['Analisar notícias', 'Decidir comprar/vender', 'Registrar com justificativa', 'Calcular saldo'] },
      { label: 'Relatório Final', semana: 'Semana 4', tasks: ['Calcular retorno total', '3 melhores e 3 piores', 'Gráfico de evolução', 'Escrever relatório'] },
      { label: 'Feira', semana: 'Semana 5', tasks: ['Dashboard visual', 'Timeline de decisões', 'Pitch: tese → resultados', 'Comparar com Ibovespa'] }]
  },
  {
    id: '9C1', ano: 9, sem: 1, opt: 'C', title: 'Incubadora Social', desc: 'Criam startup que gera lucro e impacto social simultaneamente.', duracao: '5 semanas', equipe: '3-4 alunos', formato: 'Teoria da Mudança + MVP + métricas duplas', etapas: [
      { label: 'Problema Social + Modelo', semana: 'Semanas 1-2', tasks: ['Mapear problemas sociais', 'Entrevistar 15+ afetados', 'Criar Teoria da Mudança', 'Modelo de negócio'] },
      { label: 'MVP de Impacto', semana: 'Semanas 3-4', tasks: ['Construir MVP', 'Lançar e medir', 'Coletar depoimentos', 'Antes vs depois'] },
      { label: 'Métricas Duplas', semana: 'Semana 4', tasks: ['DRE do negócio', 'Métricas sociais', 'Custo por pessoa', 'Dashboard duplo'] },
      { label: 'Feira', semana: 'Semana 5', tasks: ['Painel Teoria da Mudança', 'Depoimentos', 'Dashboard duplo', 'Pitch de impacto'] }]
  },
  {
    id: '9A2', ano: 9, sem: 2, opt: 'A', title: 'Demo Day — O Grande Pitch', desc: 'Pitch profissional de 5 minutos para banca de empreendedores reais.', duracao: '5 semanas', equipe: '3-4 alunos', formato: 'Pitch para banca + stand profissional', etapas: [
      { label: 'Refinamento da Startup', semana: 'Semanas 1-2', tasks: ['Revisar Canvas, finanças, MVP', 'Atualizar métricas', 'Refinar proposta de valor', 'Material visual profissional'] },
      { label: 'Pitch Deck Profissional', semana: 'Semana 3', tasks: ['Criar 12 slides', 'Design limpo', 'Ensaiar cronometrado (5 min)', '10 perguntas difíceis'] },
      { label: 'Ensaio Geral', semana: 'Semana 4', tasks: ['Pitch para a turma', 'Feedback 360', 'Ajustar slides e falas', '3+ ensaios finais'] },
      { label: 'Demo Day + Feira', semana: 'Semana 5', tasks: ['Pitch 5 min + 5 min perguntas', 'Stand profissional', 'Interagir', 'Coletar contatos'] }]
  },
  {
    id: '9B2', ano: 9, sem: 2, opt: 'B', title: 'Limoeiro 2040', desc: 'Documentário + plano estratégico: como Limoeiro pode se desenvolver nos próximos 15 anos.', duracao: '5 semanas', equipe: '3-4 alunos', formato: 'Maquete + documentário + plano impresso', etapas: [
      { label: 'Pesquisa: Limoeiro Hoje', semana: 'Semanas 1-2', tasks: ['Dados IBGE/Atlas Brasil', 'Entrevistar 5+ líderes', 'Mapear forças e fraquezas', 'Gravar entrevistas'] },
      { label: 'Visão 2040', semana: 'Semana 3', tasks: ['5 eixos estratégicos', 'Diagnóstico atual + proposta', 'Criar mapa/maquete', 'Fundamentar com tecnologias'] },
      { label: 'Documentário', semana: 'Semana 4', tasks: ['Editar com entrevistas e dados', 'Criar trilha sonora', 'Exportar versão final (10-15 min)'] },
      { label: 'Feira', semana: 'Semana 5', tasks: ['Exibição do documentário', 'Expor maquete', 'Imprimir plano estratégico', 'Convidar prefeitura'] }]
  },
  {
    id: '9C2', ano: 9, sem: 2, opt: 'C', title: 'Mentor de Futuro', desc: 'Equipes do 9º ano preparam e conduzem oficina de 1 hora para alunos do 6º ano.', duracao: '4 semanas', equipe: '4 alunos', formato: 'Oficina ao vivo + stand com material didático', etapas: [
      { label: 'Planejamento Pedagógico', semana: 'Semana 1', tasks: ['Escolher tema', 'Pesquisar como crianças aprendem', 'Criar plano de aula de 1h', 'Definir materiais'] },
      { label: 'Criação de Material', semana: 'Semana 2', tasks: ['Apresentação visual', 'Atividade prática', 'Ficha de atividade', 'Dinâmica de abertura'] },
      { label: 'Ensaio', semana: 'Semana 3', tasks: ['Ensaiar completo', 'Feedback de outro grupo', 'Ajustar tempo', 'Ensaiar novamente'] },
      { label: 'Oficina na Feira', semana: 'Semana 4', tasks: ['Conduzir oficina de 1h com 6º ano', 'Coletar feedback', 'Montar stand', 'Reflexão final'] }]
  }
];

// ── INIT ──
(async function init() {
  // 1. Sempre carrega localStorage primeiro (fonte de verdade local)
  const saved = loadSt();
  if (saved.view) state.view = saved.view;
  if (saved.filter) state.filter = saved.filter;
  if (saved.filterT) state.filterT = saved.filterT;

  // 2. Tenta carregar do Supabase e MERGE (cloud só prevalece se tiver dados)
  if (typeof cloudLoad === 'function' && isOnline()) {
    try {
      const cloudData = await cloudLoad();
      // Só usa cloud se tiver MAIS dados que localStorage
      const cloudHasData = cloudData && cloudData.groups && cloudData.groups.length > 0;
      const localHasData = saved.groups && saved.groups.length > 0;

      if (cloudHasData && (!localHasData || cloudData.groups.length >= saved.groups.length)) {
        // Cloud tem dados e localStorage não tem (ou cloud tem mais)
        state.groups = cloudData.groups;
        state.progress = cloudData.progress;
        state.notes = cloudData.notes;
        state.openEtapas = cloudData.openEtapas;
        state.teacherObs = cloudData.teacherObs;
        state.log = cloudData.log;
        gic = cloudData.gic || 1;
        console.log(`☁️ Dados carregados do Supabase: ${state.groups.length} grupos`);
      } else if (localHasData && !cloudHasData) {
        // localStorage tem dados mas cloud está vazio — PRESERVA localStorage
        console.log(`💾 localStorage tem ${saved.groups.length} grupos, cloud vazio — usando dados locais`);
      }
    } catch (err) {
      console.warn('⚠️ Falha ao carregar do Supabase, usando localStorage:', err.message);
    }
  }

  // 3. Garante que localStorage é fallback final
  if (state.groups.length === 0 && saved.groups) {
    state.groups = saved.groups || [];
    state.progress = saved.progress || {};
    state.notes = saved.notes || {};
    state.openEtapas = saved.openEtapas || {};
    state.teacherObs = saved.teacherObs || {};
    state.log = saved.log || [];
    gic = saved.gic || 1;
  }

  setView(state.view);
})();
