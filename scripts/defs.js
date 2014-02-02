var Defs = {};


///////////////////////////////////////////////////////////////////////////////
// Maps
///////////////////////////////////////////////////////////////////////////////
Defs.maps = {
	Loopy: [
		{ x: 0, y: 70 },
		{ x: 730, y: 70 },
		{ x: 730, y: 430 },
		{ x: 70, y: 430 },
		{ x: 70, y: 160 },
		{ x: 640, y: 160 },
		{ x: 640, y: 340 },
		{ x: 160, y: 340 },
		{ x: 160, y: 250 },
		{ x: 800, y: 250 }
	],
	
	Backtrack: [
		{ x: 0, y: 170 },
		{ x: 120, y: 170 },
		{ x: 120, y: 415 },
		{ x: 460, y: 415 },
		{ x: 460, y: 185 },
		{ x: 230, y: 185 },
		{ x: 230, y: 70 },
		{ x: 345, y: 70 },
		{ x: 345, y: 300 },
		{ x: 700, y: 300 },
		{ x: 700, y: 0 }
	],
	
	Dash: [
		{ x: 0, y: 250 },
		{ x: 800, y: 250 }
	]
};


///////////////////////////////////////////////////////////////////////////////
// Turrets
///////////////////////////////////////////////////////////////////////////////
Defs.turrets = {};

Defs.turrets.upgrades = [25, 40, 75, 150, 250, 400, 500, 700, 900, 1000];

Defs.turrets.Laser = {
	cost: 15,
	damage: 10,
	rate: 40,
	range: 80,
	upgrades: [
		{ damage: 15, rate: 38, range: 85 },
		{ damage: 25, rate: 36, range: 90 },
		{ damage: 50, rate: 34, range: 95 },
		{ damage: 75, rate: 32, range: 100 },
		{ damage: 100, rate: 30, range: 105 },
		{ damage: 150, rate: 28, range: 110 },
		{ damage: 200, rate: 26, range: 120 },
		{ damage: 400, rate: 25, range: 130 },
		{ damage: 600, rate: 24, range: 140 },
		{ damage: 1000, rate: 22, range: 160 }
	],
	shoot: function (creeps) {
		var creep = creeps[0];
		var _hp = creep.hp;
		var turret = this;
		
		if ((creep.hp -= turret.damage) <= 0 && _hp > 0) {
			turret.kills++;
		}
		
		if (turret.levels.full && Math.rand(9) === 0) {
			var start = game.map[0];
			creep.x = start.x;
			creep.y = start.y;
			creep.nextpoint = 0;
		}
		
		game.run.push({ what: function () {
			canvas.lineCap = "round";
			canvas.lineWidth = 2;
			canvas.strokeStyle = "#EE82EE";
			canvas.beginPath();
			canvas.moveTo(turret.x, turret.y);
			canvas.lineTo(creep.x, creep.y);
			canvas.stroke();
		}, until: 6 });
	}
};

Defs.turrets.Missile = {
	cost: 25,
	damage: 15,
	rate: 60,
	range: 120,
	upgrades: [
		{ damage: 20, rate: 57, range: 125 },
		{ damage: 30, rate: 54, range: 130 },
		{ damage: 40, rate: 51, range: 135 },
		{ damage: 80, rate: 48, range: 140 },
		{ damage: 120, rate: 45, range: 145 },
		{ damage: 220, rate: 42, range: 150 },
		{ damage: 320, rate: 40, range: 160 },
		{ damage: 450, rate: 38, range: 170 },
		{ damage: 600, rate: 36, range: 180 },
		{ damage: 800, rate: 33, range: 200 }
	],
	cell: 0,
	shoot: function (creeps) {
		var creep = creeps[Math.rand(creeps.length - 1)];
		var cell = this.cell % 4;
		var missile = { x: this.x + (cell % 2 === 0 ? -5 : 5), y: this.y + (cell < 2 ? -5 : 5) };
		var turret = this;
		
		game.run.push({ what: function () {
			if (creep.hp <= 0) {
				var creeps = game.creeps.filter(function () { return true; });
				
				if (creeps.length) {
					creep = creeps[Math.rand(creeps.length - 1)];
				} else {
					return false;
				}
			}
			
			if (Math.move(missile, creep, 3)) {
				if (turret.levels.full) {
					game.creeps.forEach(function (c) {
						if (Math.inRadius(creep, c, 20)) {
							var _hp = c.hp;
							if ((c.hp -= turret.damage) <= 0 && _hp > 0) {
								turret.kills++;
							}
						}
					});
					
					game.run.push({ what: function () {
						canvas.fillStyle = "#FF0";
						canvas.beginPath();
						canvas.moveTo(creep.x, creep.y);
						canvas.arc(creep.x, creep.y, 20, 0, Math.PI * 2, true);
						canvas.fill();
					}, until: 3 });
				} else {
					var _hp = creep.hp;
					if ((creep.hp -= turret.damage) <= 0 && _hp > 0) {
						turret.kills++;
					}
				}
				
				return false;
			} else {
				canvas.fillStyle = "#FFF";
				canvas.fillRect(missile.x - 2, missile.y - 2, 4, 4);
			}
		}, until: Infinity });
		
		turret.cell++;
	}
};

