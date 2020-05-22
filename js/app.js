// const MINE = '*';
const FLAG = '🚩';
const EMPTY = '';
const NORMAL = '😃';
const WIN = '😎';
const LOSE = '😭';
const ONCLICK = '😮';
const ONE = '#0000fd';
const TWO = '#017e00';
const THREE = '#fd0000';
const FOUR = '#000180';
const FIVE = '#7f0300';
const SIX = '#008080';
const SEVEN = '#000000';
const EIGHT = '#808080';

const MINE_IMAGE = `<img class="mine" src="imgs/mine.jpg" />`
const EXPLODED_IMAGE = `<img class="exploded" src="imgs/exploded.png" />`

var gHighEasy;
var gHighMed;
var gHighHard;
var gElSmiley = document.querySelector('.smiley button');
var gElSafeBtn = document.querySelector('.safe-btn');
var gSafeClicks;
var gLifes;
var gHintMode;
var gManuelMode;
var gHighScoreInterval;
var gHundredsInterval;
var gTensInterval;
var gOnesInterval;
var gPrevMoves;
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
    resetTime()
    resetFeatures();
    saveHighScores();
    gBoard = createBoard();
    generateRandMines(gLevel.mines);
    renderBoard(gBoard, '.board');
    gPrevMoves = [copyMat(gBoard)];
    gGame.isOn = true;
    gHintMode = false;
}


function createBoard() {
    var board = [];
    for (var i = 0; i < gLevel.size; i++) {
        board[i] = [];
        for (var j = 0; j < gLevel.size; j++) {
            var cell = {
                minesAroundCount: 0, isFirst: false, isShown: false,
                isMine: false, isMarked: false
            };
            board[i][j] = cell;
        }
    }
    return board;
}

function checkGameWon() {
    var minesCheckedCount = 0;
    var minesCount = 0
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard.length; j++) {
            currCell = gBoard[i][j];
            if (currCell.isMine) minesCount++;
            if (currCell.isMine && currCell.isMarked) minesCheckedCount++;
            if (!currCell.isMine && !currCell.isShown) return false;
        }
    }
    if (minesCheckedCount === minesCount) {
        gGame.isOn = false;
        stopTimer();
        setHighScore(gGame.secsPassed);
        setTimeout(() => {
            gElSmiley.innerHTML = WIN;
        }, 101);
        gElSafeBtn.disabled = true;
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
    setTimeout(() => {
        gElSmiley.innerHTML = LOSE;
    }, 101);
}

function cellClicked(elCell) {
    if (!gGame.isOn) return;
    if (checkGameWon()) return;
    if (gManuelMode) {
        setMinesByUser(elCell);
        return
    }
    var cellCoord = getCellCoord(elCell.id);
    var currCell = gBoard[cellCoord.i][cellCoord.j];
    if (currCell.isMarked) return;
    if (gHintMode) {
        revealNegs(cellCoord);
        return;
    }
    if (checkIsFirstClick()) {
        startTimer();
        currCell.isShown = true;
        if (currCell.isMine) {
            currCell.isMine = false;
            renderCell(cellCoord, EMPTY);
            generateRandMines(1);
        }
    }
    if (currCell.isMine) {
        elCell.classList.add('mine-clicked');
        setTimeout(function () { elCell.classList.remove('mine-clicked') }, 300)
        new Audio('sound/lifedown.mp3').play()
        var elLifes = document.querySelectorAll('.lifes span');
        if (gLifes > 1) {
            gLifes--;
            elLifes[gLifes].style.visibility = 'hidden';
            return;
        }
        elLifes[0].style.visibility = 'hidden';
        gElSafeBtn.disabled = true;
        gGame.isOn = false;
        stopTimer();
        gameOver(cellCoord);
        return;
    }
    if (currCell.minesAroundCount > 0) {
        currCell.isShown = true;
        elCell.classList.add('revealed');
        setCellNumberColor(currCell, elCell);
        renderCell(cellCoord, currCell.minesAroundCount);
        gPrevMoves.push(copyMat(gBoard));

    }
    if (currCell.minesAroundCount === 0) {
        expandShown(gBoard, elCell, cellCoord.i, cellCoord.j);
        gPrevMoves.push(copyMat(gBoard));
    }
    if (checkGameWon()) return;
}

