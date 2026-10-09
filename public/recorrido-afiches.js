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
  const destinations=[['inicio',['Inicio','Home'],'#ddd6fe','M5 12 12 5l7 7M8 10v9h8v-9'],['redes',['Alcance','Reach'],'#f97316','M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9'],['calidad',['Calidad','Quality'],'#22d46a','M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9 12l2 2 4-4'],['diferencia',['Por qué Afiches','Why Afiches'],'#bae6fd','M5 12l5 5 9-10'],['demo',['Demo','Demo'],'#ddd6fe','M5 5h14v11H9l-4 4V5'],['proceso',['Proceso','Process'],'#f97316','M4 12h4l3-6 4 12 3-6h2'],['resultados',['Resultados','Results'],'#22d46a','M6 18V9m6 9V5m6 13v-6'],['estudios',['Estudios','Studies'],'#bae6fd','M7 4h7l4 4v12H7V4m7 0v5h4'],['equipo',['Equipo','Team'],'#ddd6fe','M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8'],['servicios',['Servicios','Services'],'#f97316','M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],['preguntas',['Preguntas','FAQ'],'#22d46a','M9 9a3 3 0 1 1 4 2.8c-.6.3-1 .9-1 1.6V15M12 18h.01']];
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
    catch(e){status(e.name==='TimeoutError'?'La conexión está tardando. Probá otra vez.':e.message);}
    finally{busy=false;$('#demo-start').disabled=false;$('#demo-restart').disabled=false;}
  }
  $('#demo-start').addEventListener('click',start);$('#demo-reset').addEventListener('click',start);$('#demo-restart').addEventListener('click',start);
  $('#demo-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;const answer=$('#demo-answer').value.trim();if(answer.length<3){status('Contanos un poco más para poder seguir.');return;}
    busy=true;$('#demo-next').disabled=true;$('#demo-answer').readOnly=true;status(step===2?'La IA está leyendo tus respuestas…':step===0?'La IA está preparando una repregunta…':'');
    try{
      const response=await post('/api/demo/answer',{id:session,step,answer});if(response.id)session=response.id;turns.push({question,answer});status('');
      if(response.done)showResult(response.result);else{step=response.step;question=response.question;showQuestion();}
    }catch(e){status(e.name==='TimeoutError'?'La respuesta está tardando. Tu texto sigue acá; probá otra vez.':e.message);if(e.status===410||e.status===409)$('#demo-restart').hidden=false;}
    finally{busy=false;$('#demo-next').disabled=false;$('#demo-answer').readOnly=false;}
  });
  function showResult(result){
    themes=result.themes;$('#demo-form').hidden=true;$('#demo-result').hidden=false;$('#demo-progress').textContent=t('Tu resultado','Your result');phase(2);
    $('#result-summary').textContent=result.summary;$('#result-themes').replaceChildren();
    themes.forEach((theme,i)=>{const button=node('button',theme.name);button.type='button';button.style.setProperty('--chip',palette[i%4]);button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>selectTheme(i));$('#result-themes').append(button);});
    if(themes.length)selectTheme(0);else $('#theme-evidence').replaceChildren(node('p','No hay suficiente contenido para identificar temas con evidencia. Podés volver a probar con respuestas más detalladas.'));
    $('#demo-result .demo-question').focus({preventScroll:true});
  }
  function selectTheme(i){const theme=themes[i];$('#result-themes').querySelectorAll('button').forEach((b,index)=>b.setAttribute('aria-pressed',String(index===i)));$('#theme-evidence').replaceChildren(node('blockquote','“'+theme.quote+'”'),node('p',theme.reading));}
  const mail=(subject,body)=>{location.href='mailto:info@afiches.net?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);};
  $('#news-form').addEventListener('submit',event=>{
    event.preventDefault();const email=$('#news-email').value.trim();
    mail(t('Suscripción a los estudios de Afiches','Subscription to Afiches studies'),t('Hola, quiero recibir los nuevos estudios de Afiches en este mail: ','Hi, I would like to receive new Afiches studies at this email: ')+email);
    $('#news-status').textContent=t('Se abrió tu correo: enviá el mensaje para suscribirte.','Your email app opened: send the message to subscribe.');
  });
  $('#contact-form').addEventListener('submit',event=>{
    event.preventDefault();const email=$('#contact-email').value.trim(),message=$('#contact-message').value.trim();
    mail(t('Consulta desde la web de Afiches','Inquiry from the Afiches website'),message+'\n\n'+t('Mail de contacto: ','Contact email: ')+email);
    $('#contact-status').textContent=t('Se abrió tu correo con el mensaje listo para enviar.','Your email app opened with the message ready to send.');
  });

  let reports=[], selectedReport;
  function openReport(report){selectedReport=report;$('#selected-report').textContent=report.title;$('#report-status').textContent='';$('#report-download').hidden=true;$('#report-form button').disabled=false;$('#report-dialog').showModal();}
  $('.dialog-close').addEventListener('click',()=>$('#report-dialog').close());
  $('#report-form').addEventListener('submit',async event=>{
    event.preventDefault();const button=event.currentTarget.querySelector('button');button.disabled=true;$('#report-status').textContent='Registrando tu mail…';
    try{const result=await post('/api/request-report',{email:$('#report-email').value,slug:selectedReport.slug});const link=$('#report-download');link.href=result.fileUrl;link.download='';link.hidden=false;$('#report-status').textContent='Mail guardado. Tu estudio está listo.';link.click();}
    catch(e){$('#report-status').textContent=e.message;}finally{button.disabled=false;}
  });
  fetch('/api/demo/status').then(async response=>{if(!response.ok)throw new Error('No pudimos conectar con la vista local.');return response.json();}).then(data=>{
    $('#demo-start').disabled=false;const startLabel=()=>{$('#demo-start').textContent=data.available?t('Empezar la entrevista ↗','Start the interview ↗'):t('Pedí una demo ↗','Request a demo ↗');};startLabel();document.addEventListener('langchange',startLabel);if(!data.available){demoOffline=true;}
    reports=data.reports;renderReports();document.addEventListener('langchange',renderReports);
    const requested=new URLSearchParams(location.search).get('estudio');const report=reports.find(r=>r.slug===requested);if(report)openReport(report);
  }).catch(()=>{demoOffline=true;$('#demo-start').disabled=false;$('#demo-start').textContent=t('Pedí una demo ↗','Request a demo ↗');if(!$('#report-grid [data-slug]'))$('#report-grid').replaceChildren(node('p',t('No pudimos cargar los estudios. Probá recargar la página.','We couldn’t load the studies. Try reloading the page.')));});
  function renderReports(){const pre=[...$('#report-grid').querySelectorAll('[data-slug]')];if(pre.length){pre.forEach(card=>{const report=reports.find(r=>r.slug===card.dataset.slug);const b=card.querySelector('button');if(report&&b&&!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',()=>openReport({...report,title:card.querySelector('h3').textContent}));}});return;}$('#report-grid').replaceChildren();reports.forEach(report=>{const card=node('article',undefined,'report-card');const cover=document.createElement('img');cover.className='report-cover';cover.alt='';cover.loading='lazy';cover.src='/studies/'+report.slug+'.jpg';cover.addEventListener('error',()=>cover.remove());card.append(cover,node('small',report.category+' · '+report.period),node('h3',report.title),node('p',report.summary));const button=node('button',t('Descargar estudio ↗','Download study ↗'));button.addEventListener('click',()=>openReport(report));card.append(button);$('#report-grid').append(card);});}
})();
