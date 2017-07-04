Creep.prototype.dropResource = function(resourceType){
    if(resourceType == undefined){
        //Drop anything
        for(let resource in this.carry){
            if(this.drop(resource) == OK){
                return OK;
            }
        }
        return ERR_INVALID_ARGS;
    }
    else {
        this.drop(resourceType);
    }
};

Creep.prototype.harvestSource = function(sources){
    if(sources == undefined){
        sources = this.room.sources.filter((source) => source.energy > 0);
    }
    else if(!Array.isArray(sources)){
        sources = [sources];
    }
    if(!sources.length){
        return ERR_NOT_FOUND;
    }    
    let source = this.moveTo(sources,1);
    if(source != OK && source != ERR_NOT_FOUND){
        return this.harvest(source);
    }
    if(source < 0){
        return source;
    }
    else {
        return 1;
    }
};

Creep.prototype.handleTargets = function(){
    //Make sure creep is in the same room as the target
    //console.log(this.name + ' in ' + this.room.name + ' handling targets');
    if(this.memory.targetRoom && this.room.name != this.memory.targetRoom){
        this.moveToRoom(this.memory.targetRoom);
        //console.log(this.name + ' in ' + this.room.name + ' move to targetroom ' + this.memory.targetRoom);
        return true;
    }
    if(this.memory.collecting){
        //Get resources from target
        if(this.memory.getDropped){
            let resource = Game.getObjectById(this.memory.getDropped);
            //console.log(this.name + ' in ' + this.room.name + 'getting dropped ' + resource);
            if(!resource || (resource && this.collectDroppedResource(resource.resourceType,resource) != 1)){
                delete this.memory.getDropped;
                delete this.memory.targetRoom;
            }
            return true;
        }
        else if(this.memory.targetContainer){
            let targetContainer = Game.getObjectById(this.memory.targetContainer);
            let rtn;
            //console.log(this.name + ' in ' + this.room.name + ' getting container ' + targetContainer);
            if(!targetContainer || (targetContainer && (rtn=this.withdrawResource(targetContainer,this.memory.resourceType)) != 1)){
                if(rtn == OK && targetContainer.structureType == STRUCTURE_TERMINAL){
                    targetContainer.room.memory.orders[this.memory.resourceType] += this.carryCapacity - _.sum(this.carry);
                }
                delete this.memory.targetContainer;
                delete this.memory.resourceType;
                delete this.memory.targetRoom;
            }
            return true;
        }
    }
    else if(this.memory.targetContainer){
        //Store resources in target
        let targetContainer = Game.getObjectById(this.memory.targetContainer);
        let rtn;
        //console.log(this.name + ' in ' + this.room.name + ' storing container ' + targetContainer);
        if(!targetContainer || (targetContainer && (rtn=this.transferResources(targetContainer)) != 1)){
            if(rtn == OK && targetContainer.structureType == STRUCTURE_TERMINAL){
                targetContainer.room.memory.orders[this.firstResource] -= this.carry[this.firstResource];
            }
            delete this.memory.targetContainer;
            delete this.memory.targetRoom;
        }
        return true;
    }
    return false;
};

Creep.prototype.getResource = function(options){
    //Collect resources. Resource type and locations to search for resource are specified in options
    //Resource type can be 'any', in which case the creep will get any resource
    //console.log(this.name + ' in ' + this.room.name + ' getResource');
    if(options == undefined){
        //If not specified: will get energy from anywhere
        options = {resourceType: RESOURCE_ENERGY, storage: true, terminal: true, dropped: true, containers: ['source','spawn','upgrader','mineral'], links: ['storage','source','upgrader','spawn'], labs: ['source','target','boost']};
    }
    else if(!options.resourceType){
        //default resource is energy
        options.resourceType = RESOURCE_ENERGY;
    }
    let resourceType;
    if(options.resourceType != RESOURCE_ANY){
        resourceType = options.resourceType;
    }
    
    let targetRooms;
    if(options.targetRooms){
        targetRooms = options.targetRooms;
    }
    else {
        targetRooms = this.targetRooms;
    }
    
    if(options.amount == undefined){
        options.amount = this.carryCapacity - _.sum(this.carry);
    }
    options.nWork = Math.max(5,this.getActiveBodyparts(WORK));
    options.pos = this.pos;
    
    let available = [];
    let darkRooms = [];
    for(let i=0; i<targetRooms.length; i++){
        let room = Game.rooms[targetRooms[i]];
        if(room){
            //available = available.concat(room.availableResources(options));
            Array.prototype.push.apply(available,room.availableResources(options));
            /*
            if(this.name == 'transporter-8417'){
                console.log(this.name + ' in ' + this.room.name + ' available in ' + room.name + ' ' + available);
            }//*/
        }
        else {
            darkRooms.push(targetRooms[i]);
        }
    }
    let target;
    if(this.room.memory.defense.underAttack && available.length){
        target = this.moveTo(available,1,true);
    }
    if(target == OK || target == ERR_NOT_FOUND || !this.room.memory.defense.underAttack){
        target = this.pos.closestByRange(available,1);
    }
    //console.log(this.name + ' in ' + this.room.name + ' target to get ' + target);
    if(target){
        let rtn;
        if(target.structureType && (rtn=this.withdrawResource([target],resourceType)) != OK){
            this.memory.targetRoom = target.pos.roomName;
            this.memory.targetContainer = target.id;
            this.memory.resourceType = resourceType;
        }
        else if(target.structureType == STRUCTURE_TERMINAL && rtn == OK){
            this.room.memory.orders[resourceType] += this.carryCapacity - _.sum(this.carry);
        }
        else if(target.resourceType && this.collectDroppedResource(target.resourceType,[target]) != OK){
            this.memory.targetRoom = target.pos.roomName;
            this.memory.getDropped = target.id;
        }
        target.correctAvailableForNewTarget(this);
        return 1;
    }
    else if(darkRooms.length){
        this.moveToRoom(darkRooms[0]);
        return 1;
    }
    
    return ERR_NOT_FOUND;
};

