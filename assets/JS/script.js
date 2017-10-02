/*author: Nathan Blair, nathanblair.me*/
/*jslint browser: true*/
/*global $, jQuery, alert*/

//connect to DOM, declare constants;

$(document).ready(function () {
    "use strict";
    var canvas = new Canvas($("#game-field"));
    var engine = new Engine(canvas);
});




/*Classes*/

//manages the canvas, 
//adds functionality
class Canvas {
    
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas[0].getContext("2d");
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
    
    height() {
        return this.canvas.height();
    }
    
    width() {
        return this.canvas.width();
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
        //new state machine
        this.conductor = new StateMachine();
        this.conductor.addState(new HomeState(this.elements));
        this.conductor.addState(new GameState(this.elements));
        this.conductor.changeState("home");
        //listen for events
        this.canvas = canvas;
        var listener = new CanvasListener(new ChainOfResponsibility(this.elements), this.canvas.canvas);
        //render
        this.render();
        //update
        setInterval(this.update.bind(this), 20);
    }
    update() {
        for (let element of this.elements) {
            var next = element.update(this.elements)
            if (next) {
                this.conductor.changeState(next)
            }
        }
    }
    render() {
        requestAnimationFrame(this.render.bind(this));
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
        $(document).keypress(function(event) {
            
            var code = event.keyCode || event.which;
            console.log("keypressed ", code);
            var data = new Map();
            data.set("type", "keypress");
            data.set("code", code);
            chain.delegateJob(data);
        });
        
        canvas.click(function(event) {
            console.log("canvas clicked");
            var offset = canvas.position();
            
            //LOC = position on the canvas of click;
            var loc = new Point(event.clientX, event.clientY);
            loc.x = loc.x - offset.left;
            loc.y = loc.y - offset.top;
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
        this.canPropogate = true;
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
            this.currentState.leave();
            this.currentState = null;
        }
        console.log(this.states);
        
        for (let state of this.states) {
            if (state.name == nextState) {
                this.currentState = state;
                this.currentState.enter();
            }
        }
        
    }
}

class State {
    constructor(name, elements) {
        this.name = name;
        this.elements = elements;
    }
    
    enter() {
        console.log("entering state %s", this.name);
    }
    
    leave() {
        console.log("leaving state %s", this.name);
    }
}

class HomeState extends State {
    constructor(elements) {
        super("home", elements);
    }
    
    enter() {
        super.enter();
        var startSolo = new TextBox("yellow", new Point(200, 250), 200, 100, "start", "game");
        this.elements.push(...[startSolo]);
    }
    
    leave() {
        super.leave();
        this.elements[0] = null;
    }
}

class GameState extends State {
    constructor(elements) {
        super("game", elements);

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
    constructor(colr, topLeft, width, height, text, nextState, font = "30px Arial") {
        super(colr, topLeft, width, height, nextState);
        this.font = font;
        this.text = text;
    }
    
    paint(canvas) {
        super.paint(canvas);
        canvas.addText(this.topLeft, this.width, this.height, this.text, this.font);
    }
}

//elements in the arena
/*
class ArenaElem extends Element {
    
}

class Wall extends ArenaElem {
    
}

class MineField extends ArenaElem {
    
}

class ArenaSquare extends ArenaElem {
    
}

class Landmine extends ArenaSquare {
    
}

class Player extends ArenaSquare {
    
}

class User extends Player {
    
}

class Villain extends Player {
    
}

class Finish extends ArenaSquare {
    
}

class Landmine extends ArenaSquare {
    
}
*/

        
//only knows how to paint game elements
class GamePainter{
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



    
    
    