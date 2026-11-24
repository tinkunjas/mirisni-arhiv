'use strict';
window.CatalogUI = (() => {
  let activeDialog = null;
  let returnFocus = null;
  let previousOverflow = '';
  const selector = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex="0"]';
  function open(overlay, initialFocus) {
    if (activeDialog !== overlay) {
      if (!activeDialog) {
        returnFocus = document.activeElement;
        previousOverflow = document.body.style.overflow;
      }
      activeDialog = overlay;
    }
    document.querySelector('.app').inert = true;
    document.body.style.overflow = 'hidden';
    (initialFocus || overlay.querySelector(selector))?.focus();
  }
  function close(overlay) {
    if (activeDialog !== overlay) return;
    activeDialog = null;
    document.querySelector('.app').inert = false;
    document.body.style.overflow = previousOverflow;
    const target = returnFocus?.isConnected ? returnFocus : document.querySelector('#sectionTitle');
    target?.focus({preventScroll: true});
    returnFocus = null;
  }
  document.addEventListener('keydown', event => {
    if (event.key !== 'Tab' || !activeDialog) return;
    const nodes = [...activeDialog.querySelectorAll(selector)].filter(node => node.getClientRects().length && !node.closest('[hidden]'));
    const first = nodes[0], last = nodes.at(-1);
    if (!first) { event.preventDefault(); return; }
    if (event.shiftKey && (document.activeElement === first || !activeDialog.contains(document.activeElement))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && (document.activeElement === last || !activeDialog.contains(document.activeElement))) {
      event.preventDefault(); first.focus();
    }
  });
  return {open, close};
})();
