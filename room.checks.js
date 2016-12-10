var util = require('utilities');

var containerTypes =    {'W32N25':  {spawn: ['58226bc89d1337e96f0bc74c'], source: ['58234c0f75142eb1527ef29a','582449c6852069e3738952f4'], upgrader: [], storage: ['5824a75dde7e423a24687110'], mineral: ['582c36761eccb64661ae20ca']},
                         'W32N26':  {source: ['582ee4b61c767e89607e4f7c','582f20c82c85133779640d8b']},
                         'W33N26': {source: ['582a30d58a7f82d76d8f7990'], spawn: ['582c83db88abb4aa6bc3ca6e','583ad1ec9973e30967389d77'], upgrader: ['582cd706ad35b387769fa311'], storage: ['582f7af656ce442154c463d9'], mineral: ['583c1b5e0ced9eec78e60f1a']},
                         'W33N25': {source: ['582f10e9441501f55510d932']}
                        };
                        
var linkTypes = {'W32N25': {source: ['5826fea9b8b599ef1fb7a3b1','58352f6311cc83924b9c1f4b'], upgrader: ['582c2c3244fd95cf54c58ff5'], storage:['5826f938df8e27b9696633ed'], spawn: []},
                 'W33N26': {storage: ['5832ef8dcb8221aa2780ee16'], source: ['583347d842b4a7fc1e31336a'], upgrader: ['583b1c3e60dd444848e8229e']}
                };                        
                        
var defStructHits = {'W32N25': {walls: 300000, ramparts: 300000},
                     'W33N26': {walls: 300000, ramparts: 300000}
                    };

var RoomChecks = function(room){
    this.room = room;
};

RoomChecks.prototype.check = function(){
    //console.log(this.room.name + ' check');
    this.defend();
    //console.log(this.room.name + ' defended');
    this.createCostMatrix();
    //console.log(this.room.name + ' costs');
    this.searchDamagedStructures();
    //console.log(this.room.name + ' damage');
    this.checkEnergy();
    this.assignSources();
    this.assignContainers();
    this.assignLinks();
    this.searchDroppedResources();
};

