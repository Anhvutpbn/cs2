const FROM_COL = 26
const FROM_ROW = 14

// CLASS phần việc tìm điểm nguy hiểm
Danger = {};
Danger.playerRow = FROM_ROW;
Danger.playerCol = FROM_COL;
Danger.rada = 6;
Danger.TELEPORT = 6;
Danger.MAP_EGG = 5;

Danger.minPosition = function (x) {
    if (x <= Danger.rada) {
        return 0;
    } else {
        return x - Danger.rada;
    }
}

Danger.maxPosition = function (x, max) {
    if ((x + Danger.rada) >= max) {
        return max;
    } else {
        return x + Danger.rada;
    }
}

// get coordinates bomb
Danger.coordinates = function () {
    let mapRow = MAP.length - 1;
    let mapCol = MAP[0].length - 1;
    let result = [];
    let minRow = Danger.minPosition(Danger.playerRow)
    let minCol = Danger.minPosition(Danger.playerCol)
    let maxRow = Danger.maxPosition(Danger.playerRow, mapRow)
    let maxCol = Danger.maxPosition(Danger.playerCol, mapCol)


    for (let index = 0; index < BOMB.length;  index++) {
        MAP[BOMB[index].row][BOMB[index].col] = 1
    }

    for (let i = minRow; i < maxRow; i++) {
        for (let y = minCol; y < maxCol; y++) {
            if (MAP[i][y] == Danger.TELEPORT || MAP[i][y] ==  Danger.MAP_EGG) {
                MAP[i][y] = 1;
            }
        }
    }



    return result;
}

Danger.getListBomb = function (col, row) {
    let mapRow = MAP.length - 1;
    let mapCol = MAP[0].length - 1;
    let result = [];
    for (let i = 0; i < mapCol; i++) {
        result.push({'col': i, 'row': row})
    }
    for (let y = 1; y < mapRow; y++) {
        result.push({'col': y, 'row': col})
    }

    return result;
}

Danger.getListVirusZombie = function (col, row) {
    let result = [];
    for (let i = col - 1; i <= col + 1; i++) {
        result.push({'col': i, 'row': row})
    }
    for (let y = row - 1; y <= row + 1; y++) {
        result.push({'col': col, 'row': y})
    }
    return result;
}


// GET finish point 
var Medic = {}
Medic.wall = 1;
Medic.balk = 2;
Medic.link = 3;
Medic.PlayerEggNeedToKill = 99;
Medic.findFinishPoint = function (fromX, fromY) {
    let coordinate = [{x: fromX, y: fromY, loopIndex: 0}];

    let loopIndex = 0;
    let flag = true;
    do {
        if (loopIndex == 50) {
            flag = false
        } else if (loopIndex == 0) {
            coordinate = [{x: fromX, y: fromY, loopIndex: 0}]
        } else {
            let pathTemp = [...coordinate];
            for (let index = 0; index < pathTemp.length; index++) {
                const element = pathTemp[index];
                let result = Medic.getCoordinates(element.x, element.y, coordinate, loopIndex)
                if (result.status == false) {
                    flag = false
                    return result.data
                } else {
                    coordinate = result.data
                }
            }
        }

        loopIndex++;
    } while (flag);
    return coordinate;
}

Medic.getCoordinates = function (row, col, coordinate, loopIndex) {
    let up = {row: row, col: col - 1}
    let down = {row: row, col: col + 1}
    let left = {row: row - 1, col: col}
    let right = {row: row + 1, col: col}
    if (Medic.checkWall(up)
        || Medic.checkWall(down)
        || Medic.checkWall(left)
        || Medic.checkWall(right)) {
        return {status: false, data: {row, col}};
    }
    let result = Medic.getStep(row, col, loopIndex, coordinate);
    return {status: true, data: result}
}

Medic.checkWall = function (coordinate) {
    if (MAP[coordinate.col][coordinate.row] == Medic.PlayerEggNeedToKill) {
        return true;
    }
    if (MAP[coordinate.col][coordinate.row] == Medic.balk) {
        return true;
    }
    return false;
}

