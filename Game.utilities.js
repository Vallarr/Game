const profiler = require('screeps.profiler');

var Util = function(){
    
};

Util.prototype.gatherObjectsInArray = function(objects){
    //Gather as many subobjects as desired from object.
    let objectsArray = [];
    if(objects == undefined){
        //return empty array
        return objectsArray;
    }
    if(arguments.length == 1){
        //If no subObjects are specified, then get them all.
        for(let subObjectKey in objects){
            objectsArray = objectsArray.concat(objects[subObjectKey]);
        }
    }
    else {
        for(let i=1; i<arguments.length; i++){
            //console.log('Objects ' + objects[arguments[i]] + ' argument ' + arguments[i]);
            if(objects[arguments[i]] == undefined){
                continue;
            }
            objectsArray = objectsArray.concat(objects[arguments[i]]);
        }
    }
    return objectsArray;
};

Util.prototype.gatherObjectsInArrayFromIds = function(objects){
    //Gather as many subobjects as desired from object.
    //Subobjects must be Ids in array form.
    let objectsArray = [];
    if(objects == undefined){
        //return empty array
        return objectsArray;
    }
    if(arguments.length == 1){
        //If no subObjects are specified, then get them all.
        for(let subObjectKey in objects){
            objectsArray = objectsArray.concat(this.getArrayObjectsById(objects[subObjectKey]));
        }
    }
    else {
        for(let i=1; i<arguments.length; i++){
            if(objects[arguments[i]] == undefined){
                continue;
            }
            objectsArray = objectsArray.concat(this.getArrayObjectsById(objects[arguments[i]]));
        }
    }
    return objectsArray;
};

Util.prototype.gatherIdsInArrayFromObjects = function(objects){
    let ids = [];
    
    if(objects == undefined){
        return ids;
    }
    if(!Array.isArray(objects)){
        return ERR_INVALID_ARGS;
    }
    
    for(let i=0; i<objects.length; i++){
        ids.push(objects[i].id);
    }
    return ids;
};

Util.prototype.getArrayObjectsById = function(ids){
    let objects = [];        
    if(ids == undefined || !Array.isArray(ids)){
        return objects;
    }
    for(let i=0; i<ids.length; i++){
        let obj = Game.getObjectById(ids[i]);
        if(obj){
            objects.push(obj);
        }
    }
    return objects;
};

Util.prototype.concatArraysInObject = function(object){
    let array = [];
    if(object == undefined){
        return array;
    }
    
    if(arguments.length == 1){
        for(let ar in object){
            if(Array.isArray(object[ar])){
                array = array.concat(object[ar]);
            }
        }
    }
    else {
        for(let i=1; i<arguments.length; i++){
            if(Array.isArray(object[arguments[i]])){
                array = array.concat(arguments[i]);
            }
        }        
    }
};

Util.prototype.countCreeps = function(){
    let memoryEntry = {};
    for(let name in Game.creeps){
        let type = '';
        if(Game.creeps[name].memory.settler){
            type = 'settler';
        }
        else if(Game.creeps[name].memory.explorer){
            type = 'explorer';
        }
        if(memoryEntry[Game.creeps[name].memory.origin] == undefined){
            let mem = {};
            mem[type] = {};
            mem[type][Game.creeps[name].memory.role] = 1;
            memoryEntry[Game.creeps[name].memory.origin] = mem;
        }
        else if(memoryEntry[Game.creeps[name].memory.origin][type] == undefined){
            let mem = {};
            mem[Game.creeps[name].memory.role] = 1;
            memoryEntry[Game.creeps[name].memory.origin][type] = mem;
        }
        else if(memoryEntry[Game.creeps[name].memory.origin][type][Game.creeps[name].memory.role] == undefined){
            memoryEntry[Game.creeps[name].memory.origin][type][Game.creeps[name].memory.role] = 1;
        }
        else {
            memoryEntry[Game.creeps[name].memory.origin][type][Game.creeps[name].memory.role]++;
        }
    }
    for(let name in memoryEntry){
        Game.rooms[name].memory.creeps = memoryEntry[name];
    }
};

