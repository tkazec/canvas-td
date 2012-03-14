### import ###
import SocketServer, json
from game import Game


### server ###
class AIServer(SocketServer.StreamRequestHandler):
	def handle(self):
		pass


### init ###
server = SocketServer.TCPServer(("localhost", 10240), AIServer)
#server.wfile.write()