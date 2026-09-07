/**
 * vh48 click-through mockup router.
 *
 * Usage:
 *   - Mark screens:  <section data-screen="home" class="screen active">
 *   - Navigate:      <button data-nav="detail">Next</button>
 *   - Go back:       <button data-nav="back"> or data-mockup-back
 *   - Tabs:          data-toggle-group + data-toggle-target / data-toggle-panel
 *   - Active nav:    data-nav-active="cabinet" on bottom-nav items
 *
 * Auto-init on DOMContentLoaded when [data-screen] exists.
 * Optional: body[data-mockup-home="landing"] sets the home screen id.
 */
(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  class MockupRouter {
    /**
     * @param {object} [options]
     * @param {string} [options.home]
     * @param {boolean} [options.urlSync] — sync ?screen= to history (default true)
     * @param {(id: string) => void} [options.onChange]
     */
    constructor(options = {}) {
      this.screens = [...document.querySelectorAll('[data-screen]')];
      this.home =
        options.home ||
        document.body.dataset.mockupHome ||
        this.screens[0]?.dataset.screen ||
        'home';
      this.urlSync = options.urlSync !== false;
      this.onChange = options.onChange || null;
      this.history = [this.resolveInitialScreen()];

      document.body.addEventListener('click', (e) => this.handleClick(e));

      for (const btn of document.querySelectorAll('[data-mockup-back]')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.back();
        });
      }

      if (this.urlSync) {
        window.addEventListener('popstate', () => {
          const id = this.readScreenFromUrl() || this.home;
          this.history = [id];
          this.showScreen(id, { syncUrl: false });
        });
      }

      this.showScreen(this.history[0], { syncUrl: this.urlSync, replaceUrl: true });
    }

    resolveInitialScreen() {
      const fromUrl = this.readScreenFromUrl();
      if (fromUrl && this.hasScreen(fromUrl)) return fromUrl;
      const active = this.screens.find((s) => s.classList.contains('active'));
      if (active?.dataset.screen) return active.dataset.screen;
      return this.home;
    }

    readScreenFromUrl() {
      return new URLSearchParams(window.location.search).get('screen');
    }

    hasScreen(id) {
      return this.screens.some((s) => s.dataset.screen === id);
    }

    handleClick(event) {
      const toggle = event.target.closest('[data-toggle-target]');
      if (toggle) {
        event.preventDefault();
        this.applyToggle(toggle);
        return;
      }

      const nav = event.target.closest('[data-nav]');
      if (!nav || nav.disabled) return;

      const target = nav.dataset.nav;
      if (!target) return;

      event.preventDefault();

      if (target === 'back') {
        this.back();
      } else {
        this.navigate(target);
      }
    }

    navigate(id) {
      if (!this.hasScreen(id)) {
        console.warn(`[vh48] Unknown screen: ${id}`);
        return;
      }
      if (id === this.current()) return;
      this.history.push(id);
      this.showScreen(id);
    }

    back() {
      if (this.history.length <= 1) return;
      this.history.pop();
      this.showScreen(this.current(), { syncUrl: this.urlSync });
    }

    current() {
      return this.history[this.history.length - 1];
    }

    /**
     * @param {string} id
     * @param {{ syncUrl?: boolean, replaceUrl?: boolean }} [opts]
     */
    showScreen(id, opts = {}) {
      const { syncUrl = false, replaceUrl = false } = opts;
      if (!this.hasScreen(id)) return;

      for (const screen of this.screens) {
        const active = screen.dataset.screen === id;
        screen.classList.toggle('active', active);
        screen.hidden = !active;
        screen.setAttribute('aria-hidden', active ? 'false' : 'true');
      }

      for (const btn of document.querySelectorAll('[data-mockup-back]')) {
        btn.hidden = this.history.length <= 1;
      }

      for (const el of document.querySelectorAll('[data-nav-active]')) {
        el.classList.toggle('active', el.dataset.navActive === id);
      }

      document.title = this.buildTitle(id);

      if (!reducedMotion) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.scrollTo(0, 0);
      }

      if (syncUrl && this.urlSync) {
        const url = new URL(window.location.href);
        url.searchParams.set('screen', id);
        const state = { screen: id };
        if (replaceUrl) {
          history.replaceState(state, '', url);
        } else {
          history.pushState(state, '', url);
        }
      }

      if (this.onChange) this.onChange(id);
    }

    buildTitle(id) {
      const base = document.body.dataset.mockupTitle || document.title.split(' · ')[0];
      const screen = this.screens.find((s) => s.dataset.screen === id);
      const label = screen?.dataset.screenTitle || id;
      return `${base} · ${label}`;
    }

    applyToggle(trigger) {
      const group = trigger.dataset.toggleGroup || 'default';
      const target = trigger.dataset.toggleTarget;
      if (!target) return;

      for (const tab of document.querySelectorAll(
        `[data-toggle-group="${group}"][data-toggle-target]`,
      )) {
        tab.classList.toggle('active', tab === trigger);
        tab.setAttribute('aria-selected', tab === trigger ? 'true' : 'false');
      }

      for (const panel of document.querySelectorAll(`[data-toggle-group="${group}"]`)) {
        if (!panel.hasAttribute('data-toggle-panel')) continue;
        const visible = panel.dataset.togglePanel === target;
        panel.classList.toggle('visible', visible);
        panel.hidden = !visible;
      }
    }
  }

  window.VH48Mockup = MockupRouter;

  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-screen]')) {
      window.mockup = new MockupRouter();
    }
  });
})();
