
function Board( BSize, mineCount )
{
	var board = {};
	for( var r = 0; r < BSize; r++ )
	{
		for( var c = 0; c < BSize; c++ )
		{
			board[r + "" + c] = Cell( r, c, false, false, false, 0 );
		}
	}
	board = randomlyAssignMines( board, mineCount );
	board = calculateNeighborMineCounts( board, BSize );
	return board;
}

function Cell( r, c, opened, flagged, mined, neighborMineCount ) 
{
	return {
		id: r + "" + c,
		r: r,
		c: c,	
		opened: opened,
		flagged: flagged,
		mined: mined,
		neighborMineCount: neighborMineCount
	}
}


var initializeCells = function( BSize ) 
{
	var r  = 0;
	var c = 0;
	$( ".c" ).each( function(){
		$(this).attr( "id", r + "" + c ).css('color', 'black').text("");
		$('#' + r + "" + c ).css('background-image', 
										'radial-gradient(#fff,#e6e6e6)');
                                        c++;
		if( c >= BSize )
		{
			c = 0;
			r++;
		}

		$(this).off().click(function(e)
		{
		    handleClick( $(this).attr("id") );
		    var isVictory = true;
			var cells = Object.keys(board);
			for( var i = 0; i < cells.length; i++ )
			{
				if( !board[cells[i]].mined )
				{
					if( !board[cells[i]].opened )
					{
						isVictory = false;
						break;
					}
				}
			}

			if( isVictory )
			{
				gameOver = true;
				$('#Message').text('You Win!').css({'color': ' #a0dae6',
													   'background-color': 'green'});
				clearInterval( timeout );
			}
		});

		$(this).contextmenu(function(e)
		{
		    handleRightClick( $(this).attr("id") );
		    return false;
		});
	})
}

var handleClick = function( id )
{
	if( !gameOver )
	{
		if( ctrlIsPressed )
		{
			handleCtrlClick( id );
		}
		else
		{
			var cell = board[id];
			var $cell = $( '#' + id );
			if( !cell.opened )
			{
				if( !cell.flagged )
				{
					if( cell.mined )
					{
						loss();		
						$cell.html( MINE ).css( 'color', 'red');		
					}
					else
					{
						cell.opened = true;
						if( cell.neighborMineCount > 0 )
						{
							var color = getNumberColor( cell.neighborMineCount );
							$cell.html( cell.neighborMineCount ).css( 'color', color );
						}
						else
						{
							$cell.html( "" )
								 .css( 'background-image', 'radial-gradient(#e6e6e6,#c9c7c7)');
							var neighbors = getNeighbors( id );
							for( var i = 0; i < neighbors.length; i++ )
							{
								var neighbor = neighbors[i];
								if(  typeof board[neighbor] !== 'undefined' &&
									 !board[neighbor].flagged && !board[neighbor].opened )
								{
									handleClick( neighbor );
								}
							}
						}
					}
				}
			}
		}
	}
}

var handleCtrlClick = function( id )
{
	var cell = board[id];
	var $cell = $( '#' + id );
	if( cell.opened && cell.neighborMineCount > 0 )
	{
		var neighbors = getNeighbors( id );
		var flagCount = 0;
		var flaggedCells = [];
		var neighbor;
		for( var i = 0; i < neighbors.length; i++ )
		{
			neighbor = board[neighbors[i]];
			if( neighbor.flagged )
			{
				flaggedCells.push( neighbor );
			}
			flagCount += neighbor.flagged;
		}

		var lost = false;
		if( flagCount === cell.neighborMineCount )
		{
			for( i = 0; i < flaggedCells.length; i++ )
			{
				if( flaggedCells[i].flagged && !flaggedCells[i].mined )
				{
					loss();
					lost = true;
					break;
				}
			}

			if( !lost )
			{
				for( var i = 0; i < neighbors.length; i++ )
				{
					neighbor = board[neighbors[i]];
					if( !neighbor.flagged && !neighbor.opened )
					{
						ctrlIsPressed = false;
						handleClick( neighbor.id );
					}
				}
			}
		}
	}
}

var handleRightClick = function( id )
{
	if( !gameOver )
	{
		var cell = board[id];
		var $cell = $( '#' + id );
		if( !cell.opened )
		{
			if( !cell.flagged && minesRemaining > 0 )
			{
				cell.flagged = true;
				$cell.html( FLAG ).css( 'color', 'red');
				minesRemaining--;
			}
			else if( cell.flagged )
			{
				cell.flagged = false;
				$cell.html( "" ).css( 'color', 'black');
				minesRemaining++;
			}

			$( '#mines-remaining').text( minesRemaining );
		}
	}
}

