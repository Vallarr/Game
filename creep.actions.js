Creep.prototype.dropResource = function(resourceType){
    
    this.drop(resourceType);
}

Creep.prototype.harvestSource = function(sources){
    if(sources == undefined){
        sources = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].sources,'energy').filter((source) => {return source.energy > 0});
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

Creep.prototype.harvestContainer = function(containers){
    if(containers == undefined){
        containers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source','upgrader','storage').filter((container) => {return container.store[RESOURCE_ENERGY] > 0});
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
                resource = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name],'dropped');
            }
            else {
                resource = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name],'dropped').filter((resource) => {return resource.resourceType == resourceType});
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
        targets = this.pos.closestByRange(roomObjects[this.room.name].toFill,1);
    }
    return this.transferResources(targets,RESOURCE_ENERGY);
};

Creep.prototype.fillContainer = function(targets){
    if(targets == undefined){
        targets = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers).filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    return this.transferResources(targets,RESOURCE_ENERGY);
};

Creep.prototype.fillTower = function(towers){
    if(towers == undefined){
        towers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].structures,STRUCTURE_TOWER).filter((tow) => {return tow.energy < tow.energyCapacity});
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
    if(roomOrders){
        for(let resource in roomOrders){
            let amount = roomOrders[resource];
            if(amount == 0){
                continue;
            }
            else if(amount > 0){
                let storeResource = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source','mineral','storage').filter((cont) => {return cont.store[resource] > 0});
                //let target = this.pos.closestByRange(storeResource);
                if(!storeResource.length){
                    continue;
                }
                let withdrawAmount = Math.min(this.carryCapacity,amount);
                let rtn = this.withdrawResource(storeResource,resource,withdrawAmount);
                //console.log('Amount ' + withdrawAmount + ' targets ' + storeResource + ' rtn ' + rtn);
                if(rtn == OK){
                    //console.log(creep.name + ' type ' + resource + ' amount ' + amount + ' withdrawn ' + withdrawAmount);
                    this.room.memory.orders[resource] = amount - withdrawAmount;
                    this.memory.getting = false;
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
                    //console.log(this.name + ' not enough in storage');
                    continue;
                }
                //let target = this.pos.closestByRange(terminal);
                let withdrawAmount = Math.min(this.carryCapacity,amount,terminal[0].store[resource]);
                let rtn = this.withdrawResource(terminal,resource,withdrawAmount);
                if(rtn == OK){
                    //console.log(this.name + ' type ' + resource + ' amount ' + amount + ' withdrawn ' + withdrawAmount);
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
    if(!this.room.memory.boosts || !roomObjects[this.room.name].labs){
        return ERR_NOT_FOUND;
    }
    let sourceLabs = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].labs,'source');
    let targetLabs = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].labs,'target');
    if(sourceLabs.length != 2 || targetLabs.length < 1){
        //Not the right amount of labs to perform reaction
        return ERR_NOT_FOUND;
    }
    
    if(this.room.memory.boosts.length == 0){
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
    //console.log(this.name + ' enough labs');
    
    let reagents = [];
    if(this.room.memory.boosts[0].reagents){
        for(let i=0; i<this.room.memory.boosts[0].reagents.length; i++){
            reagents.push(this.room.memory.boosts[0].reagents[i]);
        }
    }
    else {
        for(let reagent in this.room.memory.boosts[0].supply){reagents.push(reagent)}
    }
    let emptyLabs = [];
    let labsWithReagent = {};
    let reagentsInLabs = [];
    let targeted = util.targetObjectsOfCreeps('targetContainer',this.room);
    sourceLabs = util.findArrayOfDifferentElements(sourceLabs,targeted);
    
    //console.log('Source labs ' + sourceLabs + ' targeted ' + targeted);
    
    //Look for source labs with wrong resource
    for(let i=0; i<sourceLabs.length; i++){
        let found = false; //Found lab which can contain or allready contains minerals needed for reaction
        for(let j=0; j<reagents.length && !found; j++){
            if(reagents[j] == sourceLabs[i].mineralType){
                labsWithReagent[reagents[j]] = sourceLabs[i];
                reagentsInLabs.push(reagents.splice(j,1));
                j--;
                found = true;
            }
            else if(!sourceLabs[i].mineralType){
                emptyLabs.push(sourceLabs[i]);
                found = true;
            }
        }
        if(!found){
            //This lab contains wrong resource -> empty it
            //console.log(this.name + ' emptying source lab ' + sourceLabs[i]);
            this.memory.targetContainer = sourceLabs[i].id;
            this.memory.getting = true;
            return;
        }
    }
    reagents = reagents.concat(reagentsInLabs);
    
    //console.log('Reagents ' + reagents + ' Labs with reagents ' + JSON.stringify(labsWithReagent) + ' empty ' + emptyLabs);
    
    //Look for source labs that have to be filled
    for(let i=0; i<reagents.length; i++){
        let targetLab = undefined
        if(labsWithReagent[reagents[i]] && labsWithReagent[reagents[i]].mineralCapacity - labsWithReagent[reagents[i]].mineralAmount >= this.carryCapacity){
            targetLab = labsWithReagent[reagents[i]];
        }
        else if(!labsWithReagent[reagents[i]] && emptyLabs.length){
            targetLab = emptyLabs.shift();
        }
        if(targetLab){
            //console.log(this.name + ' filling lab ' + targetLab + ' with ' + reagents[i]);
            let storeResource = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source','mineral','storage').filter((cont) => {return cont.store[reagents[i]] > 0});
            let target = this.pos.closestByRange(storeResource);
            if(target){ //
                let withdrawAmount = Math.min(this.carryCapacity,target.store[reagents[i]]);
                if(this.withdrawResource([target],reagents[i].toString(),withdrawAmount) == OK){
                    this.memory.getting = false;
                    this.memory.targetContainer = targetLab.id;
                }
            }
            else {
                continue;
            }
            return;
        }
    }
    
    //Look for target labs that contain wrong type of boosts and have to be emptied
    targetLabs = util.findArrayOfDifferentElements(targetLabs,targeted);
    for(let i=0; i<targetLabs.length; i++){
        if(targetLabs[i].mineralType && targetLabs[i].mineralType != this.room.memory.boosts[0].type){
            //console.log(this.name + ' emptying target lab ' + targetLabs[i]);
            this.memory.getting = true;
            this.memory.targetContainer = targetLabs[i].id;
            return;
        }
    }
    return ERR_NOT_FOUND;
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

Creep.prototype.combat = function(hostiles){
    //console.log(this.name + ' combat');
    if(hostiles == undefined){
        hostiles = this.room.find(FIND_HOSTILE_CREEPS);
    }
    else if(!Array.isArray(hostiles)){
        hostiles = [hostiles];
    }

    let bodyCount = util.countBodyParts(this)[0];
    //console.log('Hostiles ' + hostiles.length + ' ' + JSON.stringify(hostiles));
    if(!hostiles.length){
        if(bodyCount[HEAL] && this.hits<this.hitsMax){
            //console.log(this.name + ' heal');
            this.heal(this);
        }        
        return ERR_NOT_FOUND;
    }

    //console.log(this.creep.name + ' bodycount ' + JSON.stringify(bodyCount));
    let hostile = undefined;
    let rtn = undefined;
    //console.log('Ranged ' + bodyCount[RANGED_ATTACK]);
    if(bodyCount[RANGED_ATTACK]){
        hostile = this.moveTo(hostiles,3);
        if(hostile != OK && hostile != ERR_NOT_FOUND){
            this.rangedAttack(hostile);
            rtn = OK;
        }
        else {
            rtn = hostile;
        }        
    }
    //console.log('Melee ' + bodyCount[ATTACK]);
    //console.log('Heal ' + bodyCount[HEAL]);
    if(bodyCount[ATTACK]){
        hostile = this.moveTo(hostiles,1);
        if(hostile != OK && hostile != ERR_NOT_FOUND){
            //console.log(this.name + ' attack');
            //this.attack(hostile);
            //moveToAttack
            if(this.move(this.pos.getDirectionTo(hostile)) == OK){
                //console.log(this.name + ' heal after move attack');
                this.heal(this);
            }
            else {
                this.attack(hostile);
            }
            rtn = OK;
        }
        else {
            rtn = Math.max(rtn,hostile);
            if(bodyCount[HEAL] && this.hits<this.hitsMax){
                //console.log(this.name + ' heal');
                this.heal(this);
            }
        }        
    }
    else if(bodyCount[HEAL] && this.hits<this.hitsMax){
        //console.log(this.name + ' heal');
        this.heal(this);
    }
    
    if(rtn < 0){
        return rtn;
    }
    else {
        return 1;
    }
};

Creep.prototype.stationaryCombat = function(hostiles){
    
    if(this.getActiveBodyparts(ATTACK) == 0 && this.getActiveBodyparts(RANGED_ATTACK) == 0 && this.getActiveBodyparts(HEAL) == 0) {return}
    //console.log(this.name + ' stationary');
    if(hostiles == undefined){
        //console.log(this.name + ' search');
        hostiles = this.room.find(FIND_HOSTILE_CREEPS);
        //console.log(this.name + ' found');
    }
    else if(!Array.isArray(hostiles)){
        hostiles = [hostiles];
    }
    let bodyCount = util.countBodyParts(this)[0];
    if(!hostiles.length){
        if(bodyCount[HEAL] && this.hits<this.hitsMax){
            //console.log(this.name + ' heal');
            this.heal(this);
        }        
        return ERR_NOT_FOUND;
    }
    
    let hostile = undefined;
    let rtn = undefined;    
    if(bodyCount[RANGED_ATTACK]){
        hostile = util.targetsInRange(hostiles,[this],3);
        if(hostile.length){
            this.rangedAttack(hostile[0]);
            rtn = OK;
        }
        else {
            rtn = ERR_NOT_FOUND;
        }        
    }    
    
    if(bodyCount[ATTACK]){
        hostile = util.targetsInRange(hostiles,[this],1);
        if(hostile.length){
            //console.log(this.name + 'attack');
            this.attack(hostile[0]);
            rtn = OK;
        }
        else {
            rtn = Math.max(rtn,ERR_NOT_FOUND);
            if(bodyCount[HEAL] && this.hits<this.hitsMax){
                //console.log(this.creep.name + 'heal');
                this.heal(this);
            }
        }        
    }
    else if(bodyCount[HEAL] && this.hits<this.hitsMax){
        //console.log(this.name + ' heal');
        this.heal(this);
    }
    
    if(rtn < 0){
        return rtn;
    }
    else {
        return 1;
    }    
};

Creep.prototype.healOther = function(targets){
    if(targets == undefined){
        targets = this.room.find(FIND_MY_CREEPS, {filter: (cr) => {return cr.hits < cr.hitsMax}});
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    if(!targets.length){
        return ERR_NOT_FOUND;
    }
    let bodyCount = util.countBodyParts(this)[0];
    if(!bodyCount[HEAL]){
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
    if(rtn < 0){
        return rtn;
    }
    else {
        return 1;
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

Creep.prototype.dismantleStructure = function(struct){
    if(struct == undefined){
        return ERR_NOT_FOUND;
    }
    else if(!Array.isArray(struct)){
        struct = [struct];
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

Creep.prototype.moveTo = function(targets,rangeTarget) {
     //Check whether creep is already in range
     for(let i=0; i<targets.length; i++){
         if(this.pos.inRangeTo(targets[i].pos,rangeTarget)){
            return targets[i];
         }
     }
     
     //If no targets are within range, search for path to nearest target
     if(!this.fatigue){
         let goals = [];
         for(let i=0; i<targets.length;i++){
             goals.push({pos: targets[i].pos, range: rangeTarget})
         }
         
         let maxOperations = 2000;
         let allowedRooms = undefined;
         if(this.memory.type == 'starter' || this.memory.type == 'rescuer'){
             //console.log(this.name + ' bigger moves');
             maxOperations = 20000;
         }
         if(Game.map.getRoomLinearDistance(this.room.name,targets[0].pos.roomName) > 2){
             allowedRooms = this.findAllowedRooms(targets[0].pos.roomName);
             //console.log(this.name + ' going from ' + this.room.name + ' to  ' + targets[0].pos.roomName + ' via ' + JSON.stringify(allowedRooms));
         }
         
         //from Documentation
         let res = PathFinder.search(this.pos, goals,
         {
             plainCost: 2,
             swampCost: 10,
             maxOps: maxOperations,
             roomCallback: (roomName) => {
                 if(allowedRooms) {
                     if(!allowedRooms[roomName]){return false}
                 }
                 if(!Game.rooms[roomName]) return;
                 if(Game.rooms[roomName].memory.defense.underAttack && (this.memory.role == 'melee' || this.memory.role == 'ranged' || this.memory.role == 'hybrid' || this.memory.role == 'patroller' || this.memory.role == 'patrollerRanged' || this.memory.role == 'combat')){
                     let costs = roomObjects[roomName].CombatCostMatrix;
                     //console.log(this.name);
                     if(costs){
                         //console.log(this.name + ' targets ' + targets + ' roomName ' + roomName);
                         return costs;
                     }
                 }
                 return roomObjects[roomName].CostMatrix;
             },
         });

         if(res.incomplete && res.path.length<50){
             //console.log(this.name + ' ' + JSON.stringify(res.path.length));
             return ERR_NOT_FOUND;
         }
         let path = res.path.splice(0,Math.ceil((res.path.length+1)/2));
         if(!path.length){
             //Not in range but no path happens if on edge between 2 rooms. Try to get closer.
             //console.log(this.name + ' no path ' + rangeTarget);
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

         this.move(this.pos.getDirectionTo(path.shift()));
         this.memory.path = path;
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
        this.moveTo([{pos: this.pos.findClosestByRange(this.room.findExitTo(roomName))}],0);
    }
    return;
    
};

Creep.prototype.flee = function(hostiles, fleeRange){
    //Flee from hostiles
    if(hostiles == undefined){
        hostiles = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].hostiles,'melee','ranged','meleeHeal','meleeRanged','rangedHeal','hybrid');
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
    
    //console.log('In range ' + inRange);
    
    if(inRange && !this.fatigue){
        let goals = [];
        for(let i=0; i<hostiles.length; i++){
            goals.push({pos: hostiles[i].pos, range: fleeRange});
        }
        
        let res = PathFinder.search(this.pos, goals, 
        {
            plainCost: 2,
            swampCost: 10,
            flee: true,
            roomCallback: (roomName) => {
                if(!Game.rooms[roomName]){return}
                let costs = roomObjects[roomName].CombatCostMatrix;
                if(costs){
                    return costs
                }
                return roomObjects[roomName].CostMatrix;
            },
        });
        
        let path = res.path.splice(0,Math.ceil((res.path.length+1)/2));
        
        if(!path.length){
            return ERR_NOT_FOUND;
        }
        
        this.move(this.pos.getDirectionTo(path.shift()));
        this.memory.path = path;
    }
    else if(!inRange){
        return ERR_NOT_FOUND;
    }
    //console.log(this.name + ' is fleeing');
    return OK;
}