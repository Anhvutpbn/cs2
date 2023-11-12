// Precondition: You need to require socket.io.js in your html page
// Reference link https://socket.io
// <script src="socket.io.js"></script>
let bombSetup = false;
const playerId = 'player2-xxx';
// LISTEN SOCKET.IO EVENTS
var start = false
// It it required to emit `join channel` event every time connection is happened
socket.on('connect', () => {
    document.getElementById('connected-status').innerHTML = 'ON';
    document.getElementById('socket-status').innerHTML = 'Connected';
    console.log('[Socket] connected to server');
    // API-1a
    socket.emit('join game', {game_id: gameId, player_id: playerId});
});

socket.on('disconnect', () => {
    console.warn('[Socket] disconnected');
    document.getElementById('socket-status').innerHTML = 'Disconnected';
});

socket.on('connect_failed', () => {
    console.warn('[Socket] connect_failed');
    document.getElementById('socket-status').innerHTML = 'Connected Failed';
});


socket.on('error', (err) => {
    console.error('[Socket] error ', err);
    document.getElementById('socket-status').innerHTML = 'Error!';
});


// SOCKET EVENTS

// API-1b
socket.on('join game', (res) => {
    console.log('[Socket] join-game responsed', res);
    document.getElementById('joingame-status').innerHTML = 'ON';
});
const START_GAME = "start-game"
const MOVING_BANNED = "player:moving-banned"
const START_MOVING = "player:start-moving"
const STOP_MOVING = "player:stop-moving"
const BE_ISOLATED = "player:be-isolated"
const BTPG = "player:back-to-playground"
const BOMBE = "bomb:explosed"
const BOMBS = "bomb:setup"

var myX, myY
var flag = START_GAME
//API-2
socket.on('ticktack player', (res) => {
    let driverx = Math.floor(Math.random() * 4) + 1;
    drive(driverx);
});