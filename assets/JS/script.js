/*author: Nathan Blair, nathanblair.me*/
/*jslint browser: true*/
/*global $, jQuery, alert*/


$(document).ready(function () {
    "use strict";

    var c = document.getElementById('game-field');
    var cWidth = c.width;
    var cHeight = c.height;
    
    var canvas = new Canvas($("#game-field"), cWidth, cHeight);
    var engine = new Engine(canvas);
});




/*Classes*/

//manages the canvas, 
//adds functionality
class Canvas {
    constructor(canvas, width, height) {
        this.canvas = canvas;
        
        this.w = width;
        this.h = height;
        
        this.context = canvas[0].getContext("2d");
        this.context.imageSmoothingEnabled = true;
        this.fitToWindow();
    }
    
    fillPixel(colr, coordinate) {
        this.context.fillStyle = colr;
        this.context.fillRect(coordinate.x, coordinate.y, 1, 1);
    }
    
    fillBox(colr, topLeft, width, height) {
        this.context.fillStyle = colr;
        this.context.fillRect(topLeft.x, topLeft.y, width, height);
    }
    
    addText(topLeft, width, height, text, font) {
        this.context.fillStyle = "black";
        this.context.font = font;
        this.context.textAlign = "center";
        this.context.fillText(text, topLeft.x + width / 2, topLeft.y + (height * .6));
    }
    
    //returns the top left coordinate for an item of
    //width W and height H so that the item is centered
    center(w, h) {
        var x = Math.floor((this.width() - w)/2);
        var y = Math.floor((this.height() - h)/2);
        return new Point(x, y);
    }
    
    setPixelDensity(wide, high) {
        var jsElem = document.getElementById(this.canvas.attr('id'));
        jsElem.height = high;
        this.h = high;
        jsElem.width = wide;
        this.w = wide;
    }
    
    densityWide() {
        return this.w/this.canvas.width();
    }
    
    densityHigh() {
        return this.h/this.canvas.height();
    }
    
    pixelHeight() {
        return this.h;
    }
    
    pixelWidth() {
        return this.w;
    }
    
    position() {
        return this.canvas.position();
    }

    
    fitToWindow() {
        //make sure canvas fits in screen
        if ($(window).height() < $(window).width()) {
            this.canvas.height("100%");
            this.canvas.width("auto");                    
        }
        else {
            this.canvas.height("auto");
            this.canvas.width("100%");
        }
    }
    
    clear() {
        this.context.clearRect(0, 0, this.w, this.h);
    }
}



//Game Engine:
//initializes ubiquitous elements array, 
//adds all game states, 
//begins listening for user input on canvas, 
//calls each element's paint function, 
//calls each element's update function
class Engine {
    constructor(canvas) {
        //elements array gets passed around by reference
        this.elements = [];
        //canvas gets passed around, this canvas is a Canvas
        this.canvas = canvas;
        //new state machine
        this.conductor = new StateMachine();
        this.conductor.addState(new HomeState(this.elements, this.canvas));
        this.conductor.addState(new GameState(this.elements, this.canvas));
        this.conductor.changeState("home");
        //listen for events

        var listener = new CanvasListener(new ChainOfResponsibility(this.elements), this.canvas);
        var listener = new CanvasListener(new ChainOfResponsibility(this.elements), this.canvas);
        //render
        this.render();
        //update
        setInterval(this.update.bind(this), 50);
    }
    update() {
        for (let element of this.elements) {
            var next = element.update(this.elements)
            if (next) {
                this.conductor.changeState(next)
                break;
            }
        }
    }
    render() {
        requestAnimationFrame(this.render.bind(this));
        this.canvas.clear();
        for (let element of this.elements) {
            element.paint(this.canvas);
        }
    }
}