RoomChecks.prototype.defend = function(){
    let start = Game.cpu.getUsed();
    
    //Check if room is under attack and activate towers.
    let hostiles = this.room.find(FIND_HOSTILE_CREEPS);
    let nEnemies = hostiles.length;
    if(!this.room.memory.defense){
        this.room.memory.defense = {hostiles: {number: undefined}};
    }
    this.room.memory.defense.hostiles.number = hostiles.length;
    if(!this.room.memory.defense.underAttack && hostiles.length > 0) {
        console.log('Room ' + this.room.name + ' is under attack. ' + hostiles.length + ' enemies detected. (Game tick ' + Game.time + ')');
        this.room.memory.defense.lastAttack = Game.time;
        this.room.memory.defense.underAttack = true;
        this.room.memory.defense.lastAttacker = hostiles[0].owner.username;
    }
    if(this.room.memory.defense.underAttack && hostiles.length == 0) {
        console.log('All enemies in room ' + this.room.name + ' have been defeated. (Game tick ' + Game.time + ')');
        this.room.memory.defense.underAttack = false;
    }
    
    if(this.room.memory.defense.underAttack) {
        //Look which type of hostiles are in room.
        this.room.memory.defense.hostiles = classifyHostiles(hostiles);
        this.room.memory.defense.hostiles.number = hostiles.length;
        if(this.room.controller && this.room.controller.owner && this.room.controller.owner.username == 'Vervust'){
            //Look for ramparts and store in room memory
            let ramparts = this.room.find(FIND_MY_STRUCTURES, { 
                filter: (struct) => {
                    return struct.structureType == STRUCTURE_RAMPART;
                }
            });
            this.room.memory.defense.rampart = classifyRamparts(ramparts,this.room.memory.defense);
            
            //Look for towers and store in room memory
            let towers = this.room.find(FIND_MY_STRUCTURES, {
                filter :    (structure) => {
                        return structure.structureType == STRUCTURE_TOWER;
                }
            });
            this.room.memory.defense.tower = util.gatherIdsInArrayFromObjects(towers);
            //console.log(room.name + ' defense ' + JSON.stringify(defense));        
            
            //Attack with towers
            towers = towers.filter((tow) => {return tow.energy > 10});
            if(towers.length) {
                //console.log('Hostiles ' + JSON.stringify(hostiles));
                let healers = hostiles.filter((hostile) => {return hostile.body.filter((bodyPart) => {return bodyPart.type == HEAL}).length});
                //console.log('Healers ' + healers);
                for(let i=0; i<towers.length; i++){
                    let closestHealer = towers[i].pos.findClosestByRange(healers);
                    //console.log('Close healer ' + closestHealer);
                    if(closestHealer){
                        towers[i].attack(closestHealer);
                    }
                    else {
                        let closestHostile = towers[i].pos.findClosestByRange(hostiles);
                        towers[i].attack(closestHostile);                    
                    }
                }                
            }
            
            //Check if walls have been breached
            let goals = [];
            let reference = {};
            for(let i=0; i<hostiles.length; i++){
                goals.push({pos: hostiles[i].pos, range: 1});
            }
            if(towers.length){
                //Assume towers are inside walls
                reference = towers[0];
            }
            else {
                //Controller must thus always be inside walls
                reference = this.room.controller;
            }
            
            let res = PathFinder.search(reference.pos,goals, 
            {
                maxRooms: 1,
                roomCallback: function(roomName){
                    if(!Game.rooms[roomName]) return;
                    let costs = new PathFinder.CostMatrix();
                    Game.rooms[roomName].find(FIND_STRUCTURES).forEach(function(structure) {
                        if(structure.structureType == STRUCTURE_RAMPART || structure.structureType == STRUCTURE_WALL){
                            costs.set(structure.pos.x, structure.pos.y, 0xff);
                        }
                    });
                    return costs;
                }
            });
            if(res.incomplete && this.room.memory.defense.breached){
                console.log('Defenses in room ' + this.room.name + ' are no longer breached');
                this.room.memory.defense.breached = false;
            }
            if(!res.incomplete && !this.room.memory.defense.breached) {
                console.log('Defenses in room ' + this.room.name + ' have been breached');
                this.room.memory.defense.breached = true;
            }            
        }
    }
    
    function classifyHostiles(hostiles){
        let hostileBodyCount = util.countBodyParts(hostiles);
        let types = {melee: [], ranged: [], heal: [], meleeHeal: [], meleeRanged: [], rangedHeal: [], hybrid: [], claim: [], other: []}
        
         for(let i=0; i<hostileBodyCount.length; i++){
             if(hostileBodyCount[i][ATTACK] || hostileBodyCount[i][WORK]){
                 if(hostileBodyCount[i][HEAL]){
                     if(hostileBodyCount[i][RANGED_ATTACK]){
                         types.hybrid.push(hostileBodyCount[i].id);
                     }
                     else {
                         types.meleeHeal.push(hostileBodyCount[i].id);
                     }
                 }
                 else if(hostileBodyCount[i][RANGED_ATTACK]){
                     types.meleeRanged.push(hostileBodyCount[i].id);
                 }
                 else {
                     types.melee.push(hostileBodyCount[i].id);
                 }
             }
             else if(hostileBodyCount[i][RANGED_ATTACK]){
                 if(hostileBodyCount[i][HEAL]){
                     types.rangedHeal.push(hostileBodyCount[i].id);
                 }
                 else {
                     types.ranged.push(hostileBodyCount[i].id);
                 }
             }
             else if(hostileBodyCount[i][HEAL]){
                 types.heal.push(hostileBodyCount[i].id);
             }
             else if(hostileBodyCount[i][CLAIM]){
                 types.claim.push(hostileBodyCount[i].id);
             }
             else {
                 types.other.push(hostileBodyCount[i].id);
             }
         }      
         return types;
    }
    
    function classifyRamparts(ramparts,defense){
        let rampart = {melee: [], ranged: [], other: []};
        
        let hostilesRange1 = util.gatherObjectsInArrayFromIds(defense.hostiles,'melee','meleeRanged','meleeHeal','ranged','rangedHeal','heal','claim','hybrid');
        let rampartHostilesInRange1 = util.targetsInRange(ramparts,hostilesRange1,1);
        let rampartsWithoutTargets = util.findArrayOfDifferentElements(ramparts,rampartHostilesInRange1);
        let closeRangeHostilesRange3 = util.gatherObjectsInArrayFromIds(defense.hostiles,'melee','meleeRanged','meleeHeal','hybrid');
        let rampartCloseRangeHostilesRange3 = util.targetsInRange(rampartsWithoutTargets,closeRangeHostilesRange3,3);
        rampartsWithoutTargets = util.findArrayOfDifferentElements(rampartsWithoutTargets,rampartCloseRangeHostilesRange3);
        let hostilesRange3 = util.gatherObjectsInArrayFromIds(defense.hostiles,'ranged','rangedHeal','heal','claim');
        let rampartHostilesInRange3 = util.targetsInRange(rampartsWithoutTargets,hostilesRange3,3);
        rampartsWithoutTargets = util.findArrayOfDifferentElements(rampartsWithoutTargets,rampartHostilesInRange3);
        rampart.melee = util.gatherIdsInArrayFromObjects(rampartHostilesInRange1.concat(rampartCloseRangeHostilesRange3));
        rampart.ranged = util.gatherIdsInArrayFromObjects(rampartHostilesInRange3);
        rampart.other = util.gatherIdsInArrayFromObjects(rampartsWithoutTargets);
        
        return rampart;
    }
    let used = Game.cpu.getUsed() - start;
    //console.log('Checking defense in room '+ room.name + ' took '+ used + ' cpu units');     
};

