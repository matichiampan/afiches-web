(() => {
  const $ = selector => document.querySelector(selector);
  const palette=['#22d46a','#bae6fd','#ddd6fe','#f97316'];
  function node(tag, text, className) {const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
  async function post(url,data) {
    const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:AbortSignal.timeout(40000)});
    const result=await res.json();
    if(!res.ok){const error=new Error(result.error||'No pudimos completar la solicitud.');error.status=res.status;throw error;}return result;
  }
  const rail=node('nav',undefined,'journey');rail.setAttribute('aria-label',t('Seguí explorando Afiches','Keep exploring Afiches','Continue explorando a Afiches','Continuez à explorer Afiches'));
  const destinations=[['inicio', ['Inicio', 'Home','Início','Accueil'], '#ddd6fe', 'M5 12 12 5l7 7M8 10v9h8v-9'], ['redes', ['Alcance', 'Reach','Alcance','Portée'], '#f97316', 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9'], ['servicios', ['Servicios', 'Services','Serviços','Services'], '#22d46a', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'], ['resultados', ['Resultados', 'Results','Resultados','Résultats'], '#bae6fd', 'M6 18V9m6 9V5m6 13v-6'], ['estudios', ['Estudios', 'Studies','Estudos','Études'], '#ddd6fe', 'M7 4h7l4 4v12H7V4m7 0v5h4'], ['equipo', ['Equipo', 'Team','Equipe','Équipe'], '#f97316', 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8'], ['contactanos', ['Contacto', 'Contact','Contato','Contact'], '#bae6fd', 'M4 6h16v12H4zM4 7l8 6 8-6']];
  destinations.forEach(([id,label,color,path])=>{const a=node('a');a.href='#'+id;a.style.setProperty('--dot',color);a.setAttribute('aria-label',t(label[0],label[1],label[2],label[3]));a.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="'+path+'"/></svg><span><span class="es">'+label[0]+'</span><span class="en">'+label[1]+'</span><span class="pt">'+label[2]+'</span><span class="fr">'+label[3]+'</span></span>';rail.append(a);});rail.classList.add('top');(document.querySelector('.site-header')||document.body).append(rail);
  let frame=false;
  function markSection(){frame=false;let current='inicio';for(const [id] of destinations.slice(1)){const el=$('#'+id);if(el&&el.offsetParent!==null&&el.getBoundingClientRect().top<innerHeight*.4)current=id;}rail.querySelectorAll('a').forEach(a=>{if(a.hash==='#'+current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
  addEventListener('scroll',()=>{if(!frame){frame=true;requestAnimationFrame(markSection);}}, {passive:true});markSection();
  document.querySelectorAll('.orb.decorative').forEach(orb=>orb.addEventListener('pointerdown',()=>{orb.classList.remove('nudge');void orb.offsetWidth;orb.classList.add('nudge');}));
  const dots=($('.demo-steps')||{children:[]}).children;
  function phase(n){[...dots].forEach((el,i)=>el.classList.toggle('is-current',i===n));}
  let session, step=0, question='', turns=[], themes=[], busy=false, contactSaved=false;
  function status(message){$('#demo-status').textContent=message;}
  function showQuestion(){
    $('#demo-welcome').hidden=true;$('#demo-result').hidden=true;$('#demo-form').hidden=false;
    $('#demo-question').textContent=question;$('#demo-answer').value='';
    $('#demo-progress').textContent=[t('Pregunta 1 de 2','Question 1 of 2','Pergunta 1 de 2','Question 1 sur 2'),t('Repregunta de la IA','AI follow-up','Repergunta da IA','Relance de l\'IA'),t('Pregunta 2 de 2','Question 2 of 2','Pergunta 2 de 2','Question 2 sur 2')][step];
    $('#demo-hint').textContent=[t('Primero, tu opinión','First, your opinion','Primeiro, sua opinião','D\'abord, votre avis'),t('La IA retoma lo que dijiste','The AI picks up on what you said','A IA retoma o que você disse','L\'IA rebondit sur ce que vous avez dit'),t('Una última pregunta','One last question','Uma última pergunta','Une dernière question')][step];
    $('#demo-next').textContent=step===2?t('Ver mi resultado ↗','See my result ↗','Ver meu resultado ↗','Voir mon résultat ↗'):t('Continuar ↗','Continue ↗','Continuar ↗','Continuer ↗');phase(step===0?0:1);
    $('#past-turns').hidden=turns.length===0;$('#past-answers').replaceChildren();
    turns.forEach(turn=>{const p=node('p');p.append(node('b',turn.question),node('br'),document.createTextNode(turn.answer));$('#past-answers').append(p);});
    $('#demo-question').focus({preventScroll:true});
  }
  let demoOffline=false;
  async function start(){
    if(demoOffline){location.href='mailto:info@afiches.net?subject='+encodeURIComponent(t('Quiero una demo de Afiches','I would like an Afiches demo','Quero uma demo da Afiches','Je souhaite une démo d\'Afiches'));return;}
    if(busy)return;busy=true;status('');$('#demo-start').disabled=true;$('#demo-restart').disabled=true;
    try{const r=await post('/api/demo/start',{});session=r.id;step=0;question=r.question;turns=[];themes=[];$('#demo-restart').hidden=true;showQuestion();}
    catch(e){status(e.name==='TimeoutError'?t('La conexión está tardando. Probá otra vez.','The connection is taking too long. Please try again.','A conexão está demorando. Tente de novo.','La connexion est lente. Réessayez dans un instant.'):e.message);}
    finally{busy=false;$('#demo-start').disabled=false;$('#demo-restart').disabled=false;}
  }
  $('#demo-start').addEventListener('click',start);$('#demo-reset').addEventListener('click',start);$('#demo-restart').addEventListener('click',start);
  $('#demo-form').addEventListener('submit',async event=>{
    event.preventDefault();if(busy)return;const answer=$('#demo-answer').value.trim();if(answer.length<3){status(t('Contanos un poco más para poder seguir.','Tell us a bit more so we can continue.','Conte um pouco mais pra gente poder continuar.','Dites-nous-en un peu plus pour continuer.'));return;}
    busy=true;$('#demo-next').disabled=true;$('#demo-answer').readOnly=true;status(step===2?t('La IA está leyendo tus respuestas…','The AI is reading your answers…','A IA está lendo suas respostas…','L\'IA lit vos réponses…'):step===0?t('La IA está preparando una repregunta…','The AI is preparing a follow-up question…','A IA está preparando uma repergunta…','L\'IA prépare une relance…'):'');
    try{
      const response=await post('/api/demo/answer',{id:session,step,answer});if(response.id)session=response.id;turns.push({question,answer});status('');
      if(response.done)showResult(response.result);else{step=response.step;question=response.question;showQuestion();}
    }catch(e){status(e.name==='TimeoutError'?t('La respuesta está tardando. Tu texto sigue acá; probá otra vez.','The response is taking too long. Your text is still here; please try again.','A resposta está demorando. Seu texto continua aqui; tente de novo.','La réponse tarde. Votre texte est toujours là ; réessayez.'):e.message);if(e.status===410||e.status===409)$('#demo-restart').hidden=false;}
    finally{busy=false;$('#demo-next').disabled=false;$('#demo-answer').readOnly=false;}
  });
  function showResult(result){
    themes=result.themes;$('#demo-form').hidden=true;$('#demo-result').hidden=false;$('#demo-progress').textContent=t('Tu resultado','Your result','Seu resultado','Votre résultat');phase(2);
    $('#result-summary').textContent=result.summary;$('#result-themes').replaceChildren();
    themes.forEach((theme,i)=>{const button=node('button',theme.name);button.type='button';button.style.setProperty('--chip',palette[i%4]);button.setAttribute('aria-pressed','false');button.addEventListener('click',()=>selectTheme(i));$('#result-themes').append(button);});
    if(themes.length)selectTheme(0);else $('#theme-evidence').replaceChildren(node('p',t('No hay suficiente contenido para identificar temas con evidencia. Podés volver a probar con respuestas más detalladas.','There isn’t enough content to identify themes with evidence. Try again with more detailed answers.','Não há conteúdo suficiente para identificar temas com evidências. Você pode tentar de novo com respostas mais detalhadas.','Il n\'y a pas assez de contenu pour identifier des thèmes étayés par des preuves. Vous pouvez réessayer avec des réponses plus détaillées.')));
    $('#demo-result .demo-question').focus({preventScroll:true});
  }
  function selectTheme(i){const theme=themes[i];$('#result-themes').querySelectorAll('button').forEach((b,index)=>b.setAttribute('aria-pressed',String(index===i)));$('#theme-evidence').replaceChildren(node('blockquote','“'+theme.quote+'”'),node('p',theme.reading));}
  const mail=(subject,body)=>{location.href='mailto:info@afiches.net?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);};
  $('#news-form').addEventListener('submit',event=>{
    event.preventDefault();const email=$('#news-email').value.trim();
    mail(t('Suscripción a los estudios de Afiches','Subscription to Afiches studies','Inscrição nos estudos da Afiches','Abonnement aux études d\'Afiches'),t('Hola, quiero recibir los nuevos estudios de Afiches en este mail: ','Hi, I would like to receive new Afiches studies at this email: ','Olá, quero receber os novos estudos da Afiches neste e-mail: ','Bonjour, je souhaite recevoir les nouvelles études d\'Afiches à cette adresse : ')+email);
    $('#news-status').textContent=t('Se abrió tu correo: enviá el mensaje para suscribirte.','Your email app opened: send the message to subscribe.','Seu app de e-mail abriu: envie a mensagem pra se inscrever.','Votre messagerie s\'est ouverte : envoyez le message pour vous abonner.');
  });
  $('#final-form').addEventListener('submit',event=>{
    event.preventDefault();const email=$('#final-email').value.trim(),message=$('#final-message').value.trim();
    mail(t('Consulta desde la web de Afiches','Inquiry from the Afiches website','Contato pelo site da Afiches','Demande depuis le site d\'Afiches'),message+'\n\n'+t('Mail de contacto: ','Contact email: ','E-mail de contato: ','Mail de contact : ')+email);
    $('#final-status').textContent=t('Se abrió tu correo con el mensaje listo para enviar.','Your email app opened with the message ready to send.','Seu app de e-mail abriu com a mensagem pronta pra enviar.','Votre messagerie s\'est ouverte avec le message prêt à envoyer.');
  });
  $('#contact-form').addEventListener('submit',event=>{
    event.preventDefault();const email=$('#contact-email').value.trim(),message=$('#contact-message').value.trim();
    mail(t('Consulta desde la web de Afiches','Inquiry from the Afiches website','Contato pelo site da Afiches','Demande depuis le site d\'Afiches'),message+'\n\n'+t('Mail de contacto: ','Contact email: ','E-mail de contato: ','Mail de contact : ')+email);
    $('#contact-status').textContent=t('Se abrió tu correo con el mensaje listo para enviar.','Your email app opened with the message ready to send.','Seu app de e-mail abriu com a mensagem pronta pra enviar.','Votre messagerie s\'est ouverte avec le message prêt à envoyer.');
  });

  let reports=[], selectedReport, selectedTarget;
  // target 'dashboard': se llegó desde el dashboard sin mail; al guardarlo se abre el dashboard.
  function openReport(report,target){selectedReport=report;selectedTarget=target;$('#selected-report').textContent=report.title;$('#report-status').textContent='';$('#report-download').hidden=true;$('#report-form button').disabled=false;$('#report-dialog').showModal();}
  $('.dialog-close').addEventListener('click',()=>$('#report-dialog').close());
  $('#report-form').addEventListener('submit',async event=>{
    event.preventDefault();const button=event.currentTarget.querySelector('button');button.disabled=true;$('#report-status').textContent=t('Registrando tu mail…','Saving your email…','Registrando seu e-mail…','Enregistrement de votre adresse…');
    try{const result=await post('/api/request-report',{email:$('#report-email').value,slug:selectedReport.slug});if(selectedTarget==='dashboard'&&result.dashboardUrl){$('#report-status').textContent=t('Listo. Abriendo el dashboard…','Done. Opening the dashboard…','Pronto. Abrindo o dashboard…','C\'est prêt. Ouverture du tableau de bord…');location.href=result.dashboardUrl;return;}const link=$('#report-download');link.href=result.fileUrl;link.hidden=false;$('#report-status').textContent=t('Listo. Ya podés abrir el informe.','Done. You can now open the report.','Pronto. Já pode abrir o relatório.','C\'est prêt. Vous pouvez ouvrir le rapport.');window.open(result.fileUrl,'_blank','noopener');}
    catch(e){$('#report-status').textContent=e.message;}finally{button.disabled=false;}
  });
  // Consulta con contexto: quien llega desde un servicio (?servicio=) o pide una demo encuentra el mensaje ya empezado.
  const qp=new URLSearchParams(location.search),demoLinks=[...document.querySelectorAll('[data-demo]')];
  const prefill=text=>{const m=$('#final-message');if(m&&!m.value)m.value=text;if(location.hash==='#contactanos')addEventListener('load',()=>setTimeout(()=>{const c=document.getElementById('contactanos');if(c)c.scrollIntoView({behavior:'instant',block:'start'});},300));};
  const demoMsg=()=>t('Quiero coordinar una demo del entrevistador de IA. ','I would like to schedule a demo of the AI interviewer. ','Quero agendar uma demo do entrevistador de IA. ','Je souhaite planifier une démo de l\'enquêteur IA. ');
  if(qp.get('servicio'))prefill(t('Consulta por el servicio: ','Inquiry about: ','Contato sobre o serviço: ','Demande concernant\u00a0: ')+qp.get('servicio').slice(0,80)+'. ');
  demoLinks.forEach(l=>l.addEventListener('click',()=>{if(l.getAttribute('href')==='#contactanos')prefill(demoMsg());}));
  fetch('/api/demo/status').then(async response=>{if(!response.ok)throw new Error('No pudimos conectar con la vista local.');return response.json();}).then(data=>{
    $('#demo-start').disabled=false;const startLabel=()=>{$('#demo-start').textContent=data.available?t('Empezar la entrevista ↗','Start the interview ↗','Começar a entrevista ↗','Démarrer l\'entretien ↗'):t('Pedí una demo ↗','Request a demo ↗','Peça uma demo ↗','Demandez une démo ↗');};startLabel();document.addEventListener('langchange',startLabel);if(!data.available){demoOffline=true;if(qp.get('demo'))prefill(demoMsg());}else{demoLinks.forEach(l=>{l.setAttribute('href','#demo');l.textContent=t('Probar la demo','Try the demo','Experimentar a demo','Essayer la démo');});if(qp.get('demo'))location.hash='#demo';}
    reports=data.reports;renderReports();document.addEventListener('langchange',renderReports);
    const params=new URLSearchParams(location.search);const report=reports.find(r=>r.slug===params.get('estudio'));if(report)openReport(report,params.get('ver'));
  }).catch(()=>{demoOffline=true;if(qp.get('demo'))prefill(demoMsg());$('#demo-start').disabled=false;$('#demo-start').textContent=t('Pedí una demo ↗','Request a demo ↗','Peça uma demo ↗','Demandez une démo ↗');if(!$('#report-grid [data-slug]'))$('#report-grid').replaceChildren(node('p',t('No pudimos cargar los estudios. Probá recargar la página.','We couldn’t load the studies. Try reloading the page.','Não conseguimos carregar os estudos. Tente recarregar a página.','Nous n\'avons pas pu charger les études. Essayez de recharger la page.')));});
  function renderReports(){const pre=[...$('#report-grid').querySelectorAll('[data-slug]')];if(pre.length){pre.forEach(card=>{const report=reports.find(r=>r.slug===card.dataset.slug);const b=card.querySelector('button');if(report&&b&&!b.dataset.bound){b.dataset.bound='1';b.addEventListener('click',()=>openReport({...report,title:card.querySelector('h3').textContent}));}
      // "Ver el dashboard": sin mail abre el cartel acá mismo (sin recargar la home); con mail va directo.
      const d=card.querySelector('.report-open');if(report&&d&&!d.dataset.bound){d.dataset.bound='1';d.addEventListener('click',async event=>{event.preventDefault();const href=d.getAttribute('href');
        try{const res=await fetch(href,{method:'HEAD',redirect:'manual',cache:'no-store'});if(res.type==='opaqueredirect'){openReport({...report,title:card.querySelector('h3').textContent},'dashboard');return;}}catch(e){}
        location.href=href;});}
    });return;}$('#report-grid').replaceChildren();reports.filter(report=>['informe-streaming-septiembre-2026','reporte-fintech-q2-2026','seguridad-comparada-2026','informe-streaming-septiembre-2026'].includes(report.slug)).forEach(report=>{const card=node('article',undefined,'report-card');const cover=document.createElement('img');cover.className='report-cover';cover.alt='';cover.loading='lazy';cover.src=report.slug==='reporte-fintech-q2-2026'?'/studies/fintech.svg':report.slug==='seguridad-comparada-2026'?'/studies/seguridad.svg':'/studies/'+report.slug+'.jpg';cover.addEventListener('error',()=>cover.remove());card.append(cover,node('small',report.category||report.title),node('h3',report.title),node('p',report.summary));const button=node('button',t('Acceder al informe ↗','Access the report ↗','Acessar o relatório ↗','Accéder au rapport ↗'));button.addEventListener('click',()=>openReport(report));card.append(button);$('#report-grid').append(card);});}
  // (los pasos de la muestra validada se manejan en la landing)
  // Servicios: la bolita elegida viaja al panel y se expande.
  // La primera ("Encuestas online con IA") arranca abierta y muestra debajo su detalle (entrevistas, demo y resultados).
  const stage=$('#svc-stage');
  if(stage){
    const balls=[...stage.querySelectorAll('.svc-ball')],panes=[...stage.querySelectorAll('.svc-pane')],bloom=stage.querySelector('.svc-bloom');
    const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const panel=stage.querySelector('.svc-panel'),colOf=n=>balls[n].style.getPropertyValue('--c'),details=[...document.querySelectorAll('.svc-detail')],demo=$('#demo');
    let current=balls.findIndex(b=>b.getAttribute('aria-selected')==='true'),busy=false;
    // Cada bolita con detalle (0 = encuestas online con IA, 1 = entrevistas en profundidad) muestra el suyo debajo.
    // La demo está en las dos: se muda al detalle que esté abierto.
    const syncDetail=()=>{details.forEach(d=>{d.hidden=Number(d.dataset.for)!==current;});const slot=document.querySelector('.svc-detail:not([hidden]) .demo-slot');if(demo&&slot&&slot.nextElementSibling!==demo)slot.after(demo);};
    if(current>=0){const col=colOf(current);panel.style.background=col;bloom.style.background=col;}
    syncDetail();
    const swap=n=>{panes.forEach((p,i)=>{p.hidden=i!==n;p.classList.toggle('enter',i===n);});};
    const close=()=>{balls.forEach(b=>b.setAttribute('aria-selected','false'));current=-1;syncDetail();panel.classList.remove('open');panel.hidden=true;panes.forEach(p=>p.hidden=true);};
    const show=(n,fly)=>{
      if(busy)return;if(n===current){close();return;}
      if(current<0){balls.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===n));});current=n;syncDetail();const col=colOf(n);panel.hidden=false;panel.style.background=col;bloom.style.background=col;swap(n);panel.classList.remove('open');void panel.offsetWidth;panel.classList.add('open');return;}
      const ball=balls[n],col=colOf(n),prev=colOf(current);
      balls.forEach((b,i)=>{b.setAttribute('aria-selected',String(i===n));});
      current=n;syncDetail();
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
      b.addEventListener('keydown',e=>{const d=e.key==='ArrowRight'||e.key==='ArrowDown'?1:e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:0;if(!d)return;e.preventDefault();const i=balls.indexOf(document.activeElement),n=((i<0?0:i)+d+balls.length)%balls.length;balls.forEach((b,k)=>b.tabIndex=k===n?0:-1);balls[n].focus();});});
    balls.forEach((b,i)=>b.tabIndex=i?-1:0);
    new IntersectionObserver(([e])=>stage.classList.toggle('idle',!e.isIntersecting)).observe(stage);
    // Links a #demo, #cualitativas, #resultados o #calidad: abren la bolita que tiene ese contenido (la demo está en la 0 y en la 1)
    const owner={demo:[0,1],cualitativas:[1],resultados:[0],calidad:[0]};
    const need=id=>{const ok=owner[id];return ok&&!ok.includes(current)?ok[0]:-1;};
    // La demo arranca plegada (no se ve en la home): se abre con "Probar la demo" o con cualquier link a #demo.
    const reveal=()=>{const id=location.hash.slice(1),n=need(id),folded=id==='demo'&&demo&&demo.hidden;if(folded)demo.hidden=false;if(n>=0)show(n,false);if(n>=0||folded)requestAnimationFrame(()=>document.getElementById(id).scrollIntoView());};
    document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const id=a.hash.slice(1);if(id==='demo'&&demo)demo.hidden=false;const n=need(id);if(n>=0)show(n,false);},true);
    addEventListener('hashchange',reveal);reveal();
  }
  // Cinta de logos: una línea por grupo. Cada una repite sus logos hasta cubrir el ancho de la pantalla y corre a velocidad constante.
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
    const tracks=[...document.querySelectorAll('.mq-row .mq-track')];
    const fill=()=>tracks.forEach(track=>{
      const sets=track.querySelectorAll('.mq-set');if(sets.length<2)return;
      const [a,b]=sets,view=track.parentElement.getBoundingClientRect().width,w=()=>a.getBoundingClientRect().width;
      if(!view||!w())return;
      if(!track._base)track._base=[...a.children];
      for(let guard=0;w()<view&&guard<12;guard++)[a,b].forEach(set=>track._base.forEach(node=>{const c=node.cloneNode(true);c.setAttribute('aria-hidden','true');(c.tagName==='A'?[c]:[...c.querySelectorAll('a')]).forEach(l=>l.tabIndex=-1);set.append(c);}));
      track.style.animationDuration=Math.max(18,w()/32)+'s';
    });
    const go=()=>{fill();let t;addEventListener('resize',()=>{clearTimeout(t);t=setTimeout(fill,200);});};
    if(document.readyState==='complete')go();else addEventListener('load',go);
  }
})();
