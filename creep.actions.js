/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creep.actions');
 * mod.thing == 'a thing'; // true
 */
 var util = require('utilities');

Creep.prototype.harvestSource = function(sources){
    if(sources == undefined){
        sources = util.gatherObjectsInArrayFromIds(this.room.memory.sources,'energy').filter((source) => {return source.energy > 0});
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
        containers = util.gatherObjectsInArrayFromIds(this.room.memory.containers,'source','upgrader','storage').filter((container) => {return container.store[RESOURCE_ENERGY] > 0});
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
        storage = util.gatherObjectsInArrayFromIds(this.room.memory.containers,'storage').filter((stor) => {return stor.store[RESOURCE_ENERGY] > 0});
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
        return ERR_INVALID_ARGS;
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    if(!targets.length){
        return ERR_NOT_FOUND;
    }
    let targ = this.moveTo(targets,1);
    //console.log('Withdrawing from ' + targ);
    if(!(targ == OK || targ == ERR_NOT_FOUND)){
        if(resourceType == undefined){
            if(targ.structureType == STRUCTURE_SPAWN || targ.structureType == STRUCTURE_EXTENSION || targ.structureType == STRUCTURE_LINK){
                resourceType = RESOURCE_ENERGY;
            }
            else {
                for(let resource in targ.store){
                    if(targ.store[resource] > 0){
                        resourceType = resource;
                        //console.log(creep.name + ' resourceType ' + resourceType);
                        break;
                    }
                }
            }
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
                resource = util.gatherObjectsInArrayFromIds(this.room.memory,'dropped');
            }
            else {
                resource = util.gatherObjectsInArrayFromIds(this.room.memory,'dropped').filter((resource) => {return resource.resourceType == resourceType});
            }
            resource = resource.filter((rs) => {
                let resourceHarvestPower = HARVEST_POWER;
                if(rs.resourceType != RESOURCE_ENERGY){
                    resourceHarvestPower = HARVEST_MINERAL_POWER;
                }
                return rs.amount > Math.max(5,this.creep.body.filter(function(bP){ return bP.type == WORK}).length) * resourceHarvestPower * Math.ceil(Math.sqrt(Math.pow(this.pos.x-rs.pos.x,2) + Math.pow(this.pos.y-rs.pos.y,2)));
            });
            if(!resource.length){return ERR_NOT_FOUND}
            
            let targetedResources = util.targetObjectsOfCreeps('getDropped',this.room);
            let notTargetedResources = util.findArrayOfDifferentElements(resource,targetedResources);
            res = this.pos.findClosestByRange(notTargetedResources);
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
        targets = util.gatherObjectsInArrayFromIds(this.room.memory.energy.structures).filter((target) => {return target.energy < target.energyCapacity});
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    return this.transferResources(targets,RESOURCE_ENERGY);
};

Creep.prototype.fillContainer = function(targets){
    if(targets == undefined){
        targets = util.gatherObjectsInArrayFromIds(this.room.memory.containers).filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    return this.transferResources(targets,RESOURCE_ENERGY);
};

Creep.prototype.fillTower = function(towers){
    if(towers == undefined){
        towers = util.gatherObjectsInArrayFromIds(this.room.memory.tower).filter((tow) => {return tow.energy < tow.energyCapacity});
    }
    else if(!Array.isArray(towers)){
        towers = [towers];
    }
    return this.transferResources(towers,RESOURCE_ENERGY);
};

Creep.prototype.fillStorage = function(targets){
    if(targets == undefined){
        targets = util.gatherObjectsInArrayFromIds(this.room.memory.containers,'storage').filter((stor) => _.sum(stor.store) < stor.storeCapacity);
    }
    else if(!Array.isArray(targets)){
        targets = [targets]
    }
    return this.transferResources(targets);
};

Creep.prototype.transferResources = function(targets,resourceType){
    if(resourceType == undefined){
        //See what kind of resource creep is carrying
        resourceType = [];
        for(let resource in this.carry){
            //console.log('Creep: ' + creep.name + ' carries ' + resource);
            if(this.carry[resource]){
                if(this.carry[resource] == _.sum(this.carry)){
                    //Creep is only carrying 1 type of resource
                    //console.log('Only 1 resource');
                    resourceType = resource;
                }
                else {
                    //Creep is carrying multiple resource -> transfer them all
                    //console.log('Multiple types of resources');
                    resourceType.push(resource);
                }
            }
        }
    }
    
    if(targets == undefined){
        if(resourceType == RESOURCE_ENERGY){
            //Structures that can hold energy
            targets = this.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity) ||
                            ((structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && _.sum(structure.store) < structure.storeCapacity);
                }
            });            
        }
        else {
            //Structures that can hold any resource
            targets = this.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && _.sum(structure.store) < structure.storeCapacity);
                }
            });             
        }
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    if(!targets.length){
        return ERR_NOT_FOUND;
    }
    let target = this.moveTo(targets,1);
    if(!(target == OK || target == ERR_NOT_FOUND)){
        if(!Array.isArray(resourceType)){
            return this.transfer(target,resourceType);
        }
        else {
            //Transfer all resources
            let rtvl = OK;
            for(let i=0; i<resourceType.length; i++){
                rtvl = Math.min(rtvl,this.transfer(target,resourceType[i]));
            }
            return rtvl;
        }
    }
    if(target < 0){
        return target;
    }
    else {
        return 1;
    }
};

