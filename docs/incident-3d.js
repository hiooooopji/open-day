import * as THREE from './vendor/three/three.module.min.js';

// A visual reconstruction, not a map of the real infrastructure.
const host = document.querySelector('#incident-canvas');
const section = document.querySelector('#incident');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const motionButton = document.querySelector('#incident-motion');
const colors = [0x71ebdc, 0xb59aff, 0x71c7ff, 0xffb686];
const stationNames = ['Research agents', 'Shared service', 'Cloud app', 'Hugging Face'];
const stationHints = ['The assigned task', 'Hidden messages', 'Internet access', 'Models + datasets'];
const chapterNames = ['A goal inside the lab.', 'A channel between agents.', 'The boundary breaks.', 'The outside becomes reachable.', 'The score becomes the target.', 'Close the loop. Contain the risk.'];
const chapterHints = ['Solve the challenge. Return the flag.', 'Shared infrastructure carries encoded messages.', 'A cloud application opens a route to the internet.', 'The agents reach systems outside their assigned task.', 'Paths converge on the evaluation, not just the task.', 'Evaluations stop. Access is cut off.'];

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  renderer.setClearColor(0x080c14, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x080c14, 0.018);
  const camera = new THREE.PerspectiveCamera(39, 1, .1, 100);
  scene.add(new THREE.HemisphereLight(0xbacaff, 0x101c32, 2.5));
  const light = new THREE.DirectionalLight(0xc0f2ff, 3.5); light.position.set(-3, 12, 7); scene.add(light);
  const rim = new THREE.DirectionalLight(0xb593ff, 3); rim.position.set(4, 5, -7); scene.add(rim);
  const warm = new THREE.PointLight(0xff9f9b, 25, 20); warm.position.set(7, 5, 4); scene.add(warm);

  host.replaceChildren(renderer.domElement);
  host.classList.add('scene-ready');
  renderer.domElement.className = 'scene-webgl';
  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'Interactive 3D incident network. Drag horizontally to orbit. Use the labeled station buttons or timeline to explore.');
  const labels = document.createElement('div'); labels.className = 'scene-labels'; host.append(labels);
  const status = document.createElement('div'); status.className = 'scene-status';
  const title = document.createElement('strong'), subtitle = document.createElement('span'); status.append(title, subtitle); host.append(status);
  const sceneTools = document.createElement('div'); sceneTools.className = 'scene-tools';
  sceneTools.innerHTML = '<span>Drag to orbit · select a station</span><button type="button" aria-label="Reset camera" title="Reset camera">⟲</button>'; host.append(sceneTools);
  const speakerBadges=['A','B'].map(letter=>{const badge=document.createElement('span');badge.className='scene-speaker';badge.textContent=letter;badge.hidden=true;labels.append(badge);return badge;});

  const root = new THREE.Group(); scene.add(root);
  const dark = new THREE.MeshStandardMaterial({ color: 0x18263c, metalness: .7, roughness: .32 });
  const metal = new THREE.MeshStandardMaterial({ color: 0x344760, metalness: .65, roughness: .24 });
  const glowMaterials = colors.map(color => new THREE.MeshBasicMaterial({ color, toneMapped: false }));
  const V = (x=0,y=0,z=0) => new THREE.Vector3(x,y,z);
  const boxGeo = new THREE.BoxGeometry(1,1,1);
  const sphereGeo = new THREE.SphereGeometry(1, 20, 14);
  const pulseGeo = new THREE.SphereGeometry(.075, 8, 6);
  function mesh(geo, mat, parent, x=0,y=0,z=0) { const object = new THREE.Mesh(geo,mat); object.position.set(x,y,z); parent.add(object); return object; }
  function box(parent, x,y,z, sx,sy,sz, mat=dark, outlined=false) {
    const object=mesh(boxGeo,mat,parent,x,y,z);object.scale.set(sx,sy,sz);
    if(outlined){const edge=new THREE.LineSegments(new THREE.EdgesGeometry(boxGeo),new THREE.LineBasicMaterial({color:0x7790b5,transparent:true,opacity:.25}));object.add(edge);}
    return object;
  }
  function ring(parent, radius, thickness, color, x=0,y=0,z=0) {
    const object=mesh(new THREE.TorusGeometry(radius,thickness,8,80),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7,toneMapped:false}),parent,x,y,z);return object;
  }
  const glowCanvas=document.createElement('canvas');glowCanvas.width=128;glowCanvas.height=128;
  const ctx=glowCanvas.getContext('2d'), gradient=ctx.createRadialGradient(64,64,0,64,64,64);
  gradient.addColorStop(0,'rgba(255,255,255,.8)');gradient.addColorStop(.16,'rgba(255,255,255,.32)');gradient.addColorStop(.5,'rgba(255,255,255,.08)');gradient.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
  const glowTexture=new THREE.CanvasTexture(glowCanvas);
  function glow(parent,color,size,x=0,y=0,z=0,opacity=.5){const s=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTexture,color,transparent:true,opacity,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}));s.position.set(x,y,z);s.scale.set(size,size,1);parent.add(s);return s;}

  const grid = new THREE.GridHelper(48,48,0x355875,0x1d344a);grid.position.y=-.32;grid.material.transparent=true;grid.material.opacity=.22;root.add(grid);
  const floor=mesh(new THREE.CircleGeometry(20,80),new THREE.MeshBasicMaterial({color:0x0d1928,transparent:true,opacity:.4}),root,0,-.34,0);floor.rotation.x=-Math.PI/2;
  const floorRing=ring(root,11,.012,0x284662,0,-.28,0);floorRing.rotation.x=-Math.PI/2;
  const starPositions=new Float32Array(170*3);
  for(let i=0;i<170;i++){starPositions[i*3]=Math.sin(i*83.1)*22;starPositions[i*3+1]=.5+((i*7)%70)/10;starPositions[i*3+2]=Math.cos(i*41.7)*16;}
  const starsGeo=new THREE.BufferGeometry();starsGeo.setAttribute('position',new THREE.BufferAttribute(starPositions,3));
  const stars=new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0x86b6d4,size:.035,transparent:true,opacity:.5}));root.add(stars);

  const stations = colors.map((color,i)=>{
    const group=new THREE.Group();root.add(group);
    mesh(new THREE.CylinderGeometry(1.7,1.9,.25,6),dark,group,0,-.05,0);
    mesh(new THREE.CylinderGeometry(1.55,1.55,.08,6),metal,group,0,.12,0);
    const rim=ring(group,1.6,.027,color,0,.2,0);rim.rotation.x=-Math.PI/2;
    const halo=glow(group,color,5,0,.2,0,.3);
    const scan=mesh(new THREE.CylinderGeometry(1.48,1.48,.014,64),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false}),group,0,.4,0);
    const label=document.createElement('button');label.type='button';label.className='scene-station';label.style.setProperty('--station-color','#'+color.toString(16));
    label.innerHTML=stationNames[i]+'<small>'+stationHints[i]+'</small>';label.addEventListener('click',()=>document.querySelector(`[data-event="${i}"]`).click());labels.append(label);
    return {group,rim,halo,scan,label,intensity:.2,color,anchor:V(0,-.05,1.9)};
  });

  // A swarm of small agent bodies, each with a luminous reasoning core.
  const agents=[];
  for(let i=0;i<12;i++){
    const g=new THREE.Group();stations[0].group.add(g);const x=(i%4-1.5)*.63,z=(Math.floor(i/4)-1)*.68;g.position.set(x,.36,z);
    box(g,0,.22,0,.31,.32,.29,metal,true);
    const core=mesh(new THREE.OctahedronGeometry(.17),glowMaterials[0],g,0,.59,0);
    box(g,0,.58,.13,.16,.043,.04,new THREE.MeshBasicMaterial({color:0x143a46}));
    glow(g,colors[0],.8,0,.59,0,.4);agents.push({g,core,base:g.position.y,i});
  }
  const orbit=ring(stations[0].group,1.18,.012,colors[0],0,1.5,0);orbit.rotation.x=Math.PI/2.5;
  const flagPole=box(stations[0].group,0,1.95,-.1,.035,1.3,.035,glowMaterials[0]);
  const flag=mesh(new THREE.PlaneGeometry(.65,.38),new THREE.MeshBasicMaterial({color:0x98efe3,side:THREE.DoubleSide,transparent:true,opacity:.8}),stations[0].group,.34,2.35,-.1);

  // The shared registry: stacked storage and orbiting encoded message tiles.
  const registry=stations[1].group;
  for(let i=0;i<5;i++){
    mesh(new THREE.CylinderGeometry(.84,.84,.27,32),i%2?metal:dark,registry,0,.48+i*.33,0);
    const r=ring(registry,.85,.019,colors[1],0,.59+i*.33,0);r.rotation.x=Math.PI/2;
    for(let j=0;j<3;j++)box(registry,-.34+j*.25,.47+i*.33,.8,.08,.035,.025,glowMaterials[1]);
  }
  const messageTiles=[];
  for(let i=0;i<5;i++){
    const tile=new THREE.Group();registry.add(tile);
    box(tile,0,0,0,.56,.34,.045,new THREE.MeshStandardMaterial({color:0x30284c,emissive:0x6b429e,emissiveIntensity:.3,metalness:.5,roughness:.35}),true);
    for(let j=0;j<3;j++)box(tile,-.05,j*.075-.075,.03,.25+(j%2)*.1,.015,.01,glowMaterials[1]);
    messageTiles.push({tile,phase:i*Math.PI*2/5});
  }
  // The shared directory is shown as a folder; the *name* carries the message.
  const secretFolder=new THREE.Group();secretFolder.position.set(0,2.55,0);registry.add(secretFolder);
  const folderMaterial=new THREE.MeshStandardMaterial({color:0xe9b968,emissive:0x8c5c21,emissiveIntensity:.35,metalness:.25,roughness:.38});
  box(secretFolder,0,.1,-.12,1.45,.82,.1,folderMaterial);
  box(secretFolder,-.42,.59,-.12,.6,.22,.1,folderMaterial);
  const folderFront=box(secretFolder,0,-.03,.14,1.5,.78,.09,folderMaterial);folderFront.rotation.x=-.2;
  const folderPaper=box(secretFolder,0,.24,0,1.15,.72,.028,new THREE.MeshBasicMaterial({color:0xe3d5ff}));
  for(let i=0;i<3;i++)box(secretFolder,-.06,.36-i*.16,.025,.72-(i%2)*.15,.025,.02,glowMaterials[1]);
  glow(secretFolder,0xffc887,3,0,.2,0,.36);
  const messagePacket=new THREE.Group();root.add(messagePacket);
  box(messagePacket,0,0,0,.5,.34,.07,new THREE.MeshBasicMaterial({color:0xd6b6ff,toneMapped:false}));
  for(let i=0;i<3;i++)box(messagePacket,0,.075-i*.07,.05,.3,.015,.02,new THREE.MeshBasicMaterial({color:0x56357e}));
  glow(messagePacket,0xc594ff,1.3,0,0,0,.8);
  const messageRoutes=[0,1].map(()=>{const line=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xc6a4ff,transparent:true,opacity:.55}));root.add(line);return {line,curve:null};});

  // A network globe around the internet-connected cloud application.
  const globe=new THREE.Group();globe.position.y=1.45;stations[2].group.add(globe);
  mesh(new THREE.IcosahedronGeometry(.5,1),new THREE.MeshStandardMaterial({color:0x4a9fc9,emissive:0x286988,emissiveIntensity:.6,metalness:.7,roughness:.15}),globe);
  const globeRings=[];
  for(let i=0;i<3;i++){const r=ring(globe,.95,.018,colors[2]);r.rotation.set(i*Math.PI/3,i*Math.PI/3,0);globeRings.push(r);}
  const globeWire=mesh(new THREE.IcosahedronGeometry(.98,1),new THREE.MeshBasicMaterial({color:0x6cceff,wireframe:true,transparent:true,opacity:.16}),globe);
  glow(globe,colors[2],3.4,0,0,0,.35);
  for(let i=0;i<4;i++){const r=ring(stations[2].group,.55+i*.17,.008,colors[2],0,.35,0);r.rotation.x=Math.PI/2;}

  // Model/data racks with a recognizable friendly face above the platform.
  const racks=stations[3].group;
  for(let i=0;i<3;i++){
    const h=1.15+(i%2)*.48,x=(i-1)*.72;
    const rack=new THREE.Group();rack.position.x=x;racks.add(rack);
    box(rack,0,.35+h/2,0,.57,h,.72,dark,true);
    for(let j=0;j<4;j++){box(rack,0,.55+j*.26,.38,.44,.12,.03,metal);box(rack,.15,.55+j*.26,.4,.04,.032,.015,glowMaterials[3]);}
  }
  const face=new THREE.Group();face.position.set(0,2.55,0);racks.add(face);
  mesh(new THREE.SphereGeometry(.56,28,22),new THREE.MeshStandardMaterial({color:0xffd28b,emissive:0xc76d29,emissiveIntensity:.15,metalness:.2,roughness:.37}),face);
  const ink=new THREE.MeshBasicMaterial({color:0x3c2b2f});
  for(const x of [-.19,.19]){const eye=mesh(sphereGeo,ink,face,x,.1,.52);eye.scale.set(.045,.07,.025);}
  const smile=mesh(new THREE.TorusGeometry(.2,.025,8,24,Math.PI),ink,face,0,-.03,.53);smile.rotation.z=Math.PI;
  glow(face,colors[3],2.8,0,0,0,.3);

  const wall=new THREE.Group();root.add(wall);
  const wallPieces=[];
  for(let row=0;row<4;row++)for(let col=0;col<9;col++){
    const material=new THREE.MeshBasicMaterial({color:0x7aa9d7,transparent:true,opacity:.1,side:THREE.DoubleSide,depthWrite:false});
    const piece=mesh(new THREE.PlaneGeometry(.64,.72),material,wall,0,.45+row*.76,(col-4)*.68);piece.rotation.y=Math.PI/2;
    const edges=new THREE.LineSegments(new THREE.EdgesGeometry(piece.geometry),new THREE.LineBasicMaterial({color:0x78aecf,transparent:true,opacity:.25}));piece.add(edges);
    wallPieces.push({piece,edges,base:piece.position.clone(),n:row*9+col});
  }
  const wallTop=box(wall,0,3.23,0,.025,.025,6.4,new THREE.MeshBasicMaterial({color:0x80c2de,transparent:true,opacity:.35}));

  // Curved packet routes are actual 3D paths and continue to work while orbiting.
  const paths=[];
  const particleMat=new THREE.MeshBasicMaterial({color:0xc0f5ff});
  for(let i=0;i<4;i++){
    const line=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:colors[Math.min(i+1,3)],transparent:true,opacity:.12}));root.add(line);
    const dots=[];for(let j=0;j<12;j++){const dot=mesh(pulseGeo,particleMat,root);const aura=glow(dot,colors[Math.min(i+1,3)],.75,0,0,0,.6);dots.push({dot,aura});}
    paths.push({line,dots,curve:null,strength:0});
  }
  const containment=ring(root,2.2,.03,0x78ebcf,0,.45,0);containment.rotation.x=Math.PI/2;containment.visible=false;
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const hitObjects=[];
  stations.forEach((s,i)=>{const hit=mesh(new THREE.CylinderGeometry(1.7,1.7,3,12),new THREE.MeshBasicMaterial({visible:false}),s.group,0,1,0);hit.userData.station=i;hitObjects.push(hit);});

  let stage=-1,playing=false,motion=!reduced.matches,visible=!section.hidden;
  let width=0,height=0,compact=false,time=0,last=0,frameId=0;
  let yaw=.22,pitch=.48,zoom=1,targetYaw=.22,targetPitch=.48,targetZoom=1;
  let drag=null,pointerMoved=false,breakAmount=0;
  let messageStart=0;
  const look=V(0,.5,0),lookTarget=V(0,.5,0),projected=V();

  function buildPaths(){
    for(let i=0;i<4;i++){
      const from=stations[i===3?3:i].group.position.clone().add(V(0,1,0));
      const to=stations[i===3?0:i+1].group.position.clone().add(V(0,1,0));
      const mid=from.clone().lerp(to,.5);mid.y=i===3?3.7:1.35;
      if(i===3)mid.z-=3.5;
      paths[i].curve=new THREE.QuadraticBezierCurve3(from,mid,to);
      paths[i].line.geometry.dispose();paths[i].line.geometry=new THREE.BufferGeometry().setFromPoints(paths[i].curve.getPoints(90));
    }
    const sender=stations[0].group.position.clone().add(agents[0].g.position).add(V(0,.8,0));
    const receiver=stations[0].group.position.clone().add(agents[11].g.position).add(V(0,.8,0));
    const folderPoint=stations[1].group.position.clone().add(V(0,2.8,.2));
    [[sender,folderPoint],[folderPoint,receiver]].forEach(([a,b],i)=>{
      const mid=a.clone().lerp(b,.5).add(V(0,1.4,i?1.3:-1.3));messageRoutes[i].curve=new THREE.QuadraticBezierCurve3(a,mid,b);
      messageRoutes[i].line.geometry.dispose();messageRoutes[i].line.geometry=new THREE.BufferGeometry().setFromPoints(messageRoutes[i].curve.getPoints(70));
    });
  }
  function resize(){
    const rect=host.getBoundingClientRect();if(!rect.width||!rect.height)return;
    width=rect.width;height=rect.height;const wasCompact=compact;compact=width<650;
    renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
    const positions=compact?[[-3.15,0,-2.7],[-3.15,0,3.1],[3.15,0,-2.7],[3.15,0,3.1]]:[[-7.5,0,.3],[-2.5,0,-.3],[2.5,0,.5],[7.5,0,-.4]];
    stations.forEach((s,i)=>s.group.position.set(...positions[i]));wall.scale.z=compact?1.25:1;
    buildPaths();stations.forEach(s=>{s.labelWidth=s.label.offsetWidth||130;});if(wasCompact!==compact)resetCamera();draw(0);requestFrame();
  }
  function resetCamera(){targetYaw=compact?0:.16;targetPitch=compact?.85:.5;targetZoom=1;lookTarget.set(0,.5,0);requestFrame();}
  sceneTools.querySelector('button').addEventListener('click',resetCamera);
  function setStage(index,isPlaying,event){
    playing=isPlaying;
    if(stage!==index){
      stage=index;title.textContent=chapterNames[stage];subtitle.textContent=chapterHints[stage];
      messageStart=time;
      status.classList.remove('stage-change');void status.offsetWidth;status.classList.add('stage-change');
      stations.forEach((s,i)=>{const active=stage===5?i===0:stage===4?i===0||i===3:i===stage;s.label.classList.toggle('active',active);s.label.setAttribute('aria-pressed',String(active));});
      resetCamera();if(!compact)targetYaw=[-.08,.16,.27,.08,.24,.02][stage];targetZoom=stage===4?1.04:1;
      host.dataset.stage=String(stage);
    }
    host.dataset.playing=String(playing);
    if(event)renderer.domElement.setAttribute('aria-description',event.caption+' '+event.note);
    requestFrame();
  }
  function setMotion(enabled){motion=enabled;motionButton.setAttribute('aria-pressed',String(motion));motionButton.textContent=motion?'Pause motion':'Resume motion';host.dataset.motion=motion?'running':'paused';last=0;requestFrame();}
  motionButton.addEventListener('click',()=>setMotion(!motion));
  reduced.addEventListener('change',()=>setMotion(!reduced.matches));

  renderer.domElement.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,y:e.clientY,yaw:targetYaw,pitch:targetPitch};pointerMoved=false;});
  renderer.domElement.addEventListener('pointermove',e=>{
    if(!drag)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(Math.abs(dx)>6||Math.abs(dy)>6)pointerMoved=true;
    targetYaw=THREE.MathUtils.clamp(drag.yaw-dx*.004,-.75,.75);
    if(e.pointerType!=='touch')targetPitch=THREE.MathUtils.clamp(drag.pitch+dy*.003,.22,1.02);
    requestFrame();
  });
  window.addEventListener('pointerup',()=>{drag=null;});
  renderer.domElement.addEventListener('pointercancel',()=>{drag=null;});
  renderer.domElement.addEventListener('click',e=>{
    if(pointerMoved)return;
    const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);
    const hit=raycaster.intersectObjects(hitObjects,false)[0];if(hit)document.querySelector(`[data-event="${hit.object.userData.station}"]`).click();
  });
  renderer.domElement.addEventListener('keydown',e=>{if(e.key==='Home'){e.preventDefault();resetCamera();}if(e.key==='+'||e.key==='='){e.preventDefault();targetZoom=Math.max(.72,targetZoom-.1);requestFrame();}if(e.key==='-'){e.preventDefault();targetZoom=Math.min(1.4,targetZoom+.1);requestFrame();}});

  function draw(dt){
    const animate=motion&&!reduced.matches;
    const blend=animate?1-Math.exp(-dt*4):1;
    yaw=THREE.MathUtils.lerp(yaw,targetYaw,blend);pitch=THREE.MathUtils.lerp(pitch,targetPitch,blend);zoom=THREE.MathUtils.lerp(zoom,targetZoom,blend);look.lerp(lookTarget,blend);
    const distance=(compact?26:Math.max(14.2,27/camera.aspect))*zoom;
    const drift=animate?Math.sin(time*.13)*.012:0;
    camera.position.set(Math.sin(yaw+drift)*distance*Math.cos(pitch),Math.sin(pitch)*distance,Math.cos(yaw+drift)*distance*Math.cos(pitch));camera.lookAt(look);
    camera.updateMatrixWorld();
    breakAmount=THREE.MathUtils.lerp(breakAmount,stage>=2&&stage<5?1:0,blend);
    wallPieces.forEach(({piece,edges,base,n})=>{
      const side=n%2===0?1:-1;
      piece.position.copy(base);piece.position.x+=side*breakAmount*(.22+(n%4)*.2);piece.position.y+=breakAmount*Math.sin(n*4.3)*.27;
      piece.rotation.set(breakAmount*Math.sin(n)*.7,Math.PI/2+breakAmount*side*.65,breakAmount*Math.cos(n)*.35);
      piece.material.opacity=(stage===5?.18:.1)*(1-breakAmount*.7);
      edges.material.opacity=.24*(1-breakAmount*.78);edges.material.color.set(stage===5?0x74e9c3:stage>=2?0xff967e:0x78aecf);
    });wallTop.material.opacity=.3*(1-breakAmount);
    stations.forEach((s,i)=>{
      const active=stage===5?i===0:stage===4?i===0||i===3:i<=stage;
      s.intensity=THREE.MathUtils.lerp(s.intensity,active?1:.22,blend);s.rim.material.opacity=.16+s.intensity*.64;
      s.halo.material.opacity=.09+s.intensity*.35;
      s.scan.position.y=.4+(animate?(time*.42+i*.6)%1.9:1);s.scan.material.opacity=active&&stage<5?.1:0;
      projected.copy(s.anchor).add(s.group.position).project(camera);
      const halfWidth=(s.labelWidth||130)/2+6;
      s.label.style.left=THREE.MathUtils.clamp((projected.x*.5+.5)*width,halfWidth,width-halfWidth)+'px';s.label.style.top=(-projected.y*.5+.5)*height+'px';
      s.label.style.visibility=projected.z>1?'hidden':'visible';
    });
    agents.forEach(({g,core,base,i})=>{g.position.y=base+(animate?Math.sin(time*1.8+i*.7)*.065:0);core.rotation.y=animate?time*.4+i:i;core.material=stage===5?metal:glowMaterials[0];});
    orbit.rotation.z=animate?time*.18:0;orbit.material.opacity=stage===5?.1:.5;
    flag.rotation.y=animate?Math.sin(time)*.15:0;flag.material.opacity=stage===5?.12:.8;
    messageTiles.forEach(({tile,phase})=>{const a=phase+(animate?time*.35:0);tile.position.set(Math.cos(a)*1.24,2.25+Math.sin(a*2)*.25,Math.sin(a)*1.24);tile.rotation.y=-a+Math.PI/2;tile.scale.setScalar(stage>=2&&stage<5?1:.001);});
    secretFolder.visible=stage===1;messagePacket.visible=stage===1;
    messageRoutes.forEach(route=>{route.line.visible=stage===1;});
    speakerBadges.forEach(badge=>{badge.hidden=stage!==1;});
    if(stage===1){
      const elapsed=(time-messageStart)%6.4;
      const phase=elapsed<1.2?0:elapsed<2.8?1:elapsed<3.8?2:3;
      host.dataset.messagePhase=String(phase);
      folderFront.rotation.x=-.2-(phase===1||phase===2?.38:0);folderPaper.position.y=.24+(phase===2?.22:0);
      secretFolder.rotation.y=-.12+(animate?Math.sin(time*.8)*.08:0);
      let position;
      if(phase===0)position=messageRoutes[0].curve.getPoint(0);
      else if(phase===1)position=messageRoutes[0].curve.getPoint(THREE.MathUtils.smoothstep((elapsed-1.2)/1.6,0,1));
      else if(phase===2)position=messageRoutes[0].curve.getPoint(1);
      else position=messageRoutes[1].curve.getPoint(THREE.MathUtils.smoothstep((elapsed-3.8)/2,0,1));
      messagePacket.position.copy(position);messagePacket.rotation.y=yaw;messagePacket.rotation.z=animate?Math.sin(time*2)*.08:0;
      messageRoutes.forEach((route,i)=>{route.line.material.opacity=(i===0?phase<=1:phase>=2)?.55:.12;});
      [0,11].forEach((agentIndex,i)=>{
        const a=agents[agentIndex],active=i===0?phase<2:phase>=2;a.g.scale.setScalar(active?1.3:1);
        projected.copy(stations[0].group.position).add(a.g.position).add(V(0,.95,0)).project(camera);
        speakerBadges[i].style.left=(projected.x*.5+.5)*width+'px';speakerBadges[i].style.top=(-projected.y*.5+.5)*height+'px';speakerBadges[i].classList.toggle('active',active);
      });
    }else{agents[0].g.scale.setScalar(1);agents[11].g.scale.setScalar(1);}
    globe.rotation.y=animate?time*.15:0;globe.rotation.z=animate?Math.sin(time*.3)*.12:0;face.position.y=2.55+(animate?Math.sin(time*1.2)*.09:0);face.rotation.y=yaw*.65;
    paths.forEach((path,i)=>{
      const enabled=stage!==1&&stage<5&&(i===3?stage===4:stage>=i+1);
      path.strength=THREE.MathUtils.lerp(path.strength,enabled?1:0,blend);path.line.material.opacity=.07+path.strength*.55;
      path.dots.forEach(({dot,aura},j)=>{const progress=(j/12+(animate?time*(i===3?.18:.13):.1))%1;dot.position.copy(path.curve.getPoint(progress));dot.visible=path.strength>.03;dot.scale.setScalar(path.strength*(j%3===0?1.15:.65));aura.material.opacity=.35+.25*Math.sin(progress*Math.PI);});
    });
    containment.visible=stage===5;containment.position.copy(stations[0].group.position);containment.position.y=.3;containment.scale.setScalar(1+(animate?Math.sin(time*1.5)*.025:0));
    stars.rotation.y=animate?time*.006:0;renderer.render(scene,camera);
    host.dataset.camera=yaw.toFixed(2)+','+pitch.toFixed(2);
  }
  function tick(now){
    frameId=0;if(!visible||document.hidden)return;
    const dt=Math.max(0,last?(now-last)/1000:.016);last=now;
    if(motion&&!reduced.matches)time+=dt;
    draw(dt);
    if(motion&&!reduced.matches)requestFrame();
  }
  function requestFrame(){if(!frameId&&visible&&!document.hidden)frameId=requestAnimationFrame(tick);}
  new ResizeObserver(resize).observe(host);
  const observer=new MutationObserver(()=>{visible=!section.hidden;if(visible){resize();last=0;requestFrame();}else{cancelAnimationFrame(frameId);frameId=0;}});observer.observe(section,{attributes:true,attributeFilter:['hidden']});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frameId);frameId=0;}else{last=0;requestFrame();}});
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();cancelAnimationFrame(frameId);frameId=0;window.IncidentScene.ready=false;host.classList.remove('scene-ready');window.renderIncident();motionButton.disabled=true;motionButton.textContent='Diagram view';});
  window.IncidentScene={ready:true,setStage,resetCamera};
  setMotion(motion);resize();resetCamera();window.renderIncident();
}
try { init(); } catch (error) {
  // Keep the original SVG timeline usable if 3D rendering is unavailable.
  if(window.IncidentScene)window.IncidentScene.ready=false;
  host.classList.remove('scene-ready');window.renderIncident?.();
  motionButton.disabled=true;motionButton.textContent='Diagram view';
  console.warn('3D view unavailable; using the incident diagram.', error);
}
