const MINE = '*';
const FLAG = '🚩';
const EMPTY = '';
const NORMAL = '😃';
const WIN = '😎';
const LOSE = '😭';
const ONCLICK = '😮';

const MINE_IMAGE = `<img class="mine" src="imgs/mine.jpg" />`
const EXPLODED_IMAGE = `<img class="exploded" src="imgs/exploded.png" />`

var gElSmiley = document.querySelector('.smiley button');
var gElSafeBtn = document.querySelector('.safe-btn');
var gSafeClicks;
var gLifes;
var gHundredsInterval;
var gTensInterval;
var gOnesInterval;
var gBoard;
var gLevel = {
    size: 4,
    mines: 2
};
var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
};

function initGame() {
    stopTimer();
    resetSafeBtnAndLifes();
    gBoard = createBoard();
    generateRandMines(gLevel.mines);
    setMinesNegsCount();
    renderBoard(gBoard, '.board');
    gGame.isOn = true;
    gElSmiley.innerText = NORMAL;
}


function createBoard() {
    var board = [];
    for (let i = 0; i < gLevel.size; i++) {
        board[i] = [];
        for (let j = 0; j < gLevel.size; j++) {
            var cell = {
                minesAroundCount: 0, isShown: false,
                isMine: false, isMarked: false
            };
            board[i][j] = cell;
        }
    }
    return board;
}

function checkGameOver() {
    var minesCheckedCount = 0;
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard.length; j++) {
            currCell = gBoard[i][j];
            if (!currCell.isMine) if (!currCell.isShown) return false;
            if (currCell.isMine && currCell.isMarked) minesCheckedCount++;
        }
    }
    return minesCheckedCount === gLevel.mines;
}

function gameOver(location) {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard.length; j++) {
            currCell = gBoard[i][j];
            if (currCell.isMine) {
                currCell.isShown = true;
                renderCell({ i: i, j: j }, MINE_IMAGE)
            }
        }
    }
    renderCell(location, EXPLODED_IMAGE)
}

function cellClicked(elCell) {
    if (!gGame.isOn) return;
    var cellCoord = getCellCoord(elCell.id);
    var currCell = gBoard[cellCoord.i][cellCoord.j];
    if (checkIsFirstClick()) {
        startTimer();
        if (currCell.isMine) {
            currCell.isMine = false;
            expandShown(gBoard, elCell, cellCoord.i, cellCoord.j)
            generateRandMines(1);
            setMinesNegsCount();
            renderBoard(gBoard, '.board');
            return;
        }
    }
    if (currCell.isMarked) return;
    if (currCell.isMine) {
        elCell.classList.add('mine-clicked');
        setTimeout(function () { elCell.classList.remove('mine-clicked') }, 300)
        new Audio('sound/lifedown2.mp3').play()
        var elLifes = document.querySelectorAll('.lifes span');
        if (gLifes > 1) {
            gLifes--;
            elLifes[gLifes].style.visibility = 'hidden';
            return;
        }
        elLifes[0].style.visibility = 'hidden';
        gElSmiley.innerText = LOSE;
        gElSafeBtn.disabled = true;
        gGame.isOn = false;
        stopTimer();
        gameOver(cellCoord);
        return;
    }
    if (currCell.minesAroundCount > 0) {
        currCell.isShown = true;
        elCell.classList.add('revealed');
        value = currCell.minesAroundCount;
        renderCell(cellCoord, value);
    } else if (currCell.minesAroundCount === 0) expandShown(gBoard, elCell, cellCoord.i, cellCoord.j)
    if (checkGameOver()) {
        gElSmiley.innerText = WIN;
        gElSafeBtn.disabled = true;
        stopTimer();
        gGame.isOn = false;
        return;
    }
}

function cellMarked(elCell) {
    if (!gGame.isOn) return;
    var cellCoord = getCellCoord(elCell.id);
    var currCell = gBoard[cellCoord.i][cellCoord.j]
    if (currCell.isShown) return
    if (!currCell.isMarked) {
        currCell.isMarked = true;
        renderCell(cellCoord, FLAG);
    } else {
        currCell.isMarked = false;
        renderCell(cellCoord, EMPTY);
    }
    if (checkGameOver()) {
        console.log('Game over');
        stopTimer();
        gGame.isOn = false;
        return;
    }
}

function handlePress(mouseEvent) {
    resetDafultBehavior()
    // DOM
    var elCell = mouseEvent.path[0];
    if (!elCell.id) return;
    switch (mouseEvent.button) {
        // case 0:
        //     // gElSmiley.innerText = ONCLICK;
        //     // setTimeout(function () {gElSmiley.innerText = NORMAL}, 200);
        //     break;
        case 1:
            console.log(`im a middle click`);
            break;
        case 2:
            cellMarked(elCell);
            break;
    }
}

function expandShown(board, elCell, cellI, cellJ) {
    board[cellI][cellJ].isShown = true;
    elCell.classList.add('revealed');
    var cellCoord = getCellCoord(elCell.id);
    renderCell(cellCoord, EMPTY);
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            if (i === cellI && j === cellJ) continue;
            // model
            var currCell = board[i][j];
            // DOM
            var elCurrCell = getElementById({ i: i, j: j });
            var nextCellCoord = getCellCoord(elCurrCell.id);
            if (currCell.isShown) continue;
            if (currCell.isMarked) continue;
            if (currCell.minesAroundCount > 0) {
                currCell.isShown = true;
                elCurrCell.classList.add('revealed');
                renderCell(nextCellCoord, currCell.minesAroundCount);
                continue;
            }
            if (currCell.isMine) continue;
            if (currCell.minesAroundCount === 0) expandShown(board, elCurrCell, i, j);
        }
    }
}