function cellMarked(elCell) {
    if (!gGame.isOn) return;
    if (gManuelMode) return
    var cellCoord = getCellCoord(elCell.id);
    var currCell = gBoard[cellCoord.i][cellCoord.j]
    if (currCell.isShown && currCell.isMine) {
        currCell.isMarked = true;
        renderCell(cellCoord, FLAG);
        if (checkGameWon()) return;
    }
    if (currCell.isShown) return
    if (!currCell.isMarked) {
        currCell.isMarked = true;
        renderCell(cellCoord, FLAG);
    } else {
        currCell.isMarked = false;
        renderCell(cellCoord, EMPTY);
    }
    gPrevMoves.push(copyMat(gBoard));
    if (checkGameWon()) return;
}

function handlePress(mouseEvent) {
    resetDafultBehavior();
    var elCell = mouseEvent.path[0];
    if (!elCell.id) return;
    switch (mouseEvent.button) {
        case 0:
            if (gGame.isOn) {
                gElSmiley.innerHTML = ONCLICK;
                setTimeout(function () { gElSmiley.innerHTML = NORMAL }, 100);
            }
            break;
        case 1:
            console.log(`im a middle click`);
            break;
        case 2:
            // cellMarked(elCell);
            break;
    }
}

function expandShown(board, elCell, cellI, cellJ) {
    board[cellI][cellJ].isShown = true;
    elCell.classList.add('revealed');
    setCellNumberColor(board[cellI][cellJ], elCell);
    var cellCoord = getCellCoord(elCell.id);
    renderCell(cellCoord, EMPTY);
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board.length) continue;
            if (i === cellI && j === cellJ) continue;
            var currCell = board[i][j];
            var elCurrCell = getElById({ i: i, j: j });
            var nextCellCoord = getCellCoord(elCurrCell.id);
            if (currCell.isShown) continue;
            if (currCell.isMarked) continue;
            if (currCell.isMine) continue;
            if (currCell.minesAroundCount > 0) {
                currCell.isShown = true;
                elCurrCell.classList.add('revealed');
                setCellNumberColor(currCell, elCurrCell);
                renderCell(nextCellCoord, currCell.minesAroundCount);
                continue;
            }
            if (currCell.minesAroundCount === 0) expandShown(board, elCurrCell, i, j);
        }
    }
}

function countMinesNegs(cellI, cellJ) {
    var negsCount = 0;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (i === cellI && j === cellJ) continue;
            if (gBoard[i][j].isMine) negsCount++;
        }
    }
    return negsCount;
}

function setMinesNegsCount() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            if (cell.isMine) continue;
            cell.minesAroundCount = countMinesNegs(i, j);
        }
    }
}