Creep.prototype.storeResource = function(options){
    //Store resource that creep is currently carrying. Targets are specified in options
    //console.log(this.name + ' in ' + this.room.name + ' storeResource');
    if(options == undefined){
        //Default options: will store resources anywhere
        options = {storage: true, terminal: true, towers: true, spawnsAndExtensions: true, containers: ['source','upgrader','mineral','spawn'], links: ['source','spawn','storage','upgrader'], labs: ['source','target','boost']};
    }
    if(options.carry == undefined){
        options.carry = this.carry;
    }
    let targetRooms;
    if(options.targetRooms){
        targetRooms = options.targetRooms;
    }
    else {
        targetRooms = this.targetRooms;
    }
    
    if(options.amount == undefined){
        options.amount = _.sum(this.carry);
    }
    
    let available = [];
    let darkRooms = [];
    for(let i=0; i<targetRooms.length; i++){
        let room = Game.rooms[targetRooms[i]];
        if(room){
            //available = available.concat(room.availableStorage(options));
            if(!available.length){
                available = room.availableStorage(options);
            }
            else {
                Array.prototype.push.apply(available,room.availableStorage(options));
            }
            /*if(this.name == 'sender-4026'){
                console.log(this.name + ' in ' + this.room.name + ' available in room ' + room.name + ' ' + available);
            }*/
        }
        else {
            darkRooms.push(targetRooms[i]);
        }
    }

    let target = this.pos.closestByRange(available,1);
    //console.log(this.name + ' in ' + this.room.name + ' storing in target ' + target);
    if(target){
        if(this.transferResources([target]) != OK){
            this.memory.targetRoom = target.pos.roomName;
            this.memory.targetContainer = target.id;
        }
        else if(target.structureType == STRUCTURE_TERMINAL){
            this.room.memory.orders[this.firstResource] -= this.carry[this.firstResource];
        }
        target.correctInTransitForNewTarget(this);
        return 1;
    }
    else if(darkRooms.length){
        this.moveToRoom(darkRooms[0]);
        return 1;
    }
    
    return ERR_NOT_FOUND;
};

Creep.prototype.harvestContainer = function(containers){
    if(containers == undefined){
        containers = util.gatherObjectsInArray(this.room.containers,'source','upgrader','storage').filter((c) => c.store[RESOURCE_ENERGY] > 0);
    }
    else if(!Array.isArray(containers)){
        containers = [containers];
    }
    if(!containers.length){
        return ERR_NOT_FOUND;
    }    
    return this.withdrawResource(containers,RESOURCE_ENERGY);
};

Creep.prototype.harvestStorage = function(storage){
    if(storage == undefined){
        if(this.room.storage){
            storage = [this.room.storage].filter((stor) => {return stor.store[RESOURCE_ENERGY] > 0});
        }
        else {
            return ERR_NOT_FOUND;
        }
    }
    else if(!Array.isArray(storage)){
        storage = [storage];
    }
    if(!storage.length){
        return ERR_NOT_FOUND;
    }
    return this.withdrawResource(storage,RESOURCE_ENERGY);
};