Util.prototype.findDifferentElement = function(array1,array2){
    //Find and return an element in array1 that is not present in array 2
    return this.findDifferent(array1,array2,(a,b) => {return a.id == b.id});
};

Util.prototype.findDifferentString = function(array1,array2){
    //Find and return a string in array 1 that is not present in array 2
    return this.findDifferent(array1,array2,(a,b) => {return a == b});
};

Util.prototype.findDifferent = function(array1,array2,f){
    //Find and return an element in array1 that is not present in array2
    //Whether or not 2 elements are the same is evaluated by function f
    if(array1 == undefined || array2 == undefined || !Array.isArray(array1) || ! Array.isArray(array2)){
        return ERR_INVALID_ARGS
    }
    
    let match = false;
    for(let i=0; i<array1.length; i++){
        match = false;
        for(let j=0; j<array2.length && !match; j++){
            match = f(array1[i],array2[j]);
        }
        if(!match){
            return array1[i];
        }
    }
    return ERR_NOT_FOUND;
};

Util.prototype.findArrayOfDifferentElements = function(array1,array2){
    //Find and return all elements in array1 that are not present in array 2
    return this.findArrayOfDifferent(array1,array2, (a,b) => {return a.id == b.id});
};

Util.prototype.findArrayOfDifferentStrings = function(array1,array2){
    //Find and return all elements in array1 that are not present in array 2
    return this.findArrayOfDifferent(array1,array2, (a,b) => {return a == b});
};

Util.prototype.findArrayOfDifferentRooms = function(array1,array2){
    return this.findArrayOfDifferent(array1,array2, (a,b) => {return a.name == b.name});
};

Util.prototype.findArrayOfDifferent = function(array1,array2,f){
    //Find and return all elements in array1 that are not present in array 2
    if(array1 == undefined || array2 == undefined){
        return ERR_INVALID_ARGS;
    }
    else if(!Array.isArray(array1) || !Array.isArray(array2)){
        return ERR_INVALID_ARGS;
    }
    
    let differentElements = [];
    let match = false;
    for(let i=0; i<array1.length; i++){
        match = false;
        for(let j=0; j<array2.length && !match; j++){
            match = f(array1[i],array2[j]);
        }
        if(!match){
            differentElements.push(array1[i]);
        }
    }
    return differentElements;
};

Util.prototype.findDubbles = function(array){
    let dubbleArray = [];
    let match = false;
    for(let i=0; i<array.length; i++){
        match = false;
        for(let j=i+1; j<array.length && !match; j++){
            if(array[i].id == array[j].id){
                dubbleArray.push(array[i]);
                match = true;
            }
        }
    }
    return dubbleArray;
};

Util.prototype.findDubbleStrings = function(array){
    let dubbleArray = [];
    let match = false;
    for(let i=0; i<array.length; i++){
        match = false;
        for(let j=i+1; j<array.length && !match; j++){
            if(array[i] == array[j]){
                dubbleArray.push(array[i]);
                match = true;
            }
        }
    }
    return dubbleArray;    
}

Util.prototype.findExtremum = function(array,f){
    //Find the maximum in array. Function f is used to evaluate the extremum other
    let max = undefined;
    if(!Array.isArray(array)){return max}
    
    for(let i=0; i<array.length; i++){
        if(!max || f(array[i],max)){
            max = array[i];
        }
    }
    return max;
    
}

Util.prototype.countBodyParts = function(hostiles){
    if(hostiles == undefined){
        return ERR_INVALID_ARGS;
    }
    else if(!Array.isArray(hostiles)){
        hostiles = [hostiles];
    }
    let hostileTypes = [];
    for(let i=0; i<hostiles.length; i++){
        let bodyCount = {};
        bodyCount.id = hostiles[i].id;
        for(let j=0; j<hostiles[i].body.length; j++){
            if(bodyCount[hostiles[i].body[j].type]){
                bodyCount[hostiles[i].body[j].type]++;
            }
            else {
                bodyCount[hostiles[i].body[j].type] = 1;
            }
        }
        hostileTypes.push(bodyCount);
    }
    return hostileTypes;
};

Util.prototype.generateBody = function(bp){
    let body = [];
    
    for(let part in bp){
        for(let i=0; i< bp[part]; i++){
            body.push(part);
        }
    }
    return body;
}

