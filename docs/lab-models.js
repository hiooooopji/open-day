'use strict';
// Pure simulation models shared by the browser and mathematical checks.
(() => {
  class Qubit {
    constructor(){this.reset();}
    reset(){this.a=1;this.b=0;this.history=[];}
    gate(name){
      const {a,b}=this;
      if(name==='H'){this.a=(a+b)/Math.SQRT2;this.b=(a-b)/Math.SQRT2;}
      else if(name==='X'){this.a=b;this.b=a;}
      else if(name==='Z'){this.b=-b;}
      else throw new Error('Unknown gate');
      const norm=Math.hypot(this.a,this.b);this.a/=norm;this.b/=norm;
      if(Math.abs(this.a)<1e-12)this.a=0;if(Math.abs(this.b)<1e-12)this.b=0;
      this.history.push(name);
    }
    get probabilities(){return [this.a*this.a,this.b*this.b];}
    measure(random=Math.random){
      const result=random()<this.probabilities[0]?0:1;
      this.a=result===0?1:0;this.b=result===1?1:0;this.history.push('M'+result);return result;
    }
    sample(count=100,random=Math.random){return Array.from({length:count},()=>random()<this.probabilities[0]?0:1);}
  }
  class RobotWorld {
    constructor(){this.width=12;this.height=8;this.reset();}
    reset(){
      this.position=73;this.goal=22;this.steps=0;this.replans=0;this.visited=new Set([73]);
      this.walls=new Set([15,27,39,51,63,32,44,56,68,80,77,78]);
      this.known=new Set();this.sensed=new Set();this.path=[];this.state='ready';this.sense();this.plan();
    }
    neighbors(cell){const x=cell%this.width,y=Math.floor(cell/this.width);return [[x+1,y],[x,y-1],[x,y+1],[x-1,y]].filter(([a,b])=>a>=0&&a<this.width&&b>=0&&b<this.height).map(([a,b])=>b*this.width+a);}
    sense(){
      this.sensed.clear();let changed=false;
      for(let cell=0;cell<this.width*this.height;cell++){
        const d=Math.abs(cell%this.width-this.position%this.width)+Math.abs(Math.floor(cell/this.width)-Math.floor(this.position/this.width));
        if(d>2)continue;this.sensed.add(cell);
        if(this.walls.has(cell)&&!this.known.has(cell)){this.known.add(cell);changed=true;}
        if(!this.walls.has(cell)&&this.known.has(cell)){this.known.delete(cell);changed=true;}
      }return changed;
    }
    plan(){
      const queue=[this.position],parent=new Map([[this.position,null]]);
      for(let i=0;i<queue.length;i++){
        const current=queue[i];if(current===this.goal)break;
        for(const next of this.neighbors(current))if(!this.known.has(next)&&!parent.has(next)){parent.set(next,current);queue.push(next);}
      }
      const route=[];
      if(parent.has(this.goal)){let cell=this.goal;while(cell!==null){route.unshift(cell);cell=parent.get(cell);}}
      if(this.path.length&&this.path.join(',')!==route.join(','))this.replans++;
      this.path=route;return route;
    }
    step(){
      if(this.position===this.goal){this.state='arrived';return {state:this.state,discovered:false};}
      const discovered=this.sense();this.plan();
      if(this.path.length<2){this.state='blocked';return {state:this.state,discovered};}
      const next=this.path[1];
      if(this.walls.has(next)){this.known.add(next);this.plan();this.state='replanning';return {state:this.state,discovered:true};}
      this.position=next;this.path.shift();this.steps++;this.visited.add(next);this.sense();this.plan();
      this.state=next===this.goal?'arrived':'moving';return {state:this.state,discovered};
    }
    toggleWall(cell){if(cell===this.position||cell===this.goal)return false;if(this.walls.has(cell))this.walls.delete(cell);else this.walls.add(cell);return true;}
    setGoal(cell){if(this.walls.has(cell))return false;this.goal=cell;this.state='ready';this.plan();return true;}
    clearWalls(){this.walls.clear();this.known.clear();this.state='ready';this.sense();this.plan();}
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={Qubit,RobotWorld};
  else window.LabModels={Qubit,RobotWorld};
})();
