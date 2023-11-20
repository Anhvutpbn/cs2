const gameId = 'a73632b5-c2d8-4749-bcd5-1355722535ad';

const D_LEFT = 1, D_RIGHT = 2, D_UP = 3, D_DOWN = 4;
const D_BOMB = "b"
const D_STOP = "x"
// const MAP = {
//     EMPTY: 0,
//     WOOD: 2,
//     BRICK: 1
// }
let MAP = {};
let BOMB = [];
let SPOILS = [];
let currentMap = {};
let players;

// Connecto to API App server
const apiServer = 'http://codefest.local/';
const socket = io.connect(apiServer, {reconnect: true, transports: ['websocket']});

