///////////////////////////////////////////////////////////////////////////////
// Global
///////////////////////////////////////////////////////////////////////////////
document.addEventListener("dragstart", function (evt) {
	if (evt.target.tagName === "IMG") {
		evt.preventDefault();
	}
}, false);

ui.bind("click", document.querySelectorAll("[data-page]"), function (evt) {
	ui.page(this.getAttribute("data-page"));
});

ui.handleshortcuts = function (evt) {
	if (!game.paused) {
		switch (evt.keyCode) {
			case 49: {
				if (game.selection) {
					ui.action.upgrade("damage");
				} else {
					ui.action.build("Laser");
				}
				break;
			}
			case 50: {
				if (game.selection) {
					ui.action.upgrade("rate");
				} else {
					ui.action.build("Missile");
				}
				break;
			}
			case 51: {
				if (game.selection) {
					ui.action.upgrade("range");
				} else {
					ui.action.build("Tazer");
				}
				break;
			}
			case 52: {
				if (game.selection) {
					ui.action.move();
				} else {
					ui.action.build("Mortar");
				}
				break;
			}
			case 56: {
				if (evt.shiftKey && game.selection) {
					ui.action.sell();
				}
				break;
			}
			case 187: {
				$("control-fast").click();
				break;
			}
			case 27: {
				if (game.selection) {
					ui.action.deselect();
				} else {
					$("control-pause").click();
				}
				break;
			}
			case 13: {
				game._wave = game.ticks - 1200;
				break;
			}
		}
	} else {
		if (evt.keyCode === 27) {
			$("control-pause").click();
		}
	}
};

ui.handleunload = function (e) {
	return "A game is currently running, are you sure you want to close it?";
};


///////////////////////////////////////////////////////////////////////////////
// Actions
///////////////////////////////////////////////////////////////////////////////
ui.action.scores = function () {
	var list = JSON.parse(localStorage.scores || "{}");
	
	for (var map in list) {
		var out = "";
		
		list[map].forEach(function (r) {
			out += '<li>' +
				'<a>' + new Date(r.date).toDateString() + '</a> ' +
				r.score + ' ☠' + r.kills + ' $' + r.spent +
			'</li>';
		});
		
		$("pages-scores-local-" + map.toLowerCase()).innerHTML = out;
	}
};

ui.action.build = function (type) {
	var tdata = Defs.turrets[type];
	var turret = {
		x: -1000,
		y: -1000,
		levels: {
			range: 0,
			rate: 0,
			damage: 0,
			full: false
		},
		kills: 0,
		lastshot: 0,
		img: document.querySelector("#control-turrets [data-name=" + type + "] img"),
		id: game.turrets.length
	};
	
	for (var k in tdata) {
		turret[k] = tdata[k];
	}
	
	game.selection = game.cash - tdata.cost >= 0 ? {
		status: "placing",
		turret: turret,
		placeable: false
	} : false;
};

ui.action.upgrade = function (stat) {
	var turret = game.selection.turret;
	var levels = turret.levels;
	var level = levels[stat];
	var cost = Defs.turrets.upgrades[level];
	
	if (game.selection.status === "selected" && cost && game.cash - cost >= 0) {
		levels[stat]++;
		turret[stat] = turret.upgrades[level][stat];
		levels.full = levels.damage === 10 && levels.rate === 10 && levels.range === 10;
		turret.cost += cost;
		game.cash -= cost;
		game.spent += cost;
		ui.action.refresh();
	}
};

ui.action.move = function () {
	if (game.selection.status === "selected" && game.cash - 90 >= 0) {
		var turret = game.selection.turret;
		
		game.selection = {
			status: "moving",
			turret: turret,
			placeable: true
		};
		
		turret._x = turret.x;
		turret._y = turret.y;
		
		var tx = (turret._x + 2.5) / 5, ty = (turret._y + 2.5) / 5;
		for (var i = 5; i--;) {
			for (var ii = 5; ii--;) {
				game.tiles[(tx + i - 2) + "," + (ty + ii - 2)] = false;
			}
		}
		
		delete game.turrets[turret.id];
	}
};