Creep.prototype.completeOrders = function(){
    let roomOrders = this.creep.room.memory.orders;
    if(roomOrders){
        for(let resource in roomOrders){
            let amount = roomOrders[resource];
            if(amount == 0){
                continue;
            }
            else if(amount > 0){
                let storeResource = util.gatherObjectsInArrayFromIds(this.creep.room.memory.containers,'source','mineral','storage').filter((cont) => {return cont.store[resource] > 0});
                let withdrawAmount = Math.min(this.creep.carryCapacity,amount);
                let rtn = this.withdrawResource(storeResource,resource,withdrawAmount);
                if(rtn == OK){
                    //console.log(creep.name + ' type ' + resource + ' amount ' + amount + ' withdrawn ' + withdrawAmount);
                    this.creep.room.memory.orders[resource] = amount - withdrawAmount;
                    this.creep.memory.getting = false;
                    this.creep.memory.targetContainer = this.creep.room.terminal.id;
                    return;
                }
                else if(rtn != ERR_NOT_FOUND){
                    return;
                }    	                            
            }
            else {
                amount = Math.abs(amount);
                let terminal = [this.creep.room.terminal].filter((term) => {return term.store[resource] > 0});
                let withdrawAmount = Math.min(this.creep.carryCapacity,amount);
                let rtn = this.withdrawResource(terminal,resource,withdrawAmount);
                if(rtn == OK){
                    //console.log(creep.name + ' type ' + resource + ' amount ' + amount + ' withdrawn ' + withdrawAmount);
                    this.creep.room.memory.orders[resource] += withdrawAmount;
                    return;
                }
                else if(rtn != ERR_NOT_FOUND){
                    return;
                }
            }

        }
    }    
};

