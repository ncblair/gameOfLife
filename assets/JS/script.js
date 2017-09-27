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
    constructor(players, finishes) {
        
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
    
class Player extends ArenaElem {
    constructor(size, color, location) {
        super(size, color, location);
    }
    
    //velocity is a vector(TUPLE) representing change in location
    move(velocity) {
        location.x += velocity.x;
        location.y += velocity.y;
    }
}

class Finish extends ArenaElem {
    constructor(size = 2, color = "green", location) {
        super(size, color, location);
    }
}

class Landmine extends ArenaElem {
    constructor(size = 0, color = "red", location) {
        super(size, color, location);
    }
}

class ArenaElem {
    constructor(size, color, location) {
        this.size = size; //represents the distance from the center of the element
        //size = 1 is a 3x3 elem, size = n is a (1 + 2n)x(1 +2n) elem
        this.color = color;
        this.location = location;
    }
    isTouching(that) {
        for (let block in this.occupiedBlocks()) {
            if (that.occupiedBlocks().has(block)) {
                //they occupy the same block
                return true
            }
        }
        return false;
    }
    
    distanceTo(that) {
        return this.location.distanceTo(that.location);
    }
    
    occupiedBlocks() {
        var occupied = new Set();
        for (let i = -this.size; i <= this.size; i++) {
            for (let j = -this.size; j <= this.size; j ++) {
                occupied.add(new Point(this.location.x + i, this.location.y + j));
            }
        }
        return occupied;
    }
}

class Point extends Tuple{
    constructor(x, y) {
        super(x, y);
    }
    distanceTo(point) {
        return Math.sqrt((this.x - x)(this.x - x) + (this.y - y)(this.y -y));
    }
}

class Tuple{
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
    
    
    
    
    
    
    
    
    