/*Handling User Input with the Canvas*/
class CanvasListener {
    constructor(chain, canvas) {
        var chain = chain;
        var canvas = canvas;
        
        
        //gotta do this little thing to prevent keydown repeat delay
        //broadcasts which keys are pressed
        var keyState = {};
        $(window).keydown(function(event) {
            keyState[event.keyCode || event.which] = true;
        })
        $(window).keyup(function(event) {
            keyState[event.keyCode || event.which] = false;
        })
        function broadcastKeyState() {
            var data = new Map();
            data.set("type", "keypress");
            data.set("code", keyState);
            chain.delegateJob(data);
            setTimeout(broadcastKeyState, 50);
        }
        broadcastKeyState();
        
        //make sure canvas always fits in window;
        $(window).resize(function( event ) {
            canvas.fitToWindow();
        });
        
        //broadcasts when user clicks the screen
        canvas.canvas.click(function(event) {
            console.log("canvas clicked");
            var offset = canvas.position();
            
            //LOC = position on the canvas of click;
            var loc = new Point(event.clientX, event.clientY);
            loc.x = loc.x - offset.left;
            loc.y = loc.y - offset.top;
            loc.x *= canvas.densityWide();
            loc.y *= canvas.densityHigh();
            console.log(loc);
            var data = new Map();
            data.set("type", "click");
            data.set("location", loc);
            chain.delegateJob(data);
        });
    }
    
}

class ChainOfResponsibility {
    constructor(elements) {
        this.elements = elements;
        this.canPropagate = true;
    }
    
    delegateJob(data) {
        this.canPropagate = true;
        for (let element of this.elements) {
            if (this.canPropagate) {
                (element.handle(this, data));
            }
            else {
                //handler picked up job
                break;
            }
        }
    }
    
    stopPropogation() {
        this.canPropagate = false;
    }
}
    

/*States and StateMachine*/
//Manage different states of my application
class StateMachine {
    constructor(states = new Set()) {
        this.currentState = null;
        this.states = states;
        
    }
    addState(state) {
        this.states.add(state);
    }
    deleteState(state) {
        this.states.delete(state);
    }
    
    changeState(nextState) {
        console.log("changing to %s \n", nextState);
        if (this.currentState) {
            if (this.currentState.name == nextState) {
                console.log("already in %s\n", nextState);
                return;
            }
            else {
                this.currentState.leave();
            }
        }
        for (let state of this.states) {
            if (state.name == nextState) {
                this.currentState = state;
                this.currentState.enter();
                break;
            }
        }
        
    }
}

class State {
    constructor(name, elements, canvas) {
        this.name = name;
        this.elements = elements;
        this.canvas = canvas;
    }
    
    enter() {
        console.log("entering state %s", this.name);
    }
    
    leave() {
        console.log("leaving state %s", this.name);
        console.log("here");
        while(this.elements.length > 0) {
            this.elements.pop();
        }
    }
}

class HomeState extends State {
    constructor(elements, canvas) {
        super("home", elements, canvas);
    }
    
    enter() {
        super.enter();
        this.canvas.setPixelDensity(2000, 2000);
        
        var h = this.canvas.pixelHeight();
        var w = this.canvas.pixelWidth();
        
        var title = new TextBox("white", new Point(w/6, 0), 2*w/3, h/6, "Nathan's Game Of Life", "home");
        
        var startSolo = new TextBox("yellow", new Point(w/6, h/4), w/3, h/6, "Start Game", "game");
        
        this.elements.push(...[title, startSolo]);
    }
}


