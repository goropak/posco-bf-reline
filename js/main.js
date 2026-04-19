/* 고로개수TF - 메인 대시보드 로직 v2 */
checkAuth();

fetch('data/site-data.json?t='+Date.now())
  .then(function(r){return r.json();})
  .then(function(data){
    renderUpdate(data.meta);
    renderKPI(data.project);
    renderMilestones(data.milestones);
    initScrollAnim();
  })
  .catch(function(e){console.error('데이터 로드 실패:',e);});

/* 업데이트 시간 */
function renderUpdate(meta){
  var el=document.getElementById('updateTime');
  if(el && meta && meta.updatedAt) el.textContent='Updated '+meta.updatedAt;
}

/* KPI 카드 */
function renderKPI(project){
  if(!project) return;
  var grid=document.getElementById('kpiGrid');
  if(!grid) return;
  var budgetPct=Math.round(project.budgetSpent/project.budgetTotal*100);
  var cards=[
    {label:'공정률',icon:'⚡',value:project.progress,unit:'%',sub:'목표 '+project.targetDate,color:'purple',barWidth:project.progress},
    {label:'예산 집행',icon:'💰',value:budgetPct,unit:'%',sub:project.budgetSpent+'억 / '+project.budgetTotal+'억 원',color:'cyan',barWidth:budgetPct},
    {label:'중대재해',icon:'🚨',value:project.severeAccident||0,unit:'건',sub:project.severeAccident===0?'무재해 달성중':'안전 점검 필요',color:project.severeAccident===0?'green':'red',barWidth:project.severeAccident===0?100:33},
    {label:'안전과정지표',icon:'🛡️',value:project.safetyScore||0,unit:'점',sub:project.safetyScoreSub||'/ 15점 만점',color:'purple',barWidth:Math.round((project.safetyScore||0)/15*100)}
  ];
  grid.innerHTML='';
  cards.forEach(function(c){
    var card=document.createElement('div');
    card.className='kpi-card';
    card.innerHTML='<div class="kpi-top"><span class="kpi-label">'+c.label+'</span><span class="kpi-icon">'+c.icon+'</span></div>'
      +'<div><span class="kpi-num '+c.color+'" data-target="'+c.value+'" data-decimal="'+(String(c.value).indexOf('.')!==-1?'true':'false')+'">0</span><span class="kpi-unit">'+c.unit+'</span></div>'
      +'<div class="kpi-sub">'+c.sub+'</div>'
      +'<div class="kpi-bar"><div class="kpi-bar-inner bar-'+c.color+'" data-width="'+c.barWidth+'" style="width:0%"></div></div>';
    grid.appendChild(card);
  });
  setTimeout(startCountUp,400);
}

function startCountUp(){
  document.querySelectorAll('.kpi-num[data-target]').forEach(function(el){
    var target=parseFloat(el.getAttribute('data-target'));
    var isDecimal=el.getAttribute('data-decimal')==='true';
    var duration=1500;
    var steps=Math.ceil(duration/16);
    var step=target/steps;
    var cur=0;
    var timer=setInterval(function(){
      cur+=step;
      if(cur>=target){cur=target;clearInterval(timer);}
      el.textContent=isDecimal?cur.toFixed(1):Math.round(cur).toLocaleString();
    },16);
  });
  document.querySelectorAll('.kpi-bar-inner[data-width]').forEach(function(bar){
    bar.style.width=bar.getAttribute('data-width')+'%';
  });
}

/* 마일스톤 탭 전환 */
function switchMS(type){
  document.querySelectorAll('.ms-tab').forEach(function(t){t.classList.remove('active');});
  document.querySelectorAll('.ms-panel').forEach(function(p){p.classList.remove('active');});
  event.target.classList.add('active');
  document.getElementById('msPanel-'+type).classList.add('active');
}

/* 마일스톤 렌더링 */
function renderMilestones(milestones){
  if(!milestones) return;
  var pre=milestones.filter(function(m){return m.phase==='사전공사';});
  var main=milestones.filter(function(m){return m.phase==='본공사';});
  renderMSTrack('pre',pre);
  renderMSTrack('main',main);
}

function renderMSTrack(type,list){
  var track=document.getElementById('msTrack-'+type);
  var railFill=document.getElementById('msRailFill-'+type);
  if(!track||!list||!list.length) return;

  var today=new Date();
  today.setHours(0,0,0,0);
  var todayStr=today.toISOString().slice(0,10);

  /* 완료 비율 */
  var done=list.filter(function(m){return m.status==='완료';}).length;
  var active=list.filter(function(m){return m.status==='진행중';}).length;
  var pct=Math.round((done+(active*0.5))/list.length*100);
  railFill.style.width=pct+'%';

  /* 오늘 위치 계산 */
  var dates=list.map(function(m){return new Date(m.planDate);});
  var minDate=new Date(Math.min.apply(null,dates));
  var maxDate=new Date(Math.max.apply(null,dates));
  var totalRange=maxDate-minDate;
  var todayPct=0;
  if(totalRange>0){
    todayPct=Math.max(0,Math.min(100,(today-minDate)/totalRange*100));
  }

  list.forEach(function(m,i){
    var item=document.createElement('div');
    item.className='ms-item';
    var dotClass='ms-dot ';
    var dotContent='';
    var statusClass='ms-status ';

    if(m.status==='완료'){dotClass+='done';dotContent='✓';statusClass+='done';}
    else if(m.status==='진행중'){dotClass+='active';dotContent='●';statusClass+='active';}
    else{dotClass+='pending';dotContent=i+1;statusClass+='pending';}

    var dateStr=m.actualDate||m.planDate;
    item.innerHTML='<div class="'+dotClass+'">'+dotContent+'</div>'
      +'<div class="ms-name">'+m.name+'</div>'
      +'<div class="ms-date">'+dateStr+'</div>'
      +'<div class="'+statusClass+'">'+m.status+'</div>';
    track.appendChild(item);
  });

  /* 오늘 마커 추가 */
  var marker=document.createElement('div');
  marker.className='today-marker';
  marker.style.left=todayPct+'%';
  marker.innerHTML='<div class="today-label">TODAY '+todayStr+'</div><div class="today-line"></div>';
  track.appendChild(marker);
}

/* 스크롤 애니메이션 */
function initScrollAnim(){
  var observer=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){e.target.classList.add('show');observer.unobserve(e.target);}
    });
  },{threshold:0.1,rootMargin:'0px 0px -50px 0px'});
  document.querySelectorAll('.fade-up').forEach(function(el){observer.observe(el);});
}
