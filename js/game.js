/* =========================================================
   game.js — controller: JSON loading, immersive linear flow
   (title → first-person flight → scenes chain, no menu)
   ========================================================= */
const SAVE_KEY = "wc_trip_save_v2";

const UI = {
  open(id){ document.getElementById(id).classList.add('active'); },
  close(id){ document.getElementById(id).classList.remove('active'); },
  toast(m){ const t=document.getElementById('toast'); t.textContent=m; t.classList.add('show'); clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),1800); },
  _vf:null, _vfEx:null, _vm:null, excited:false,
  voiceList(gender){
    if(!('speechSynthesis' in window)) return [];
    const vs = speechSynthesis.getVoices(); if(!vs.length) return [];
    const female=[/Samantha/i,/Ava/i,/Allison/i,/Serena/i,/Zoe/i,/Karen/i,/Moira/i,/Tessa/i,/Google US English/i,/Google UK English Female/i,/Microsoft (Aria|Jenny|Michelle|Ana|Zira)/i,/female/i];
    const male  =[/Daniel/i,/Alex/i,/Fred/i,/Google UK English Male/i,/Microsoft (Guy|Davis|Tony|Christopher|Mark|David)/i,/male/i];
    const pats = gender==='male'?male:female;
    const out=[];
    for(const rx of pats){ const v=vs.find(v=>rx.test(v.name)); if(v && !out.includes(v)) out.push(v); }
    for(const rx of [/Natural/i,/en-US/i,/en-GB/i]){ const v=vs.find(v=>(rx.test(v.name)||rx.test(v.lang)) && !out.includes(v)); if(v) out.push(v); }
    const en=vs.find(v=>/^en/i.test(v.lang)); if(en && !out.includes(en)) out.push(en);
    return out.length?out:[vs[0]];
  },
  refreshVoices(){ const f=this.voiceList('female'); this._vf=f[0]||null; this._vfEx=f[1]||f[0]||null; this._vm=this.voiceList('male')[0]||null; },
  say(txt, gender){
    try{
      if(!('speechSynthesis' in window)) return;
      if(!this._vf) this.refreshVoices();
      const u = new SpeechSynthesisUtterance(txt);
      let v;
      if(gender==='male'){ v = this._vm; u.pitch = 0.85; u.rate = 0.95; }
      else if(this.excited){ v = this._vfEx; u.pitch = 1.35; u.rate = 1.05; }   // 看台:另一個較興奮的女聲
      else { v = this._vf; u.pitch = 1.05; u.rate = 0.95; }
      if(v){ u.voice = v; u.lang = v.lang; } else u.lang = "en-US";
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    }catch(e){}
  },
  genderFor(who){ return /driver|coach|officer|man\b|mr\.?/i.test(who||'') ? 'male' : 'female'; },
  // strip CJK / fullwidth chars from option labels; keep pure English
  stripZh(s){
    s = '' + s;
    s = s.split(/\s{2,}/)[0];                 // drop gloss after 2+ spaces
    const m = s.match(/[　-〿㐀-鿿＀-￯]/);
    if(m) s = s.slice(0, m.index);            // drop everything from first CJK char
    return s.replace(/[（）()]/g,' ').replace(/\s+/g,' ').trim();
  },
  shuffle(a){ const b=a.slice(); for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];} return b; }
};
// voices load async in some browsers
if('speechSynthesis' in window){ speechSynthesis.onvoiceschanged = ()=>UI.refreshVoices(); }

