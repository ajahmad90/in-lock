const $ = (s) => document.querySelector(s), $$ = (s) => [...document.querySelectorAll(s)];
const titles = {vault:['Vault home','Your private media, one calm place.'],media:['Private media','Preview local video and image files.'],audio:['Audio player','Listen with simple, focused controls.'],photo:['Photo editor','Make a copy; keep the original untouched.'],video:['Video editor','Mark a segment and keep your source safe.'],settings:['Settings','Appearance, accessibility and security boundaries.']};
let currentUrl = null, photoImage = null, repeat = false;
function toast(text){const el=$('#toast'); el.textContent=text; el.classList.add('show'); clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>el.classList.remove('show'),2600)}
function openView(id){ $$('.view').forEach(v=>v.classList.toggle('active',v.id===id)); $$('.nav button').forEach(b=>b.classList.toggle('active',b.dataset.view===id)); $('#pageTitle').textContent=titles[id][0]; $('#pageSubtitle').textContent=titles[id][1]; $('#sidebar').classList.remove('open'); }
$$('.nav button,.feature').forEach(el=>el.addEventListener('click',()=>openView(el.dataset.view||el.dataset.open)));
$('#menuBtn').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
function unlock(){ $('#lockScreen').style.display='none'; $('#app').hidden=false; toast('Workspace unlocked for this session') }
$('#unlockBtn').addEventListener('click',unlock); $('#bioBtn').addEventListener('click',()=>{toast('Biometric verification is a browser/native integration point.');unlock()});
function lock(){ $('#app').hidden=true; $('#lockScreen').style.display='grid'; toast('Workspace locked') } $('#lockBtn').addEventListener('click',lock);
function setTheme(light){ document.documentElement.classList.toggle('light',light); $('#themeSwitch').classList.toggle('on',!light); localStorage.setItem('inlock-theme',light?'light':'dark') }
$('#themeBtn').addEventListener('click',()=>setTheme(!document.documentElement.classList.contains('light'))); $('#themeSwitch').addEventListener('click',()=>setTheme(!document.documentElement.classList.contains('light'))); setTheme(localStorage.getItem('inlock-theme')==='light');
$('#contrastRange').addEventListener('input',e=>{document.documentElement.style.setProperty('--contrast',e.target.value/100); $('#contrastLabel').textContent=e.target.value+'%'});
$$('[data-picker]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.picker).click())); $$('[data-toast]').forEach(b=>b.addEventListener('click',()=>toast(b.dataset.toast)));
function fileUrl(file){ if(currentUrl) URL.revokeObjectURL(currentUrl); currentUrl=URL.createObjectURL(file); return currentUrl }
$('#mediaFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;$('#mediaName').textContent=f.name;const url=fileUrl(f);const img=$('#imagePreview'),vid=$('#mediaVideo');if(f.type.startsWith('image/')){vid.hidden=true;img.hidden=false;img.src=url;img.style.width='100%';img.style.borderRadius='14px';}else{img.hidden=true;vid.hidden=false;vid.src=url;vid.load();}toast('Media ready for local preview')});
$('#audioFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;$('#audioName').textContent=f.name;const p=$('#audioPlayer');p.hidden=false;p.src=fileUrl(f);p.load();toast('Audio loaded')});
$('#skipBack').addEventListener('click',()=>{const p=$('#audioPlayer');p.currentTime=Math.max(0,p.currentTime-10)});$('#skipForward').addEventListener('click',()=>{const p=$('#audioPlayer');p.currentTime=Math.min(p.duration||0,p.currentTime+10)});$('#repeatBtn').addEventListener('click',()=>{repeat=!repeat;$('#audioPlayer').loop=repeat;$('#repeatBtn').textContent='Repeat: '+(repeat?'on':'off')});
function drawPhoto(){if(!photoImage)return;const c=$('#photoCanvas'),ctx=c.getContext('2d'),b=+$('#brightness').value/100,co=+$('#photoContrast').value/100,rot=+$('#rotate').value*Math.PI/180;const scale=Math.min(760/photoImage.width,460/photoImage.height,1);c.width=Math.max(1,photoImage.width*scale);c.height=Math.max(1,photoImage.height*scale);if(Math.abs(+$('#rotate').value)%180>1){[c.width,c.height]=[c.height,c.width]}ctx.save();ctx.translate(c.width/2,c.height/2);ctx.rotate(rot);ctx.filter=`brightness(${b}) contrast(${co})`;const w=photoImage.width*scale,h=photoImage.height*scale;ctx.drawImage(photoImage,-w/2,-h/2,w,h);ctx.restore();$$('.adjust output').forEach((o,i)=>o.textContent=[$('#brightness').value+'%',$('#photoContrast').value+'%',$('#rotate').value+'°'][i]||o.textContent)}
$('#photoFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const img=new Image();img.onload=()=>{photoImage=img;$('#photoEmpty').hidden=true;drawPhoto();toast('Photo loaded for editing')};img.src=fileUrl(f)}); ['brightness','photoContrast','rotate'].forEach(id=>$('#'+id).addEventListener('input',drawPhoto)); $('#resetPhoto').addEventListener('click',()=>{$('#brightness').value=100;$('#photoContrast').value=100;$('#rotate').value=0;drawPhoto()});$('#savePhoto').addEventListener('click',()=>{if(!photoImage)return toast('Choose a photo first');const a=document.createElement('a');a.download='in-lock-edited-copy.png';a.href=$('#photoCanvas').toDataURL('image/png');a.click();toast('Edited copy exported')});
$('#videoFile').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;$('#videoName').textContent=f.name;const v=$('#videoEditor');v.hidden=false;v.src=fileUrl(f);v.load();v.onloadedmetadata=()=>toast('Video loaded — mark your segment')});
$('#muteVideo').addEventListener('click',()=>{$('#videoEditor').muted=!$('#videoEditor').muted;$('#muteVideo').textContent=$('#videoEditor').muted?'Unmute audio':'Mute audio'});['videoStart','videoEnd'].forEach(id=>$('#'+id).addEventListener('input',e=>e.target.nextElementSibling.textContent=e.target.value+'%'));
$('#playSegment').addEventListener('click',()=>{const v=$('#videoEditor');if(!v.duration)return toast('Choose a video first');const start=+$('#videoStart').value/100*v.duration,end=+$('#videoEnd').value/100*v.duration;if(start>=end)return toast('End marker must be after start');v.currentTime=start;v.play();clearTimeout(window.segmentTimer);window.segmentTimer=setInterval(()=>{if(v.currentTime>=end){v.pause();clearInterval(window.segmentTimer)}},100)});
$('#exportVideo').addEventListener('click',()=>{const v=$('#videoEditor');if(!v.src)return toast('Choose a video first');const a=document.createElement('a');a.href=v.src;a.download='in-lock-video-copy';a.click();toast('Original-format copy exported (not encrypted)')});

/* =======================================================================
   Added: Sign up / Sign in (email + password)
   ------------------------------------------------------------------------
   This is a static front-end site with no server. Accounts are kept in
   this browser's localStorage and passwords are only SHA-256 hashed
   client-side (falling back to a simple non-cryptographic hash if the
   page isn't served from a secure context, e.g. plain file://). That is
   NOT real security — it only keeps the demo honest and usable. A real
   deployment needs a proper backend for authentication and storage.
   ======================================================================= */
const USERS_KEY = 'inlock_users', SESSION_KEY = 'inlock_session';
function loadUsers(){ try{ return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }catch(e){ return {}; } }
function saveUsers(users){ localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function getSession(){ return localStorage.getItem(SESSION_KEY); }
function setSession(email){ localStorage.setItem(SESSION_KEY, email); }
function clearSession(){ localStorage.removeItem(SESSION_KEY); }
function isValidEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

async function hashPassword(pw){
  try{
    if (window.crypto && crypto.subtle && crypto.subtle.digest){
      const bytes = new TextEncoder().encode(pw);
      const buf = await crypto.subtle.digest('SHA-256', bytes);
      return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
    }
  }catch(e){ /* fall through to the non-secure fallback below */ }
  let h = 0;
  for (let i=0;i<pw.length;i++){ h = (Math.imul(31,h) + pw.charCodeAt(i)) | 0; }
  return 'fallback_' + Math.abs(h).toString(16);
}

function showPanel(which){
  $('#authSignIn').classList.toggle('active', which==='signin');
  $('#authSignUp').classList.toggle('active', which==='signup');
  $('#tabSignIn').classList.toggle('active', which==='signin');
  $('#tabSignUp').classList.toggle('active', which==='signup');
}
$$('.auth-tab').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.panel)));
$$('[data-auth-switch]').forEach(b=>b.addEventListener('click',()=>showPanel(b.dataset.authSwitch)));

