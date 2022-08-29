let collabsContainer = document.querySelector(".collabs");
let items = document.querySelectorAll(".collabs > div");

collabsContainer.style.height = "150vh";

requestAnimationFrame(function() {
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
		item.style.transform = "translateX(-50%) translateY(" + rect.y + "px) rotateY(" + rot + "deg) rotateY(var(--rotation)) translateZ(var(--radius)) scale(var(--scale))";
	}
	
	collabsContainer.style.transform = "translateX(50vw) scale(var(--scale))";
	collabsContainer.style.width = "0";
	collabsContainer.style.height = "30vh";
});

// (function () {
let rotation = Math.random() * 360;
let velocity = 5000; // 13.6;
let doRotate = true;
let lastTime = NaN;
function updateRotation(time) {
	let dt = time - lastTime;
	if (!isFinite(dt) || dt <= 0.0001 || dt > 0.1)
		dt = 1 / 60;
	lastTime = time;

	if (doRotate) {
		velocity += dt * 100;
	}
	velocity *= Math.pow(0.5, dt * 10);

	rotation += velocity * dt * 0.5;
	document.querySelector("html").style.setProperty("--rotation", (-rotation) + "deg");

	requestAnimationFrame(updateRotation);
}

updateRotation();
// })();

let clicked = null;
var clickCoords = []; // for tracking if we moved too much to register as click
let clickCancel = false;
let hovered = [];
for (let i = 0; i < items.length; i++) {
	items[i].setAttribute("data-i", i.toString());
	items[i].addEventListener("mouseover", function(e) {
		let i = parseInt(this.getAttribute("data-i"));
		hovered[i] = true;
		updatePointerStatus();
	});
	items[i].addEventListener("mouseout", function(e) {
		let i = parseInt(this.getAttribute("data-i"));
		hovered[i] = false;
		updatePointerStatus();
	});
	items[i].addEventListener("click", function(e) {
		if (!clickCancel) {
			fullscreen(this);
		}
	});
}

document.body.addEventListener("pointerdown", function(e) {
	if (!clicked) {
		clicked = "p" + e.pointerId;
		clickCancel = false;
		clickCoords = [e.pageX, e.pageY];
		updatePointerStatus();
		document.body.setPointerCapture(e.pointerId);
		e.preventDefault();
	}
});

function removePointer(e) {
	if (clicked == "p" + e.pointerId) {
		clicked = null;
		updatePointerStatus();
		document.body.releasePointerCapture(e.pointerId);
		e.preventDefault();
	}
}
document.body.addEventListener("pointerup", removePointer);
document.body.addEventListener("pointercancel", removePointer);

document.body.addEventListener("pointermove", function(e) {
	if (clicked == "p" + e.pointerId) {
		if (Math.sqrt((clickCoords[0] - e.pageX) * (clickCoords[0] - e.pageX) + (clickCoords[1] - e.pageY) * (clickCoords[1] - e.pageY))
			> 8) clickCancel = true;
		velocity -= e.movementX;
		updatePointerStatus();
		e.preventDefault();
	}
});

document.body.addEventListener("wheel", function(e) {
	velocity += e.deltaY;
});

function updatePointerStatus() {
	doRotate = hovered.every(v => v == false) && !clicked;
}

// TODO: add a little x rotation
// TODO: this doesn't seem to work in chrome
// TODO: scale and radius need to be optimized and calculated for the given screen dimensions

// TODO: add clicking on tiles to fullscreen them
// TODO: make game thumbnails show iframes

/**
 * @param {HTMLDivElement} div 
 */
function fullscreen(div) {
	let copy = div.cloneNode(true);
	document.body.appendChild(copy);
	copy.setAttribute("style", "");
	copy.classList.add("fullscreen-focus");
}
