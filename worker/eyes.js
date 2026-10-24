// Header mark for the homepage: the approved eyes artwork split into empty eyeballs and one iris
// (public/eyes-blank.png, public/eyes-iris.png), so the irises can follow the visitor's pointer.
// Geometry is in percentages of the 232×180 eyeball image; the iris is 66px across.
export const eyes = `<span class="eyes" aria-hidden="true"><img class="eyes-balls" src="/eyes-blank.png" width="232" height="180" alt=""><span class="eye eye-left"><img src="/eyes-iris.png" width="66" height="66" alt=""></span><span class="eye eye-right"><img src="/eyes-iris.png" width="66" height="66" alt=""></span></span>`;

export const eyesStyles = `
.eyes{position:relative;display:block;flex:none;width:58px;aspect-ratio:232/180}
.eyes .eyes-balls{display:block;width:100%;height:100%}
.eye{position:absolute;top:.6%;height:98.4%}
.eye-left{left:.4%;width:47.8%}.eye-right{left:51.7%;width:47.4%}
.eyes img{image-rendering:auto}
.eyes .eye img{position:absolute;left:calc(50% + var(--look-x,0px));top:calc(50% + var(--look-y,0px));width:59.5%;height:auto;transform:translate(-43%,-50%);transition:left 80ms ease-out,top 80ms ease-out}
@media(prefers-reduced-motion:reduce){.eyes,.eyes .eye img{transition:none}}
`;

function followPointer() {
  const marks = [...document.querySelectorAll('.eyes')];
  if (!marks.length) return;
  let pointer = null, frame = 0;
  function look() {
    frame = 0;
    for (const mark of marks) {
      const box = mark.getBoundingClientRect();
      if (!box.width) continue;
      const dx = pointer ? pointer.x - (box.left + box.width / 2) : 0;
      const dy = pointer ? pointer.y - (box.top + box.height / 2) : 0;
      // One gaze vector from the mark's center, inherited by both pupils. Use
      // the tighter eyeball bounds so neither iris can leave its white.
      const bounds = [...mark.querySelectorAll('.eye')].map(eye => {
        const eyeBox = eye.getBoundingClientRect();
        const irisSize = eye.querySelector('img').getBoundingClientRect().width;
        return {
          x: Math.max(1, (eyeBox.width - irisSize) / 2 - eyeBox.width * .05),
          y: Math.max(1, (eyeBox.height - irisSize) / 2 - eyeBox.height * .08),
        };
      });
      const reachX = Math.min(...bounds.map(bound => bound.x));
      const reachY = Math.min(...bounds.map(bound => bound.y));
      const scale = Math.max(1, Math.hypot(dx / reachX, dy / reachY));
      mark.style.setProperty('--look-x', `${(dx / scale).toFixed(2)}px`);
      mark.style.setProperty('--look-y', `${(dy / scale).toFixed(2)}px`);
    }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(look); }
  function track(event) { if (event.pointerType === 'touch') return; pointer = {x:event.clientX,y:event.clientY}; schedule(); }
  function reset() { pointer = null; schedule(); }
  addEventListener('pointermove', track, { passive: true });
  addEventListener('pointerdown', track, { passive: true });
  document.documentElement.addEventListener('pointerleave', reset);
  addEventListener('blur', reset);
  addEventListener('resize', schedule, { passive: true });
  addEventListener('scroll', schedule, { passive: true, capture: true });
}
export const eyesScript = `(${followPointer.toString()})();`;
