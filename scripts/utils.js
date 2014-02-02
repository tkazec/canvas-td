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
var $ = function (id) {
	return document.getElementById(id);
};

window.ui = {
	timer: $("control-timer"),
	cash: $("control-cash"),
	lives: $("control-lives"),
	wave: $("control-wave"),
	fps: $("control-fps"),
	
	nav: ["start"],
	action: {},
	
	bind: function (evt, elems, fn) {
		Array.prototype.slice.call(elems).forEach(function (elem) {
			elem.addEventListener(evt, fn, false);
		});
	},
	page: function (name) {
		if (name) {
			ui.nav.unshift(name);
		} else {
			ui.page(ui.nav[1]);
			return;
		}
		
		Array.prototype.slice.call($("pages").children).forEach(function (elem) {
			if (elem.id !== "pages-overlay") {
				elem.style.display = "none";
			}
		});
		
		$("pages-" + name).style.display = "block";
		
		_gaq.push(["_trackPageview", "/" + name]);
	},
	panel: function (name) {
		Array.prototype.slice.call($("control-left").children).forEach(function (elem) {
			elem.style.display = "none";
		});

		$("control-" + name).style.display = "block";
	}
};