function countMinesNegs(cellI, cellJ, board) {
    var negsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (board[i][j].isMine) negsCount++;
        }
    }
    return negsCount;
}
// Uses the function countNegs to count how many mines are around the cell
// and sets the minesAroundCount of that cell
function setMinesNegsCount() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            if (cell.isMine) continue;
            cell.minesAroundCount = countMinesNegs(i, j, gBoard);
        }
    }
}

function generateRandMines(minesAmount) {
    for (let i = 0; i < minesAmount; i++) {
        var iRandIdx = getRandomIntInclusive(0, gLevel.size - 1);
        var jRandIdx = getRandomIntInclusive(0, gLevel.size - 1);
        if (gBoard[iRandIdx][jRandIdx].isMine) generateRandMines(1);
        else gBoard[iRandIdx][jRandIdx].isMine = true;
    }
}

function resetDafultBehavior() {
    if (document.addEventListener) {
        document.addEventListener('contextmenu', function (e) {
            e.preventDefault();
        }, false);
    } else {
        document.attachEvent('oncontextmenu', function () {
            window.event.returnValue = false;
        });
    }
}

function startTimer() {
    var elHunds = document.querySelector('.hundreds');
    var elTens = document.querySelector('.tens');
    var elOnes = document.querySelector('.ones');
    var hundsCount = 1;
    gHundredsInterval = setInterval(function () {
        if (hundsCount > 9) hundsCount = 0;
        elHunds.innerText = hundsCount++;
    }, 100000);
    var tensCount = 1;
    gTensInterval = setInterval(function () {
        if (tensCount > 9) tensCount = 0;
        elTens.innerText = tensCount++;
    }, 10000);
    var onesCount = 1;
    gOnesInterval = setInterval(function () {
        if (onesCount > 9) onesCount = 0;
        elOnes.innerText = onesCount++;
    }, 1000);
}

function resetTime() {
    document.querySelector('.hundreds').innerText = 0;
    document.querySelector('.tens').innerText = 0;
    document.querySelector('.ones').innerText = 0;
}

function stopTimer() {
    if (gHundredsInterval) clearInterval(gHundredsInterval);
    if (gTensInterval) clearInterval(gTensInterval);
    if (gOnesInterval) clearInterval(gOnesInterval);
    resetTime()
}

function checkIsFirstClick() {
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            currCell = gBoard[i][j];
            if (currCell.isShown) return false;
        }
    }
    return true;
}

function setMode(elBtn, boardSize, minesAmount) {
    resetTime();
    gLevel.size = boardSize;
    gLevel.mines = minesAmount;
    var elEasyBtn = document.querySelector('.easy');
    var elMedBtn = document.querySelector('.medium');
    var elHardBtn = document.querySelector('.hard');

    console.log(elBtn.className);
    switch (elBtn.className) {
        case 'easy':
            switchBtnClasses(elEasyBtn, elHardBtn, elMedBtn);
            break;
        case 'medium':
            switchBtnClasses(elMedBtn, elEasyBtn, elHardBtn);
            break;
        case 'hard':
            switchBtnClasses(elHardBtn, elEasyBtn, elMedBtn);
    }
    initGame();
}


function switchBtnClasses(btnToAdd, btnToRemove1, btnToRemove2) {
    btnToAdd.classList.add('mode');
    btnToRemove1.classList.remove('mode');
    btnToRemove2.classList.remove('mode');
}

function getElementById(location) {
    var id = `#cell-${location.i}-${location.j}`;
    return document.querySelector(`${id}`);
}

function revealSafe(elBtn) {
    gSafeClicks--;
    elBtn.innerText = `Safe Clicks(${gSafeClicks})`;
    markSafePlace();
    if (gSafeClicks === 0) {
        elBtn.classList.add('disable-btn');
        elBtn.disabled = true;
        return;
    }
}

function markSafePlace() {
    var iRandIdx = getRandomIntInclusive(0, gLevel.size - 1);
    var jRandIdx = getRandomIntInclusive(0, gLevel.size - 1);
    if (gBoard[iRandIdx][jRandIdx].isMine || gBoard[iRandIdx][jRandIdx].isShown) markSafePlace();
    else {
        var elCell = getElementById({ i: iRandIdx, j: jRandIdx });
        if (elCell.classList.contains('safe')) markSafePlace()
        elCell.classList.add('safe');
    }
}

function resetSafeBtnAndLifes() {
    gSafeClicks = 3;
    gLifes = 3;
    gElSafeBtn.innerText = `Safe Clicks(${gSafeClicks})`;
    gElSafeBtn.disabled = '';
    gElSafeBtn.classList.remove('disable-btn');
    var elLifes = document.querySelectorAll('.lifes span');
    for (let i = 0; i < elLifes.length; i++) {
        elLifes[i].style.visibility = '';        
    }
}
