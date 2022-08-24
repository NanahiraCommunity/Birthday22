let items = document.querySelectorAll(".collabs > div");
let totalWidth = 0;
for (let i = 0; i < items.length; i++) {
	const r = items[i].getBoundingClientRect();
	totalWidth = Math.max(totalWidth, r.x + r.width);
}

let rects = [];
for (let i = 0; i < items.length; i++) {
	const item = items[i];
	rects.push(item.getBoundingClientRect());
}
for (let i = 0; i < items.length; i++) {
	const item = items[i];
	const rect = rects[i];
	item.classList.add("z3d");
	item.style.width = rect.width + "px";
	item.style.height = rect.height + "px";
	item.style.top = "0px";
	item.style.left = "0px";
	let rot = rect.x / totalWidth * 360;
	item.style.transform = "translateX(-50%) translateY(" + rect.y + "px) rotateY(" + rot + "deg) rotateY(var(--rotation)) translateZ(var(--radius))";
}

document.querySelector(".collabs").style.transform = "translateX(50vw) scale(var(--scale))";
document.querySelector(".collabs").style.width = "0";

// TODO: use requestAnimationFrame
// TODO: stop rotation when hovering on something
// TODO: allow draging
// TODO: add a little x rotation
// TODO: this doesn't seem to work in chrome
// TODO: scale and radius need to be optimized and calculated for the given screen dimensions
(function() {
	let i = 0;
	setInterval(function() {
		i -= 0.1;
		document.querySelector("html").style.setProperty("--rotation", i + "deg");
	}, 10);
})();

// TODO: add clicking on tiles to fullscreen them
// TODO: make game thumbnails show iframes