Medic.checkAvailablePoint = function (x, y) {
    if (MAP[y] && MAP[y][x]) {
        let point = MAP[y][x];
        return point == 0
    }
    return false;
}

Medic.getStep = function (x, y, loopIndex, pathTemp) {
    let yUp = y - 1
    let sUp = {
        x,
        y: yUp,
        loopIndex
    };

    let xLeft = (x - 1)
    let sLeft = {
        x: xLeft,
        y,
        loopIndex
    };

    let xRight = (x + 1)
    let sRight = {
        x: xRight,
        y,
        loopIndex
    };

    let yDown = (y + 1);
    let sDown = {
        x,
        y: yDown,
        loopIndex
    };

    let isExistsUp = Medic.isExist(loopIndex, x, yUp, pathTemp);
    if (!isExistsUp) {
        pathTemp.push(sUp);
    }
    let isExistsLeft = Medic.isExist(loopIndex, xLeft, y, pathTemp);
    if (!isExistsLeft) {
        pathTemp.push(sLeft);
    }
    let isExistsRight = Medic.isExist(loopIndex, xRight, y, pathTemp);
    if (!isExistsRight) {
        pathTemp.push(sRight);
    }
    let isExistsDown = Medic.isExist(loopIndex, x, yDown, pathTemp);
    if (!isExistsDown) {
        pathTemp.push(sDown);
    }

    return pathTemp
}

Medic.isExist = function (loopIndex, x, y, pathTemp) {
    let isExistsUp = false
    if (pathTemp.findIndex(element => element.x == x && element.y == y) !== -1
        || MAP[y][x] == Medic.wall || MAP[y][x] == Medic.balk || MAP[y][x] == Medic.link) {
        isExistsUp = true
    }
    return isExistsUp;
}

// CLASS Phần việc tìm đường

var ProcessGetDirection = {}

// common const (edit)
ProcessGetDirection.brick = 1;
ProcessGetDirection.balk = 2;
ProcessGetDirection.teleport = 3;
ProcessGetDirection.quaran = 4;
//20.3

ProcessGetDirection.findBack = function (pathFB, loopIndex, xDest, yDest) {
    let flag = true;
    let findBackArray = [{
        x: xDest,
        y: yDest,
        loopIndex
    }]

    let yTempDest;
    let xTempDest;
    do {
        for (let index = loopIndex - 1; index >= 0; index--) {
            xTempDest = findBackArray[findBackArray.length - 1].x
            yTempDest = findBackArray[findBackArray.length - 1].y
            let yUp = yTempDest - 1
            let sUp = {
                x: xTempDest,
                y: yUp,
                loopIndex: index
            };

            let xLeft = (xTempDest - 1)
            let sLeft = {
                x: xLeft,
                y: yTempDest,
                loopIndex: index
            };

            let xRight = (xTempDest + 1)
            let sRight = {
                x: xRight,
                y: yTempDest,
                loopIndex: index
            };

            let yDown = (yTempDest + 1);
            let sDown = {
                x: xTempDest,
                y: yDown,
                loopIndex: index
            };


            if (pathFB.findIndex(element => element.x == sUp.x && element.y == sUp.y && element.loopIndex == index) !== -1) {
                findBackArray.push(sUp)
                continue
            }

            if (pathFB.findIndex(element => element.x == sLeft.x && element.y == sLeft.y && element.loopIndex == index) !== -1) {
                findBackArray.push(sLeft)
                continue
            }


            if (pathFB.findIndex(element => element.x == sRight.x && element.y == sRight.y && element.loopIndex == index) !== -1) {
                findBackArray.push(sRight)
                continue
            }


            if (pathFB.findIndex(element => element.x == sDown.x && element.y == sDown.y && element.loopIndex == index) !== -1) {
                findBackArray.push(sDown)
                continue
            }
            if (index == 0) flag = false
        }

        flag = false

    } while (flag);
    return findBackArray;
}

