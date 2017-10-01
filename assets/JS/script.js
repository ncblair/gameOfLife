/*author: Nathan Blair, nathanblair.me*/
/*jslint browser: true*/
/*global $, jQuery, alert*/

//connect to DOM, declare constants;
var doc = $(document);
var wndo = $(window);
var canvas = $("#game-field");
var fillsize = 3;
var gridHeight = Math.floor(this.canvas.height / fillsize);
var gridWidth = Math.floor(this.canvas.width / fillsize);
var scorefield = $(".score");
var highscorefield = $(".highscore");

doc.ready(function () {
    "use strict";
    var engine = new Engine();
});




/*Classes*/


//manages the canvas, 
//adds functionality
class Canvas {
    
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas[0].getContext("2d");
    }
    
    //is (X, Y) on the canvas
    screenPositionOnCanvas(x, y) {
        var cRect = this.positionOnScreen();
        return screenPositionOnRect(cRect);
    }
    
    screenPositionOnRect(x, y, rect) {
        return (rect.top < y && rect.bottom > y && rect.left < x && rect.right > x);
    }
    //gets the position of the mouse at screenX and screenY
    //relative to the canvas
    canvasPosition(screenX, screenY) {
        var cRect = this.positionOnScreen();
        if screenPositionOnCanvas(screenX, screenY) {
            return new Point(screenX - cRect.left, screenY - cRect.top);
        } else {
            throw "mouse clicked off canvas";
        }
    }
    
    //returns a rectangle object;
    positionOnScreen() {
        var rect = this.canvas.getBoundingClientRect();
    }
    
    height() {
        return this.canvas.height();
    }
    
    width() {
        return this.canvas.width();
    }
    
}



//Handling User Input with the Canvas
class ChainOfResponsibility {
    constructor(state, handlers = []) {
        this.state = state;
        this.handlers = handlers;
        this.canPropagate;
    }
    
