function pageLoaded() {
	let collabsContainer = document.querySelector(".collabs");
	let items = Array.prototype.slice.call(document.querySelectorAll(".collabs > div"));

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
			var backface = document.createElement("div");
			backface.className = "backface";
			const rect = rects[i];
			item.classList.add("z3d");
			backface.style.width = item.style.width = rect.width + "px";
			backface.style.height = item.style.height = rect.height + "px";
			backface.style.top = item.style.top = "0px";
			backface.style.left = item.style.left = "0px";
			let rot = rect.x / totalWidth * 360;
			item.style.transform = "translateX(-50%) translateY(" + rect.y + "px) rotateY(" + rot + "deg) rotateY(var(--rotation)) translateZ(var(--radius)) scale(var(--scale))";
			backface.style.transform = item.style.transform + " rotateY(180deg)";

			item.parentElement.insertBefore(backface, item);
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
	var clickTarget = null;
	var clickCoords = []; // for tracking if we moved too much to register as click
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
	}

	window.addEventListener("pointerdown", function(e) {
		if (!isInCollabs(e.target)) return;

		if (!clicked) {
			clicked = "p" + e.pointerId;
			clickTarget = e.target;
			while (clickTarget && clickTarget.parentElement && clickTarget.parentElement.className != "collabs") {
				clickTarget = clickTarget.parentElement;
			}
			if (!clickTarget.parentElement)
				clickTarget = null;

			clickCoords = [e.pageX, e.pageY];
			updatePointerStatus();
			// document.body.setPointerCapture(e.pointerId);
			e.preventDefault();
		}
	});

	function removePointer(cancelled) {
		return function (e) {
			if (clicked == "p" + e.pointerId) {
				if (clickTarget && !cancelled) {
					fullscreen(clickTarget);
				}
				clicked = null;
				updatePointerStatus();
				// document.body.releasePointerCapture(e.pointerId);
				e.preventDefault();
			}
		};
	}
	window.addEventListener("pointerup", removePointer(false));
	window.addEventListener("pointercancel", removePointer(true));

	window.addEventListener("pointermove", function(e) {
		if (clicked == "p" + e.pointerId) {
			if (Math.sqrt((clickCoords[0] - e.pageX) * (clickCoords[0] - e.pageX) + (clickCoords[1] - e.pageY) * (clickCoords[1] - e.pageY))
				> 8) clickTarget = null; // cancel click
			velocity -= e.movementX * 3;
			updatePointerStatus();
			e.preventDefault();
		}
	});

	window.addEventListener("wheel", function(e) {
		if (!isInCollabs(e.target)) return;
		velocity += e.deltaY;
	});

	function isInCollabs(elem) {
		if (elem == document.body) return true;
		while (elem) {
			if (elem.className == "collabs")
				return true;
			elem = elem.parentElement;
		}
		return false;
	}

	function updatePointerStatus() {
		doRotate = hovered.every(v => v == false) && !clicked;
	}

	// TODO: scale and radius need to be optimized and calculated for the given screen dimensions

	/**
	 * @param {HTMLDivElement} div 
	 */
	function fullscreen(div) {
		if (div.classList.contains("backface"))
			div = div.nextElementSibling;
		let copy = div.cloneNode(true);
		document.body.appendChild(copy);
		copy.setAttribute("style", "");
		copy.classList.add("fullscreen-focus");

		collabsContainer.style.display = "none";

		var close = document.createElement("div");
		close.className = "close";
		close.textContent = "close";
		copy.appendChild(close);
		close.addEventListener("click", function() {
			document.body.removeChild(copy);
			eschandler = null;
			collabsContainer.style.display = "";
		});

		eschandler = function() {
			document.body.removeChild(copy);
			eschandler = null;
			collabsContainer.style.display = "";
		};

		var iframes = copy.querySelectorAll("iframe");
		iframes.forEach(f => {
			var src = f.getAttribute("data-src");
			if (src)
				f.setAttribute("src", src);
		});
	}

	let eschandler = null;
	document.addEventListener("keydown", function(e) {
		if (e.key == "Escape") {
			if (eschandler) {
				eschandler();
			}
		}
	});
}

window.addEventListener("load", function() {
	var loadingscreen = document.getElementById("loadingscreen");
	loadingscreen.classList.add("loaded");
	setTimeout(function() {
		pageLoaded();
	}, 5950);
	setTimeout(function() {
		loadingscreen.parentElement.removeChild(loadingscreen);
	}, 6300);
});
