/* ── 고로개수TF 인증 ── */

const SITE_PW = 'bf2026';

/* 기억하기 체크 → 바로 대시보드 이동 */
if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
  if (localStorage.getItem('bf_auth') === 'ok') {
    window.location.href = 'dashboard.html';
  }
}

/* 로그인 실행 */
function doLogin() {
  var pw = document.getElementById('pwInput').value;
  if (pw === SITE_PW) {
    if (document.getElementById('rememberMe').checked) {
      localStorage.setItem('bf_auth', 'ok');
    }
    window.location.href = 'dashboard.html';
  } else {
    document.getElementById('loginError').style.display = 'block';
    document.getElementById('pwInput').value = '';
    document.getElementById('pwInput').focus();
  }
}

/* 로그아웃 (관리자 페이지에서 사용) */
function doLogout() {
  localStorage.removeItem('bf_auth');
  window.location.href = 'index.html';
}

/* 인증 체크 (대시보드 등 보호 페이지에서 호출) */
function checkAuth() {
  if (localStorage.getItem('bf_auth') !== 'ok') {
    window.location.href = 'index.html';
  }
}

/* 불꽃 파티클 생성 (로그인 화면용) */
function initParticles() {
  var box = document.getElementById('particles');
  if (!box) return;

  var colors = ['#fb923c', '#f97316', '#fbbf24', '#ef4444', '#fdba74', '#fde68a'];

  function createParticle() {
    var p = document.createElement('div');
    p.className = 'particle';
    var x = Math.random() * 100;
    var size = Math.random() * 4 + 2;
    var dur = Math.random() * 4 + 3;
    var delay = Math.random() * 2;
    var color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText =
      'left:' + x + '%;' +
      'width:' + size + 'px;height:' + size + 'px;' +
      'background:' + color + ';' +
      'box-shadow:0 0 ' + (size * 2) + 'px ' + color + ';' +
      'animation-duration:' + dur + 's;' +
      'animation-delay:' + delay + 's;';
    box.appendChild(p);
    setTimeout(function () { p.remove(); }, (dur + delay) * 1000);
  }

  setInterval(createParticle, 150);
  for (var i = 0; i < 30; i++) {
    setTimeout(createParticle, i * 100);
  }
}

/* 페이지 로드 시 파티클 시작 */
document.addEventListener('DOMContentLoaded', initParticles);
