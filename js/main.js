/* ============================================
   고로개수TF - 메인 대시보드 로직
   ============================================ */

/* ── 인증 체크 ── */
checkAuth();

/* ── 데이터 로드 ── */
fetch('data/site-data.json')
  .then(function (res) { return res.json(); })
  .then(function (data) {
    renderUpdate(data.meta);
    renderKPI(data.project);
    renderMilestones(data.milestones);
    renderIssues(data.issues);
    renderPhotos(data.photos);
    initScrollAnim();
  })
  .catch(function (err) {
    console.error('데이터 로드 실패:', err);
  });

/* ── 업데이트 시각 ── */
function renderUpdate(meta) {
  var el = document.getElementById('updateTime');
  if (el && meta && meta.updatedAt) {
    el.textContent = 'Updated ' + meta.updatedAt;
  }
}

/* ── KPI 카드 ── */
function renderKPI(project) {
  if (!project) return;
  var grid = document.getElementById('kpiGrid');
  var budgetPct = Math.round(project.budgetSpent / project.budgetTotal * 100);

  var cards = [
    {
      label: '공정률', icon: '⚡',
      value: project.progress, unit: '%',
      sub: '목표 ' + project.targetDate,
      color: 'purple', barWidth: project.progress
    },
    {
      label: '예산 집행', icon: '💰',
      value: budgetPct, unit: '%',
      sub: project.budgetSpent + '억 / ' + project.budgetTotal + '억 원',
      color: 'cyan', barWidth: budgetPct
    },
    {
      label: '무재해', icon: '🛡️',
      value: project.safetyDays, unit: '일',
      sub: '연속 무재해 달성중',
      color: 'green', barWidth: 100
    },
    {
      label: '핵심 이슈', icon: '🔴',
      value: project.issueCount || 0, unit: '건',
      sub: project.issueCount > 0 ? '긴급 대응 필요' : '이슈 없음',
      color: 'red', barWidth: project.issueCount > 0 ? 33 : 0
    }
  ];

  grid.innerHTML = '';
  cards.forEach(function (c, i) {
    var card = document.createElement('div');
    card.className = 'kpi-card';
    card.innerHTML =
      '<div class="kpi-top"><span class="kpi-label">' + c.label + '</span><span class="kpi-icon">' + c.icon + '</span></div>' +
      '<div><span class="kpi-num ' + c.color + '" data-target="' + c.value + '">0</span><span class="kpi-unit">' + c.unit + '</span></div>' +
      '<div class="kpi-sub">' + c.sub + '</div>' +
      '<div class="kpi-bar"><div class="kpi-bar-inner bar-' + c.color + '" data-width="' + c.barWidth + '" style="width:0%"></div></div>';
    grid.appendChild(card);
  });

  /* 카운트업 애니메이션 */
  setTimeout(startCountUp, 400);
}

/* ── 카운트업 ── */
function startCountUp() {
  var nums = document.querySelectorAll('.kpi-num[data-target]');
  nums.forEach(function (el) {
    var target = parseInt(el.getAttribute('data-target'));
    var duration = target > 100 ? 1500 : 1200;
    var step = Math.max(1, Math.ceil(target / (duration / 16)));
    var current = 0;
    var timer = setInterval(function () {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = current.toLocaleString();
    }, 16);
  });

  /* 바 애니메이션 */
  var bars = document.querySelectorAll('.kpi-bar-inner[data-width]');
  bars.forEach(function (bar) {
    bar.style.width = bar.getAttribute('data-width') + '%';
  });
}

/* ── 마일스톤 ── */
function renderMilestones(milestones) {
  if (!milestones || milestones.length === 0) return;
  var track = document.getElementById('msTrack');
  var railFill = document.getElementById('msRailFill');

  /* 완료 비율 계산 */
  var doneCount = 0;
  milestones.forEach(function (m) { if (m.status === '완료') doneCount++; });
  var pct = Math.round((doneCount / milestones.length) * 100);
  railFill.style.width = pct + '%';

  /* 마일스톤 아이템 생성 */
  milestones.forEach(function (m, i) {
    var item = document.createElement('div');
    item.className = 'ms-item';

    var dotClass = 'ms-dot ';
    var dotContent = '';
    var statusClass = 'ms-status ';

    if (m.status === '완료') {
      dotClass += 'done';
      dotContent = '✓';
      statusClass += 'done';
    } else if (m.status === '진행중') {
      dotClass += 'active';
      dotContent = (i + 1);
      statusClass += 'active';
    } else {
      dotClass += 'pending';
      dotContent = (i + 1);
      statusClass += 'pending';
    }

    var dateStr = m.actualDate || m.planDate;

    item.innerHTML =
      '<div class="' + dotClass + '">' + dotContent + '</div>' +
      '<div class="ms-name">' + m.name + '</div>' +
      '<div class="ms-date">' + dateStr + '</div>' +
      '<div class="' + statusClass + '">' + m.status + '</div>';

    track.appendChild(item);
  });
}

/* ── 이슈 ── */
function renderIssues(issues) {
  if (!issues || issues.length === 0) return;
  var grid = document.getElementById('issueGrid');
  grid.innerHTML = '';

  var levelMap = {
    red: { badge: 'CRITICAL', label: '긴급' },
    yellow: { badge: 'WARNING', label: '주의' },
    green: { badge: 'RESOLVED', label: '완료' }
  };

  issues.forEach(function (issue) {
    var info = levelMap[issue.level] || levelMap.yellow;
    var card = document.createElement('div');
    card.className = 'issue-card ' + issue.level;
    card.innerHTML =
      '<div class="issue-badge">' + info.badge + '</div>' +
      '<div class="issue-title">' + issue.title + '</div>' +
      '<div class="issue-desc">' + issue.action + '</div>' +
      '<div class="issue-footer">' + (issue.level === 'green' ? '완료 ' : '기한 ') + issue.dueDate + '</div>';
    grid.appendChild(card);
  });
}

/* ── 사진 ── */
function renderPhotos(photos) {
  if (!photos || photos.length === 0) return;
  var row = document.getElementById('photoRow');
  row.innerHTML = '';

  var gradients = ['pv1', 'pv2', 'pv3', 'pv4'];

  photos.forEach(function (photo, i) {
    var item = document.createElement('div');
    item.className = 'photo-item';

    var visClass = 'photo-vis ' + gradients[i % gradients.length];
    var imgTag = '';
    if (photo.filename) {
      imgTag = '<img src="images/' + photo.filename + '" alt="' + photo.caption + '">';
    } else {
      imgTag = '<span style="font-size:40px;position:relative;z-index:2;">🏭</span>';
    }

    item.innerHTML =
      '<div class="' + visClass + '">' + imgTag + '</div>' +
      '<div class="photo-meta">' +
        '<div class="photo-date">' + photo.date + '</div>' +
        '<div class="photo-cap">' + photo.caption + '</div>' +
      '</div>';

    row.appendChild(item);
  });
}

/* ── 스크롤 페이드업 ── */
function initScrollAnim() {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('show');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-up').forEach(function (el) {
    observer.observe(el);
  });
}
