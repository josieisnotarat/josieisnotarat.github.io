document.addEventListener("DOMContentLoaded", () => {
const scrollEls = document.querySelectorAll('.scroll-fade');

const scrollObserver = new IntersectionObserver((entries) => {
	entries.forEach(entry => {
		if (entry.isIntersecting) {
			entry.target.classList.add('in-view');
		}
	});
}, {
	threshold: 0.1
});

scrollEls.forEach(el => scrollObserver.observe(el));
});