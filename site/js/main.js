// 모바일 햄버거 메뉴 토글 — 유일한 스크립트 (PRD §6: 최소 JS)
(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  if (!header || !toggle) return;

  toggle.addEventListener('click', function () {
    var open = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });

  // 메뉴에서 링크 선택 시 닫기 (같은 페이지 앵커 이동 대비)
  header.querySelectorAll('#gnb a').forEach(function (a) {
    a.addEventListener('click', function () {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();
