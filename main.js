(function(){
  /* Social links: swap the href values once the accounts exist. */
  var SOCIAL = [
    {name:"Discord", href:"#", svg:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.5 5.5a16 16 0 0 0-3.9-1.2l-.5 1a14.6 14.6 0 0 0-6.2 0l-.5-1a16 16 0 0 0-3.9 1.2C2 9.2 1.4 12.8 1.7 16.4a16 16 0 0 0 4.8 2.4l1-1.6a10 10 0 0 1-1.6-.8l.4-.3a11.4 11.4 0 0 0 11.4 0l.4.3c-.5.3-1 .6-1.6.8l1 1.6a16 16 0 0 0 4.8-2.4c.4-4.2-.6-7.8-2.8-10.9zM8.7 14.3c-.9 0-1.7-.9-1.7-1.9s.7-1.9 1.7-1.9 1.7.9 1.7 1.9-.8 1.9-1.7 1.9zm6.6 0c-.9 0-1.7-.9-1.7-1.9s.7-1.9 1.7-1.9 1.7.9 1.7 1.9-.7 1.9-1.7 1.9z"/></svg>'},
    {name:"Instagram", href:"#", svg:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>'},
    {name:"X", href:"#", svg:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 3h4.6l4.2 5.9L17 3h3.4l-6.9 8L21 21h-4.6l-4.6-6.4L6.2 21H2.8l7.3-8.4z"/></svg>'}
  ];
  document.querySelectorAll(".social").forEach(function(box){
    /* Only accounts that exist are shown: an icon with href "#" is left out. */
    box.innerHTML = SOCIAL.filter(function(s){ return s.href !== "#"; }).map(function(s){ return '<a href="'+s.href+'" data-soon="1" aria-label="'+s.name+' (coming soon)">'+s.svg+'</a>'; }).join("");
  });
  document.addEventListener("click", function(e){
    var a = e.target.closest && e.target.closest("a[data-soon]"); if(a && a.getAttribute("href")==="#"){ e.preventDefault(); }
  });

  /* Menu */
  var top = document.getElementById("top"), menu = top.querySelector(".menu");
  menu.addEventListener("click", function(){ var o = top.classList.toggle("open"); menu.setAttribute("aria-expanded", o); });
  top.querySelectorAll(".links a").forEach(function(a){ a.addEventListener("click", function(){ top.classList.remove("open"); menu.setAttribute("aria-expanded","false"); }); });
  var here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach(function(a){ if(a.dataset.nav === here) a.setAttribute("aria-current","page"); });

  var c = navigator.connection, saveData = !!(c && c.saveData);
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function addSources(v, list){ list.forEach(function(x){ var s = document.createElement("source"); s.src = x[0]; s.type = x[1]; v.appendChild(s); }); }
  function play(v){ var p = v.play(); if(p && p.catch) p.catch(function(){}); }

  /* Sign-up: no email provider yet, so nothing is sent. */
  var form = document.getElementById("signupForm");
  if(form){
    var msg = document.getElementById("signupMsg");
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var v = form.email.value.trim();
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)){ msg.textContent = "Enter an email address like you@email.com."; form.email.focus(); return; }
      msg.textContent = "Sign-ups open soon. Check back!"; /* TODO: send to the email provider once it is set up */
    });
  }
  var tb = document.getElementById("trailerBtn");
  if(tb) tb.addEventListener("click", function(){ this.lastChild.textContent = "Trailer coming soon"; });

  /* Hero: the street-run clip, or grapple-rooftop-01 if that file isn't there. Poster first, video after the page loads. */
  var hv = document.getElementById("heroVid");
  if(hv){
    var V = "assets/video/";
    var probe = new Image();
    probe.onload = function(){ setHero("hero-street"); };
    probe.onerror = function(){ setHero("grapple-rooftop-01"); };
    probe.src = V + "hero-street-poster.jpg";
    function setHero(n){
      hv.poster = V + n + "-poster.jpg";
      if(reduce || saveData) return;
      function go(){ addSources(hv, [[V+n+".webm","video/webm"],[V+n+".mp4","video/mp4"]]); hv.load(); play(hv); }
      if(document.readyState === "complete") go(); else window.addEventListener("load", go);
    }
  }

  /* Clip tiles: posters load only as a tile nears the screen; video only once it's on screen, paused when it leaves. */
  var tiles = document.querySelectorAll("video[data-lazy]");
  function poster(v){ if(v.dataset.poster && !v.poster){ v.poster = v.dataset.poster; } }
  if(!("IntersectionObserver" in window)){ tiles.forEach(poster); }
  else if(tiles.length){
    var near = new IntersectionObserver(function(es){
      es.forEach(function(e){ if(e.isIntersecting){ poster(e.target); near.unobserve(e.target); } });
    }, {rootMargin:"600px 0px"});
    tiles.forEach(function(v){ near.observe(v); });
    if(!reduce && !saveData){
      var seen = new IntersectionObserver(function(es){
        es.forEach(function(e){
          var v = e.target;
          if(e.isIntersecting){
            if(!v.dataset.loaded){ v.querySelectorAll("source[data-src]").forEach(function(s){ s.src = s.dataset.src; }); v.load(); v.dataset.loaded = "1"; }
            play(v);
          } else if(!v.paused){ v.pause(); }
        });
      }, {threshold:0.25});
      tiles.forEach(function(v){ seen.observe(v); });
    }
  }
})();