RoomChecks.prototype.createCostMatrix = function(){
    //let start = Game.cpu.getUsed();     
    
    //Create cost matrix
    let costs = new PathFinder.CostMatrix();
    this.room.find(FIND_STRUCTURES).forEach(function(structure) {
     if(structure.structureType == STRUCTURE_ROAD) {
         // Favor roads over plain tiles
         costs.set(structure.pos.x, structure.pos.y, 1);
     }
     else if (structure.structureType == STRUCTURE_WALL) {
         costs.set(structure.pos.x, structure.pos.y, 0xff);
     }
     else if (structure.structureType !== STRUCTURE_CONTAINER && (structure.structureType !== STRUCTURE_RAMPART || !structure.my)) {
         // Can't walk through non-walkable buildings
         costs.set(structure.pos.x, structure.pos.y, 0xff);
     }
    });
    // Avoid construction sites
    this.room.find(FIND_CONSTRUCTION_SITES).forEach(function(structure) {
        if(structure.structureType != STRUCTURE_ROAD){
            costs.set(structure.pos.x, structure.pos.y, 0xff);
        }
    });
    // Avoid creeps in the room
    this.room.find(FIND_CREEPS).forEach(function(creep) {
     costs.set(creep.pos.x, creep.pos.y, 0xff);
     if(creep.owner.username != 'Vervust'){
         for(let i=-3; i<4; i++){
             for(let j=-3; j<4; j++){
                 costs.set(creep.pos.x+i,creep.pos.y+j,0xff);
             }
         }
     }
    });
    //let usedCreate = Game.cpu.getUsed() - start;
    //console.log('Matrix '+ JSON.stringify(costs));
    //console.log(room.name + ' costMatrix creation in room '+ room.name + ' took '+ usedCreate + ' cpu units');
    //Can save memory. Extra cpu cost.
    //let startS = Game.cpu.getUsed();
    //let mySerialized = util.serializeCostMatrix(costs);
    //let myDeserialized = util.deserializeCostMatrix(mySerialized);
    //let usedS = Game.cpu.getUsed() - startS;
    //console.log(room.name + ' my (de)serialize took ' + usedS + ' cpu units');
    this.room.memory.CostMatrix = costs.serialize();
    //let used = Game.cpu.getUsed() - start;
    //console.log('CostMatrix creation + serialization in room '+ room.name + ' took '+ used + ' cpu units');     
    
    if(this.room.memory.defense.underAttack){
        let combatCosts = new PathFinder.CostMatrix();
        this.room.find(FIND_STRUCTURES).forEach(function(structure) {
         if(structure.structureType == STRUCTURE_ROAD) {
             // Favor roads over plain tiles
             combatCosts.set(structure.pos.x, structure.pos.y, 1);
         }
         else if (structure.structureType == STRUCTURE_WALL) {
             combatCosts.set(structure.pos.x, structure.pos.y, 0xff);
         }
         else if (structure.structureType !== STRUCTURE_CONTAINER && (structure.structureType !== STRUCTURE_RAMPART || !structure.my)) {
             // Can't walk through non-walkable buildings
             combatCosts.set(structure.pos.x, structure.pos.y, 0xff);
         }
        });
        // Avoid construction sites
        this.room.find(FIND_CONSTRUCTION_SITES).forEach(function(structure) {
            if(structure.structureType != STRUCTURE_ROAD){
                combatCosts.set(structure.pos.x, structure.pos.y, 0xff);
            }
        });
        // Avoid creeps in the room
        this.room.find(FIND_CREEPS).forEach(function(creep) {
         combatCosts.set(creep.pos.x, creep.pos.y, 0xff);
        });        
        this.room.memory.CombatCostMatrix = combatCosts.serialize();
    }    
};

