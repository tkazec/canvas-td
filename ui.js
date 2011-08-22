(function(game, data, ui, Math){

/*** global ***/
document.addEventListener("dragstart", function(e){
	e.target.tagName === "IMG" && e.preventDefault();
}, false);

ui.bind("click", document.querySelectorAll("[data-page]"), function(){
	ui.page(this.getAttribute("data-page"));
});

ui.handleshortcuts = function(e){
	if (!game.paused) {
		switch (e.keyCode) {
			case 49: {
				game.selection ? ui.action.upgrade("damage") : ui.action.build("Laser"); break;
			}
			case 50: {
				game.selection ? ui.action.upgrade("rate") : ui.action.build("Missile"); break;
			}
			case 51: {
				game.selection ? ui.action.upgrade("range") : ui.action.build("Tazer"); break;
			}
			case 52: {
				game.selection ? ui.action.move() : ui.action.build("Mortar"); break;
			}
			case 56: {
				e.shiftKey && game.selection && ui.action.sell(); break;
			}
			case 27: {
				game.selection ? ui.action.deselect() : (game.pause(), (ui.id("control-pause").innerText = "Start")); break;
			}
			case 13: {
				game._wave = game.ticks - 1200; break;
			}
		}
	} else {
		e.keyCode === 27 && (ui.id("control-pause").innerText = "Pause") && game.start();
	}
};

ui.handleunload = function(e){
	return "A game is currently running, are you sure you want to close it?";
};


/*** actions ***/
ui.action.scores = function(){
	var list = JSON.parse(localStorage.scores || '{}');
	for (var map in list) {
		var out = "";
		list[map].forEach(function(r){
			out += '<li>' +
				'<a>' + new Date(r.date).toDateString() + '</a> ' +
				r.score + ' ☠' + r.kills + ' $' + r.spent +
			'</li>';
		});
		ui.id("pages-scores-local-" + map.toLowerCase()).innerHTML = out;
	}
};

ui.action.build = function(type){
	var tdata = data.turrets[type], turret = {
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
		img: document.querySelector('#control-turrets [data-name="' + type + '"] img'),
		id: game.turrets.length
	};
	
	for (var k in tdata) { turret[k] = tdata[k]; }
	
	game.selection = game.cash - tdata.cost >= 0 ? {
		status: "placing",
		turret: turret,
		placeable: false
	} : false;
};

ui.action.upgrade = function(stat){
	var turret = game.selection.turret, levels = turret.levels, level = levels[stat], cost = data.upgrades[level];
	
	if (cost && game.cash - cost >= 0) {
		levels[stat]++;
		turret[stat] = turret.upgrades[level][stat];
		levels.full = levels.damage === 10 && levels.rate === 10 && levels.range === 10;
		turret.cost += cost;
		game.cash -= cost;
		game.spent += cost;
		ui.action.refresh();
	}
};

ui.action.move = function(){
	if (game.cash - 90 >= 0) {
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

ui.action.sell = function(){
	var turret = game.selection.turret, value = Math.round(turret.cost * .7);
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
};

ui.action.refresh = function(){
	if (game.selection) {
		var turret = game.selection.turret, levels = turret.levels, costs = data.upgrades;
		
		["Damage", "Rate", "Range"].forEach(function(proper){
			var id = proper.toLowerCase(), level = levels[id], cost = costs[level] || "";
			ui.id("control-manage-" + id).innerHTML = proper + " (" + level + ")<br>" + (cost && "$" + cost);
		});
		
		ui.id("control-manage-sell").innerHTML = "Sell<br>$" + Math.round(turret.cost * .7);
		
		ui.id("control-manage-stats").innerHTML = turret.kills + " kills<br>" + (((turret.kills / game.kills) || 0) * 100).toFixed(2)  + "% of &sum;";
	}
};

ui.action.deselect = function(){
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


/*** canvas ***/
ui.id("pages-canvas").addEventListener("mousemove", function(e){
	var selection = game.selection, turret = selection.turret;
	
	if (selection && selection.status !== "selected") {
		var tx = Math.ceil((e.pageX - this.offsetLeft) / 5), ty = Math.ceil((e.pageY - this.offsetTop) / 5);
		
		turret.x = (tx * 5) - 2.5;
		turret.y = (ty * 5) - 2.5;
		selection.placeable = tx >= 3 && tx <= 158 && ty >= 3 && ty <= 98;
		
		for (var i = 5; i--;) {
			for (var ii = 5; ii--;) {
				if (game.tiles[(tx + i - 2) + "," + (ty + ii - 2)]) { selection.placeable = false; return; }
			}
		}
	}
}, false);

ui.id("pages-canvas").addEventListener("click", function(e){
	var selection = game.selection, turret = selection.turret,
		tile = game.tiles[Math.ceil((e.pageX - this.offsetLeft) / 5) + "," + Math.ceil((e.pageY - this.offsetTop) / 5)];
	
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


/*** control panel ***/
ui.id("control").addEventListener("click", function(e){
	e.target.id === "control" && ui.action.deselect();
}, false);

ui.bind("click", ui.id("control-turrets").children, function(e){
	ui.action.build(this.getAttribute("data-name"));
});

ui.bind("click", ui.id("control-manage").getElementsByTagName("a"), function(e){
	var action = e.target.id.split("-")[2];
	(ui.action[action] || ui.action.upgrade)(action);
});

ui.id("control-timer").addEventListener("click", function(e){
	if (!game.paused) { game._wave = game.ticks - 1200; }
}, false);

ui.id("control-pause").addEventListener("click", function(){
	this.innerText = game.paused ? (game.start(), "Pause") : (game.pause(), "Start");
}, false);


/*** init ***/
ui.bind("click", ui.id("pages-start-maps").children, function(){
	var name = this.textContent;
	game.map = data.maps[name];
	game.map.name = name;
	
	game.map.map(function(p){
		return { x: p.x, y: p.y };
	}).forEach(function(cur, i, a){
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
			while (cur.y != next.y) {
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
});

ui.handletweets = function(data){
	var maps = {
		loopy: ui.id("pages-scores-twitter-loopy"),
		backtrack: ui.id("pages-scores-twitter-backtrack"),
		dash: ui.id("pages-scores-twitter-dash")
	};
	
	data.results.forEach(function(tweet){
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

})(game, data, ui, Math);