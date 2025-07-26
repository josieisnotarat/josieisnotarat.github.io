document.addEventListener('DOMContentLoaded', () => {
  const sparkleContainer = document.getElementById('sparkle-container');
  const sparkleChars = ['☆','。','*','✦','⁺','˚','⋆','｡','°','✩','₊','･','ﾟ','✧','∘','⊹','⟡','˖','•'];
  const pages = document.querySelectorAll('.idea-page');
  const prevBtn = document.querySelector('.page-arrow.prev');
  const nextBtn = document.querySelector('.page-arrow.next');
  let index = 0;

  function spawnSparkles(btn){
    const rect = btn.getBoundingClientRect();
    for(let i=0;i<12;i++){
      const sp = document.createElement('div');
      sp.className = 'sparkle';
      sp.textContent = sparkleChars[Math.floor(Math.random()*sparkleChars.length)];
      sp.style.left = `${rect.left + rect.width/2}px`;
      sp.style.top = `${rect.top + rect.height/2}px`;
      sparkleContainer.appendChild(sp);
      setTimeout(()=>sp.remove(),1000);
    }
  }

  function showPage(newIndex, btn){
    pages[index].classList.remove('active');
    index = (newIndex + pages.length) % pages.length;
    pages[index].classList.add('active');
    if(btn) spawnSparkles(btn);
  }

  prevBtn.addEventListener('click', () => showPage(index-1, prevBtn));
  nextBtn.addEventListener('click', () => showPage(index+1, nextBtn));

  document.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft') showPage(index-1, prevBtn);
    if(e.key === 'ArrowRight') showPage(index+1, nextBtn);
  });
});
