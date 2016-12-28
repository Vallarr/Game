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
        else {
            amount = Math.min(amount,targ[resourceType]);
        }
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
    //console.log(this.creep.name + ' getting dropped resource ' + res);
    
    res = this.moveTo(res,1);
    if(res != OK && res != ERR_NOT_FOUND){
        delete this.memory.getDropped;
        return this.pickup(res);
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
                let withdrawAmount = Math.min(this.carryCapacity,amount);
                let rtn = this.withdrawResource(terminal,resource,withdrawAmount);
                if(rtn == OK){
                    //console.log(creep.name + ' type ' + resource + ' amount ' + amount + ' withdrawn ' + withdrawAmount);
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
            //console.log(this.creep.name + ' heal');
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
            //console.log(this.creep.name + ' attack');
            this.attack(hostile);
            rtn = OK;
        }
        else {
            rtn = Math.max(rtn,hostile);
            if(bodyCount[HEAL] && this.hits<this.hitsMax){
                //console.log(this.creep.name + ' heal');
                this.heal(this);
            }
        }        
    }
    else if(bodyCount[HEAL] && this.hits<this.hitsMax){
        //console.log(this.creep.name + ' heal');
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
    //console.log('Stationary');
    if(hostiles == undefined){
        hostiles = this.room.find(FIND_HOSTILE_CREEPS);
    }
    else if(!Array.isArray(hostiles)){
        hostiles = [hostiles];
    }
    let bodyCount = util.countBodyParts(this)[0];
    if(!hostiles.length){
        if(bodyCount[HEAL] && this.hits<this.hitsMax){
            //console.log(this.name + ' heal');
            this.creep(this);
        }        
        return ERR_NOT_FOUND;
    }
    
    let hostile = undefined;
    let rtn = undefined;    
    if(bodyCount[RANGED_ATTACK]){
        hostile = util.targetsInRange(hostiles,[this],3);
        if(hostile != OK && hostile != ERR_NOT_FOUND){
            this.rangedAttack(hostile);
            rtn = OK;
        }
        else {
            rtn = hostile;
        }        
    }    
    
    if(bodyCount[ATTACK]){
        hostile = util.targetsInRange(hostiles,[this],1);
        if(hostile != OK && hostile != ERR_NOT_FOUND){
            //console.log(this.name + 'attack');
            this.attack(hostile);
            rtn = OK;
        }
        else {
            rtn = Math.max(rtn,hostile);
            if(bodyCount[HEAL] && this.hits<this.hitsMax){
                //console.log(this.creep.name + 'heal');
                this.heal(this);
            }
        }        
    }
    else if(bodyCount[HEAL] && this.hits<this.hitsMax){
        //console.log(this.name + 'heal');
        this.creep.heal(this);
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
         if(this.memory.type == 'starter'){
             maxOperations = 5000;
         }
         
         //from Documentation
         let res = PathFinder.search(this.pos, goals,
         {
             plainCost: 2,
             swampCost: 10,
             maxOps: maxOperations,
             roomCallback: (roomName) => {
                 if(!Game.rooms[roomName]) return;
                 if(Game.rooms[roomName].memory.defense.underAttack && (this.memory.role == 'melee' || this.memory.role == 'ranged' || this.memory.role == 'hybrid' || this.memory.role == 'patroller' || this.memory.role == 'patrollerRanged')){
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
             this.moveTo(targets,rangeTarget-1);
         }

         this.move(this.pos.getDirectionTo(path.shift()));
         this.memory.path = path;
     }
     return OK;
};

Creep.prototype.moveToRoom = function(roomName){
    if(this.room.name == roomName){
        return OK;
    }
    //console.log(this.name + ' moving to room ' + roomName);
    //room.findExitTo has a high cost -> only use if target room is not available in Game.rooms
    //console.log(this.name + ' moving to Room ' + this.moveTo([{pos: this.pos.findClosestByRange(this.room.findExitTo(roomName))}],0));
    //console.log(this.name + ' moving to room v2 ' + this.moveTo([{pos: {x: 24,y: 24,'roomName': roomName}}], 23));
    if(this.moveTo([{pos: {x: 24,y: 24,'roomName': roomName}}], 23) == ERR_NOT_FOUND){
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
        fleeRange = 4;
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
                if(!Game.rooms[roomName]) return;
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
}eTo(targets[i].pos,rangeTarget)){
            return targets[i];
         }
     }
     
     //If no targets are within range, search for path to nearest target
     if(!this.creep.fatigue){
         let goals = [];
         for(let i=0; i<targets.length;i++){
             goals.push({pos: targets[i].pos, range: rangeTarget})
         }
         
         
         //from Documentation
         let res = PathFinder.search(this.creep.pos, goals,
         {
             plainCost: 2,
             swampCost: 10,
             roomCallback: (roomName) => {
                 if(!Game.rooms[roomName]) return;
                 if(Game.rooms[roomName].memory.defense.underAttack && (this.creep.memory.role == 'melee' || this.creep.memory.role == 'ranged' || this.creep.memory.role == 'hybrid' || this.creep.memory.role == 'patroller' || this.creep.memory.role == 'patrollerRanged')){
                     let costs = Game.rooms[roomName].memory.CombatCostMatrix;
                     //console.log(this.creep.name);
                     if(costs){
                         //console.log(this.creep.name + ' targets ' + targets + ' roomName ' + roomName);
                         return PathFinder.CostMatrix.deserialize(costs);
                     }
                 }
                 return PathFinder.CostMatrix.deserialize(Game.rooms[roomName].memory.CostMatrix);
             },
         });

         if(res.incomplete && res.path.length<50){
             //console.log(this.creep.name + ' ' + JSON.stringify(res.path.length));
             return ERR_NOT_FOUND;
         }
         let path = res.path.splice(0,Math.ceil((res.path.length+1)/2));
         if(!path.length){
             //Not in range but no path happens if on edge between 2 rooms. Try to get closer.
             //console.log(creep.name + ' no path ' + rangeTarget);
             if(rangeTarget == 0){
                 return ERR_INVALID_ARGS;
             }
             this.moveTo(targets,rangeTarget-1);
         }

         this.creep.move(this.creep.pos.getDirectionTo(path.shift()));
         this.creep.memory.path = path;
     }
     return OK;
};

Creep.prototype.moveToRoom = function(roomName){
    let creep = this.creep;
    if(this.creep.room.name == roomName){
        return OK;
    }
    //room.findExitTo has a high cost -> only use if target room is not available in Game.rooms
    if(Game.rooms[roomName] == undefined){
        //let start = Game.cpu.getUsed();
        //let dirToRoom = this.creep.room.findExitTo(roomName);
        //let toRoom = this.creep.pos.findClosestByRange(this.creep.room.findExitTo(roomName));
        //let rtn = this.moveTo([{pos: this.creep.pos.findClosestByRange(this.creep.room.findExitTo(roomName))}],0);
        //let time = Game.cpu.getUsed() - start;
        //console.log(creep.name + ' going to dark room cost ' + time);
        //console.log(creep.name + ' going to ' + roomName);
        return this.moveTo([{pos: this.creep.pos.findClosestByRange(this.creep.room.findExitTo(roomName))}],0);        
    }
    else {
        //console.log(creep.name + ' going to known room');
        //let start = Game.cpu.getUsed();
        //let rtn = this.moveTo([{pos: {x: 24,y: 24,'roomName': roomName}}], 24);
        //let time = Game.cpu.getUsed() - start;
        //console.log(creep.name + ' going to known room cost ' + time);
        return this.moveTo([{pos: {x: 24,y: 24,'roomName': roomName}}], 23);
    }
};

Creep.prototype.flee = function(hostiles, fleeRange){
    //Flee from hostiles
    if(hostiles == undefined){
        hostiles = util.gatherObjectsInArrayFromIds(this.creep.room.memory.defense.hostiles,'melee','ranged','meleeHeal','meleeRanged','rangedHeal','hybrid');
    }
    else if(!Array.isArray(hostiles)){
        hostiles = [hostiles];
    }
    if(!hostiles.length){
        return ERR_NOT_FOUND;
    }
    if(fleeRange == undefined){
        fleeRange = 4;
    }
    //console.log(this.creep.name + ' Hostiles to flee from ' + hostiles);
    
    let inRange = false;
    for(let i=0; i<hostiles.length && !inRange; i++){
        inRange = this.creep.pos.inRangeTo(hostiles[i].pos,fleeRange);
    }
    
    //console.log('In range ' + inRange);
    if(inRange && !this.creep.fatigue){
        let goals = [];
        for(let i=0; i<hostiles.length; i++){
            goals.push({pos: hostiles[i].pos, range: fleeRange});
        }
        
        let res = PathFinder.search(this.creep.pos, goals, 
        {
            plainCost: 2,
            swampCost: 10,
            flee: true,
            roomCallback: (roomName) => {
                if(!Game.rooms[roomName]) return;
                let costs = Game.rooms[roomName].memory.CombatCostMatrix;
                if(costs){
                    return PathFinder.CostMatrix.deserialize(costs)
                }
                return PathFinder.CostMatrix.deserialize(Game.rooms[roomName].memory.CostMatrix)
            },
        });
        
        let path = res.path.splice(0,Math.ceil((res.path.length+1)/2));
        
        if(!path.length){
            return ERR_NOT_FOUND;
        }
        
        this.creep.move(this.creep.pos.getDirectionTo(path.shift()));
        this.creep.memory.path = path;
    }
    else if(!inRange){
        return ERR_NOT_FOUND;
    }
    //console.log(this.creep.name + ' is fleeing');
    return OK;
}


module.exports = Creep;