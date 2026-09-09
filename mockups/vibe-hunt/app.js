(function () {
  const screens = document.querySelectorAll('[data-screen]');
  let history = ['landing'];

  const cjmRefreshers = [];
  const howRefreshers = [];

  function showScreen(id) {
    screens.forEach((s) => s.classList.toggle('active', s.dataset.screen === id));
    document.querySelectorAll('.bottom-nav button[data-nav]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.nav === id);
    });
    window.scrollTo(0, 0);
    requestAnimationFrame(() => cjmRefreshers.forEach((refresh) => refresh()));
  }

  function playButtonBounce(button) {
    if (!button || button.disabled) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    button.classList.remove('vh-bounce-play');
    void button.offsetWidth;
    button.classList.add('vh-bounce-play');
  }

  document.body.addEventListener('click', (e) => {
    const button = e.target.closest('button:not(:disabled)');
    if (button) playButtonBounce(button);
    const audienceSet = e.target.closest('[data-audience-set]');
    if (audienceSet) {
      setAudience(audienceSet.dataset.audienceSet);
    }

    const audienceSwitch = e.target.closest('[data-audience-switch]');
    if (audienceSwitch) {
      setAudience(audienceSwitch.dataset.audienceSwitch);
      return;
    }

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

  document.body.addEventListener('animationend', (e) => {
    if (e.animationName === 'vh-btn-bounce' && e.target instanceof HTMLButtonElement) {
      e.target.classList.remove('vh-bounce-play');
    }
  });

  function setAudience(mode) {
    const isEmployee = mode === 'employee';
    const btnClasses = ['vh-btn--primary', 'vh-btn--secondary', 'vh-btn--outline-primary', 'vh-btn--outline-secondary'];

    document.querySelectorAll('[data-audience-switch]').forEach((btn) => {
      const isEmp = btn.dataset.audienceSwitch === 'employee';
      btn.classList.remove(...btnClasses);

      if (isEmployee) {
        btn.classList.add(isEmp ? 'vh-btn--primary' : 'vh-btn--outline-secondary');
      } else {
        btn.classList.add(isEmp ? 'vh-btn--outline-primary' : 'vh-btn--secondary');
      }

      btn.setAttribute('aria-selected', String(isEmp === isEmployee));
    });

    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.dataset.audienceView = mode;
    }

    const heroPreviewWrap = document.querySelector('.hero-dm__preview-wrap');
    if (heroPreviewWrap) {
      heroPreviewWrap.dataset.audienceView = mode;
      heroPreviewWrap.querySelectorAll('[data-audience-preview]').forEach((preview) => {
        const isActive = preview.dataset.audiencePreview === mode;
        preview.hidden = !isActive;
      });
    }
  }

  window.switchTab = setAudience;

  setAudience('employee');

  function initCjm(cjm) {
    const indicator = cjm.querySelector('.cjm-dm__indicator');
    const steps = [...cjm.querySelectorAll('.cjm-dm__step')];
    if (!indicator || !steps.length) return;

    function setCjmStep(activeStep) {
      steps.forEach((step) => {
        const isActive = step === activeStep;
        step.classList.toggle('cjm-dm__step--active', isActive);
        const trigger = step.querySelector('.cjm-dm__step-trigger');
        const panel = step.querySelector('.cjm-dm__step-panel');
        trigger.setAttribute('aria-selected', String(isActive));
        panel.hidden = !isActive;
      });

      const trigger = activeStep.querySelector('.cjm-dm__step-trigger');
      const rail = cjm.querySelector('.cjm-dm__rail');
      const triggerRect = trigger.getBoundingClientRect();
      const railRect = rail.getBoundingClientRect();
      indicator.style.transform = `translateY(${triggerRect.top - railRect.top}px)`;
      indicator.style.height = `${triggerRect.height}px`;
    }

    steps.forEach((step) => {
      step.querySelector('.cjm-dm__step-trigger').addEventListener('click', () => setCjmStep(step));
    });

    cjmRefreshers.push(() => setCjmStep(cjm.querySelector('.cjm-dm__step--active') || steps[0]));
    setCjmStep(steps[0]);
  }

  document.querySelectorAll('.cjm-dm').forEach(initCjm);

  function initHow(how) {
    const indicator = how.querySelector('.how-dm__indicator');
    const steps = [...how.querySelectorAll('.how-dm__step')];
    const panels = [...how.querySelectorAll('.how-dm__panel')];
    if (!indicator || !steps.length) return;

    function setHowStep(index) {
      steps.forEach((step, i) => {
        const isActive = i === index;
        step.classList.toggle('how-dm__step--active', isActive);
        const trigger = step.querySelector('.how-dm__tab');
        const tabPanel = step.querySelector('.how-dm__tab-panel');
        trigger.setAttribute('aria-selected', String(isActive));
        if (tabPanel) tabPanel.hidden = !isActive;
      });

      panels.forEach((panel, i) => {
        const isActive = i === index;
        panel.classList.toggle('how-dm__panel--active', isActive);
        panel.hidden = !isActive;
      });

      const activeStep = steps[index];
      const rail = how.querySelector('.how-dm__rail');
      const stepRect = activeStep.getBoundingClientRect();
      const railRect = rail.getBoundingClientRect();
      indicator.style.transform = `translateY(${stepRect.top - railRect.top}px)`;
      indicator.style.height = `${stepRect.height}px`;
    }

    steps.forEach((step, index) => {
      step.querySelector('.how-dm__tab').addEventListener('click', () => setHowStep(index));
    });

    howRefreshers.push(() => {
      const activeIndex = steps.findIndex((step) => step.classList.contains('how-dm__step--active'));
      setHowStep(activeIndex >= 0 ? activeIndex : 0);
    });
    setHowStep(0);
  }

  document.querySelectorAll('.how-dm').forEach(initHow);

  window.addEventListener('resize', () => {
    requestAnimationFrame(() => {
      cjmRefreshers.forEach((refresh) => refresh());
      howRefreshers.forEach((refresh) => refresh());
    });
  }, { passive: true });

  const topbar = document.getElementById('topbar');
  if (topbar) {
    window.addEventListener('scroll', () => {
      topbar.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  showScreen('landing');
})();
