### import ###
import mathext as math
import turrets as Turrets
from creep import Creep


### game ###
class Game:
	### variables ###
	curtick = 0 # current tick
	callevery = [] # functions to call every tick until they return false
	
	curwave = 0 # current wave
	lastwave = 0 # tick last wave was started on
	
	hp = 1 # base hp of current wave
	hpmod = 1.3 # hp multiplier
	creeps = [] # creep array
	
	cash = 35 # current cash available
	spent = 0 # total cash spent
	
	kills = 0 # number of creeps killed
	lives = 10 # number of lives left
	turrets = [] # turret array
	
	
	### methods ###
	def __init__(self, map):
		pass
	
	def runtick(self):
		self.lastwave + 1200 <= self.curtick and self.sendwave() # send a wave every 1200 ticks
		
		for creep in self.creeps[:]: # loop through creeps
			if creep.hp <= 0: # creep dead?
				self.cash += creep.cash # rob the creep of all its money
				self.creeps.remove(creep) # dispose of the body
			elif creep.nextpoint === len(self.map): # creep got to the end?
				self.creeps.remove(creep) # as a reward, MURDER IT
				self.lives -= 1 # remove a life
				self.lives <= 0 && self.end() # maybe end the game :(
			else: # creep is fine
				creep.slowfor -= 1 # decrease amount of slow left
				if creep.slowfor <= 0: # no longer slow?
					creep.speed = 1 # restore normal speed :D
				if creep.fire: # on fire?
					creep.hp -= 30 # remove hp :(
		
		for turret in self.turrets: # loop through turrets
			if turret.lastshot + turret.rate <= game.curtick: # turret reloaded?
				creeps = [creep for creep in self.creeps if math.inRadius(creep, turret, turret.range)] # find creeps in range
				if creeps: # any creeps in range?
					turret.shoot(creeps) # shoot them!
					turret.shots += 1 # add to the shot count
					turret.lastshot = self.curtick # lastshot = now
		
		for func in self.callevery: # loop through functions to call
			if func() == False: # call it, does it return false?
				self.callevery.remove(func) # remove it
		
		self.curtick += 1 # set the current tick
	
	def sendwave(self):
		self.lastwave = self.curtick # set the last wave tick
		self.curwave += 1 # set the current wave
		
		multipliers = { 10: 1.2, 25: 1.1, 50: 1.06, 100: 1.04, 150: 1.02, 200: 1.01 } # define base hp multipliers (by wave)
		self.hpmod = multipliers[self.wave] if self.wave in multipliers else self.hpmod # possibly update the hp multiplier
		self.hp *= self.hpmod # multiply the base hp
		
		for i in range(1, 11): # create some creeps
			self.creeps.append(x = Creep(-(i * 20) - 10, y = self.map[0].y, hp = self.hp, wave = self.wave)) # creepy!
	
	def placeturret(self, type, ):
		pass
	
	def upgradeturret(self, turret, type):
		turret = self.turrets[turret] # turret
		levels = turret.levels # turret upgrade levels
		level = levels[type] # level we're upgrading
		cost = [25, 40, 75, 150, 250, 400, 500, 700, 900, 1000][level] # cost of the upgrade
		
		if cost and self.cash - cost >= 0: # enough cash?
			levels[type] += 1 # level up
			turret[type] = turret.upgrades[type] # upgrade
			turret.cost += cost # add to the turret's total cost
			turret.maxed = levels["damage"] == 10 and levels["range"] == 10 and levels["rate"] == 10 # turret maxed out? write it down :D
			game.cash -= cost # decrease cash
			game.spent += cost # increase total cash spent
	
	def moveturret(self, turret, ):
		pass
	
	def sellturret(self, turret):
		turret = self.turrets[turret] # turret
		value = round(turret.cost * .7)
		self.cash += value
		self.spent -= turret.cost
		self.turrets.remove(turret)