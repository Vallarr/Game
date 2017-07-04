Room.prototype.initialize = function(){
    //This function must be called before operations on rooms start.
    //It sets the roomObject global variable for this room
    if(!roomObjects[this.name] || Game.time%ROOM_RESET_TIMER == 0){
        //console.log('Initialize roomObjectContainer for room ' + this.name);
        roomObjects[this.name] = new roomObjectContainer(this.name);
    }
};

Object.defineProperty(Room.prototype, 'structures', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._structures){
            this._structures = {};
            for(let type in roomObjects[this.name].structures){
                //this._structures[type] = roomObjects[this.name].structures[type].map((s) => Game.getObjectById(s));
                this._structures[type] = util.getArrayObjectsById(roomObjects[this.name].structures[type]);
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

Object.defineProperty(Room.prototype, 'dmgStructures', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._dmgStructures){
            this._dmgStructures = util.getArrayObjectsById(roomObjects[this.name].dmgStructures);
        }
        return this._dmgStructures;
    },
    set: function(value){
        this._dmgStructures = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'criticalRepairs', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._criticalRepairs){
            this._criticalRepairs = util.getArrayObjectsById(roomObjects[this.name].criticalRepairs);
        }
        return this._criticalRepairs;
    },
    set: function(value){
        this._criticalRepairs = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'containers', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._containers || this._containers === {}){
            this._containers = {};
            for(let type in roomObjects[this.name].containers){
                this._containers[type] = util.getArrayObjectsById(roomObjects[this.name].containers[type]);
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
        if(!this._links || this._links === {}){
            this._links = {};
            for(let type in roomObjects[this.name].links){
                //this._links[type] = roomObjects[this.name].links[type].map((l) => Game.getObjectById(l));
                this._links[type] = util.getArrayObjectsById(roomObjects[this.name].links[type]);
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
        if(!this._labs || this._labs === {}){
            this._labs = {};
            for(let type in roomObjects[this.name].labs){
                this._labs[type] = util.getArrayObjectsById(roomObjects[this.name].labs[type]);
                //Check if creeps have to be boosted
                let nBoosts = 0;
                if(this.memory.prepBoosts){
                    for(let boost in this.memory.prepBoosts){
                        nBoosts++;
                    }
                }
                if(nBoosts == 0){
                    delete this.memory.prepBoosts;
                }
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

Object.defineProperty(Room.prototype, 'ramparts', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._ramparts){
            let ramparts = util.gatherObjectsInArray(this.structures,STRUCTURE_RAMPART);
            this._ramparts = util.classifyRamparts(ramparts,this.creeps.hostiles);
        }
        return this._ramparts;
    },
    set: function(value){
        this._ramparts = value;
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
            //this._dropped = roomObjects[this.name].dropped.map((r) => Game.getObjectById(r));
            this._dropped = util.getArrayObjectsById(roomObjects[this.name].dropped);
        }
        return this._dropped;
    },
    set: function(value){
        this._dropped = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'creeps', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._creeps){
            this._creeps = {};
            this._creeps.all = this.find(FIND_CREEPS);
            let hostiles = this._creeps.all.filter((c) => !c.my && !ALLIES[c.owner.username]);
            this._creeps.hostiles = util.classifyCreeps(hostiles);
            this._creeps.my = this._creeps.all.filter((c) => c.my);
            this._creeps.allies = util.findArrayOfDifferentElements(this._creeps.all, hostiles.concat(this._creeps.my));
        }
        return this._creeps;
    },
    set: function(value){
        this._creeps = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'toFill', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._toFill){
            this._toFill = util.gatherObjectsInArray(this.structures,STRUCTURE_SPAWN,STRUCTURE_EXTENSION).filter((e) => e.energy < e.energyCapacity);
        }
        return this._toFill;
    },
    set: function(value){
        this._toFill = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'CostMatrix', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._CostMatrix){
            let costs = roomObjects[this.name].baseCostMatrix.clone();
            this.creeps.all.forEach((c) => {
                if(!c.my && !ALLIES[c.owner.username]){
                    for(let i=-4; i<5; i++){
                        for(let j=-4; j<5; j++){
                            costs.set(c.pos.x+i,c.pos.y+j,0xff);
                        }
                    }
                }
                else if(ALLIES[c.owner.username]){
                    costs.set(c.pos.x,c.pos.y,0xff);
                }
            });
            this._CostMatrix = costs;
        }
        return this._CostMatrix;
    },
    set: function(value){
        this._CostMatrix = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'CombatCostMatrix', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._CombatCostMatrix){
            if(!Memory.rooms[this.name].defense.underAttack){
                this._CombatCostMatrix = this.CostMatrix;
            }
            else {
                let costs = roomObjects[this.name].baseCostMatrix.clone();
                this.creeps.all.forEach((c) => {
                    if(!c.my){
                        costs.set(c.pos.x, c.pos.y, 0xff);
                    }
                });
                this._CombatCostMatrix = costs;
            }
        }
        return this._CombatCostMatrix;
    },
    set: function(value){
        this._CombatCostMatrix = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'UpgraderCostMatrix', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._UpgraderCostMatrix){
            this._UpgraderCostMatrix = this.CostMatrix.clone();
            if(this.storage && this.terminal){
                for(let i=-1; i<2; i++){
                    for(let j=-1; j<2; j++){
                        let pos = new RoomPosition(this.storage.pos.x+i,this.storage.pos.y+j,this.name);
                        if(this.terminal.pos.inRangeTo(pos,1)){
                            this._UpgraderCostMatrix.set(pos.x,pos.y,0xff);
                        }
                    }
                }
            }
        }
        return this._UpgraderCostMatrix;
    },
    set: function(value){
        this._UpgraderCostMatrix = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'hasActiveOrders', {
    //Property which tells whether there are still active order
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._hasActiveOrders){
            this._hasActiveOrders = false;
            let orders;
            if(this.memory.orders){
                orders = this.memory.orders;
            }
            else {orders = {}}
            for(let order in orders){
                this._hasActiveOrders = this._hasActiveOrders || orders[order] != 0;
                if(this._hasActiveOrders){break}
            }
        }
        return this._hasActiveOrders;
    },
    set: function(value){
        this._hasActiveOrders = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'isHighWay', {
    get: function() {
        if(this === Room.prototype || this == undefined){return}
        if(!this._isHighWay){
            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(this.name);
            this._isHighWay = (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
        }
        return this._isHighWay;
    },
    set: function(value){
        this._isHighWay = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'isSK', {
    get: function() {
        if(this === Room.prototype || this == undefined){return}
        if(!this._isSK){
            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(this.name);
            this._isSK = (parsed[1] % 10 >= 4) && (parsed[1] % 10 <= 6) && (parsed[2] % 10 >=4) && (parsed[2] % 10 <= 6);
        }
        return this._isSK;
    },
    set: function(value){
        this._isSK = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'reservingRooms', {
    get: function() {
        if(this === Room.prototype || this == undefined){return}
        if(!this._reservingRooms){
            if(!this.memory.resRooms){
                this.memory.resRooms = [];
            }
            //Do a check on rooms to see whether they still need extra reserving
            this.memory.resRooms = _.filter(this.memory.resRooms, (r) => {
                let room = Game.rooms[r];
                if(!room){return false} //Rooms without active creeps are not reserved
                return !room.controller.owner && (!room.controller.reservation || room.controller.reservation.ticksToEnd < CONTROLLER_RESERVE_OK);
            });
            this._reservingRooms = this.memory.resRooms;
        }
        return this._reservingRooms;
    },
    set: function(value){
        this._reservingRooms = value;
        this.memory.resRooms = value;
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
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Room.prototype, 'mineralsInRoom', {
    //Create object containing all available minerals in room in all containers, labs and storage (Not terminal, because these minerals are 'in between' rooms).
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._mineralsInRoom){
            this._mineralsInRoom = {};
            let containers = util.gatherObjectsInArray(this.structures,STRUCTURE_CONTAINER);
            for(let i=0; i<containers.length; i++){
                for(let min in containers[i].store){
                    if(min != RESOURCE_ENERGY){
                        if(this._mineralsInRoom[min]){
                            this._mineralsInRoom[min] += containers[i].store[min];
                        }
                        else {
                            this._mineralsInRoom[min] = containers[i].store[min];
                        }
                    }
                }
            }
            let labs = util.gatherObjectsInArray(this.structures,STRUCTURE_LAB);
            for(let i=0; i<labs.length; i++){
                let min = labs[i].mineralType;
                if(min){
                    if(this._mineralsInRoom[min]){
                        this._mineralsInRoom[min] += labs[i].mineralAmount;
                    }
                    else {
                        this._mineralsInRoom[min] = labs[i].mineralAmount;
                    }
                }
            }
            let storage = this.storage;
            if(storage){
                for(let min in storage.store){
                    if(this._mineralsInRoom[min]){
                        this._mineralsInRoom[min] += storage.store[min];
                    }
                    else {
                        this._mineralsInRoom[min] = storage.store[min];
                    }
                }
            }
        }
        return this._mineralsInRoom;
    },
    set: function(value){
        this._mineralsInRoom = value;
    },
    enumerable: false,
    configurable: true
});

Room.prototype.availableResources = function(options){
    //Search for containers/links/dropped etc which still contain resources that have not been targeted
    if(options == undefined){
        //If not specified: will get energy from anywhere
        options = {resourceType: RESOURCE_ENERGY, storage: true, terminal: true, dropped: true, containers: ['source','spawn','upgrader','mineral'], links: ['storage','source','upgrader','spawn'], labs: ['source','target','boost']};
    }
    else if(!options.resourceType){
        //default resource is energy
        options.resourceType = RESOURCE_ENERGY;
    }
    if(!options.amount){
        //Of no amount is specified -> will get all targets with at least 1 resource available
        options.amount = 1;
    }
    let resourceType;
    if(options.resourceType != RESOURCE_ANY){
        resourceType = options.resourceType;
    }
    
    let available = [];
    
    if(options.terminal && this.terminal && resourceType && ((GCL_FARM[this.name] && resourceType == RESOURCE_ENERGY && this.terminal.store[RESOURCE_ENERGY] >= options.amount) || (this.memory.orders && this.memory.orders[resourceType] <= -options.amount && this.terminal.available[resourceType] >= options.amount))){
        available.push(this.terminal);
    }

    if(options.storage && this.storage && ((resourceType && this.storage.available[resourceType] >= options.amount) || (!resourceType && _.sum(this.storage.available) >= options.amount))){
        available.push(this.storage);
    }
    
    if(options.links){
        let links = [];
        for(let i=0; i<options.links.length; i++){
            Array.prototype.push.apply(links,util.gatherObjectsInArray(this.links,options.links[i]));
            //links = links.concat(util.gatherObjectsInArray(this.links,options.links[i]));
        }
        let linkAmount = Math.pow((1-LINK_LOSS_RATIO),4) * LINK_CAPACITY;
        for(let i=0; i<links.length; i++){
            if((resourceType && links[i].available[resourceType] >= Math.min(linkAmount,options.amount)) || (!resourceType && _.sum(links[i].available) >= Math.min(linkAmount,options.amount))){
                available.push(links[i]);
            }
        }
    }
    
    if(options.containers){
        let containers = [];
        for(let i=0; i<options.containers.length; i++){
            Array.prototype.push.apply(containers,util.gatherObjectsInArray(this.containers,options.containers[i]));
            //containers = containers.concat(util.gatherObjectsInArray(this.containers,options.containers[i]));
        }
        for(let i=0; i<containers.length; i++){
            if((resourceType && containers[i].available[resourceType] >= options.amount) || (!resourceType && _.sum(containers[i].available) >= options.amount)){
                available.push(containers[i]);
            }
        }
    }
    
    if(options.labs){
        let labs = [];
        for(let i=0; i<options.labs.length; i++){
            Array.prototype.push.apply(labs,util.gatherObjectsInArray(this.labs,options.labs[i]));
            //labs = labs.concat(util.gatherObjectsInArray(this.labs,options.labs[i]));
        }
        for(let i=0; i<labs.length; i++){
            if((resourceType && labs[i].available[resourceType] >= options.amount) || (!resourceType && _.sum(labs[i].available) >= options.amount)){
                available.push(labs[i]);
            }
        }
    }
    
    if(options.dropped){
        if(options.nWork == undefined){
            potions.nWork = 5;
        }
        for(let i=0; i<this.dropped.length; i++){
            let harvestPower;
            if(this.dropped[i].resourceType == RESOURCE_ENERGY){
                harvestPower = HARVEST_POWER;
            } else {
                harvestPower = HARVEST_MINERAL_POWER;
            }
            /*
            if(this.name == 'W10N6'){
                console.log(this.name + ' available in ' + this.dropped[i]);
            }//*/
            let resourceAmount = options.nWork * harvestPower * Math.ceil(Math.sqrt(Math.pow(options.pos.x-this.dropped[i].pos.x,2) + Math.pow(options.pos.y-this.dropped[i].pos.y,2)));
            /*
            if(this.name == 'W10N6'){
                console.log('Amoutn ' + resourceAmount + ' av ' + this.dropped[i].available[resourceType]);
            }//*/
            if((resourceType && this.dropped[i].available[resourceType] >= resourceAmount) || (!resourceType && _.sum(this.dropped[i].available) >= resourceAmount)){
                available.push(this.dropped[i]);
            }
        }
    }
    
    /*if(this.memory.defense.underAttack){
        //Check if path is not obstructed by hostiles
        for(i=0; i<available.length; i++){
            if(!available[i].pos.accessible){
                availavle.slice(i,1);
                i--;
            }
        }
        
    }*/
    
    return available;
};

Room.prototype.availableStorage = function(options){
    if(options == undefined){
        //Default options: will store resources anywhere
        options = {storage: true, terminal: true, towers: true, spawnsAndExtensions: true, containers: ['source','upgrader','mineral','spawn'], links: ['source','spawn','storage','upgrader'], labs: ['source','target','boost']};
    }
    
    if(!options.amount){
        //Of no amount s specified -> will get all targets which can hold at least 1 more resource
        options.amount = 1;
    }
    if(!options.carry){
        //Need to know what creep is carrying
        return [];
    }
    
    let resources = [];
    for(let resource in options.carry){
        if(options.carry[resource] > 0){
            resources.push(resource);
        }
    }
    
    let available = [];
    
    if(options.terminal && this.terminal && this.memory.orders && this.memory.orders[resources[0]] >= Math.min(options.carry[resources[0]],options.amount) && this.terminal.storeCapacity - _.sum(this.terminal.store) - _.sum(this.terminal.inTransit) >= Math.min(options.carry[resources[0]],options.amount)){
        available.push(this.terminal);
    }
    
    if(options.storage && this.storage && this.storage.storeCapacity - _.sum(this.storage.store) - _.sum(this.storage.inTransit) >= options.amount){
        available.push(this.storage);
    }
    
    if(options.containers){
        let containers = [];
        for(let i=0; i<options.containers.length; i++){
            Array.prototype.push.apply(containers,util.gatherObjectsInArray(this.containers,options.containers[i]));
            //containers = containers.concat(util.gatherObjectsInArray(this.containers,options.containers[i]));
        }
        for(let i=0; i<containers.length; i++){
            if(containers[i].storeCapacity - _.sum(containers[i].store) - _.sum(containers[i].inTransit) >= options.amount){
                available.push(containers[i]);
            }
        }
    }
    
    if(options.links && resources.indexOf(RESOURCE_ENERGY) != -1){
        let links = [];
        for(let i=0; i<options.links.length; i++){
            Array.prototype.push.apply(links,util.gatherObjectsInArray(this.links,options.links[i]));
            //links = links.concat(util.gatherObjectsInArray(this.links,options.links[i]));
        }
        let linkAmount = Math.pow((1-LINK_LOSS_RATIO),4) * LINK_CAPACITY;
        for(let i=0; i<links.length; i++){
            let inTransit = links[i].inTransit[RESOURCE_ENERGY] || 0;
            if(links[i].energyCapacity - links[i].energy - inTransit >= Math.min(linkAmount,options.amount)){
                available.push(links[i]);
            }
        }
    }
    
    if(options.labs){
        let labs = [];
        for(let i=0; i<options.labs.length; i++){
            Array.prototype.push.apply(labs,util.gatherObjectsInArray(this.labs,options.labs[i]));
            //labs = labs.concat(util.gatherObjectsInArray(this.labs,options.labs[i]));
        }
        for(let i=0; i<labs.length; i++){
            let energyIntransit = labs[i].inTransit[RESOURCE_ENERGY] || 0;
            let mineralsInTransit = 0;
            if(labs[i].mineralType){mineralsInTransit = labs[i].inTransit[labs[i].mineralType] || 0}
            if(resources.indexOf(RESOURCE_ENERGY) != -1 && labs[i].energyCapacity - labs[i].energy - energyIntransit >= Math.min(options.carry[RESOURCE_ENERGY],options.amount)){
                available.push(labs[i]);
            }
            else if((!labs[i].mineralType || (labs[i].mineralType && resources.indexOf(labs[i].mineralType) != -1)) && labs[i].mineralCapacity - labs[i].mineralAmount - mineralsInTransit >= Math.min(options.carry[labs[i].mineralType],options.amount)){
                available.push(labs[i]);
            }
        }
    }
    
    if(options.towers){
        let towers = util.gatherObjectsInArray(this.structures,STRUCTURE_TOWER).filter((t) => t.energyCapacity - t.energy - t.inTransit[RESOURCE_ENERGY] >= options.amount);
        Array.prototype.push.apply(available,towers);
        //available = available.concat(towers);
    }
    
    if(options.spawnsAndExtensions){
        Array.prototype.push.apply(available,this.toFill.filter((e) => e.energyCapacity - e.energy - _.sum(e.inTransit[RESOURCE_ENERGY]) > 0));
        //available = available.concat(this.toFill);
    }
    
    return available;
};

Room.prototype.findExtPath = function(){
    let start;
    let spawnLinks = util.gatherObjectsInArray(this.links,'spawn');
    if(spawnLinks.length){
        start = spawnLinks[0];
    }
    else {
        let spawnContainers = util.gatherObjectsInArray(this.containers,'spawn');
        if(spawnContainers.length){
            start = spawnContainers[0];
        }
        else {
            let spawns = util.gatherObjectsInArray(this.structures,STRUCTURE_SPAWN);
            if(spawns.length){
                start = spawns[0];
            }
            else {
                return ERR_NOT_FOUND;
            }
        }
    }
    
    let maxIterations = 100;
    let it=0;
    let path = [];
    let optNextStep = start.pos.walkableNeighborPositions;
    let prevStep;
    let nextStep;
    
    while(it<maxIterations){
        //console.log('OptionalNextSteps ' + optNextStep);
        it++;
        prevStep = nextStep;
        if(!optNextStep.length){
            return ERR_NOT_FOUND;
        }
        let maxExt;
        for(let i=0; i<optNextStep.length; i++){
            nExt = util.gatherObjectsInArray(optNextStep[i].adjacentStructures,STRUCTURE_SPAWN,STRUCTURE_EXTENSION).length;
            //console.log('Extensions and spawns near ' + optNextStep[i] + ' ' + nExt);
            if(!maxExt || nExt > maxExt){
                maxExt = nExt;
                nextStep = optNextStep[i];
            }
        }
        //console.log('Next step is ' + nextStep);
        if(path[0] && nextStep.x === path[0].x && nextStep.y === path[0].y && nextStep.roomName === path[0].roomName){
            //Path has been completed
            //console.log('Found path');
            path.push(new RoomPosition(nextStep.x,nextStep.y,nextStep.roomName));
            return path;
        }
        path.push(new RoomPosition(nextStep.x,nextStep.y,nextStep.roomName));
        optNextStep = nextStep.walkableNeighborPositions.filter((p) => prevStep == undefined || p.x !== prevStep.x || p.y !== prevStep.y || p.roomName !== prevStep.roomName);
    }
    //console.log('Max iterations reached ' + path);
    return ERR_NOT_FOUND;
};

Room.prototype.nonLinearDistance = function(roomName){
    let coordThis = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(this.name);
    let coordTarget = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
    return Math.abs(coordThis[1] - coordTarget[1]) + Math.abs(coordThis[2] - coordTarget[2]);
};