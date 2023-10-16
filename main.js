// Precondition: You need to require socket.io.js in your html page
// Reference link https://socket.io
// <script src="socket.io.js"></script>
let bombSetup = false;
const playerId = 'player1-xxx';
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

var myX, myY
var flagMove = false;
var gameStart = true;
//API-2
socket.on('ticktack player', (res) => {
    console.log(res)
    if(playerId.includes(res.player_id)) {
        // console.log(res)
        // console.log(playerId.includes(res.player_id))
    }
    if(playerId.includes(res.player_id) && res.tag == "player:back-to-playground") {
        start = false
        gameStart = false;
    }

    if(playerId.includes(res.player_id) && res.tag == "player:moving-banned") {
        start = false
        gameStart = false;
    }

    if (start) return;
    start = true;
    currentMap = res.map_info.map
    BOMB = res.map_info.bombs
    SPOILS = res.map_info.spoils
    players = res.map_info.players
    myX = players[0].currentPosition.col; //15
    myY = players[0].currentPosition.row; // 3
    document.getElementById('ticktack-status').innerHTML = 'ON';
    driveLoop(currentMap, res);
    
});


function driveLoop(currentMap, res) {
    MAP = currentMap
    let path =  ProcessGetDirection.findPath(myX, myY)
    let step = "", destX, destY = null;
    if (path === false) {
        return true
    }
    step = converPathToGamePad(path)
    if(res.tag == "bomb:setup" && playerId.includes(res.player_id) ) {
        let back = AfterPlanted.bombedRun(myY, myX, currentMap)
        drive(back+'xxxxxxxxxx', destX, destY, true);
        bombSetup = true
    } else if(playerId.includes(res.player_id) ) {
        if(!bombSetup) {
            drive(step, destX, destY, false);
        }
    }

    if(gameStart) {
        drive(step+'b', destX, destY);
        gameStart = false;
    }

    if(checkBombList(res.map_info.bombs) && playerId.includes(res.player_id)  && res.tag == 'bomb:explosed') {
        bombSetup = false
        gameStart = true;
    }

    start = false
}

function converPathToGamePad(path) {
    let step = ''
    for (let index = 1; index < path.length; index++) {
        let nextStepLocation = path[index];
        let previousLocation = path[index - 1]
        let x = previousLocation.x
        let y = previousLocation.y;

        destX = nextStepLocation.x;
        destY = nextStepLocation.y;
        let direction = '';
        if (x == destX) {
            // di len hoac di xuong
            if (destY > y) {
                direction = '4' // di xuong
            } else if (destY < y) {
                direction = '3' // di len
            } else {
                // da den noi ---> todo tim huong tiep theo
            }
        } else if (y == destY) {
            // di trai hoac di phai
            if (destX > x) {
                direction = '2' // sang phai
            } else if (destX < x) {
                direction = '1' // sang trai
            } else {
                // da den noi ---> todo tim huong tiep theo
            }
        } else {
            // da den noi hoac vi tri di treo
        }
        step = step + direction;
    }
    
    return step
}

// API-3a
// socket.emit('drive player', { direction: '111b333222' });

//API-3b
socket.on('drive player', (res) => {
    start = false
    
});

function onStartDirection() {
    MAP = currentMap
    let manual = $('#manual').val()
    let cor = manual.split(",");

    driveLoop(currentMap);
}

function onManualDrive() {
    drive($('#manual').val())
}

function drive(d, x, y, f) {
    if(f) {
        ne_bom_timeout = true;
        socket.emit("drive player", {direction: d})
    }else{
        ne_bom_timeout = false;
        socket.emit("drive player", {direction: d + 'b'})
    }
}

function SortPosSpoils(spoils) { 
    spoils.sort(function(a,b) {
        var pos_a_to_player = Math.abs(a.row - myY) + Math.abs(a.col - myX);
        var pos_b_to_player = Math.abs(b.row - myY) + Math.abs(b.col - myX);
        if (pos_a_to_player < pos_b_to_player) {
            return -1;
        } 
         if (pos_a_to_player > pos_b_to_player)  {
            return 1;
        } 
    
        return 0;
    
    }); 
    return spoils;
}

function checkBombList(bombs) {
    for (let i = 0; i < bombs.length; i++) {
        if(bombs[i].playerId == playerId) {
            return false
        }
    }
    return true
}