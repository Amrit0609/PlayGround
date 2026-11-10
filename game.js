import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const mount = document.querySelector('#scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x102b26);
scene.fog = new THREE.Fog(0x102b26, 42, 105);
const camera = new THREE.PerspectiveCamera(43, innerWidth / innerHeight, .1, 180);
camera.position.set(0, 10.4, 25.8);
camera.lookAt(0, 2.8, -1.5);
const renderer = new THREE.WebGLRenderer({antialias:true, alpha:false, powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
mount.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xc8dfd2, 0x182b1e, 2.15));
const sun = new THREE.DirectionalLight(0xffe6bc, 3.1);
sun.position.set(-14, 25, 16); sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048); sun.shadow.camera.left=-35; sun.shadow.camera.right=35; sun.shadow.camera.top=30; sun.shadow.camera.bottom=-30;
sun.shadow.bias=-.00035; scene.add(sun);
const fill = new THREE.DirectionalLight(0xa6c8c0, 1.1); fill.position.set(18,12,-20); scene.add(fill);
const stadiumGlow = new THREE.PointLight(0xd7e9d8, 105, 46, 2); stadiumGlow.position.set(-21,17,-8); scene.add(stadiumGlow);
const stadiumGlow2 = new THREE.PointLight(0xf2d6a5, 95, 46, 2); stadiumGlow2.position.set(21,17,-8); scene.add(stadiumGlow2);

const mat=(color,roughness=.8,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
const grassMats=[mat(0x28583c),mat(0x2d6142),mat(0x326746),mat(0x285a3e)];
const ground=new THREE.Mesh(new THREE.CircleGeometry(54,128),mat(0x254f37)); ground.rotation.x=-Math.PI/2; ground.position.y=-.12; ground.receiveShadow=true; scene.add(ground);
// Alternating outfield mowing bands.
for(let r=9;r<53;r+=5.5){const ring=new THREE.Mesh(new THREE.RingGeometry(r,r+5.5,128),grassMats[(Math.floor(r/5.5))%grassMats.length]);ring.rotation.x=-Math.PI/2;ring.position.y=-.105;scene.add(ring);}
// Soft boundary rope.
const boundary=new THREE.Mesh(new THREE.TorusGeometry(42.8,.12,8,180),mat(0xd9c899));boundary.rotation.x=Math.PI/2;boundary.position.y=.12;scene.add(boundary);

// Raised oval stadium tiers and tiny colorful spectators.
for(let i=0;i<4;i++){
  const inner=24.2+i*2.7, outer=inner+2.55;
  const tier=new THREE.Mesh(new THREE.RingGeometry(inner,outer,160),mat([0x263936,0x35433b,0x263530,0x384239][i],.94));tier.rotation.x=-Math.PI/2;tier.position.y=.08+i*.72;scene.add(tier);
  const edge=new THREE.Mesh(new THREE.TorusGeometry(outer,.11,5,160),mat(i%2?0xa38e63:0x859082));edge.rotation.x=Math.PI/2;edge.position.y=.14+i*.72;scene.add(edge);
}
const crowd=new THREE.InstancedMesh(new THREE.BoxGeometry(.22,.22,.13),new THREE.MeshStandardMaterial({roughness:1}),2600);
const dummy=new THREE.Object3D();const crowdColors=[0xd5d0bd,0x9eab9b,0xa36e54,0x3f7266,0xc0ad7c,0x617c9a,0xe1dfd1,0x6a483d];
for(let i=0;i<2600;i++){
  const ring=i%4, a=Math.random()*Math.PI*2, r=25.2+ring*2.7+Math.random()*2.2;
  dummy.position.set(Math.cos(a)*r,.48+ring*.72+Math.random()*.32,Math.sin(a)*r);
  dummy.rotation.set(0,-a,Math.random()*.17);dummy.scale.setScalar(.68+Math.random()*.75);dummy.updateMatrix();crowd.setMatrixAt(i,dummy.matrix);crowd.setColorAt(i,new THREE.Color(crowdColors[Math.floor(Math.random()*crowdColors.length)]));
}scene.add(crowd);

// Distant pavilion, roofline and softly glowing scoreboard.
const pavilion=new THREE.Group();
const pavilionBody=new THREE.Mesh(new THREE.BoxGeometry(28,5,2.6),mat(0x172b27));pavilionBody.position.set(0,13,-30);pavilion.add(pavilionBody);
const roof=new THREE.Mesh(new THREE.BoxGeometry(31,.45,4.2),mat(0x283832));roof.position.set(0,15.7,-30);pavilion.add(roof);
for(let x=-12;x<=12;x+=2.4){const win=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.4,.08),new THREE.MeshBasicMaterial({color:0xbba878}));win.position.set(x,13.2,-28.62);pavilion.add(win);}
const screen=new THREE.Mesh(new THREE.BoxGeometry(7.5,2.2,.15),new THREE.MeshBasicMaterial({color:0x172c27}));screen.position.set(0,17.1,-28.2);pavilion.add(screen);scene.add(pavilion);
for(const x of [-23,23]){
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.13,.2,18,8),mat(0x849087));pole.position.set(x,9,-14);scene.add(pole);
  const beam=new THREE.Mesh(new THREE.BoxGeometry(3,.38,.55),mat(0x9ca99c,.5));beam.position.set(x,18,-14);scene.add(beam);
  for(let j=0;j<7;j++){const lamp=new THREE.Mesh(new THREE.SphereGeometry(.12,8,6),new THREE.MeshBasicMaterial({color:0xfff0cc}));lamp.position.set(x-1.25+j*.42,18,-13.7);scene.add(lamp);}
}

