### import ###
from __future__ import division
from math import *
import ctypes


### variables ###
pi2 = pi * 2


### methods ###
def inRadius(target, obj, rad):
	return (obj.x - target.x)*(obj.x - target.x) + (obj.y - target.y)*(obj.y - target.y) < rad*rad

def move(obj, target, speed):
	distx = target.x - obj.x
	disty = target.y - obj.y
	angle = atan2(disty, distx)
	
	obj.x += speed * cos(angle)
	obj.y += speed * sin(angle)
	
	return abs(distx) + abs(disty) < 2

_randx = ctypes.c_uint32(10240)
_randy = ctypes.c_uint32(12345)
_randz = ctypes.c_uint32(67890)
_randw = ctypes.c_uint32(32768)
_randd = 2 ** 32
def rand(n):
	global _randx, _randy, _randz, _randw, _randd
	t = ctypes.c_uint32(_randx.value ^ (_randx.value << 15))
	_randx = _randy
	_randy = _randz
	_randz = _randw
	_randw = ctypes.c_uint32((_randw.value ^ (_randw.value >> 21)) ^ (t.value ^ (t.value >> 4)))
	return floor((_randw / _randd) * (n + 1))