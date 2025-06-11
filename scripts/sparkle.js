
document.addEventListener("DOMContentLoaded", () => {

const sparkleContainer = document.getElementById('sparkle-container');
const sparkleChars = ['☆', '。', '*', '✦', '⁺', '˚', '⋆', '｡', '°', '✩', '₊', '･', 'ﾟ', '✧', '∘', '⊹', '⟡', '˖', '•'];

document.addEventListener('mousemove', (e) => {
	const sparkle = document.createElement("div");
	sparkle.className = "sparkle";
	sparkle.textContent = sparkleChars[Math.floor(Math.random() * sparkleChars.length)];
	sparkle.style.left = `${e.clientX}px`;
	sparkle.style.top = `${e.clientY}px`;
	sparkleContainer.appendChild(sparkle);
	setTimeout(() => sparkle.remove(), 1000);
});
});
