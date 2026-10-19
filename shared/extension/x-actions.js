// Share the same action-row layout with the website's X example. Flatten only
// action wrappers, leaving X's buttons, handlers, counters and order intact.
const css = `
[data-reacji-x-row]{display:grid!important;grid-template-columns:none!important;grid-auto-flow:column!important;grid-auto-columns:minmax(0,1fr)!important;align-items:center!important;gap:0!important}
[data-reacji-x-wrapper]{display:contents!important}
[data-reacji-x-action]{justify-self:center!important;min-width:0!important;width:max-content!important;margin:0!important;position:relative!important;left:var(--reacji-x-shift,0px)!important}
[data-reacji-x-row] reacji-to-reactions{justify-self:center;min-width:0}
`;
export function layoutXActions(anchor, host) {
  const row = anchor.parentElement;
  if (!row || !host.isConnected) return;
  if (!document.querySelector('style[data-reacji-x-styles]')) {
    const sheet = document.createElement('style');
    sheet.setAttribute('data-reacji-x-styles', ''); sheet.textContent = css;
    document.head.append(sheet);
  }
  row.setAttribute('data-reacji-x-row', '');
  const controls = [...row.querySelectorAll('button,a[href],[role="button"]')]
    .filter(el => !el.parentElement.closest('button,a[href],[role="button"]') && el.getClientRects().length);
  for (const control of controls) {
    control.setAttribute('data-reacji-x-action', '');
    for (let wrapper = control.parentElement; wrapper && wrapper !== row; wrapper = wrapper.parentElement) {
      wrapper.setAttribute('data-reacji-x-wrapper', '');
    }
  }
  // Center the icon itself, not the icon-plus-count box. Otherwise unequal
  // counts make an evenly divided row still look uneven.
  for (const control of controls) {
    const icon = control.querySelector('svg');
    const box = control.getBoundingClientRect(), glyph = icon?.getBoundingClientRect();
    const shift = glyph ? box.width / 2 - (glyph.left + glyph.width / 2 - box.left) : 0;
    const value = `${Math.round(shift * 100) / 100}px`;
    if (control.style.getPropertyValue('--reacji-x-shift') !== value) control.style.setProperty('--reacji-x-shift', value);
  }
}
export function clearXActions(anchor) {
  const row = anchor.parentElement;
  if (!row) return;
  row.removeAttribute('data-reacji-x-row');
  for (const el of row.querySelectorAll('[data-reacji-x-wrapper],[data-reacji-x-action]')) {
    el.removeAttribute('data-reacji-x-wrapper'); el.removeAttribute('data-reacji-x-action');
    el.style.removeProperty('--reacji-x-shift');
  }
}
