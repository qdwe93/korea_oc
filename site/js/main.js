// 최소 JS (PRD §6): 이미지 변형 랜덤 로테이션 + 모바일 메뉴 토글
(function () {
  // --- 이미지 로테이션 -------------------------------------------------------
  // 생성 이미지가 종류별로 여러 장(_1.._n) 준비되어 있어, 접속할 때마다 무작위로
  // 하나를 보여준다. data-img 속성이 있는 요소의 --img 변수를 주입한다.
  // JS 미동작 시에는 CSS 기본값(_1)이 표시되므로 기능상 문제 없음.
  var VARIANTS = {
    'hero-main': 4,
    'about-visual': 4,
    'about-greeting': 3,
    'biz-fuel': 4,
    'biz-marine': 4,
    'biz-chem': 4
  };
  // 하위 언어 폴더(en/ja/zh)에서는 body[data-asset-root="../"] 로 경로 보정.
  // 주의: CSS 변수 안의 상대 url()은 문서가 아닌 스타일시트 기준으로 해석되므로
  // 반드시 절대 URL로 변환해서 주입한다.
  var assetRoot = document.body.getAttribute('data-asset-root') || '';
  document.querySelectorAll('[data-img]').forEach(function (el) {
    var key = el.getAttribute('data-img');
    var n = VARIANTS[key];
    if (!n) return;
    var pick = Math.floor(Math.random() * n) + 1;
    var abs = new URL(assetRoot + 'assets/images/' + key + '_' + pick + '.jpg', document.baseURI).href;
    el.style.setProperty('--img', 'url("' + abs + '")');
  });

  // --- 모바일 햄버거 메뉴 ----------------------------------------------------
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  if (!header || !toggle) return;

  toggle.addEventListener('click', function () {
    var open = header.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  header.querySelectorAll('#gnb a').forEach(function (a) {
    a.addEventListener('click', function () {
      header.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();
