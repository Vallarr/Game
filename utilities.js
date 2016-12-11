/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var util = require('utilities');
 * mod.thing == 'a thing'; // true
 */
 
var util = {
    gatherObjectsInArrayFromIds: function(objects){
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
                objectsArray = objectsArray.concat(util.getArrayObjectsById(objects[subObjectKey]));
            }
        }
        else {
            for(let i=0; i<arguments.length; i++){
                if(objects[arguments[i]] == undefined){
                    continue;
                }
                objectsArray = objectsArray.concat(util.getArrayObjectsById(objects[arguments[i]]));
            }
        }
        return objectsArray;
    },
    
    gatherIdsInArrayFromObjects: function(objects){
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
    },

    getArrayObjectsById: function(ids){
        let objects = [];        
        if(!Array.isArray(ids)){
            return objects;
        }
        for(let i=0; i<ids.length; i++){
            objects.push(Game.getObjectById(ids[i]));
            if(objects[objects.length-1] == undefined){
                objects.pop();
            }
        }
        return objects;
    },
    
    countCreeps: function(){
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
    },
    
    findDifferentElement: function(array1,array2){
        //Find and return an element in array1 that is not present in array 2
        return util.findDifferent(array1,array2,(a,b) => {return a.id == b.id});
    },
    
    findDifferentString: function(array1,array2){
        //Find and return a string in array 1 that is not present in array 2
        return util.findDifferent(array1,array2,(a,b) => {return a == b});
    },
    
    findDifferent: function(array1,array2,f){
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
    },
    
    findArrayOfDifferentElements: function(array1,array2){
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
                if(array1[i].id == array2[j].id){
                    match = true;
                }
            }
            if(!match){
                differentElements.push(array1[i]);
            }
        }
        return differentElements;
    },
    
    findDubbles: function(array){
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
    },
    
    countBodyParts: function(hostiles){
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
    },
    
    targetsInRange: function(references, targets, range) {
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
    },
    
    serializeCostMatrix: function(costMatrix){
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
    },
    
    deserializeCostMatrix: function(serial){
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
    },
    
    targetsOfCreeps: function(nameInMem,f,room){
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
    },
    
    targetObjectsOfCreeps: function(nameInMem,room){
        return util.targetsOfCreeps(nameInMem,(trg) => {return Game.getObjectById(trg)},room);
    },
    
    targetRoomsOfCreeps: function(nameInMem,room){
        return util.targetsOfCreeps(nameInMem,(trg) => {return trg},room);
    },
    
    findClosestByRange: function(reference,targets){
        //Find target closest to reference based on linear distance
        //This search can spawn multiple rooms
        if(reference == undefined || targets == undefined || !Array.isArray(targets) || !targets.length){
            return null;
        }
        
        let closest = undefined;
        let closestRange = undefined;
        let distance = undefined;
        for(let i=0; i<targets.length; i++){
            if(reference.pos.roomName == targets[i].pos.roomName){
                distance = Math.sqrt(Math.pow(reference.pos.x - targets[i].pos.x,2) + Math.pow(reference.pos.y - targets[i].pos.y,2));
            }
            else {
                let horRoomDev = undefined;
                let vertRoomDev = undefined;
                if(reference.pos.roomName.substr(1,1) == targets[i].pos.roomName.substr(1,1)){
                    horRoomDev = Number(targets[i].pos.roomName.substr(2,2)) - Number(reference.pos.roomName.substr(2,2));
                    if(reference.pos.roomName.substr(1,1) == 'W') {horRoomDev*=-1}
                }
                else {
                    horRoomDev = Number(targets[i].pos.roomName.substr(2,2)) + Number(reference.pos.roomName.substr(2,2)) + 1;
                    if(reference.pos.roomName.substr(1,1) == 'E') {horRoomDev*=-1}
                }
                if(reference.pos.roomName.substr(3,1) == targets[i].pos.roomName.substr(3,1)){
                    vertRoomDev = Number(targets[i].pos.roomName.substr(4,2)) - Number(reference.pos.roomName.substr(4,2));
                    if(reference.pos.roomName.substr(3,1) == 'N') {vertRoomDev*=-1}
                }
                else {
                    vertRoomDev = Number(targets[i].pos.roomName.substr(4,2)) + Number(reference.pos.roomName.substr(4,2)) + 1;
                    if(reference.pos.roomName.substr(3,1) == 'S') {vertRoomDev*=-1}
                }
                //Not linear distance but sum of difference in 2 coordinates. This is used to penalize movement between rooms.
                distance = Math.abs(reference.pos.x - targets[i].pos.x,2 + horRoomDev * 50) + Math.abs(reference.pos.y - targets[i].pos.y,2 + vertRoomDev * 50);
            }
            if(!closestRange || distance < closestRange){
                closestRange = distance;
                closest = targets[i];                
            }
        }
        return closest;
    }
};

module.exports = util;