class GameState extends State {
    constructor(elements, canvas) {
        super("game", elements, canvas);

    }
    enter() {
        super.enter();
        
        this.canvas.setPixelDensity(175, 175);
        var h = this.canvas.pixelHeight();
        var w = this.canvas.pixelWidth();
        
        //set up user and finish
        var user = new User(new Point(Math.floor(w/9), Math.floor(h/2)));
        var finish = new Finish(new Point(Math.floor(7*w/12), Math.floor(h/2)), this.canvas);
        
        
        //set up the border walls
        var leftWall = new Wall(this.canvas.pixelHeight(), new Point(0, 0), 's');
        var topWall = new Wall(this.canvas.pixelWidth(), new Point(0,0), 'e');
        var br = new Point(this.canvas.pixelWidth() - 1, this.canvas.pixelHeight() - 1);
        var rightWall = new Wall(this.canvas.pixelHeight(), br, 'n');
        var bottomWall = new Wall(this.canvas.pixelWidth(), br, 'w');
        
        var wallList = [leftWall, topWall, rightWall, bottomWall];
        
        var walls = new WallNetwork(wallList);
        
        
        //set up the mines, not touching other blocks
        var mines = new Array(h);
        for (let i = 0; i < h; i ++) {
            mines[i] = new Array(w);
        }
        for (let i = 0; i < h; i++) {
            for (let j = 0; j < w; j++) {
                let mineLoc = new Point(i, j);
                let newMine = new Landmine(mineLoc);

                //only activate some mines that aren't near important elements to start
                if (Math.random() > .93 && newMine.distanceTo(user) > 10 && newMine.distanceTo(finish) > 10 && !newMine.isTouching(walls)) {
                    newMine.activate();
                                    
                }
                mines[i][j] = newMine;
            }
        }
        
        //mines is a 2d array;
        var landmines = new LandmineNetwork(mines);

        //add all the elements to the elements
        this.elements.push(user, finish, walls, landmines);
        
    }
    
}



/*Canvas Elements*/

//The Element is the building block of the game, 
//Elements can UPDATE(), HANDLE(), and PAINT()
//A list of Elements will be be managed by the current State
//The Engine can make calls to update on an Element
//The Engine's Render Loops makes calls to Element's Paint
//The Event Listener makes calls to the Chain of Responsibilities, 
//which gives each Element the chance to claim responsibility and act
class Element {
    paint(canvas) {
        return;
    }
    handle(chain, data) {
        return;
    }
    update(elements) {
        return false;
    }
}

//elements on the home menu
class HomeElem extends Element {
    constructor() {
        super();
        this.isInHome = true;
    }
}

class ClickToNewStateInHome extends HomeElem {
    constructor(nextState) {
        super();
        this.hasBeenClicked = false;
        this.nextState = nextState;
    }
    
    handle(chain, data) {
        if (data.get("type") == "click") {
            var loc = data.get("location");
            if(this.clicked(loc)) {
                this.hasBeenClicked = true;
                chain.stopPropogation();
            }
        }
    }
    
    update(elements) {
        if (this.hasBeenClicked) {
            console.log("Home Element Clicked");
            this.hasBeenClicked = false;
            return this.nextState;
        }
        return false;
    }
    
    
    clicked(point) {
        throw "abstract clicked method cannot be called";
    }
} 

class Box extends ClickToNewStateInHome {
    constructor(colr, topLeft, width, height, nextState) {
        super(nextState);
        this.colr = colr;
        this.topLeft = topLeft;
        this.width = width;
        this.height = height;
    }
    
    paint(canvas) {
        canvas.fillBox(this.colr, this.topLeft, this.width, this.height);
    }
    
    clicked(point) {
        console.log(this.topLeft.x);
        console.log(point.x);
        var inX = this.topLeft.x < point.x && this.topLeft.x + this.width > point.x;
        var inY = this.topLeft.y < point.y && this.topLeft.y + this.height > point.y;
        return inX && inY;
    }
}

class TextBox extends Box {
    constructor(colr, topLeft, width, height, text, nextState, font = "Arial") {
        super(colr, topLeft, width, height, nextState);
        this.font = (height/4).toString() + "px " + font;
        console.log(this.font);
        this.text = text;
    }
    
    paint(canvas) {
        super.paint(canvas);
        canvas.addText(this.topLeft, this.width, this.height, this.text, this.font);
    }
}

//elements in the arena