RoomChecks.prototype.searchDamagedStructures = function(){
    let start = Game.cpu.getUsed();
    
    if(defStructHits[this.room.name] == undefined){
        if(this.room.controller && this.room.controller.owner && this.room.controller.owner.username == 'Vervust'){
            console.log('No hits defined for defensive structures in room ' + this.room.name + '. Using default of 30K hits');
        }
        defStructHits[this.room.name] = {walls: 30000, ramparts: 30000};
    }
    
    //Search for structures to be repaired
    //1st remove completely repaired structures from list
    //Also remove structures that no longer exist
    this.room.memory.dmgStructures = _.filter(this.room.memory.dmgStructures, (id) => {
        let structure = Game.getObjectById(id);
        if(structure == undefined){
            return false;
        }
        let hitFrac = 1.0;
        if(structure.structureType == STRUCTURE_WALL){
            hitFrac *= defStructHits[this.room.name].walls/structure.hitsMax;
        }
        else if(structure.structureType == STRUCTURE_RAMPART){
            hitFrac *= defStructHits[this.room.name].ramparts/structure.hitsMax;
        }
        return structure.hits < hitFrac * structure.hitsMax;            
    });

    //Find all structures which have hits below the treshold
    let damagedStructures = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            let hitFrac = 1/2;
            if(structure.structureType == STRUCTURE_WALL){
                hitFrac *= 2*defStructHits[this.room.name].walls/structure.hitsMax;
            }
            else if(structure.structureType == STRUCTURE_RAMPART){
                hitFrac *= defStructHits[this.room.name].ramparts/structure.hitsMax;
            }
            return structure.hits < hitFrac * structure.hitsMax;
        }
    });
    for(let i=0; i<damagedStructures.length; i++){
        let match = false;
        for(let j=0; j<this.room.memory.dmgStructures.length && !match; j++){
            match = match || damagedStructures[i].id == this.room.memory.dmgStructures[j];
        }
        if(!match){
            this.room.memory.dmgStructures.push(damagedStructures[i].id);
            //New repair
            //console.log('Repairing structure ' + Game.getObjectById(damagedStructures[i].id) + ' in room ' + room.name);
        }
        
    }
    let used = Game.cpu.getUsed() - start;
    //console.log('Checking dmgd structures in room '+ room.name + ' took '+ used + ' cpu units');
};

