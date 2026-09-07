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

  window.switchTab = function switchTab(tab) {
    const tabEmp = document.getElementById('tabEmployee');
    const tabCom = document.getElementById('tabCompany');
    const panelEmp = document.getElementById('panelEmployee');
    const panelCom = document.getElementById('panelCompany');
    if (!tabEmp || !tabCom) return;

    tabEmp.classList.remove('active-orange', 'active-violet');
    tabCom.classList.remove('active-orange', 'active-violet');
    panelEmp.classList.remove('visible');
    panelCom.classList.remove('visible');

    if (tab === 'employee') {
      tabEmp.classList.add('active-orange');
      panelEmp.classList.add('visible');
    } else {
      tabCom.classList.add('active-violet');
      panelCom.classList.add('visible');
    }
  };

  const topbar = document.getElementById('topbar');
  if (topbar) {
    window.addEventListener('scroll', () => {
      topbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  showScreen('landing');
})();