Creep.prototype.assessThreat = function(){
    let threat = {};
    threat[ATTACK] = 0;
    threat[RANGED_ATTACK] = 0;
    threat[TOUGH] = 0;
    threat[HEAL] = 0;
    threat[WORK] = 0;
    
    for(let i=0; i<this.body.length; i++){
        //if(this.body[i].hits == 0){continue}
        let power = undefined;
        let boost = undefined;
        
        if(this.body[i].type == ATTACK){
            power = ATTACK_POWER
            if(this.body[i].boost){boost = BOOSTS[this.body[i].type][this.body[i].boost].attack}
        }
        else if(this.body[i].type == RANGED_ATTACK){
            power = RANGED_ATTACK_POWER
            if(this.body[i].boost){boost = BOOSTS[this.body[i].type][this.body[i].boost].rangedAttack}
        }
        else if(this.body[i].type == HEAL){
            power = HEAL_POWER
            if(this.body[i].boost){boost = BOOSTS[this.body[i].type][this.body[i].boost].heal}
        }
        else if(this.body[i].type == TOUGH){
            power = CREEP_BODY_HITS
            if(this.body[i].boost){boost = 1/BOOSTS[this.body[i].type][this.body[i].boost].damage}
        }
        else if(this.body[i].type == WORK){
            power = DISMANTLE_POWER;
            if(this.body[i].boost){boost = BOOSTS[this.body[i].type][this.body[i].boost].dismantle}
        }
        if(boost == undefined){boost = 1}
        if(power){threat[this.body[i].type] += power * boost}
    }
    this.threat = threat;
}

Util.prototype.serializeCostMatrix = function(costMatrix){
    //Own version of costMatrix serialization
    //Try to achieve greater compression
    let start = Game.cpu.getUsed();
    let f = 1000;
    let serial = [];
    let n = 0;
    let prev = -1;
    for(let bit=0; bit<costMatrix._bits.length; bit++){
        if(costMatrix._bits[bit] == prev){
            n++;
        }
        else {
            if(n){
                serial.push(n * f + prev);
            }
            prev = costMatrix._bits[bit];
            n = 1;
        }
    }
    serial.push(n * f + prev);
    let used = Game.cpu.getUsed() - start;
    console.log('Serialize took ' + used + ' cpu units');
    return serial;
};

Util.prototype.deserializeCostMatrix = function(serial){
    //Own version of costMatrix deserialization
    let start = Game.cpu.getUsed();        
    let f = 1000; //Same value for f as in serialize
    let costMatrix = {_bits: {}};
    let bit =0;
    let n = 0;
    let value = 0;
    for(let j=0; j<serial.length; j++){
        n = Math.floor(serial[j]/f);
        value = serial[j]-n*f;
        for(let i=0; i<n; i++){
            costMatrix._bits[bit] = value;
            bit++;
        }
    }
    let used = Game.cpu.getUsed() - start;
    console.log('Deserialize took ' + used + ' cpu units');        
    return costMatrix;
};

Util.prototype.targetsOfCreeps = function(nameInMem,f,room){
    let targets = [];
    if(nameInMem == undefined){
        return targets;
    }
    let creepsWithTarget = undefined;
    if(room == undefined){
        creepsWithTarget = _.filter(Game.creeps, (creep) => {return creep.memory[nameInMem]});
    }
    else {
        creepsWithTarget = room.find(FIND_MY_CREEPS, {filter: (creep) => {return creep.memory[nameInMem]}});
    }
    let target = undefined;
    for(let i=0; i<creepsWithTarget.length; i++){
        target = f(creepsWithTarget[i].memory[nameInMem]);
        if(target){
            targets.push(target);
        }
    }
    return targets;
};

Util.prototype.targetObjectsOfCreeps = function(nameInMem,room){
    return this.targetsOfCreeps(nameInMem,(trg) => {return Game.getObjectById(trg)},room);
};

Util.prototype.targetRoomsOfCreeps = function(nameInMem,room){
    return this.targetsOfCreeps(nameInMem,(trg) => {return trg},room);
};

