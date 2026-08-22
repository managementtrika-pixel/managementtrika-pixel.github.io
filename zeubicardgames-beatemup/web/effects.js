class Particle{
  constructor(x,y,z,color,power=1){this.x=x;this.y=y;this.z=z;this.vx=rand(-4,4)*power;this.vy=rand(-2,2)*power;this.vz=rand(1,7)*power;this.life=rand(18,36);this.max=this.life;this.r=rand(2,5)*power;this.color=color}
  update(){this.x+=this.vx;this.y+=this.vy;this.z+=this.vz;this.vz-=.45;this.vx*=.96;this.life--}
  draw(cameraX){const sx=this.x-cameraX,sy=this.y-this.z;ctx.save();ctx.globalAlpha=clamp(this.life/this.max,0,1);ctx.fillStyle=this.color;ctx.beginPath();ctx.arc(sx,sy,this.r,0,Math.PI*2);ctx.fill();ctx.restore()}
}
class FloatText{
  constructor(x,y,z,text,color='#fff',size=18){Object.assign(this,{x,y,z,text,color,size,life:50,max:50})}
  update(){this.z+=.7;this.life--}
  draw(cameraX){ctx.save();ctx.globalAlpha=clamp(this.life/16,0,1);ctx.fillStyle=this.color;ctx.font=`900 ${this.size}px system-ui`;ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=4;ctx.fillText(this.text,this.x-cameraX,this.y-this.z);ctx.restore()}
}
class Projectile{
  constructor(owner,x,y,z,vx,vy,opts={}){Object.assign(this,{owner,x,y,z,vx,vy,life:opts.life||90,damage:opts.damage||10,r:opts.r||16,color:opts.color||'#55f5be',kind:opts.kind||'orb',pierce:opts.pierce||false,hit:new Set()})}
  update(){this.x+=this.vx;this.y+=this.vy;this.life--;const targets=this.owner==='player'?Game.enemies:[Game.player];for(const t of targets){if(!t||t.dead||this.hit.has(t))continue;if(Math.abs(this.x-t.x)<this.r+t.radius&&Math.abs(this.y-t.y)<34&&Math.abs(this.z-t.z)<55){this.hit.add(t);t.takeHit(this.damage,Math.sign(this.vx)||1,{special:true,knockback:5});if(!this.pierce){this.life=0;break}}}}
  draw(cameraX){const sx=this.x-cameraX,sy=this.y-this.z;ctx.save();ctx.translate(sx,sy);ctx.globalAlpha=clamp(this.life/10,0,1);ctx.shadowColor=this.color;ctx.shadowBlur=18;ctx.strokeStyle=this.color;ctx.fillStyle=this.color+'55';if(this.kind==='slash'){ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,this.r,-1.1,1.1);ctx.stroke()}else if(this.kind==='ball'){ctx.beginPath();ctx.arc(0,0,this.r,0,Math.PI*2);ctx.fill();ctx.lineWidth=3;ctx.stroke()}else{ctx.lineWidth=4;for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(0,0,this.r*.45+i*6,Game.time*.18+i,Game.time*.18+i+4.5);ctx.stroke()}}ctx.restore()}
}
