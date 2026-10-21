(() => {
  const root = document.querySelector('[data-custom-root][data-custom-template="yuanbao"]');
  const api = window.AssistanceCustomPage;
  const options = window.YuanbaoExampleConfig || {};
  delete window.YuanbaoExampleConfig;
  const keyboardMode = options.useCustomKeyboard !== false;
  const closable = options.closable !== false;
  const stage = root.querySelector('[data-stage]');
  const card = root.querySelector('[data-card]');
  const input = root.querySelector('[data-id-value]');
  const grid = root.querySelector('[data-id-grid]');
  const keyboard = root.querySelector('[data-keyboard]');
  const hand = root.querySelector('[data-hand]');
  const officialSubmit = root.querySelector('#ydrzSubmitControl');
  const checks = [];
  const removers = [];
  let state = { phase: 'initializing', idLast4: '', inputError: null, message: null, agreementReaderOpen: false };
  let keyboardOpen = keyboardMode;
  let previousComplete = false;
  let disposed = false;
  root.dataset.inputMode = keyboardMode ? 'custom' : 'native';
  root.querySelector('[data-close]').hidden = !closable;
  root.querySelector('[data-other]').hidden = !closable;
  function listen(node, event, action) {
    node.addEventListener(event, action); removers.push(() => node.removeEventListener(event, action));
  }
  function render() {
    if (disposed) return;
    const busy = state.phase === 'submitting' || state.phase === 'completed';
    const ready = state.phase === 'ready' || state.phase === 'error';
    const full = state.idLast4.length === 4;
    const active = ready && !busy && !state.agreementReaderOpen && (keyboardMode ? keyboardOpen : document.activeElement === input);
    const showKeyboard = keyboardMode && keyboardOpen && ready && !busy && !state.agreementReaderOpen;
    card.dataset.error = String(Boolean(state.inputError)); card.dataset.submitting = String(busy);
    stage.dataset.keyboardOpen = String(showKeyboard);
    keyboard.hidden = !showKeyboard;
    input.value = state.idLast4; input.disabled = !ready || busy || state.agreementReaderOpen;
    grid.tabIndex = ready && !busy ? 0 : -1;
    root.querySelectorAll('[data-id-box]').forEach((box, index) => {
      box.querySelector('[data-digit]').textContent = state.idLast4[index] || '';
      const current = active && !full && index === state.idLast4.length;
      box.dataset.active = String(current); box.querySelector('[data-caret]').hidden = !current;
    });
    root.querySelector('[data-input-error]').hidden = !state.inputError;
    const message = root.querySelector('[data-message]');
    message.textContent = state.inputError || state.phase === 'submitting' ? '' : state.message || '';
    message.hidden = !message.textContent;
    root.querySelector('[data-initializing]').hidden = state.phase !== 'initializing';
    root.querySelector('[data-busy]').hidden = !busy;
    root.querySelector('[data-agreements]').inert = busy;
    root.querySelectorAll('[data-key]').forEach(button => { button.disabled = !ready || busy; });
    root.querySelector('[data-other]').disabled = busy;
    checks.forEach(checkbox => { checkbox.disabled = busy; });
    const clickable = officialSubmit.firstElementChild && !officialSubmit.matches('.disabled,[disabled],[aria-disabled="true"]') && !officialSubmit.querySelector('[disabled],[aria-disabled="true"],.loading');
    hand.hidden = !(state.phase === 'ready' && full && clickable && !busy && !state.inputError && !state.message && !state.agreementReaderOpen && checks.every(checkbox => checkbox.checked));
  }
  function update(value) { if (!disposed && state.phase !== 'submitting' && !state.agreementReaderOpen) api.setIdLast4(value); }
  function edit() {
    if (state.phase !== 'ready' && state.phase !== 'error') return;
    keyboardOpen = keyboardMode;
    if (!keyboardMode) input.focus({ preventScroll: true });
    render();
  }
  listen(grid, 'click', edit);
  listen(grid, 'keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); edit(); } });
  listen(input, 'input', () => update(input.value.replace(/[^0-9Xx]/g, '').toUpperCase().slice(0, 4)));
  listen(input, 'focus', render); listen(input, 'blur', render);
  root.querySelectorAll('[data-key]').forEach(button => listen(button, 'click', () => {
    const key = button.dataset.key;
    update(key === 'delete' ? state.idLast4.slice(0, -1) : (state.idLast4 + key).slice(0, 4));
  }));
  listen(root.querySelector('[data-collapse]'), 'click', () => { keyboardOpen = false; render(); grid.focus({ preventScroll: true }); });
  for (const selector of ['[data-close]', '[data-other]']) listen(root.querySelector(selector), 'click', () => { if (closable) api.close(); });
  (options.agreements || []).forEach((agreement, index) => {
    const row = document.createElement('label'); row.className = 'yuanbao-caller-agreement';
    const checkbox = document.createElement('input'); checkbox.type = 'checkbox'; checkbox.setAttribute('aria-label', '同意' + agreement.name);
    const text = document.createElement('span'); text.textContent = '已阅读并同意';
    const link = document.createElement('a'); link.textContent = agreement.name; link.href = agreement.link; link.target = '_blank'; link.rel = 'noopener';
    row.append(checkbox, text, link); root.querySelector('[data-caller-agreements]').append(row); checks.push(checkbox);
    listen(checkbox, 'change', () => { api.setCallerAgreementChecked(index, checkbox.checked); render(); });
  });
  const submitObserver = new MutationObserver(render);
  submitObserver.observe(officialSubmit, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'disabled', 'aria-disabled'] });
  api.register({
    onStateChange(next) {
      state = next;
      const complete = next.idLast4.length === 4;
      if (complete && !previousComplete && !next.agreementReaderOpen) keyboardOpen = false;
      previousComplete = complete; render();
    },
    dispose() { disposed = true; submitObserver.disconnect(); removers.splice(0).forEach(remove => remove()); },
  });
  render();
})();