class ArenaAbstraction extends Element {
    constructor(colr) {
        super();
        this.colr = colr;
    }
    
    paint(canvas) {
        for (let block of this.occupiedBlocks()) {
            canvas.fillPixel(this.colr, block);
        }
    }
    
    isTouching(that) {
        return this.distanceTo(that) <= 0;
    }    
    
    //very slow, brute force, but inclusive min-distance function
    distanceTo(that) {
        
        var minDistance = Number.MAX_VALUE;
        for (let thisBlock of this.occupiedBlocks()) {
            for (let thatBlock of that.occupiedBlocks()) {

                if (thisBlock.distanceTo(thatBlock) < minDistance) {
                    minDistance = thisBlock.distanceTo(thatBlock);
                }
            }
        }
        return minDistance;
    }
    
    
    occupiedBlocks() {
        throw "Abstract Class can't occupy blocks";
    }
}

class ArenaElem extends ArenaAbstraction {
    constructor(size, colr, location, occupiedFunc) {
        super(colr);
        this.size = size;
        this.location = location;
        this.occupiedFunc = occupiedFunc;
    }
    
    
    occupiedBlocks() {
        return this.occupiedFunc(this.size, this.location);
    }
    
    spaceOccupied() {
        return this.occupiedBlocks().size;
    }
    

}

class LandmineNetwork extends ArenaAbstraction {
    //mines is a 2d array of landmines
    constructor(mines) {
        super(mines[0][0].colr);
        this.mines = mines;
        this.toUpdate = new Set();
        this.possibleUpdateNext = new Set();
        for (let row of this.mines) {
            for (let mine of row) {
                this.possibleUpdateNext.add(mine);
            }
        }
        this.calculateMineNeighbors();

        
    }
    
    
    occupiedBlocks() {
        //iterates through this.walls and adds each of the walls occupied blocks
        var occupied = new Set();
        for (let row of this.mines) {
            for (let mine of row) {
                if (mine.isOn) {
                    for (let block of mine.occupiedBlocks()) {
                        occupied.add(block);
                    }
                }
            }

        }
        return occupied;
    }
    
    //this unintelligible (but efficient) function returns 
    //all the mines ajacent to a mine;
    adjacentMines(mine) {
        var adjacent = new Set();
        
        var mine2 = new Landmine(mine.location, mine.size + 1);
        
        for (let block of mine2.occupiedBlocks()) {
            if (
                //block isn't in original mine
                (block.x > mine2.location.x + mine.size || block.x < mine2.location.x - mine.size || block.y > mine2.location.y + mine.size || block.y < mine2.location.y - mine.size)
               
               &&
                
                //block isn't over edge
                (block.x > 0 && block.x < this.mines.length && block.y > 0 && block.y < this.mines[0].length)
               
               
               ) {
                adjacent.add(this.mines[block.x][block.y]);
            }
        }
        
        var mine2 = null;
        
        return adjacent;
    }
    
    //calculates the number of neighbors for each mine
    //adds those neighbors to list of neighbors for each mine;
    calculateMineNeighbors() {
        for (let i = 0; i < this.mines.length; i++) {
            for (let j = 0; j < this.mines[0].length; j++) {
                var mine = this.mines[i][j];
                mine.neighbors.clear();
                let adjacents = this.adjacentMines(mine);
                for (let otherMine of adjacents) {
                    mine.addNeighbor(otherMine);
                }
            }   
        }
    }
    
