/* =========================================================
   engine.js — AAA-styled first-person Three.js renderer
   Sky dome · ACES tone mapping · soft shadows · env reflections
   · instanced stadium crowd · floodlights · optional Bloom
   ========================================================= */
class FPV {
  constructor(canvas){
    this.canvas = canvas;
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:"high-performance" });
    r.setPixelRatio(Math.min(devicePixelRatio, 2));
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.0;
    if ('outputEncoding' in r) r.outputEncoding = THREE.sRGBEncoding;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 600);
    this.camera.position.set(0, 1.65, 0);

    this.yaw = 0; this.pitch = 0; this.dragging = false; this.lx = 0; this.ly = 0;
    this.clock = new THREE.Clock();
    this.t = 0;
    this.dyn = new THREE.Group(); this.scene.add(this.dyn);   // per-scene content
    this.anims = [];                                          // per-frame callbacks

    this.baseLights();
    this.makeEnvMap();
    this.bindLook();
    this.initComposer();
    window.addEventListener('resize', ()=>this.resize());
    this.resize();
    this.animate();
  }

  /* ---------- core ---------- */
  baseLights(){
    this.hemi = new THREE.HemisphereLight(0xffffff, 0x6a7590, 1.5);
    this.scene.add(this.hemi);
    this.amb = new THREE.AmbientLight(0xffffff, 1.1);
    this.scene.add(this.amb);
    // key light in FRONT of the player so objects facing the camera are lit (not silhouettes)
    this.sun = new THREE.DirectionalLight(0xffffff, 2.4);
    this.sun.position.set(-10, 24, 16);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(2048, 2048);
    const s = this.sun.shadow.camera; s.near = 1; s.far = 140; s.left=-45; s.right=45; s.top=45; s.bottom=-45;
    this.sun.shadow.bias = -0.0004;
    this.scene.add(this.sun);
    // second fill from the other side to kill dark faces
    this.fill = new THREE.DirectionalLight(0xdfeaff, 1.0);
    this.fill.position.set(12, 14, -6);
    this.scene.add(this.fill);
    // camera headlight — always lights whatever the player looks at
    this.head = new THREE.PointLight(0xffffff, 1.2, 80, 1.2);
    this.scene.add(this.head);
  }
  makeEnvMap(){
    // subtle procedural environment for PBR reflections
    try{
      const pmrem = new THREE.PMREMGenerator(this.renderer);
      const envScene = new THREE.Scene();
      const geo = new THREE.SphereGeometry(50, 24, 16);
      const mat = new THREE.ShaderMaterial({
        side: THREE.BackSide,
        uniforms:{ top:{value:new THREE.Color(0x87c1ff)}, bot:{value:new THREE.Color(0x14203a)} },
        vertexShader:`varying vec3 vp; void main(){ vp=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader:`varying vec3 vp; uniform vec3 top; uniform vec3 bot; void main(){ float h=clamp(vp.y*0.02+0.5,0.0,1.0); gl_FragColor=vec4(mix(bot,top,h),1.0);}`
      });
      envScene.add(new THREE.Mesh(geo, mat));
      this.envMap = pmrem.fromScene(envScene, 0.04).texture;
      this.scene.environment = this.envMap;
      pmrem.dispose();
    }catch(e){ /* reflections optional */ }
  }
  skyDome(top, bot){
    const geo = new THREE.SphereGeometry(300, 32, 20);
    const mat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite:false,
      uniforms:{ top:{value:new THREE.Color(top)}, bot:{value:new THREE.Color(bot)} },
      vertexShader:`varying vec3 vp; void main(){ vp=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`varying vec3 vp; uniform vec3 top; uniform vec3 bot; void main(){ float h=clamp(normalize(vp).y*0.5+0.5,0.0,1.0); gl_FragColor=vec4(mix(bot,top,pow(h,0.8)),1.0);}`
    });
    const m = new THREE.Mesh(geo, mat); m.frustumCulled=false; this.dyn.add(m); this._sky=m; return m;
  }
  /* real 360 CC0 photo environments (Poly Haven, 1k HDR) + image-based lighting.
     Falls back silently to the built geometry if the loader/URL/CORS fails. */
  loadPano(env){
    const B = 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/';
    const P = {
      airport:  B+'rostock_laage_airport_1k.hdr',
      street:   B+'wide_street_01_1k.hdr',
      concourse:B+'stadium_01_1k.hdr',
      stands:   B+'orlando_stadium_1k.hdr',
      pitch:    B+'stadium_01_1k.hdr'
    };
    const url = P[env];
    if(!url || !THREE.RGBELoader){ this._panoPromise = Promise.resolve(); return this._panoPromise; }
    this._panoCache = this._panoCache || {};
    const apply = (tex)=>{
      if(this.mode!==env) return;                 // player moved on while loading
      tex.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.background = tex;
      this.scene.environment = tex;               // HDR image-based lighting → realistic, never black
      if(this._sky) this._sky.visible = false;    // hide the fallback gradient dome
      // the photo is the light source now → cut synthetic fills and tame exposure so it isn't blown out
      this.amb.intensity = 0.15; this.hemi.intensity = 0.25; this.head.intensity = 0.25;
      this.renderer.toneMappingExposure = 0.62;
    };
    if(this._panoCache[env]){ apply(this._panoCache[env]); this._panoPromise = Promise.resolve(); return this._panoPromise; }
    this._panoPromise = new Promise((resolve)=>{
      try{
        const loader = new THREE.RGBELoader();
        if(loader.setCrossOrigin) loader.setCrossOrigin('anonymous');
        loader.load(url, (tex)=>{ this._panoCache[env]=tex; apply(tex); resolve(); }, undefined, ()=>resolve());
      }catch(e){ resolve(); }
    });
    return this._panoPromise;
  }
  whenReady(){ return this._panoPromise || Promise.resolve(); }
  /* resolves once the current scene has actually painted `n` frames (no black flash) */
  whenRendered(n){
    n = n || 5;
    const start = this._frames || 0;
    return new Promise((res)=>{
      const chk = ()=>{ if((this._frames||0) - start >= n) res(); else requestAnimationFrame(chk); };
      requestAnimationFrame(chk);
    });
  }
  initComposer(){
    this.usePost = false;
    try{
      if (THREE.EffectComposer && THREE.RenderPass && THREE.UnrealBloomPass){
        this.composer = new THREE.EffectComposer(this.renderer);
        this.composer.addPass(new THREE.RenderPass(this.scene, this.camera));
        const bloom = new THREE.UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.55, 0.7, 0.85);
        this.bloom = bloom; this.composer.addPass(bloom);
        this.usePost = true;
      }
    }catch(e){ this.usePost = false; }
  }
  resize(){
    const w = this.canvas.clientWidth || innerWidth, h = this.canvas.clientHeight || innerHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w/h; this.camera.updateProjectionMatrix();
    if (this.composer) this.composer.setSize(w, h);
  }
  bindLook(){
    const c = this.canvas;
    const down = (x,y)=>{ this.dragging=true; this.lx=x; this.ly=y; };
    const move = (x,y)=>{ if(!this.dragging) return; this.yaw -= (x-this.lx)*0.0032; this.pitch -= (y-this.ly)*0.0028; this.pitch=Math.max(-0.5,Math.min(0.5,this.pitch)); this.lx=x; this.ly=y; };
    const up = ()=> this.dragging=false;
    c.addEventListener('mousedown', e=>down(e.clientX,e.clientY));
    window.addEventListener('mousemove', e=>move(e.clientX,e.clientY));
    window.addEventListener('mouseup', up);
    c.addEventListener('touchstart', e=>{const t=e.touches[0];down(t.clientX,t.clientY);}, {passive:true});
    c.addEventListener('touchmove', e=>{const t=e.touches[0];move(t.clientX,t.clientY);}, {passive:true});
    c.addEventListener('touchend', up);
  }

  /* ---------- helpers ---------- */
  clearDyn(){ while(this.dyn.children.length){ const o=this.dyn.children[0]; this.dyn.remove(o); } this.anims=[]; }
  mat(color, opt={}){ return new THREE.MeshStandardMaterial(Object.assign({ color, roughness:0.8, metalness:0.05 }, opt)); }
  box(x,y,z,w,h,d,color,opt){ const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d), this.mat(color,opt)); m.position.set(x,y,z); m.castShadow=true; m.receiveShadow=true; this.dyn.add(m); return m; }
  plane(w,d,color,opt){ const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d), this.mat(color,opt)); m.rotation.x=-Math.PI/2; m.receiveShadow=true; this.dyn.add(m); return m; }
  glow(x,y,z,color,size=0.6){ const m=new THREE.Mesh(new THREE.SphereGeometry(size,16,16), new THREE.MeshBasicMaterial({color})); m.position.set(x,y,z); this.dyn.add(m); return m; }

  npc(x,z,color,skin=0xffd9b3){
    const g = new THREE.Group();
    const legMat = this.mat(0x1f2937);
    const l1 = new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.11,0.8,10), legMat); l1.position.set(-0.12,0.4,0); g.add(l1);
    const l2 = l1.clone(); l2.position.x=0.12; g.add(l2);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.26,0.32,0.9,14), this.mat(color)); torso.position.y=1.25; g.add(torso);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.8,10), this.mat(color)); arm.position.set(-0.34,1.3,0); arm.rotation.z=0.18; g.add(arm);
    const arm2 = arm.clone(); arm2.position.x=0.34; arm2.rotation.z=-0.18; g.add(arm2);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.14,8), this.mat(skin)); neck.position.y=1.78; g.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.23,20,20), this.mat(skin)); head.position.y=2.02; g.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.245,20,20,0,6.28,0,1.7), this.mat(0x2b2320)); hair.position.y=2.06; g.add(hair);
    g.traverse(o=>{ if(o.isMesh){o.castShadow=true;} });
    g.position.set(x,0,z); this.dyn.add(g);
    const base=g.position.y; const ph=Math.random()*6;
    this.anims.push(t=>{ g.position.y = base + Math.sin(t*1.6+ph)*0.03; g.rotation.y = Math.sin(t*0.6+ph)*0.06; });
    return g;
  }
  floodTower(x,z){
    this.box(x,4,z,0.3,8,0.3,0x334155,{metalness:0.4,roughness:0.5});
    const head=this.box(x,8.2,z,2.4,0.9,0.5,0x0f172a,{metalness:0.5});
    for(let i=-1;i<=1;i++)for(let j=0;j<2;j++){ this.glow(x+i*0.7, 8.2+ (j?0.22:-0.22), z+0.28, 0xfff4c2, 0.16); }
    const sp=new THREE.SpotLight(0xfff2cc, 2.2, 90, Math.PI/5, 0.4, 1.2);
    sp.position.set(x,8.2,z); sp.target.position.set(0,0,-16); this.dyn.add(sp); this.dyn.add(sp.target);
    return head;
  }

  /* ---------- environments ---------- */
  setEnv(env){
    this.mode = env; this.kickMode = false;
    this.clearDyn();
    this._sky = null; this._frames = 0;   // reset painted-frame counter for whenRendered()
    this.head.intensity = 1.2;   // restored here; loadPano lowers it when a photo applies
    this.renderer.toneMappingExposure = 1.0;   // loadPano lowers it for photo scenes
    this.scene.background = null; this.scene.environment = this.envMap || null;
    this.yaw = 0; this.pitch = -0.03;
    ({
      flight:   ()=>this.envFlight(),
      airport:  ()=>this.envAirport(),
      street:   ()=>this.envStreet(),
      concourse:()=>this.envConcourse(),
      stands:   ()=>this.envStands(),
      pitch:    ()=>this.envPitch()
    }[env] || (()=>this.envAirport()))();
    // guarantee scenes are never near-black silhouettes
    this.hemi.intensity = Math.max(this.hemi.intensity, 1.3);
    this.amb.intensity  = 1.05;
    this.loadPano(env);   // overlay a real 360 photo + IBL if available
    this.resize();
  }

  /* readable in-scene info board (departures / tickets) via canvas texture */
  signBoard(x,y,z,ry,w,h,title,rows,accent){
    accent = accent || '#fbbf24';
    const cw=1024, ch=Math.round(cw*h/w);
    const cv=document.createElement('canvas'); cv.width=cw; cv.height=ch; const g=cv.getContext('2d');
    g.fillStyle='#0a1220'; g.fillRect(0,0,cw,ch);
    g.fillStyle=accent; g.fillRect(0,0,cw,ch*0.16);
    g.fillStyle='#0a1220'; g.font='bold '+Math.round(ch*0.1)+'px Arial'; g.textBaseline='middle';
    g.fillText(title, 28, ch*0.08);
    g.font='bold '+Math.round(ch*0.085)+'px "Courier New",monospace';
    const y0=ch*0.24, dy=(ch*0.7)/rows.length;
    rows.forEach((r,i)=>{
      const yy=y0+dy*i+dy*0.5;
      g.fillStyle=accent; g.textAlign='left'; g.fillText(r[0], 34, yy);
      g.fillStyle='#e8f0ff'; g.textAlign='right'; g.fillText(r[1], cw-34, yy);
      g.strokeStyle='rgba(255,255,255,.15)'; g.beginPath(); g.moveTo(28,yy+dy*0.42); g.lineTo(cw-28,yy+dy*0.42); g.stroke();
      g.textAlign='left';
    });
    const tex=new THREE.CanvasTexture(cv); if('encoding' in tex) tex.encoding=THREE.sRGBEncoding; tex.needsUpdate=true;
    // toneMapped:false → keeps the crisp canvas colors instead of being darkened by scene exposure
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h), new THREE.MeshBasicMaterial({map:tex, toneMapped:false}));
    const nx=Math.sin(ry||0), nz=Math.cos(ry||0);            // outward normal of the board
    m.position.set(x + nx*0.16, y, z + nz*0.16);             // board sits in FRONT of its frame
    m.rotation.y=ry||0; this.dyn.add(m);
    // frame sits behind the board so it can't occlude the text
    const frame=this.box(x, y, z, w+0.25, h+0.25, 0.1, 0x111827, {metalness:0.35}); frame.rotation.y=ry||0;
    const pl=new THREE.PointLight(0xfff3cf,0.7,16); pl.position.set(x + nx*1.4, y, z + nz*1.4); this.dyn.add(pl);
    return m;
  }

  envFlight(){
    // real AIRPLANE cabin (geometry). Bright interior so it never reads as black.
    this.scene.background = new THREE.Color(0xdfe6f0);
    this.hemi.intensity=1.4;
    const wall = 0xeef2f7, trim = 0xcdd6e2, seatC = 0x24406e, seatC2 = 0x2d4f86;
    // curved ceiling (half tube overhead) + floor + side walls forming the fuselage
    const ceil = new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.5,20,28,1,true,0,Math.PI),
      this.mat(wall,{side:THREE.BackSide,roughness:0.6}));
    ceil.rotation.z=Math.PI; ceil.rotation.x=Math.PI/2; ceil.position.set(0,2.7,-6); this.dyn.add(ceil);
    this.box(0,0.05,-6,4.2,0.1,22,0xb9c2d0);                 // floor
    this.box(0,0.08,-6,0.7,0.12,22,0x2b3340);                // aisle carpet
    this.box(-2.15,1.5,-6,0.28,3,22,wall); this.box(2.15,1.5,-6,0.28,3,22,wall); // side walls
    // overhead bins both sides
    this.box(-1.6,2.5,-6,0.9,0.55,22,trim,{roughness:0.5}); this.box(1.6,2.5,-6,0.9,0.55,22,trim,{roughness:0.5});
    // oval windows with bright sky (both walls)
    for(let z=-1; z>-15; z-=2.4){
      const skyL=new THREE.Mesh(new THREE.PlaneGeometry(0.55,0.7), new THREE.MeshBasicMaterial({color:0x9fd0ff, toneMapped:false}));
      skyL.position.set(-2.0,1.75,z); skyL.rotation.y=Math.PI/2; this.dyn.add(skyL);
      const skyR=skyL.clone(); skyR.position.set(2.0,1.75,z); skyR.rotation.y=-Math.PI/2; this.dyn.add(skyR);
      this.glow(-2.0,1.75,z,0xdff0ff,0.05); this.glow(2.0,1.75,z,0xdff0ff,0.05);
    }
    // rows of seats (blue), two seats each side of the aisle, receding forward
    for(let r=0; r<6; r++){
      const z=-1.4 - r*2.2;
      [-1.5,-0.85,0.85,1.5].forEach((x,i)=>{
        this.box(x,0.95,z,0.6,1.15,0.25,(r%2? seatC:seatC2));   // seat back
        this.box(x,0.42,z+0.28,0.6,0.16,0.55,(r%2? seatC:seatC2)); // cushion
      });
    }
    // cabin lighting
    const c1=new THREE.PointLight(0xfff4e0,1.2,30); c1.position.set(0,2.6,-3); this.dyn.add(c1);
    const c2=new THREE.PointLight(0xeaf1ff,1.0,30); c2.position.set(0,2.4,-10); this.dyn.add(c2);
    // seated first-person view + gentle turbulence
    this.camera.position.set(0.0,1.55,1.2);
    this.anims.push((t)=>{ this.camera.position.y = 1.55 + Math.sin(t*2.2)*0.012; });
  }

  envAirport(){
    this.skyDome(0x9fc7ff, 0xdfeaf5);
    this.scene.background = null;
    this.hemi.intensity=0.9;
    const floor = this.plane(120,120,0xdbe3ec,{metalness:0.35,roughness:0.25,envMapIntensity:0.6}); floor.position.z=-20;
    // glass back wall + ceiling
    this.box(0,4.5,-16,60,9,0.4,0x9fb6d4,{metalness:0.4,roughness:0.2,transparent:true,opacity:0.5});
    this.box(0,9,-8,60,0.4,20,0xeef2f7); // ceiling
    for(let x=-20;x<=20;x+=8){ this.box(x,4.5,-15.6,0.4,9,0.4,0xcbd5e1,{metalness:0.5}); const pl=new THREE.PointLight(0xffffff,0.5,24); pl.position.set(x,8,-6); this.dyn.add(pl);}
    // immigration counters
    for(let x=-8;x<=8;x+=8){ this.box(x,0.55,-6,5.4,1.1,1.4,0x93a2b8,{roughness:0.5}); this.box(x,1.35,-6,5.4,0.1,1.4,0x2b3a55); }
    this.box(0,4.4,-6,3.4,1.0,0.15,0x1e3a8a); this.glow(0,4.4,-5.9,0x3b82f6,0.06);
    // big ARRIVALS board rendered IN the scene
    this.signBoard(0,6.3,-15.2,0,13,4.4,"✈ ARRIVALS",[
      ["FLIGHT","WC 2026"],["FROM","TAIPEI"],["STATUS","ARRIVED"],["GATE","B"]
    ]);
    // officer + a few travellers
    this.npc(0,-4.4,0x1e3a8a); this.npc(-6,-8,0x475569); this.npc(7,-9,0x7c3aed); this.npc(3,-11,0x0e7490);
  }

  envStreet(){
    this.skyDome(0x3f78d6, 0xbcd6ff);
    this.hemi.intensity=0.85;
    const road=this.plane(120,120,0x2d3138,{roughness:0.9}); road.position.z=-20;
    // lane markings
    for(let z=-2;z>-40;z-=4){ this.box(0,0.02,z,0.25,0.02,2,0xfef3c7); }
    // buildings both sides
    for(let i=0;i<7;i++){ const h=6+ (i*1.3)%9; this.box(-7,h/2,-4-i*6,4,h,4,i%2?0x5b6b82:0x475569,{metalness:0.2}); this.box(7,h/2,-4-i*6,4,h,4,i%2?0x415068:0x596880,{metalness:0.2});
      // lit windows
      for(let wy=1;wy<h-1;wy+=2){ this.glow(-5.1, wy, -4-i*6+1, 0xfff3c0,0.09); this.glow(5.1, wy, -4-i*6-1, 0x9fd0ff,0.09);} }
    // taxi (first-person about to ride)
    this.box(0,0.55,-3.6,2.2,0.8,4.2,0xf59e0b,{metalness:0.4,roughness:0.35});
    this.box(0,1.2,-3.6,1.9,0.7,2.4,0xffe08a,{metalness:0.3,roughness:0.2,transparent:true,opacity:0.85});
    this.box(0,1.55,-3.6,0.5,0.28,0.5,0x111827); this.glow(0,1.75,-3.6,0xfff2cc,0.12); // taxi sign
    this.glow(0.9,0.6,-1.6,0xff5555,0.12); this.glow(-0.9,0.6,-1.6,0xff5555,0.12);
    this.npc(-1.6,-4.4,0x92400e);
    // street lamps
    for(let i=0;i<4;i++){ this.box(-4.5,2.6,-6-i*8,0.14,5.2,0.14,0x334155); this.glow(-4.5,5.1,-6-i*8,0xffe6a0,0.22); const pl=new THREE.PointLight(0xffdd99,0.6,16); pl.position.set(-4.5,5,-6-i*8); this.dyn.add(pl);}
  }

  envConcourse(){
    this.scene.background = new THREE.Color(0x2a3a58);
    this.hemi.intensity=1.2;
    const floor=this.plane(80,80,0x1c2534,{metalness:0.5,roughness:0.28,envMapIntensity:0.5}); floor.position.z=-14;
    this.box(0,3.4,-10,40,6.8,0.4,0x24304a); this.box(0,6.6,-6,40,0.4,10,0x0f172a); // wall + ceiling
    // ticket booths
    for(let x=-8;x<=8;x+=8){ this.box(x,1.1,-6,4.6,2.2,1.2,0x1c2740,{metalness:0.4}); this.box(x,2.5,-6,4.6,0.6,0.1,0xdc2626); this.glow(x,2.5,-5.9,0xff5a5a,0.1);}
    // big TICKETS board rendered IN the scene
    this.signBoard(0,4.6,-9.6,0,11,4.2,"🎟 TICKETS",[
      ["MATCH","WORLD CUP 2026"],["SECTION","C"],["ROW","12"],["PRICE","$40 / 2"]
    ],'#dc2626');
    // strip lights
    for(let x=-12;x<=12;x+=6){ const pl=new THREE.PointLight(0xffffff,0.9,26); pl.position.set(x,6,-3); this.dyn.add(pl); this.glow(x,6.3,-6,0xffffff,0.14);}
    this.npc(0,-4.5,0x059669); this.npc(-5,-8,0x64748b); this.npc(6,-9,0xb45309);
  }

  envStands(){
    // real stadium 360 photo (orlando_stadium) is loaded as the surround; build a SOLID
    // near grandstand so there is no see-through gap under the seats.
    this.scene.background = new THREE.Color(0x1a3a63);
    this.hemi.intensity=1.0;
    const concrete = 0x39414f, concrete2 = 0x323a47, rail = 0xc3ccd8;

    // player's own terrace (solid slab under the camera + neighbour)
    this.box(0,0.55,1.4,64,1.1,3.4,concrete,{roughness:0.95});
    // descending solid terraces in front (toward the pitch) with spectators on each
    const rows=7;
    for(let r=0;r<rows;r++){
      const y = -0.1 - r*0.7;          // each row a step lower
      const z = -1.2 - r*1.5;          // and further toward the pitch
      // solid step slab (this is the key fix — fills under the seats)
      this.box(0, y, z, 64, 0.7, 1.5, r%2?concrete:concrete2, {roughness:0.95});
      // riser face at the front edge of the step
      this.box(0, y-0.35, z-0.75, 64, 0.7, 0.14, 0x2a3140, {roughness:0.95});
    }
    // spectators sitting on the terraces (instanced, seated on the solid steps)
    this.buildCrowd(rows);
    // railing in front of the player
    this.box(0,1.35,-0.4,64,0.12,0.12,rail,{metalness:0.5,roughness:0.4});
    for(let x=-30;x<=30;x+=5){ this.box(x,0.95,-0.4,0.1,0.7,0.1,rail,{metalness:0.5}); }
    // solid back wall + side walls so nothing is see-through around the player
    this.box(0,4,3.4,66,9,0.6,0x232b3b,{roughness:0.95});
    this.box(-33,2.5,-3,0.6,12,26,0x232b3b,{roughness:0.95});
    this.box(33,2.5,-3,0.6,12,26,0x232b3b,{roughness:0.95});
    // wedge filling underneath the lowest terrace down out of view
    this.box(0,-6,-6,66,10,16,0x2b3240,{roughness:0.98});
    // floodlights for atmosphere
    this.floodTower(-32,-14); this.floodTower(32,-14);
    // seated first-person view + neighbour fan on the same terrace
    this.camera.position.set(0,1.7,2.0);
    this.npc(1.9,0.55,0xdc2626);
  }
  buildCrowd(rows){
    rows = rows||7; const perRow=60;
    const geo=new THREE.BoxGeometry(0.36,0.6,0.36);
    const mesh=new THREE.InstancedMesh(geo, this.mat(0xffffff,{roughness:0.9}), rows*perRow);
    mesh.castShadow=false;
    const dummy=new THREE.Object3D(); const col=new THREE.Color(); let i=0;
    const teamA=[0xdc2626,0xef4444,0xf59e0b], teamB=[0x1e3a8a,0x2563eb,0x93c5fd];
    for(let r=0;r<rows;r++){
      // match the terrace positions built in envStands
      const y = (-0.1 - r*0.7) + 0.65, z = (-1.2 - r*1.5) + 0.15;
      for(let c=0;c<perRow;c++){
        const x=-29 + c*0.98;
        dummy.position.set(x + (Math.random()*0.2-0.1), y, z); dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);
        const pal = (c<perRow/2)? teamA:teamB;
        col.setHex(pal[(r*7+c)%pal.length]); mesh.setColorAt(i, col);
        i++;
      }
    }
    mesh.instanceMatrix.needsUpdate=true; if(mesh.instanceColor) mesh.instanceColor.needsUpdate=true;
    this.dyn.add(mesh);
  }

  envPitch(){
    this.skyDome(0x2f74d6, 0x123056);
    this.hemi.intensity=1.3;
    const grass=new THREE.Mesh(new THREE.PlaneGeometry(80,140), this.mat(0x0f8a45,{roughness:0.85})); grass.rotation.x=-Math.PI/2; grass.position.set(0,-0.02,-30); grass.receiveShadow=true; this.dyn.add(grass);
    for(let i=0;i<16;i++){ const s=new THREE.Mesh(new THREE.PlaneGeometry(80,5), this.mat(i%2?0x0c7d3c:0x12a052)); s.rotation.x=-Math.PI/2; s.position.set(0,0,-i*5); this.dyn.add(s);}
    // goal (kept close so a side-spin banana can curve around the wall AND land in — tuned)
    this.goalZ=-12; this.goalW=3.66; this.goalH=2.44;
    const white=this.mat(0xffffff,{roughness:0.4});
    const post=x=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,this.goalH,14),white);m.position.set(x,this.goalH/2,this.goalZ);m.castShadow=true;this.dyn.add(m);};
    post(-this.goalW); post(this.goalW);
    const bar=new THREE.Mesh(new THREE.CylinderGeometry(0.1,0.1,this.goalW*2,14),white); bar.rotation.z=Math.PI/2; bar.position.set(0,this.goalH,this.goalZ); bar.castShadow=true; this.dyn.add(bar);
    const net=new THREE.Mesh(new THREE.PlaneGeometry(this.goalW*2,this.goalH,16,8), new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:0.26})); net.position.set(0,this.goalH/2,this.goalZ-0.5); this.dyn.add(net);
    // narrow wall of defenders (blocks the direct shot; block half-width ~1.0)
    this.wallZ=-8; this.wallH=1.8;
    for(let i=-1;i<=1;i++){ this.npc(i*0.6, this.wallZ, i%2?0x1e3a8a:0x1d4ed8); }
    // ball
    const tex=this.ballTex();
    this.ball=new THREE.Mesh(new THREE.SphereGeometry(0.22,28,28), this.mat(0xffffff,{map:tex,roughness:0.4,emissive:0x555555,emissiveIntensity:0.35})); this.ball.castShadow=true;
    this.ball.position.set(0,0.22,0); this.dyn.add(this.ball);
    const ballGlow=new THREE.PointLight(0xffffff,0.6,6); this.ball.add(ballGlow);
    this.flying=false; this.trailLine=null;
    // stadium surround + floods
    this.box(0,6,-60,120,20,3,0x101a30); this.box(-40,6,-30,3,20,80,0x101a30); this.box(40,6,-30,3,20,80,0x101a30);
    this.floodTower(-34,-40); this.floodTower(34,-40); this.floodTower(-34,-6); this.floodTower(34,-6);
  }
  ballTex(){
    const c=document.createElement('canvas'); c.width=c.height=128; const x=c.getContext('2d');
    x.fillStyle="#fff"; x.fillRect(0,0,128,128); x.fillStyle="#0b1220";
    const pent=(cx,cy,r)=>{x.beginPath();for(let k=0;k<5;k++){const a=k/5*6.283- Math.PI/2;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}x.closePath();x.fill();};
    pent(64,64,15); pent(24,30,10); pent(104,30,10); pent(30,104,10); pent(100,104,10);
    return new THREE.CanvasTexture(c);
  }

  /* ---------- physics kick ---------- */
  setupKick(){ this.kickMode=true; this.camera.position.set(0,1.5,3.0); this.resetBall(); }
  resetBall(){ if(!this.ball) return; this.flying=false; this.ball.position.set(0,0.22,0); if(this.trailLine){this.dyn.remove(this.trailLine);this.trailLine=null;} }
  kick(p, done){
    if(this.flying) return; this.doneCb=done;
    const speed=18, pitch=11*Math.PI/180, yaw=p.aim*Math.PI/180;   // tuned so spin can score
    this.vel=new THREE.Vector3(speed*Math.cos(pitch)*Math.sin(yaw), speed*Math.sin(pitch), -speed*Math.cos(pitch)*Math.cos(yaw));
    this.pos=new THREE.Vector3(0,0.22,0); this.aSide=p.spin*1.5; this.trail=[this.pos.clone()]; this.flying=true; this.passedWall=false;
  }
  stepBall(dt){
    if(!this.flying) return; const v=this.vel, pos=this.pos, sp=v.length();
    const a=new THREE.Vector3(0,-9.8,0); a.x+=this.aSide; a.addScaledVector(v,-0.0008*sp);
    v.addScaledVector(a,dt); pos.addScaledVector(v,dt); this.ball.position.copy(pos);
    this.ball.rotation.y+=dt*7; this.ball.rotation.x+=dt*4; this.trail.push(pos.clone());
    if(!this.passedWall && pos.z<=this.wallZ){ this.passedWall=true; if(pos.y<this.wallH && Math.abs(pos.x)<1.0) return this.landBall(false,"Blocked by the wall 被人牆擋下"); }
    if(pos.z<=this.goalZ){ const inX=Math.abs(pos.x)<this.goalW-0.05, inY=pos.y>0.12&&pos.y<this.goalH-0.05; return this.landBall(inX&&inY, inX&&inY?"":(pos.y>=this.goalH?"Over the bar 飛過門楣":"Wide 偏出邊柱")); }
    if(pos.y<=0.12 && pos.z>this.goalZ) return this.landBall(false,"Fell short 提早落地");
    if(pos.z<this.goalZ-3 || Math.abs(pos.x)>28) return this.landBall(false,"Out 出界");
  }
  landBall(scored, why){
    this.flying=false;
    if(this.trailLine) this.dyn.remove(this.trailLine);
    const geo=new THREE.BufferGeometry().setFromPoints(this.trail);
    this.trailLine=new THREE.Line(geo, new THREE.LineBasicMaterial({color:scored?0xfbbf24:0xff6b6b})); this.dyn.add(this.trailLine);
    if(this.doneCb) this.doneCb({scored, why});
  }

  /* ---------- loop ---------- */
  animate(){
    requestAnimationFrame(()=>this.animate());
    const dt=Math.min(this.clock.getDelta(),0.033); this.t+=dt;
    for(const f of this.anims){ try{ f(this.t, dt); }catch(e){} }
    if(this.flying){ for(let i=0;i<3;i++) this.stepBall(dt/3); }
    if(this.kickMode){ this.camera.position.set(0,1.5,3.5); this.camera.lookAt(0,1.0,this.goalZ*0.5); }
    else {
      const dir=new THREE.Vector3(Math.sin(this.yaw)*Math.cos(this.pitch), Math.sin(this.pitch), -Math.cos(this.yaw)*Math.cos(this.pitch));
      this.camera.lookAt(this.camera.position.clone().add(dir));
    }
    if(this.head){ this.head.position.copy(this.camera.position); this.head.position.y+=0.4; }
    if(this.usePost && this.composer) this.composer.render(); else this.renderer.render(this.scene, this.camera);
    this._frames = (this._frames || 0) + 1;   // count painted frames for whenRendered()
  }
}
window.FPV = FPV;
