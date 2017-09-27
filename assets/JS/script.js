/*author: Nathan Blair, nathanblair.me*/
/*jslint browser: true*/
/*global $, jQuery, alert*/

var doc = $(document);
var wndo = $(window);
doc.ready(function () {
    "use strict";
});




/*Abstract Classes*/

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
        if (this.currentState) {
            this.currentState.leave();
        }
        this.currentState = nextState;
        this.currentState.enter();
    }
}

class State {
    constructor(name) {
        this.name = name;
    }
    
    leave() {
        console.log("leaving state %s", name);
    }
    enter() {
        console.log("entering state %s", name);
    }
}

/*Game Elements*/
//Manage different states of my application

class Arena {
    constructor(players, finishes, width, height) {
        this.players = players;
        this.finishes = finishes;
    }
}


class User extends Player {
    constructor(mysize = 1, color = "blue", location) {
        super(mysize, color, location);
    }
    
}

class Villain extends Player {
    constructor(mysize = 1, color = "gray", location) {
        super(mysize, color, location);
    }
}
    
class Player extends ArenaSquare {
    //velocity is a vector(TUPLE) representing change in location
    move(velocity) {
        location.x += velocity.x;
        location.y += velocity.y;
    }
}

class Finish extends ArenaSquare {
    constructor(mysize = 2, color = "green", location) {
        super(mysize, color, location);
    }
}

class Landmine extends ArenaSquare {
    constructor(mysize = 0, color = "red", location) {
        super(mysize, color, location);
    }
}

class Wall extends inArena {
    //direction is a char n, s, e, w (cardinal direction);
    //mysize is 0 indexed, mysize = 5 implies a 6 unit wall.
    constructor(mysize, color = "white", startLoc, direction = 'n') {
        this.direction = direction;
        super(mysize, color, startLoc, lineInTheDirection());
    }
    
    //returns a function for occupied spaces of a line in direction = THIS.DIRECTION
    lineInTheDirection() {
        var changeX = 0;
        var changeY = 0;
        switch (this.direction) {
            case 'n':
                changeY = 1;
                break;
            case 's':
                changeY = -1;
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

class ArenaSquare extends inArena {
    constructor(mysize, color, location) {
        super(mysize, color, location, makeSquare);   
    }
    
    distanceTo(that) {
        return this.location.distanceTo(that.location) - this.mysize;
    }
    
    static makeSquare(mysize, startLoc) {
        var occupied = new Set();
        //methinks iteration will be more efficient then a
        //clunky tail recurisve implementation
        for (let i = mysize; i <= mysize; i++) {
            for (let j = -mysize; j <= mysize; j ++) {
                occupied.add(new Point(startLoc.x + i, startLoc.y + j));
            }
        }
        return occupied;
    }
}

class inArena {
    constructor(mysize, color, startLoc, occupiedFunc) {
        this.mysize = mysize;
        this.color = color;
        this.startLoc = startLoc;
        this.occupiedFunc = occupiedFunc;
        this.occupiedBlocks = occupiedBlocks();
    }
    
    isTouching(that) {
        return distanceTo(that) <= 0;
    }
    
    //very slow, brute force, but inclusive min-distance function
    distanceTo(that) {
        
        var minDistance = Number.MAX_VALUE;
        for (let thisBlock in this.occupiedBlocks()) {
            for (let thatBlock in that.occupiedBlocks()) {
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

class Tuple{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
    
    
    
    
    
    
    
    
    