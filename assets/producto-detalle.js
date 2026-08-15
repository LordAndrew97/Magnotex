(()=>{
  const $=selector=>document.querySelector(selector);
  const header=$("#header");
  const burger=$("#burger");
  const nav=$("#nav");
  const productsToggle=$(".products-toggle");
  const productsMenu=productsToggle.closest(".has-sub");
  const productName=document.body.dataset.product;
  const whatsapp="593991570939";
  const updateHeader=()=>header.classList.toggle("scrolled",window.scrollY>40);
  const setProductsOpen=open=>{productsMenu.classList.toggle("open",open);productsToggle.setAttribute("aria-expanded",String(open));};
  const setMenuOpen=open=>{nav.classList.toggle("open",open);burger.setAttribute("aria-expanded",String(open));if(!open){setProductsOpen(false);}};
  updateHeader();
  addEventListener("scroll",updateHeader,{passive:true});
  burger.addEventListener("click",()=>setMenuOpen(!nav.classList.contains("open")));
  productsToggle.addEventListener("click",()=>setProductsOpen(!productsMenu.classList.contains("open")));
  nav.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{setProductsOpen(false);if(innerWidth<=780){setMenuOpen(false);}}));
  document.addEventListener("click",event=>{if(!productsMenu.contains(event.target)){setProductsOpen(false);}});
  document.addEventListener("keydown",event=>{
    if(event.key!=="Escape") return;
    const hadProductsOpen=productsMenu.classList.contains("open");
    const hadNavOpen=nav.classList.contains("open");
    setProductsOpen(false);
    setMenuOpen(false);
    if(hadNavOpen) burger.focus();
    else if(hadProductsOpen) productsToggle.focus();
  });
  addEventListener("resize",()=>{
    if(innerWidth>780&&nav.classList.contains("open")) setMenuOpen(false);
  });
  $("#year").textContent=new Date().getFullYear();
  $("#wa").href="https://wa.me/"+whatsapp+"?text="+encodeURIComponent(`Hola, me interesa ${productName} de Magnotex.`);
  const quoteForm=$("#quote-form");
  quoteForm.addEventListener("submit",event=>{
    event.preventDefault();
    const data=new FormData(quoteForm);
    const lines=[`Hola, soy ${data.get("name")}.`,`Teléfono: ${data.get("phone")}.`];
    if(data.get("company")){lines.push(`Empresa o proyecto: ${data.get("company")}.`);}
    lines.push(`Necesito: ${data.get("message")}`);
    window.open("https://wa.me/"+whatsapp+"?text="+encodeURIComponent(lines.join("\n")),"_blank","noopener");
  });
})();
