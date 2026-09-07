/** Demo-only: single-select answers unlock "Далее" buttons */
(function () {
  function wireAnswerGroup(containerId, nextButtonId) {
    const container = document.getElementById(containerId);
    const nextBtn = document.getElementById(nextButtonId);
    if (!container || !nextBtn) return;

    container.addEventListener('click', (e) => {
      const item = e.target.closest('.answer');
      if (!item) return;

      for (const btn of container.querySelectorAll('.answer')) {
        btn.classList.toggle('selected', btn === item);
      }
      nextBtn.disabled = false;
    });
  }

  wireAnswerGroup('answers-1', 'next-1');
  wireAnswerGroup('answers-2', 'next-2');
})();
