function drawLimb(x1,y1,x2,y2,color,width){ctx.strokeStyle='#070a09';ctx.lineWidth=width+5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function drawFighter(f,cameraX){
  const s=f.getStyle(),x=f.x-cameraX,y=f.y-f.z;let scale=(f.scale||1)*1.18;if(s.huge)scale*=1.08;if(f.dead)scale*=.98;
  ctx.save();ctx.globalAlpha=f.alpha*(f.inv>0&&f.inv%6<3?.65:1);ctx.translate(x,y);ctx.scale(f.face*scale,scale);
  ctx.fillStyle='rgba(0,0,0,.36)';ctx.beginPath();ctx.ellipse(0,f.z/scale+4,31,9,0,0,Math.PI*2);ctx.fill();
  if(s.aura||f.specialAura>0){const c=s.aura||'#66f5c3';ctx.save();ctx.globalAlpha=.11+.04*Math.sin(Game.time*.15);ctx.shadowBlur=24;ctx.shadowColor=c;ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(0,-56,39,70,0,0,Math.PI*2);ctx.fill();ctx.restore()}
  if(f.flash>0)ctx.globalAlpha*=.45;
  const walk=f.state==='walk'?Math.sin(Game.time*.36)*10:0;const attack=f.attack||null;let armFront=0,armBack=0,lean=0,kick=0;
  if(attack){const t=clamp(attack.frame/Math.max(1,attack.duration),0,1);const punch=Math.sin(Math.PI*clamp(t*1.5,0,1));armFront=attack.kind==='special'?38*punch:attack.kind==='heavy'?48*punch:attack.kind==='throw'?25*punch:36*punch;lean=10*punch;if(attack.kind==='air'||attack.kind==='dash')kick=28*punch}
  if(f.state==='attack'&&!attack){armFront=28;lean=6}
  const torsoY=-65;
  drawLimb(-9,torsoY+38,-12-walk*.35,-15,s.pants,11);drawLimb(-12-walk*.35,-15,-18-walk*.25,1,s.pants,10);
  if(s.cloak){ctx.fillStyle=s.body;ctx.strokeStyle='#070a09';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-19,torsoY-7);ctx.lineTo(22,torsoY-5);ctx.lineTo(31,torsoY+49);ctx.lineTo(2,torsoY+57);ctx.lineTo(-29,torsoY+45);ctx.closePath();ctx.fill();ctx.stroke()}
  drawLimb(-15,torsoY+6,-27-armBack,torsoY+31,s.skin,10);
  ctx.fillStyle=s.body;ctx.strokeStyle='#070a09';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-19+lean*.1,torsoY-10);ctx.lineTo(18+lean*.1,torsoY-8);ctx.lineTo(22+lean*.3,torsoY+37);ctx.lineTo(-18+lean*.2,torsoY+38);ctx.closePath();ctx.fill();ctx.stroke();
  if(s.armor||s.jersey){ctx.fillStyle=s.accent;ctx.globalAlpha*=.88;ctx.fillRect(-14+lean*.2,torsoY-3,28,25);ctx.globalAlpha=f.alpha*(f.inv>0&&f.inv%6<3?.65:1)*(f.flash>0?.45:1)}
  if(s.stone){ctx.strokeStyle='#788185';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-18,torsoY+5);ctx.lineTo(18,torsoY+26);ctx.moveTo(15,torsoY+2);ctx.lineTo(-12,torsoY+31);ctx.stroke()}
  drawLimb(9,torsoY+38,12+walk*.35+kick,-15-kick*.15,s.pants,11);drawLimb(12+walk*.35+kick,-15-kick*.15,19+walk*.25+kick*1.15,1-kick*.2,s.pants,10);
  if(s.wolf){ctx.fillStyle='#2d3438';ctx.strokeStyle='#070a09';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(1+lean*.3,torsoY-26,15,18,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-9,torsoY-38);ctx.lineTo(-4,torsoY-54);ctx.lineTo(2,torsoY-39);ctx.moveTo(8,torsoY-39);ctx.lineTo(14,torsoY-53);ctx.lineTo(16,torsoY-36);ctx.fill();ctx.fillStyle='#d2e5dc';ctx.fillRect(8,torsoY-27,10,4)}
  else{ctx.fillStyle=s.skin;ctx.strokeStyle='#070a09';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(1+lean*.28,torsoY-27,14,17,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=s.hair;ctx.beginPath();ctx.arc(1+lean*.28,torsoY-31,14,Math.PI,Math.PI*2);ctx.fill();if(s.whiteHair){ctx.fillStyle='#dfe3ed';for(let i=-10;i<=10;i+=5){ctx.beginPath();ctx.moveTo(i,torsoY-40);ctx.lineTo(i+5,torsoY-55-Math.abs(i)*.3);ctx.lineTo(i+9,torsoY-39);ctx.fill()}}}
  if(s.headband){ctx.fillStyle=s.accent;ctx.fillRect(-13+lean*.28,torsoY-34,27,6);ctx.fillStyle='#9aa3a1';ctx.fillRect(-5+lean*.28,torsoY-35,11,7)}
  if(s.mask){ctx.fillStyle='#e8ecea';ctx.strokeStyle='#1c2120';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(2+lean*.28,torsoY-25,12,13,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=s.accent;ctx.fillRect(-4+lean*.28,torsoY-28,4,3);ctx.fillRect(6+lean*.28,torsoY-28,4,3)}
  if(s.maskMouth){ctx.fillStyle='#536065';ctx.fillRect(-11+lean*.28,torsoY-24,23,10)}
  if(s.glasses){ctx.strokeStyle='#161b19';ctx.lineWidth=2;ctx.strokeRect(-10+lean*.28,torsoY-31,9,7);ctx.strokeRect(3+lean*.28,torsoY-31,9,7);ctx.beginPath();ctx.moveTo(-1+lean*.28,torsoY-28);ctx.lineTo(3+lean*.28,torsoY-28);ctx.stroke()}
  if(s.crown){ctx.strokeStyle=s.accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-10,torsoY-42);ctx.lineTo(-6,torsoY-55);ctx.lineTo(0,torsoY-44);ctx.lineTo(6,torsoY-57);ctx.lineTo(11,torsoY-42);ctx.stroke()}
  if(s.hood){ctx.strokeStyle=s.accent;ctx.lineWidth=4;ctx.beginPath();ctx.arc(1,torsoY-28,19,3.3,6.05);ctx.stroke()}
  const handX=19+armFront,handY=torsoY+11-armFront*.12;drawLimb(15,torsoY+5,handX,handY,s.skin,10);
  if(s.weapon==='kunai'||s.weapon==='blade'){ctx.save();ctx.translate(handX+5,handY);ctx.rotate(-.25);ctx.fillStyle='#c8d1cf';ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(20,-4);ctx.lineTo(13,5);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
  if(s.ring){ctx.strokeStyle=s.accent;ctx.lineWidth=3;ctx.beginPath();ctx.arc(handX+2,handY,5,0,Math.PI*2);ctx.stroke()}
  if(s.shield){ctx.fillStyle='#3ff0a399';ctx.strokeStyle='#74ffd0';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(-26,torsoY+15,8,24,0,0,Math.PI*2);ctx.fill();ctx.stroke()}
  if(s.basketball){ctx.fillStyle='#a85a1c';ctx.strokeStyle='#26170e';ctx.lineWidth=2;ctx.beginPath();ctx.arc(handX+11,handY-8,10,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(handX+11,handY-8,7,-1.4,1.4);ctx.stroke()}
  ctx.restore();
}
function drawHazard(h,cameraX){const x=h.x-cameraX,y=h.y;ctx.save();const pulse=.35+.25*Math.sin(Game.time*.3);ctx.globalAlpha=clamp(h.t/18,0,1);ctx.strokeStyle=h.color;ctx.fillStyle=h.color+'22';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,h.r,h.r*.45,0,0,Math.PI*2);ctx.fill();ctx.stroke();if(h.t<14){ctx.globalAlpha=.5;ctx.fillStyle=h.color;ctx.beginPath();ctx.arc(x,y-30,h.r*.45,0,Math.PI*2);ctx.fill()}ctx.restore()}
function drawProgress(cameraX){if(!Game.level||Game.mode==='survival')return;ctx.save();ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(290,690,700,5);ctx.fillStyle='#55f5be';ctx.fillRect(290,690,700*clamp(Game.player.x/Game.level.length,0,1),5);ctx.restore()}
function drawBackground(palette,cameraX){
  const configs={ninja:{sky:'#07111c',far:'#0b1622',mid:'#111b25',ground:'#182029',accent:'#52d5c1'},emerald:{sky:'#030b08',far:'#071b14',mid:'#0b261b',ground:'#101b16',accent:'#46f5a8'},street:{sky:'#0b0e18',far:'#121724',mid:'#181d28',ground:'#22242a',accent:'#3576bf'},rift:{sky:'#100817',far:'#1b0d24',mid:'#22122d',ground:'#1d1821',accent:'#9e4ad4'},survival:{sky:'#07100d',far:'#0b1a15',mid:'#10251d',ground:'#151d19',accent:'#54e5ae'}};const c=configs[palette]||configs.ninja;const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,c.sky);g.addColorStop(.58,c.mid);g.addColorStop(.59,c.ground);g.addColorStop(1,'#0b0e0d');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const par=cameraX*.18;
  if(palette==='ninja'){
    ctx.save();ctx.fillStyle='#d6e8e6';ctx.globalAlpha=.45;ctx.beginPath();ctx.arc(1040-par*.03,125,75,0,Math.PI*2);ctx.fill();ctx.fillStyle=c.sky;ctx.beginPath();ctx.arc(1070-par*.03,105,70,0,Math.PI*2);ctx.fill();ctx.restore();
    ctx.fillStyle=c.far;for(let i=-2;i<10;i++){const x=i*240-(par%240);ctx.beginPath();ctx.moveTo(x,420);ctx.lineTo(x+120,250+(i%2)*40);ctx.lineTo(x+260,420);ctx.fill()}
    ctx.fillStyle='#0d151d';for(let i=-2;i<12;i++){const x=i*160-((cameraX*.45)%160);const h=100+(i%3)*35;ctx.fillRect(x,420-h,130,h);ctx.beginPath();ctx.moveTo(x-18,420-h);ctx.lineTo(x+65,420-h-32);ctx.lineTo(x+150,420-h);ctx.fill();ctx.fillStyle='rgba(82,213,193,.08)';for(let yy=420-h+28;yy<400;yy+=28)ctx.fillRect(x+25,yy,9,11);ctx.fillStyle='#0d151d'}
  }else if(palette==='emerald'){
    for(let i=0;i<18;i++){const x=(i*113-cameraX*.22)%(W+180)-90,y=80+(i*71)%300;ctx.strokeStyle=c.accent+'33';ctx.lineWidth=2;ctx.strokeRect(x,y,35+(i%4)*20,20+(i%3)*25)}ctx.strokeStyle=c.accent+'55';ctx.lineWidth=3;for(let i=-2;i<9;i++){const x=i*200-((cameraX*.38)%200);ctx.beginPath();ctx.moveTo(x,420);ctx.lineTo(x+70,180);ctx.lineTo(x+125,420);ctx.stroke()}
  }else if(palette==='street'){
    ctx.fillStyle=c.far;for(let i=-2;i<12;i++){const x=i*180-((cameraX*.32)%180);const h=100+(i%4)*42;ctx.fillRect(x,420-h,155,h);ctx.fillStyle='#d9a94a22';for(let y=420-h+25;y<405;y+=26)for(let xx=x+20;xx<x+140;xx+=35)if((xx+y+i)%3)ctx.fillRect(xx,y,10,13);ctx.fillStyle=c.far}ctx.fillStyle='#2c3035';ctx.fillRect(0,385,W,35);ctx.fillStyle='#3f4650';for(let i=0;i<9;i++)ctx.fillRect(i*170-(cameraX*.65%170),400,100,3);
  }else{
    ctx.strokeStyle=c.accent+'44';for(let r=80;r<430;r+=70){ctx.beginPath();ctx.arc(W/2-(cameraX*.12%120),250,r,0,Math.PI*2);ctx.stroke()}ctx.fillStyle=c.far;for(let i=-2;i<10;i++){const x=i*190-((cameraX*.25)%190);ctx.beginPath();ctx.moveTo(x,420);ctx.lineTo(x+95,240+(i%3)*25);ctx.lineTo(x+190,420);ctx.fill()}
  }
  ctx.fillStyle=c.ground;ctx.fillRect(0,420,W,300);ctx.strokeStyle=c.accent+'13';ctx.lineWidth=1;for(let y=455;y<720;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}for(let x=-500;x<1800;x+=170){ctx.beginPath();ctx.moveTo(W*.5,420);ctx.lineTo(x-(cameraX*.12%170),720);ctx.stroke()}
  const worldStart=Math.floor(cameraX/500)*500;for(let wx=worldStart-500;wx<cameraX+W+500;wx+=500){const sx=wx-cameraX;if(palette==='street'){ctx.fillStyle='#111';ctx.fillRect(sx+70,350,6,105);ctx.fillStyle=c.accent+'55';ctx.fillRect(sx+76,358,55,30)}else if(palette==='ninja'){ctx.fillStyle='#162b28';ctx.fillRect(sx+85,365,5,90);ctx.fillStyle='#1d4b43';ctx.fillRect(sx+90,372,24,42)}else if(palette==='emerald'){ctx.strokeStyle=c.accent+'55';ctx.lineWidth=4;ctx.strokeRect(sx+70,350,75,75)}else{ctx.strokeStyle=c.accent+'44';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(sx+90,340);ctx.lineTo(sx+130,420);ctx.lineTo(sx+50,420);ctx.closePath();ctx.stroke()}}
}
function drawMenuCanvas(){ctx.fillStyle='#050807';ctx.fillRect(0,0,W,H);ctx.fillStyle='#0c1914';for(let i=0;i<30;i++){ctx.globalAlpha=.3;ctx.fillRect((i*97+Game.time*.2)%W,(i*53)%H,2,2)}ctx.globalAlpha=1}