Util.prototype.targetsInRange = function(references, targets, range) {
    //Return references which are in range of targets
    if(references == undefined || targets == undefined){
        return ERR_INVALID_ARGS;
    }
    if(range == undefined){
        range = 1;
    }
    
    let inRange = [];
    for(let i=0; i<references.length; i++){
        let found = false;
        for(let j=0; j<targets.length && !found; j++){
            found = references[i].pos.inRangeTo(targets[j].pos, range);
        }
        if(found){
            inRange.push(references[i]);
        }
    }
    return inRange;
};

RoomPosition.prototype.closestByRange = function(targets, cutOffRange){
    //Find target closest to this position based on linear distance
    //This search can span multiple rooms
    if(targets == undefined || !Array.isArray(targets) || !targets.length){
        return null;
    }
    
    let closest = undefined;
    let closestRange = undefined;
    let distance = undefined;
    let range = undefined;
    for(let i=0; i<targets.length; i++){
        if(this.roomName == targets[i].pos.roomName){
            distance = Math.sqrt(Math.pow(this.x - targets[i].pos.x,2) + Math.pow(this.y - targets[i].pos.y,2));
            if(cutOffRange != undefined){
                range = Math.max(Math.abs(this.x - targets[i].pos.x),Math.abs(this.y - targets[i].pos.y));
                if(range <= cutOffRange){
                    return targets[i];
                }
            }            
        }
        else {
            let fromRoom = this.coordinatesFromRoomName();
            let toRoom = targets[i].pos.coordinatesFromRoomName;
            let horRoomDev = undefined;
            let vertRoomDev = undefined;
            if(fromRoom.horDir == toRoom.horDir){
                horRoomDev = toRoom.horCoord - fromRoom.horCoord;
                if(fromRoom.horDir == 'W') {horRoomDev*=-1}
            }
            else {
                horRoomDev = toRoom.horCoord + fromRoom.horCoord + 1;
                if(fromRoom.horDir == 'E') {horRoomDev*=-1}
            }
            if(fromRoom.vertDir == toRoom.vertDir){
                vertRoomDev = toRoom.vertCoord - fromRoom.vertCoord;
                if(fromRoom.vertDir == 'N') {vertRoomDev*=-1}
            }
            else {
                vertRoomDev = toRoom.vertCoord + fromRoom.vertCoord + 1;
                if(fromRoom.vertDir == 'S') {vertRoomDev*=-1}
            }      
            //Not linear distance but sum of difference in 2 coordinates. This is used to penalize movement between rooms.
            distance = Math.abs(targets[i].pos.x - this.x + horRoomDev * 50) + Math.abs(targets[i].pos.y - this.y + vertRoomDev * 50);
        }
        if(!closestRange || distance < closestRange){
            closestRange = distance;
            closest = targets[i];                
        }
    }
    return closest;
};

RoomPosition.prototype.coordinatesFromRoomName = function(){
    let room = this.roomName.split('');
    let horDir = undefined;
    let vertDir = undefined;
    let horCoord = '';
    let vertCoord = '';
    for(let i=0; i<room.length; i++){
        let temp = Number(room[i]);
        if(Number.isNaN(temp)){
            if(!horDir){
                horDir = room[i];
            }
            else {
                vertDir = room[i];
            }
        }
        else{
            if(vertDir){
                vertCoord += room[i];
            }
            else if(horDir){
                horCoord += room[i];
            }
        }
    }
    return {'horDir':horDir, 'vertDir': vertDir, 'horCoord': Number(horCoord), 'vertCoord': Number(vertCoord)};
};

Util.prototype.coordinatesFromRoomName = function(roomName){
    let room = roomName.split('');
    let horDir = undefined;
    let vertDir = undefined;
    let horCoord = '';
    let vertCoord = '';
    for(let i=0; i<room.length; i++){
        let temp = Number(room[i]);
        if(Number.isNaN(temp)){
            if(!horDir){
                horDir = room[i];
            }
            else {
                vertDir = room[i];
            }
        }
        else{
            if(vertDir){
                vertCoord += room[i];
            }
            else if(horDir){
                horCoord += room[i];
            }
        }
    }
    return {'horDir':horDir, 'vertDir': vertDir, 'horCoord': Number(horCoord), 'vertCoord': Number(vertCoord)};    
}