/* ================= Ambient audio (procedural, no external files) ================= */
const Ambient = {
  ctx:null, master:null, muted:false, nodes:[], swell:null, _buf:null,
  init(){
    if(this.ctx) return;
    const C = window.AudioContext || window.webkitAudioContext; if(!C) return;
    this.ctx = new C();
    this.master = this.ctx.createGain(); this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
  },
  resume(){ try{ if(this.ctx && this.ctx.state==='suspended') this.ctx.resume(); }catch(e){} },
  noise(){
    if(this._buf) return this._buf;
    const ctx=this.ctx, len=ctx.sampleRate*2, buf=ctx.createBuffer(1,len,ctx.sampleRate), d=buf.getChannelData(0);
    let b0=0,b1=0,b2=0;
    for(let i=0;i<len;i++){ const w=Math.random()*2-1; b0=0.99*b0+w*0.05; b1=0.96*b1+w*0.05; b2=0.90*b2+w*0.05; d[i]=(b0+b1+b2+w*0.12)*0.35; }
    return (this._buf=buf);
  },
  stopAll(){
    this.nodes.forEach(n=>{ try{ n.stop&&n.stop(); }catch(e){} try{ n.disconnect&&n.disconnect(); }catch(e){} });
    this.nodes=[]; if(this.swell){ clearInterval(this.swell); this.swell=null; }
  },
  scene(env){
    if(!this.ctx) return; this.stopAll();
    const cfg = ({
      flight:   {freq:180, q:0.5, vol:0.12},   // cabin hum
      airport:  {freq:650, q:0.8, vol:0.11},   // hall murmur
      street:   {freq:280, q:0.5, vol:0.13},   // traffic
      concourse:{freq:720, q:0.9, vol:0.15},   // busy concourse chatter
      stands:   {freq:820, q:0.9, vol:0.24},   // loud crowd
      pitch:    {freq:760, q:0.9, vol:0.22}    // stadium crowd
    })[env] || {freq:500,q:0.7,vol:0.12};
    const src=this.ctx.createBufferSource(); src.buffer=this.noise(); src.loop=true;
    const filt=this.ctx.createBiquadFilter(); filt.type='bandpass'; filt.frequency.value=cfg.freq; filt.Q.value=cfg.q;
    const g=this.ctx.createGain(); g.gain.value=cfg.vol;
    // gentle low rumble under stadium scenes
    src.connect(filt); filt.connect(g); g.connect(this.master); src.start();
    this.nodes.push(src,filt,g);
    if(env==='stands' || env==='pitch'){
      this.swell=setInterval(()=>{ if(Math.random()<0.45) this.cheer(0.6); }, 7000);
    }
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(this.muted?0:1, this.ctx.currentTime+1.2);
  },
  cheer(strength){
    if(!this.ctx || this.muted) return; strength=strength||1;
    const t=this.ctx.currentTime;
    const src=this.ctx.createBufferSource(); src.buffer=this.noise(); src.loop=true;
    const f=this.ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=950; f.Q.value=0.6;
    const g=this.ctx.createGain(); g.gain.setValueAtTime(0.0001,t);
    g.gain.linearRampToValueAtTime(0.28*strength,t+0.35);
    g.gain.exponentialRampToValueAtTime(0.0001,t+2.4);
    src.connect(f); f.connect(g); g.connect(this.master); src.start(t); src.stop(t+2.5);
  },
  toggle(){
    this.muted=!this.muted;
    if(this.master && this.ctx) this.master.gain.linearRampToValueAtTime(this.muted?0:1, this.ctx.currentTime+0.3);
    return this.muted;
  }
};