ProcessGetDirection.getStep = function (x, y, loopIndex, pathTemp) {
    let yUp = y - 1
    let sUp = {
        x,
        y: yUp,
        loopIndex
    };

    let xLeft = (x - 1)
    let sLeft = {
        x: xLeft,
        y,
        loopIndex
    };

    let xRight = (x + 1)
    let sRight = {
        x: xRight,
        y,
        loopIndex
    };

    let yDown = (y + 1);
    let sDown = {
        x,
        y: yDown,
        loopIndex
    };

    let isExistsUp = ProcessGetDirection.isExist(loopIndex, x, yUp, pathTemp);
    if (!isExistsUp) {
        pathTemp.push(sUp);
    }
    let isExistsLeft = ProcessGetDirection.isExist(loopIndex, xLeft, y, pathTemp);
    if (!isExistsLeft) {
        pathTemp.push(sLeft);
    }
    let isExistsRight = ProcessGetDirection.isExist(loopIndex, xRight, y, pathTemp);
    if (!isExistsRight) {
        pathTemp.push(sRight);
    }
    let isExistsDown = ProcessGetDirection.isExist(loopIndex, x, yDown, pathTemp);
    if (!isExistsDown) {
        pathTemp.push(sDown);
    }

    return pathTemp
}


ProcessGetDirection.isExist = function (loopIndex, x, y, pathTemp) {
    let isExistsUp = false
    if (pathTemp.findIndex(element => element.x == x && element.y == y) != -1
        || MAP[y][x] == ProcessGetDirection.brick || MAP[y][x] == ProcessGetDirection.balk || MAP[y][x] == ProcessGetDirection.teleport) {
        isExistsUp = true
    }
    return isExistsUp;
}

ProcessGetDirection.convertDangerToWall = function (dangerCoordinates, maps) {
    //    for (let index = 0; index < SPOILS.length;  index++) {
    //     if(SPOILS[index].spoil_type == 6) {
    //         maps[SPOILS[index].row][SPOILS[index].col] = 1
    //     }
    // }

    for (let index = 0; index < dangerCoordinates.length; index++) {
        maps[dangerCoordinates[index].row][dangerCoordinates[index].col] = 1
    }

    return maps;
}

ProcessGetDirection.findPath = function (fromX, fromY) {

    let path = [];
    if (MAP[fromY][fromX] == ProcessGetDirection.quaran) {
        console.log("----------------------quaran--------------------")
        console.log(fromY)
        console.log(fromX)
        console.log("----------------------quaran--------------------")
        return false
    }

    let currentPoint = Medic.findFinishPoint(fromX, fromY);

    let toX = currentPoint.row
    let toY = currentPoint.col

    let loopIndex = 0;
    let flag = true;
    do {
        if(loopIndex == 20 ) {
            flag = false
        } else if (loopIndex == 0) {
            path.push({
                x: fromX,
                y: fromY,
                loopIndex
            })
        } else {

            let pathTemp = [...path];
            for (let index = 0; index < pathTemp.length; index++) {
                const element = pathTemp[index];
                path = ProcessGetDirection.getStep(element.x, element.y, loopIndex, path)
            }
        }
        if (path.findIndex(element => element.x == toX && element.y == toY) !== -1) {
            flag = false;
            //find back
            return ProcessGetDirection.findBack(path, loopIndex, toX, toY).reverse()
        }

        loopIndex++;
    } while (flag);

}

// let pa = ProcessGetDirection.findPath(FROM_COL,FROM_ROW,TO_COL,TO_ROW)

// GET bomb
var AfterPlanted = {}
AfterPlanted.wall = 1;
AfterPlanted.teleport = 6;
AfterPlanted.egg = 5;
AfterPlanted.findFinishPoint = function (fromX, fromY) {

    let coordinate = [{x: fromX, y: fromY, loopIndex: 0}];

    // sét các tọa độ nguy hiểm thành tường đá
    // ProcessGetDirection.map = ProcessGetDirection.convertDangerToWall(Danger.coordinates(), MAP)
    let loopIndex = 0;
    do {
        if (loopIndex == 0) {
            coordinate = [{x: fromX, y: fromY, loopIndex: 0}]
        } else {
            let pathTemp = [...coordinate];
            for (let index = 0; index < pathTemp.length; index++) {
                const element = pathTemp[index];
                coordinate = AfterPlanted.getCoordinates(element.x, element.y, coordinate, loopIndex, fromX, fromY)
            }
        }

        loopIndex++;
    } while (loopIndex < 8);

    return coordinate;
}

