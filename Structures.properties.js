Structure.prototype.correctAvailableIfTargeted = function(targetName){
    if(util.targOfCreeps[targetName] && util.targOfCreeps[targetName][this.id]){
        let targeting = util.targOfCreeps[targetName][this.id];
        for(let i=0; i<targeting.length; i++){
            let creep = targeting[i];
            if(creep.memory.collecting){
                let resourceType;
                if(creep.memory.resourceType){
                    resourceType = creep.memory.resourceType;
                }
                else {
                    resourceType = RESOURCE_ANY;
                }
                if(!this._available){let dummy = this.available}
                if(resourceType == RESOURCE_ANY){
                    let amount = creep.carryCapacity - _.sum(creep.carry);
                    let withdraw;
                    for(let resource in this._available){
                        withdraw = Math.min(this._available[resource],amount);
                        this._available[resource] -= withdraw;
                        amount -= withdraw;
                        if(amount <= 0){break}
                    }
                }
                else {
                    this._available[resourceType] -= creep.carryCapacity - _.sum(creep.carry);
                }
            }
        }
    }
};

Resource.prototype.correctAvailableIfTargeted = function(targetName){
    if(util.targOfCreeps[targetName] && util.targOfCreeps[targetName][this.id]){
        let targeting = util.targOfCreeps[targetName][this.id];
        for(let i=0; i<targeting.length; i++){
            let creep = targeting[i];
            if(creep.memory.collecting){
                let resourceType;
                if(creep.memory.resourceType){
                    resourceType = creep.memory.resourceType;
                }
                else {
                    resourceType = RESOURCE_ANY;
                }
                if(!this._available){let dummy = this.available}
                if(resourceType == RESOURCE_ANY){
                    let amount = creep.carryCapacity - _.sum(creep.carry);
                    let withdraw;
                    for(let resource in this._available){
                        withdraw = Math.min(this._available[resource],amount);
                        this._available[resource] -= withdraw;
                        amount -= withdraw;
                        if(amount <= 0){break}
                    }
                }
                else {
                    this._available[resourceType] -= creep.carryCapacity - _.sum(creep.carry);
                }
            }
        }
    }
};

Structure.prototype.correctAvailableForNewTarget = function(creep){
    //Correct available resources for creep that has just targeted structure
    let resourceType;
    if(creep.memory.resourceType){
        resourceType = creep.memory.resourceType;
    }
    else {
        resourceType = RESOURCE_ANY;
    }
    if(!this._available){let dummy = this.available}
    if(resourceType == RESOURCE_ANY){
        let amount = creep.carryCapacity - _.sum(creep.carry);
        let withdraw;
        for(let resource in this._available){
            withdraw = Math.min(this._available[resource],amount);
            this._available[resource] -= withdraw;
            amount -= withdraw;
            if(amount <= 0){break}
        }
    }
    else {
        this._available[resourceType] -= creep.carryCapacity - _.sum(creep.carry);
    }
};

Resource.prototype.correctAvailableForNewTarget = function(creep){
    //Correct available resources for creep that has just targeted structure
    let resourceType;
    if(creep.memory.resourceType){
        resourceType = creep.memory.resourceType;
    }
    else {
        resourceType = RESOURCE_ANY;
    }
    if(!this._available){let dummy = this.available}
    if(resourceType == RESOURCE_ANY){
        let amount = creep.carryCapacity - _.sum(creep.carry);
        let withdraw;
        for(let resource in this._available){
            withdraw = Math.min(this._available[resource],amount);
            this._available[resource] -= withdraw;
            amount -= withdraw;
            if(amount <= 0){break}
        }
    }
    else {
        this._available[resourceType] -= creep.carryCapacity - _.sum(creep.carry);
    }
};

Structure.prototype.correctInTransitForNewTarget = function(creep){
    //Correct resources in transit for creep that has jsut targeted structure
    for(let resource in creep.carry){
        if(this._inTransit){
            this._inTransit[resource] += creep.carry[resource];
        }
        else {
            this.inTransit[resource] += creep.carry[resource];
        }
        
    }
    
};

Object.defineProperty(Structure.prototype, 'inTransit', {
    get: function(){
        if(this === Structure.prototype || this == undefined){return}
        if(!this._inTransit){
            this._inTransit = {[RESOURCE_ENERGY]: 0};
            if(util.targOfCreeps['targetContainer'] && util.targOfCreeps['targetContainer'][this.id]){
                let targeting = util.targOfCreeps['targetContainer'][this.id];
                for(let i=0; i<targeting.length; i++){
                    let creep = targeting[i];
                    if(!creep.memory.collecting){
                        for(let resource in creep.carry){
                            if(this._inTransit[resource]){
                                this._inTransit[resource] += creep.carry[resource];
                            }
                            else {
                                this._inTransit[resource] = creep.carry[resource];
                            }
                        }
                    }
                }
            }
        }
        return this._inTransit;
    },
    set: function(value){
        this._inTransit = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(StructureStorage.prototype, 'available', {
    get: function(){
        if(this === StructureStorage.prototype || this == undefined){return}
        if(!this._available){
            this._available = {};
            for(let resource in this.store){
                this._available[resource] = this.store[resource];
                if(this.store[resource] && this.room.memory.orders && this.room.memory.orders[resource] > 0){
                    //Resources have been designated to terminal
                    this._available[resource] -= this.room.memory.orders[resource];
                }
            }
            this.correctAvailableIfTargeted('targetContainer');
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
                if(this.store[resource] && this.room.memory.orders && this.room.memory.orders[resource] < 0){
                    //Resource can be remove from terminal
                    this._available[resource] = Math.min(this.store[resource],Math.abs(this.room.memory.orders[resource]));
                }
            }
            this.correctAvailableIfTargeted('targetContainer');
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
            this.correctAvailableIfTargeted('targetContainer');
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
            this.correctAvailableIfTargeted('targetContainer');
        }
        return this._available;
    },
    set: function(value){
        this._available = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(StructureLab.prototype, 'available', {
    get: function(){
        if(this === StructureLab.prototype || this == undefined){return}
        if(!this._available){
            this._available = {[this.mineralType]: this.mineralAmount};
            this.correctAvailableIfTargeted('targetContainer');
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
            this._available = {[this.resourceType]: this.amount};
            this.correctAvailableIfTargeted('getDropped');
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