const profiles=[
 {id:1,name:"Mia",age:29,distance:"0,4 km",emoji:"🌸",bio:"Kaffee, Musik & spontane Abende",pos:"pin-1"},
 {id:2,name:"Lena",age:32,distance:"0,8 km",emoji:"✨",bio:"Reisen, Kunst & gutes Essen",pos:"pin-2"},
 {id:3,name:"Sophie",age:27,distance:"1,1 km",emoji:"🌻",bio:"Naturmensch mit Humor",pos:"pin-3"},
 {id:4,name:"Nina",age:35,distance:"1,4 km",emoji:"🎧",bio:"Elektronische Musik & Nachtleben",pos:"pin-4"},
 {id:5,name:"Anna",age:30,distance:"1,8 km",emoji:"🦋",bio:"Filme, Bücher & lange Gespräche",pos:"pin-5"},
 {id:6,name:"Julia",age:28,distance:"2,2 km",emoji:"☀️",bio:"Sportlich, neugierig, entspannt",pos:"pin-6"}
];
const liked=new Set();
const profilesEl=document.querySelector("#profiles");
const pinsEl=document.querySelector("#profilePins");
function render(){
 profilesEl.innerHTML=profiles.map(p=>`<article class="card" data-id="${p.id}">
   <div class="avatar">${p.emoji}</div><div class="name">${p.name}, ${p.age}</div>
   <div class="meta">📍 ${p.distance}</div><div class="meta">${p.bio}</div>
   <button class="interest ${liked.has(p.id)?"liked":""}">${liked.has(p.id)?"♥ Interesse gesendet":"♥ Interesse"}</button>
 </article>`).join("");
 pinsEl.innerHTML=profiles.map(p=>`<button class="profile-pin ${p.pos}" data-id="${p.id}" title="${p.name}">${p.emoji}</button>`).join("");
 document.querySelector("#countText").textContent=`${profiles.length} Profile · Demo`;
 document.querySelectorAll(".interest").forEach((b,i)=>b.addEventListener("click",e=>{e.stopPropagation();toggleLike(profiles[i].id)}));
 document.querySelectorAll(".card,.profile-pin").forEach(el=>el.addEventListener("click",()=>showProfile(Number(el.dataset.id))));
}
function toggleLike(id){liked.has(id)?liked.delete(id):liked.add(id);render();toast(liked.has(id)?"Interesse gesendet ♥":"Interesse zurückgenommen");}
function showProfile(id){const p=profiles.find(x=>x.id===id);toast(`${p.name}, ${p.age} · ${p.distance}`)}
function toast(msg){const t=document.querySelector("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>t.classList.remove("show"),1800)}
document.querySelector("#locateBtn").addEventListener("click",()=>{
 if(!navigator.geolocation){toast("Standort wird von diesem Gerät nicht unterstützt");return}
 navigator.geolocation.getCurrentPosition(()=>{toast("Standort gefunden");document.querySelector("#locationStatus").textContent="Standort aktiv · Demo-Modus"},()=>toast("Standortzugriff abgelehnt"));
});
document.querySelector("#zoomIn").onclick=()=>toast("Karte vergrößert");
document.querySelector("#zoomOut").onclick=()=>toast("Karte verkleinert");
document.querySelector("#filterBtn").onclick=()=>toast("Filter kommen im nächsten Schritt");
document.querySelectorAll(".nav-item").forEach(n=>n.onclick=()=>{document.querySelectorAll(".nav-item").forEach(x=>x.classList.remove("active"));n.classList.add("active");toast(n.querySelector("span").textContent)});
render();