### import ###
import mathext as math


### creep ###
class Creep:
	def __init__(self, x, y, hp, wave):
		self.x = x
		self.y = y
		self.offset = math.rand()
		self.nextpoint = 0
		
		self.speed = 1
		self.slowfor = 0
		
		self.fire = False
		
		self.hp = hp
		self.orighp = hp
		
		self.cash = wave