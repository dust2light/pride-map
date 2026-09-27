let filterState={maxAge:99,maxDistance:25};
const profiles=[{id:1,name:"Mia",age:29,distance:"0,4 km",emoji:"🌸",bio:"Kaffee, Musik & spontane Abende",offset:[.003,.004]},{id:2,name:"Lena",age:32,distance:"0,8 km",emoji:"✨",bio:"Reisen, Kunst & gutes Essen",offset:[-.004,.006]},{id:3,name:"Sophie",age:27,distance:"1,1 km",emoji:"🌻",bio:"Naturmensch mit Humor",offset:[-.007,-.004]},{id:4,name:"Nina",age:35,distance:"1,4 km",emoji:"🎧",bio:"Elektronische Musik & Nachtleben",offset:[.005,-.006]},{id:5,name:"Anna",age:30,distance:"1,8 km",emoji:"🦋",bio:"Filme, Bücher & lange Gespräche",offset:[.008,.002]},{id:6,name:"Julia",age:28,distance:"2,2 km",emoji:"☀️",bio:"Sportlich, neugierig, entspannt",offset:[-.002,-.009]}];const liked=new Set(JSON.parse(localStorage.getItem("mapdate-liked")||"[]"));const me=JSON.parse(localStorage.getItem("mapdate-profile")||'{"name":"Du","age":30,"bio":"Erzähl etwas über dich…","emoji":"🙂"}');let userPos=[52.03,8.53];const map=L.map("map",{zoomControl:true}).setView(userPos,14);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"© OpenStreetMap contributors"}).addTo(map);const userIcon=L.divIcon({className:"user-marker",html:"<div></div>",iconSize:[18,18],iconAnchor:[9,9]});let userMarker=L.marker(userPos,{icon:userIcon}).addTo(map),markers=[];function profileIcon(p){return L.divIcon({className:"profile-marker",html:`<div>${p.emoji}</div>`,iconSize:[40,40],iconAnchor:[20,20]})}function placeProfiles(){markers.forEach(m=>m.remove());markers=profiles.map(p=>{const m=L.marker([userPos[0]+p.offset[0],userPos[1]+p.offset[1]],{icon:profileIcon(p)}).addTo(map);m.on("click",()=>showProfile(p.id));return m})}let swipeStartX=0,swipeCard=null;
function bindSwipeCards(){document.querySelectorAll(".swipe-card").forEach(card=>{card.addEventListener("touchstart",e=>{swipeStartX=e.touches[0].clientX;swipeCard=card},{passive:true});card.addEventListener("touchend",e=>{if(!swipeCard)return;const dx=e.changedTouches[0].clientX-swipeStartX;if(Math.abs(dx)>80){const id=Number(swipeCard.dataset.id);if(dx>0)toggleLike(id);swipeCard.style.transform=`translateX(${dx>0?120:-120}%) rotate(${dx>0?10:-10}deg)`;setTimeout(()=>showView("discover"),180)}swipeCard=null})})}
function filteredProfiles(){return profiles.filter(p=>p.age<=filterState.maxAge && parseFloat(String(p.distance).replace(",","."))<=filterState.maxDistance)}
function render(){document.querySelector("#profiles").innerHTML=filteredProfiles().map(p=>`<article class="card swipe-card" data-id="${p.id}"><div class="avatar">${p.emoji}</div><div class="name">${p.name}, ${p.age}</div><div class="meta">📍 ${p.distance}</div><div class="meta">${p.bio}</div><button class="interest ${liked.has(p.id)?"liked":""}">${liked.has(p.id)?"♥ Interesse gesendet":"♥ Interesse"}</button></article>`).join("");document.querySelectorAll(".interest").forEach((b,i)=>b.onclick=e=>{e.stopPropagation();toggleLike(profiles[i].id)});document.querySelectorAll(".card").forEach(c=>c.onclick=()=>showProfile(+c.dataset.id));document.querySelector("#countText").textContent=filteredProfiles().length+" Profile";placeProfiles();bindSwipeCards()}async function toggleLike(id){
  const {data:{user}}=await db.auth.getUser();
  if(!user){toast("Bitte zuerst anmelden");return}
  const {data,error}=await db.rpc("like_user",{target_user:id});
  if(error){toast("Like konnte nicht gesendet werden");return}
  liked.add(id);localStorage.setItem("mapdate-liked",JSON.stringify([...liked]));
  render();
  if(data?.[0]?.matched){
    toast("💕 Match! Ihr mögt euch!");
    await loadMatches();
  }else toast("Interesse gesendet ♥");
}
async function loadMatches(){
  const {data:{user}}=await db.auth.getUser(); if(!user)return;
  const {data}=await db.from("matches").select("id,user_a,user_b,created_at").or("user_a.eq."+user.id+",user_b.eq."+user.id).order("created_at",{ascending:false});
  window.mapdateMatches=data||[];
}function showProfile(id){const p=profiles.find(x=>x.id===id);if(!p)return;const pv=document.querySelector("#profileView");document.querySelector("#profiles").style.display="none";document.querySelector("#viewTitle").style.display="none";pv.classList.add("show");pv.innerHTML=`<h2>${p.emoji} ${p.name}, ${p.age}</h2><p class="meta">📍 ${p.distance}</p><p>${p.bio||""}</p><button class="save-btn" id="profileLike">♥ Interesse</button><button class="save-btn" id="profileBlock" style="margin-top:8px;background:#334155">🚫 Blockieren</button><button class="save-btn" id="profileReport" style="margin-top:8px;background:#7f1d1d">⚑ Melden</button>`;document.querySelector("#profileLike").onclick=()=>toggleLike(p.id);document.querySelector("#profileBlock").onclick=async()=>{const {error}=await db.rpc("block_user",{target_user:p.id});toast(error?"Blockieren fehlgeschlagen":"Profil blockiert");if(!error)showView("discover")};document.querySelector("#profileReport").onclick=async()=>{const reason=prompt("Warum möchtest du dieses Profil melden?");if(!reason)return;const {error}=await db.rpc("report_user",{target_user:p.id,report_reason:reason});toast(error?"Meldung fehlgeschlagen":"Meldung wurde gesendet ✓")}}function toast(msg){const t=document.querySelector("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>t.classList.remove("show"),1800)}function showView(view){const cards=document.querySelector("#profiles"),head=document.querySelector("#viewTitle"),pv=document.querySelector("#profileView");pv.classList.remove("show");cards.style.display="grid";head.style.display="flex";if(view==="likes"){cards.innerHTML=profiles.filter(p=>liked.has(p.id)).map(p=>`<article class="card"><div class="avatar">${p.emoji}</div><div class="name">${p.name}, ${p.age}</div><div class="meta">♥ Interesse gesendet</div></article>`).join("")||"<p class='meta'>Noch keine Likes.</p>";head.querySelector("h1").textContent="Deine Likes";head.querySelector("p").textContent="Gespeichert auf diesem Gerät";}else if(view==="chats"){head.querySelector("h1").textContent="Chats";head.querySelector("p").textContent="Deine Matches";const {data:{user}}=await db.auth.getUser();if(!user){cards.innerHTML="<p class=\"meta\">Melde dich an, um deine Matches zu sehen.</p>";return}await loadMatches();const matches=window.mapdateMatches||[];if(!matches.length){cards.innerHTML="<p class=\"meta\">Noch keine Matches. Wenn zwei Menschen Interesse zeigen, entsteht hier ein Chat.</p>";return}const ids=matches.map(m=>m.user_a===user.id?m.user_b:m.user_a);const {data:people}=await db.from("profiles").select("id,display_name,bio,avatar_url").in("id",ids);cards.innerHTML=matches.map(m=>{const id=m.user_a===user.id?m.user_b:m.user_a;const p=(people||[]).find(x=>x.id===id)||{display_name:"Match",bio:""};return `<article class="card chat-card" data-match="${m.id}"><div class="avatar">💕</div><div class="name">${p.display_name||"Match"}</div><div class="meta">${p.bio||"Ihr mögt euch."}</div><button class="interest open-chat">💬 Chat öffnen</button></article>`}).join("");document.querySelectorAll(".open-chat").forEach(b=>b.onclick=e=>{e.stopPropagation();openChat(b.closest(".chat-card").dataset.match)});document.querySelectorAll(".chat-card").forEach(c=>c.onclick=()=>openChat(c.dataset.match));}else if(view==="profile"){cards.style.display="none";head.style.display="none";pv.classList.add("show");pv.innerHTML=`<h2>Dein Profil</h2><div class="avatar">${me.emoji}</div><input id="avatarFile" type="file" accept="image/jpeg,image/png,image/webp"><input id="meName" value="${me.name}" placeholder="Name"><input id="meAge" type="number" value="${me.age}" placeholder="Alter"><textarea id="meBio" rows="4" placeholder="Über dich">${me.bio}</textarea><button class="save-btn" id="saveMe">Profil speichern</button>`;document.querySelector("#saveMe").onclick=()=>{const x={name:document.querySelector("#meName").value,age:Number(document.querySelector("#meAge").value),bio:document.querySelector("#meBio").value,emoji:me.emoji};localStorage.setItem("mapdate-profile",JSON.stringify(x));Object.assign(me,x);toast("Profil gespeichert ✓")}}else{head.querySelector("h1").textContent="In deiner Nähe";head.querySelector("p").textContent=profiles.length+" Profile · Demo";render()}}document.querySelector("#locateBtn").onclick=()=>{if(!navigator.geolocation)return toast("GPS wird nicht unterstützt");navigator.geolocation.getCurrentPosition(pos=>{userPos=[pos.coords.latitude,pos.coords.longitude];userMarker.setLatLng(userPos);map.setView(userPos,15);placeProfiles();document.querySelector("#locationStatus").textContent="GPS aktiv · Standort geschützt";syncMyLocation(userPos[0],userPos[1]).then(()=>loadNearbyProfiles(userPos[0],userPos[1]));toast("Standort gefunden")},()=>toast("Standortzugriff abgelehnt"))};document.querySelector("#filterBtn").onclick=()=>{const age=prompt("Maximales Alter",filterState.maxAge);const dist=prompt("Maximale Entfernung in km",filterState.maxDistance);if(age!==null&&dist!==null){filterState.maxAge=Math.max(18,Number(age)||99);filterState.maxDistance=Math.max(.5,Number(dist)||25);render();toast("Filter angewendet ✓")}};document.querySelectorAll(".nav-item").forEach(n=>n.onclick=()=>{document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));n.classList.add("active");showView(n.dataset.view)});render();\nif ("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));\n

async function uploadAvatar(file){const {data:{user}}=await db.auth.getUser();if(!user||!file)return;const allowed=["image/jpeg","image/png","image/webp"];if(!allowed.includes(file.type)||file.size>5242880)return toast("Bitte JPG, PNG oder WebP bis 5 MB");const path=user.id+"/avatar."+file.name.split(".").pop().toLowerCase();const {error}=await db.storage.from("avatars").upload(path,file,{upsert:true,contentType:file.type});if(error)return toast("Foto-Upload fehlgeschlagen");const {data}=db.storage.from("avatars").getPublicUrl(path);const {error:pe}=await db.from("profiles").update({avatar_url:data.publicUrl}).eq("id",user.id);if(pe)return toast("Profilfoto konnte nicht gespeichert werden");toast("Profilfoto gespeichert ✓");showView("profile")}
// Real nearby profiles
async function syncMyLocation(lat,lng){
  const {data:{user}}=await db.auth.getUser();
  if(!user)return;
  await db.rpc("update_my_location",{lat,lng});
}
async function loadNearbyProfiles(lat,lng){
  const {data:{user}}=await db.auth.getUser();
  if(!user)return false;
  const {data,error}=await db.rpc("nearby_profiles",{lat,lng,radius_m:25000});
  if(error||!data)return false;
  profiles.length=0;
  data.forEach((p,i)=>profiles.push({id:p.id,name:p.display_name,age:new Date().getFullYear()-p.birth_year,distance:(p.distance_m/1000).toFixed(1).replace(".",",")+" km",emoji:"🙂",bio:p.bio||"",offset:[0,0],remote:true,avatar_url:p.avatar_url||""}));
  render();
  return true;
}
\n// MapDate Supabase auth
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
     if(save)save.onclick=saveRemoteProfile;const af=document.querySelector("#avatarFile");if(af)af.onchange=()=>uploadAvatar(af.files[0]);
     const auth=document.querySelector("#authView"); auth.classList.remove("show");
     const account=document.createElement("button");account.className="save-btn";account.style.marginTop="8px";account.textContent="Konto / Anmeldung";account.onclick=authView;pv.appendChild(account);
   } else {
     const account=document.createElement("button");account.className="save-btn";account.style.marginTop="8px";account.textContent="Anmelden / Registrieren";account.onclick=authView;pv.appendChild(account);
   }
 }
 else originalShowView(view);
};


