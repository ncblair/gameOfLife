//some of this code is inspired by http://disruptive-communications.com/conwaylifejavascript/


$(document).ready(function(){
	//check connection b/w JS and HTML
    console.log("connected");
    
    
    /**********************
    *set up new Game, Initialize game elements
    ***********************/
    var board = new Board($("#game-field"), 3, color);
    var user = new Player(true, 1, board, 1/5, 1/2, "green");
    var finish = new Finish(5, board, 4/5, 1/2, "gold");
    
    //listen to the keyboard for arrow keys, spacebar input
    startListeningToKeyboard();
    
    var moving;//is the game in motion?
    var count = 0;//how many iterations has the game performed?
    
    //set up users, score, to be sent to PHP(encapsulate later)
    var $user = $(".user");
    var username = setHighScoreName();
    var $score = $(".score");
    var highscore = setHighScore();
    var $highscore = $(".highscore");
	
    //access the starting message for the game (encapsulate later)
	var $starting_message = $(".starting-message");
    var $death_message = $(".death-message");
    
    resetAll();
    
    /**
    *prepare for a new game
    **/
    function resetAll() {
        board.reset();
        user.reset();
        finish.reset();
    }
    
    /**
    *main loop
    **/
    function tick() {
        setTimeout(function() {
            board.drawBoard();
            user.drawOnBoard();
            
        }, 20);
    }
    
    
    /**
    *A Player of size WIDTH is an element that appears on and can 
    *interact with a BOARD, but does not follow John Conway's GOL 
    *rules. a player ISCONTROLLABLE if the user can control it. 
    *STARTX and STARTY are multiplied by the BOARD's width and height 
    *to determine the start position of the player
    **/
    function Player(isControllable, width, board, startX, startY, color) {
        
        this.xPos = startX*board.width();
        this.yPos = startY*board.height();
        this.isControllable = isControllable;
        
        this.moveX = function(howMuch) {
            this.xPos += howMuch;
        }
        
        this.moveY = function(howMuch) {
            this.yPos += howMuch;
        }
        
        /**
        *draws player on the board around XPOS, YPOS
        **/
        this.drawOnBoard = function(){
            var x;
            var y;
            for (var i = 0; i <= 2*width; i++) {
                for (var j = 0; j <= 2*width; j++) {
                    x = xPos - width + i;
                    y = yPos - width + j;
                    board.fillNode(x, y, color);
                }
            }
        }
        
    }
    
    /**
    *A Player of size WIDTH is an element that appears on and can 
    *interact with a BOARD, but does not follow John Conway's GOL 
    *rules. a player ISCONTROLLABLE if the user can control it. 
    *STARTX and STARTY are multiplied by the BOARD's width and height 
    *to determine the start position of the player
    **/
    function Finish(width, board, startX, startY, color) {
        
        this.xPos = startX*board.width();
        this.yPos = startY*board.height();
        
        /**
        *moves the finish to a random spot on the board
        **/
        this.randomMove() {
            //Mul ensures the finish stays within the grid
            var xMul = (board.width() - width - 1)/board.width();
            var yMul = (board.height() - width - 1)/board.height();
            this.xPos = xMul*Math.random()*board.width();
            this.yPos = yMul*Math.random()*board.height();
        }
        
        
        /**
        *draws player on the board around XPOS, YPOS
        **/
        this.drawOnBoard = function(){
            var x;
            var y;
            for (var i = 0; i <= 2*width; i++) {
                for (var j = 0; j <= 2*width; j++) {
                    x = xPos - width + i;
                    y = yPos - width + j;
                    board.fillNode(x, y, color);
                }
            }
        }
        
    }
    
    
    /**
    *A Board is represented in HTML as a $CANVAS,
    *with context $CTX. FILLSIZE represents the height and width of
    *nodes on the screen. The board is represented and updated with 
    *two grids that mimic the dimensions of the canvas.
    **/
    function Board($canvas, fillsize, color) {
        
        /**
        *performs one iteration of grid update
        **/
        this.updateGrid = function() {
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

            //swap grids
            var temp = theGrid;
            theGrid = mirrorGrid;
            mirrorGrid = temp;
        }
        
        
        
        
        /**
        *fills the grid randomly leaving space around PLAYERS and 
        *FINISHES
        **/
        this.fillRandom = function(players, finishes) {
            for (var j = 0; j < gridHeight; j++) { 
                for (var k = 0; k < gridWidth; k++) { 
                    theGrid[j][k] = Math.round(Math.random() -.44);
                    //avoid spawn point
                    if (j > 20 && j < 70 && k > 50 && k < 100){
                        theGrid[j][k] = 0;
                    }
                    if (nearFinish(j,k)){//avoid the finish point
                        theGrid[j][k] = 0;
                    }
                }
            }
        }
        
        this.height = function() {
            return gridHeight;
        }
        
        this.width = function() {
            return gridWidth;
        }
        
        this.fillsize = function() {
            return fillsize;
        }
        
        
        /**
        *Draws the color COLOR nodes on the board
        **/
        this.drawBoard = function() {
            $ctx.clearRect(0, 0, $canvas.height(), $canvas.width()); //this should clear the canvas ahead of each redraw
            for (var j = 0; j < gridHeight; j++) { //iterate through rows
                for (var k = 0; k < gridWidth; k++) { //iterate through columns
                    if (theGrid[j][k] === 1) {
                        this.fillNode(j, k, color);

                    }
                }
            }
        }
        
        this.fillNode = function(x, y, color) {
            $ctx.fillStyle = color;
            $ctx.fillRect(x*fillsize, y*fillsize, fillsize, fillsize);
        }
        
        
        var $ctx = $canvas[0].getContext("2d");
        var gridHeight = Math.round($canvas.height()/fillsize);
        var gridWidth = Math.round($canvas.width()/fillsize);
        var mainGrid = createArray(gridWidth);
        var mirrorGrid = createArray(gridWidth);
        
        
        /**
        *fills FILLSIZE squared nodes around X, Y color COLOR.
        **/

        
        
        /**
        *creates a 2D array of height ROWS
        **/
        function createArray(rows) { 
            var arr = [];
            for (var i = 0; i < rows; i++) {
                arr[i] = [];
            }
            return arr;
	   }
        
    }
    
    
    
    //prepare new game
    startOver();
    
    

    
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
                setHighScore();
                setHighScoreName();
                moving = false;
                updateHighScore();
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
    
    //partially taken from https://stackoverflow.com/questions/28177117/how-to-update-mysql-with-php-and-ajax-without-refreshing-the-page
    function updateHighScore(){
        console.log("updatingHighScore");
        console.log("score is " + score);
        console.log("highscore is " + highscore);
        if (score > highscore){
            username = prompt("Congratulations! You beat the High Score. What is your name?");
            $.ajax({
                type:'POST',//type of ajax
                url:'/gameOfLife/assets/PHP/highScore.php',//where the request is going
                data:{"name": username, "score": score},//the variable you want to send
                success:function(result){
                    //result is your result from the xhttpRequest.
                    console.log("result" + result);
                    highscore = result;
                    $highscore.text(highscore);
                }
            })
        }
    }
    
    function setHighScore(){
        console.log("settingHighScore");
        $.ajax({
           type:'POST',
           url:'/gameOfLife/assets/PHP/highScore.php',
           data:{"action": 1},
           success:function(result){
                    //result is your result from the xhttpRequest.
                    console.log("result2" + result);
                    highscore = result;
                    $highscore.text(highscore);
                }
        });
    }
    
    function setHighScoreName(){
        console.log("settingHighScoreName");
        $.ajax({
            type:'POST',
            url:'/gameOfLife/assets/PHP/highScore.php',
            data:{"action2":1},
            success:function(result){
                    console.log("name" + result);
                    username = result;
                    $user.text(username);
                }
        })
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
        $highscore.text(highscore);
        Ypos = Ystart;
        fillRandom(); //create the starting state for the grid by filling it with random cell
        drawGrid();
        drawPlayer();
        drawFinish();
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
            return (Math.random()*Math.random()*Math.random() > .95);
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
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    /**
    *handles all user input
    **/
    function startListeningToKeyboard() {
        
        
        /**
        *on spacebar, start main loop
        **/
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
        
        /**
        *override keydown repeat delay
        *credit:
        *https://stackoverflow.com/questions/11355595/is-it-possible-to-override-the-keydown-repeat-delay-in-javascript
        **/
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
        //end credit


        /**
        *listen for arrow key input
        **/
        window.addEventListener("keypressed", function (event) {
            if(moving){
                switch (event.keyCode) {
                    case 37:
                        user.moveX(-1);
                        break;
                    case 38:
                        user.moveY(-1);
                        break;
                    case 39:
                        user.moveX(1);
                        break;
                    case 40:
                        user.moveY(1);
                        break;
                }
            }

        }, false);
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    

});