const gameId = '294f7e84-89f9-4944-819e-5e0ed51acbb6';

const D_LEFT = 1, D_RIGHT = 2, D_UP = 3, D_DOWN = 4;
const D_BOMB = "b"
const D_STOP = "x"
// const MAP = {
//     EMPTY: 0,
//     WOOD: 2,
//     BRICK: 1
// }
var MAP = {};
let currentMap = {};
let players;

// Connecto to API App server
const apiServer = 'http://codefest.local/';
const socket = io.connect(apiServer, {reconnect: true, transports: ['websocket']});

