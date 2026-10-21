(() => {
  const root = document.querySelector('[data-custom-root][data-custom-template="duodian-health"]');
  const api = window.AssistanceCustomPage;
  const options = window.DuodianHealthPageConfig;
  delete window.DuodianHealthPageConfig;
  const keyboardMode = options.useCustomKeyboard !== false;
  const stage = root.querySelector('[data-stage]');
  const card = root.querySelector('[data-card]');
  const input = root.querySelector('[data-id-value]');
  const grid = root.querySelector('[data-id-grid]');
  const keyboard = root.querySelector('[data-keyboard]');
  const other = root.querySelector('[data-other]');
  const close = root.querySelector('[data-close]');
  const agreements = root.querySelector('[data-agreements]');
  const checks = [];
  const removers = [];
  let state = { phase: 'initializing', idLast4: '', inputError: null, message: null, agreementReaderOpen: false };
  let keyboardOpen = false;
  let readerSnapshot;
  let disposed = false;
  root.dataset.inputMode = keyboardMode ? 'custom' : 'native';
  input.readOnly = keyboardMode;
  input.inputMode = keyboardMode ? 'none' : 'text';
  close.hidden = !options.closable;

  function listen(node, event, action, capture = false) {
    node.addEventListener(event, action, capture);
    removers.push(() => node.removeEventListener(event, action, capture));
  }
  function busy() { return state.phase === 'submitting' || state.phase === 'completed'; }
  function editable() { return !disposed && !busy() && !state.agreementReaderOpen && (state.phase === 'ready' || state.phase === 'error'); }
  function blocked() { return disposed || busy() || state.agreementReaderOpen; }
  function render() {
    if (disposed) return;
    const canEdit = editable();
    const active = canEdit && (keyboardMode ? keyboardOpen : document.activeElement === input);
    const showKeyboard = keyboardMode && keyboardOpen && canEdit;
    stage.dataset.keyboardOpen = String(showKeyboard);
    card.dataset.submitting = String(busy());
    card.dataset.error = String(Boolean(state.inputError));
    keyboard.hidden = !showKeyboard;
    input.value = state.idLast4;
    input.disabled = !canEdit;
    grid.tabIndex = canEdit ? 0 : -1;
    grid.setAttribute('aria-disabled', String(!canEdit));
    root.querySelectorAll('[data-id-box]').forEach((box, index) => {
      box.querySelector('[data-digit]').textContent = state.idLast4[index] || '';
      const current = active && state.idLast4.length < 4 && index === state.idLast4.length;
      box.dataset.active = String(current);
      box.querySelector('[data-caret]').hidden = !current;
    });
    const message = root.querySelector('[data-message]');
    message.textContent = state.inputError || state.message || '';
    message.hidden = !message.textContent;
    other.disabled = blocked();
    close.disabled = blocked();
    agreements.inert = blocked();
    checks.forEach(check => { check.node.disabled = blocked(); check.node.checked = check.checked; });
    root.querySelectorAll('[data-key]').forEach(button => { button.disabled = !canEdit; });
    updateNaturalHeight();
  }
  function update(value) {
    if (editable() && value !== state.idLast4) api.setIdLast4(value);
  }
  function edit() {
    if (!editable()) return;
    keyboardOpen = keyboardMode;
    if (keyboardMode) grid.focus({ preventScroll: true });
    else input.focus({ preventScroll: true });
    render();
  }
  listen(grid, 'click', edit);
  listen(grid, 'keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); edit(); }
  });
  listen(input, 'input', () => {
    if (!keyboardMode) update(input.value.replace(/[^0-9Xx]/g, '').toUpperCase().slice(0, 4));
    render();
  });
  listen(input, 'focus', render);
  listen(input, 'blur', render);
  root.querySelectorAll('[data-key]').forEach(button => listen(button, 'click', () => {
    if (!keyboardMode || !keyboardOpen || !editable()) return;
    const key = button.dataset.key;
    if (key === 'delete') update(state.idLast4.slice(0, -1));
    else if (/^[0-9xX]$/.test(key) && state.idLast4.length < 4) update(state.idLast4 + key.toUpperCase());
  }));
  listen(root.querySelector('[data-collapse]'), 'click', () => {
    if (!editable()) return;
    keyboardOpen = false; render(); grid.focus({ preventScroll: true });
  });
  listen(other, 'click', () => { if (!blocked()) api.close(); });
  listen(close, 'click', () => { if (options.closable && !blocked()) api.close(); });
  // Capture precedes official agreement listeners and blocks even synthetic clicks.
  listen(agreements, 'click', event => {
    if (blocked()) { event.preventDefault(); event.stopImmediatePropagation(); }
  }, true);
  options.agreements.forEach((agreement, index) => {
    const row = document.createElement('label');
    const node = document.createElement('input'); node.type = 'checkbox';
    node.setAttribute('aria-label', '同意' + agreement.name);
    const text = document.createElement('span'); text.textContent = '已阅读并同意';
    const link = document.createElement('a'); link.textContent = agreement.name;
    link.href = agreement.link; link.target = '_blank'; link.rel = 'noopener';
    row.append(node, text, link); agreements.querySelector('[data-caller-agreements]').append(row);
    const check = { node, checked: false }; checks.push(check);
    listen(node, 'change', () => {
      if (!blocked()) { check.checked = node.checked; api.setCallerAgreementChecked(index, node.checked); }
      render();
    });
  });
  const viewport = window.visualViewport;
  function updateNaturalHeight() {
    if (disposed) return;
    // Report intrinsic content to the existing RESIZE bridge. The visible stage
    // still fits the iframe; wrapper applies its existing host viewport clamp.
    const height = Math.ceil(card.scrollHeight + (keyboard.hidden ? 0 : keyboard.getBoundingClientRect().height));
    if (height > 0 && root.style.minHeight !== height + 'px') root.style.minHeight = height + 'px';
  }
  function updateViewport() {
    if (disposed) return;
    const height = viewport ? viewport.height : window.innerHeight;
    if (Number.isFinite(height) && height > 0) root.style.setProperty('--duodian-viewport-height', Math.round(height) + 'px');
    updateNaturalHeight();
  }
  listen(window, 'resize', updateViewport);
  listen(window, 'orientationchange', updateViewport);
  if (viewport) { listen(viewport, 'resize', updateViewport); listen(viewport, 'scroll', updateViewport); }
  const contentObserver = new MutationObserver(updateNaturalHeight);
  contentObserver.observe(card, { childList: true, subtree: true, characterData: true });
  removers.push(() => contentObserver.disconnect());
  if (typeof ResizeObserver !== 'undefined') {
    const sizeObserver = new ResizeObserver(updateNaturalHeight);
    sizeObserver.observe(card); sizeObserver.observe(keyboard);
    removers.push(() => sizeObserver.disconnect());
  }
  api.register({
    onStateChange(next) {
      if (disposed) return;
      const openingReader = next.agreementReaderOpen && !state.agreementReaderOpen;
      const closingReader = !next.agreementReaderOpen && state.agreementReaderOpen;
      if (openingReader) {
        readerSnapshot = { keyboardOpen, focus: root.contains(document.activeElement) ? document.activeElement : null };
        keyboardOpen = false;
      }
      if (next.idLast4.length === 4 && state.idLast4.length !== 4 && !next.agreementReaderOpen) keyboardOpen = false;
      state = next;
      if (closingReader && readerSnapshot) {
        keyboardOpen = readerSnapshot.keyboardOpen;
        const focus = readerSnapshot.focus; readerSnapshot = undefined;
        render();
        if (editable() && focus && focus.isConnected) focus.focus({ preventScroll: true });
      }
      render();
    },
    dispose() {
      disposed = true; readerSnapshot = undefined;
      removers.splice(0).forEach(remove => remove());
    },
  });
  updateViewport();
  render();
})();