RoomChecks.prototype.checkEnergy = function(){
    let start = Game.cpu.getUsed();    
    if(!this.room.controller || !this.room.controller.owner || !this.room.controller.owner.username == 'Vervust'){
        return;
    }
    //Check available and max energy in room
    let spawns = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_SPAWN;
        }
    });
    if(!this.room.memory.energy){
        this.room.memory.energy = {extensions: {available: 0, max: 0}, fillSpawn: false, structures: {spawn: [], extension: []}};
    }
    let avSpawnEnergy = 0;
    for(let i=0; i<spawns.length; i++){
        this.room.memory.energy[spawns[i].name] = spawns[i].energy;
        avSpawnEnergy += spawns[i].energy;
    }
    
    let extensions = this.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_EXTENSION;
        }
    });
    this.room.memory.energy.extensions.available = 0;
    for(let i=0; i<extensions.length; i++){
        this.room.memory.energy.extensions.available += extensions[i].energy;
    }
    
    this.room.memory.energy.extensions.max = EXTENSION_ENERGY_CAPACITY[this.room.controller.level] * extensions.length;
    this.room.memory.energy.fillSpawn = avSpawnEnergy + this.room.memory.energy.extensions.available < SPAWN_ENERGY_CAPACITY * spawns.length + EXTENSION_ENERGY_CAPACITY[this.room.controller.level] * extensions.length;
    this.room.memory.energy.structures = {spawn: util.gatherIdsInArrayFromObjects(spawns), extension: util.gatherIdsInArrayFromObjects(extensions)};
    let used = Game.cpu.getUsed() - start;
    //console.log('Checking energy structures in room '+ room.name + ' took '+ used + ' cpu units');    
};

RoomChecks.prototype.assignSources = function(){
    let energySources = this.room.find(FIND_SOURCES);
    let mineralSource = this.room.find(FIND_MINERALS);
    this.room.memory.sources = {energy: util.gatherIdsInArrayFromObjects(energySources), mineral: util.gatherIdsInArrayFromObjects(mineralSource)};
}

RoomChecks.prototype.assignContainers = function(){
    //Assign dedicated containers to rooms
    if(!(containerTypes[this.room.name] == undefined)){
        this.room.memory.containers = containerTypes[this.room.name];
    }    
    
    //Autodetect container types
    //let start = Game.cpu.getUsed();
    let containers = this.room.find(FIND_STRUCTURES, {filter: (struct) => {return struct.structureType == STRUCTURE_CONTAINER}});
    let sources = util.gatherObjectsInArrayFromIds(this.room.memory.sources,'energy');
    let minerals = util.gatherObjectsInArrayFromIds(this.room.memory.sources,'mineral');
    

    if(!this.room.memory.containers){
        this.room.memory.containers = {source: util.gatherIdsInArrayFromObjects(util.targetsInRange(containers,sources,2)), mineral: util.gatherIdsInArrayFromObjects(util.targetsInRange(containers,minerals,2))};
    }
    this.room.memory.containers.source = util.gatherIdsInArrayFromObjects(util.targetsInRange(containers,sources,2));
    this.room.memory.containers.mineral = util.gatherIdsInArrayFromObjects(util.targetsInRange(containers,minerals,2));
    //console.log(this.room.name + ' source containers auto ' + sourceContainerIds + ' manual ' + this.room.memory.containers.source);
    //console.log(this.room.name + ' mineral containers auto ' + mineralContainerIds + ' manual ' + this.room.memory.containers.mineral);    
    //let used = Game.cpu.getUsed() - start;
    //console.log('Autodetecting containers in room ' + this.room.name + ' took ' + used +' cpu units ');
};

RoomChecks.prototype.assignLinks = function(){
    //Assign dedicated links to rooms
    if(!(linkTypes[this.room.name] == undefined)){
        this.room.memory.links = linkTypes[this.room.name];
    }
};

RoomChecks.prototype.searchDroppedResources = function(){
    //Look for all dropped resources in the room
    let droppedResources = this.room.find(FIND_DROPPED_RESOURCES);
    this.room.memory.dropped = util.gatherIdsInArrayFromObjects(droppedResources);
};

module.exports = RoomChecks;