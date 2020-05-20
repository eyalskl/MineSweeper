
function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderBoard(board, selector) {
    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            if (!board[i][j].isShown) cell = '';
            else {
                var isMine = board[i][j].isMine;
                var minesAround = board[i][j].minesAroundCount;
                var cell = (isMine) ? MINE_IMAGE : (minesAround > 0) ? minesAround : EMPTY;
            }
            var cellId = `cell-${i}-${j}`;
            strHTML += `<td id="${cellId}" class="cell" onclick="cellClicked(this)">${cell}</td>`;
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