function updateAccountUI(){
  const box = $('#accountEmail');
  if (box) box.textContent = getSession() || '—';
}

function enterApp(){
  $('#authScreen').style.display = 'none';
  $('#lockScreen').style.display = 'none';
  $('#app').hidden = false;
  updateAccountUI();
}

function goToAuth(defaultPanel){
  $('#app').hidden = true;
  $('#lockScreen').style.display = 'none';
  $('#authScreen').style.display = 'grid';
  showPanel(defaultPanel || 'signin');
}

function signOut(){
  clearSession();
  goToAuth('signin');
  $('#siEmail').value = ''; $('#siPassword').value = '';
  toast('Signed out');
}
$('#switchAccountBtn').addEventListener('click', signOut);
$('#signOutBtn').addEventListener('click', signOut);

async function handleSignUp(){
  const name = $('#suName').value.trim();
  const email = $('#suEmail').value.trim().toLowerCase();
  const pw = $('#suPassword').value;
  const confirm = $('#suConfirm').value;
  const err = $('#suError'); err.textContent = '';

  if (!name){ err.textContent = 'Please enter your name.'; return; }
  if (!isValidEmail(email)){ err.textContent = 'Please enter a valid email address.'; return; }
  if (pw.length < 6){ err.textContent = 'Password must be at least 6 characters.'; return; }
  if (pw !== confirm){ err.textContent = 'Passwords do not match.'; return; }

  const users = loadUsers();
  if (users[email]){ err.textContent = 'An account with this email already exists — try signing in instead.'; return; }
  users[email] = { name, passHash: await hashPassword(pw) };
  saveUsers(users);
  setSession(email);
  toast('Account created — welcome, ' + name + '!');
  enterApp();
}

