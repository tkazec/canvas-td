(function () {

///////////////////////////////////////////////////////////////////////////////
// Math
///////////////////////////////////////////////////////////////////////////////
Math.inRadius = function (target, obj, rad) {
	return (obj.x - target.x)*(obj.x - target.x) + (obj.y - target.y)*(obj.y - target.y) < rad*rad;
};

Math.move = function (obj, target, speed) {
	var distx = target.x - obj.x;
	var disty = target.y - obj.y;
	var angle = Math.atan2(disty, distx);
	
	obj.x += speed * Math.cos(angle);
	obj.y += speed * Math.sin(angle);
	
	return (distx < 0 ? -distx : distx) + (disty < 0 ? -disty : disty) < 2;
};

Math.rand = function (max) {
	return Math.floor(Math.random() * (max + 1));
};


///////////////////////////////////////////////////////////////////////////////
// Elements
///////////////////////////////////////////////////////////////////////////////
function id (ID) {
	return document.getElementById(ID);
}

window.ui = {
	timer: id("control-timer-blue"),
	cash: id("control-cash"),
	lives: id("control-lives"),
	wave: id("control-wave"),
	fps: id("control-fps"),
	
	nav: ["start"],
	action: {},
	
	id: id,
	bind: function (event, elems, fn) {
		Array.forEach(elems, function (el) {
			el.addEventListener(event, fn, false);
		});
	},
	page: function (name) {
		if (name) {
			ui.nav.unshift(name);
		} else {
			ui.page(ui.nav[1]);
			return;
		}
		
		Array.forEach(id("pages").children, function (el) {
			if (el.id !== "pages-overlay") {
				el.style.display = "none";
			}
		});
		id("pages-" + name).style.display = "block";
		
		_gaq.push(["_trackPageview", "/" + name]);
	},
	panel: function (name) {
		Array.forEach(id("control-left").children, function (el) {
			el.style.display = "none";
		});
		id("control-" + name).style.display = "block";
	}
};


///////////////////////////////////////////////////////////////////////////////
// Misc
///////////////////////////////////////////////////////////////////////////////
window.data = {};

window.canvas = ui.id("pages-canvas").getContext("2d");

Array.forEach = function (arr, fn) {
	Array.prototype.forEach.call(arr, fn);
};

})();