// Test-match pitch and markings.
const pitch=new THREE.Mesh(new THREE.BoxGeometry(3.35,.13,29),mat(0x9e895f));pitch.position.set(0,.01,-.8);pitch.receiveShadow=true;scene.add(pitch);
const pitchTop=new THREE.Mesh(new THREE.BoxGeometry(2.85,.035,27.8),mat(0xb7a276));pitchTop.position.set(0,.095,-.8);pitchTop.receiveShadow=true;scene.add(pitchTop);
for(const z of [-10.2,8.6]){
  const crease=new THREE.Mesh(new THREE.BoxGeometry(3.2,.025,.11),mat(0xf0e7ce));crease.position.set(0,.125,z);scene.add(crease);
  for(const s of [-1,1]){const mark=new THREE.Mesh(new THREE.BoxGeometry(.09,.025,1.05),mat(0xf0e7ce));mark.position.set(s*1.72,.125,z+(z<0?-.47:.47));scene.add(mark);}
}
// Turf lines are very subtle, keeping the pitch readable.
for(let z=-12;z<12;z+=2.5){const line=new THREE.Mesh(new THREE.BoxGeometry(2.72,.008,.018),mat(0xcabc9a));line.position.set(0,.118,z);scene.add(line);}

const stumpMat=mat(0xf1dfae,.4), bailMat=mat(0xe4c77e,.45);
function addWicket(z){const g=new THREE.Group();for(let x of [-.24,0,.24]){const s=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.78,10),stumpMat);s.position.set(x,.51,0);s.castShadow=true;g.add(s);}for(let x of [-.12,.12]){const b=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.28,8),bailMat);b.rotation.z=Math.PI/2;b.position.set(x,.92,0);g.add(b);}g.position.set(0,.12,z);scene.add(g);return g;}
const nearWicket=addWicket(9.15);addWicket(-10.65);