    delegateJob(data) {
        for (let handler of this.handlers) {
            if (this.canPropagate) {
                (handler.execute(this, data));
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
    
    addHandler(handler) {
        this.handlers.push(handler);
    }
    
}

// "abstract" class
class Handler {
    execute(chain, data) {
        return;
    }
}

class HomeHandler extends Handler{
    execute(chain, data) {
        if(chain.)
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
            this.currentState.leave();
            this.currentState = null;
        }
        for (let state of this.states) {
            if (state.name == nextState) {
                this.currentState = state;
                this.currentState.enter();
            }
        }
    }
    nextState() {
        if (this.currentState == null) {
            throw "Can't call next state on null";
        }
        changeState(this.currentState.next);
    }
}

class State {
    constructor(name, next, elements, painters) {
        this.name = name;
        this.next = next;
        this.elements = elements;
        this.painters = painters;
    }
    
    enter() {
        console.log("entering state %s", this.name);
    }
    
    leave() {
        console.log("leaving state %s", this.name);
    }
}

class HomeView extends State {
    constructor(elements, painters) {
        super("home", "game", elements, painters);
    }
    
    enter() {
        super.enter();
        var startSolo = new TextBox(new Point(100, 50), "yellow", 300, 50, "Solo");
        var startBattle = new TextBox(new Point(100, 210), "blue", 300, 50, "Battle");
        var color = new TextBox(new Point(100, 370), "red", 300, 50, "Color");
        this.elements.push(...[startSolo, startBattle, color]);
        this.painters.push(new HomePainter(...this.elements));
        
    }
    
    leave() {
        super.leave();
        this.painters.length = 0;
        this.elements.length = 0;
    }
}

class GameView extends State {
    constructor(elements, painters) {
        super("game", "home", elements, painters);

    }
    enter() {
        super.enter();
        var user = new User(new Point(50, 100));
        var finish = new Finish(new Point(200, 100));
        this.elements.push(user, finish);
        for (let i = 0; i < gridHeight*gridWidth; i++) {
            let mineLoc = new Point(i % gridWidth, Math.floor(i / gridHeight));
            this.elements.push(new Landmine(mineLoc));
        }
        this.painters[0] = new GamePainter(...this.elements);
        
    }
    
    leave() {
        super.leave();
        this.painters.length = 0;
        this.elements.length = 0;
    }
}

/*Update and Render*/

//Game Engine
class Engine {
    constructor() {
        this.elements = [];
        this.painters = [];
        this.conductor = new StateMachine();
        this.conductor.addState(new HomeView(this.elements, this.painters));
        this.conductor.addState(new GameView(this.elements, this.painters));
        this.conductor.changeState("home");
        console.log("after state set");
        this.render();
        setInterval(this.update.bind(this), 20);
    }
    update() {
        for (let element of this.elements) {
            //element.update();
            console.log("updating elements");
        }
    }
    render() {
        requestAnimationFrame(this.render.bind(this));
        if (this.painters[0]) {
            this.painters[0].paint();
        }
        else {
            throw "No Defined Painter";
        }
    }

}

//Abstract Painter, Renders Canvas
class Painter {
    
    //paintables are things that can be painted
    constructor(...paintables) {
        this.paintables = paintables;
        this.canvas = canvas;
        this.context = canvas[0].getContext("2d");
        this.fillsize = fillsize;
    }
    
    paint() {
        throw "Abstract Painter cannot paint"
    }
    
    //returns the top left coordinate for an item of
    //width W and height H so that the item is centered
    center(w, h) {
        var x = Math.floor((this.canvas.width() - w)/2);
        var y = Math.floor((this.canvas.height() - h)/2);
        return new Point(x, y);
    }
    
    pixelsHigh() {
        return Math.floor(this.canvas.height()/fillsize);
    }
    
    pixelsWide() {
        return Math.floor(this.canvas.width()/fillsize);
    }
}

//only knows how to paint home objects
class HomePainter extends Painter{
    
    //this method is really messy, I know...
    //redesign coming soon, procrastinating
    //in the name of rapid development
    paint() {
        var instr;
        for (let object of this.paintables) {
            instr = object.getPaintInstructions();
            switch (instr[0]) {
                case "Box":
                    this.context.fillStyle = instr[1];
                    this.context.fillRect(instr[2].x, instr[2].y, instr[3], instr[4]);
                    break;
                case "TextBox":
                    console.log(instr);
                    this.context.fillStyle = instr[1];
                    var cen = this.center(instr[3], instr[4]);
                    console.log(cen.x);
                    this.context.fillRect(cen.x, instr[2].y, instr[3], instr[4]);
                    this.context.fillStyle = "black";
                    this.context.font = instr[5];
                    this.context.textAlign = "center";
                    this.context.fillText(instr[6], this.canvas.width()/2, instr[2].y + 35);
                    break;
            }
        }
    }
}
        
//only knows how to paint game elements
class GamePainter extends Painter{
    paint() {
        var instr;
        for (let object of this.paintables) {
            instr = object.getPaintInstructions();
            for (let block of instr[2]) {
                this.context.fillStyle = instr[1];
                this.context.fillRect(block.x*fillsize, block.y*fillsize, fillsize, fillsize);
            }
        }
    }
}


//keep track of score, high scores, etc.
class ScoreKeeper {
    
}

    
class Paintable {
    constructor(paintType, colr) {
        this.paintType = paintType;
        this.colr = colr;
        this.paintInstructions = this.getPaintInstructions();
    }
    getPaintInstructions() {
        return [this.paintType, this.colr];
    }
}
    
/*Game Elements*/
//Manage different objects of my application

class InArena extends Paintable{
    constructor(mysize, colr, startLoc, occupiedFunc) {
        super("Pixels", colr);
        this.mysize = mysize;
        this.startLoc = startLoc;
        this.occupiedFunc = occupiedFunc;
        this.occupiedBlocks = this.occupiedBlocks();
        this.paintInstructions = this.getPaintInstructions();
    }
    
    isTouching(that) {
        return distanceTo(that) <= 0;
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
        return this.occupiedFunc(this.mysize, this.startLoc);
    }
    
    spaceOccupied() {
        return this.occupiedBlocks.size;
    }
    getPaintInstructions() {
        var instructions = super.getPaintInstructions();
        instructions[0] = this.paintType;
        instructions.push(this.occupiedBlocks);
        return instructions;
    }
}

class ArenaSquare extends InArena {
    constructor(mysize, colr, location) {
        function makeSquare(mysize, startLoc) {
            var occupied = new Set();
            for (let i = mysize; i <= mysize; i++) {
                for (let j = -mysize; j <= mysize; j ++) {
                    occupied.add(new Point(startLoc.x + i, startLoc.y + j));
                }
            }
            return occupied;
        }
        
        super(mysize, colr, location, makeSquare);   
    }
    
    distanceTo(that) {
        return this.location.distanceTo(that.location) - this.mysize;
    }
    
}

class Wall extends InArena {
    //direction is a char n, s, e, w (cardinal direction);
    //mysize is 0 indexed, mysize = 5 implies a 6 unit wall.
    constructor(mysize, startLoc, direction = 'n') {
        this.direction = direction;
        super(mysize, "white", startLoc, this.lineInTheDirection());
    }
    
    //returns a function for occupied spaces of a line in direction = THIS.DIRECTION
    lineInTheDirection() {
        var changeX = 0;
        var changeY = 0;
        switch (this.direction) {
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
        var makeLine = function(mysize, startLoc) {
            var occupied = new Set();
            
            var makeLineTailRecursive = function(mysize, startLoc, occupied) {
                "use strict";
                if (mysize < 0) {
                    return occupied;
                }
                occupied.add(new Point(startLoc.x + mysize*changeX, startLoc.y + mysize*changeY));
                return makeLineTailRecursive(mysize - 1, startLoc, occupied);
            }
            
            return makeLineTailRecursive(mysize, startLoc, occupied);
        }
        
        return makeLine;
    }
}

class Landmine extends ArenaSquare {
    //landmine's has property is on, s.t. if a landmine is on and a Player is on the same square, the player will lose health; else, not;
    constructor(location, mysize = 0) {
        this.isOn = false;
        super(mysize, "red", location);
    }
    
    activate() {
        this.isOn = true;
    }
    
    deactivate() {
        this.isOn = false;
    }
}

class Finish extends ArenaSquare {
    constructor(location, mysize = 2) {
        super(mysize, "green", location);
    }
}

class Player extends ArenaSquare {
    //velocity is a vector(TUPLE) representing change in location
    constructor(colr, location, mysize = 1) {
        super(mysize, colr, location);
        this.health = 1;
    }
    move(velocity) {
        location.x += velocity.x;
        location.y += velocity.y;
    }
}

class User extends Player {
    constructor(location, mysize = 1) {
        super(mysize, "blue", location);
    }
    
}

class Villain extends Player {
    constructor(location, mysize = 1) {
        super(mysize, "gray", location);
    }
}


    
/*Home Elements*/

class InHome extends Paintable{
    constructor(topLeft, colr, bwidth, bheight) {
        super("Box", colr);
        this.topLeft = topLeft;
        this.bwidth = bwidth;
        this.bheight = bheight;
        
        this.paintInstructions = this.getPaintInstructions();
    }
    getPaintInstructions() {
        var instructions = super.getPaintInstructions();
        instructions[0] = this.paintType;
        instructions.push(this.topLeft);
        instructions.push(this.bwidth);
        instructions.push(this.bheight);
        return instructions;
    }
    
    update() {
        return;
    }
}

class TextBox extends InHome {
    constructor(topLeft, colr, bwidth, bheight, text, font = "30px Arial") {
        super(topLeft, colr, bwidth, bheight);
        this.paintType = "TextBox";
        this.font = font;
        this.text = text;
        this.paintInstructions = this.getPaintInstructions();
    }
    getPaintInstructions() {
        var instructions = super.getPaintInstructions();
        instructions[0] = this.paintType;
        instructions.push(this.font);
        instructions.push(this.text);
        return instructions;
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
        return Math.abs(this.x - x) + Math.abs(this.y - y);
    }
}



    
    
    