Creep.prototype.withdrawResource = function(targets,resourceType,amount){
    if(targets == undefined){
        return ERR_NOT_FOUND;
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    if(!targets.length){
        return ERR_NOT_FOUND;
    }
    let targ = this.moveTo(targets,1);
    //console.log('Withdrawing from ' + targ);
    if(targ != OK && targ != ERR_NOT_FOUND){
        if(resourceType == undefined){
            if(targ.structureType == STRUCTURE_SPAWN || targ.structureType == STRUCTURE_EXTENSION || targ.structureType == STRUCTURE_LINK){
                resourceType = RESOURCE_ENERGY;
            }
            else if(targ.structureType == STRUCTURE_LAB){
                resourceType = targ.mineralType;
            }
            else {
                for(let resource in targ.store){
                    if(targ.store[resource]){
                        resourceType = resource;
                        break;
                    }
                }
            }
        }
        if(amount == undefined){
            amount = this.carryCapacity - _.sum(this.carry);
        }
        if(targ.structureType == STRUCTURE_CONTAINER || targ.structureType == STRUCTURE_STORAGE){
            amount = Math.min(amount,targ.store[resourceType]);
        }
        else if(targ.structureType == STRUCTURE_LAB){
            amount = Math.min(amount,targ.mineralAmount);
        }
        else {
            amount = Math.min(amount,targ[resourceType]);
        }
        //if(this.memory.role == 'filler') {console.log('Target ' + targ + ' resourceType ' + resourceType +' amount ' + amount)}
        return this.withdraw(targ,resourceType,amount);
    }
    if(targ < 0){
        return targ;
    }
    else {
        return 1;
    }
};

Creep.prototype.collectDroppedResource = function(resourceType, resource){
    let res = undefined;
    if(resource == undefined){
        if(this.memory.getDropped){
            res = [Game.getObjectById(this.memory.getDropped)];
            if(res[0] == undefined){
                delete this.memory.getDropped;
                return ERR_NOT_FOUND;
            }
        }
        else {
            if(resourceType == undefined){
                resource = util.gatherObjectsInArray(this.room,'dropped');
            }
            else {
                resource = util.gatherObjectsInArray(this.room,'dropped').filter((resource) => {return resource.resourceType == resourceType});
            }
            resource = resource.filter((rs) => {
                let resourceHarvestPower = HARVEST_POWER;
                if(rs.resourceType != RESOURCE_ENERGY){
                    resourceHarvestPower = HARVEST_MINERAL_POWER;
                }
                return rs.amount > Math.max(5,this.body.filter(function(bP){ return bP.type == WORK}).length) * resourceHarvestPower * Math.ceil(Math.sqrt(Math.pow(this.pos.x-rs.pos.x,2) + Math.pow(this.pos.y-rs.pos.y,2)));
            });
            if(!resource.length){return ERR_NOT_FOUND}
            
            let targetedResources = util.targetObjectsOfCreeps('getDropped',this.room);
            let notTargetedResources = util.findArrayOfDifferentElements(resource,targetedResources);
            res = this.pos.closestByRange(notTargetedResources);
            if(res){
                this.memory.getDropped = res.id;
                res = [res];
            } 
            else {
                return ERR_NOT_FOUND;
            }
        }
    }
    else if(!Array.isArray(resource)){
        res = [resource];
    }
    else {
        res = resource;
    }
    if(!res.length){
        return ERR_NOT_FOUND;
    }
    //if(this.name == 'Scarlett'){console.log(this.name + ' getting dropped resource ' + res)}
    
    res = this.moveTo(res,1);
    if(res != OK && res != ERR_NOT_FOUND){
        delete this.memory.getDropped;
        return this.pickup(res);
    }
    else if(res == ERR_NOT_FOUND){
        delete this.memory.getDropped;
    }
    if(res < 0){
        return res;
    }
    else {
        return 1;
    }
};

Creep.prototype.fillSpawn = function(targets){
    if(targets == undefined){
        targets = this.pos.closestByRange(this.room.toFill,1);
    }
    return this.transferResources(targets,RESOURCE_ENERGY);
};

Creep.prototype.fillContainer = function(targets){
    if(targets == undefined){
        targets = util.gatherObjectsInArray(this.room.containers).filter((c) => _.sum(c.store) < c.storeCapacity);
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    return this.transferResources(targets,RESOURCE_ENERGY);
};

Creep.prototype.fillTower = function(towers){
    if(towers == undefined){
        towers = util.gatherObjectsInArray(this.room.structures,STRUCTURE_TOWER).filter((t) => t.energy < t.energyCapacity);
    }
    else if(!Array.isArray(towers)){
        towers = [towers];
    }
    return this.transferResources(towers,RESOURCE_ENERGY);
};

Creep.prototype.fillStorage = function(targets){
    if(targets == undefined){
        if(this.room.storage){
            targets = [this.room.storage].filter((stor) => _.sum(stor.store) < stor.storeCapacity);
        }
        else {
            return ERR_NOT_FOUND;
        }
    }
    else if(!Array.isArray(targets)){
        targets = [targets]
    }
    return this.transferResources(targets);
};

Creep.prototype.transferResources = function(targets,resourceType){

    if(resourceType == undefined){
        //See what kind of resource creep is carrying
        for(let resource in this.carry){
            if(this.carry[resource]){
                resourceType = resource;
                break;
            }
        }
    }
    if(targets == undefined){
        return ERR_NOT_FOUND;
    }
    else if(!Array.isArray(targets)){
        targets = [targets];            
    }
    if(!targets.length){
        return ERR_NOT_FOUND;
    }

    let target = this.moveTo(targets,1);
    if(target != OK && target != ERR_NOT_FOUND){
        return this.transfer(target,resourceType);
    }
    if(target < 0){
        return target;
    }
    else {
        return 1;
    }
};

Creep.prototype.completeOrders = function(){
    let roomOrders = this.room.memory.orders;
    if(roomOrders && this.room.terminal){
        for(let resource in roomOrders){
            let amount = roomOrders[resource];
            if(amount == 0){
                continue;
            }
            else if(amount > 0){
                let storeResource = util.gatherObjectsInArray(this.room.containers,'source','mineral','storage').filter((c) => c.store[resource] > 0);
                if(!storeResource.length){
                    continue;
                }
                let withdrawAmount = Math.min(this.carryCapacity,amount);
                let rtn = this.withdrawResource(storeResource,resource,withdrawAmount);
                if(rtn == OK){
                    if(!transitioned[this.room.name]){
                        this.room.memory.orders[resource] = amount - withdrawAmount; //For new get and storeResource methods, this line has to be removed
                        this.memory.getting = false;
                    }
                    this.memory.targetContainer = this.room.terminal.id;
                    return;
                }
                else if(rtn != ERR_NOT_FOUND){
                    return;
                }    	                            
            }
            else {
                amount = Math.abs(amount);
                let terminal = [this.room.terminal].filter((term) => {return term.store[resource] > 0});
                if(!terminal.length){
                    continue;
                }
                let withdrawAmount = Math.min(this.carryCapacity,amount,terminal[0].store[resource]);
                let rtn = this.withdrawResource(terminal,resource,withdrawAmount);
                if(rtn == OK){
                    this.room.memory.orders[resource] += withdrawAmount;
                    return;
                }
                else if(rtn != ERR_NOT_FOUND){
                    return;
                }
            }
        }
    }
    return ERR_NOT_FOUND;
};

Creep.prototype.supplyLabs = function(){
    if((!this.room.memory.boosts && !this.room.memory.prepBoosts) || !this.room.labs){
        return ERR_NOT_FOUND;
    }
    let sourceLabs = util.gatherObjectsInArray(this.room.labs,'source');
    let targetLabs = util.gatherObjectsInArray(this.room.labs,'target');
    let boostLabs = util.gatherObjectsInArray(this.room.labs,'boost');
    if(sourceLabs.length != 2 || targetLabs.length < 1){
        //Not the right amount of labs to perform reaction
        return ERR_NOT_FOUND;
    }
    let targeted = util.targetObjectsOfCreeps('targetContainer',this.room);
    
    if(this.room.memory.prepBoosts){
        //Get required boosts
        let boosts = [];
        for(let boost in this.room.memory.prepBoosts){
            boosts.push(boost);
        }
        
        //Labs that have not been targeted
        boostLabs = util.findArrayOfDifferentElements(boostLabs,targeted);
        
        if(fillLabs(boostLabs,boosts,this) == OK){
            return;
        }
        
        //Supply boostLabs with energy
        for(let i=0; i<boostLabs.length; i++){
            if(boostLabs[i].energyCapacity - boostLabs[i].energy >= this.carryCapacity || boostLabs[i].energy < MAX_CREEP_SIZE * LAB_BOOST_ENERGY){
                let storeEnergy = util.gatherObjectsInArray(this.room.containers,'storage').filter((c) => c.store[RESOURCE_ENERGY] > 0);
                if(storeEnergy.length){
                    let withdrawAmount = Math.min(this.carryCapacity,storeEnergy[0].store[RESOURCE_ENERGY]);
                    if(this.withdrawResource(storeEnergy,RESOURCE_ENERGY,withdrawAmount) == OK){
                        this.memory.getting = false;
                        this.memory.targetContainer = boostLabs[i].id;
                    }
                }
                else {
                    continue;
                }
                return;
            }
        }
    }
    if(!this.room.memory.boosts || this.room.memory.boosts.length == 0){
        //Empty labs
        for(let i=0; i<sourceLabs.length; i++){
            if(sourceLabs[i].mineralAmount > 0){
                this.memory.getting = true;
                this.memory.targetContainer = sourceLabs[i].id;
                return;
            }
        }
        for(let i=0; i<targetLabs.length; i++){
            if(targetLabs[i].mineralAmount > 0){
                this.memory.getting = true;
                this.memory.targetContainer = targetLabs[i].id;
                return;
            }
        }
        return ERR_NOT_FOUND;
    }
    else {
        //Get reagents
        let reagents = [];
        for(let i=0; i<this.room.memory.boosts[0].reagents.length; i++){
            reagents.push(this.room.memory.boosts[0].reagents[i]);
        }
        
        //Labs that have not been targeted
        sourceLabs = util.findArrayOfDifferentElements(sourceLabs,targeted);
        
        if(fillLabs(sourceLabs,reagents,this) == OK){
            return;
        }
        
        //Look for target labs that contain wrong type of boosts and have to be emptied
        targetLabs = util.findArrayOfDifferentElements(targetLabs,targeted);
        for(let i=0; i<targetLabs.length; i++){
            if(targetLabs[i].mineralType && targetLabs[i].mineralType != this.room.memory.boosts[0].type){
                this.memory.getting = true;
                this.memory.targetContainer = targetLabs[i].id;
                return;
            }
        }
    }

    return ERR_NOT_FOUND;
    
    function fillLabs(labs,minerals,creep){
        let emptyLabs = [];
        let labsWithMinerals = {};
        let mineralsInLabs = [];
        
        //Look for labs with wrong minerals
        for(let i=0; i<labs.length; i++){
            let found = false; //Found lab which can contain or allready contains minerals
            for(let j=0; j<minerals.length && !found; j++){
                if(minerals[j] == labs[i].mineralType){
                    labsWithMinerals[minerals[j]] = labs[i];
                    mineralsInLabs.push(minerals.splice(j,1));
                    j--;
                    found = true;
                }
                else if(!labs[i].mineralType){
                    emptyLabs.push(labs[i]);
                    found = true;
                }
            }
            if(!found){
                //This lab contains wrong resource -> empty it
                creep.memory.targetContainer = labs[i].id;
                creep.memory.getting = true;
                return OK;
            }
        }
        minerals = minerals.concat(mineralsInLabs);
        
        //Look for labs that have to be filled
        for(let i=0; i<minerals.length; i++){
            let targetLab;
            if(labsWithMinerals[minerals[i]] && labsWithMinerals[minerals[i]].mineralCapacity - labsWithMinerals[minerals[i]].mineralAmount >= creep.carryCapacity){
                targetLab = labsWithMinerals[minerals[i]];
            }
            else if(!labsWithMinerals[minerals[i]] && emptyLabs.length){
                targetLab = emptyLabs.shift();
            }
            if(targetLab){
                let storeResource = util.gatherObjectsInArray(creep.room.containers,'source','mineral','storage').filter((c) => c.store[minerals[i]] > 0);
                let target = creep.pos.closestByRange(storeResource);
                if(target){
                    let withdrawAmount = Math.min(creep.carryCapacity,target.store[minerals[i]]);
                    if(creep.withdrawResource([target],minerals[i].toString(),withdrawAmount) == OK){
                        creep.memory.getting = false;
                        creep.memory.targetContainer = targetLab.id;
                    }
                }
                else {
                    continue;
                }
                return OK;
            }
        }
        return ERR_NOT_FOUND;
    }
    
};

Creep.prototype.supplyNuker = function(){
    let nuker = util.gatherObjectsInArray(this.room.structures, STRUCTURE_NUKER);
    if(!this.room.memory.fillNuker || nuker.length == 0){
        return ERR_NOT_FOUND;
    }
    nuker = nuker[0];
    //Supply energy
    if(nuker.energy < nuker.energyCapacity && this.room.storage && this.room.storage.store[RESOURCE_ENERGY]){
        if(this.withdrawResource([this.room.storage],RESOURCE_ENERGY) == OK){
            this.memory.getting = false;
            this.memory.targetContainer = nuker.id;
            return OK;
        }
        return 1;
    }
    
    //Supply Ghodium
    if(nuker.ghodium < nuker.ghodiumCapacity && this.room.storage && this.room.storage.store[RESOURCE_GHODIUM]){
        if(this.withdrawResource([this.room.storage],RESOURCE_GHODIUM) == OK){
            this.memory.getting = false;
            this.memory.targetContainer = nuker.id;
            return OK;
        }
        return 1;
    }
    
    if(nuker.energy == nuker.energyCapacity && nuker.ghodium == nuker.ghodiumCapacity){
        delete this.room.memory.fillNuker;
    }
    return ERR_NOT_FOUND;
};

Creep.prototype.supplyPowerSpawn = function(){
    let powerSpawn = util.gatherObjectsInArray(this.room.structures,STRUCTURE_POWER_SPAWN)[0];
    if(powerSpawn){
        //Supply power
        if(powerSpawn.power < 0.1 * powerSpawn.powerCapacity && this.room.storage && this.room.storage.available[RESOURCE_POWER] > 0){
            if(this.withdrawResource([this.room.storage],RESOURCE_POWER, powerSpawn.powerCapacity) == OK){
                this.memory.getting = false;
                this.memory.targetContainer = powerSpawn.id;
                return OK;
            }
            return 1;
        }
        
        //Supply energy
        if(powerSpawn.energyCapacity - powerSpawn.energy >= this.carryCapacity && this.room.storage && this.room.storage.available[RESOURCE_ENERGY] > 0){
            if(this.withdrawResource([this.room.storage], RESOURCE_ENERGY) == OK){
                this.memory.getting = false;
                this.memory.targetContainer = powerSpawn.id;
                return OK;
            }
            return 1;
        }
    }
    return ERR_NOT_FOUND
};

Creep.prototype.repairWall = function(hitFrac, targets){
    if(hitFrac == undefined){
        hitFrac = 1.0/10000; 
    }
    if(targets == undefined){
        targets = this.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_WALL && structure.hits < hitFrac * structure.hitsMax;
            }
        });
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    return this.repairStructure(hitFrac, targets);
    
}

