/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creep.actions');
 * mod.thing == 'a thing'; // true
 */
 var util = require('utilities');

var Creep = function(creep) {
    this.creep = creep;
    
    if(!creep.fatigue){
        //let path = creep.memory.path;
        //console.log(path);
        if(creep.memory.path && creep.memory.path.length){
            let nextStep = creep.memory.path.shift();
            if(creep.pos.inRangeTo(nextStep,1) && creep.move(creep.pos.getDirectionTo(nextStep.x,nextStep.y)) == OK){
                this.moved = true;        
                //console.log(creep.name + ' moved from memory');
            }
            else {
                //console.log(this.creep.name + ' false move ' + creep.pos.inRangeTo(nextStep,1));
                this.moved = false;
            }
        }
        else {
            this.moved = false;
        }
    }
    else {
        this.moved = false;
    }
};

Creep.prototype.harvestSource = function(sources){
    if(sources == undefined){
        sources = util.gatherObjectsInArrayFromIds(this.creep.room.memory.sources,'energy').filter((source) => {return source.energy > 0});
    }
    else if(!Array.isArray(sources)){
        sources = [sources];
    }
    if(!sources.length){
        return ERR_NOT_FOUND;
    }    
    let source = this.moveTo(sources,1);
    if(!(source == OK || source == ERR_NOT_FOUND)){
        return this.creep.harvest(source);
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
        containers = util.gatherObjectsInArrayFromIds(this.creep.room.memory.containers,'source','upgrader','storage').filter((container) => {return container.store[RESOURCE_ENERGY] > 0});
    }
    else if(!Array.isArray(containers)){
        containers = [containers];
    }
    if(!containers.length){
        return ERR_NOT_FOUND;
    }    
    let container = this.moveTo(containers,1);
    if(!(container == OK || container == ERR_NOT_FOUND)){
        return this.creep.withdraw(container,RESOURCE_ENERGY);
    }
    if(container < 0){
        return container;
    }
    else {
        return 1;
    }
};

Creep.prototype.harvestStorage = function(storage){
    if(storage == undefined){
        storage = util.gatherObjectsInArrayFromIds(this.creep.room.memory.containers,'storage').filter((stor) => {return stor.store[RESOURCE_ENERGY] > 0});
    }
    else if(!Array.isArray(storage)){
        storage = [storage];
    }
    if(!storage.length){
        return ERR_NOT_FOUND;
    }
    let stor = this.moveTo(storage,1);
    if(!(stor == OK || stor == ERR_NOT_FOUND)){
        return this.creep.withdraw(stor,RESOURCE_ENERGY);
    }
    if(stor < 0){
        return stor;
    }
    else {
        return 1;
    }
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
        return this.creep.withdraw(targ,resourceType,amount);
    }
    if(targ < 0){
        return targ;
    }
    else {
        return 1;
    }
};

Creep.prototype.collectDroppedResource = function(resourceType, resource){
    if(resource == undefined){
        if(resourceType == undefined){
            resource = this.creep.room.find(FIND_DROPPED_RESOURCES);
        }
        else {
            resource = this.creep.room.find(FIND_DROPPED_RESOURCES, {
                filter: (resource) => {
                    return (resource.resourceType == resourceType);
                }
            });
        }
    }
    else if(!Array.isArray(resource)){
        resource = [resource];
    }
    if(!resource.length){
        return ERR_NOT_FOUND;
    }
    for(let i=0; i<resource.length; i++){
        if(resource[i].amount < Math.max(5,this.creep.body.filter(function(bP){ return bP.type == WORK}).length) * HARVEST_POWER * Math.ceil(Math.sqrt(Math.pow(this.creep.pos.x-resource[i].pos.x,2) + Math.pow(this.creep.pos.y-resource[i].pos.y,2)))){
            resource.splice(i,1);
            i--;
            //console.log('Resource ' + res.resourceType + ' found at: ' + res.pos + ' but not worth it');
        }
    }    
    if(!resource.length){
        return ERR_NOT_FOUND;
    }    
    //console.log('Resource ' + resource[0].resourceType + ' found at: ' + resource[0].pos)
    let res = this.moveTo(resource,1);
    if(!(res == OK || res == ERR_NOT_FOUND)){
        return this.creep.pickup(res);
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
        //Give proirity to extensions
        targets = util.gatherObjectsInArrayFromIds(this.creep.room.memory.energy.structures).filter((target) => {return target.energy < target.energyCapacity});
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    return this.transferResources(targets,RESOURCE_ENERGY);
};

Creep.prototype.fillContainer = function(targets){
    if(targets == undefined){
        targets = util.gatherObjectsInArrayFromIds(this.creep.room.memory.containers).filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
    }
    else if(!Array.isArray(targets)){
        targets = [targets];
    }
    return this.transferResources(targets,RESOURCE_ENERGY);
};

Creep.prototype.fillTower = function(towers){
    if(towers == undefined){
        towers = this.creep.room.find(FIND_MY_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity);
            }
        });
    }
    else if(!Array.isArray(towers)){
        towers = [towers];
    }
    return this.transferResources(towers,RESOURCE_ENERGY);
};

Creep.prototype.fillStorage = function(targets){
    if(targets == undefined){
        targets = util.gatherObjectsInArrayFromIds(this.creep.room.memory.containers,'storage').filter((stor) => _.sum(stor.store) < stor.storeCapacity);
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
        for(let resource in this.creep.carry){
            //console.log('Creep: ' + creep.name + ' carries ' + resource);
            if(this.creep.carry[resource]){
                if(this.creep.carry[resource] == _.sum(this.creep.carry)){
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
            targets = this.creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return ((structure.structureType == STRUCTURE_SPAWN || structure.structureType == STRUCTURE_EXTENSION) && structure.energy < structure.energyCapacity) ||
                            ((structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && _.sum(structure.store) < structure.storeCapacity);
                }
            });            
        }
        else {
            //Structures that can hold any resource
            targets = this.creep.room.find(FIND_STRUCTURES, {
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
            return this.creep.transfer(target,resourceType);
        }
        else {
            //Transfer all resources
            let rtvl = OK;
            for(let i=0; i<resourceType.length; i++){
                rtvl = Math.min(rtvl,this.creep.transfer(target,resourceType[i]));
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
                 if(this.creep.memory.role == 'melee' || this.creep.memory.role == 'ranged' || this.creep.memory.role == 'patroller'){
                     let costs = Game.rooms[roomName].memory.CombatCostMatrix;
                     if(costs){
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
             //console.log(creep.name + ' ' + rangeTarget);
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
        return this.moveTo([{pos: {x: 24,y: 24,'roomName': roomName}}], 24);
    }
};


module.exports = Creep;