async function handleSignIn(){
  const email = $('#siEmail').value.trim().toLowerCase();
  const pw = $('#siPassword').value;
  const err = $('#siError'); err.textContent = '';

  if (!isValidEmail(email)){ err.textContent = 'Please enter a valid email address.'; return; }
  const users = loadUsers();
  const user = users[email];
  if (!user){ err.textContent = 'No account found with this email — try creating one.'; return; }
  const hash = await hashPassword(pw);
  if (hash !== user.passHash){ err.textContent = 'Incorrect password.'; return; }
  setSession(email);
  toast('Welcome back, ' + user.name + '!');
  enterApp();
}

$('#authSignIn').addEventListener('submit', e=>{ e.preventDefault(); handleSignIn(); });
$('#authSignUp').addEventListener('submit', e=>{ e.preventDefault(); handleSignUp(); });
$$('.pw-toggle').forEach(b=>b.addEventListener('click', ()=>{
  const inp = document.getElementById(b.dataset.target);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  b.textContent = inp.type === 'password' ? 'Show' : 'Hide';
}));

function initAuthGate(){
  const session = getSession();
  if (session){
    const users = loadUsers();
    const user = users[session];
    $('#authScreen').style.display = 'none';
    $('#lockScreen').style.display = 'grid';
    $('#app').hidden = true;
    $('#lockWelcome').textContent = user ? ('Welcome back, ' + user.name) : 'Welcome back';
    updateAccountUI();
  } else {
    $('#lockScreen').style.display = 'none';
    $('#authScreen').style.display = 'grid';
    $('#app').hidden = true;
    showPanel(Object.keys(loadUsers()).length ? 'signin' : 'signup');
  }
}
initAuthGate();
