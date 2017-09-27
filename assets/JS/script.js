var doc = $(document);
var wndo = $(window);
doc.ready(function() {
    
});




/*Abstract Classes*/

/*States and StateMachine*/
//Manage different states of my application
class StateMachine {
    constructor(states = new Set([])) {
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
    constructor(size = 1, color = "blue", location) {
        super(size, color, location);
    }
    
}

class Villain extends Player {
    constructor(size = 1, color = "gray", location) {
        super(size, color, location);
    }
}
    
class Player extends ArenaSquare {
    constructor(size, color, location) {
        super(size, color, location);
    }
    
    //velocity is a vector(TUPLE) representing change in location
    move(velocity) {
        location.x += velocity.x;
        location.y += velocity.y;
    }
}

class Finish extends ArenaSquare {
    constructor(size = 2, color = "green", location) {
        super(size, color, location);
    }
}

class Landmine extends ArenaSquare {
    constructor(size = 0, color = "red", location) {
        super(size, color, location);
    }
}

class Wall extends inArena {
    //direction is a char n, s, e, w (cardinal direction);
    constructor(size, color = "white", startLoc, direction = 'n') {
        this.direction = direction;
        super(size, color, startLoc, lineInTheDirection());
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
        var makeLine = function(size, startLoc) {
            var occupied = new Set();
            var i;
            for (i = 0; i < size; i++) {
                occupied.add(new Point(startLoc.x + changeX, startLoc.y + changeY));
            }
            return occupied;
        }
        
        return makeLine;
    }
}

class ArenaSquare extends inArena {
    constructor(size, color, location) {
        super(size, color, location, makeSquare);   
    }
    
    distanceTo(that) {
        return this.location.distanceTo(that.location) - this.size;
    }
    
    static makeSquare(siz, startLoc) {
        var occupied = new Set();
        for (let i = siz; i <= siz; i++) {
            for (let j = -siz; j <= siz; j ++) {
                occupied.add(new Point(startLoc.x + i, startLoc.y + j));
            }
        }
        return occupied;
    }
}

class inArena {
    constructor(size, color, startLoc, occupiedFunc) {
        this.size = size;
        this.color = color;
        this.startLoc = startLoc;
        this.occupiedFunc = occupiedFunc;
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
        return this.occupiedFunc(this.size, this.startLoc);
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
    
    
    
    
    
    
    
    
    