    //John Conway's Logic Here
    update(elements) {
        
        //queues a random square to prevent stead state
        var chaosx = Math.floor(Math.random()*this.mines.length);
        var chaosy = Math.floor(Math.random()*this.mines[0].length);
        var mine = this.mines[chaosx][chaosy];
        var chaos = true;
        
        var finish = null;
        for (let elem of elements) {
            if (elem instanceof Player) {
                if (mine.distanceTo(elem) < 50) {
                    chaos = false;
                }
            }
            if (elem instanceof Finish) {
                finish = elem;
            }
        }
        
        //updates the things queued to update
        for (let mine of this.toUpdate) {
            if (mine.activateNext) {
                mine.activate();
                mine.activateNext = false;
            }
            else if (mine.deactivateNext) {
                mine.deactivate(); 
                mine.deactivateNext = false;
            }
            this.toUpdate.delete(mine);
            for (let neighbor of mine.neighbors) {
                this.possibleUpdateNext.add(neighbor);
            }
        }
        if (finish && finish.getRecentlyMoved()) {
            for (let loc of finish.occupiedBlocks()){
                this.possibleUpdateNext.add(this.mines[loc.x][loc.y]);
            }
        }

            
        //john conways logic on squares where game is moving
        for (let mine of this.possibleUpdateNext) {
            switch(mine.numActivatedNeighbors) {
                case 2:
                    break;
                case 3:
                    if (!mine.isOn) {
                        if (finish) {
                            if (mine.distanceTo(finish) > 7) {
                                mine.activateNextTurn();
                                this.toUpdate.add(mine);
                            }     
                        }
                    }
                    break;
                default:
                    if (mine.isOn) {
                        mine.deactivateNextTurn();
                        this.toUpdate.add(mine);
                    }
                    break;
            }
            //mines on finish despawn;
            if (finish) {
                if (!(mine.distanceTo(finish) > 7)) {
                    mine.deactivateNextTurn();
                    this.toUpdate.add(mine);
                }     
            }
        }
        this.possibleUpdateNext.clear();
        
        //add in the random squares here
        if (chaos) {
            mine.activateNextTurn();
            this.toUpdate.add(mine);
            this.possibleUpdateNext.add(mine);
        }

    }
}

class WallNetwork extends ArenaAbstraction {
    constructor(walls) {
        super(walls[0].colr);
        this.walls = walls;
    }
    
    occupiedBlocks() {
        //iterates through this.walls and adds each of the walls occupied blocks
        var occupied = new Set();
        for (let wall of this.walls) {
            for (let block of wall.occupiedBlocks()) {
                occupied.add(block);
            }
        }
        return occupied;
                    
    }
}

class Wall extends ArenaElem {
    //direction is a char n, s, e, w (cardinal direction);
    //SIZE = 6 implies a 6 unit wall.
    constructor(size, startLoc, direction = 'n') {
        //returns a function for occupied spaces of a line in direction = THIS.DIRECTION
        function lineInTheDirection(direction) {
            var changeX = 0;
            var changeY = 0;
            switch (direction) {
                case 'n':
                    changeY =  -1;
                    break;
                case 's':
                    changeY = 1;
                    break;
                case 'e':
                    changeX = 1;
                    break;
                //west is default
                default:
                    changeX = -1;
            }
            //tail recursive optimized function
            var makeLine = function() {
                var occupied = new Set();
                for (let i = 0; i < size; i++) {
                    occupied.add(new Point(startLoc.x + i*changeX, startLoc.y + i*changeY));
                }
                return occupied;
            }
            return makeLine;
        }
        super(size, "purple", startLoc, lineInTheDirection(direction));
        this.direction = direction;
    }
}

class ArenaSquare extends ArenaElem {
    constructor(size, colr, location) {
        //For squares, size represents radius size
        function makeSquare(size, startLoc) {
            var occupied = new Set();
            for (let i = -size; i <= size; i++) {
                for (let j = -size; j <= size; j++) {
                    occupied.add(new Point(startLoc.x + i, startLoc.y + j));
                }
            }
            return occupied;
        }
        super(size, colr, location, makeSquare);   
    }
    isTouching(that) {
        if (that instanceof ArenaSquare) {
            //checks bounding boxes;
            return Math.abs(this.location.x - that.location.x) <= (this.size + that.size) && Math.abs(this.location.y - that.location.y) <= (this.size + that.size)
        } else {
            return super.isTouching(that);
        }
    }
}

