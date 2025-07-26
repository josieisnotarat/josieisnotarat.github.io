document.addEventListener("DOMContentLoaded", () => {
    const pages = document.querySelectorAll('.page');
    const left = document.querySelector('.nav-arrow.left');
    const right = document.querySelector('.nav-arrow.right');
    let current = 0;

    function showPage(index) {
        pages[current].classList.remove('active');
        pages[current].style.display = 'none';
        current = (index + pages.length) % pages.length;
        pages[current].style.display = 'block';
        pages[current].classList.add('active');
        sparkleBurst();
    }

    pages[0].style.display = 'block';
    pages[0].classList.add('active');

    left.addEventListener('click', () => showPage(current - 1));
    right.addEventListener('click', () => showPage(current + 1));
});

function sparkleBurst() {
    const container = document.getElementById('sparkle-container');
    const chars = ['☆', '。', '*', '✦', '⁺', '˚', '⋆', '｡', '°', '✩', '₊', '･', 'ﾟ', '✧', '∘', '⊹', '⟡', '˖', '•'];
    for (let i = 0; i < 25; i++) {
        const sp = document.createElement('div');
        sp.className = 'sparkle';
        sp.textContent = chars[Math.floor(Math.random() * chars.length)];
        sp.style.left = `${Math.random() * window.innerWidth}px`;
        sp.style.top = `${Math.random() * window.innerHeight}px`;
        container.appendChild(sp);
        setTimeout(() => sp.remove(), 1000);
    }
}
