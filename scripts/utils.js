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

/*
 * An array-like data structure
 *
 * Does not accumulate undefined entries after a large number of push and delete
 * operations.
 */
function RunQueue() {
	this.length = 0;
};

RunQueue.prototype.push = function(elem) {
	this[this.length++] = elem;
};

RunQueue.prototype.forEach = function(f) {
	var self = this;
	Object.keys(self).filter(function(k) {
		return k !== "length";
	}).forEach(function(k) {
		f(self[k], k, self);
	});
};

/*
 * Fixed depth quad tree
 *
 * Elements must have x and y.
 */
function QuadTree(x, y, w, h, level) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.level = level;
	this.size = 0;
	if (this.isLeaf()) {
		this.values = new Set();
	} else {
		this.children = [ null, null, null, null ];
	}
}

QuadTree.prototype.isLeaf = function() {
	return this.level >= 6;
}

QuadTree.prototype.add = function(elem) {
	if (this.isLeaf()) {
		this.values.add(elem);
	} else {
		var w = this.w / 2;
		var h = this.h / 2;
		var x = this.x;
		var y = this.y;
		var idx = 0;
		if (this.x < elem.x) {
			x += w / 2;
			idx += 2;
		} else {
			x -= w / 2;
		}
		if (this.y < elem.y) {
			y += h / 2;
			idx += 1;
		} else {
			y -= h / 2;
		}
		if (this.children[idx] === null) {
			this.children[idx] = new QuadTree(x, y, w, h, this.level + 1);
		}
		this.children[idx].add(elem);
	}
	++this.size;
};

QuadTree.prototype.delete = function(elem) {
	if (this.isLeaf()) {
		this.values.delete(elem);
		--this.size;
	} else {
		var idx = 0;
		if (this.x < elem.x) { idx += 2; }
		if (this.y < elem.y) { idx += 1; }
		if (this.children[idx] !== null) {
			this.children[idx].delete(elem);
			--this.size;
		}
	}
};

Set.prototype.filter = function (f) {
	var result = [];
	this.forEach(function(x) {
		if (f(x)) {
			result.push(x);
		}
	});
	return result;
}

QuadTree.prototype.inRadius = function(x, y, r) {
	if (this.isLeaf()) {
		return this.values.filter(function (elem) {
			return (elem.x - x) * (elem.x - x) + (elem.y - y) * (elem.y - y) < r * r;
		});
	} else {
		var result = [];
		if (this.x < x + r && this.y < y + r && this.children[3] !== null) {
			result = result.concat(this.children[3].inRadius(x, y, r));
		}
		if (this.x < x + r && this.y >= y - r && this.children[2] !== null) {
			result = result.concat(this.children[2].inRadius(x, y, r));
		}
		if (this.x >= x - r && this.y < y + r && this.children[1] !== null) {
			result = result.concat(this.children[1].inRadius(x, y, r));
		}
		if (this.x >= x - r && this.y >= y - r && this.children[0] !== null) {
			result = result.concat(this.children[0].inRadius(x, y, r));
		}
		return result;
	}
};

QuadTree.prototype.toArray = function() {
	var array = [];
	if (this.isLeaf()) {
		this.values.forEach(function (x) {
			array.push(x);
		});
	} else {
		this.children.filter(function(child) {
			return child !== null;
		}).forEach(function (child) {
			array = array.concat(child.toArray());
		});	
	}
	return array;
};

QuadTree.prototype.forEach = function(f) {
	this.toArray().forEach(f);
};

QuadTree.prototype.random = function(n) {
	if (n === undefined) {
		n = Math.floor(this.size * Math.random());
	}
	if (this.isLeaf()) {
		return this.toArray()[n];
	} else {
		for (var i = 0; i < this.children.length; ++i) {
			if (this.children[i] !== null) {
				if (n < this.children[i].size) {
					return this.children[i].random(n);
				} else {
					n -= this.children[i].size;
				}
			}
		}
	}
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
