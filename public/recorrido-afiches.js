(() => {
  const $ = selector => document.querySelector(selector);
  const palette=['#22d46a','#bae6fd','#ddd6fe','#f97316'];
  function node(tag, text, className) {const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
  async function post(url,data) {
    const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(40000)});
    const result=await res.json();
    if(!res.ok){const error=new Error(result.error||'No pudimos completar la solicitud.');error.status=res.status;throw error;}return result;
  }
  const rail=node('nav',undefined,'journey');rail.setAttribute('aria-label','Seguí explorando Afiches');
  const destinations=[['inicio', ['Inicio', 'Home'], '#ddd6fe', 'M5 12 12 5l7 7M8 10v9h8v-9'], ['redes', ['Alcance', 'Reach'], '#f97316', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9'], ['demo', ['AI', 'AI'], '#22d46a', 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6'], ['resultados', ['Resultados', 'Results'], '#bae6fd', 'M6 18V9m6 9V5m6 13v-6'], ['estudios', ['Estudios', 'Studies'], '#ddd6fe', 'M7 4h7l4 4v12H7V4m7 0v5h4'], ['equipo', ['Equipo', 'Team'], '#f97316', 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8'], ['servicios', ['Servicios', 'Services'], '#22d46a', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'], ['contactanos', ['Contacto', 'Contact'], '#bae6fd', 'M4 6h16v12H4zM4 7l8 6 8-6']];
  destinations.forEach(([id,label,color,path])=>{const a=node('a');a.href='#'+id;a.style.setProperty('--dot',color);a.setAttribute('aria-label',label[0]);a.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="'+path+'"/></svg><span><span class="es">'+label[0]+'</span><span class="en">'+label[1]+'</span></span>';rail.append(a);});rail.classList.add('top');(document.querySelector('.site-header')||document.body).append(rail);
  let frame=false;
  function markSection(){frame=false;let current='inicio';for(const [id] of destinations.slice(1)){if($('#'+id).getBoundingClientRect().top<innerHeight*.4)current=id;}rail.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
  addEventListener('scroll',()=>{if(!frame){frame=true;requestAnimationFrame(markSection);}}, {passive:true});markSection();
  document.querySelectorAll('.orb.decorative').forEach(orb=>orb.addEventListener('pointerdown',()=>{orb.classList.remove('nudge');void orb.offsetWidth;orb.classList.add('nudge');}));
  const dots=($('.demo-steps')||{children:[]}).children;
  function phase(n){[...dots].forEach((el,i)=>el.classList.toggle('is-current',i===n));}
  let session, step=0, question='', turns=[], themes=[], busy=false, contactSaved=false;
  function status(message){$('#demo-status').textContent=message;}
  function showQuestion(){
    $('#demo-welcome').hidden=true;$('#demo-result').hidden=true;$('#demo-form').hidden=false;
    $('#demo-question').textContent=question;$('#demo-answer').value='';
    $('#demo-progress').textContent=[t('Pregunta 1 de 2','Question 1 of 2'),t('Repregunta de la IA','AI follow-up'),t('Pregunta 2 de 2','Question 2 of 2')][step];
    $('#demo-hint').textContent=[t('Primero, tu opinión','First, your opinion'),t('La IA retoma lo que dijiste','The AI picks up on what you said'),t('Una última pregunta','One last question')][step];
    $('#demo-next').textContent=step===2?t('Ver mi resultado ↗','See my result ↗'):t('Continuar ↗','Continue ↗');phase(step===0?0:1);
    $('#past-turns').hidden=turns.length===0;$('#past-answers').replaceChildren();
    turns.forEach(turn=>{const p=node('p');p.append(node('b',turn.question),node('br'),document.createTextNode(turn.answer));$('#past-answers').append(p);});
    $('#demo-question').focus({preventScroll:true});
  }
  let demoOffline=false;
  async function start(){
    if(demoOffline){location.href='mailto:info@afiches.net?subject='+encodeURIComponent(t('Quiero una demo de Afiches','I would like an Afiches demo'));return;}
    if(busy)return;busy=true;status('');$('#demo-start').disabled=true;$('#demo-restart').disabled=true;
    try{const r=await post('/api/demo/start',{});session=r.id;step=0;question=r.question;turns=[];themes=[];$('#demo-restart').hidden=true;showQuestion();}
    catch(e){status(e.name==='TimeoutError'?t('La conexión está tardando. Probá otra vez.','The connection is taking too long. Please try again.'):e.message);}
    finally{busy=false;$('#demo-start').disabled=false;$('#demo-restart').disabled=false;}
  }
  $('#demo-start').addEventListener('click',start);$('#demo-reset').addEventListener('click',start);$('#demo-restart').addEventListener('click',start);
  $('#demo-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;const answer=$('#demo-answer').value.trim();if(answer.length<3){status(t('Contanos un poco más para poder seguir.','Tell us a bit more so we can continue.'));return;}
    busy=true;$('#demo-next').disabled=true;$('#demo-answer').readOnly=true;status(step===2?t('La IA está leyendo tus respuestas…','The AI is reading your answers…'):step===0?t('La IA está preparando una repregunta…','The AI is preparing a follow-up question…'):'');
    try{
      const response=await post('/api/demo/answer',{id:session,step,answer});if(response.id)session=response.id;turns.push({question,answer});status('');
      if(response.done)showResult(response.result);else{step=response.step;question=response.question;showQuestion();}
    }catch(e){status(e.name==='TimeoutError'?t('La respuesta está tardando. Tu texto sigue acá; probá otra vez.','The response is taking too long. Your text is still here; please try again.'):e.message);if(e.status===410||e.status===409)$('#demo-restart').hidden=false;}
    finally{busy=false;$('#demo-next').disabled=false;$('#demo-answer').readOnly=false;}
  });
  function showResult(result){
    themes=result.themes;$('#demo-form').hidden=true;$('#demo-result').hidden=false;$('#demo-progress').textContent=t('Tu resultado','Your result');phase(2);
    $('#result-summary').textContent=result.summary;$('#result-themes').replaceChildren();
    themes.forEach((theme,i)=>{const button=node('button',theme.name);button.type='button';button.style.setProperty('--chip',palette[i%4]);button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>selectTheme(i));$('#result-themes').append(button);});
    if(themes.length)selectTheme(0);else $('#theme-evidence').replaceChildren(node('p',t('No hay suficiente contenido para identificar temas con evidencia. Podés volver a probar con respuestas más detalladas.','There isn’t enough content to identify themes with evidence. Try again with more detailed answers.')));
    $('#demo-result .demo-question').focus({preventScroll:true});
  }
  function selectTheme(i){const theme=themes[i];$('#result-themes').querySelectorAll('button').forEach((b,index)=>b.setAttribute('aria-pressed',String(index===i)));$('#theme-evidence').replaceChildren(node('blockquote','“'+theme.quote+'”'),node('p',theme.reading));}
  const mail=(subject,body)=>{location.href='mailto:info@afiches.net?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);};
  $('#news-form').addEventListener('submit',event=>{
    event.preventDefault();const email=$('#news-email').value.trim();
    mail(t('Suscripción a los estudios de Afiches','Subscription to Afiches studies'),t('Hola, quiero recibir los nuevos estudios de Afiches en este mail: ','Hi, I would like to receive new Afiches studies at this email: ')+email);
    $('#news-status').textContent=t('Se abrió tu correo: enviá el mensaje para suscribirte.','Your email app opened: send the message to subscribe.');
  });
  $('#final-form').addEventListener('submit',event=>{
    event.preventDefault();const email=$('#final-email').value.trim(),message=$('#final-message').value.trim();
    mail(t('Consulta desde la web de Afiches','Inquiry from the Afiches website'),message+'\n\n'+t('Mail de contacto: ','Contact email: ')+email);
    $('#final-status').textContent=t('Se abrió tu correo con el mensaje listo para enviar.','Your email app opened with the message ready to send.');
  });
  $('#contact-form').addEventListener('submit',event=>{
    event.preventDefault();const email=$('#contact-email').value.trim(),message=$('#contact-message').value.trim();
    mail(t('Consulta desde la web de Afiches','Inquiry from the Afiches website'),message+'\n\n'+t('Mail de contacto: ','Contact email: ')+email);
    $('#contact-status').textContent=t('Se abrió tu correo con el mensaje listo para enviar.','Your email app opened with the message ready to send.');
  });

  let reports=[], selectedReport, selectedTarget;
  // target 'dashboard': se llegó desde el dashboard sin mail; al guardarlo se abre el dashboard.
  function openReport(report,target){selectedReport=report;selectedTarget=target;$('#selected-report').textContent=report.title;$('#report-status').textContent='';$('#report-download').hidden=true;$('#report-form button').disabled=false;$('#report-dialog').showModal();}
  $('.dialog-close').addEventListener('click',()=>$('#report-dialog').close());
  $('#report-form').addEventListener('submit',async event=>{
    event.preventDefault();const button=event.currentTarget.querySelector('button');button.disabled=true;$('#report-status').textContent=t('Registrando tu mail…','Saving your email…');
    try{const result=await post('/api/request-report',{email:$('#report-email').value,slug:selectedReport.slug});if(selectedTarget==='dashboard'&&result.dashboardUrl){$('#report-status').textContent=t('Listo. Abriendo el dashboard…','Done. Opening the dashboard…');location.href=result.dashboardUrl;return;}const link=$('#report-download');link.href=result.fileUrl;link.hidden=false;$('#report-status').textContent=t('Listo. Ya podés abrir el informe.','Done. You can now open the report.');window.open(result.fileUrl,'_blank','noopener');}
    catch(e){$('#report-status').textContent=e.message;}finally{button.disabled=false;}
  });
  fetch('/api/demo/status').then(async response=>{if(!response.ok)throw new Error('No pudimos conectar con la vista local.');return response.json();}).then(data=>{
    $('#demo-start').disabled=false;const startLabel=()=>{$('#demo-start').textContent=data.available?t('Empezar la entrevista ↗','Start the interview ↗'):t('Pedí una demo ↗','Request a demo ↗');};startLabel();document.addEventListener('langchange',startLabel);if(!data.available){demoOffline=true;}
    reports=data.reports;renderReports();document.addEventListener('langchange',renderReports);
    const params=new URLSearchParams(location.search);const report=reports.find(r=>r.slug===params.get('estudio'));if(report)openReport(report,params.get('ver'));
  }).catch(()=>{demoOffline=true;$('#demo-start').disabled=false;$('#demo-start').textContent=t('Pedí una demo ↗','Request a demo ↗');if(!$('#report-grid [data-slug]'))$('#report-grid').replaceChildren(node('p',t('No pudimos cargar los estudios. Probá recargar la página.','We couldn’t load the studies. Try reloading the page.')));});
  function renderReports(){const pre=[...$('#report-grid').querySelectorAll('[data-slug]')];if(pre.length){pre.forEach(card=>{const report=reports.find(r=>r.slug===card.dataset.slug);const b=card.querySelector('button');if(report&&b&&!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',()=>openReport({...report,title:card.querySelector('h3').textContent}));}
      // "Ver el dashboard": sin mail abre el cartel acá mismo (sin recargar la home); con mail va directo.
      const d=card.querySelector('.report-open');if(report&&d&&!d.dataset.bound){d.dataset.bound='1';d.addEventListener('click',async event=>{event.preventDefault();const href=d.getAttribute('href');
        try{const res=await fetch(href,{method:'HEAD',redirect:'manual',cache:'no-store'});if(res.type==='opaqueredirect'){openReport({...report,title:card.querySelector('h3').textContent},'dashboard');return;}}catch(e){}
        location.href=href;});}
    });return;}$('#report-grid').replaceChildren();reports.forEach(report=>{const card=node('article',undefined,'report-card');const cover=document.createElement('img');cover.className='report-cover';cover.alt='';cover.loading='lazy';cover.src='/studies/'+report.slug+'.jpg';cover.addEventListener('error',()=>cover.remove());card.append(cover,node('small',report.category+' · '+report.period),node('h3',report.title),node('p',report.summary));const button=node('button',t('Acceder al informe ↗','Access the report ↗'));button.addEventListener('click',()=>openReport(report));card.append(button);$('#report-grid').append(card);});}
  document.querySelectorAll('#qpipe button[data-q]').forEach(b=>b.addEventListener('click',()=>{const open=b.getAttribute('aria-expanded')!=='true';
    document.querySelectorAll('#qpipe button[data-q]').forEach(x=>x.setAttribute('aria-expanded',String(open&&x===b)));
    document.querySelectorAll('#qdetail [data-qd]').forEach(p=>{p.hidden=!(open&&p.dataset.qd===b.dataset.q);});}));
  // Servicios: la bolita elegida viaja al panel y se expande
  const stage=$('#svc-stage');
  if(stage){
    const balls=[...stage.querySelectorAll('.svc-ball')],panes=[...stage.querySelectorAll('.svc-pane')],bloom=stage.querySelector('.svc-bloom');
    const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const panel=stage.querySelector('.svc-panel'),colOf=n=>balls[n].style.getPropertyValue('--c');
    let current=0,busy=false;
    const swap=n=>{panes.forEach((p,i)=>{p.hidden=i!==n;p.classList.toggle('enter',i===n);});};
    const show=(n,fly)=>{
      if(fly&&(n===current||busy))return;const ball=balls[n],col=colOf(n),prev=colOf(current);
      balls.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===n));b.tabIndex=i===n?0:-1;});
      current=n;
      if(still||!fly){panel.style.background=col;bloom.style.background=col;swap(n);return;}
      busy=true;
      const target=panes.find(p=>!p.hidden).querySelector('.svc-big'),tr=target.getBoundingClientRect(),pr=panel.getBoundingClientRect();
      const cx=tr.left-pr.left+tr.width/2,cy=tr.top-pr.top+tr.height/2;
      const from=ball.querySelector('.svc-dot').getBoundingClientRect();
      const fl=document.createElement('span');fl.className='svc-flyer';fl.innerHTML=ball.querySelector('svg').outerHTML;
      Object.assign(fl.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px',background:col});document.body.append(fl);
      const dx=tr.left-from.left,dy=tr.top-from.top,sc=tr.width/from.width;
      panes.forEach(p=>p.classList.remove('enter'));
      fl.animate([{transform:'translate(0,0) scale(1)'},{transform:'translate('+dx*.5+'px,'+(dy*.5-70)+'px) scale('+(1+sc)/2+')',offset:.55},{transform:'translate('+dx+'px,'+dy+'px) scale('+sc+')'}],{duration:540,easing:'cubic-bezier(.5,0,.3,1)'}).onfinish=()=>{
        fl.remove();panel.style.background=prev;bloom.style.background=col;swap(n);
        bloom.animate([{clipPath:'circle(0px at '+cx+'px '+cy+'px)'},{clipPath:'circle(150% at '+cx+'px '+cy+'px)'}],{duration:620,easing:'cubic-bezier(.6,0,.2,1)'}).onfinish=()=>{panel.style.background=col;busy=false;};
      };
    };
    balls.forEach((b,i)=>{b.addEventListener('click',()=>show(i,true));
      b.addEventListener('keydown',e=>{const d=e.key==='ArrowRight'||e.key==='ArrowDown'?1:e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:0;if(!d)return;e.preventDefault();const n=(current+d+balls.length)%balls.length;balls[n].focus();show(n,true);});});
    show(0,false);
    new IntersectionObserver(([e])=>stage.classList.toggle('idle',!e.isIntersecting)).observe(stage);
  }
})();