AfterPlanted.getCoordinates = function (row, col, coordinate, loopIndex, fromX, fromY) {
    let up = {row: row, col: col - 1}
    let down = {row: row, col: col + 1}
    let left = {row: row - 1, col: col}
    let right = {row: row + 1, col: col}
    return AfterPlanted.getStep(row, col, loopIndex, coordinate, fromX, fromY);
}

AfterPlanted.checkAvailable = function (coordinate, fromX, fromY) {
    if (MAP[coordinate.col][coordinate.row] == 0
         && coordinate.col != fromY && coordinate.row != fromX) {
        return true;
    }
    return false;
}

AfterPlanted.checkAvailablePoint = function (x, y) {
    if (MAP[y] && MAP[y][x]) {
        let point = MAP[y][x];
        return point == 0
    }
    return false;
}

AfterPlanted.getStep = function (x, y, loopIndex, pathTemp, fromX, fromY) {
    let yUp = y - 1
    let sUp = {
        x,
        y: yUp,
        loopIndex
    };

    let xLeft = (x - 1)
    let sLeft = {
        x: xLeft,
        y,
        loopIndex
    };

    let xRight = (x + 1)
    let sRight = {
        x: xRight,
        y,
        loopIndex
    };

    let yDown = (y + 1);
    let sDown = {
        x,
        y: yDown,
        loopIndex
    };

    let isExistsUp = AfterPlanted.isExist(loopIndex, x, yUp, pathTemp, fromX, fromY);
    if (!isExistsUp) {
        pathTemp.push(sUp);
    }
    let isExistsLeft = AfterPlanted.isExist(loopIndex, xLeft, y, pathTemp, fromX, fromY);
    if (!isExistsLeft) {
        pathTemp.push(sLeft);
    }
    let isExistsRight = AfterPlanted.isExist(loopIndex, xRight, y, pathTemp, fromX, fromY);
    if (!isExistsRight) {
        pathTemp.push(sRight);
    }
    let isExistsDown = AfterPlanted.isExist(loopIndex, x, yDown, pathTemp, fromX, fromY);
    if (!isExistsDown) {
        pathTemp.push(sDown);
    }

    return pathTemp
}

AfterPlanted.isExist = function (loopIndex, x, y, pathTemp, fromX, fromY) {
    let isExistsUp = false
    if (pathTemp.findIndex(element => element.x == x && element.y == y) != -1
        || MAP[y][x] == AfterPlanted.wall || MAP[y][x] == AfterPlanted.teleport || MAP[y][x] == AfterPlanted.egg) {
        isExistsUp = true
    }
    return isExistsUp;
}

AfterPlanted.checkWalk = function (x, y, currentMap) {
    let isExistsUp = true
    if (currentMap[x][y] == 1 || currentMap[x][y] == 5 || currentMap[x][y] == 2 || currentMap[x][y] == 6 || currentMap[x][y] == 3 || currentMap[x][y] == 99) {
        isExistsUp = false
    }
    return isExistsUp;
}