let activeChat=null, chatChannel=null;
async function openChat(matchId){
 const {data:{user}}=await db.auth.getUser();
 if(!user)return toast("Bitte zuerst anmelden");
 activeChat=matchId;
 const pv=document.querySelector("#profileView");
 document.querySelector("#profiles").style.display="none";
 document.querySelector("#viewTitle").style.display="none";
 pv.classList.add("show");
 const {data:msgs}=await db.from("messages").select("id,sender_id,body,created_at").eq("match_id",matchId).order("created_at",{ascending:true});
 pv.innerHTML='<h2>💬 Chat</h2><div id="chatMessages" style="max-height:42vh;overflow:auto;margin:12px 0"></div><div style="display:flex;gap:8px"><input id="chatInput" maxlength="2000" placeholder="Nachricht…"><button class="save-btn" id="sendChat">Senden</button></div>';
 const box=document.querySelector("#chatMessages");
 (msgs||[]).forEach(m=>addChatMessage(m,user.id));
 document.querySelector("#sendChat").onclick=async()=>{const input=document.querySelector("#chatInput");const body=input.value.trim();if(!body)return;const {error}=await db.from("messages").insert({match_id:matchId,sender_id:user.id,body});if(error)toast("Nachricht konnte nicht gesendet werden");else input.value=""};
 if(chatChannel)await db.removeChannel(chatChannel);
 chatChannel=db.channel("mapdate-chat-"+matchId).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:"match_id=eq."+matchId},payload=>addChatMessage(payload.new,user.id)).subscribe();
}
function addChatMessage(m,myId){
 const box=document.querySelector("#chatMessages");if(!box)return;
 const d=document.createElement("div");d.style.cssText="margin:7px 0;padding:9px 11px;border-radius:12px;background:"+(m.sender_id===myId?"#ff4f87":"#263148")+";max-width:82%;margin-left:"+(m.sender_id===myId?"auto":"0");
 d.textContent=m.body;box.appendChild(d);box.scrollTop=box.scrollHeight;
}