var loss = function()
{
	gameOver = true;
	$('#Message').text('Game Over!')
					.css({'color':' #a0dae6', 
						  'background-color': 'red'});
	var cells = Object.keys(board);
	for( var i = 0; i < cells.length; i++ )
	{
		if( board[cells[i]].mined && !board[cells[i]].flagged )
		{
			$('#' + board[cells[i]].id ).html( MINE )
										.css('color', 'black');
		}
	}
	clearInterval(timeout);
}

var randomlyAssignMines = function( board, mineCount )
{
	var mineCooridinates = [];
	for( var i = 0; i < mineCount; i++ )
	{
		var randomRowCoordinate = getRandomInteger( 0, BSize );
		var randomColumnCoordinate = getRandomInteger( 0, BSize );
		var cell = randomRowCoordinate + "" + randomColumnCoordinate;
		while( mineCooridinates.includes( cell ) )
		{
			randomRowCoordinate = getRandomInteger( 0, BSize );
			randomColumnCoordinate = getRandomInteger( 0, BSize );
			cell = randomRowCoordinate + "" + randomColumnCoordinate;
		}
		mineCooridinates.push( cell );
		board[cell].mined = true;
	}
	return board;
}

var calculateNeighborMineCounts = function( board, BSize )
{
	var cell;
	var neighborMineCount = 0;
	for( var r = 0; r < BSize; r++ )
	{
		for( var c = 0; c < BSize; c++ )
		{
			var id = r + "" + c;
			cell = board[id];
			if( !cell.mined )
			{
				var neighbors = getNeighbors( id );
				neighborMineCount = 0;
				for( var i = 0; i < neighbors.length; i++ )
				{
					neighborMineCount += isMined( board, neighbors[i] );
				}
				cell.neighborMineCount = neighborMineCount;
			}
		}
	}
	return board;
}

var getNeighbors = function( id )
{
	var r = parseInt(id[0]);
	var c = parseInt(id[1]);
	var neighbors = [];
	neighbors.push( (r - 1) + "" + (c - 1) );
	neighbors.push( (r - 1) + "" + c );
	neighbors.push( (r - 1) + "" + (c + 1) );
	neighbors.push( r + "" + (c - 1) );
	neighbors.push( r + "" + (c + 1) );
	neighbors.push( (r + 1) + "" + (c - 1) );
	neighbors.push( (r + 1) + "" + c );
	neighbors.push( (r + 1) + "" + (c + 1) );

	for( var i = 0; i < neighbors.length; i++)
	{ 
	   if ( neighbors[i].length > 2 ) 
	   {
	      neighbors.splice(i, 1); 
	      i--;
	   }
	}

	return neighbors
}

var getNumberColor = function( number )
{
	var color = 'black';        
	if( number === 1 )
	{
		color = 'blue';
	}
	else if( number === 2 )
	{
		color = 'green';
	}
	else if( number === 3 )
	{
		color = 'red';
	}
	else if( number === 4 )
	{
		color = 'orange';
	}
	return color;
}

var isMined = function( board, id )
{	
	var cell = board[id];
	var mined = 0;
	if( typeof cell !== 'undefined' )
	{
		mined = cell.mined ? 1 : 0;
	}
	return mined;
}

var getRandomInteger = function( min, max )
{
	return Math.floor( Math.random() * ( max - min ) ) + min;
}

var newGame = function( BSize, mines )
{
	$('#time').text("0");
	$('#Message').text('Make a Move!')
					.css({'color': ' #a0dae6', 
						  'background-color': '#0d2344'});
	minesRemaining = mines;
	$( '#mines').text( minesRemaining );
	gameOver = false;
	initializeCells( BSize );
	board = Board( BSize, mines );
	timer = 0;
	clearInterval(timeout);
	timeout = setInterval(function () {
    // This will be executed after 1,000 milliseconds
    timer++;
    if( timer >= 999 )
    {
    	timer = 999;
    }
    $('#time').text(timer);
	}, 1000);

	return board;
}

var FLAG = "&#9873;";
var MINE = "&#9881;";
var BSize = 10;
var mines = 10;
var timer = 0;
var timeout;
var minesRemaining;

$(document).keydown(function(event){
    if(event.ctrlKey)
        ctrlIsPressed = true;
});

$(document).keyup(function(){
    ctrlIsPressed = false;
});

var ctrlIsPressed = false;
var board = newGame( BSize, mines );

$('#new-game-button').click( function(){
	board = newGame( BSize, mines );
})