class Landmine extends ArenaSquare {
    //landmine's has property is on, s.t. if a landmine 
    //is on and a Player is on the same square, the player will lose health
    constructor(location, size = 0) {
        super(size, "red", location);
        this.isOn = false;
        this.activateNext = false;
        this.deactivateNext = false;
        
        //adjacent mines
        var set = new Set();
        this.neighbors = set;
        
        //small efficieny booster so I don't have to recalculate
        this.numActivatedNeighbors = 0;
    }
    
    activate() {
        if (!this.isOn) {
            this.isOn = true;
            for (let neighbor of this.neighbors) {
                neighbor.numActivatedNeighbors += 1;
            }
        }
    }
    
    deactivate() {
        if (this.isOn) {
            this.isOn = false;
            for (let neighbor of this.neighbors) {
                neighbor.numActivatedNeighbors -=1;
            }
        }
    }
    
    activateNextTurn() {
        this.activateNext = true;
    }
    
    deactivateNextTurn() {
        this.deactivateNext = true;
    }
    
    addNeighbor(otherMine) {
        this.neighbors.add(otherMine);
        if (otherMine.isOn) {
            this.numActivatedNeighbors += 1;
        }
    }
}

class Player extends ArenaSquare {
    //velocity is a vector(TUPLE) representing change in location
    constructor(colr, location, size = 1) {
        super(size, colr, location);
        this.health = 1;
    }
    move(velocity) {
        this.location.x += velocity.x;
        this.location.y += velocity.y;
    }
    

}

class User extends Player {
    constructor(location, size = 2) {
        super("blue", location);
    }
    handle(chain, data) {
        if (data.get("type") == "keypress") {
            var code = data.get("code");
            if (code[87] || code[38]) {
                //w or up
                this.move(new Point(0, -1));
            } if (code[65] || code[37]) {
                //a or left
                this.move(new Point(-1, 0));
            } if (code[83] || code[40]) {
                //s or down
                this.move(new Point(0, 1));
            } if (code[68] || code[39]) {
                //d or right
                this.move(new Point(1, 0));
            }
        }
    }
    update(elements) {
        for (let elem of elements) {
            if (this.isTouching(elem)) {
                if (elem instanceof Finish) {
                    //player won, increment score
                    elem.moveRandom();
                } else if (elem instanceof WallNetwork || elem instanceof LandmineNetwork) {
                    return "home";
                }
            }
        }
    }
    
    
}

class Villain extends Player {
    constructor(location, size = 1) {
        super(size, "gray", location);
    }
    update(elements) {
        console.log("IMPLEMENT, THIS IS WHERE THE AI GOES");
    }
}

class Finish extends ArenaSquare {
    constructor(location, canvas, size = 4) {
        super(size, "green", location);
        
        
        //unfortunately, the finish needs a notion of the canvas to move itself
        this.canvas = canvas;
        this.recentlyMoved = true;
        this.waitTurn = false;
    }
    
    //moves the finish to a random spot on canvas;
    moveRandom() {
        let c = this.canvas;
        this.location = new Point(Math.round(Math.random()*c.w*.8 + c.w*.10), Math.round(Math.random()*c.h*.8 + c.h*.10));
        this.recentlyMoved = true;
    }
    
    getRecentlyMoved() {
        return this.recentlyMoved;
    }
    
    update() {
        if (this.waitTurn) {
            this.recentlyMoved = false;
            this.waitTurn = false;
        }
        else if (this.recentlyMoved) {
            this.waitTurn = true;
        }
    }
    
    
}


/*General Helpers*/

class Tuple{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Point extends Tuple{
    constructor(x, y) {
        super(x, y);
    }
    
    //distance, can only move two directions
    distanceTo(point) {
        return Math.abs(this.x - point.x) + Math.abs(this.y - point.y);
    }
    
    
}