Util.prototype.findClosestRoomByRange = function(start,targets){
    if(start == undefined || targets == undefined || !Array.isArray(targets) || !targets.length){
        return null;
    }
    
    let fromRoom = util.coordinatesFromRoomName(start);
    let distance = undefined;
    let closestRoom = undefined;
    let closestRange = undefined;
    
    for(let i=0; i<targets.length; i++){
        let toRoom = util.coordinatesFromRoomName(targets[i]);
        let horRoomDev = undefined;
        let vertRoomDev = undefined;
        if(fromRoom.horDir == toRoom.horDir){
            horRoomDev = Math.abs(toRoom.horCoord - fromRoom.horCoord);
        }
        else {
            horRoomDev = Math.abs(toRoom.horCoord + fromRoom.horCoord + 1);
        }
        if(fromRoom.vertDir == toRoom.vertDir){
            vertRoomDev = Math.abs(toRoom.vertCoord - fromRoom.vertCoord);
        }
        else {
            vertRoomDev = Math.abs(toRoom.vertCoord + fromRoom.vertCoord + 1);
        }
        distance = vertRoomDev + horRoomDev;
        if(!closestRoom || distance < closestRange){
            closestRange = distance;
            closestRoom = targets[i];
        }        
    }
    //console.log('Closest to  ' + start + ' is ' + closestRoom);
    return closestRoom;
};

Util.prototype.classifyCreeps = function(creeps){
    let types = {melee: [], ranged: [], heal: [], meleeHeal: [], meleeRanged: [], rangedHeal: [], hybrid: [], claim: [], other: [], number: creeps.length, attack: 0, ranged_attack: 0, tough: 0, heal_power: 0};
    
     for(let i=0; i<creeps.length; i++){
         creeps[i].assessThreat();
         types.attack += creeps[i].threat[ATTACK];
         types.ranged_attack += creeps[i].threat[RANGED_ATTACK];
         if(creeps[i].threat[TOUGH] > types.tough){
             types.tough = creeps[i].threat[TOUGH];
             types.nTough = creeps[i].getActiveBodyparts(TOUGH);
         }
         types.heal_power += creeps[i].threat[HEAL];
         
         if(creeps[i].getActiveBodyparts(ATTACK) || creeps[i].getActiveBodyparts(WORK)){
             if(creeps[i].getActiveBodyparts(HEAL)){
                 if(creeps[i].getActiveBodyparts(RANGED_ATTACK)){
                     types.hybrid.push(creeps[i]);
                 }
                 else {
                     types.meleeHeal.push(creeps[i]);
                 }
             }
             else if(creeps[i].getActiveBodyparts(RANGED_ATTACK)){
                 types.meleeRanged.push(creeps[i]);
             }
             else {
                 types.melee.push(creeps[i]);
             }
         }
         else if(creeps[i].getActiveBodyparts(RANGED_ATTACK)){
             if(creeps[i].getActiveBodyparts(HEAL)){
                 types.rangedHeal.push(creeps[i]);
             }
             else {
                 types.ranged.push(creeps[i]);
             }
         }
         else if(creeps[i].getActiveBodyparts(HEAL)){
             types.heal.push(creeps[i]);
         }
         else if(creeps[i].getActiveBodyparts(CLAIM)){
             types.claim.push(creeps[i]);
         }
         else {
             types.other.push(creeps[i]);
         }
     }      
     return types;
};

Util.prototype.classifyRamparts = function(ramparts,creeps){
    let rampart = {melee: [], ranged: [], other: []};
    
    let hostilesRange1 = this.gatherObjectsInArray(creeps,'melee','meleeRanged','meleeHeal','ranged','rangedHeal','heal','claim','hybrid');
    let rampartHostilesInRange1 = this.targetsInRange(ramparts,hostilesRange1,1);
    let rampartsWithoutTargets = this.findArrayOfDifferentElements(ramparts,rampartHostilesInRange1);
    
    let closeRangeHostilesRange3 = this.gatherObjectsInArray(creeps,'melee','meleeRanged','meleeHeal','hybrid');
    let rampartCloseRangeHostilesRange3 = this.targetsInRange(rampartsWithoutTargets,closeRangeHostilesRange3,3);
    rampartsWithoutTargets = this.findArrayOfDifferentElements(rampartsWithoutTargets,rampartCloseRangeHostilesRange3);
    
    let hostilesRange3 = this.gatherObjectsInArray(creeps,'ranged','rangedHeal','heal','claim');
    let rampartHostilesInRange3 = this.targetsInRange(rampartsWithoutTargets,hostilesRange3,3);
    rampartsWithoutTargets = this.findArrayOfDifferentElements(rampartsWithoutTargets,rampartHostilesInRange3);
    
    rampart.melee = rampartHostilesInRange1.concat(rampartCloseRangeHostilesRange3);
    rampart.ranged = rampartHostilesInRange3;
    rampart.other = rampartsWithoutTargets;
    
    return rampart;
};

