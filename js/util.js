
function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderBoard(board, selector) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell;
            var cellClass;
            var color;
            var minesAround = board[i][j].minesAroundCount;
            if (minesAround === 1) color = ONE;
            if (minesAround === 2) color = TWO;
            if (minesAround === 3) color = THREE;
            if (minesAround === 4) color = FOUR;
            if (minesAround === 5) color = FIVE;
            if (minesAround === 6) color = SIX;
            if (minesAround === 7) color = SEVEN;
            if (minesAround === 8) color = EIGHT;
            if (board[i][j].isMine) {
                cell = EMPTY;
                cellClass = '';
            } else if (!board[i][j].isShown) {
                cell = EMPTY
                cellClass = '';
            } else {
                if (minesAround > 0) {
                    cell = minesAround;
                    cellClass = 'revealed';
                }
                if (minesAround === 0) {
                    cell = EMPTY;
                    cellClass = 'revealed';
                }
            }
            if (!gManuelMode) {
                if (board[i][j].isMine && board[i][j].isShown) {
                    cell = MINE_IMAGE;
                    cellClass = 'revealed';
                }
            }
            var cellId = `cell-${i}-${j}`;
            strHTML += `<td id="${cellId}" 
                            class="cell ${cellClass}" 
                            onclick="cellClicked(this)"
                            style="color:${color};">
                            ${cell}
                            </td>`;
        }
        strHTML += '</tr>'
    }
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function renderCell(location, value) {
    var elCell = document.querySelector(`#cell-${location.i}-${location.j}`);
    elCell.innerHTML = value;
}

function getCellCoord(strCellId) {
    var parts = strCellId.split('-')
    var coord = { i: +parts[1], j: +parts[2] };
    return coord;
}

function getEmptyVals() {
    var empties = [];
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var cell = gBoard[i][j];
            // if (cell.isFirst === true) continue;
            if (cell.isShown === true) continue;
            if (cell.isMine === true) continue;
            // if (cell.minesAroundCount > 0) continue; 
            empties.push({ i: i, j: j });
        }
    }
    return empties;
}

function copyMat(mat) {
    var newMat = [];
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = [];
        for (var j = 0; j < mat[0].length; j++) {
            var cell = mat[i][j];
            newMat[i][j] = {
                minesAroundCount: cell.minesAroundCount,
                isFirst: cell.isFirst,
                isShown: cell.isShown,
                isMine: cell.isMine,
                isMarked: cell.isMarked
            }
        }
    }
    return newMat;
}

function renderBoardReversed(board, prevBoard) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            board[i][j] = prevBoard[i][j];
            var cell;
            var cellClass;
            var color;
            var minesAround = board[i][j].minesAroundCount;
            if (minesAround === 1) color = ONE;
            if (minesAround === 2) color = TWO;
            if (minesAround === 3) color = THREE;
            if (minesAround === 4) color = FOUR;
            if (minesAround === 5) color = FIVE;
            if (minesAround === 6) color = SIX;
            if (minesAround === 7) color = SEVEN;
            if (minesAround === 8) color = EIGHT;
            if (board[i][j].isMine) {
                cell = EMPTY;
                cellClass = '';
            } else if (!board[i][j].isShown) {
                cell = EMPTY
                cellClass = '';
            } else {
                var minesAround = board[i][j].minesAroundCount
                if (minesAround > 0) {
                    cell = minesAround;
                    cellClass = 'revealed';
                }
                if (minesAround === 0) {
                    cell = EMPTY;
                    cellClass = 'revealed';
                }
            }
            if (!gManuelMode) {
                if (board[i][j].isMine && board[i][j].isShown) {
                    cell = MINE_IMAGE;
                    cellClass = 'revealed';
                }
            }
            var cellId = `cell-${i}-${j}`;
            strHTML += `<td id="${cellId}" 
                            class="cell ${cellClass}" 
                            onclick="cellClicked(this)"
                            style="color:${color};">
                            ${cell}
                            </td>`;
        }
        strHTML += '</tr>'
    }
    var elContainer = document.querySelector('.board');
    elContainer.innerHTML = strHTML;
}
