Object.defineProperty(StructureStorage.prototype, 'available', {
    get: function(){
        if(this === StructureStorage.prototype || this == undefined){return}
        if(!this._available){
            this._available = {};
            for(let resource in this.store){
                this._available[resource] = this.store[resource];
            }
            if(Game.targetsOfCreeps['targetContainer'] && Game.targetsOfCreeps['targetContainer'][this.id]){
                let targeting = Game.targetsOfCreeps['targetContainer'][this.id];
                for(let i=0; i<targeting.length; i++){
                    let creep = Game.creeps[targeting[i]];
                    let resourceType;
                    if(creep.memory.resourceType){
                        resourceType = creep.memory.resourceType;
                    }
                    else {
                        resourceType = RESOURCE_ENERGY;
                    }
                    this._available[resourceType] -= creep.carryCapacity - _.sum(creep.carry);
                }
            }
        }
        return this._available;
    },
    set: function(value){
        this._available = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(StructureTerminal.prototype, 'available', {
    get: function(){
        if(this === StructureTerminal.prototype || this == undefined){return}
        if(!this._available){
            this._available = {};
            for(let resource in this.store){
                this._available[resource] = this.store[resource];
            }
            if(Game.targetsOfCreeps['targetContainer'] && Game.targetsOfCreeps['targetContainer'][this.id]){
                let targeting = Game.targetsOfCreeps['targetContainer'][this.id];
                for(let i=0; i<targeting.length; i++){
                    let creep = Game.creeps[targeting[i]];
                    let resourceType;
                    if(creep.memory.resourceType){
                        resourceType = creep.memory.resourceType;
                    }
                    else {
                        resourceType = RESOURCE_ENERGY;
                    }
                    this._available[resourceType] -= creep.carryCapacity - _.sum(creep.carry);
                }
            }
        }
        return this._available;
    },
    set: function(value){
        this._available = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(StructureContainer.prototype, 'available', {
    get: function(){
        if(this === StructureContainer.prototype || this == undefined){return}
        if(!this._available){
            this._available = {};
            for(let resource in this.store){
                this._available[resource] = this.store[resource];
            }
            if(Game.targetsOfCreeps['targetContainer'] && Game.targetsOfCreeps['targetContainer'][this.id]){
                let targeting = Game.targetsOfCreeps['targetContainer'][this.id];
                for(let i=0; i<targeting.length; i++){
                    let creep = Game.creeps[targeting[i]];
                    let resourceType;
                    if(creep.memory.resourceType){
                        resourceType = creep.memory.resourceType;
                    }
                    else {
                        resourceType = RESOURCE_ENERGY;
                    }
                    this._available[resourceType] -= creep.carryCapacity - _.sum(creep.carry);
                }
            }
        }
        return this._available;
    },
    set: function(value){
        this._available = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(StructureLink.prototype, 'available', {
    get: function(){
        if(this === StructureLink.prototype || this == undefined){return}
        if(!this._available){
            this._available = {[RESOURCE_ENERGY]: this.energy};
            if(Game.targetsOfCreeps['targetContainer'] && Game.targetsOfCreeps['targetContainer'][this.id]){
                let targeting = Game.targetsOfCreeps['targetContainer'][this.id];
                for(let i=0; i<targeting.length; i++){
                    let creep = Game.creeps[targeting[i]];
                    let resourceType;
                    if(creep.memory.resourceType){
                        resourceType = creep.memory.resourceType;
                    }
                    else {
                        resourceType = RESOURCE_ENERGY;
                    }
                    this._available[resourceType] -= creep.carryCapacity - _.sum(creep.carry);
                }
            }
        }
        return this._available;
    },
    set: function(value){
        this._available = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Resource.prototype, 'available', {
    get: function(){
        if(this === Resource.prototype || this == undefined){return}
        if(!this._available){
            this._available = {[RESOURCE_ENERGY]: this.energy};
            if(Game.targetsOfCreeps['getDropped'] && Game.targetsOfCreeps['getDropped'][this.id]){
                let targeting = Game.targetsOfCreeps['getDropped'][this.id];
                for(let i=0; i<targeting.length; i++){
                    let creep = Game.creeps[targeting[i]];
                    let resourceType;
                    if(creep.memory.resourceType){
                        resourceType = creep.memory.resourceType;
                    }
                    else {
                        resourceType = this.resourceType;
                    }
                    this._available[resourceType] -= creep.carryCapacity - _.sum(creep.carry);
                }
            }
        }
        return this._available;
    },
    set: function(value){
        this._available = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Structure.prototype, 'hasRampart', {
    get: function(){
        if(this === Structure.prototype || this == undefined){return}
        if(!this._hasRampart){
            let struct = this.pos.lookFor(LOOK_STRUCTURES);
            this._hasRampart = false;
            for(let i=0; i<struct.length; i++){
                if(struct[i].structureType == STRUCTURE_RAMPART){this._hasRampart = true};
            }
        }
        return this._hasRampart;
    },
    set: function(value){
        this._hasRampart = value;
    },
    enumerable: false,
    configurable: true
});