ui.action.sell = function () {
	var turret = game.selection.turret, value = Math.round(turret.cost * 0.7);
	game.cash += value;
	game.spent -= value;
	
	var tx = (turret.x + 2.5) / 5, ty = (turret.y + 2.5) / 5;
	for (var i = 5; i--;) {
		for (var ii = 5; ii--;) {
			game.tiles[(tx + i - 2) + "," + (ty + ii - 2)] = false;
		}
	}
	
	ui.panel("turrets");
	game.selection = false;
	delete game.turrets[turret.id];
	ui.action.refresh();
};

ui.action.refresh = function () {
	ui.cash.textContent = game.cash;
	
	if (game.selection) {
		var turret = game.selection.turret;
		var levels = turret.levels;
		var costs = Defs.turrets.upgrades;
		
		["Damage", "Rate", "Range"].forEach(function (proper) {
			var id = proper.toLowerCase();
			var level = levels[id];
			var cost = costs[level] || "";
			$("control-manage-" + id).innerHTML = proper + " (" + level + ")<br>" + (cost && "$" + cost);
		});
		
		$("control-manage-sell").innerHTML = "Sell<br>$" + Math.round(turret.cost * 0.7);
		
		$("control-manage-stats").innerHTML = turret.kills + " kills<br>" + (((turret.kills / game.kills) || 0) * 100).toFixed(2)  + "% of &sum;";
	}
};

ui.action.deselect = function () {
	if (game.selection.status === "moving") {
		var turret = game.selection.turret;
		game.turrets[turret.id] = turret;
		
		turret.x = turret._x;
		turret.y = turret._y;
		
		var tx = (turret.x + 2.5) / 5, ty = (turret.y + 2.5) / 5;
		for (var i = 5; i--;) {
			for (var ii = 5; ii--;) {
				game.tiles[(tx + i - 2) + "," + (ty + ii - 2)] = turret;
			}
		}
	}
	
	game.selection = false;
	
	ui.panel("turrets");
};


///////////////////////////////////////////////////////////////////////////////
// Canvas
///////////////////////////////////////////////////////////////////////////////
var canvas = $("pages-canvas").getContext("2d");

$("pages-canvas").addEventListener("mousemove", function (evt) {
	var selection = game.selection;
	var turret = selection.turret;
	
	if (selection && selection.status !== "selected") {
		var tx = Math.ceil((evt.pageX - this.offsetLeft) / 5);
		var ty = Math.ceil((evt.pageY - this.offsetTop) / 5);
		
		turret.x = (tx * 5) - 2.5;
		turret.y = (ty * 5) - 2.5;
		selection.placeable = tx >= 3 && tx <= 158 && ty >= 3 && ty <= 98;
		
		for (var i = 5; i--;) {
			for (var ii = 5; ii--;) {
				if (game.tiles[(tx + i - 2) + "," + (ty + ii - 2)]) {
					selection.placeable = false;
					return;
				}
			}
		}
	}
}, false);

$("pages-canvas").addEventListener("click", function (evt) {
	var selection = game.selection;
	var turret = selection.turret;
	var tile = game.tiles[Math.ceil((evt.pageX - this.offsetLeft) / 5) + "," + Math.ceil((evt.pageY - this.offsetTop) / 5)];
	
	if (selection.status === "moving") {
		if (selection.placeable && game.cash - 90 >= 0) {
			game.cash -= 90;
			game.turrets[turret.id] = turret;
			
			var tx = (turret.x + 2.5) / 5, ty = (turret.y + 2.5) / 5;
			for (var i = 5; i--;) {
				for (var ii = 5; ii--;) {
					game.tiles[(tx + i - 2) + "," + (ty + ii - 2)] = turret;
				}
			}
			
			ui.panel("turrets");
			game.selection = false;
			ui.action.refresh();
		}
	} else if (selection.status === "placing") {
		if (selection.placeable) {
			game.cash -= turret.cost;
			game.spent += turret.cost;
			game.turrets.push(turret);
			
			var tx = (turret.x + 2.5) / 5, ty = (turret.y + 2.5) / 5;
			for (var i = 5; i--;) {
				for (var ii = 5; ii--;) {
					game.tiles[(tx + i - 2) + "," + (ty + ii - 2)] = turret;
				}
			}
			
			game.selection = false;
			ui.action.refresh();
		}
	} else if (typeof tile === "object") {
		game.selection = {
			status: "selected",
			turret: tile
		};
		
		ui.action.refresh();
		ui.panel("manage");
	} else {
		ui.action.deselect();
	}
}, false);


