Room.prototype.check = function(){
    //console.log(this.name + ' check');
    this.findStructures();
    this.defend();
    //console.log(this.name + ' defended');
    this.createCostMatrix();
    //console.log(this.name + ' costs');
    this.searchDamagedStructures();
    //console.log(this.name + ' damage');
    this.checkEnergy();
    this.assignSources();
    this.assignContainersAndLinks();
    this.searchDroppedResources();
};

Room.prototype.findStructures = function(){
    let structures = this.find(FIND_STRUCTURES);
    //console.log(structures);
    let struct = {};
    for(let i=0; i<structures.length; i++){
        if(struct[structures[i].structureType] == undefined){
            struct[structures[i].structureType] = [structures[i]];
        }
        else {
            struct[structures[i].structureType].push(structures[i]);
        }
    }
    //console.log(this.name + ' structures found ' + struct[STRUCTURE_WALL]);
    //struct[STRUCTURE_CONTAINER] = this.assignContainers(struct[STRUCTURE_CONTAINER],struct[STRUCTURE_EXTENSION].concat(struct[STRUCTURE_SPAWN]));
    if(!roomObjects[this.name]){
        roomObjects[this.name] = {structures: struct};
    }
    else {
        roomObjects[this.name].structures = struct;
    } 
};

Room.prototype.defend = function(){
    //let start = Game.cpu.getUsed();
    
    //Check if room is under attack and activate towers.
    let hostiles = this.find(FIND_HOSTILE_CREEPS);
    //this.find(FIND_HOSTILE_CREEPS, {filter: (h) => !ALLIES[h.owner.username]});
    let nEnemies = hostiles.length;
    if(!this.defense){
        this.defense = {};
    }
    if(!this.memory.defense){
        this.memory.defense = {};
    }
    this.defense.hostiles = {number: hostiles.length};
    this.memory.defense.hostiles = {number: hostiles.length};
    if(!this.memory.defense.underAttack && hostiles.length > 0) {
        console.log('Room ' + this.name + ' is under attack. ' + hostiles.length + ' enemies detected. (Game tick ' + Game.time + ')');
        this.memory.defense.lastAttack = Game.time;
        this.memory.defense.underAttack = true;
        this.memory.defense.lastAttacker = hostiles[0].owner.username;
    }
    if(this.memory.defense.underAttack && hostiles.length == 0) {
        console.log('All enemies in room ' + this.name + ' have been defeated. (Game tick ' + Game.time + ')');
        this.memory.defense.underAttack = false;
    }
    
    if(this.memory.defense.underAttack) {
        //Look which type of hostiles are in room.
        this.defense.hostiles = classifyHostiles(hostiles);
        if(this.controller && this.controller.owner && this.controller.owner.username == 'Vervust'){
            //Look for ramparts and store in room memory
            let ramparts = this.find(FIND_MY_STRUCTURES, { 
                filter: (struct) => {
                    return struct.structureType == STRUCTURE_RAMPART;
                }
            });
            this.defense.rampart = classifyRamparts(ramparts,this.defense);
            
            //Look for towers and store in room memory
            let towers = this.find(FIND_MY_STRUCTURES, {
                filter :    (structure) => {
                        return structure.structureType == STRUCTURE_TOWER;
                }
            });
            this.defense.tower = util.gatherIdsInArrayFromObjects(towers);
            //console.log(this.name + ' defense ' + JSON.stringify(this.defense));        
            
            //Attack with towers
            towers = towers.filter((tow) => {return tow.energy > 10});
            if(towers.length) {
                //console.log('Hostiles ' + JSON.stringify(hostiles));
                let healers = this.defense.hostiles.heal.concat(this.defense.meleeHeal,this.defense.rangedHeal,this.defense.hybrid);
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
                reference = this.controller;
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
            if(res.incomplete && this.memory.defense.breached){
                console.log('Defenses in room ' + this.name + ' are no longer breached');
                this.memory.defense.breached = false;
            }
            if(!res.incomplete && !this.memory.defense.breached) {
                console.log('Defenses in room ' + this.name + ' have been breached');
                this.memory.defense.breached = true;
            }            
        }
    }
    
    function classifyHostiles(hostiles){
        //Possible speedup: use getActiveBodyParts function
        let hostileBodyCount = util.countBodyParts(hostiles);
        let types = {melee: [], ranged: [], heal: [], meleeHeal: [], meleeRanged: [], rangedHeal: [], hybrid: [], claim: [], other: [], number: hostiles.length};
        
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
    //let used = Game.cpu.getUsed() - start;
    //console.log('Checking defense in room '+ room.name + ' took '+ used + ' cpu units');     
};

Room.prototype.createCostMatrix = function(){
    //Create cost matrix
    let costs = new PathFinder.CostMatrix();
    /*for(let structureType in roomObjects[this.name].structures){
        for(let i=0; i<roomObjects[this.name].structures[structureType].length; i++){
            let struct = roomObjects[this.name].structures[structureType][i];
             if(structureType == STRUCTURE_ROAD) {
                 // Favor roads over plain tiles
                 costs.set(structure.pos.x, structure.pos.y, 1);
             }
             else if (structureType == STRUCTURE_WALL) {
                 costs.set(structure.pos.x, structure.pos.y, 0xff);
             }
             else if (structureType !== STRUCTURE_CONTAINER && (structure.structureType !== STRUCTURE_RAMPART || !structure.my)) {
                 // Can't walk through non-walkable buildings
                 costs.set(structure.pos.x, structure.pos.y, 0xff);
             }            
        }
    }*/
    this.find(FIND_STRUCTURES).forEach(function(structure) {
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
    this.find(FIND_CONSTRUCTION_SITES).forEach(function(structure) {
        if(structure.structureType != STRUCTURE_ROAD && structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_CONTAINER){
            costs.set(structure.pos.x, structure.pos.y, 0xff);
        }
    });
    // Avoid creeps in the room
    this.find(FIND_CREEPS).forEach(function(creep) {
     costs.set(creep.pos.x, creep.pos.y, 0xff);
     /*if(creep.owner.username != 'Vervust' && !ALLIES[creep.owner.username]){
         for(let i=-3; i<4; i++){
             for(let j=-3; j<4; j++){
                 costs.set(creep.pos.x+i,creep.pos.y+j,0xff);
             }
         }
     }*/     
     if(creep.owner.username != 'Vervust'){
         for(let i=-3; i<4; i++){
             for(let j=-3; j<4; j++){
                 costs.set(creep.pos.x+i,creep.pos.y+j,0xff);
             }
         }
     }
    });
    this.CostMatrix = costs;
    
    if(this.memory.defense.underAttack){
        let combatCosts = new PathFinder.CostMatrix();
        this.find(FIND_STRUCTURES).forEach(function(structure) {
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
        this.find(FIND_CONSTRUCTION_SITES).forEach(function(structure) {
            if(structure.structureType != STRUCTURE_ROAD && structure.structureType != STRUCTURE_RAMPART){
                combatCosts.set(structure.pos.x, structure.pos.y, 0xff);
            }
        });
        // Avoid creeps in the room
        this.find(FIND_CREEPS).forEach(function(creep) {
         combatCosts.set(creep.pos.x, creep.pos.y, 0xff);
        });        
        this.CombatCostMatrix = combatCosts;
    }    
};

Room.prototype.searchDamagedStructures = function(){
    //let start = Game.cpu.getUsed();
    
    if(defStructHits[this.name] == undefined){
        if(this.controller && this.controller.owner && this.controller.owner.username == 'Vervust'){
            console.log('No hits defined for defensive structures in room ' + this.name + '. Using default of 30K hits');
        }
        defStructHits[this.name] = {walls: 30000, ramparts: 30000};
    }
    
    //Search for structures to be repaired
    //1st remove completely repaired structures from list
    //Also remove structures that no longer exist
    this.memory.dmgStructures = _.filter(this.memory.dmgStructures, (id) => {
        let structure = Game.getObjectById(id);
        if(structure == undefined){
            return false;
        }
        let hitFrac = 1.0;
        if(structure.structureType == STRUCTURE_WALL){
            hitFrac *= defStructHits[this.name].walls/structure.hitsMax;
        }
        else if(structure.structureType == STRUCTURE_RAMPART){
            hitFrac *= defStructHits[this.name].ramparts/structure.hitsMax;
        }
        return structure.hits < hitFrac * structure.hitsMax;            
    });

    //Find all structures which have hits below the treshold
    let damagedStructures = this.find(FIND_STRUCTURES, {
        filter: (structure) => {
            let hitFrac = 1/2;
            if(structure.structureType == STRUCTURE_WALL){
                hitFrac *= 2*defStructHits[this.name].walls/structure.hitsMax;
            }
            else if(structure.structureType == STRUCTURE_RAMPART){
                hitFrac *= 2*0.9*defStructHits[this.name].ramparts/structure.hitsMax;
            }
            return structure.hits < hitFrac * structure.hitsMax;
        }
    });
    for(let i=0; i<damagedStructures.length; i++){
        let match = false;
        for(let j=0; j<this.memory.dmgStructures.length && !match; j++){
            match = match || damagedStructures[i].id == this.memory.dmgStructures[j];
        }
        if(!match){
            this.memory.dmgStructures.push(damagedStructures[i].id);
            //New repair
            //console.log('Repairing structure ' + Game.getObjectById(damagedStructures[i].id) + ' in room ' + room.name);
        }
        
    }
    //let used = Game.cpu.getUsed() - start;
    //console.log('Checking dmgd structures in room '+ this.name + ' took '+ used + ' cpu units');
};

Room.prototype.checkEnergy = function(){
    //let start = Game.cpu.getUsed();    
    if(!this.controller || !this.controller.owner || !this.controller.owner.username == 'Vervust'){
        return;
    }
    //Check available and max energy in room
    let spawns = this.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_SPAWN;
        }
    });
    if(!this.energy){
        this.energy = {extensions: {available: 0, max: 0}, fillSpawn: false, structures: {spawn: undefined, extension: undefined}};
    }
    let avSpawnEnergy = 0;
    for(let i=0; i<spawns.length; i++){
        this.energy[spawns[i].name] = spawns[i].energy;
        avSpawnEnergy += spawns[i].energy;
    }
    
    let extensions = this.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_EXTENSION;
        }
    });
    this.energy.extensions.available = 0;
    for(let i=0; i<extensions.length; i++){
        this.energy.extensions.available += extensions[i].energy;
    }
    
    this.energy.extensions.max = EXTENSION_ENERGY_CAPACITY[this.controller.level] * extensions.length;
    this.energy.fillSpawn = avSpawnEnergy + this.energy.extensions.available < SPAWN_ENERGY_CAPACITY * spawns.length + EXTENSION_ENERGY_CAPACITY[this.controller.level] * extensions.length;
    this.energy.structures = {spawn: util.gatherIdsInArrayFromObjects(spawns), extension: util.gatherIdsInArrayFromObjects(extensions)};
    this.energy.toFill = {spawn: util.gatherIdsInArrayFromObjects(spawns.filter((s) => s.energy < s.energyCapacity)), extension: util.gatherIdsInArrayFromObjects(extensions.filter((e) => e.energy < e.energyCapacity))}
    //let used = Game.cpu.getUsed() - start;
    //console.log('Checking energy structures in room '+ room.name + ' took '+ used + ' cpu units');    
};

