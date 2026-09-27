const profiles=[{id:1,name:"Mia",age:29,distance:"0,4 km",emoji:"🌸",bio:"Kaffee, Musik & spontane Abende",offset:[.003,.004]},{id:2,name:"Lena",age:32,distance:"0,8 km",emoji:"✨",bio:"Reisen, Kunst & gutes Essen",offset:[-.004,.006]},{id:3,name:"Sophie",age:27,distance:"1,1 km",emoji:"🌻",bio:"Naturmensch mit Humor",offset:[-.007,-.004]},{id:4,name:"Nina",age:35,distance:"1,4 km",emoji:"🎧",bio:"Elektronische Musik & Nachtleben",offset:[.005,-.006]},{id:5,name:"Anna",age:30,distance:"1,8 km",emoji:"🦋",bio:"Filme, Bücher & lange Gespräche",offset:[.008,.002]},{id:6,name:"Julia",age:28,distance:"2,2 km",emoji:"☀️",bio:"Sportlich, neugierig, entspannt",offset:[-.002,-.009]}];const liked=new Set(JSON.parse(localStorage.getItem("mapdate-liked")||"[]"));const me=JSON.parse(localStorage.getItem("mapdate-profile")||'{"name":"Du","age":30,"bio":"Erzähl etwas über dich…","emoji":"🙂"}');let userPos=[52.03,8.53];const map=L.map("map",{zoomControl:true}).setView(userPos,14);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap contributors"}).addTo(map);const userIcon=L.divIcon({className:"user-marker",html:"<div></div>",iconSize:[18,18],iconAnchor:[9,9]});let userMarker=L.marker(userPos,{icon:userIcon}).addTo(map),markers=[];function profileIcon(p){return L.divIcon({className:"profile-marker",html:`<div>${p.emoji}</div>`,iconSize:[40,40],iconAnchor:[20,20]})}function placeProfiles(){markers.forEach(m=>m.remove());markers=profiles.map(p=>{const m=L.marker([userPos[0]+p.offset[0],userPos[1]+p.offset[1]],{icon:profileIcon(p)}).addTo(map);m.on("click",()=>showProfile(p.id));return m})}function render(){document.querySelector("#profiles").innerHTML=profiles.map(p=>`<article class="card" data-id="${p.id}"><div class="avatar">${p.emoji}</div><div class="name">${p.name}, ${p.age}</div><div class="meta">📍 ${p.distance}</div><div class="meta">${p.bio}</div><button class="interest ${liked.has(p.id)?"liked":""}">${liked.has(p.id)?"♥ Interesse gesendet":"♥ Interesse"}</button></article>`).join("");document.querySelectorAll(".interest").forEach((b,i)=>b.onclick=e=>{e.stopPropagation();toggleLike(profiles[i].id)});document.querySelectorAll(".card").forEach(c=>c.onclick=()=>showProfile(+c.dataset.id));document.querySelector("#countText").textContent=profiles.length+" Profile · Demo";placeProfiles()}function toggleLike(id){liked.has(id)?liked.delete(id):liked.add(id);localStorage.setItem("mapdate-liked",JSON.stringify([...liked]));render();toast(liked.has(id)?"Interesse gesendet ♥":"Interesse zurückgenommen")}function showProfile(id){const p=profiles.find(x=>x.id===id);toast(`${p.name}, ${p.age} · ${p.distance}`)}function toast(msg){const t=document.querySelector("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>t.classList.remove("show"),1800)}function showView(view){const cards=document.querySelector("#profiles"),head=document.querySelector("#viewTitle"),pv=document.querySelector("#profileView");pv.classList.remove("show");cards.style.display="grid";head.style.display="flex";if(view==="likes"){cards.innerHTML=profiles.filter(p=>liked.has(p.id)).map(p=>`<article class="card"><div class="avatar">${p.emoji}</div><div class="name">${p.name}, ${p.age}</div><div class="meta">♥ Interesse gesendet</div></article>`).join("")||"<p class='meta'>Noch keine Likes.</p>";head.querySelector("h1").textContent="Deine Likes";head.querySelector("p").textContent="Gespeichert auf diesem Gerät";}else if(view==="chats"){cards.innerHTML="<p class='meta'>Noch keine Matches. Wenn zwei Menschen Interesse zeigen, entsteht hier ein Chat.</p>";head.querySelector("h1").textContent="Chats";head.querySelector("p").textContent="Matches erscheinen hier";}else if(view==="profile"){cards.style.display="none";head.style.display="none";pv.classList.add("show");pv.innerHTML=`<h2>Dein Profil</h2><div class="avatar">${me.emoji}</div><input id="meName" value="${me.name}" placeholder="Name"><input id="meAge" type="number" value="${me.age}" placeholder="Alter"><textarea id="meBio" rows="4" placeholder="Über dich">${me.bio}</textarea><button class="save-btn" id="saveMe">Profil speichern</button>`;document.querySelector("#saveMe").onclick=()=>{const x={name:document.querySelector("#meName").value,age:Number(document.querySelector("#meAge").value),bio:document.querySelector("#meBio").value,emoji:me.emoji};localStorage.setItem("mapdate-profile",JSON.stringify(x));Object.assign(me,x);toast("Profil gespeichert ✓")}}else{head.querySelector("h1").textContent="In deiner Nähe";head.querySelector("p").textContent=profiles.length+" Profile · Demo";render()}}document.querySelector("#locateBtn").onclick=()=>{if(!navigator.geolocation)return toast("GPS wird nicht unterstützt");navigator.geolocation.getCurrentPosition(pos=>{userPos=[pos.coords.latitude,pos.coords.longitude];userMarker.setLatLng(userPos);map.setView(userPos,15);placeProfiles();document.querySelector("#locationStatus").textContent="GPS aktiv · Position nur lokal";toast("Standort gefunden")},()=>toast("Standortzugriff abgelehnt"))};document.querySelector("#filterBtn").onclick=()=>toast("Filter kommen als Nächstes");document.querySelectorAll(".nav-item").forEach(n=>n.onclick=()=>{document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));n.classList.add("active");showView(n.dataset.view)});render();\nif ("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));\n
// MapDate Supabase auth
const SUPABASE_URL="https://jqdyygwybdypevaubsqe.supabase.co";
const SUPABASE_KEY="sb_publishable_Nn5XOfql7Bn9Uz8fyvzg2Q_E7LRymVQ";
const db=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
async function loadRemoteProfile(){
  const {data:{user}}=await db.auth.getUser();
  if(!user)return null;
  const {data}=await db.from("profiles").select("*").eq("id",user.id).maybeSingle();
  return data;
}
async function saveRemoteProfile(){
  const {data:{user}}=await db.auth.getUser();
  if(!user)return toast("Bitte zuerst anmelden");
  const row={id:user.id,display_name:document.querySelector("#meName").value.trim(),birth_year:new Date().getFullYear()-Number(document.querySelector("#meAge").value),bio:document.querySelector("#meBio").value.trim()};
  const {error}=await db.from("profiles").upsert(row);
  if(error)return toast("Speichern fehlgeschlagen");
  Object.assign(me,{name:row.display_name,age:Number(document.querySelector("#meAge").value),bio:row.bio});
  localStorage.setItem("mapdate-profile",JSON.stringify(me));
  toast("Profil gespeichert ✓");
}
async function authView(){
 const pv=document.querySelector("#profileView"), av=document.querySelector("#authView");
 pv.classList.remove("show");av.classList.add("show");
 const {data:{user}}=await db.auth.getUser();
 av.innerHTML=user?'<h2>Angemeldet</h2><p class="meta">'+user.email+'</p><button class="save-btn" id="logout">Abmelden</button>':'<h2>MapDate Konto</h2><input id="authEmail" type="email" placeholder="E-Mail"><input id="authPassword" type="password" placeholder="Passwort (mind. 6 Zeichen)"><button class="save-btn" id="signup">Registrieren</button><button class="save-btn" id="login" style="margin-top:8px;background:#334155">Anmelden</button>';
 if(user) document.querySelector("#logout").onclick=async()=>{await db.auth.signOut();toast("Abgemeldet");authView()};
 else {
  document.querySelector("#signup").onclick=async()=>{const email=authEmail.value,password=authPassword.value;const {error}=await db.auth.signUp({email,password});toast(error?error.message:"Registrierung gesendet – prüfe deine E-Mail")};
  document.querySelector("#login").onclick=async()=>{const {error}=await db.auth.signInWithPassword({email:authEmail.value,password:authPassword.value});toast(error?error.message:"Angemeldet ✓");if(!error)authView()};
 }
}
const originalShowView=showView;
showView=async function(view){
 if(view==="profile"){
   originalShowView(view);
   const pv=document.querySelector("#profileView");
   const {data:{user}}=await db.auth.getUser();
   pv.innerHTML=(user?'<div class="meta" style="margin-bottom:12px">✓ Echtes Konto</div>':'')+pv.innerHTML;
   if(user){
     const save=document.querySelector("#saveMe");
     if(save)save.onclick=saveRemoteProfile;
     const auth=document.querySelector("#authView"); auth.classList.remove("show");
     const account=document.createElement("button");account.className="save-btn";account.style.marginTop="8px";account.textContent="Konto / Anmeldung";account.onclick=authView;pv.appendChild(account);
   } else {
     const account=document.createElement("button");account.className="save-btn";account.style.marginTop="8px";account.textContent="Anmelden / Registrieren";account.onclick=authView;pv.appendChild(account);
   }
 }
 else originalShowView(view);
};
