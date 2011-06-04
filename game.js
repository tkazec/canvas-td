(function(canvas, ui, Math){

var game = this.game = {
	ticks: 0,
	_ticks: 0,
	_tick: 0,
	ticker: -1,
	run: [],
	paused: true,
	
	wave: 0,
	_wave: 0,
	
	creeps: [],
	hp: 1,
	hpinc: 1.3,
	lives: 10,
	
	turrets: [],
	spent: 0,
	kills: 0,
	_cash: 35,
	selection: false,
	
	tiles: {},
	
	get cash(){
		return game._cash;
	},
	set cash(v){
		ui.cash.textContent = game._cash = v;
	},
	
	tick: function(){
		/*** fps ***/
		if (game.ticks - game._ticks === 60) {
			ui.fps.textContent = Math.round(60000 / (Date.now() - game._tick));
			game._tick = Date.now();
			game._ticks = game.ticks;
		}
		
		
		/*** wave ***/
		if ((game.ticks - game._wave) % 60 === 59) {
			ui.timer.style.height = 40 + (((game._wave - game.ticks - 1) / 60) * 2) + "px";
		}
		
		if (game._wave + 1200 === game.ticks) {
			ui.wave.textContent = ++game.wave;
			
			game.hpinc = { 10: 1.2, 25: 1.1, 50: 1.06, 100: 1.04, 150: 1.02, 200: 1.01 }[game.wave] || game.hpinc;
			game.hp *= game.hpinc;
			
			for (var i = 1; i <= 10; i++) {
				game.creeps.push({
					x: -(i * 20) - 10,
					y: game.map[0].y,
					offset: Math.rand(14),
					nextpoint: 0,
					speed: 1,
					slowfor: 0,
					hp: game.hp,
					_hp: game.hp,
					burning: false,
					cash: game.wave
				});
			}
			
			game._wave = game.ticks;
		}
		
		
		/*** map ***/
		canvas.fillStyle = "#000";
		canvas.fillRect(0, 0, 800, 500);
		
		var map = game.map.slice(1), start = game.map[0];
		canvas.lineWidth = 40;
		canvas.strokeStyle = "#00F";
		canvas.beginPath();
		canvas.moveTo(start.x, start.y);
		map.forEach(function(cur, i){
			canvas.lineTo(cur.x, cur.y);
		});
		canvas.stroke();
		canvas.lineWidth = 30;
		canvas.strokeStyle = "#004";
		canvas.beginPath();
		canvas.moveTo(start.x, start.y);
		map.forEach(function(cur, i){
			canvas.lineTo(cur.x, cur.y);
		});
		canvas.stroke();
		
		
		/*** creeps ***/
		game.creeps.forEach(function(creep, i, a){
			var _hp = creep.hp, burning = creep.burning;
			burning && (creep.hp -= 30);
			
			if (creep.hp <= 0) {
				if (_hp > 0) { burning.kills++; }
				game.kills++;
				game.cash += creep.cash;
				delete a[i];
				ui.action.refresh();
			} else if (creep.nextpoint === game.map.length) {
				delete a[i];
				
				ui.lives.textContent = --game.lives;
				game.lives === 0 && game.end();
			} else {
				if (--creep.slowfor <= 0) { creep.speed = 1; }
				
				var waypoint = game.map[creep.nextpoint];
				Math.move(creep, { x: waypoint.x - 7 + creep.offset, y: waypoint.y - 7 + creep.offset }, creep.speed) && creep.nextpoint++;
				
				canvas.fillStyle = "rgb(" + Math.round(255 * (creep.hp / creep._hp)) + ", 0, 0)";
				canvas.fillRect(creep.x - 5, creep.y - 5, 10, 10);
				
				if (creep.speed < 1 || burning) {
					canvas.fillStyle = burning ? (creep.speed < 1 ? "#800080" : "#FFA500") : "#00F";
					canvas.fillRect(creep.x - 2, creep.y - 2, 4, 4);
				}
			}
		});
		
		
		/*** turrets ***/
		game.turrets.forEach(function(turret){
			if (turret.lastshot + turret.rate <= game.ticks) {
				var creeps = game.creeps.filter(function(creep){ return Math.inRadius(creep, turret, turret.range); });
				if (creeps.length > 0) {
					turret.shoot(creeps);
					turret.lastshot = game.ticks;
				}
			}
			
			canvas.drawImage(turret.img, turret.x - 12.5, turret.y - 12.5);
		});
		var selection = game.selection, turret = selection.turret;
		if (selection) {
			canvas.beginPath();
			canvas.fillStyle = selection.status === "selected" || selection.placeable ? "rgba(255, 255, 255, .3)" : "rgba(255, 0, 0, .3)";
			canvas.arc(turret.x, turret.y, turret.range, 0, Math.PI * 2, true);
			canvas.fill();
			
			canvas.drawImage(turret.img, turret.x - 12.5, turret.y - 12.5);
		}
		
		
		/*** finish ***/
		game.run.forEach(function(something, i, a){
			if (something.what() === false || --something.until === 0) {
				delete a[i];
			}
		});
		
		game.ticks++;
	},
	start: function(){
		game._ticks = game.ticks;
		game._tick = Date.now();
		game.ticker = window.setInterval(game.tick, 1000 / 60);
		game.paused = false;
		game.tick();
	},
	pause: function(){
		window.clearInterval(game.ticker);
		game.paused = true;
	},
	end: function(){
		game.pause();
		document.removeEventListener("keydown", ui.handleshortcuts, false);
		
		var map = game.map.name,
			kills = game.kills,
			spent = game.spent,
			score = kills * spent,
			text = score + " (" + kills + " kills, $" + spent + " spent)",
			top = JSON.parse(localStorage.scores || '{"Loopy":[],"Backtrack":[],"Dash":[]}'),
			topmap = top[map];
		
		if (score > (topmap.length === 5 && topmap[4].score)) {
			topmap.splice(4, 1);
			topmap.push({ score: score, kills: kills, spent: spent, date: Date.now() });
			topmap.sort(function(a, b){ return b.score - a.score; });
			localStorage.scores = JSON.stringify(top);
			ui.action.scores();
		}
		
		ui.id("control-score-text").textContent = text;
		ui.id("control-score-tweet").setAttribute("href",
			"https://twitter.com/?status=" + window.encodeURIComponent("I scored " + text + " on " + map + " in #canvastd"));
		
		ui.panel("score");
		ui.id("pages-overlay").style.display = "block";
	}
};

})(canvas, ui, Math);