const Game = {
  cfg:null, scenes:[], save:null, cur:null, fpv:null, showTransl:false,

  async init(){
    this.load();
    // 1) try loading from JSON files (works when served over http/https)
    try{
      this.cfg = await (await fetch('data/config.json')).json();
      this.scenes = await Promise.all(this.cfg.scenes.map(p=>fetch(p).then(r=>{ if(!r.ok) throw new Error(p); return r.json(); })));
    }catch(e){
      // 2) fallback to the embedded bundle so it also runs by double-click (file://)
      if(window.WC_BUNDLE){
        this.cfg = window.WC_BUNDLE.config;
        this.scenes = window.WC_BUNDLE.scenes;
      }else{
        document.getElementById('boot').innerHTML =
          `<div class="plane">🛫</div>
           <div class="err"><b>無法載入場景資料 (${e.message||'fetch error'})</b><br><br>
           找不到內嵌備援 js/data.js。請在資料夾內開本機伺服器再開啟:<br><br>
           <code style="background:#0b1220;padding:6px 10px;border-radius:8px;display:inline-block">python3 -m http.server 8000</code><br><br>
           然後瀏覽器打開 <b>http://localhost:8000</b></div>`;
        return;
      }
    }
    document.getElementById('boot').style.display='none';
    this.buildTitle();
  },

  load(){
    try{ this.save = JSON.parse(localStorage.getItem(SAVE_KEY)); }catch(e){}
    if(!this.save || !this.save.done){ this.save = { done:[false,false,false,false,false], score:0, idx:0 }; }
  },
  persist(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(this.save)); }catch(e){} },
  resetSave(){ if(!confirm("清除所有旅程進度?")) return; this.save={done:[false,false,false,false,false],score:0,idx:0}; this.persist(); this.buildTitle(); UI.toast("已清除"); },

  buildTitle(){
    const done = this.save.done.filter(Boolean).length;
    const cont = document.getElementById('continueBtn');
    if(done>0 && done<this.scenes.length){ cont.style.display='inline-block'; cont.textContent=`↩ 繼續旅程 (第 ${done+1} 站)`; }
    else cont.style.display='none';
    this.showScreen('title');
  },
  showScreen(id){ document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active')); document.getElementById(id).classList.add('active'); },

  ensureFPV(){ if(!this.fpv) this.fpv = new FPV(document.getElementById('fpv')); return this.fpv; },

  /* ---------- fade / cinematic ---------- */
  fade(on){ document.getElementById('fade').classList.toggle('show', on); },
  cine(big, small){ const c=document.getElementById('cine'); if(!big){ c.innerHTML=''; return; } c.innerHTML=`<div class="big">${big}</div>${small?`<div class="small">${small}</div>`:''}`; },
  wait(ms){ return new Promise(r=>setTimeout(r,ms)); },

  /* ---------- start / flight intro ---------- */
  async startTrip(fromIdx){
    this.showScreen('scene');
    const p=document.getElementById('panel'); p.innerHTML='';
    // blackout INSTANTLY (no 0.8s ramp) so a half-built scene can't peek through
    const f=document.getElementById('fade');
    f.style.transition='none'; this.fade(true); void f.offsetWidth; f.style.transition='';
    await this.wait(50);
    this.ensureFPV();
    Ambient.init(); Ambient.resume();   // audio unlocked by this click gesture
    const start = (typeof fromIdx==='number') ? fromIdx : 0;

    if(start===0){
      this.fpv.setEnv('flight'); Ambient.scene('flight');
      // stay black until the cabin is truly ready: enough painted frames AND a safe minimum
      // (covers first-time WebGL/shader compile which can lag the frame counter)
      this.cine('⏳ Boarding… 登機中','正在載入機艙 · preparing cabin');
      await Promise.all([ this.fpv.whenRendered(25), this.wait(2200) ]);
      this.cine(''); this.fade(false); await this.wait(200);
      const seq=[
        ["✈️ Taipei → 2026 World Cup","繫好安全帶,旅程開始 · Fasten your seatbelt"],
        ["Cabin crew, prepare for take-off","🖱️ 拖曳畫面看看窗外的雲"],
        ["8 hours later…","八小時後,即將降落"],
        ["Welcome to the host city!","歡迎抵達世界盃主辦城市"]
      ];
      for(const [b,s] of seq){ this.cine(b,s); await this.wait(2600); }
      this.cine('');
      await this.transitionTo(0);
    } else {
      await this.transitionTo(start);
    }
  },

  async transitionTo(i){
    const f=document.getElementById('fade');
    f.style.transition='none'; this.fade(true); void f.offsetWidth; f.style.transition='';
    await this.wait(650);
    const S=this.scenes[i]; this.cur={ S, beat:0, score:0 };
    document.getElementById('loc-en').textContent=S.name;
    document.getElementById('loc-zh').textContent=S.zh;
    this.fpv.setEnv(S.env); Ambient.scene(S.env);
    // keep the screen faded to black while the real 360 photo loads, then reveal
    this.cine(`⏳ Loading… ${S.name}`, `載入實景中 · ${S.zh}`);
    await Promise.race([ this.fpv.whenReady(), this.wait(9000) ]);
    await this.fpv.whenRendered(4);   // ensure the photo has actually painted before revealing
    await this.wait(150);
    this.cine(`${S.icon} ${S.name}`, S.zh);
    await this.wait(250); this.fade(false); await this.wait(1300); this.cine('');
    const lh=document.getElementById('lookhint'); lh.style.display='block'; setTimeout(()=>lh.style.display='none',2400);
    this.renderBeat();
  },

  quitTrip(){ speechSynthesis.cancel(); Ambient.stopAll(); this.buildTitle(); },
  toggleTransl(){ this.showTransl=!this.showTransl; document.querySelectorAll('.transl').forEach(e=>e.classList.toggle('show',this.showTransl)); },
  toggleSound(){ const muted=Ambient.toggle(); const b=document.getElementById('soundBtn'); if(b) b.textContent=muted?'🔇':'🔊'; },

  /* ---------- beat renderer ---------- */
  renderBeat(){
    const {S,beat}=this.cur;
    if(beat>=S.beats.length) return this.finishScene();
    const b=S.beats[beat];
    this.wrongBeat=false;
    UI.excited = (S.env==='stands');   // 看台場景用較興奮的女聲
    const gender=UI.genderFor(b.who);
    const P=document.getElementById('panel');
    const spk=(who,role,speakText)=>`<div class="speaker"><span class="who">${who}</span><span class="role">${role||''}</span>${speakText?`<button class="spk" onclick='UI.say(${JSON.stringify(speakText)},${JSON.stringify(UI.genderFor(who))})'>🔊 Listen</button>`:''}</div>`;
    const prog=`<span class="prog">${beat+1} / ${S.beats.length}</span>`;
    const tr=this.showTransl?'show':'';

    if(b.type==="say"){
      P.innerHTML=spk(b.who,b.role,b.en)+`<div class="body">
        <div class="line"><span class="en">${b.en}</span></div>
        <div class="transl ${tr}">${b.zh}</div>
        <div class="foot">${prog}<button class="next" onclick="Game.adv()">Next ▶</button></div></div>`;
      UI.say(b.en, gender);
    }
    else if(b.type==="choose"){
      this.curOpts = UI.shuffle(b.opts);
      P.innerHTML=spk(b.who,b.role,b.en)+`<div class="body">
        <div class="line"><span class="en">${b.en}</span></div>
        <div class="transl ${tr}">${b.zh}</div>
        <div class="choices" id="choices">${this.curOpts.map((o,i)=>`<button class="choice" onclick="Game.pick(${i},false)">${UI.stripZh(o.t)}</button>`).join('')}</div>
        <div class="fb" id="fb"></div><div class="foot">${prog}<span></span></div></div>`;
    }
    else if(b.type==="listen"){
      this.curOpts = UI.shuffle(b.opts);
      P.innerHTML=spk(b.who,b.role,b.en)+`<div class="body">
        <div class="line">🔊 <i>Tap Listen, then answer.</i></div>
        <div class="transl ${tr}">${b.zh}</div>
        <div style="margin:8px 0"><button class="next" onclick='UI.say(${JSON.stringify(b.en)},${JSON.stringify(gender)})'>🔊 Play again</button></div>
        <div class="line" style="font-size:15px">${b.q} <span class="hint" style="color:#93c5fd">${b.qz}</span></div>
        <div class="choices" id="choices">${this.curOpts.map((o,i)=>`<button class="choice" onclick="Game.pick(${i},true)">${UI.stripZh(o.t)}</button>`).join('')}</div>
        <div class="fb" id="fb"></div><div class="foot">${prog}<span></span></div></div>`;
      setTimeout(()=>UI.say(b.en, gender),300);
    }
    else if(b.type==="fill"){
      // board table intentionally NOT shown here — the info is already on the 3D sign in the scene,
      // so the panel stays compact and doesn't block the view.
      P.innerHTML=spk(b.who,b.role,'')+`<div class="body">
        <div class="line" style="font-size:15px">🪧 ${b.intro}</div>
        <div class="transl ${tr}">${b.introZh}</div>
        <div id="fillqs"></div><div class="fb" id="fb"></div><div class="foot">${prog}<span></span></div></div>`;
      this.fillState={i:0,ok:0}; this.renderFillQ();
    }
    else if(b.type==="cloze"){
      const txt=b.text.map(seg=>typeof seg==='string'?seg:`<span class="blank" id="bk-${seg.b}">?</span>`).join('');
      P.innerHTML=spk(b.who,b.role,'')+`<div class="body">
        <div class="line" style="font-size:15px">📖 ${b.intro}</div>
        <div class="transl ${tr}">${b.introZh}</div>
        <div class="sign" style="font-family:inherit;line-height:1.9">${txt}</div>
        <div id="fillqs"></div><div class="fb" id="fb"></div><div class="foot">${prog}<span></span></div></div>`;
      this.fillState={i:0,ok:0}; this.renderFillQ();
    }
    else if(b.type==="match"){
      const shuffled=[...b.pairs].map(p=>p.w).sort(()=>Math.random()-.5);
      P.innerHTML=spk(b.who,b.role,'')+`<div class="body">
        <div class="line" style="font-size:15px">🧲 ${b.intro}</div>
        <div class="transl ${tr}">${b.introZh}</div>
        <div class="dnd">
          <div class="pool" id="pool">${shuffled.map(w=>`<div class="word" draggable="true" data-w="${w}" onclick="UI.say('${w}')">${w}</div>`).join('')}</div>
          <div class="slots" id="slots">${b.pairs.map(p=>`<div class="slot" data-ans="${p.w}"><span class="zh">${p.zh}</span><span class="drop"></span></div>`).join('')}</div>
        </div>
        <div class="fb" id="fb"></div><div class="foot">${prog}<span class="hint" style="color:#93c5fd">拖曳或點單字再點格子 · 點單字可聽發音</span></div></div>`;
      this.wireDnD(b);
    }
    else if(b.type==="passage"){
      P.innerHTML=spk(b.who,b.role,b.speak||'')+`<div class="body" style="padding:12px 16px">
        <div class="line" style="font-size:15px;font-weight:800;line-height:1.25">${b.title}</div>
        ${b.zh?`<div class="transl ${tr}" style="margin:2px 0 4px">${b.zh}</div>`:''}
        <div class="passgrid">
          ${b.map?`<div class="passmap">${b.map}</div>`:''}
          <div class="sign passtext">${b.html}</div>
        </div>
        ${b.vocab?`<div class="hint" style="color:#93c5fd;margin-top:6px;font-size:11.5px">📘 ${b.vocab}</div>`:''}
        <div class="foot" style="margin-top:8px">${prog}<button class="next" onclick="Game.adv()">Read done · 讀完作答 ▶</button></div></div>`;
      if(b.speak) UI.say(b.speak, 'female');
    }
    else if(b.type==="physics"){
      P.innerHTML=spk(b.who,b.role,'')+`<div class="body">
        <div class="line" style="font-size:15px">⚽ ${b.intro}</div>
        <div class="transl ${tr}">${b.introZh}</div>
        <div class="phyctrl">
          <div class="slider"><label>Aim 瞄準 (°) <b id="v-aim">-6</b></label><input id="s-aim" type="range" min="-16" max="16" value="-6"></div>
          <div class="slider"><label>Side-spin 側旋(彎) <b id="v-spin">0</b></label><input id="s-spin" type="range" min="-10" max="10" value="0"></div>
        </div>
        <div style="margin-top:10px;display:flex;gap:10px;flex-wrap:wrap;align-items:center">
          <button class="next" onclick="Game.kick()">⚽ SHOOT 射門</button>
          <button class="iconbtn" onclick="Game.fpv.resetBall()">↺ Reset</button>
          <span class="readout" id="phy-read">Add spin, then shoot. 加點旋轉再射!</span>
        </div>
        <div id="phyq" style="margin-top:8px"></div>
        <div class="fb" id="fb"></div><div class="foot">${prog}<span></span></div></div>`;
      this.fpv.setupKick();
      ['aim','spin'].forEach(k=>document.getElementById('s-'+k).oninput=e=>document.getElementById('v-'+k).textContent=e.target.value);
    }
  },

  adv(){ this.cur.beat++; this.renderBeat(); },

  pick(i, listen){
    const b=this.cur.S.beats[this.cur.beat];
    const opts=this.curOpts;
    const btns=document.querySelectorAll('#choices .choice');
    const ok=opts[i].ok;
    const fb=document.getElementById('fb');
    if(!ok){
      // wrong → let the student try again; only mark this choice, keep the rest active
      btns[i].classList.add('wrong'); btns[i].onclick=null;
      fb.className="fb show no"; fb.innerHTML="❌ "+(b.fbNo||"Try again 再試一次");
      this.wrongBeat=true; UI.toast("再試一次 Try again");
      return;
    }
    btns.forEach(x=>x.onclick=null);
    btns[i].classList.add('correct');
    fb.className="fb show ok"; fb.innerHTML="✅ "+(b.fbOk||"Correct!");
    if(!this.wrongBeat) this.cur.score++;
    if(!listen) UI.say(UI.stripZh(opts[i].t), UI.genderFor(b.who));
    this.footNext();
  },
  footNext(){
    const foot=document.querySelector('#panel .foot');
    if(foot && !foot.querySelector('.next')){ const btn=document.createElement('button'); btn.className="next"; btn.textContent="Next ▶"; btn.onclick=()=>this.adv(); foot.appendChild(btn); }
  },

  renderFillQ(){
    const b=this.cur.S.beats[this.cur.beat]; const blanks=b.blanks; const st=this.fillState;
    const host=document.getElementById('fillqs');
    if(st.i>=blanks.length){ const fb=document.getElementById('fb'); fb.className="fb show ok"; fb.textContent="✅ "+b.fb; if(st.ok===blanks.length)this.cur.score++; this.footNext(); host.innerHTML=""; return; }
    const bl=blanks[st.i];
    // shuffle options so the correct answer isn't always first; keep the answer word (no Chinese)
    this.fillView = UI.shuffle(bl.opts.map((o,idx)=>({ label:UI.stripZh(o), ans:idx===bl.ok, word:UI.stripZh(o).split(' ')[0] })));
    host.innerHTML=`<div class="line" style="font-size:15px;margin-top:8px">${UI.stripZh(bl.q)||bl.q}</div>
      <div class="choices">${this.fillView.map((o,i)=>`<button class="choice" onclick="Game.fillPick(${i})">${o.label}</button>`).join('')}</div>`;
  },
  fillPick(i){
    const bl=this.cur.S.beats[this.cur.beat].blanks[this.fillState.i];
    const v=this.fillView[i];
    const btns=document.querySelectorAll('#fillqs .choice');
    if(!v.ans){
      // wrong → must keep trying this blank
      btns[i].classList.add('wrong'); btns[i].onclick=null;
      UI.toast("❌ 再試一次 Try again"); return;
    }
    btns.forEach(x=>x.onclick=null); btns[i].classList.add('correct');
    const el=document.getElementById('bk-'+bl.n); if(el) el.textContent=v.word;
    this.fillState.ok++;
    setTimeout(()=>{ this.fillState.i++; this.renderFillQ(); }, 350);
  },

  wireDnD(b){
    let filled=0; const total=b.pairs.length;
    const words=document.querySelectorAll('#pool .word'); const slots=document.querySelectorAll('#slots .slot');
    let dragW=null;
    words.forEach(w=>{
      w.addEventListener('dragstart',()=>dragW=w);
      w.addEventListener('click',()=>{ dragW=w; w.style.outline="3px solid #22c55e"; setTimeout(()=>w.style.outline="",600); });
    });
    slots.forEach(s=>{
      s.addEventListener('dragover',e=>{e.preventDefault();s.classList.add('over');});
      s.addEventListener('dragleave',()=>s.classList.remove('over'));
      const place=()=>{
        if(!dragW||s.classList.contains('filled'))return;
        s.classList.remove('over');
        if(dragW.dataset.w===s.dataset.ans){
          s.classList.add('filled'); s.querySelector('.drop').textContent=dragW.dataset.w; dragW.classList.add('used'); UI.say(dragW.dataset.w); filled++;
          if(filled===total){ const fb=document.getElementById('fb'); fb.className="fb show ok"; fb.textContent="✅ "+b.fb; this.cur.score++; this.footNext(); }
        }else UI.toast("❌ 不是這個位置,再試試");
        dragW=null;
      };
      s.addEventListener('drop',place); s.addEventListener('click',place);
    });
  },

  kick(){
    const aim=+document.getElementById('s-aim').value, spin=+document.getElementById('s-spin').value;
    this.fpv.kick({aim,spin},(res)=>{
      const r=document.getElementById('phy-read');
      if(res.scored){ r.innerHTML="<b>✅ GOAL! 球彎繞過人牆進門!</b>"; Ambient.cheer(1.2); this.showPhyQ(); }
      else r.innerHTML="<b>❌ "+res.why+"</b> 試著加大側旋讓球更彎。";
    });
  },
  showPhyQ(){
    const b=this.cur.S.beats[this.cur.beat]; if(document.querySelector('#phyq .choice'))return;
    this.phyView = UI.shuffle(b.opts);
    document.getElementById('phyq').innerHTML=`<div class="line" style="font-size:15px">${b.q} <span class="hint" style="color:#93c5fd">${b.qz}</span></div>
      <div class="choices">${this.phyView.map((o,i)=>`<button class="choice" onclick="Game.phyAns(${i})">${UI.stripZh(o.t)}</button>`).join('')}</div>`;
  },
  phyAns(i){
    const b=this.cur.S.beats[this.cur.beat]; const opts=this.phyView; const ok=opts[i].ok;
    const btns=document.querySelectorAll('#phyq .choice');
    const fb=document.getElementById('fb');
    if(!ok){ btns[i].classList.add('wrong'); btns[i].onclick=null; fb.className="fb show no"; fb.innerHTML="❌ 再試一次 Try again"; return; }
    btns.forEach(x=>x.onclick=null); btns[i].classList.add('correct');
    fb.className="fb show ok"; fb.innerHTML="✅ "+b.fb; this.cur.score++; this.footNext();
  },

  async finishScene(){
    const id=this.cur.S.id;
    this.save.done[id]=true; this.save.score+=this.cur.score; this.save.idx=Math.max(this.save.idx,id+1); this.persist();
    const last = id+1>=this.scenes.length;
    const body=document.getElementById('stamp-body');
    body.innerHTML=`<div class="stampbig">
      <div class="stampwrap"><div class="ring"></div><div class="ring2"></div><div class="em">${this.cur.S.icon}</div></div>
      <h3 style="margin:6px 0">${this.cur.S.name} — Cleared!</h3>
      <p class="hint">護照蓋章 ✅ · 本站得分 <b style="color:#f59e0b">+${this.cur.score}</b></p>
      ${last?`<div class="pcard" style="max-width:260px;margin:12px auto"><div class="em">🏆</div><div class="nm">World Cup Trip 全程完成!</div></div>`:''}</div>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:10px">
        ${last?`<button class="btn" onclick="UI.close('ov-stamp');Game.quitTrip()">回首頁 Home</button>`
              :`<button class="btn blue" onclick="Game.nextFromStamp(${id+1})">下一站 Next ▶</button>`}
        <button class="iconbtn" onclick="Game.showPassport()">📔 護照</button>
      </div>`;
    UI.open('ov-stamp');
    if(last) UI.toast("🏆 英文闖關成功!");
  },
  nextFromStamp(i){ UI.close('ov-stamp'); this.transitionTo(i); },

  showPassport(){
    const stamps=this.cfg.stamps;
    document.getElementById('pass-body').innerHTML=`<p class="hint">每通過一站蓋一個章。Collect all ${stamps.length} stamps!</p>
      <div class="passport">${stamps.map((s,i)=>this.save.done[i]
        ?`<div class="pcard"><div class="em">${s.split(' ')[0]}</div><div class="nm">${s.slice(2)}</div></div>`
        :`<div class="pcard empty"><div class="em">🔒</div><div class="nm">未蓋章</div></div>`).join('')}</div>`;
    UI.open('ov-pass');
  }
};

window.addEventListener('load', ()=>Game.init());
