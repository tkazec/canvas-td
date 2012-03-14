This is a headless implementation of Canvas TD in Python, with a TCP API for AIs.

Networking and messages
==============================
The server runs on port 10240.

All messages are standard JSON.

Server messages
------------------------------
The first message is sent when a connection is established; it contains map data:

	{ ??? }

A message containing game state data and error messages is sent after every six ticks:

	{ "errors": [], "wave": 0, "creeps": [], "lives": 10, "cash": 35 }

`errors` is an array of ???:

	???

`creeps` is an array of objects (note: `hp` and `speed` are percentages):

	{ "x": 0, "y": 0, "hp": 100, "speed": 100, "fire": false }

A message containing ??? is sent when the game ends:

	{ ??? }

Client messages
------------------------------
All client messages are an array of zero or more objects, each with an `action` key and zero or more action-specific parameter keys.

 - `{ "action": "wave" }`: Sends a wave.
 - `{ "action": "place", type: "<laser|tazer|missile|mortar>", ??? }`: Places a turret.
 - `{ "action": "upgrade", turret: <turret index>, type: "<damage|range|rate>" }`: Upgrades a turret.
 - `{ "action": "move", turret: <turret index>, ??? }`: Moves a turret.
 - `{ "action": "sell", turret: <turret index> }`: Sells a turret.

When a server receives a message from the client, it performs any actions, runs six ticks, and sends an appropriate reply.