Defs.turrets.Tazer = {
	cost: 40,
	damage: 1,
	rate: 40,
	range: 60,
	upgrades: [
		{ damage: 5, rate: 38, range: 62 },
		{ damage: 10, rate: 36, range: 64 },
		{ damage: 15, rate: 34, range: 66 },
		{ damage: 25, rate: 32, range: 68 },
		{ damage: 50, rate: 30, range: 70 },
		{ damage: 100, rate: 29, range: 75 },
		{ damage: 200, rate: 28, range: 80 },
		{ damage: 300, rate: 27, range: 85 },
		{ damage: 400, rate: 26, range: 90 },
		{ damage: 500, rate: 24, range: 100 }
	],
	shoot: function (creeps) {
		var creep = creeps.sort(function (a, b) { return b.speed - a.speed; })[0];
		var _hp = creep.hp;
		var turret = this;
		var speed = 0.9 - (turret.damage / 1000);
		var slowfor = 60 + turret.damage;
		
		if ((creep.hp -= turret.damage) <= 0 && _hp > 0) {
			turret.kills++;
		}
		
		creep.speed = creep.speed > speed ? speed : creep.speed;
		creep.slowfor = turret.levels.full ? Infinity : (creep.slowfor < slowfor ? slowfor : creep.slowfor);
		
		game.run.push({ what: function () {
			canvas.lineCap = "round";
			canvas.lineWidth = 3;
			canvas.strokeStyle = "#00F";
			canvas.beginPath();
			canvas.moveTo(turret.x, turret.y);
			canvas.lineTo(creep.x, creep.y);
			canvas.stroke();
			canvas.strokeStyle = "#FFF";
			canvas.lineWidth = 2;
			canvas.beginPath();
			canvas.moveTo(turret.x, turret.y);
			canvas.lineTo(creep.x, creep.y);
			canvas.stroke();
		}, until: 6 });
	}
};

Defs.turrets.Mortar = {
	cost: 60,
	damage: 50,
	rate: 120,
	range: 200,
	upgrades: [
		{ damage: 75, rate: 115, range: 205 },
		{ damage: 100, rate: 110, range: 210 },
		{ damage: 150, rate: 105, range: 215 },
		{ damage: 250, rate: 100, range: 220 },
		{ damage: 400, rate: 96, range: 225 },
		{ damage: 600, rate: 92, range: 230 },
		{ damage: 800, rate: 88, range: 235 },
		{ damage: 1000, rate: 84, range: 240 },
		{ damage: 1200, rate: 80, range: 245 },
		{ damage: 1500, rate: 75, range: 250 }
	],
	shoot: function (creeps) {
		var creep = creeps[0];
		var turret = this;
		var target = { x: creep.x / 1, y: creep.y / 1 };
		var shell = { x: turret.x / 1, y: turret.y / 1 };
		var radius = 25 + (turret.damage / 150);
		
		game.run.push({ what: function () {
			if (Math.move(shell, target, 1.5)) {
				game.creeps.forEach(function (creep) {
					if (Math.inRadius(creep, target, radius)) {
						var _hp = creep.hp;
						
						if ((creep.hp -= turret.damage) <= 0 && _hp > 0) {
							turret.kills++;
						}
						
						if (turret.levels.full && !creep.burning) {
							creep.burning = turret;
						}
					}
				});
				
				game.run.push({ what: function () {
					canvas.fillStyle = "#FF0";
					canvas.beginPath();
					canvas.moveTo(target.x, target.y);
					canvas.arc(target.x, target.y, radius, 0, Math.PI * 2, true);
					canvas.fill();
				}, until: 3 });
				
				return false;
			} else {
				canvas.fillStyle = "#808080";
				canvas.fillRect(shell.x - 3, shell.y - 3, 6, 6);
			}
		}, until: Infinity });
	}
};