function sphere(parent,r,material,pos){const m=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),material);m.position.set(...pos);m.castShadow=true;parent.add(m);return m;}
function limb(parent,a,b,r1,r2,material){const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=new THREE.Vector3().subVectors(bv,av);const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,d.length(),9),material);mesh.position.copy(av).add(bv).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());mesh.castShadow=true;parent.add(mesh);return mesh;}
function makePlayer({x,z,shirt,pants,helmet=false,batter=false,bowler=false}){
  const root=new THREE.Group();root.position.set(x,.13,z);scene.add(root);
  const shirtMat=mat(shirt,.67),pantsMat=mat(pants,.85),skin=mat(0xb98460,.9),shoe=mat(0x202923,.8);
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.36,.75,5,10),shirtMat);torso.position.y=1.35;torso.castShadow=true;root.add(torso);
  const head=sphere(root,.23,skin,[0,2.08,0]);
  if(helmet){const cap=new THREE.Mesh(new THREE.SphereGeometry(.27,12,8,0,Math.PI*2,0,Math.PI*.56),mat(0x263438,.35));cap.position.set(0,2.16,0);root.add(cap);const grille=new THREE.Mesh(new THREE.TorusGeometry(.23,.018,5,16,Math.PI),mat(0xaeb8a9));grille.position.set(0,2.02,.16);grille.rotation.x=Math.PI/2;root.add(grille);}
  // legs and shoes
  const legs=[];
  for(const side of [-1,1]){legs.push(limb(root,[side*.16,1.03,0],[side*.21,.22,.02],.14,.095,pantsMat));const foot=new THREE.Mesh(new THREE.BoxGeometry(.22,.13,.38),shoe);foot.position.set(side*.21,.12,.1);foot.castShadow=true;root.add(foot);}
  // Arms are separate swing pieces.
  const arms=[];
  for(const side of [-1,1]){const arm=new THREE.Group();arm.position.set(side*.31,1.69,0);root.add(arm);limb(arm,[0,0,0],[side*.16,-.48,.06],.105,.075,shirtMat);limb(arm,[side*.16,-.48,.06],[side*.08,-.83,.14],.072,.052,skin);sphere(arm,.075,skin,[side*.08,-.83,.14]);arms.push(arm);}
  let bat=null;
  if(batter){
    const padMat=mat(0xe8e5d8,.8);for(const s of [-1,1]){const pad=new THREE.Mesh(new THREE.BoxGeometry(.18,.58,.17),padMat);pad.position.set(s*.2,.58,.12);root.add(pad);}
    bat=new THREE.Group();bat.position.set(.2,1.0,.23);root.add(bat);
    const blade=new THREE.Mesh(new THREE.BoxGeometry(.19,.93,.12),mat(0xc6a873,.4));blade.position.set(0,-.31,0);blade.castShadow=true;bat.add(blade);
    const handle=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.39,8),mat(0x563a2d,.6));handle.position.set(0,.34,0);bat.add(handle);
    const grip=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.22,8),mat(0x353c3a,.7));grip.position.set(0,.59,0);bat.add(grip);
    bat.rotation.z=-.42;
  }
  return {root,head,torso,arms,legs,bat,batter,bowler,baseX:x,baseZ:z,shirtMat};
}
const batter=makePlayer({x:.68,z:8.45,shirt:0xe9e5d7,pants:0xe6e1d3,helmet:true,batter:true});
const bowler=makePlayer({x:-.65,z:-9.0,shirt:0x526d7a,pants:0x273b3a,bowler:true});
// Fielders around the ring, colored and posed as tiny but readable players.
const fielders=[];
for(let i=0;i<10;i++){const a=(i/10)*Math.PI*2+Math.PI/10;const r=13.2+(i%3)*1.5;const p=makePlayer({x:Math.cos(a)*r,z:Math.sin(a)*r-1,shirt:i%2?0xc2c5b7:0x71877b,pants:0x34473b});p.root.scale.setScalar(.72);fielders.push(p);}