Room.prototype.assignSources = function(){
    let energySources = this.find(FIND_SOURCES);
    let mineralSource = this.find(FIND_MINERALS);
    this.sources = {energy: util.gatherIdsInArrayFromObjects(energySources), mineral: util.gatherIdsInArrayFromObjects(mineralSource)};
    roomObjects[this.name].sources = {energy: energySources, mineral: mineralSource};
};

Room.prototype.assignContainersAndLinks = function(){
    //Autodetect container types
    //let containers = this.find(FIND_STRUCTURES, {filter: (struct) => {return struct.structureType == STRUCTURE_CONTAINER}});
    //let sources = util.gatherObjectsInArrayFromIds(this.sources,'energy');
    //let minerals = util.gatherObjectsInArrayFromIds(this.sources,'mineral');
    /*
    if(this.energy){
        extAndSp = util.gatherObjectsInArrayFromIds(this.energy.structures,'extension','spawn');
    }
    else {
        extAndSp = [];
    }*/
    
    let containers = roomObjects[this.name].structures[STRUCTURE_CONTAINER];
    let sources = roomObjects[this.name].sources.energy;
    let minerals = roomObjects[this.name].sources.mineral;
    let extAndSp = undefined;
    if(roomObjects[this.name].structures[STRUCTURE_EXTENSION]){
        extAndSp = roomObjects[this.name].structures[STRUCTURE_EXTENSION].concat(roomObjects[this.name].structures[STRUCTURE_SPAWN]);
    }
    else {
        extAndSp = [];
    }
    if(containers){
        if(!this.containers){
            this.containers = {};
        }
        let sourceContainers = util.targetsInRange(containers,sources,2);
        let mineralContainers = util.targetsInRange(containers,minerals,2);
        let upgraderContainers = undefined;
        if(this.controller){
            upgraderContainers = util.targetsInRange(containers,[this.controller],2);
        }
        else {upgraderContainers = []}
        containers = util.findArrayOfDifferentElements(containers,sourceContainers.concat(mineralContainers,upgraderContainers));
        let spawnContainers = util.targetsInRange(containers,extAndSp,1);
        containers = util.findArrayOfDifferentElements(containers,spawnContainers);            
        
        this.containers.source = util.gatherIdsInArrayFromObjects(sourceContainers.concat(containers));
        this.containers.mineral = util.gatherIdsInArrayFromObjects(mineralContainers);
        this.containers.spawn = util.gatherIdsInArrayFromObjects(spawnContainers);
        this.containers.upgrader = util.gatherIdsInArrayFromObjects(upgraderContainers);
        roomObjects[this.name].structures[STRUCTURE_CONTAINER] = {};
        roomObjects[this.name].structures[STRUCTURE_CONTAINER].source = sourceContainers.concat(containers);
        roomObjects[this.name].structures[STRUCTURE_CONTAINER].mineral = mineralContainers;
        roomObjects[this.name].structures[STRUCTURE_CONTAINER].spawn = spawnContainers;
        roomObjects[this.name].structures[STRUCTURE_CONTAINER].upgrader = upgraderContainers;
        if(this.storage){this.containers.storage = util.gatherIdsInArrayFromObjects([this.storage])}
        //console.log(this.name + ' source containers auto ' + sourceContainers);
        //console.log(this.name + ' mineral containers auto ' + mineralContainers);    
        //console.log(this.name + ' spawn containers auto ' + spawnContainers);    
        //console.log(this.name + ' upgrader containers auto ' + upgraderContainers);
        //console.log(this.name + ' containers left ' + containers);        
    }
    
    //Assign dedicated links to rooms
    //let links = this.find(FIND_STRUCTURES, {filter: (struct) => {return struct.structureType == STRUCTURE_LINK && struct.owner.username == 'Vervust'}});
    let links = roomObjects[this.name].structures[STRUCTURE_LINK];
    if(links){links = links.filter((l) => {return l.owner.username == 'Vervust'})}
    if(links){
        if(!this.links){
            this.links = {};
        }         
        
        let sourceLinks = util.targetsInRange(links,sources,2);
        let storageLinks = undefined;
        if(this.storage){storageLinks = util.targetsInRange(links,[this.storage],1)}
        else {storageLinks = []}
        let upgraderLinks = undefined;
        if(this.controller){upgraderLinks = util.targetsInRange(links,[this.controller],2)}
        else {upgraderLinks = []}
        links = util.findArrayOfDifferentElements(links,sourceLinks.concat(storageLinks,upgraderLinks));
        let spawnLinks = util.targetsInRange(links,extAndSp,1);
        links = util.findArrayOfDifferentElements(links,spawnLinks);
        
        this.links.source = util.gatherIdsInArrayFromObjects(sourceLinks.concat(links));
        this.links.storage = util.gatherIdsInArrayFromObjects(storageLinks);
        this.links.upgrader = util.gatherIdsInArrayFromObjects(upgraderLinks);
        this.links.spawn = util.gatherIdsInArrayFromObjects(spawnLinks);
        roomObjects[this.name].structures[STRUCTURE_LINK] = {};
        roomObjects[this.name].structures[STRUCTURE_LINK].source = sourceLinks.concat(links);
        roomObjects[this.name].structures[STRUCTURE_LINK].storage = storageLinks;
        roomObjects[this.name].structures[STRUCTURE_LINK].upgrader = upgraderLinks;
        roomObjects[this.name].structures[STRUCTURE_LINK].spawn = spawnLinks;
    }
};

Room.prototype.searchDroppedResources = function(){
    //Look for all dropped resources in the room
    let droppedResources = this.find(FIND_DROPPED_RESOURCES);
    this.dropped = util.gatherIdsInArrayFromObjects(droppedResources);
    roomObjects[this.name].dropped = droppedResources;
};

module.exports = 'RoomChecks';