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

const START_GAME = "start-game"
const MOVING_BANNED = "player:moving-banned"
const START_MOVING = "player:start-moving"
const STOP_MOVING = "player:stop-moving"
const BE_ISOLATED = "player:be-isolated"
const BTPG = "player:back-to-playground"
const BOMBE = "bomb:explosed"
const BOMBS = "bomb:setup"

//API-2
socket.on('ticktack player', (res) => {

    if(playerId.includes(res.player_id)) {
        console.log(res)
        if(
            res.tag.includes("player:moving-banned") ||
            res.tag.includes("player:be-isolated")
        ) {

            start = true
        }

    }
    if(playerId.includes(res.player_id) && res.tag == BTPG) {
        start = false
        gameStart = true;
    }
    if(playerId.includes(res.player_id) && res.tag == START_MOVING) {
        start = false
        gameStart = false;
    }
    if(playerId.includes(res.player_id) && res.tag == STOP_MOVING) {
        start = false
        gameStart = false;
    }

    if(playerId.includes(res.player_id) && res.tag == MOVING_BANNED) {
        start = false
        gameStart = true;
        console.log("Ngu qua ma")
    }

    if(playerId.includes(res.player_id) && res.tag == START_GAME) {
        start = false
        gameStart = false;
    }

    if(playerId.includes(res.player_id)  && BOMBE) {
        bombSetup = false
        gameStart = false;
    }
    // if(playerId.includes(res.player_id) || res.tag.includes("start-game") || res.tag.includes("player:stop-moving")) {
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
    // }
});


function driveLoop(currentMap, res) {
    if(gameStart) {
        drive('b', null, null);
        gameStart = false;
        return false
    }
    MAP = currentMap
    // MAP = ProcessGetDirection.convertDangerToWall(Danger.coordinates(), currentMap)

    let step = "", destX, destY = null;


    if(res.tag.includes("bomb:setup") && playerId.includes(res.player_id) ) {
        // Replace cac truong hop bomb no = 1

        console.log("--------SETUP THE BOMB ---------")
        let map_back_to_bomb = res.map_info.map
        let spawnBeginOfOtherPlayer = res.map_info.players.find(player => player.id !== playerId)?.currentPosition;
        map_back_to_bomb[spawnBeginOfOtherPlayer.row][spawnBeginOfOtherPlayer.col] = 1
        let back = AfterPlanted.bombedRun(myY, myX, map_back_to_bomb)
        drive(back, destX, destY, true);
        bombSetup = true
    } else if(playerId.includes(res.player_id) ) {
        console.log("if else")
        if(!bombSetup && res.tag.includes(BOMBE)) {
            console.log("!bomb setup")
            let path =  ProcessGetDirection.findPath(myX, myY)
            if (path == false) {
                return true
            }
            step = converPathToGamePad(path)
            drive(step+"b", destX, destY, false);
        } else {
            gameStart = true
        }
    }

    start = false
}

function converPathToGamePad(path) {
    let step = ''
    if (path == undefined) {
        return "x"
    }
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

function drive(d, x, y, f) {

    console.log(d)
    console.log(f)
    if(f) {
        ne_bom_timeout = true;
        socket.emit("drive player", {direction: d})
    }else{
        ne_bom_timeout = false;
        socket.emit("drive player", {direction: d})
    }
}