Object.defineProperty(Util.prototype, 'targOfCreeps', {
    get: function(){
        if(this == Util.prototype || this == undefined){return}
        if(!this._targetsOfCreeps){
            this._targetsOfCreeps = {};
            let possibleTargets = ['targetContainer','getDropped','controller','source','mineralSource','targetRoom','controllerRoom','sourceRoom','mineRoom','starterRoom'];
            for(let name in Game.creeps){
                let creep = Game.creeps[name];
                for(let i=0; i<possibleTargets.length; i++){
                    if(creep.memory[possibleTargets[i]]){
                        if(!this._targetsOfCreeps[possibleTargets[i]]){
                            this._targetsOfCreeps[possibleTargets[i]] = {[creep.memory[possibleTargets[i]]]: [creep], all: [creep.memory[possibleTargets[i]]]};
                        }
                        else {
                            this._targetsOfCreeps[possibleTargets[i]].all.push(creep.memory[possibleTargets[i]]);
                            if(!this._targetsOfCreeps[possibleTargets[i]][creep.memory[possibleTargets[i]]]){
                                this._targetsOfCreeps[possibleTargets[i]][creep.memory[possibleTargets[i]]] = [creep];
                            }
                            else {
                                this._targetsOfCreeps[possibleTargets[i]][creep.memory[possibleTargets[i]]].push(creep);
                            }
                        }
                    }
                }
            }
        }
        return this._targetsOfCreeps;
    },
    set: function(value){
        this._targetsOfCreeps = value;
    },
    enumerable: false,
    configurable: true
});

RoomPosition.prototype.towerPower = function(basePower,towers){
    let power = 0;
    if(basePower == undefined){
        return power;
    }
    if(towers == undefined){
        let room = Game.rooms[this.roomName];
        if(!room){
            return power;
        }
        towers = util.gatherObjectsInArray(room.structures,STRUCTURE_TOWER);
    }
    else if(!Array.isArray(towers)){
        return ERR_INVALID_ARGS;
    }
    
    for(let i=0; i<towers.length; i++){
        let range = this.getRangeTo(towers[i].pos);
        //console.log('Range from ' + this + ' to ' + towers[i] + ' is ' + range);
        if(range <= TOWER_OPTIMAL_RANGE){
            //console.log('Close damage');
            power += basePower;
        }
        else if(range >= TOWER_FALLOFF_RANGE){
            //console.log('Far damage');
            power += basePower * (1 - TOWER_FALLOFF);
        }
        else {
            //console.log('Intermediate damage ' + TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF * (range - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE)));
            power += basePower * (1 - TOWER_FALLOFF * (range - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE));
        }
    }
    return power;
};

RoomPosition.prototype.towerDamage = function(towers){
    return this.towerPower(TOWER_POWER_ATTACK,towers);
};

RoomPosition.prototype.towerHeal = function(towers){
    return this.towerPower(TOWER_POWER_HEAL,towers);
};

Object.defineProperty(RoomPosition.prototype, 'onExit', {
    get: function(){
        if(this === RoomPosition.prototype || this == undefined){return}
        if(!this._onExit){
            this._onExit = this.x == 0 || this.x == 49 || this.y == 0 || this.y == 49;
        }
        return this._onExit;
    },
    set: function(value){
        this._onExit = value;
    },
    enumerable: false,
    configurable: true
});

profiler.registerObject(Util, 'Util');

module.exports = Util;