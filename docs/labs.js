'use strict';
window.FutureLabs=(() => {
  const $=selector=>document.querySelector(selector);
  const $$=selector=>[...document.querySelectorAll(selector)];
  const qubit=new LabModels.Qubit();
  const world=new LabModels.RobotWorld();
  let robotTimer=null,editMode='wall',focusCell=world.position;
  const amplitude=value=>(value<0?'−':'+')+Math.abs(value).toFixed(3);
  function renderQuantum(){
    const [p0,p1]=qubit.probabilities;
    $('#q-state').textContent=`${amplitude(qubit.a)} |0⟩ ${amplitude(qubit.b)} |1⟩`;
    $('#q-p0').textContent=`${Math.round(p0*100)}%`;$('#q-p1').textContent=`${Math.round(p1*100)}%`;
    $('#q-bar0').style.width=`${p0*100}%`;$('#q-bar1').style.width=`${p1*100}%`;
    const x=180+qubit.a*120,y=165-qubit.b*120;
    $('#q-vector').setAttribute('x2',x);$('#q-vector').setAttribute('y2',y);
    $('#q-tip').setAttribute('cx',x);$('#q-tip').setAttribute('cy',y);
    $('#q-projection').setAttribute('d',`M180 ${y}H${x}V165`);
    const shown=qubit.history.slice(-9);
    $('#q-circuit').innerHTML='<span class="circuit-start">|0⟩</span>'+(qubit.history.length>9?'<span>…</span>':'')+shown.map(g=>`<span class="gate-chip ${g.startsWith('M')?'measured':''}">${g.startsWith('M')?'M → '+g.slice(1):g}</span>`).join('');
    $('#q-circuit').setAttribute('aria-label','Circuit from zero: '+(qubit.history.join(', ')||'no gates'));
  }
  function clearSamples(){$('#q-samples').replaceChildren();$('#q-samples').setAttribute('aria-label','No measurements sampled');$('#q-sample-count').textContent='Measure once, or sample 100 identical preparations.';}
  function applyGate(gate){
    qubit.gate(gate);clearSamples();
    const [p0,p1]=qubit.probabilities;
    $('#q-insight').textContent=gate==='H'?(p0>.999?'The amplitudes interfered: the result is now certainly 0.':p1>.999?'The amplitudes interfered: the result is now certainly 1.':'H mixes amplitudes. A measurement now has two possible outcomes.'):
      gate==='Z'?'Z flips the sign of the |1⟩ amplitude. Probabilities stay the same—try H next.':'X exchanges the |0⟩ and |1⟩ amplitudes.';
    renderQuantum();
  }
  function resetQuantum(){qubit.reset();clearSamples();renderQuantum();$('#q-insight').textContent='Start with H. Then try H again—or Z followed by H.';}
  function measure(){const result=qubit.measure();clearSamples();renderQuantum();$('#q-insight').textContent=`Measured ${result}. The qubit is now |${result}⟩; measuring again gives the same result until you change it.`;}
  function sample(){
    const results=qubit.sample(100),zeros=results.filter(value=>value===0).length;
    $('#q-samples').innerHTML=results.map(value=>`<i class="shot shot-${value}"></i>`).join('');
    $('#q-samples').setAttribute('aria-label',`${zeros} zero outcomes and ${100-zeros} one outcomes`);
    $('#q-sample-count').textContent=`100 preparations: ${zeros} × 0 · ${100-zeros} × 1`;
    $('#q-insight').textContent='Each dot measures a fresh preparation of this state. Random counts approach the predicted probabilities over many trials.';
  }
  function renderRobot(){
    const route=new Set(world.path),sensor=world.sensed;
    $$('.robot-cell').forEach(cell=>{
      const index=Number(cell.dataset.cell),isRobot=index===world.position,isGoal=index===world.goal,wall=world.walls.has(index);
      cell.className='robot-cell'+(sensor.has(index)?' sensed':'')+(route.has(index)?' planned':'')+(world.visited.has(index)?' visited':'')+(wall?' wall':'')+(wall&&world.known.has(index)?' detected':'')+(isGoal?' goal':'')+(isRobot?' robot':'');
      cell.innerHTML=isRobot?'<span class="robot-body" aria-hidden="true"><i></i><i></i></span>':isGoal?'<span aria-hidden="true">◎</span>':wall?'<span aria-hidden="true"></span>':'';
      cell.setAttribute('aria-label',`Row ${Math.floor(index/world.width)+1}, column ${index%world.width+1}: ${isRobot?'robot':isGoal?'goal':wall?'obstacle'+(world.known.has(index)?', detected':', not detected'):'open'}`);
      cell.tabIndex=index===focusCell?0:-1;
    });
    $('#robot-steps').textContent=world.steps;$('#robot-replans').textContent=world.replans;
    $('#robot-distance').textContent=world.path.length?Math.max(0,world.path.length-1):'—';
    $('#robot-play').textContent=robotTimer?'Ⅱ Pause robot':world.state==='arrived'?'↺ Run again':'▷ Run robot';
    $('#robot-step').disabled=world.state==='arrived';
    $('#robot-grid').classList.toggle('is-running',Boolean(robotTimer));
  }
  function pause(){if(robotTimer){clearInterval(robotTimer);robotTimer=null;renderRobot();}}
  function robotStep(){
    const replans=world.replans;const outcome=world.step();
    $('#robot-insight').textContent=outcome.state==='arrived'?'Destination reached. Sensors, planning, and movement closed the loop.':
      outcome.state==='blocked'?'No route is available in the robot’s map. Remove an obstacle, then run again.':
      world.replans>replans?'An obstacle changed the route. The robot replanned before moving.':'Sense nearby cells → plan a route → move one cell. Unknown space is assumed open.';
    if(outcome.state==='arrived'||outcome.state==='blocked')pause();renderRobot();
  }
  function playRobot(){
    if(robotTimer){pause();return;}
    if(world.state==='arrived'){world.position=73;world.steps=0;world.replans=0;world.known.clear();world.visited=new Set([73]);world.path=[];world.state='ready';world.walls.delete(73);world.sense();world.plan();}
    robotTimer=setInterval(robotStep,400);renderRobot();
  }
  function resetRobot(){pause();world.reset();renderRobot();$('#robot-insight').textContent='Click cells to add walls. The robot only detects obstacles within two cells.';}
  function editCell(index){
    if(editMode==='goal'){
      if(world.walls.has(index)){$('#robot-insight').textContent='Choose an open cell for the goal.';return;}
      pause();world.setGoal(index);$('#robot-insight').textContent='New destination set. Run the robot to navigate there.';
    }else{
      if(!world.toggleWall(index))return;
      $('#robot-insight').textContent='The world changed. The robot will sense nearby changes on its next step.';
    }
    renderRobot();
  }
  function init(){
    $$('[data-gate]').forEach(button=>button.addEventListener('click',()=>applyGate(button.dataset.gate)));
    $$('[data-circuit]').forEach(button=>button.addEventListener('click',()=>{resetQuantum();[...button.dataset.circuit].forEach(applyGate);}));
    $('#q-reset').addEventListener('click',resetQuantum);$('#q-measure').addEventListener('click',measure);$('#q-sample').addEventListener('click',sample);
    const grid=$('#robot-grid');
    for(let index=0;index<world.width*world.height;index++){
      const cell=document.createElement('button');cell.type='button';cell.dataset.cell=index;cell.className='robot-cell';
      cell.addEventListener('click',()=>{focusCell=index;editCell(index);});grid.append(cell);
    }
    grid.addEventListener('keydown',event=>{
      const cell=event.target.closest('[data-cell]');if(!cell)return;
      const index=Number(cell.dataset.cell),x=index%world.width,y=Math.floor(index/world.width);
      const targets={ArrowLeft:y*world.width+Math.max(0,x-1),ArrowRight:y*world.width+Math.min(world.width-1,x+1),ArrowUp:Math.max(0,y-1)*world.width+x,ArrowDown:Math.min(world.height-1,y+1)*world.width+x};
      if(event.key in targets){event.preventDefault();event.stopPropagation();focusCell=targets[event.key];renderRobot();grid.querySelector(`[data-cell="${focusCell}"]`).focus();}
    });
    $$('[data-edit]').forEach(button=>button.addEventListener('click',()=>{editMode=button.dataset.edit;$$('[data-edit]').forEach(b=>{b.classList.toggle('selected',b===button);b.setAttribute('aria-pressed',String(b===button));});}));
    $('#robot-play').addEventListener('click',playRobot);$('#robot-step').addEventListener('click',()=>{pause();robotStep();});
    $('#robot-reset').addEventListener('click',resetRobot);
    $('#robot-clear').addEventListener('click',()=>{pause();world.clearWalls();renderRobot();$('#robot-insight').textContent='Walls cleared. Place new obstacles or run straight to the goal.';});
    $('#robot-block').addEventListener('click',()=>{
      const ahead=world.path.slice(1).find(cell=>cell!==world.goal&&!world.walls.has(cell));
      if(ahead===undefined){$('#robot-insight').textContent='There is no open route ahead to block.';return;}
      world.toggleWall(ahead);renderRobot();$('#robot-insight').textContent='Obstacle added on the route. Run or step to see the robot react.';
    });
    resetQuantum();renderRobot();
  }
  return {init,pause,playQuantum:measure,playRobot};
})();
