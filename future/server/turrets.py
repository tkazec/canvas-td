### import ###
import mathext as math


### base ###
class turret:
	shots = 0
	
	maxed = False
	levels = {
		"damage": 0,
		"range": 0,
		"rate": 0
	}
	
	def __init__(self, x, y):
		self.x = x
		self.y = y


### turrets ###
class laser(turret):
	cost = 15
	
	damage = 10
	range = 80
	rate = 40
	
	upgrades = [
		{ "damage": 15, "range": 85, "rate": 38, },
		{ "damage": 25, "range": 90, "rate": 36 },
		{ "damage": 50, "range": 95, "rate": 34, },
		{ "damage": 75, "range": 100, "rate": 32 },
		{ "damage": 100, "range": 105, "rate": 30 },
		{ "damage": 150, "range": 110, "rate": 28 },
		{ "damage": 200, "range": 120, "rate": 26 },
		{ "damage": 400, "range": 130, "rate": 25 },
		{ "damage": 600, "range": 140, "rate": 24 },
		{ "damage": 1000, "range": 160, "rate": 22 }
	]
	
	def shoot(self, creeps, game):
		creep = creeps[0]
		creep.hp -= self.damage
		
		if self.maxed and math.rand(9) == 0
			waypoint = game.map[0]
			creep.x, creep.y = waypoint.x, waypoint.y
			creep.nextpoint = 0

class missile(turret):
	cost = 25
	
	damage = 15
	range = 120
	rate = 60
	
	upgrades = [
		{ "damage": 20, "range": 125, "rate": 57 },
		{ "damage": 30, "range": 130, "rate": 54 },
		{ "damage": 40, "range": 135, "rate": 51 },
		{ "damage": 80, "range": 140, "rate": 48 },
		{ "damage": 120, "range": 145, "rate": 45 },
		{ "damage": 220, "range": 150, "rate": 42 },
		{ "damage": 320, "range": 160, "rate": 40 },
		{ "damage": 450, "range": 170, "rate": 38 },
		{ "damage": 600, "range": 180, "rate": 36 },
		{ "damage": 800, "range": 200, "rate": 33 }
	]
	
	def shoot(self, creeps, game):
		creep = creeps[math.rand(len(creeps) - 1)]
		shots = turret.shots % 4
		missile = { "x": self.x + (shots % 2 === 0 ? -5 : 5), "y": self.y + (shots < 2 ? -5 : 5) }
		
		game.untilfalse.push(function(){
			if (creep.hp <= 0) {
				var creeps = game.creeps.filter(function(){ return true; });
				if (creeps.length) {
					creep = creeps[Math.rand(creeps.length - 1)];
				} else {
					return false;
				}
			}
			
			if (Math.move(missile, creep, 3)) {
				if (turret.full) {
					game.creeps.forEach(function(c){
						if (Math.inRadius(creep, c, 20)) { c.hp -= turret.damage; }
					});
				} else {
					creep.hp -= turret.damage;
				}
				return false;
			} else {
				canvas.fillStyle = "#fff";
				canvas.fillRect(missile.x - 2, missile.y - 2, 4, 4);
			}
		});

class tazer(missile):
	cost = 40
	
	damage = 1
	range = 60
	rate = 40
	
	upgrades = [
		{ "damage": 5, "range": 62, "rate": 38 },
		{ "damage": 10, "range": 64, "rate": 36 },
		{ "damage": 15, "range": 66, "rate": 34 },
		{ "damage": 25, "range": 68, "rate": 32 },
		{ "damage": 50, "range": 70, "rate": 30 },
		{ "damage": 100, "range": 75, "rate": 29 },
		{ "damage": 200, "range": 80, "rate": 28 },
		{ "damage": 300, "range": 85, "rate": 27 },
		{ "damage": 400, "range": 90, "rate": 26 },
		{ "damage": 500, "range": 100, "rate": 24 }
	]
	
	def shoot(self, creeps, game):
		creep = sorted(creeps, lambda a, b: b.speed - a.speed)[0]
		speed = 0.9 - (self.damage / 1000)
		slowfor = 60 + self.damage
		
		creep.hp -= self.damage
		creep.speed = speed if creep.speed > speed else creep.speed
		creep.slowfor = 10e10 if turret.maxed else (slowfor if creep.slowfor < slowfor else creep.slowfor)

class mortar(turret):
	cost = 60
	
	damage = 50
	range = 200
	rate = 120
	
	upgrades = [
		{ "damage": 75, "range": 205, "rate": 115 },
		{ "damage": 100, "range": 210, "rate": 110 },
		{ "damage": 150, "range": 215, "rate": 105 },
		{ "damage": 250, "range": 220, "rate": 100 },
		{ "damage": 400, "range": 225, "rate": 96 },
		{ "damage": 600, "range": 230, "rate": 92 },
		{ "damage": 800, "range": 235, "rate": 88 },
		{ "damage": 1000, "range": 240, "rate": 84 },
		{ "damage": 1200, "range": 245, "rate": 80 },
		{ "damage": 1500, "range": 250, "rate": 75 }
	]
	
	def shoot(creeps, game):
		var creep = creeps[0], turret = this, target = { x: creep.x / 1, y: creep.y / 1 }, shell = { x: turret.x / 1, y: turret.y / 1 }, radius = 25 + (turret.damage / 150);
		
		game.untilfalse.push(function(){
			if (Math.move(shell, target, 1.5)) {
				game.creeps.forEach(function(creep){
					if (Math.inRadius(creep, target, radius)) {
						creep.hp -= turret.damage;
						if (turret.full) { creep.fire = true; }
					}
				});
				return false;
			} else {
				canvas.fillStyle = "grey";
				canvas.fillRect(shell.x - 3, shell.y - 3, 6, 6);
			}
		});