function generateRandMines(minesAmount) {
    for (let i = 0; i < minesAmount; i++) {
        var nonMines = getEmptyVals();
        var randPos = nonMines[getRandomIntInclusive(0, nonMines.length - 1)];
        gBoard[randPos.i][randPos.j].isMine = true;
    }
    setMinesNegsCount();
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
    stopTimer();
    var elHunds = document.querySelector('.hundreds');
    var elTens = document.querySelector('.tens');
    var elOnes = document.querySelector('.ones');
    gGame.secsPassed = 0;
    gHighScoreInterval = setInterval(function () {
        gGame.secsPassed++;
    }, 1000);
    var onesCount = 1;
    gOnesInterval = setInterval(function () {
        if (onesCount > 9) onesCount = 0;
        elOnes.innerText = onesCount++;
    }, 1000);
    var tensCount = 1;
    gTensInterval = setInterval(function () {
        if (tensCount > 9) tensCount = 0;
        elTens.innerText = tensCount++;
    }, 10000);
    var hundsCount = 1;
    gHundredsInterval = setInterval(function () {
        if (hundsCount > 9) hundsCount = 0;
        elHunds.innerText = hundsCount++;
    }, 100000);
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
    if (gHighScoreInterval) clearInterval(gHighScoreInterval);
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
    gLevel.size = boardSize;
    gLevel.mines = minesAmount;
    var elEasyBtn = document.querySelector('.easy');
    var elMedBtn = document.querySelector('.medium');
    var elHardBtn = document.querySelector('.hard');
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

function getElById(location) {
    var id = `#cell-${location.i}-${location.j}`;
    return document.querySelector(`${id}`);
}

function revealSafe(elBtn) {
    if (gManuelMode) return
    if (gSafeClicks === 1) {
        gSafeClicks--;
        elBtn.innerText = `Safe Clicks(${gSafeClicks})`;
        markSafePlace();
        elBtn.classList.add('disable-btn');
        elBtn.disabled = true;
        return;
    }
    gSafeClicks--;
    elBtn.innerText = `Safe Clicks(${gSafeClicks})`;
    markSafePlace();
}

function markSafePlace() {
    var safePlaces = getEmptyVals();
    if (safePlaces.length < 1) {
        gElSafeBtn.disabled = true;
        elBtn.classList.add('disable-btn');
        return;
    }
    var randPos = safePlaces[getRandomIntInclusive(0, safePlaces.length - 1)];
    var elCell = getElById({ i: randPos.i, j: randPos.j })
    if (elCell.classList.contains('safe')) markSafePlace()
    elCell.classList.add('safe');
    setTimeout(function () { elCell.classList.remove('safe') }, 1500);
}

function resetFeatures() {
    gSafeClicks = 3;
    gLifes = 3;
    gElSmiley.innerText = NORMAL;
    gElSmiley.classList.add('rotate-me');
    setTimeout(function () { gElSmiley.classList.remove('rotate-me'); }, 500)
    gElSafeBtn.innerText = `Safe Clicks(${gSafeClicks})`;
    gElSafeBtn.disabled = '';
    gElSafeBtn.classList.remove('disable-btn');
    var elLifes = document.querySelectorAll('.lifes span');
    for (let i = 0; i < elLifes.length; i++) {
        elLifes[i].style.visibility = '';
    }
    var elHints = document.querySelectorAll('.hints span');
    for (let i = 0; i < elHints.length; i++) {
        elHints[i].classList.remove('hint-clicked');
    }
}

function setHintModeOn(elHint) {
    if (elHint.classList.contains('hint-clicked')) return;
    elHint.classList.add('hint-clicked');
    gHintMode = true;
}

function revealNegs(location) {
    var cellsToReveal = [];
    var cellI = location.i;
    var cellJ = location.j;
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            var elCurrCell = getElById({ i: i, j: j });
            if (gBoard[i][j].isShown) continue;
            gBoard[i][j].isShown = true
            elCurrCell.classList.add('revealed');
            cellsToReveal.push({ cell: elCurrCell, i: i, j: j })
        }
    }
    renderBoard(gBoard, '.board');
    gHintMode = false;
    setTimeout(function () {
        for (var i = 0; i < cellsToReveal.length; i++) {
            var currCell = cellsToReveal[i].cell;
            var iPos = cellsToReveal[i].i;
            var jPos = cellsToReveal[i].j;
            gBoard[iPos][jPos].isShown = false;
            currCell.classList.remove('revealed')
        }
        renderBoard(gBoard, '.board');
    }, 500);
}

function undo() {
    if (gPrevMoves.length < 1) {
        initGame()
        return;
    }
    if (checkGameWon) {
        gGame.isOn = true;
        gElSmiley.innerHTML = NORMAL;
        gElSafeBtn.disabled = '';
    }
    var prevBoard = gPrevMoves.splice(gPrevMoves.length - 2)[0];
    renderBoardReversed(gBoard, prevBoard);
}