///////////////////////////////////////////////////////////////////////////////
// Control panel
///////////////////////////////////////////////////////////////////////////////
$("control").addEventListener("click", function (evt) {
	if (evt.target.id === "control") {
		ui.action.deselect();
	}
}, false);

ui.bind("click", $("control-turrets").children, function (evt) {
	if (!game.paused) {
		ui.action.build(this.getAttribute("data-name"));
	}
});

ui.bind("click", $("control-manage").getElementsByTagName("a"), function (evt) {
	var action = evt.target.id.split("-")[2];
	
	if (!game.paused) {
		(ui.action[action] || ui.action.upgrade)(action);
	}
});

$("control-timer").addEventListener("click", function (evt) {
	if (!game.paused) {
		game._wave = game.ticks - 1200;
	}
}, false);

$("control-fast").addEventListener("click", function (evt) {
	if (!game.paused) {
		this.style.backgroundColor = (game.fast = !game.fast) ? "#97D164" : "#85ADE6";
		game.pause();
		game.start();
	}
}, false);

$("control-pause").addEventListener("click", function (evt) {
	this.textContent = game.paused ? (game.start(), "Pause") : (game.pause(), "Start");
}, false);


///////////////////////////////////////////////////////////////////////////////
// Init
///////////////////////////////////////////////////////////////////////////////
ui.bind("click", $("pages-start-maps").children, function (evt) {
	var name = this.textContent;
	game.map = Defs.maps[name];
	game.map.name = name;
	
	game.map.map(function (p) {
		return { x: p.x, y: p.y };
	}).forEach(function (cur, i, a) {
		var next = a[i + 1] || cur, dx = next.x - cur.x, dy = next.y - cur.y;
		
		if (Math.abs(dx) > Math.abs(dy)) {
			cur.x += dx < 0 ? 21 : -16;
			var m = dy / dx, b = cur.y - m*cur.x;
			dx = dx < 0 ? -1 : 1;
			
			while (cur.x !== next.x) {
				cur.x += dx;
				
				for (var i = -3; i <= 4; i++) {
					game.tiles[Math.round(cur.x / 5) + "," + ((Math.round(m*cur.x + b) / 5) + i)] = true;
				}
			}
		} else if (dy !== 0) {
			cur.y += dy < 0 ? 21 : -16;
			var m = dx / dy, b = cur.x - m*cur.y;
			dy = dy < 0 ? -1 : 1;
			
			while (cur.y !== next.y) {
				cur.y += dy;
				
				for (var i = -3; i <= 4; i++) {
					game.tiles[((Math.round(m*cur.y + b) / 5) + i) + "," + Math.round(cur.y / 5)] = true;
				}
			}
		}
	});
	
	document.addEventListener("keydown", ui.handleshortcuts, false);
	window.addEventListener("beforeunload", ui.handleunload, false);
	
	game.start();
	ui.panel("turrets");
	ui.page("canvas");
	
	_gaq.push(["_trackEvent", "Game", "Start", name]);
});

ui.handletweets = function (data) {
	var maps = {
		loopy: $("pages-scores-twitter-loopy"),
		backtrack: $("pages-scores-twitter-backtrack"),
		dash: $("pages-scores-twitter-dash")
	};
	
	data.results.forEach(function (tweet) {
		var m = tweet.text.match(/I scored (\d+) \((\d+) kills, \$(\d+) spent\) on (Loopy|Backtrack|Dash) in #canvastd/i);
		
		if (m) {
			var map = maps[m[4].toLowerCase()];
			
			if (m[1] == m[2] * m[3] && map.children.length < 31) {
				var url = "https://twitter.com/" + tweet.from_user + "/status/" + tweet.id_str,
					title = "@" + tweet.from_user + " on " + tweet.created_at,
					a = '<a href="' + url + '" title="' + title + '" target="_blank">@' + tweet.from_user + '</a> ';
				
				map.innerHTML += '<li>' + a + m[1] + ' ☠' + m[2] + ' $' + m[3] + '</li>';
			}
		}
	});
};

ui.action.scores();