// ===== Library rules — change here =====
const FINE=2, DAYS=14, RENEW_DAYS=7, MAXB=3, KEY='marginalia-v2';
const D=864e5, now=()=>Date.now();
const BOOKS=[['Database System Concepts','Silberschatz','Databases',1],['Introduction to Algorithms','Cormen','Algorithms',2],['Clean Code','Robert C. Martin','Software Eng.',2],['The Pragmatic Programmer','Hunt & Thomas','Software Eng.',2],['Operating System Concepts','Galvin','Systems',3],['Computer Networks','Tanenbaum','Networks',2],['Let Us C','Y. Kanetkar','Programming',4],['Design Patterns','Gamma et al.','Software Eng.',1],['AI: A Modern Approach','Russell & Norvig','AI',2],['Discrete Mathematics','Kenneth Rosen','Mathematics',3],['Python Crash Course','Eric Matthes','Programming',3],['Eloquent JavaScript','Marijn Haverbeke','Web',2],['You Don\'t Know JS','Kyle Simpson','Web',2],['Structure & Interpretation','Abelson & Sussman','Programming',1],['Computer Organization','Hamacher','Systems',2],['Data Mining','Han & Kamber','Databases',2],['Compilers: Principles','Aho & Ullman','Systems',1],['Linear Algebra','Gilbert Strang','Mathematics',2],['Wings of Fire','A. P. J. Abdul Kalam','Biography',3],['The Alchemist','Paulo Coelho','Fiction',3],['Gitanjali','R. Tagore','Poetry',2],['Ignited Minds','A. P. J. Abdul Kalam','Biography',2]];
const seed=()=>{const b=BOOKS.map((x,i)=>({id:i+1,title:x[0],author:x[1],cat:x[2],copies:x[3],avail:x[3],hue:(i*47+10)%360,isbn:'978-81-'+(1000+i*37)}));
 const L=[],mk=(bk,m,o,r)=>{const l={id:L.length+1,b:bk,m,out:now()-o*D,due:now()-o*D+DAYS*D};if(r!=null)l.ret=now()-r*D;else b.find(x=>x.id==bk).avail--;L.push(l)};
 mk(2,1,40,28);mk(5,2,35,25);mk(11,3,30,18);mk(3,1,26,13);mk(7,2,22,12);mk(1,3,20,8);mk(12,1,18,6);mk(10,2,16,5);mk(19,3,14,3);mk(20,1,12,2);mk(3,2,10,null);mk(1,2,20,null);mk(8,1,5,null);
 return{books:b,members:[{id:1,name:'Aarav Kulkarni',email:'aarav@example.com'},{id:2,name:'Meera Joshi',email:'meera@example.com'},{id:3,name:'Rohan Patil',email:'rohan@example.com'}],loans:L,res:[{b:1,m:3,t:now()-D}],log:[]}};
