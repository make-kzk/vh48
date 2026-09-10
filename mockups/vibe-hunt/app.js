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
    const audienceSwitch = e.target.closest('[data-audience-switch]');
    if (audienceSwitch) {
      setAudience(audienceSwitch.dataset.audienceSwitch);
      return;
    }

    const button = e.target.closest('button:not(:disabled)');
    if (button) playButtonBounce(button);

    const audienceSet = e.target.closest('[data-audience-set]');
    if (audienceSet) {
      setAudience(audienceSet.dataset.audienceSet);
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
    const landingSection = document.querySelector('.landing-dm[data-screen="landing"]');
    if (landingSection?.dataset.audience === mode) return;

    const isEmployee = mode === 'employee';

    document.querySelectorAll('[data-audience-switch]').forEach((btn) => {
      const isEmp = btn.dataset.audienceSwitch === 'employee';
      btn.setAttribute('aria-selected', String(isEmp === isEmployee));
    });

    if (landingSection) {
      landingSection.dataset.audience = mode;
    }

    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.dataset.audienceView = mode;
    }

    const audienceSection = document.getElementById('audience');
    if (audienceSection) {
      audienceSection.dataset.audienceView = mode;
      audienceSection.querySelectorAll('[data-audience-panel]').forEach((panel) => {
        panel.hidden = panel.dataset.audiencePanel !== mode;
      });
    }

    const heroPreviewWrap = document.querySelector('.hero-dm__preview-wrap');
    if (heroPreviewWrap) {
      heroPreviewWrap.dataset.audienceView = mode;
      heroPreviewWrap.querySelectorAll('[data-audience-preview]').forEach((preview) => {
        const isActive = preview.dataset.audiencePreview === mode;
        preview.hidden = !isActive;
      });
    }

    const howSection = document.getElementById('how');
    if (howSection) {
      howSection.dataset.audienceView = mode;
      howSection.querySelectorAll('[data-audience-how]').forEach((layout) => {
        layout.hidden = layout.dataset.audienceHow !== mode;
      });
      requestAnimationFrame(() => howRefreshers.forEach((refresh) => refresh()));
    }

    const statsSection = document.getElementById('stats');
    if (statsSection) {
      statsSection.dataset.audienceView = mode;
      statsSection.querySelectorAll('[data-audience-panel]').forEach((panel) => {
        panel.hidden = panel.dataset.audiencePanel !== mode;
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

  function initHowModules(wrapper) {
    const tabs = [...wrapper.querySelectorAll('.how-dm__module-tab')];
    const panels = [...wrapper.querySelectorAll('[data-how-module-panel]')];
    if (!tabs.length || !panels.length) return;

    function setHowModule(index) {
      tabs.forEach((tab, i) => {
        const isActive = i === index;
        tab.setAttribute('aria-selected', String(isActive));
        tab.tabIndex = isActive ? 0 : -1;
      });

      panels.forEach((panel, i) => {
        const isActive = i === index;
        panel.classList.toggle('how-dm__module-panel--active', isActive);
        panel.hidden = !isActive;
      });

      if (index === 0) {
        requestAnimationFrame(() => howRefreshers.forEach((refresh) => refresh()));
      }
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => setHowModule(index));
    });

    setHowModule(0);
  }

  function initHow(layout) {
    const indicator = layout.querySelector('.how-dm__indicator');
    const steps = [...layout.querySelectorAll('.how-dm__step')];
    const panels = [...layout.querySelectorAll('.how-dm__panel')];
    const audience = layout.dataset.howSteps || 'how';
    if (!indicator || !steps.length) return;

    steps.forEach((step, index) => {
      const trigger = step.querySelector('.how-dm__tab');
      const tabPanel = step.querySelector('.how-dm__tab-panel');
      const tabId = `${audience}-how-tab-${index}`;
      const panelId = `${audience}-how-panel-${index}`;

      trigger.id = tabId;
      trigger.setAttribute('aria-controls', panelId);
      if (tabPanel) {
        tabPanel.id = panelId;
        tabPanel.setAttribute('aria-labelledby', tabId);
      }
    });

    function setHowStep(index) {
      steps.forEach((step, i) => {
        const isActive = i === index;
        step.classList.toggle('how-dm__step--active', isActive);
        const trigger = step.querySelector('.how-dm__tab');
        const tabPanel = step.querySelector('.how-dm__tab-panel');
        trigger.setAttribute('aria-selected', String(isActive));
        trigger.tabIndex = isActive ? 0 : -1;
        if (tabPanel) tabPanel.hidden = !isActive;
      });

      panels.forEach((panel, i) => {
        const isActive = i === index;
        panel.classList.toggle('how-dm__panel--active', isActive);
        panel.hidden = !isActive;
      });

      const activeStep = steps[index];
      const rail = layout.querySelector('.how-dm__rail');
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

  document.querySelectorAll('[data-how-steps]').forEach(initHow);
  document.querySelectorAll('[data-audience-how]').forEach(initHowModules);

  document.querySelectorAll('.audience-dm__segments').forEach((track) => {
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;

    track.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      isDragging = true;
      startX = e.clientX;
      scrollLeft = track.scrollLeft;
      track.setPointerCapture(e.pointerId);
      track.classList.add('audience-dm__segments--dragging');
    });

    track.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      track.scrollLeft = scrollLeft - (e.clientX - startX);
    });

    const endDrag = (e) => {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('audience-dm__segments--dragging');
      if (track.hasPointerCapture(e.pointerId)) {
        track.releasePointerCapture(e.pointerId);
      }
    };

    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);
  });

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