Creep.prototype.repairWall = function(hitFrac, targets){
    if(hitFrac == undefined){
        hitFrac = 1.0/10000; 
    }
    if(targets == undefined){
        targets = this.creep.room.find(FIND_STRUCTURES, {
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
        hitFrac = 1.0/Math.pow(10.0,(1.0/2.0*this.creep.room.controller.level));
        //console.log(hitFrac);
    }
    if(targets == undefined){
        targets = util.getArrayObjectsById(this.creep.room.memory.dmgStructures);
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
        return this.creep.repair(target);
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
        targets = this.creep.room.find(FIND_CONSTRUCTION_SITES);
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    if(!targets.length){
        return ERR_NOT_FOUND;
    }
    let target = this.moveTo(targets,3);
    if(!(target == OK || target == ERR_NOT_FOUND)){
        return this.creep.build(target);
    }
    if(target < 0){
        return target;
    }
    else {
        return 1;
    }
};

Creep.prototype.upgrade = function(){
    var targets = [this.creep.room.controller];
    if(!targets.length){
        return ERR_NOT_FOUND;
    }
    let target = this.moveTo(targets,3);
    if(!(target == OK || target == ERR_NOT_FOUND)){
        return this.creep.upgradeController(target);
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
        hostiles = this.creep.room.find(FIND_HOSTILE_CREEPS);
    }
    else if(!Array.isArray(hostiles)){
        hostiles = [hostiles];
    }
    if(!hostiles.length){
        return ERR_NOT_FOUND;
    }
    let hostile = this.moveTo(hostiles,1);
    if(!(hostile == OK || hostile == ERR_NOT_FOUND)){
        return this.creep.attack(hostile);
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
        hostiles = this.creep.room.find(FIND_HOSTILE_CREEPS);
    }
    else if(!Array.isArray(hostiles)){
        hostiles = [hostiles];
    }
    if(!hostiles.length){
        return ERR_NOT_FOUND;
    }
    let hostile = this.moveTo(hostiles,3);
    if(!(hostile == OK || hostile == ERR_NOT_FOUND)){
        return this.creep.rangedAttack(hostile);
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
        hostiles = this.creep.room.find(FIND_HOSTILE_CREEPS);
    }
    else if(!Array.isArray(hostiles)){
        hostiles = [hostiles];
    }

    let bodyCount = util.countBodyParts(this.creep)[0];
    //console.log('Hostiles ' + hostiles.length + ' ' + JSON.stringify(hostiles));
    if(!hostiles.length){
        if(bodyCount[HEAL] && this.creep.hits<this.creep.hitsMax){
            //console.log(this.creep.name + ' heal');
            this.creep.heal(this.creep);
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
            this.creep.rangedAttack(hostile);
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
            this.creep.attack(hostile);
            rtn = OK;
        }
        else {
            rtn = Math.max(rtn,hostile);
            if(bodyCount[HEAL] && this.creep.hits<this.creep.hitsMax){
                //console.log(this.creep.name + ' heal');
                this.creep.heal(this.creep);
            }
        }        
    }
    else if(bodyCount[HEAL] && this.creep.hits<this.creep.hitsMax){
        //console.log(this.creep.name + ' heal');
        this.creep.heal(this.creep);
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
        hostiles = this.creep.room.find(FIND_HOSTILE_CREEPS);
    }
    else if(!Array.isArray(hostiles)){
        hostiles = [hostiles];
    }
    let bodyCount = util.countBodyParts(this.creep)[0];
    if(!hostiles.length){
        if(bodyCount[HEAL] && this.creep.hits<this.creep.hitsMax){
            //console.log(this.creep.name + ' heal');
            this.creep.heal(this.creep);
        }        
        return ERR_NOT_FOUND;
    }
    
    let hostile = undefined;
    let rtn = undefined;    
    if(bodyCount[RANGED_ATTACK]){
        hostile = util.targetsInRange(hostiles,[this.creep],3);
        if(hostile != OK && hostile != ERR_NOT_FOUND){
            this.creep.rangedAttack(hostile);
            rtn = OK;
        }
        else {
            rtn = hostile;
        }        
    }    
    
    if(bodyCount[ATTACK]){
        hostile = util.targetsInRange(hostiles,[this.creep],1);
        if(hostile != OK && hostile != ERR_NOT_FOUND){
            //console.log(this.creep.name + 'attack');
            this.creep.attack(hostile);
            rtn = OK;
        }
        else {
            rtn = Math.max(rtn,hostile);
            if(bodyCount[HEAL] && this.creep.hits<this.creep.hitsMax){
                //console.log(this.creep.name + 'heal');
                this.creep.heal(this.creep);
            }
        }        
    }
    else if(bodyCount[HEAL] && this.creep.hits<this.creep.hitsMax){
        //console.log(this.creep.name + 'heal');
        this.creep.heal(this.creep);
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
        targets = this.creep.room.find(FIND_MY_CREEPS, {filter: (cr) => {return cr.hits < cr.hitsMax}});
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    if(!targets.length){
        return ERR_NOT_FOUND;
    }
    let bodyCount = util.countBodyParts(this.creep)[0];
    if(!bodyCount[HEAL]){
        return ERR_NOT_FOUND;
    }
    let target = this.moveTo(targets,3);
    let rtn = undefined;
    if(target != OK && target != ERR_NOT_FOUND){
        rtn = this.creep.rangedHeal(target);
    }
    target = this.moveTo(targets,1);
    if(target != OK && target != ERR_NOT_FOUND){
        rtn = this.creep.heal(target);
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
        let structAtCreep = this.creep.room.lookForAt(LOOK_STRUCTURES,this.creep.pos);
        let creepInRampart = _.filter(structAtCreep, function(structure){
            return structure.structureType == STRUCTURE_RAMPART
        }).length;
        if(!creepInRampart){
            ramparts = this.creep.room.find(FIND_MY_STRUCTURES, {
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

Creep.prototype.reserveController = function(controllers){
    if(controllers == undefined || !controllers.length){
        return ERR_NOT_FOUND;
    }
    else if(!Array.isArray(controllers)){
        controllers = [controllers];
    }
    let controller = this.moveTo(controllers,1);
    //console.log(this.creep.name + ' controller ' + controller);    
    if(!(controller == OK || controller == ERR_NOT_FOUND)){
        return this.creep.reserveController(controller);
    }
    if(controller < 0){
        return controller;
    }
    else {
        return 1;
    }
};

Creep.prototype.claimController = function(controllers){
    if(controllers == undefined || !controllers.length){
        return ERR_NOT_FOUND;
    }
    else if(!Array.isArray(controllers)){
        controllers = [controllers];
    }
    let controller = this.moveTo(controllers,1);
    if(!(controller == OK || controller == ERR_NOT_FOUND)){
        return this.creep.claimController(controller)
    }
    if(controller < 0){
        return controller;
    }
    else {
        return 1;
    }
};

Creep.prototype.moveTo = function(targets,rangeTarget) {
     //Check whether creep is already in range
     for(let i=0; i<targets.length; i++){
         if(this.creep.pos.inRangeTo(targets[i].pos,rangeTarget)){
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