let S;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}if(!S)S=seed();
let curRole='Member',me=1,tab='Discover',q='',cat='All',acting=1;
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const bk=id=>S.books.find(b=>b.id==id),mb=id=>S.members.find(m=>m.id==id),fmt=t=>new Date(t).toLocaleDateString('en-IN',{day:'numeric',month:'short'});
const days=l=>Math.ceil(((l.ret||now())-l.due)/D),fine=l=>l.paid?0:Math.max(0,days(l))*FINE;
const open=m=>S.loans.filter(l=>l.m==m&&!l.ret),owed=m=>S.loans.filter(l=>l.m==m).reduce((s,l)=>s+fine(l),0);
const toast=t=>{const e=$('toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2400)};
const logit=t=>{S.log.unshift({t:now(),x:t});S.log=S.log.slice(0,30)};
const cover=b=>`<div class="cover" style="background:linear-gradient(160deg,hsl(${b.hue} 45% 38%),hsl(${(b.hue+30)%360} 50% 22%))"><b>${esc(b.title)}</b><small>${esc(b.author)}</small></div>`;
const target=()=>curRole=='Member'?me:acting;
// ===== actions =====
function issue(id,m=target()){const b=bk(id),u=mb(m);if(!u)return toast('Pick a member');
 if(open(m).length>=MAXB)return toast(u.name+' reached the limit of '+MAXB+' books');
 if(owed(m)>0)return toast('Pending fine ₹'+owed(m)+' — pay it first');
 if(b.avail<1)return toast('No copy available — reserve it');
 const q=S.res.filter(r=>r.b==id);if(q.length&&q[0].m!=m&&b.avail<=q.length)return toast('Copies are held for the reservation queue');
 b.avail--;S.loans.push({id:Math.max(0,...S.loans.map(l=>l.id))+1,b:id,m,out:now(),due:now()+DAYS*D});S.res=S.res.filter(r=>!(r.b==id&&r.m==m));
 logit(`${u.name} borrowed “${b.title}”`);save();toast('Issued · due '+fmt(now()+DAYS*D));render(true)}
function ret(id){const l=S.loans.find(x=>x.id==id);l.ret=now();bk(l.b).avail++;l.fine=fine(l);const nx=S.res.find(r=>r.b==l.b);
 logit(`${mb(l.m).name} returned “${bk(l.b).title}”`+(l.fine?` · fine ₹${l.fine}`:''));save();toast((l.fine?'Returned · fine ₹'+l.fine:'Returned on time')+(nx?' · notify '+mb(nx.m).name:''));render(true)}
function renew(id){const l=S.loans.find(x=>x.id==id);if(l.renewed)return toast('Already renewed once');if(days(l)>0)return toast('Overdue books cannot be renewed');
 if(S.res.some(r=>r.b==l.b))return toast('Someone has reserved this book');l.due+=RENEW_DAYS*D;l.renewed=1;logit(`${mb(l.m).name} renewed “${bk(l.b).title}”`);save();toast('Renewed · new due '+fmt(l.due));render()}
function pay(m){S.loans.filter(l=>l.m==m).forEach(l=>{if(fine(l)>0){l.fine=fine(l);l.paid=1}});logit(mb(m).name+' paid fines');save();toast('Fine paid — thank you');render()}
function reserve(id,m=target()){if(S.res.some(r=>r.b==id&&r.m==m))return toast('Already in the queue');if(open(m).some(l=>l.b==id))return toast('You already have this book');
 S.res.push({b:id,m,t:now()});save();toast('Reserved — position #'+S.res.filter(r=>r.b==id).length);render(true)}
function cancelRes(id,m){S.res=S.res.filter(r=>!(r.b==id&&r.m==m));save();render()}
function addBook(f){if(!f.t.value)return toast('Enter a title');const c=+f.c.value||1;S.books.push({id:Math.max(0,...S.books.map(b=>b.id))+1,title:f.t.value,author:f.a.value||'Unknown',cat:f.k.value||'General',copies:c,avail:c,hue:Math.floor(Math.random()*360),isbn:'978-81-'+Math.floor(1000+Math.random()*9000)});logit('Added “'+f.t.value+'”');save();toast('Book added');render()}
function addMem(f){if(!f.n.value)return toast('Enter a name');S.members.push({id:Math.max(0,...S.members.map(m=>m.id))+1,name:f.n.value,email:f.e.value});logit('Registered '+f.n.value);save();toast('Member registered');render(true)}
function csv(){const r=[['Book','Member','Issued','Due','Returned','Fine']];S.loans.forEach(l=>r.push([bk(l.b).title,mb(l.m).name,fmt(l.out),fmt(l.due),l.ret?fmt(l.ret):'',fine(l)]));
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([r.map(x=>x.map(c=>`"${c}"`).join(',')).join('\n')],{type:'text/csv'}));a.download='loans.csv';a.click()}
function reset(){if(confirm('Reset everything to the sample library?')){S=seed();save();render(true)}}
function show(id){const b=bk(id),q=S.res.filter(r=>r.b==id),m=target(),mine=open(m).find(l=>l.b==id);
 $('dlg').innerHTML=`<button class="x" onclick="dlg.close()" aria-label="Close">×</button><div class="dlg">${cover(b)}<div><h4>${esc(b.title)}</h4><div class="mute">${esc(b.author)}</div><p style="margin:10px 0 4px"><span class="tag">${esc(b.cat)}</span> <span class="tag ${b.avail?'ok':'bad'}">${b.avail}/${b.copies} available</span></p><p class="mute" style="margin:4px 0">ISBN ${b.isbn} · Shelf ${b.cat.slice(0,3).toUpperCase()}-${String(b.id).padStart(3,'0')}${q.length?` · ${q.length} waiting`:''}</p>
 <div class="acts">${b.avail?`<button class="b" onclick="issue(${id});dlg.close()">${curRole=='Member'?'Borrow':'Issue to '+esc(mb(m).name.split(' ')[0])}</button>`:''}<button class="b alt" onclick="reserve(${id});dlg.close()">Reserve</button>${mine?`<span class="mute">You hold this · due ${fmt(mine.due)}</span>`:''}</div></div></div>`;$('dlg').showModal()}
// ===== views =====
const tbl=(h,r)=>`<div class="wrap"><table><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr>${r.map(x=>`<tr>${x.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</table></div>`;
const empty=t=>`<p class="mute">${t}</p>`;
const stat=(n,l,c='')=>`<div class="stat"><b class="${c}">${n}</b><span>${l}</span></div>`;
function bars(){const c={};S.loans.forEach(l=>{const k=bk(l.b).cat;c[k]=(c[k]||0)+1});const e=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,7),mx=e[0]?e[0][1]:1;
 return e.map(([k,n])=>`<div class="hb"><span>${esc(k)}</span><i style="width:${n/mx*60}%"></i><span class="mute">${n}</span></div>`).join('')||empty('No loans yet.')}
const V={
Discover(){const cs=['All',...new Set(S.books.map(b=>b.cat))],L=S.books.filter(b=>(cat=='All'||b.cat==cat)&&(b.title+b.author).toLowerCase().includes(q.toLowerCase()));
 const first=!q&&cat=='All'?`<section class="hero"><div><h2>Find your next read, reserve it, renew it.</h2><p>${S.books.length} titles · ${S.books.reduce((s,b)=>s+b.avail,0)} copies on the shelf right now. Borrow for ${DAYS} days; late returns cost ₹${FINE} a day.</p></div><div class="shelf">${S.books.slice(0,14).map((b,i)=>`<i style="height:${55+(i*29)%50}px;background:hsl(${b.hue} 45% 40%)"></i>`).join('')}</div></section>`:'';
 return first+`<div class="bar"><input id="q" type="search" placeholder="Search title or author…" value="${esc(q)}"></div><div class="chips">${cs.map(c=>`<button class="${c==cat?'on':''}" onclick="cat='${c.replace(/'/g,"\\'")}';render()">${esc(c)}</button>`).join('')}</div>
 <div class="books">${L.map(b=>`<button class="bk" onclick="show(${b.id})">${cover(b)}<div class="st"><span class="tag ${b.avail?'ok':'bad'}">${b.avail?b.avail+' in':'all out'}</span></div></button>`).join('')||empty('No books match.')}</div>`},
'My Shelf'(){const m=me,ls=open(m),rs=S.res.filter(r=>r.m==m),f=owed(m);
 return`<div class="stats">${stat(ls.length+'/'+MAXB,'borrowed')}${stat(ls.filter(l=>days(l)>0).length,'overdue',ls.some(l=>days(l)>0)?'bad':'')}${stat('₹'+f,'fines due',f?'bad':'')}${stat(rs.length,'reservations')}</div>
 ${f?`<p><button class="b" onclick="pay(${m})">Pay ₹${f} fine</button></p>`:''}<h3>On loan</h3>${ls.length?tbl(['Book','Due','Status',''],ls.map(l=>[`<i>${esc(bk(l.b).title)}</i>`,fmt(l.due),days(l)>0?`<span class="tag bad">${days(l)}d late · ₹${fine(l)}</span>`:days(l)>-3?'<span class="tag warn">due soon</span>':'<span class="tag ok">on time</span>',`<button class="b sm alt" onclick="renew(${l.id})">Renew</button>`])):empty('Nothing borrowed. Browse Discover to start.')}
 <h3>Reservations</h3>${rs.length?tbl(['Book','Queue',''],rs.map(r=>[esc(bk(r.b).title),'#'+(S.res.filter(x=>x.b==r.b).findIndex(x=>x.m==m)+1)+(bk(r.b).avail?' — available now':''),`<button class="b sm alt" onclick="cancelRes(${r.b},${m})">Cancel</button>`])):empty('No reservations.')}
 <h3>History</h3>${tbl(['Book','Returned','Fine'],S.loans.filter(l=>l.m==m&&l.ret).reverse().map(l=>[esc(bk(l.b).title),fmt(l.ret),l.fine?'₹'+l.fine:'—'])) }`},
Circulation(){const a=open(0),all=S.loans.filter(l=>!l.ret).sort((x,y)=>x.due-y.due);
 return`<div class="bar"><select id="act">${S.members.map(m=>`<option value="${m.id}"${m.id==acting?' selected':''}>Issue as: ${esc(m.name)}</option>`).join('')}</select><span class="mute" style="align-self:center">Open any book in Discover to issue it to this member.</span></div>
 <h3>Books out (${all.length})</h3>${all.length?tbl(['Book','Member','Due','Fine',''],all.map(l=>[`<i>${esc(bk(l.b).title)}</i>`,esc(mb(l.m).name),fmt(l.due)+(days(l)>0?` <span class="tag bad">${days(l)}d late</span>`:''),fine(l)?'₹'+fine(l):'—',`<button class="b sm" onclick="ret(${l.id})">Return</button>`])):empty('All books are in.')}
 <h3>Reservation queue</h3>${S.res.length?tbl(['Book','Member','Status'],S.res.map(r=>[esc(bk(r.b).title),esc(mb(r.m).name),bk(r.b).avail?'<span class="tag ok">ready — notify</span>':'<span class="tag">waiting</span>'])):empty('Empty.')}`},
Members(){return`${tbl(['#','Name','Email','Borrowed','Fines'],S.members.map(m=>[m.id,esc(m.name),esc(m.email||'—'),open(m.id).length+'/'+MAXB,owed(m.id)?`<span class="bad">₹${owed(m.id)}</span>`:'—']))}
 <h3>Register member</h3><form class="form" id="nm" onsubmit="return false"><input name="n" placeholder="Full name"><input name="e" type="email" placeholder="Email"><button class="b" onclick="addMem($('nm'))">Register</button></form>`},
Dashboard(){const a=S.loans.filter(l=>!l.ret),od=a.filter(l=>days(l)>0);
 return`<div class="stats">${stat(S.books.reduce((s,b)=>s+b.copies,0),'copies')}${stat(a.length,'on loan')}${stat(od.length,'overdue',od.length?'bad':'')}${stat(S.members.length,'members')}${stat('₹'+S.loans.reduce((s,l)=>s+fine(l),0),'fines pending')}</div>
 <div class="two"><div class="card"><h3 style="margin-top:0">Loans by category</h3>${bars()}</div><div class="card"><h3 style="margin-top:0">Recent activity</h3>${S.log.length?S.log.slice(0,7).map(e=>`<div style="margin:6px 0"><span class="mute">${fmt(e.t)}</span> ${esc(e.x)}</div>`).join(''):empty('Activity appears here as books move.')}</div></div>`},
Catalog(){return`${tbl(['Title','Author','Category','Copies','In'],S.books.map(b=>[`<i>${esc(b.title)}</i>`,esc(b.author),esc(b.cat),b.copies,b.avail]))}
 <h3>Add a book</h3><form class="form" id="nb" onsubmit="return false"><input name="t" placeholder="Title"><input name="a" placeholder="Author"><input name="k" placeholder="Category"><input name="c" type="number" min="1" placeholder="Copies"><button class="b" onclick="addBook($('nb'))">Add</button></form>`},
Reports(){const c={};S.loans.forEach(l=>c[l.b]=(c[l.b]||0)+1);const top=Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,5),mx=top[0]?top[0][1]:1,def=S.loans.filter(l=>!l.ret&&days(l)>0);
 return`<div class="two"><div class="card"><h3 style="margin-top:0">Most borrowed</h3>${top.map(([id,n])=>`<div class="hb"><span style="width:140px">${esc(bk(id).title)}</span><i style="width:${n/mx*45}%"></i><span class="mute">${n}</span></div>`).join('')||empty('No data.')}</div><div class="card"><h3 style="margin-top:0">Defaulters</h3>${def.length?def.map(l=>`<div style="margin:6px 0"><b>${esc(mb(l.m).name)}</b> — ${esc(bk(l.b).title)} <span class="bad">₹${fine(l)}</span></div>`).join(''):empty('None 🎉')}</div></div>
 <p style="margin-top:20px"><button class="b" onclick="csv()">Export loans (CSV)</button> <button class="b alt" onclick="reset()">Reset sample data</button></p>`}};
const TABS={Member:['Discover','My Shelf'],Librarian:['Discover','Circulation','Members'],Admin:['Dashboard','Discover','Catalog','Members','Reports']};
function render(keep){if(!TABS[curRole].includes(tab))tab=TABS[curRole][0];
 $('roles').innerHTML=['Member','Librarian','Admin'].map(r=>`<button class="${r==curRole?'on':''}" onclick="curRole='${r}';tab=TABS[curRole][0];render()">${r}</button>`).join('');
 $('who').style.display=curRole=='Member'?'':'none';$('who').innerHTML=S.members.map(m=>`<option value="${m.id}"${m.id==me?' selected':''}>${esc(m.name)}</option>`).join('');
 $('nav').innerHTML=TABS[curRole].map(t=>`<button class="${t==tab?'on':''}" onclick="tab='${t}';render()">${t}</button>`).join('');
 const y=scrollY;$('m').innerHTML=V[tab]();
 const Q=$('q');if(Q)Q.oninput=e=>{q=e.target.value;const p=e.target.selectionStart;render();const n=$('q');n.focus();n.setSelectionRange(p,p)};
 const A=$('act');if(A)A.onchange=e=>{acting=+e.target.value;render()};if(keep)scrollTo(0,y)}
$('who').onchange=e=>{me=+e.target.value;render()};
$('th').onclick=()=>{const r=document.documentElement,d=r.dataset.theme=='dark';r.dataset.theme=d?'light':'dark';try{localStorage.setItem('marginalia-theme',r.dataset.theme)}catch(e){}};
try{const t=localStorage.getItem('marginalia-theme')||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}
render();