function showHighScores() {
    var elHighScoresUl = document.querySelector('.highscores');
    elHighScoresUl.classList.toggle('fade');
    if (elHighScoresUl.classList.contains('fade')) document.querySelector('.hs').innerText = 'Hide High Scores!';
    else document.querySelector('.hs').innerText = 'Show High Scores!';
}

function setHighScore(highScore) {
    var elEasyHigh = document.getElementById('highEasy');
    var elMedHigh = document.getElementById('highMed');
    var elHardHigh = document.getElementById('highHard');

    switch (gLevel.mines) {
        case 2:
            if (highScore < +elEasyHigh.innerText) {
                console.log('gothere');

                localStorage.easy = highScore;
                elEasyHigh.innerText = localStorage.easy;
            }
            break;
        case 4:
            if (highScore < +elMedHigh.innerText) {
                localStorage.med = highScore;
                elMedHigh.innerText = localStorage.med;
            }
            break;
        case 30:
            if (highScore < +elHardHigh.innerText) {
                localStorage.hard = highScore;
                elHardHigh.innerText = localStorage.hard;
            }
            break;
    }
}

function saveHighScores() {
    var elEasyHigh = document.getElementById('highEasy');
    var elMedHigh = document.getElementById('highMed');
    var elHardHigh = document.getElementById('highHard');
    if (localStorage.easy) elEasyHigh.innerText = localStorage.easy;
    if (localStorage.med) elMedHigh.innerText = localStorage.med;
    if (localStorage.hard) elHardHigh.innerText = localStorage.hard;
}

function resetHighScores(elBtn) {
    elBtn.classList.add('wipe-scores');
    setTimeout(() => {
        elBtn.classList.remove('wipe-scores');
    }, 1000);
    localStorage.removeItem('easy');
    localStorage.removeItem('med');
    localStorage.removeItem('hard');
    var elEasyHigh = document.getElementById('highEasy');
    var elMedHigh = document.getElementById('highMed');
    var elHardHigh = document.getElementById('highHard');
    setTimeout(() => {
        elEasyHigh.innerText = 999;
        elMedHigh.innerText = 999;
        elHardHigh.innerText = 999;
    }, 250);
}

function setManuelMode(elBtn) {
    elBtn.classList.toggle('mode2');
    if (elBtn.classList.contains('mode2')) {
        elBtn.innerText = 'Set & Press Me'
        document.querySelector('.hints').style.visibility = 'hidden';
        gManuelMode = true;
        initGame();
    } else {
        setMinesNegsCount();
        renderBoard(gBoard, '.board');
        gManuelMode = false;
        elBtn.innerText = 'Manually Create'
        document.querySelector('.hints').style.visibility = '';
    }
}

function setMinesByUser(elCell) {
    if (checkIsFirstClick()) {
        gBoard = createBoard();
        renderBoard(gBoard, '.board');
    }
    var cellCoord = getCellCoord(elCell.id);
    var currCell = gBoard[cellCoord.i][cellCoord.j];
    if (currCell.isMine) {
        currCell.isShown = false;
        currCell.isMine = false;
        renderCell(cellCoord, EMPTY);
    } else {
        currCell.isShown = true;
        currCell.isMine = true;
        renderCell(cellCoord, MINE_IMAGE);
    }
}

function setCellNumberColor(model, elCell) {
    if (model.minesAroundCount === 1) elCell.classList.add('ONE');
    if (model.minesAroundCount === 2) elCell.classList.add('TWO');
    if (model.minesAroundCount === 3) elCell.classList.add('THREE');
    if (model.minesAroundCount === 4) elCell.classList.add('FORE');
    if (model.minesAroundCount === 5) elCell.classList.add('FIVE');
    if (model.minesAroundCount === 6) elCell.classList.add('SIX');
    if (model.minesAroundCount === 7) elCell.classList.add('SEVEN');
    if (model.minesAroundCount === 8) elCell.classList.add('EIGHT');
}