Creep.prototype.repairStructure = function(hitFrac,targets){
    if(hitFrac == undefined){
        hitFrac = 1.0/Math.pow(10.0,(1.0/2.0*this.room.controller.level));
        //console.log(hitFrac);
    }
    if(targets == undefined){
        targets = util.getArrayObjectsById(this.room.memory.dmgStructures);
        //console.log(targets);
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    if(!targets.length){
        return ERR_NOT_FOUND;
    }
    let target = this.moveTo(targets,3);
    if(!(target == OK || target == ERR_NOT_FOUND)){
        return this.repair(target);
    }
    if(target < 0){
        return target;
    }
    else {
        return 1;
    }
};

Creep.prototype.buildStructure = function(targets){
    if(targets == undefined){
        targets = this.room.find(FIND_CONSTRUCTION_SITES);
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    if(!targets.length){
        return ERR_NOT_FOUND;
    }
    let target = this.moveTo(targets,3);
    if(!(target == OK || target == ERR_NOT_FOUND)){
        return this.build(target);
    }
    if(target < 0){
        return target;
    }
    else {
        return 1;
    }
};

Creep.prototype.upgrade = function(){
    var targets = [this.room.controller];
    if(!targets.length){
        return ERR_NOT_FOUND;
    }
    let target = this.moveTo(targets,3);
    if(!(target == OK || target == ERR_NOT_FOUND)){
        return this.upgradeController(target);
    }
    if(target < 0){
        return target;
    }
    else {
        return 1;
    }
};

Creep.prototype.meleeAttack = function(hostiles){
    if(hostiles == undefined){
        hostiles = this.room.find(FIND_HOSTILE_CREEPS);
    }
    else if(!Array.isArray(hostiles)){
        hostiles = [hostiles];
    }
    if(!hostiles.length){
        return ERR_NOT_FOUND;
    }
    let hostile = this.moveTo(hostiles,1);
    if(!(hostile == OK || hostile == ERR_NOT_FOUND)){
        return this.attack(hostile);
    }
    if(hostile < 0){
        return hostile;
    }
    else {
        return 1;
    }
};

Creep.prototype.rangeAttack = function(hostiles){
    if(hostiles == undefined){
        hostiles = this.room.find(FIND_HOSTILE_CREEPS);
    }
    else if(!Array.isArray(hostiles)){
        hostiles = [hostiles];
    }
    if(!hostiles.length){
        return ERR_NOT_FOUND;
    }
    let hostile = this.moveTo(hostiles,3);
    if(!(hostile == OK || hostile == ERR_NOT_FOUND)){
        return this.rangedAttack(hostile);
    }
    if(hostile < 0){
        return hostile;
    }
    else {
        return 1;
    }
};

Creep.prototype.combat = function(hostiles,healIfNoHostiles){
    if(healIfNoHostiles == undefined){
        healIfNoHostiles = true;
    }
    if(hostiles == undefined){
        hostiles = util.gatherObjectsInArray(this.room.creeps.hostiles,'heal','meleeHeal','hybrid','rangedHeal','melee','meleeRanged','ranged','claim','other');
    }
    else if(!Array.isArray(hostiles)){
        hostiles = [hostiles];
    }
    if(!hostiles.length){
        if(healIfNoHostiles){this.healCreeps()}
        return ERR_NOT_FOUND;
    }

    let hostile;
    let rtnRanged;
    if(this.getActiveBodyparts(RANGED_ATTACK)){
        hostile = this.moveTo(hostiles,3);
        if(hostile != OK && hostile != ERR_NOT_FOUND){
            rtnRanged = this.rangedAttack(hostile); //Range attacked
        }
        else if(hostile == OK){
            rtnRanged = 1; //Moved
        }
        else {
            rtnRanged = hostile; //No (path to) hostile found
        }
    }
    let rtnAttack;
    if(this.getActiveBodyparts(ATTACK)){
        hostile = this.moveTo(hostiles,1);
        if(hostile != OK && hostile != ERR_NOT_FOUND){
            this.move(this.pos.getDirectionTo(hostile)); // Move towards hostile in case it moves away
            rtnAttack = this.attack(hostile);
        }
        else {
            //Did no melee attack
            if(rtnRanged === OK){
                //Did ranged attack -> only close heal and don't move
                this.stationaryHeal(1);
            }
            if(hostile === OK){
                rtnAttack = 1; //Moved -> don't run off
                if(rtnRanged !== OK){
                    //Did no ranged attack -> any heal
                    this.stationaryHeal();
                }
            }
            else {
                rtnAttack = hostile; //No hostile found, can possibly still move
                if(rtnRanged === 1){
                    //Moved towards target -> don't run away, but can be any heal
                    this.stationaryHeal();
                }
                else {
                    //No hostile found
                    this.healCreeps();
                }
            }
        }        
    }
    else {
        if(rtnRanged === OK){
            //Did ranged attack -> only close heal and don't move
            this.stationaryHeal(1);
        }
        else if(rtnRanged === 1){
            //Moved towards target -> don't run away, but can be any heal
            this.stationaryHeal();
        }
        else {
            //No hostile found
            this.healCreeps();
        }
    }
    return Math.max(rtnRanged,rtnAttack);
};

Creep.prototype.stationaryCombat = function(hostiles,healIfNoHostiles){
    if(this.getActiveBodyparts(ATTACK) == 0 && this.getActiveBodyparts(RANGED_ATTACK) == 0 && this.getActiveBodyparts(HEAL) == 0) {return}
    if(healIfNoHostiles == undefined){
        healIfNoHostiles = true;
    }
    if(hostiles == undefined){
        hostiles = util.gatherObjectsInArray(this.room.creeps.hostiles,'heal','meleeHeal','hybrid','rangedHeal','melee','meleeRanged','ranged','claim','other');
    }
    else if(!Array.isArray(hostiles)){
        hostiles = [hostiles];
    }
    if(!hostiles.length){
        if(healIfNoHostiles){this.stationaryHeal()}
        return ERR_NOT_FOUND;
    }
    
    let hostile;
    let rtnRanged;    
    if(this.getActiveBodyparts(RANGED_ATTACK)){
        hostile = util.targetsInRange(hostiles,[this],3);
        if(hostile.length){
            this.rangedAttack(hostile[0]);
            rtnRanged = OK;
        }
        else {
            rtnRanged = ERR_NOT_FOUND;
        }        
    }
    else {
        rtnRanged = ERR_NOT_FOUND;
    }
    
    let rtnAttack;
    if(this.getActiveBodyparts(ATTACK)){
        hostile = util.targetsInRange(hostiles,[this],1);
        if(hostile.length){
            //console.log(this.name + 'attack');
            this.attack(hostile[0]);
            rtnAttack = OK;
        }
        else {
            rtnAttack = ERR_NOT_FOUND;
            if(rtnRanged !== OK){
                //Did no ranged attack -> can do any heal
                this.stationaryHeal();
            }
            else {
                //Did ranged attack -> can only do close heal
                this.stationaryHeal(1);
            }
        }        
    }
    else {
        rtnAttack = ERR_NOT_FOUND;
        if(rtnRanged !== OK){
            //Did no ranged attack -> can do any heal
            this.stationaryHeal();
        }
        else {
            //Did ranged attack -> can only do close heal
            this.stationaryHeal(1);
        }
        this.stationaryHeal();
    }

    return Math.max(rtnRanged,rtnAttack);
};

Creep.prototype.healOther = function(targets){
    if(!this.getActiveBodyparts(HEAL)){
        return ERR_NOT_FOUND;
    }
    if(targets == undefined){
        targets = util.gatherObjectsInArray(this.room.creeps,'my','allies').filter((c) => c !== this && c.hits < c.hitsMax);
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    if(!targets.length){
        return ERR_NOT_FOUND;
    }
    let target = this.moveTo(targets,3);
    let rtn = undefined;
    if(target != OK && target != ERR_NOT_FOUND){
        rtn = this.rangedHeal(target);
    }
    target = this.moveTo(targets,1);
    if(target != OK && target != ERR_NOT_FOUND){
        rtn = this.heal(target);
    }
    if(rtn != undefined){
        return rtn;
    }
    else {
        return 1;
    }
};

Creep.prototype.healCreeps = function(targets){
    if(!this.getActiveBodyparts(HEAL)){return ERR_NO_BODYPART}
    if(targets == undefined){
        //If no targets are specified: heal self 1st if needed
        if(this.hitsMax - this.hits >= this.healPower){
            return this.heal(this);
        }
        targets = util.gatherObjectsInArray(this.room.creeps,'my','allies').filter((c) => c !== this && c.hits < c.hitsMax);
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    if(!targets.length){
        //If no targets available, heal self if possible
        if(this.hitsMax - this.hits >= 0){
            return this.heal(this);
        }
        return ERR_NOT_FOUND;
    }
    
    let target = this.moveTo(targets,3);
    let rtn;
    if(target != OK && target != ERR_NOT_FOUND){
        rtn = this.rangedHeal(target);
    }
    target = this.moveTo(targets,1);
    if(target != OK && target != ERR_NOT_FOUND){
        rtn = this.heal(target);
    }
    
    if(rtn){
        //Healed other creep
        return rtn;
    }
    else {
        //If non of the targets are within range, heal self if possible
        if(this.hitsMax - this.hits >= 0){
            return this.heal(this);
        }
        return 1;
    }
};

Creep.prototype.stationaryHeal = function(maxRange, targets){
    if(!this.getActiveBodyparts(HEAL)){return ERR_NO_BODYPART}
    if(maxRange == undefined){
        maxRange = 3;
    }
    if(targets == undefined){
        //If no targets are specified: heal self 1st if needed
        if(this.hitsMax - this.hits >= this.healPower){
            return this.heal(this);
        }
        targets = util.gatherObjectsInArray(this.room.creeps,'my','allies').filter((c) => c !== this && c.hits < c.hitsMax);
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    if(!targets.length){
        //If no targets available, heal self if possible
        if(this.hitsMax - this.hits >= 0){
            return this.heal(this);
        }
        return ERR_NOT_FOUND;
    }
    
    let range = 0;
    let found = false;
    while(!found && range < maxRange){
        range++;
        let inRange = util.targetsInRange(targets,[this],range);
        let mostDmg = util.findExtremum(inRange,(a,b) => a.hitsMax - a.hits > b.hitsMax - b.hits);
        if(mostDmg){
            found = true;
            if(range == 1){
                return this.heal(mostDmg);
            }
            else {
                return this.rangedHeal(mostDmg);
            }
        }
    }
    //If non of the targets are within range, heal self if possible
    if(this.hitsMax - this.hits >= 0){
        return this.heal(this);
    }
    return ERR_NOT_FOUND;
};

Creep.prototype.goToRallyPoint = function(){
    let rallyPoint = this.memory.rallyPoint;
    if(!rallyPoint){
        for(let name in Game.flags){
            let flag = Game.flags[name];
            if(flag.color == COLOR_WHITE && flag.secondaryColor == this.memory.color){
                rallyPoint = flag.pos;
                this.memory.rallyPoint = flag.pos;
            }
        }
    }
    if(rallyPoint){
        let rtn = this.moveTo([{pos: rallyPoint}],1);
        if(rtn < 0){
            return rtn;
        }
        else if(rtn === OK){
            return 1;
        }
        else {
            return OK;
        }
    }
    return ERR_NOT_FOUND
};

Creep.prototype.rallyHealers = function(){
    if(this.goToRallyPoint() == OK){
        let rallyPoint = this.memory.rallyPoint;
        let lookForCreeps = this.room.lookForAtArea(LOOK_CREEPS,rallyPoint.y-1,rallyPoint.x-1,rallyPoint.y+1,rallyPoint.x+1,true);
        let healersAtRally = [];
        for(let i=0; i<lookForCreeps.length; i++){
            let creep = lookForCreeps[i].creep;
            if(creep.memory.type == this.memory.type && creep.memory.role.includes('healer')){
                healersAtRally.push(creep);
            }
        }
        if(healersAtRally.length >= this.memory.nHealers){
            let followers = healersAtRally.slice(0,this.memory.nHealers);
            this.memory.followers = util.gatherIdsInArrayFromObjects(followers);
            for(let i=0; i<followers.length; i++){
                followers[i].memory.leader = this.id;
                delete followers[i].memory.rallyPoint;
            }
            delete this.memory.nHealers;
            delete this.memory.rallyPoint;
        }
    }
};

Creep.prototype.occupyRampart = function(ramparts){
    if(ramparts == undefined){
        //Check if creep is already in rampart
        let structAtCreep = this.room.lookForAt(LOOK_STRUCTURES,this.pos);
        let creepInRampart = _.filter(structAtCreep, function(structure){
            return structure.structureType == STRUCTURE_RAMPART
        }).length;
        if(!creepInRampart){
            ramparts = this.room.find(FIND_MY_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_RAMPART &&
                        !structure.room.lookForAt(LOOK_CREEPS,structure.pos).length
                }
            });
        }
        else {
            return OK;
        }
    }
    else if(!Array.isArray(ramparts)){
        ramparts = [ramparts];
    }
    if(!ramparts.length){
        return ERR_NOT_FOUND;
    }
    let rampart = this.moveTo(ramparts,0);
    if(!(rampart == OK || rampart == ERR_NOT_FOUND)){
        return OK;
    }
    if(rampart < 0){
        return rampart;
    }
    else {
        return 1;
    }
}

Creep.prototype.reserve = function(controllers){
    if(controllers == undefined || !controllers.length){
        return ERR_NOT_FOUND;
    }
    else if(!Array.isArray(controllers)){
        controllers = [controllers];
    }
    let controller = this.moveTo(controllers,1);
    //console.log(this.creep.name + ' controller ' + controller);    
    if(controller != OK && controller != ERR_NOT_FOUND){
        return this.reserveController(controller);
    }
    if(controller < 0){
        return controller;
    }
    else {
        return 1;
    }
};

Creep.prototype.claim = function(controllers){
    if(controllers == undefined || !controllers.length){
        return ERR_NOT_FOUND;
    }
    else if(!Array.isArray(controllers)){
        controllers = [controllers];
    }
    let controller = this.moveTo(controllers,1);
    if(!(controller == OK || controller == ERR_NOT_FOUND)){
        return this.claimController(controller);
    }
    if(controller < 0){
        return controller;
    }
    else {
        return 1;
    }
};

Creep.prototype.downgradeController = function(controllers){
    if(controllers == undefined || !controllers.length){
        return ERR_NOT_FOUND
    }
    else if(!Array.isArray(controllers)){
        controllers = [controllers];
    }
    let controller = this.moveTo(controllers,1);
    if(controller != OK && controller != ERR_NOT_FOUND){
        return this.attackController(controller);
    }
    if(controller < 0){
        return controller;
    }
    else {
        return 1;
    }
};

Creep.prototype.dismantleStructure = function(struct){
    if(struct == undefined){
        return ERR_NOT_FOUND;
    }
    else if(!Array.isArray(struct)){
        struct = [struct];
    }
    if(!struct.length){
        return ERR_NOT_FOUND;
    }

    let st = this.moveTo(struct,1);
    if(st != OK && st != ERR_NOT_FOUND){
        return this.dismantle(st);
    }
    if(st <0){
        return st;
    }
    else {
        return 1;
    }
};

Creep.prototype.moveTo = function(targets,rangeTarget,rtnTarget) {
     //Check whether creep is already in range
     for(let i=0; i<targets.length; i++){
         if(this.pos.inRangeTo(targets[i].pos,rangeTarget)){
            return targets[i];
         }
     }
     
     //If no targets are within range, search for path to nearest target
     let endPos;
     if(!this.fatigue || rtnTarget){
         let goals = [];
         for(let i=0; i<targets.length;i++){
             goals.push({pos: targets[i].pos, range: rangeTarget})
         }
         
         let maxOperations = 2000;
         let allowedRooms = undefined;
         if(this.memory.type == 'starter' || this.memory.type == 'rescuer' || this.memory.type == 'attacker'){
             //console.log(this.name + ' bigger moves');
             maxOperations = 20000;
         }
         if(Game.map.getRoomLinearDistance(this.room.name,targets[0].pos.roomName) > 2){
             allowedRooms = this.findAllowedRooms(targets[0].pos.roomName);
             maxOperations = 10000;
             //console.log(this.name + ' going from ' + this.room.name + ' to  ' + targets[0].pos.roomName + ' via ' + JSON.stringify(allowedRooms));
         }
         
         let costPlain = Math.max(1,Math.min(Math.ceil(this.fatigueRatio),2));
         let costSwamp = Math.max(1,Math.min(Math.ceil(CONSTRUCTION_COST_ROAD_SWAMP_RATIO * this.fatigueRatio),2 * CONSTRUCTION_COST_ROAD_SWAMP_RATIO));
         
         //from Documentation
         let res = PathFinder.search(this.pos, goals,
         {
             plainCost: costPlain,
             swampCost: costSwamp,
             maxOps: maxOperations,
             roomCallback: (roomName) => {
                 if(allowedRooms) {
                     if(!allowedRooms[roomName]){return false}
                 }
                 let room = Game.rooms[roomName];
                 if(!room) return;
                 if(room.memory.defense.underAttack && (this.memory.type == 'attacker' || this.memory.role == 'melee' || this.memory.role == 'ranged' || this.memory.role == 'hybrid' || this.memory.role == 'patroller' || this.memory.role == 'patrollerRanged' || this.memory.role == 'combat')){
                     let costs = room.CombatCostMatrix;
                     //console.log(this.name + ' type ' + this.memory.type + ' role ' + this.memory.role);
                     if(costs){
                         //console.log(this.name + ' targets ' + targets + ' roomName ' + roomName);
                         return costs;
                     }
                 }
                 if(GCL_FARM[room.name] && this.memory.role == 'upgrader'){
                     return room.UpgraderCostMatrix;
                 }
                 return room.CostMatrix;
             },
         });
        
        let path;
        if(!res.incomplete){endPos = res.path[res.path.length-1]}
        if(res.path.length<50 && (this.memory.role == 'melee' || this.memory.role == 'ranged' || this.memory.role == 'hybrid' || this.memory.role == 'patroller' || this.memory.role == 'patrollerRanged' || this.memory.role == 'combat')){
            path = res.path.splice(0,Math.ceil((res.path.length+1)/2));
        }
        else {
            path = res.path;
        }
         if(res.incomplete && res.path.length<50){
             //console.log(this.name + ' ' + JSON.stringify(res.path.length));
             return ERR_NOT_FOUND;
         }
         
         
         if(!path.length){
             //Not in range but no path happens if on edge between 2 rooms. Try to get closer.
             //onsole.log(this.name + ' no path ' + rangeTarget);
             if(rangeTarget == 0){
                 return ERR_INVALID_ARGS;
             }
             if(rangeTarget >= 3){
                 //console.log(this.name);
                 return this.moveTo(targets,rangeTarget-2)
             }
             else {
                 return this.moveTo(targets,rangeTarget-1);
             }
         }
        
        let nextStep = path.shift();
        if(this.move(this.pos.getDirectionTo(nextStep)) == OK){
            let room = Game.rooms[nextStep.roomName];
            if(room){
                room.CostMatrix.set(nextStep.x,nextStep.y,0xff);
                room.CombatCostMatrix.set(nextStep.x,nextStep.y,0xff);
            }
            if(this.memory.followers){
                let followers = util.gatherObjectsInArrayFromIds(this.memory,'followers');
                for(let i=0; i<followers.length; i++){
                    followers[i].memory.posLeader = nextStep;
                }
            }
        }
        this.memory.path = path;
     }
     if(rtnTarget && endPos){
         //console.log(this.name + " " + this.room.name + " " + targets);
         for(let i=0; i<targets.length; i++){
             //console.log(i + " " + targets[i]);
             if(endPos.inRangeTo(targets[i].pos,rangeTarget)){
                 return targets[i];
             }
         }
     }
     return OK;
};

Creep.prototype.findAllowedRooms = function(destRoom) {
    let restrictDistance = 16;
    let stRoom = this.pos.roomName;
    if (Game.map.getRoomLinearDistance(stRoom, destRoom) > restrictDistance) {
        return;
    }    
    let allowedRooms = {[stRoom]: true, [destRoom]: true};
    let ret = Game.map.findRoute(stRoom, destRoom, {
        routeCallback: (roomName) => {
            if (Game.map.getRoomLinearDistance(stRoom, roomName) > restrictDistance) {
                return Infinity;
            }
            let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
            let isHighway = (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
            let isMyRoom = Game.rooms[roomName] && Game.rooms[roomName].controller && (Game.rooms[roomName].controller.my || (Game.rooms[roomName].controller.reservation && Game.rooms[roomName].controller.reservation.username == 'Vervust'));
            if(isHighway || isMyRoom){
                return 1;
            }
            if(roomBlackList[roomName] && roomName != stRoom && roomName != destRoom){
                return Infinity;
            }
            return 2;
        }
    });
    if(!Array.isArray(ret)){
        console.log(this.name + ' could not find route to ' + destRoom);
        return;
    }
    for(let value of ret){
        allowedRooms[value.room] = true;
    }
    return allowedRooms;
    
}

Creep.prototype.moveToRoom = function(roomName){
    if(this.room.name == roomName){
        return OK;
    }
    //console.log(this.name + ' moving to room ' + roomName);
    //room.findExitTo has a high cost -> only use if target room is not available in Game.rooms
    //console.log(this.name + ' moving to Room ' + this.moveTo([{pos: this.pos.findClosestByRange(this.room.findExitTo(roomName))}],0));
    //console.log(this.name + ' moving to room v2 ' + this.moveTo([{pos: {x: 24,y: 24,'roomName': roomName}}], 23));
    if(this.moveTo([{pos: {x: 24,y: 24,'roomName': roomName}}], 23) == ERR_NOT_FOUND){
        //if(this.memory.role == 'combat'){console.log('Trying again to find room')}
        //console.log(roomName + ' name is type ' + typeof roomName);
        if(this.name == 'transporter-2661'){
            console.log('Moving to origin');
        }
        this.moveTo([{pos: this.pos.findClosestByRange(this.room.findExitTo(roomName))}],0);
    }
    return;
    
};

Creep.prototype.flee = function(hostiles, fleeRange){
    //Flee from hostiles
    if(hostiles == undefined){
        hostiles = util.gatherObjectsInArray(this.room.creeps.hostiles,'melee','ranged','meleeHeal','meleeRanged','rangedHeal','hybrid');
    }
    else if(!Array.isArray(hostiles)){
        hostiles = [hostiles];
    }
    if(!hostiles.length){
        return ERR_NOT_FOUND;
    }
    if(fleeRange == undefined){
        fleeRange = 5;
    }
    //console.log(this.creep.name + ' Hostiles to flee from ' + hostiles);
    
    let inRange = false;
    for(let i=0; i<hostiles.length && !inRange; i++){
        inRange = this.pos.inRangeTo(hostiles[i].pos,fleeRange);
    }
    

    if(inRange && !this.fatigue){
        let goals = [];
        for(let i=0; i<hostiles.length; i++){
            goals.push({pos: hostiles[i].pos, range: fleeRange});
        }
        
        let costPlain = Math.max(1,Math.min(Math.ceil(this.fatigueRatio),2));
        let costSwamp = Math.max(1,Math.min(Math.ceil(CONSTRUCTION_COST_ROAD_SWAMP_RATIO * this.fatigueRatio),2 * CONSTRUCTION_COST_ROAD_SWAMP_RATIO));
        
        let res = PathFinder.search(this.pos, goals, 
        {
            plainCost: costPlain,
            swampCost: costSwamp,
            flee: true,
            roomCallback: (roomName) => {
                let room = Game.rooms[roomName];
                if(!room){return}
                let costs = room.CombatCostMatrix;
                if(costs){
                    return costs
                }
                return room.CostMatrix;
            },
        });
        
        let path = res.path.splice(0,Math.ceil((res.path.length+1)/2));
        
        if(!path.length){
            return ERR_NOT_FOUND;
        }
        
        let nextStep = path.shift();
        if(this.move(this.pos.getDirectionTo(nextStep)) == OK){
            let room = Game.rooms[nextStep.roomName];
            if(room){
                room.CostMatrix.set(nextStep.x,nextStep.y,0xff);
                room.CombatCostMatrix.set(nextStep.x,nextStep.y,0xff);
            }
            if(this.memory.followers){
                let followers = util.gatherObjectsInArrayFromIds(this.memory,'followers');
                for(let i=0; i<followers.length; i++){
                    followers[i].memory.posLeader = nextStep;
                }
            }
        }
        this.memory.path = path;
    }
    else if(!inRange){
        return ERR_NOT_FOUND;
    }
    //console.log(this.name + ' is fleeing');
    return OK;
};

Creep.prototype.moveToByPath = function(path){
    let rtn = this.moveByPath(path);
    //console.log('MoveToByPath ' + rtn + ' with path ' + path);
    if(rtn == ERR_NOT_FOUND && path.length){
        this.moveTo([{pos: path[0]}],0);
    }
    else {
        return rtn;
    }
};

Creep.prototype.moveInCircularPath = function(path){
    //Let creep move along a circular path. Next step is added again to end of path
    if(this.fatigue){return path}
    let nextStep;
    if(typeof path === 'string'){
        let rtn = util.deserializeNextStep(path);
        nextStep = rtn.step;
        path = util.addStepToSerializedPath(nextStep,rtn.path);
    }
    else if(Array.isArray(path)){
        nextStep = path.shift();
        path.push(nextStep);
    }
    if(this.pos.inRangeTo(nextStep,1)){
        this.move(this.pos.getDirectionTo(nextStep.x,nextStep.y));
    }
    else {
        this.moveTo([{pos: nextStep}],0);
    }
    return path;
};