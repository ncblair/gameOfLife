//some of this code is inspired by http://disruptive-communications.com/conwaylifejavascript/


$(document).ready(function(){
	//check connection to javascript
    console.log("connected");
    
    
    //declare variables
    var $c = $("#game-field");
	var $ctx = $c[0].getContext("2d");
    var fillsize = 3;//amount of pixels per block on canvas
	var gridHeight = Math.round($c.height()/fillsize);//amount of cells in the grid (height)
	var gridWidth = Math.round($c.width()/fillsize);//amount of cells in the grid (width)
    var $cHeight = $c.height();
    var $cWidth = $c.width();
    var Xpos;
    var Ypos;//position on GRID
    var Xstart = 45;
    var Ystart = 75;
    var moving;
    var $score = $(".score");
    var xFinishMinStart = 145;
    var xFinishMaxStart = 155;
    var yFinishMinStart = 70;
    var yFinishMaxStart = 80;
    var xFinishMin;
    var xFinishMax;
    var yFinishMin;
    var yFinishMax;//position on GRID
    
	var theGrid = createArray(gridWidth);
	var mirrorGrid = createArray(gridWidth);
	$ctx.fillStyle = "red";
	var count = 0;
	var $starting_message = $(".starting-message");
    var $death_message = $(".death-message");
    
    
    
    //prepare new game
    startOver();
    
    
    //on spacebar, start main loop
    $('body').keyup(function(e){
        if (!moving){
            if(e.keyCode == 32){
                // user has pressed space
                $starting_message.css("opacity","0");
                $death_message.css("opacity", "0");
                moving = true;
                tick(); //call main loop
            }
        }
        
    });
    
    
    //override keydown repeat delay
    //taken from stackoverflow https://stackoverflow.com/questions/11355595/is-it-possible-to-override-the-keydown-repeat-delay-in-javascript
    function DeltaTimer(render, interval) {
        var timeout;
        var lastTime;

        this.start = start;
        this.stop = stop;

        function start() {
            timeout = setTimeout(loop, 0);
            lastTime = Date.now();
            return lastTime;
        }

        function stop() {
            clearTimeout(timeout);
            return lastTime;
        }

        function loop() {
            var thisTime = Date.now();
            var deltaTime = thisTime - lastTime;
            var delay = Math.max(interval - deltaTime, 0);
            timeout = setTimeout(loop, delay);
            lastTime = thisTime + delay;
            render(thisTime);
        }
    }
    
    (function (interval) {
        var keyboard = {};

        window.addEventListener("keyup", keyup, false);
        window.addEventListener("keydown", keydown, false);

        function keyup(event) {
            keyboard[event.keyCode].pressed = false;
        }

        function keydown(event) {
            var keyCode = event.keyCode;
            var key = keyboard[keyCode];

            if (key) {
                if (!key.start)
                    key.start = key.timer.start();
                key.pressed = true;
            } else {
                var timer = new DeltaTimer(function (time) {
                    if (key.pressed) {
                        var event = document.createEvent("Event");
                        event.initEvent("keypressed", true, true);
                        event.time = time - key.start;
                        event.keyCode = keyCode;
                        window.dispatchEvent(event);
                    } else {
                        key.start = 0;
                        timer.stop();
                    }
                }, interval);

                key = keyboard[keyCode] = {
                    pressed: true,
                    timer: timer
                };

                key.start = timer.start();
            }
        }
    })(30);
    //end taken from stackoverflow
    
    
    //arrow keys control movement
    window.addEventListener("keypressed", function (event) {
        if(moving){
            switch (event.keyCode) {
                case 37:
                    Xpos -=1;
                    break;
                case 38:
                    Ypos -= 1;
                    break;
                case 39:
                    Xpos += 1;
                    break;
                case 40:
                    Ypos += 1;
                    break;
            }
        }
    
    }, false);
    
	//******************************
	//functions
    //*********
    
	function tick() { //main loop
		setTimeout(function(){
            console.time("loop");
            $score.text(score);
	        drawGrid();
            drawPlayer();
            drawFinish();
            if (playerDies()){
                $death_message.css("opacity", "1");
                
                startOver();
                
                
            }
            //increase the players score, move finish, continue loop
            if (playerWins()){
                score += 1;
                moveFinish();
                updateGrid();
                console.timeEnd("loop");
                requestAnimationFrame(tick);
                count +=1;
            }
            else{
                if (moving){
                    updateGrid();
                    console.timeEnd("loop");
                    requestAnimationFrame(tick);
                    count +=1;
                }
            }
		}, 20);
	}
    
    //when the player reaches the finish, move it
    function moveFinish(){
        xFinishMin = Math.round(Math.random()*(gridHeight - 30) + 10);
        yFinishMin = Math.round(Math.random()*(gridWidth - 30) + 10);
        yFinishMax = yFinishMin + 10;
        xFinishMax = xFinishMin + 10;
        console.log("xfinish" + xFinishMin);
        console.log("yfinish" + yFinishMin);
        
    }
    
    //reset the board, prepare for new game
    function startOver(){
        xFinishMin = xFinishMinStart;
        xFinishMax = xFinishMaxStart;
        yFinishMin = yFinishMinStart;
        yFinishMax = yFinishMaxStart;
        score = 0;
        moving = false;
        Xpos = Xstart;
        Ypos = Ystart;
        fillRandom(); //create the starting state for the grid by filling it with random cell
        drawGrid();
        drawPlayer();
        drawFinish();
    }
    
    
	function createArray(rows) { //creates a 2 dimensional array of required height
	    var arr = [];
	    for (var i = 0; i < rows; i++) {
	        arr[i] = [];
	    }
	    return arr;
	}
    
    //check if the player is touching a red node. 
    function playerDies(){
        for (var x = Xpos -1; x <= Xpos + 1; x++){
            for (var y = Ypos - 1; y <= Ypos + 1; y++){
                if (theGrid[x][y] == 1){
                    return true;
                }
            }
        }
        return false;
    }

	function fillRandom() { //fill the grid randomly
	    for (var j = 0; j < gridHeight; j++) { //iterate through rows
	        for (var k = 0; k < gridWidth; k++) { //iterate through columns
	            theGrid[j][k] = Math.round(Math.random() -.44);
                if (j > 20 && j < 70 && k > 50 && k < 100){//avoid the spawn point
                    theGrid[j][k] = 0;
                }
                if (nearFinish(j,k)){//avoid the finish point
                    theGrid[j][k] = 0;
                }
	        }
	    }
	}
    
    function playerWins(){//return true is player is touching finish
        return (Xpos >= xFinishMin - 1 && Xpos <= xFinishMax && Ypos >= yFinishMin - 1 && Ypos <= yFinishMax);
    }
    
    function nearFinish(x,y){//return true if x,y are within 5 spots of the finish
        return (x > xFinishMin - 5 && x < xFinishMax + 5 && y > yFinishMin - 5 && y < yFinishMax + 5);
    }
    
    
    function drawPlayer() {//draw player at Xpos Ypos such that it does not disrupt the game of life
        $ctx.fillStyle = "green";
        for (var x = Xpos -1; x <= Xpos + 1; x++){
            for (var y = Ypos - 1; y <= Ypos + 1; y++){
                $ctx.fillRect(x*fillsize,y*fillsize,fillsize,fillsize);
            }
        }
        $ctx.fillStyle = "red";
    }
    
    function drawFinish(){//draw finish
        console.log("drawing finish");
        $ctx.fillStyle = "gold";
        for (var x = xFinishMin; x < xFinishMax; x++){
            for (var y = yFinishMin; y < yFinishMax; y++){
                $ctx.fillRect(x*fillsize,y*fillsize,fillsize,fillsize);
            }
        }
        $ctx.fillStyle = "red";
        
    }

	function drawGrid() { //draw the contents of the grid onto a canvas
	    var liveCount = 0;
	    $ctx.clearRect(0, 0, $cHeight, $cWidth); //this should clear the canvas ahead of each redraw
	    for (var j = 1; j < gridHeight; j++) { //iterate through rows
	        for (var k = 1; k < gridWidth; k++) { //iterate through columns
	            if (theGrid[j][k] === 1) {
	                $ctx.fillRect(j*fillsize, k*fillsize, fillsize, fillsize);
	                liveCount++;
	                
	            }
	        }
	    }
	    console.log(liveCount/100);
	}
    
    function onBorder(x, y){
        return x == 2 || x == gridHeight - 2 || y == 2 || y == gridHeight - 2;
    }
    
    function nearPlayer(x, y){
        return (x > Xpos - 10 && x < Xpos + 10 && y > Ypos - 10 && y < Ypos + 10);
    }
    
    //ensures game doesn't end by adding random squares (mutations).
    function addChaos(x, y){
        if (!nearPlayer(x,y) && !nearFinish(x,y)){
            return (Math.random()*Math.random()*Math.random() > .94);
        }
        return false;
    }
    
	function updateGrid() { //perform one iteration of grid update
	   
	    for (var j = 1; j < gridHeight - 1; j++) { //iterate through rows
	        for (var k = 1; k < gridWidth - 1; k++) { //iterate through columns
	            var totalCells = 0;
	            //add up the total values for the surrounding cells
	            totalCells += theGrid[j - 1][k - 1]; //top left
	            totalCells += theGrid[j - 1][k]; //top center
	            totalCells += theGrid[j - 1][k + 1]; //top right

	            totalCells += theGrid[j][k - 1]; //middle left
	            totalCells += theGrid[j][k + 1]; //middle right

	            totalCells += theGrid[j + 1][k - 1]; //bottom left
	            totalCells += theGrid[j + 1][k]; //bottom center
	            totalCells += theGrid[j + 1][k + 1]; //bottom right

	            //apply the rules to each cell
	            switch (totalCells) {
	                case 2:
	                    mirrorGrid[j][k] = theGrid[j][k];
	                   
	                    break;
	                case 3:
	                    mirrorGrid[j][k] = 1; //live
	                    
	                    break;
	                default:
	                    mirrorGrid[j][k] = 0; //die
	            }
                
                if (nearFinish(j,k)){
                    mirrorGrid[j][k] = 0;
                }
                
                if (onBorder(j,k)){
                    mirrorGrid[j][k] = 1;
                }
                if (addChaos(j,k)){
                    mirrorGrid[j][k] = 1;
                }
                
	        }
	    }

	    //mirror edges to create wraparound effect
        /*
	    for (var l = 1; l < gridHeight - 1; l++) { //iterate through rows
	        //top and bottom
	        mirrorGrid[l][0] = mirrorGrid[l][gridHeight - 3];
	        mirrorGrid[l][gridHeight - 2] = mirrorGrid[l][1];
	        //left and right
	        mirrorGrid[0][l] = mirrorGrid[gridHeight - 3][l];
	        mirrorGrid[gridHeight - 2][l] = mirrorGrid[1][l];

	    }
        */


	    //swap grids
	    var temp = theGrid;
	    theGrid = mirrorGrid;
	    mirrorGrid = temp;
	}

});