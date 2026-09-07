(function () {
  const screens = document.querySelectorAll('[data-screen]');
  let history = ['landing'];

  function showScreen(id) {
    screens.forEach((s) => s.classList.toggle('active', s.dataset.screen === id));
    document.querySelectorAll('.bottom-nav button[data-nav]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.nav === id);
    });
    window.scrollTo(0, 0);
  }

  document.body.addEventListener('click', (e) => {
    const el = e.target.closest('[data-nav]');
    if (!el || el.disabled) return;
    e.preventDefault();
    const target = el.dataset.nav;
    if (!target) return;
    if (target !== history[history.length - 1]) {
      history.push(target);
      showScreen(target);
    }
  });

  function setAudience(mode) {
    const tabEmp = document.getElementById('tabEmployee');
    const tabCom = document.getElementById('tabCompany');
    if (!tabEmp || !tabCom) return;

    const isEmployee = mode === 'employee';
    const btnClasses = ['vh-btn--primary', 'vh-btn--secondary', 'vh-btn--outline-primary'];

    tabEmp.classList.remove(...btnClasses);
    tabCom.classList.remove(...btnClasses);

    if (isEmployee) {
      tabEmp.classList.add('vh-btn--primary');
      tabCom.classList.add('vh-btn--outline-primary');
    } else {
      tabCom.classList.add('vh-btn--secondary');
      tabEmp.classList.add('vh-btn--outline-primary');
    }

    tabEmp.setAttribute('aria-selected', String(isEmployee));
    tabCom.setAttribute('aria-selected', String(!isEmployee));

    document.querySelectorAll('.dm-register-btn').forEach((btn) => {
      btn.classList.remove('vh-btn--primary', 'vh-btn--secondary');
      btn.classList.add(isEmployee ? 'vh-btn--primary' : 'vh-btn--secondary');
    });
  }

  window.switchTab = setAudience;

  const tabEmp = document.getElementById('tabEmployee');
  const tabCom = document.getElementById('tabCompany');
  if (tabEmp && tabCom) {
    tabEmp.addEventListener('click', () => setAudience('employee'));
    tabCom.addEventListener('click', () => setAudience('company'));
    setAudience('employee');
  }

  const topbar = document.getElementById('topbar');
  if (topbar) {
    window.addEventListener('scroll', () => {
      topbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  showScreen('landing');
})();
