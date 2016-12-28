Room.prototype.check = function(){
    if(!roomObjects[this.name] || Game.time%10 == 0){
        this.reload = true;
        this.findStructures();
        this.searchDamagedStructures();
        this.assignSources();
        this.assignContainersAndLinks();
        this.searchDroppedResources();        
    }
    this.defend(); //Need
    this.checkEnergy(); //Need    
    this.createCostMatrix(); //Need part
};

Room.prototype.findStructures = function(){
    let structures = this.find(FIND_STRUCTURES);
    //console.log(structures);
    let struct = {};
    for(let i=0; i<structures.length; i++){
        if(struct[structures[i].structureType] == undefined){
            struct[structures[i].structureType] = [structures[i].id];
        }
        else {
            struct[structures[i].structureType].push(structures[i].id);
        }
    }
    if(!roomObjects[this.name]){
        roomObjects[this.name] = {structures: struct};
    }
    else {
        roomObjects[this.name].structures = struct;
    } 
};

Room.prototype.defend = function(){
    //Check if room is under attack and activate towers.
    let hostiles = this.find(FIND_HOSTILE_CREEPS, {filter: (h) => !ALLIES[h.owner.username]});
    let nEnemies = hostiles.length;
    if(!this.memory.defense){
        this.memory.defense = {};
    }
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
        roomObjects[this.name].hostiles = classifyHostilesv2(hostiles);
        if(this.controller && this.controller.owner && this.controller.owner.username == 'Vervust'){
            //Look for ramparts and store in room memory
            let ramparts = util.getArrayObjectsById(roomObjects[this.name].structures[STRUCTURE_RAMPART]);
            roomObjects[this.name].ramparts = classifyRamparts(ramparts,roomObjects[this.name].hostiles);
            
            //Look for towers and store in room memory
            let towers = util.getArrayObjectsById(roomObjects[this.name].structures[STRUCTURE_TOWER]);
            
            //Attack with towers
            towers = towers.filter((tow) => {return tow.energy > 10});
            if(towers.length) {
                let healers = util.gatherObjectsInArrayFromIds(roomObjects[this.name].hostiles,'heal','meleeHeal','rangedHeal','hybrid');
                for(let i=0; i<towers.length; i++){
                    let closestHealer = towers[i].pos.findClosestByRange(healers);
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
                //Storage must thus always be inside walls
                reference = util.getArrayObjectsById(roomObjects[this.name].structures[STRUCTURE_SPAWN])[0];
            }
            
            let res = PathFinder.search(reference.pos,goals, 
            {
                maxRooms: 1,
                roomCallback: function(roomName){
                    if(!Game.rooms[roomName]) return;
                    let costs = new PathFinder.CostMatrix();
                    let walls = util.getArrayObjectsById(roomObjects[this.name].structures[STRUCTURE_WALL]);
                    for(let i=0; i<walls.length; i++){
                        let structure = walls[i];
                        costs.set(structure.pos.x, structure.pos.y, 0xff);
                    }
                    let ramps = util.getArrayObjectsById(roomObjects[this.name].structures[STRUCTURE_RAMPART]);
                    for(let i=0; i<ramps.length; i++){
                        let structure = ramps[i];
                        costs.set(structure.pos.x, structure.pos.y, 0xff);
                    }
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
    
    function classifyHostilesv2(hostiles){
        //Possible speedup: use getActiveBodyParts function
        let types = {melee: [], ranged: [], heal: [], meleeHeal: [], meleeRanged: [], rangedHeal: [], hybrid: [], claim: [], other: [], number: hostiles.length};
        
         for(let i=0; i<hostiles.length; i++){
             if(hostiles[i].getActiveBodyparts(ATTACK) || hostiles[i].getActiveBodyparts(WORK)){
                 if(hostiles[i].getActiveBodyparts(HEAL)){
                     if(hostiles[i].getActiveBodyparts(RANGED_ATTACK)){
                         types.hybrid.push(hostiles[i].id);
                     }
                     else {
                         types.meleeHeal.push(hostiles[i].id);
                     }
                 }
                 else if(hostiles[i].getActiveBodyparts(RANGED_ATTACK)){
                     types.meleeRanged.push(hostiles[i].id);
                 }
                 else {
                     types.melee.push(hostiles[i].id);
                 }
             }
             else if(hostiles[i].getActiveBodyparts(RANGED_ATTACK)){
                 if(hostiles[i].getActiveBodyparts(HEAL)){
                     types.rangedHeal.push(hostiles[i].id);
                 }
                 else {
                     types.ranged.push(hostiles[i].id);
                 }
             }
             else if(hostiles[i].getActiveBodyparts(HEAL)){
                 types.heal.push(hostiles[i].id);
             }
             else if(hostiles[i].getActiveBodyparts(CLAIM)){
                 types.claim.push(hostiles[i].id);
             }
             else {
                 types.other.push(hostiles[i].id);
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
    
    function classifyRampartsv2(ramparts,hostiles){
        let rampart = {melee: [], ranged: [], other: []};
        
        let hostilesRange1 = util.concatArraysInObject(hostiles,'melee','meleeRanged','meleeHeal','ranged','rangedHeal','heal','claim','hybrid');
        let rampartHostilesInRange1 = util.targetsInRange(ramparts,hostilesRange1,1);
        let rampartsWithoutTargets = util.findArrayOfDifferentElements(ramparts,rampartHostilesInRange1);
        
        let closeRangeHostilesRange3 = util.concatArraysInObject(hostiles,'melee','meleeRanged','meleeHeal','hybrid');
        let rampartCloseRangeHostilesRange3 = util.targetsInRange(rampartsWithoutTargets,closeRangeHostilesRange3,3);
        rampartsWithoutTargets = util.findArrayOfDifferentElements(rampartsWithoutTargets,rampartCloseRangeHostilesRange3);
        
        let hostilesRange3 = util.concatArraysInObject(hostiles,'ranged','rangedHeal','heal','claim');
        let rampartHostilesInRange3 = util.targetsInRange(rampartsWithoutTargets,hostilesRange3,3);
        rampartsWithoutTargets = util.findArrayOfDifferentElements(rampartsWithoutTargets,rampartHostilesInRange3);
        
        rampart.melee = rampartHostilesInRange1.concat(rampartCloseRangeHostilesRange3);
        rampart.ranged = rampartHostilesInRange3;
        rampart.other = rampartsWithoutTargets;
        
        return rampart;
    }    
     
};

Room.prototype.createCostMatrix = function(){
    //Create cost matrix
    let costs = undefined
    if(this.reload){
        costs = new PathFinder.CostMatrix();
        for(let structureType in roomObjects[this.name].structures){
            let structures = util.getArrayObjectsById(roomObjects[this.name].structures[structureType]);
            for(let i=0; i<structures.length; i++){
                if(structureType == STRUCTURE_ROAD) {
                    // Favor roads over plain tiles
                    costs.set(structures[i].pos.x, structures[i].pos.y, 1);
                }
                else if (structureType == STRUCTURE_WALL) {
                    costs.set(structures[i].pos.x, structures[i].pos.y, 0xff);
                }
                else if (structureType !== STRUCTURE_CONTAINER && (structureType !== STRUCTURE_RAMPART || !structures[i].my)) {
                    // Can't walk through non-walkable buildings
                    costs.set(structures[i].pos.x, structures[i].pos.y, 0xff);
                }            
            }
        }
        // Avoid construction sites
        this.find(FIND_CONSTRUCTION_SITES).forEach(function(structure) {
            if(structure.structureType != STRUCTURE_ROAD && structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_CONTAINER){
                costs.set(structure.pos.x, structure.pos.y, 0xff);
            }
        });
        
        roomObjects[this.name].baseCostMatrix = costs.clone();        
    }
    else {
        costs = roomObjects[this.name].baseCostMatrix.clone();
    }
    
    let combatCosts = undefined;
    if(this.memory.defense.underAttack){
        combatCosts = costs.clone();
    }
    // Avoid creeps in the room
    this.find(FIND_CREEPS).forEach((creep) => {
     costs.set(creep.pos.x, creep.pos.y, 0xff);
     if(this.memory.defense.underAttack){
         combatCosts.set(creep.pos.x, creep.pos.y, 0xff);
     }
     if(creep.owner.username != 'Vervust' && !ALLIES[creep.owner.username]){
         for(let i=-3; i<4; i++){
             for(let j=-3; j<4; j++){
                 costs.set(creep.pos.x+i,creep.pos.y+j,0xff);
             }
         }
     }
    });
    roomObjects[this.name].CostMatrix = costs;
    roomObjects[this.name].CombatCostMatrix = combatCosts;
};

Room.prototype.searchDamagedStructures = function(){
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
        if(structure.owner && structure.owner.username != 'Vervust'){
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
    let damagedStructures = [];
    for(let structureType in roomObjects[this.name].structures){
        damagedStructures = damagedStructures.concat(roomObjects[this.name].structures[structureType].filter((id) => {
            let structure = Game.getObjectById(id);
            if(!structure){return false}
            if(structure.owner && structure.owner.username != 'Vervust'){
                return false;
            }              
            let hitFrac = 1/2;
            if(structure.structureType == STRUCTURE_WALL){
                hitFrac *= 2*defStructHits[this.name].walls/structure.hitsMax;
            }
            else if(structure.structureType == STRUCTURE_RAMPART){
                hitFrac *= 2*0.9*defStructHits[this.name].ramparts/structure.hitsMax;
            }
            return structure.hits < hitFrac * structure.hitsMax;            
        }));
    }
    damagedStructures = util.getArrayObjectsById(damagedStructures);
    for(let i=0; i<damagedStructures.length; i++){
        let match = false;
        for(let j=0; j<this.memory.dmgStructures.length && !match; j++){
            match = damagedStructures[i].id == this.memory.dmgStructures[j];
        }
        if(!match){
            this.memory.dmgStructures.push(damagedStructures[i].id);
            //New repair
        }
    }
};

Room.prototype.checkEnergy = function(){
    if(!this.controller || !this.controller.owner || !this.controller.owner.username == 'Vervust'){
        return;
    }
    //Check available and max energy in room
    let spawns = util.getArrayObjectsById(roomObjects[this.name].structures[STRUCTURE_SPAWN]);
    if(!spawns){
        spawns = [];
    }
    
    let extensions = util.getArrayObjectsById(roomObjects[this.name].structures[STRUCTURE_EXTENSION]);
    if(!extensions){
        extensions = [];
    }
    
    roomObjects[this.name].toFill = spawns.filter((s) => s.energy < s.energyCapacity).concat(extensions.filter((e) => e.energy < e.energyCapacity));
};

Room.prototype.assignSources = function(){
    let energySources = this.find(FIND_SOURCES);
    let mineralSource = this.find(FIND_MINERALS);
    roomObjects[this.name].sources = {energy: util.gatherIdsInArrayFromObjects(energySources), mineral: util.gatherIdsInArrayFromObjects(mineralSource)};
};

Room.prototype.assignContainersAndLinks = function(){
    //Autodetect container types
    let containers = util.getArrayObjectsById(roomObjects[this.name].structures[STRUCTURE_CONTAINER]);
    let sources = util.getArrayObjectsById(roomObjects[this.name].sources.energy);
    let minerals = util.getArrayObjectsById(roomObjects[this.name].sources.mineral);
    let extAndSp = undefined;
    if(roomObjects[this.name].structures[STRUCTURE_SPAWN]){
        extAndSp = util.getArrayObjectsById(roomObjects[this.name].structures[STRUCTURE_SPAWN]);
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
        let spawnContainers = util.targetsInRange(containers,extAndSp,3);
        containers = util.findArrayOfDifferentElements(containers,spawnContainers);            
        
        roomObjects[this.name].containers = {};
        roomObjects[this.name].containers.source = util.gatherIdsInArrayFromObjects(sourceContainers.concat(containers));
        roomObjects[this.name].containers.mineral = util.gatherIdsInArrayFromObjects(mineralContainers);
        roomObjects[this.name].containers.spawn = util.gatherIdsInArrayFromObjects(spawnContainers);
        roomObjects[this.name].containers.upgrader = util.gatherIdsInArrayFromObjects(upgraderContainers);
        if(this.storage){roomObjects[this.name].containers.storage = util.gatherIdsInArrayFromObjects([this.storage])}
    }
    
    //Assign dedicated links to rooms
    let links = util.getArrayObjectsById(roomObjects[this.name].structures[STRUCTURE_LINK]);
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
        let spawnLinks = util.targetsInRange(links,extAndSp,3);
        links = util.findArrayOfDifferentElements(links,spawnLinks);
        
        roomObjects[this.name].links = {};
        roomObjects[this.name].links.source = util.gatherIdsInArrayFromObjects(sourceLinks.concat(links));
        roomObjects[this.name].links.storage = util.gatherIdsInArrayFromObjects(storageLinks);
        roomObjects[this.name].links.upgrader = util.gatherIdsInArrayFromObjects(upgraderLinks);
        roomObjects[this.name].links.spawn = util.gatherIdsInArrayFromObjects(spawnLinks);
    }
};

Room.prototype.searchDroppedResources = function(){
    //Look for all dropped resources in the room
    let droppedResources = this.find(FIND_DROPPED_RESOURCES);
    roomObjects[this.name].dropped = util.gatherIdsInArrayFromObjects(droppedResources);
};cts(droppedResources);
};

module.exports = RoomChecks;