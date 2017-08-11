$(document).ready(function(){
	//this is all for background game of life
    console.log("connected");
    var $c = $("#game-field");
	var $ctx = $c[0].getContext("2d");
	var gridHeight = $c.height()/2;
	var gridWidth = $c.width()/2;
    var Xpos;
    var Ypos;
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
    var yFinishMax;
	var theGrid = createArray(gridWidth);
	var mirrorGrid = createArray(gridWidth);
	$ctx.fillStyle = "red";
	var count = 0;
	
	var $starting_message = $(".starting-message");
    var $death_message = $(".death-message");
    
    startOver();
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
    
    window.addEventListener("keypressed", function (event) {
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
    }, false);
    //end taken from stackoverflow
    
    
	
	//functions
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
    
    function moveFinish(){
        xFinishMin = Math.round(Math.random()*gridWidth - 10);
        yFinishMin = Math.round(Math.random()*gridHeight - 50);
        yFinishMax = yFinishMin + 10;
        xFinishMax = xFinishMin + 10;
        console.log(" xfinish" + xFinishMin);
        console.log("yfinish" + yFinishMin);
        
    }
    
    
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
	            theGrid[j][k] = Math.round(Math.random() -.4);
                if (j > 20 && j < 70 && k > 50 && k < 100){
                    theGrid[j][k] = 0;
                }
                if (nearFinish(j,k)){
                    theGrid[j][k] = 0;
                }
	        }
	    }
	}
    
    function playerWins(){
        return (Xpos >= xFinishMin - 1 && Xpos <= xFinishMax && Ypos >= yFinishMin - 1 && Ypos <= yFinishMax);
    }
    
    function nearFinish(x,y){
        return (x > xFinishMin - 5 && x < xFinishMax + 5 && y > yFinishMin - 5 && y < yFinishMax + 5);
    }
    function drawPlayer() {
        $ctx.fillStyle = "green";
        for (var x = Xpos -1; x <= Xpos + 1; x++){
            for (var y = Ypos - 1; y <= Ypos + 1; y++){
                $ctx.fillRect(x,y,1,1);
            }
        }
        $ctx.fillStyle = "red";
    }
    
    function drawFinish(){
        console.log("drawing finish");
        $ctx.fillStyle = "gold";
        for (var x = xFinishMin; x < xFinishMax; x++){
            for (var y = yFinishMin; y < yFinishMax; y++){
                $ctx.fillRect(x,y,1,1);
            }
        }
        $ctx.fillStyle = "red";
        
    }

	function drawGrid() { //draw the contents of the grid onto a canvas
	    var liveCount = 0;
	    $ctx.clearRect(0, 0, gridHeight, gridWidth); //this should clear the canvas ahead of each redraw
	    for (var j = 1; j < gridHeight; j++) { //iterate through rows
	        for (var k = 1; k < gridWidth; k++) { //iterate through columns
	            if (theGrid[j][k] === 1) {
	                $ctx.fillRect(j, k, 1, 1);
	                liveCount++;
	                
	            }
	        }
	    }
	    console.log(liveCount/100);
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