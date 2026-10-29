const {test}=require('node:test');
const assert=require('node:assert/strict');
const {Qubit,RobotWorld}=require('../docs/lab-models.js');
const close=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-10,`${actual} != ${expected}`);

test('H mixes amplitudes; HH cancels and HZH flips the measured outcome',()=>{
  const q=new Qubit();q.gate('H');q.probabilities.forEach(p=>close(p,.5));
  q.gate('H');close(q.probabilities[0],1);close(q.probabilities[1],0);
  q.reset();'HZH'.split('').forEach(g=>q.gate(g));close(q.probabilities[1],1);
});
test('phase changes preserve probabilities and gate sequences preserve normalization',()=>{
  const q=new Qubit();q.gate('H');q.gate('Z');assert.ok(q.b<0);close(q.probabilities[1],.5);
  for(let i=0;i<1000;i++){q.gate(['H','X','Z'][i%3]);close(q.probabilities.reduce((a,b)=>a+b),1);}
});
test('measurement collapses the current state; repeated preparation sampling does not',()=>{
  const q=new Qubit();q.gate('H');const before=[q.a,q.b];let draw=0;
  const shots=q.sample(100,()=>draw++%2?.75:.25);
  assert.equal(shots.filter(s=>s===0).length,50);assert.deepEqual([q.a,q.b],before);
  assert.equal(q.measure(()=>.75),1);assert.equal(q.measure(()=>0),1);close(q.probabilities[1],1);
});
test('robot reaches the default destination without entering obstacles',()=>{
  const w=new RobotWorld();
  for(let step=0;step<300&&w.state!=='arrived';step++){w.step();assert.equal(w.walls.has(w.position),false);}
  assert.equal(w.state,'arrived');assert.equal(w.position,w.goal);assert.ok(w.replans>0);
});
test('a new obstacle is sensed before movement and causes a new route',()=>{
  const w=new RobotWorld();w.clearWalls();const obstacle=w.path[1];w.toggleWall(obstacle);
  assert.equal(w.known.has(obstacle),false);w.step();assert.equal(w.known.has(obstacle),true);
  assert.notEqual(w.position,obstacle);assert.ok(w.replans>0);
});
test('blocked robots stop safely and recover when walls are cleared',()=>{
  const w=new RobotWorld();w.clearWalls();const start=w.position;
  w.neighbors(start).forEach(cell=>w.toggleWall(cell));w.step();
  assert.equal(w.state,'blocked');assert.equal(w.position,start);assert.equal(w.steps,0);
  w.clearWalls();w.step();assert.notEqual(w.position,start);assert.equal(w.steps,1);
});
test('sensing is local; walls cannot overwrite the robot or its destination',()=>{
  const w=new RobotWorld();assert.equal(w.known.has(15),false);
  assert.equal(w.toggleWall(w.position),false);assert.equal(w.toggleWall(w.goal),false);
  assert.equal(w.setGoal(15),false);assert.equal(w.setGoal(0),true);
  for(let i=0;i<300&&w.state!=='arrived';i++)w.step();assert.equal(w.position,0);
});
