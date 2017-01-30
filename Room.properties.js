Room.prototype.initialize = function(){
    //This function must be called before operations on rooms start.
    //It sets the roomObject global variable for this room
    if(!roomObjects[this.name] || Game.time%ROOM_RESET_TIMER == 0){
        roomObjects[this.name] = new roomObjectContainer(this.name);
    }
};

Object.defineProperty(Room.prototype, 'structures', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._structures){
            this._structures = {};
            for(let type in roomObjects[this.name].structures){
                this._structures[type] = roomObjects[this.name].structures[type].map((s) => Game.getObjectById(s));
            }
        }
        return this._structures;
    },
    set: function(value){
        this._structures = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'containers', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._containers){
            this._containers = {};
            for(let type in roomObjects[this.name].containers){
                this._containers[type] = roomObjects[this.name].containers[type].map((c) => Game.getObjectById(c));
            }
        }
        return this._containers;
    },
    set: function(value){
        this._containers = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'links', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._links){
            this._links = {};
            for(let type in roomObjects[this.name].links){
                this._links[type] = roomObjects[this.name].links[type].map((l) => Game.getObjectById(l));
            }
        }
        return this._links;
    },
    set: function(value){
        this._links = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'labs', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._labs){
            this._labs = {};
            for(let type in roomObjects[this.name].labs){
                this._labs[type] = roomObjects[this.name].labs[type].map((l) => Game.getObjectById(l));
            }
        }
        return this._labs;
    },
    set: function(value){
        this._labs = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'sources', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._sources){
            if(!this.memory.sources){
                this.memory.sources = this.find(FIND_SOURCES).map((s) => s.id);
            }
            this._sources = this.memory.sources.map((s) => Game.getObjectById(s));
        }
        return this._sources;
    },
    set: function(value){
        this._sources = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'mineral', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._mineral){
            if(!this.memory.mineral){
                this.memory.mineral = this.find(FIND_MINERALS).map((m) => m.id);
            }
            this._mineral = this.memory.mineral.map((m) => Game.getObjectById(m));
        }
        return this._mineral;
    },
    set: function(value){
        this._mineral = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'dropped', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._dropped){
            this._dropped = roomObjects[this.name].dropped.map((r) => Game.getObjectById(r));
        }
        return this._dropped;
    },
    set: function(value){
        this._dropped = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'allEnergyAvailable', {
    get: function() {
        if(this === Room.prototype || this == undefined){return}
        if(!this._allEnergyAvailable){
            
        }
        return this._allEnergyAvailable;
    },
    set: function(value) {
        this._allEnergyAvailable = value;
    }
});