AfterPlanted.bombedRun = function (fromX, fromY, currentMap) {
    // run 1 step
    if(AfterPlanted.checkWalk(fromX-1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX-1, fromY+1, currentMap)) { 
            return '32'
        } 
        if(AfterPlanted.checkWalk(fromX-1, fromY-1, currentMap)) { 
            return '31'
        }
    }
        
    if(AfterPlanted.checkWalk(fromX+1, fromY, currentMap)) { 
        if(AfterPlanted.checkWalk(fromX+1, fromY+1, currentMap)) { 
            return '42'
        } 
        if(AfterPlanted.checkWalk(fromX+1, fromY-1, currentMap)) { 
            return '41'
        }
    }
        
    if(AfterPlanted.checkWalk(fromX, fromY-1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY-1, currentMap)) {
            return '14'
        } 
        if(AfterPlanted.checkWalk(fromX-1, fromY-1, currentMap)) {
            return '13'
        }
    }
        
    if(AfterPlanted.checkWalk(fromX, fromY+1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY+1, currentMap)) {
            return '24'
        } 
        if(AfterPlanted.checkWalk(fromX-1, fromY+1, currentMap)) {
            return '23'
        }
    }



    // run 2 step
    if(AfterPlanted.checkWalk(fromX-1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX-2, fromY+1, currentMap)) {
            return '332'
        }
        if(AfterPlanted.checkWalk(fromX-2, fromY-1, currentMap)) {
            return '331'
        }
    }
    if(AfterPlanted.checkWalk(fromX+1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+2, fromY+1, currentMap)) {
            return '442'
        }
        if(AfterPlanted.checkWalk(fromX+2, fromY-1, currentMap)) {
            return '441'
        }
    }

    if(AfterPlanted.checkWalk(fromX, fromY-1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY-2, currentMap)) {
            return '114'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY-2, currentMap)) {
            return '113'
        }
    }

    if(AfterPlanted.checkWalk(fromX, fromY+1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY+2, currentMap)) {
            return '224'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY+2, currentMap)) {
            return '223'
        }
    }

    // run 3 step
    if(AfterPlanted.checkWalk(fromX-1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX-3, fromY+1, currentMap)) {
            return '3332'
        }
        if(AfterPlanted.checkWalk(fromX-3, fromY-1, currentMap)) {
            return '3331'
        }
    }
    if(AfterPlanted.checkWalk(fromX+1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+3, fromY+1, currentMap)) {
            return '4442'
        }
        if(AfterPlanted.checkWalk(fromX+3, fromY-1, currentMap)) {
            return '4441'
        }
    }

    if(AfterPlanted.checkWalk(fromX, fromY-1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY-3, currentMap)) {
            return '1114'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY-3, currentMap)) {
            return '1113'
        }
    }

    if(AfterPlanted.checkWalk(fromX, fromY+1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY+3, currentMap)) {
            return '2224'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY+3, currentMap)) {
            return '2223'
        }
    }


    // run 4 step
    if(AfterPlanted.checkWalk(fromX-1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX-4, fromY+1, currentMap)) {
            return '33332'
        }
        if(AfterPlanted.checkWalk(fromX-4, fromY-1, currentMap)) {
            return '33331'
        }
    }
    if(AfterPlanted.checkWalk(fromX+1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+4, fromY+1, currentMap)) {
            return '44442'
        }
        if(AfterPlanted.checkWalk(fromX+4, fromY-1, currentMap)) {
            return '44441'
        }
    }
    if(AfterPlanted.checkWalk(fromX, fromY-1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY-4, currentMap)) {
            return '11114'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY-4, currentMap)) {
            return '11113'
        }
    }
    if(AfterPlanted.checkWalk(fromX, fromY+1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY+4, currentMap)) {
            return '22224'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY+4, currentMap)) {
            return '22223'
        }
    }

    // run 5 step
    if(AfterPlanted.checkWalk(fromX-1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX-5, fromY+1, currentMap)) {
            return '333332'
        }
        if(AfterPlanted.checkWalk(fromX-5, fromY-1, currentMap)) {
            return '333331'
        }
    }
    if(AfterPlanted.checkWalk(fromX+1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+5, fromY+1, currentMap)) {
            return '444442'
        }
        if(AfterPlanted.checkWalk(fromX+5, fromY-1, currentMap)) {
            return '444441'
        }
    }
    if(AfterPlanted.checkWalk(fromX, fromY-1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY-5, currentMap)) {
            return '111114'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY-5, currentMap)) {
            return '111113'
        }
    }
    if(AfterPlanted.checkWalk(fromX, fromY+1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY+5, currentMap)) {
            return '222224'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY+5, currentMap)) {
            return '222223'
        }
    }

    // run 6 step
    if(AfterPlanted.checkWalk(fromX-1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX-6, fromY+1, currentMap)) {
            return '3333332'
        }
        if(AfterPlanted.checkWalk(fromX-6, fromY-1, currentMap)) {
            return '3333331'
        }
    }
    if(AfterPlanted.checkWalk(fromX+1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+6, fromY+1, currentMap)) {
            return '4444442'
        }
        if(AfterPlanted.checkWalk(fromX+6, fromY-1, currentMap)) {
            return '4444441'
        }
    }
    if(AfterPlanted.checkWalk(fromX, fromY-1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY-6, currentMap)) {
            return '1111114'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY-6, currentMap)) {
            return '1111113'
        }
    }
    if(AfterPlanted.checkWalk(fromX, fromY+1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY+6, currentMap)) {
            return '2222224'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY+6, currentMap)) {
            return '2222223'
        }
    }

    // run 7 step
    if(AfterPlanted.checkWalk(fromX-1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX-7, fromY+1, currentMap)) {
            return '33333332'
        }
        if(AfterPlanted.checkWalk(fromX-7, fromY-1, currentMap)) {
            return '33333331'
        }
    }
    if(AfterPlanted.checkWalk(fromX+1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+7, fromY+1, currentMap)) {
            return '44444442'
        }
        if(AfterPlanted.checkWalk(fromX+7, fromY-1, currentMap)) {
            return '44444441'
        }
    }
    if(AfterPlanted.checkWalk(fromX, fromY-1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY-7, currentMap)) {
            return '11111114'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY-7, currentMap)) {
            return '11111113'
        }
    }
    if(AfterPlanted.checkWalk(fromX, fromY+1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY+7, currentMap)) {
            return '22222224'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY+7, currentMap)) {
            return '22222223'
        }
    }

    // run 8 step
    if(AfterPlanted.checkWalk(fromX-1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX-8, fromY+1, currentMap)) {
            return '333333332'
        }
        if(AfterPlanted.checkWalk(fromX-8, fromY-1, currentMap)) {
            return '333333331'
        }
    }
    if(AfterPlanted.checkWalk(fromX+1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+8, fromY+1, currentMap)) {
            return '444444442'
        }
        if(AfterPlanted.checkWalk(fromX+8, fromY-1, currentMap)) {
            return '444444441'
        }
    }
    if(AfterPlanted.checkWalk(fromX, fromY-1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY-8, currentMap)) {
            return '111111114'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY-8, currentMap)) {
            return '111111113'
        }
    }
    if(AfterPlanted.checkWalk(fromX, fromY+1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY+8, currentMap)) {
            return '222222224'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY+8, currentMap)) {
            return '222222223'
        }
    }

    // run 9 step
    if(AfterPlanted.checkWalk(fromX-1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX-9, fromY+1, currentMap)) {
            return '3333333332'
        }
        if(AfterPlanted.checkWalk(fromX-9, fromY-1, currentMap)) {
            return '3333333331'
        }
    }
    if(AfterPlanted.checkWalk(fromX+1, fromY, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+9, fromY+1, currentMap)) {
            return '4444444442'
        }
        if(AfterPlanted.checkWalk(fromX+9, fromY-1, currentMap)) {
            return '4444444441'
        }
    }
    if(AfterPlanted.checkWalk(fromX, fromY-1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY-9, currentMap)) {
            return '1111111114'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY-9, currentMap)) {
            return '1111111113'
        }
    }
    if(AfterPlanted.checkWalk(fromX, fromY+1, currentMap)) {
        if(AfterPlanted.checkWalk(fromX+1, fromY+9, currentMap)) {
            return '2222222224'
        }
        if(AfterPlanted.checkWalk(fromX-1, fromY+9, currentMap)) {
            return '2222222223'
        }
    }
}