const ballMat=mat(0x9d302d,.32,{metalness:.04});const ball=new THREE.Mesh(new THREE.SphereGeometry(.17,24,16),ballMat);ball.castShadow=true;scene.add(ball);
// Raised leather seam on the red cricket ball.
const seamMat=new THREE.MeshStandardMaterial({color:0xe7b2a1,roughness:.7});
for(let k=0;k<2;k++){const curve=new THREE.EllipseCurve(0,0,.115,.16,k*Math.PI,Math.PI+k*Math.PI,false,0);const pts=curve.getPoints(32).map(p=>new THREE.Vector3(p.x,p.y,0));const seam=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),32,.008,5,false),seamMat);seam.rotation.y=.72;seam.rotation.x=.64+k*.35;ball.add(seam);}
ball.visible=false;

// Simple elegant boundary markers and a few sight-screen details.
for(let i=0;i<24;i++){const a=i/24*Math.PI*2;const post=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,.56,6),mat(i%2?0xe5e0cd:0xb9a777));post.position.set(Math.cos(a)*42.75,.22,Math.sin(a)*42.75);scene.add(post);}

const challengeList=[
  {name:'BOUNDARY HUNT',text:'Hit 2 boundaries this over',goal:2,kind:'boundaries'},
  {name:'RUN RATE',text:'Score 8 runs this over',goal:8,kind:'runs'},
  {name:'PURE TIMING',text:'Middle 2 deliveries this over',goal:2,kind:'timing'}
];
const deliveryTypes=[
  {name:'GOOD LENGTH',hint:'WATCH THE BALL',duration:2.5,speed:138,bounce:.75,width:.66,swerve:0},
  {name:'LATE SWING',hint:'WATCH FOR SWING',duration:2.55,speed:132,bounce:.78,width:.59,swerve:.62},
  {name:'YORKER',hint:'DIG OUT THE YORKER',duration:2.34,speed:146,bounce:.38,width:.54,swerve:.08},
  {name:'BOUNCER',hint:'GET ON TOP OF IT',duration:2.62,speed:141,bounce:1.55,width:.57,swerve:0},
  {name:'SLOWER BALL',hint:'WAIT ON IT',duration:2.82,speed:112,bounce:.66,width:.7,swerve:-.12},
  {name:'LATE SWING',hint:'WATCH FOR SWING',duration:2.55,speed:134,bounce:.78,width:.59,swerve:-.62}
];
const state={started:false,phase:'idle',shot:'drive',score:0,wickets:0,balls:0,overRuns:0,overBalls:0,playerRuns:0,playerBalls:0,bowlerRuns:0,bowlerWickets:0,delivery:null,ballResult:null,battingFirst:'J. HAYES',striker:'J. HAYES',partner:'M. CARTER',sound:true,lastTime:0,challenge:null,challengeIndex:0,challengesWon:0};
const $=s=>document.querySelector(s);
function ui(){
  $('#score').textContent=state.score;$('#wickets').textContent=state.wickets;$('#overs').textContent=`${Math.floor(state.balls/6)}.${state.balls%6}`;
  $('#crr').textContent=state.balls?(state.score/(state.balls/6)).toFixed(2):'0.00';$('#need').textContent=Math.max(0,36-state.score);
  $('#batterRuns').textContent=state.playerRuns;$('#batterBalls').textContent=`(${state.playerBalls})`;
  $('#bowlerWickets').textContent=state.bowlerWickets;$('#bowlerRuns').textContent=state.bowlerRuns;$('#bowlerOvers').textContent=`${Math.floor(state.balls/6)}.${state.balls%6}`;
  document.querySelector('.facing').textContent=state.striker;
  $('#overSummary').textContent=`${state.overRuns} run${state.overRuns===1?'':'s'}`;
  if(state.challenge){$('#challengeName').textContent=state.challenge.name;$('#challengeText').textContent=state.challenge.done?'CHALLENGE COMPLETE':state.challenge.text;$('#challengeProgress').textContent=`${Math.min(state.challenge.progress,state.challenge.goal)} / ${state.challenge.goal}`;$('#challengeMeter').style.width=`${Math.min(100,state.challenge.progress/state.challenge.goal*100)}%`;$('#challengePanel').classList.toggle('completed',state.challenge.done);}
}
function setChallenge(index){const challenge=challengeList[index%challengeList.length];state.challengeIndex=index;state.challenge={...challenge,progress:0,done:false};ui();}
function updateChallenge(result,d){if(!state.challenge||state.challenge.done)return;const runs=Number(result)||0;if(state.challenge.kind==='boundaries'&&(runs===4||runs===6))state.challenge.progress++;if(state.challenge.kind==='runs')state.challenge.progress+=runs;if(state.challenge.kind==='timing'&&d.hit&&d.quality>.78)state.challenge.progress++;if(state.challenge.progress>=state.challenge.goal){state.challenge.done=true;state.challengesWon++;toast('CHALLENGE COMPLETE!');soundHit(280);}ui();}
function setCallout(text,show=true){$('#calloutText').textContent=text;$('#deliveryCallout').classList.toggle('visible',show);}
let toastTimer;
function toast(text){$('#toastText').textContent=text;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),1050);}
function soundHit(freq=150){if(!state.sound)return;try{const ctx=new AudioContext(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='triangle';osc.frequency.setValueAtTime(freq,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(54,ctx.currentTime+.12);gain.gain.setValueAtTime(.07,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.16);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.17);osc.onended=()=>ctx.close();}catch{}}
function setShot(name){if(state.phase==='finished')return;state.shot=name;document.querySelectorAll('.shot-btn').forEach(b=>b.classList.toggle('active',b.dataset.shot===name));}
function startMatch(){state.started=true;state.phase='ready';setChallenge(0);$('#startOverlay').classList.add('hidden');setCallout('A. PATEL · RIGHT ARM OVER',true);setTimeout(()=>{if(state.phase==='ready')beginDelivery();},900);}
function beginDelivery(){if(state.phase==='finished')return;const type=deliveryTypes[state.balls%deliveryTypes.length];state.phase='delivery';state.delivery={...type,t:0,hit:false,shot:null,quality:0,startX:(Math.random()-.5)*.24,endX:(Math.random()-.5)*.2};$('#speed').textContent=type.speed;ball.visible=true;ball.position.set(state.delivery.startX,2.2,-10.4);setCallout(type.name+' · '+type.hint,true);bowler.root.rotation.x=-.1;}
function hitShot(){
  if(state.phase!=='delivery'||state.delivery.hit)return;
  const d=state.delivery,t=d.t;d.hit=true;d.shot=state.shot;
  const window=Math.max(0,1-Math.abs(t-d.duration*.9)/d.width);d.quality=window;
  batter.bat.rotation.z=-2.25;batter.root.rotation.y=-.27;
  const shot=state.shot;
  let result;
  if(shot==='defend'){
    result=window>.18?(window>.69?(Math.random()<.78?0:1):Math.random()<.75?0:1):(Math.random()<.18?'W':0);
  }else if(shot==='drive'){
    if(window>.78)result=Math.random()<.62?4:(Math.random()<.65?2:1);
    else if(window>.48)result=Math.random()<.52?2:(Math.random()<.5?4:1);
    else if(window>.2)result=Math.random()<.52?1:(Math.random()<.58?2:0);
    else result=Math.random()<.33?'W':0;
  }else{
    if(window>.8)result=Math.random()<.55?6:(Math.random()<.75?4:2);
    else if(window>.52)result=Math.random()<.38?6:(Math.random()<.62?4:(Math.random()<.5?2:1));
    else if(window>.24)result=Math.random()<.3?'W':(Math.random()<.58?2:0);
    else result=Math.random()<.56?'W':0;
  }
  d.result=result;d.flight=0;d.startBall=ball.position.clone();
  if(result==='W'){ball.position.x=.2;toast('BEATEN!');soundHit(82);}
  else {toast(window>.78?'MIDDLE OF THE BAT':window>.47?'NICELY TIMED':'NOT QUITE');soundHit(shot==='loft'?220:155);}
  setCallout(result==='W'?'THE STUMPS ARE IN DANGER':(result===6?'UP, UP AND AWAY':result===4?'THAT RACES AWAY':'IN THE GAPS'),true);
}
function resolveBall(){
  const d=state.delivery;let result=d.hit?d.result:(Math.random()<.27?'W':0);
  if(!d.hit){setCallout(result==='W'?'BOWLED HIM!':'BEATEN ALL ENDS UP',true);if(result==='W')toast('BOWLED!');else toast('DOT BALL');}
  if(result==='W'){
    state.wickets++;state.bowlerWickets++;state.playerBalls++;
    if(state.wickets<3){state.striker=state.wickets===1?'M. CARTER':'R. WILSON';state.playerRuns=0;state.playerBalls=0;}
    nearWicket.rotation.z=(Math.random()-.5)*.5;
  }else{
    const runs=Number(result)||0;state.score+=runs;state.overRuns+=runs;state.bowlerRuns+=runs;state.playerRuns+=runs;state.playerBalls++;
    if(runs%2===1){const temp=state.striker;state.striker=state.partner;state.partner=temp;}
  }
  updateChallenge(result,d);
  state.balls++;state.overBalls++;
  addBallMark(result);
  ui();ball.visible=false;
  if(state.score>=36||state.wickets>=3||state.balls>=12){finishMatch();return;}
  state.phase='between';setCallout(result===6?'SIX!':result===4?'FOUR!':result==='W'?'NEW BATTER':result?'WELL RUN':'DOT BALL',true);
  if(state.overBalls===6){state.overBalls=0;state.overRuns=0;document.querySelectorAll('#ballTrack i').forEach(el=>{el.className='empty-ball';el.textContent='';});if(!state.challenge.done){$('#challengeText').textContent='CHALLENGE MISSED';toast('CHALLENGE MISSED');}setTimeout(()=>{if(state.phase==='between'){setChallenge(Math.floor(state.balls/6));setCallout('END OF OVER · NEW CHALLENGE',true);}},700);}
  setTimeout(()=>{if(state.phase==='between')beginDelivery();},1350);
}
function addBallMark(result){const marks=document.querySelectorAll('#ballTrack i');const idx=state.overBalls;const el=marks[idx];if(!el)return;el.className='';if(result==='W'){el.classList.add('ball-wicket');el.textContent='W';}else if(result===6){el.classList.add('ball-six');el.textContent='6';}else if(result===4){el.classList.add('ball-four');el.textContent='4';}else if(Number(result)>0){el.classList.add('ball-run');el.textContent=String(result);}else{el.classList.add('ball-dot');el.textContent='·';}}
function finishMatch(){state.phase='finished';ball.visible=false;setCallout('',false);const won=state.score>=36;$('#resultTitle').textContent=won?'A glorious finish.':state.wickets>=3?'A hard-fought innings.':'Stumps for today.';$('#resultMessage').textContent=(won?'You chased down the target with time to spare. The dressing room is waiting.':`You made ${state.score} runs in a patient ${Math.floor(state.balls/6)}-over innings. The next session awaits.`)+` Challenge objectives completed: ${state.challengesWon}.`;$('#finalScore').textContent=`${state.score}/${state.wickets}`;$('#resultOverlay').classList.remove('hidden');}
function resetMatch(){Object.assign(state,{started:false,phase:'idle',shot:'drive',score:0,wickets:0,balls:0,overRuns:0,overBalls:0,playerRuns:0,playerBalls:0,bowlerRuns:0,bowlerWickets:0,striker:'J. HAYES',partner:'M. CARTER',delivery:null,challengesWon:0});nearWicket.rotation.set(0,0,0);ball.visible=false;document.querySelectorAll('#ballTrack i').forEach(el=>{el.className='empty-ball';el.textContent='';});$('#resultOverlay').classList.add('hidden');$('#startOverlay').classList.remove('hidden');setChallenge(0);ui();setShot('drive');$('#speed').textContent='—';setCallout('READY WHEN YOU ARE',false);}
$('#startBtn').addEventListener('click',startMatch);$('#playAgainBtn').addEventListener('click',resetMatch);$('#resetBtn').addEventListener('click',resetMatch);
$('#swingBtn').addEventListener('pointerdown',e=>{e.preventDefault();$('#swingBtn').classList.add('pressed');hitShot();});window.addEventListener('pointerup',()=>$('#swingBtn').classList.remove('pressed'));
document.querySelectorAll('.shot-btn').forEach(b=>b.addEventListener('click',()=>setShot(b.dataset.shot)));
$('#soundBtn').addEventListener('click',()=>{state.sound=!state.sound;$('#soundIcon').textContent=state.sound?'♫':'♪';$('#soundBtn').style.opacity=state.sound?'1':'.55';});
window.addEventListener('keydown',e=>{if(e.repeat)return;const key=e.key.toLowerCase();if(key==='a')setShot('drive');if(key==='s')setShot('loft');if(key==='d')setShot('defend');if(key===' '){e.preventDefault();if(!state.started&&state.phase==='idle')startMatch();else hitShot();}if(key==='r'&&state.phase==='finished')resetMatch();});
ui();

const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);const time=clock.elapsedTime;
  // Small human movements keep the ground alive between deliveries.
  batter.root.position.x=.68+Math.sin(time*1.2)*.025;
  batter.root.rotation.y*=.94;
  if(batter.bat&&state.phase!=='delivery'&&Math.abs(batter.bat.rotation.z+.42)>.025)batter.bat.rotation.z+=( -.42-batter.bat.rotation.z)*Math.min(1,dt*5);
  bowler.root.rotation.x*=.9;
  fielders.forEach((f,i)=>{f.root.rotation.y=Math.sin(time*.7+i)*.06;});
  if(state.phase==='delivery'&&state.delivery){const d=state.delivery;d.t+=dt;const p=Math.min(1,d.t/d.duration);
    if(!d.hit){const landing=d.name==='BOUNCER' ? 0.58 : 0.66;const bounceT=Math.max(0,(p-landing)/(1-landing));let y=p<landing?2.2-1.35*(p/landing):.27+Math.sin(bounceT*Math.PI*.72)*d.bounce;const z=-10.4+19.2*p;ball.position.set(d.startX+Math.sin(p*5)*.11+d.swerve*Math.sin(p*Math.PI)*.34,y,z);ball.rotation.x+=dt*8;ball.rotation.z+=dt*5;if(p>.58)setCallout('PLAY YOUR SHOT',true);}
    else {d.flight+=dt;const u=Math.min(d.flight/1.05,1);const result=d.result;let targetX=0,targetZ=17,targetY=.17;if(result==='W'){targetX=.15;targetZ=9.15;targetY=.25;}else{targetX=(Math.random()-.5)*0;targetZ=result===6?-1:(result===4?15:13);if(d.flight<.06){d.targetX=(Math.random()-.5)*(result===6?8:5);d.targetZ=result===6?-4:(result===4?18:14);}targetX=d.targetX;targetZ=d.targetZ;targetY=result===6?6.7:Math.max(.22,2.8*Math.sin(Math.PI*u));}
      ball.position.set(THREE.MathUtils.lerp(d.startBall.x,targetX,u),THREE.MathUtils.lerp(d.startBall.y,targetY,u)+Math.sin(Math.PI*u)*(result===6?2.2:.3),THREE.MathUtils.lerp(d.startBall.z,targetZ,u));ball.rotation.x+=dt*15;ball.rotation.z+=dt*12;
      if(d.flight>1.18){state.phase='resolve';resolveBall();}
    }
    if(!d.hit&&d.t>=d.duration){state.phase='resolve';resolveBall();}
  }
  // Gentle camera drift, framed for batting on desktop and phone.
  camera.position.x=Math.sin(time*.12)*.17;camera.lookAt(0,2.8,-1.5);
  renderer.render(scene,camera);
}
animate();
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<560?48:43;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));});
