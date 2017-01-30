Room.prototype.check = function(){
    //console.log('In checks ' + JSON.stringify(this));
    if(!roomObjects[this.name] || Game.time%10 == 0){
        this.reload = true;
        this.findStructures();
        this.searchDamagedStructures();
        this.assignSources();
        this.assignContainersAndLinks();
        this.assignLabs();
        this.searchDroppedResources();        
    }
    this.defend(); //Need
    this.checkEnergy(); //Need
    //console.log(this.name + ' creating costMatrix');
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
    if(!this.memory.defense){
        this.memory.defense = {};
    }    
    if(!this.controller && (!roomObjects[this.name] || !roomObjects[this.name].structures[STRUCTURE_KEEPER_LAIR])){
        //Rooms in hallway don't need to be defended
        return;
    }
    let hostiles = this.find(FIND_HOSTILE_CREEPS, {filter: (h) => !ALLIES[h.owner.username]});
    let nEnemies = hostiles.length;
    this.memory.defense.nHostiles = hostiles.length;
    if(!this.memory.defense.underAttack && hostiles.length > 0) {
        //console.log('Room ' + this.name + ' is under attack. ' + hostiles.length + ' enemies detected. (Game tick ' + Game.time + ')');
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
        roomObjects[this.name].hostiles = classifyHostiles(hostiles);
        /*if(roomObjects[this.name].hostiles.number == roomObjects[this.name].hostiles.other.length){
            this.memory.defense.underAttack = false;
            return;
        }*/

        if(this.controller && this.controller.owner && this.controller.owner.username == 'Vervust'){
            this.createDefenders();
            
            //Look for ramparts and store in room memory
            let ramparts = util.getArrayObjectsById(roomObjects[this.name].structures[STRUCTURE_RAMPART]);
            roomObjects[this.name].ramparts = classifyRamparts(ramparts,roomObjects[this.name].hostiles);
            
            //Look for towers and store in room memory
            let towers = util.getArrayObjectsById(roomObjects[this.name].structures[STRUCTURE_TOWER]);
            
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
            else if (roomObjects[this.name].structures[STRUCTURE_SPAWN]){
                //Spawn must always be inside walls
                reference = util.getArrayObjectsById(roomObjects[this.name].structures[STRUCTURE_SPAWN])[0];
            }
            else {
                reference = this.controller;
            }
            
            let res = PathFinder.search(reference.pos,goals, 
            {
                maxRooms: 1,
                roomCallback: (roomName) => {
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
            
            //Attack with towers
            towers = towers.filter((tow) => {return tow.energy >= 10});
            if(towers.length){
                //Tower heal code
                //When under attack only heal defenders (check type) and no other creeps
                //Try to get as much healing power out of towers as possible. 
                    //If damage >= TOWER_POWER_HEAL let closest tower heal creep.
                    //If damage < TOWER_POWER_HEAL let furthest tower which has just enough heal power heal the creep
                    //Once tower is selected, remove it from array
                    //Repeat if there is leftover damage
                
                let allCreeps = this.find(FIND_CREEPS);
                let friendlyCreeps = util.findArrayOfDifferentElements(allCreeps,hostiles);
                let damagedCreeps = friendlyCreeps.filter((cr) => cr.hits < cr.hitsMax && ((cr.owner.username == 'Vervust' && cr.memory.type == 'defender') || ALLIES[cr.owner.username]));
                if(damagedCreeps.length){
                    //console.log('Towers before heal ' + towers);
                    let healingTowers = towersHealCreeps(damagedCreeps,towers);
                    towers = util.findArrayOfDifferentElements(towers,healingTowers);
                    //console.log('Healing towers ' + healingTowers);
                    //console.log('Towers after heal ' + towers);                    
                }
                
                //Tower damage code
                //Towers which do not need to heal can continue with attacks
                //Check if there are creeps which can get more damage from towers, then they can heal or get healed by creeps within range <=3 of it.
                //Attack creep in this category which can take most net damage, i.e. towerDamage - possible heal
                let loneHostile = undefined;
                let maxDamage = 0;
                //console.log('Hostiles ' + hostiles);
                for(let i=0; i<hostiles.length; i++){
                    let healCapacity = 0;
                    let hostilesInRange = util.targetsInRange(hostiles,[hostiles[i]],3);
                    //console.log('In range of ' + hostiles[i] + ': ' + hostilesInRange);
                    for(let j=0; j<hostilesInRange.length; j++){
                        healCapacity += hostilesInRange[j].threat[HEAL];
                    }
                    let netDamage = undefined;
                    if(hostiles[i].getActiveBodyparts(TOUGH)){
                        netDamage = hostiles[i].pos.towerDamage(towers) - healCapacity / CREEP_BODY_HITS * hostiles[i].threat[TOUGH] / hostiles[i].getActiveBodyparts(TOUGH) - DEFENSE_DAMAGE_SURPLUS;
                    }
                    else {
                        netDamage = hostiles[i].pos.towerDamage(towers) - healCapacity - DEFENSE_DAMAGE_SURPLUS;
                    }
                    //console.log('hostile ' + hostiles[i] + ' healcapacity ' + healCapacity + ' towerdamage ' + hostiles[i].pos.towerDamage() + ' damage ' + netDamage);
                    if(netDamage > maxDamage){
                        loneHostile = hostiles[i];
                        maxDamage = netDamage;
                    }
                }
                //console.log('lone hostile ' + loneHostile);
                if(loneHostile){
                    for(let i=0; i<towers.length; i++){
                        towers[i].attack(loneHostile);
                    }
                    console.log('Attacking lone hostile' + loneHostile);
                }
                else {
                    //If no such creeps exist, there is more heal capacity in room than towers can do damage (or creeps are still to far away)
                    //Towers will each target a separate healer (in hopes healers heal themselves before healing others)
                    //If there are less healers than towers, spare towers can attack non-healer creeps
                    let healers = util.gatherObjectsInArrayFromIds(roomObjects[this.name].hostiles,'heal','meleeHeal','rangedHeal','hybrid');
                    let combatCreeps = util.gatherObjectsInArrayFromIds(roomObjects[this.name].hostiles,'melee','ranged','meleeRanged','claim','hybrid');
                    if(healers.length > towers.length){
                        console.log('To much healing power');
                        //Do nothing untill defender arrives
                        //Determine hostile creep which can take most damage. Towers + attack + ranged attack (do this in 1st check)
                        //Creep which can take most surplus damage is attacked by all within range
                    }
                    else {
                        let combatMostDmg = undefined;
                        let healerMostDmg = undefined;
                        for(let i=0; i<towers.length; i++){
                            let closestHealer = towers[i].pos.findClosestByRange(healers);
                            if(closestHealer){
                                towers[i].attack(closestHealer);
                                healers = util.findArrayOfDifferentElements(healers,[closestHealer]);
                                console.log('Attack healer ' + closestHealer);
                            }
                            else if(combatCreeps.length){
                                //All leftover towers attack creep which can take most damage
                                if(!combatMostDmg){
                                    combatMostDmg = mostTowerDamage(combatCreeps,towers.slice(i));
                                }
                                towers[i].attack(combatMostDmg);
                                console.log('Attack combat ' + combatMostDmg);
                            }
                            else if(healers.length){
                                //Attack healer which can take most damage
                                if(!healerMostDmg){
                                    healerMostDmg = mostTowerDamage(healers,towers.slice(i));
                                }
                                towers[i].attack(healerMostDmg);
                                console.log('Attack healer ' + healerMostDmg);
                            }
                        }
                    }
                    
                }
            }
            
        }
    }
    else {
        //Have towers heal creeps in room
        if(this.controller && this.controller.owner && this.controller.owner.username == 'Vervust'){
            let towers = util.getArrayObjectsById(roomObjects[this.name].structures[STRUCTURE_TOWER]);
            let allCreeps = this.find(FIND_CREEPS);
            let friendlyCreeps = util.findArrayOfDifferentElements(allCreeps,hostiles);
            let damagedCreeps = friendlyCreeps.filter((cr) => cr.hits < cr.hitsMax);
            if(damagedCreeps.length){
                //console.log('Towers before heal ' + towers);
                let healingTowers = towersHealCreeps(damagedCreeps,towers);
                //console.log('Healing towers ' + healingTowers);
                towers = util.findArrayOfDifferentElements(towers,healingTowers);
                //console.log('Towers after heal ' + towers);
            }
        }
    }
    
    function mostTowerDamage(hostiles,towers){
        let mostDmg = 0;
        let hostileMostDmg = undefined;
        for(let j=0; j<hostiles.length; j++){
            let dmg = hostiles[j].pos.towerDamage(towers);
            if(dmg>mostDmg){
                mostDmg = dmg;
                hostileMostDmg = hostiles[j];
            }
        }
        return hostileMostDmg;
    }
    
    function towersHealCreeps(creeps,towers){
        let healingTowers = [];
        for(let i=0; i<creeps.length; i++){
            let damage = creeps[i].hitsMax - creeps[i].hits;
            while(damage > 0 && towers.length){
                if(damage >= TOWER_POWER_HEAL){
                    //console.log('Healing ' + creeps[i] + ' from close range. Damage ' + damage);
                    let closestTower = creeps[i].pos.findClosestByRange(towers);
                    if(closestTower){
                        closestTower.heal(creeps[i]);
                        damage -= creeps[i].pos.towerHeal([closestTower]);
                        towers = util.findArrayOfDifferentElements(towers,[closestTower]);
                        healingTowers.push(closestTower);
                    }
                }
                else {
                    let bestHeal = undefined;
                    let bestTower = undefined;
                    for(let j=0; j<towers.length; j++){
                        let heal = Math.abs(damage - creeps[i].pos.towerHeal(towers.slice(j,1)));
                        if(!bestHeal || heal < bestHeal){
                            bestHeal = heal;
                            bestTower = towers[j];
                        }
                    }
                    if(bestTower){
                        //console.log('Healing ' + creeps[i] + '. Damage ' + damage);
                        bestTower.heal(creeps[i]);
                        damage -= creeps[i].pos.towerHeal([bestTower]);
                        towers = util.findArrayOfDifferentElements(towers,[bestTower]);
                        healingTowers.push(bestTower);
                    }
                }
            }
        }
        return healingTowers;
    }
    
    function classifyHostiles(hostiles){
        //Possible speedup: use getActiveBodyParts function
        let types = {melee: [], ranged: [], heal: [], meleeHeal: [], meleeRanged: [], rangedHeal: [], hybrid: [], claim: [], other: [], number: hostiles.length, attack: 0, ranged_attack: 0, tough: 0, heal_power: 0};
        
         for(let i=0; i<hostiles.length; i++){
             hostiles[i].assessThreat();
             types.attack += hostiles[i].threat[ATTACK];
             types.ranged_attack += hostiles[i].threat[RANGED_ATTACK];
             if(hostiles[i].threat[TOUGH] > types.tough){
                 types.tough = hostiles[i].threat[TOUGH];
                 types.nTough = hostiles[i].getActiveBodyparts(TOUGH);
             }
             types.heal_power += hostiles[i].threat[HEAL];
             
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
        
        let hostilesRange1 = util.gatherObjectsInArrayFromIds(defense,'melee','meleeRanged','meleeHeal','ranged','rangedHeal','heal','claim','hybrid');
        let rampartHostilesInRange1 = util.targetsInRange(ramparts,hostilesRange1,1);
        let rampartsWithoutTargets = util.findArrayOfDifferentElements(ramparts,rampartHostilesInRange1);
        //console.log('Hostiles ' + hostilesRange1 + ' ramparts ' + rampartHostilesInRange1 + ' all ' + ramparts);
        
        let closeRangeHostilesRange3 = util.gatherObjectsInArrayFromIds(defense,'melee','meleeRanged','meleeHeal','hybrid');
        let rampartCloseRangeHostilesRange3 = util.targetsInRange(rampartsWithoutTargets,closeRangeHostilesRange3,3);
        rampartsWithoutTargets = util.findArrayOfDifferentElements(rampartsWithoutTargets,rampartCloseRangeHostilesRange3);
        
        let hostilesRange3 = util.gatherObjectsInArrayFromIds(defense,'ranged','rangedHeal','heal','claim');
        let rampartHostilesInRange3 = util.targetsInRange(rampartsWithoutTargets,hostilesRange3,3);
        rampartsWithoutTargets = util.findArrayOfDifferentElements(rampartsWithoutTargets,rampartHostilesInRange3);
        
        rampart.melee = util.gatherIdsInArrayFromObjects(rampartHostilesInRange1.concat(rampartCloseRangeHostilesRange3));
        rampart.ranged = util.gatherIdsInArrayFromObjects(rampartHostilesInRange3);
        rampart.other = util.gatherIdsInArrayFromObjects(rampartsWithoutTargets);
        
        return rampart;
    }
};

Room.prototype.createDefenders = function(){
    let towerDamage = 0;
    if(roomObjects[this.name].structures[STRUCTURE_TOWER]){
        //let towers = util.gatherObjectsInArrayFromIds(roomObjects[this.name].structures,STRUCTURE_TOWER);
        towerDamage = TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF) * roomObjects[this.name].structures[STRUCTURE_TOWER].length;
    }
    let minDmg = undefined;
    if(roomObjects[this.name].hostiles.nTough){
        minDmg = roomObjects[this.name].hostiles.heal_power / CREEP_BODY_HITS * roomObjects[this.name].hostiles.tough / roomObjects[this.name].hostiles.nTough;
    }
    else {
        minDmg = roomObjects[this.name].hostiles.heal_power;
    }
    
    //console.log('Min dmg ' + minDmg + ' tower dmg ' + towerDamage);
    
    if( minDmg + DEFENSE_DAMAGE_SURPLUS >= towerDamage){
        //Towers alone are not enough -> need to spawn additional creeps
        
        //Adjust later to create boosted creeps
        let nAttack = Math.ceil((minDmg + DEFENSE_DAMAGE_SURPLUS - towerDamage) / ATTACK_POWER);
        let maxAttackPerCreep = Math.min(Math.floor(this.energyCapacityAvailable / (BODYPART_COST[ATTACK] + BODYPART_COST[MOVE]/2)),DEFENSE_MAX_NUMBER_ATTACK);
        let nCombatCreeps = Math.ceil(nAttack / maxAttackPerCreep);
        let nAttackPerCreep = Math.ceil(nAttack / nCombatCreeps);
        let nMovePerCreep = Math.ceil(nAttackPerCreep / 2);
        if(nAttackPerCreep + nMovePerCreep > MAX_CREEP_SIZE){nAttackPerCreep -= nAttackPerCreep + nMovePerCreep - MAX_CREEP_SIZE}
        
        let body = util.generateBody({move: nMovePerCreep, attack: nAttackPerCreep});
        
        //console.log(this.name + ' defender creeps ' + nCombatCreeps + ' with body ' + body);
        
        creepsToSpawn[this.name]['defender']['combat'] = nCombatCreeps;
        if(!creepBodies[this.name]){
            creepBodies[this.name] = {defender: {combat: body}};
        }
        else if(!creepBodies[this.name]['defender']){
            creepBodies[this.name]['defender'] = {combat: body};
        }
        else {
            creepBodies[this.name]['defender']['combat'] = body;
        }
        
    }
}

Room.prototype.createCostMatrix = function(){
    //Create cost matrix
    let costs = undefined
    if(this.reload || !roomObjects[this.name].baseCostMatrix){
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
         for(let i=-4; i<5; i++){
             for(let j=-4; j<5; j++){
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
    let dismantleStructures = undefined;
    if(dismantle[this.name]){
        dismantleStructures = util.getArrayObjectsById(dismantle[this.name].ids);
    }
    else {dismantleStructures = []}
    damagedStructures = util.findArrayOfDifferentElements(damagedStructures,dismantleStructures);
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
    
    this.memory.criticalRepairs = this.memory.dmgStructures.filter((st) => {
        let structure = Game.getObjectById(st);
        let hitFrac = 0.1;
        if(structure.structureType == STRUCTURE_WALL){
            hitFrac *= defStructHits[this.name].walls/structure.hitsMax;
        }
        else if(structure.structureType == STRUCTURE_RAMPART){
            hitFrac *= defStructHits[this.name].ramparts/structure.hitsMax;
        }
        return structure.hits < hitFrac * structure.hitsMax;        
    });
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

Room.prototype.assignLabs = function(){
    //Auto detect source labs and destination labs. Always use same setup on 4x4 space (L=lab,R=road,0=empty/whatever)
    //Wait untill RCL 7 to build labs
    // RCL7         RCL8
    //R L L 0      R L L 0
    //0 R L 0      L R L L
    //0 L R 0      L L R L
    //0 L L R      0 L L R
    
    if(roomObjects[this.name].structures[STRUCTURE_LAB]){
        let labs = util.getArrayObjectsById(roomObjects[this.name].structures[STRUCTURE_LAB]);
        let sourceLabs = [];
        for(let i=0; i<labs.length && sourceLabs.length<2; i++){
            //console.log('Lab ' + labs[i] + ' in room ' + this.name + ' has ' + util.targetsInRange(labs,[labs[i]],2).length + ' labs in range');
            if(util.targetsInRange(labs,[labs[i]],2).length == labs.length){
                sourceLabs.push(labs[i]);
            }
        }
        let targetLabs = util.findArrayOfDifferentElements(labs,sourceLabs);
        
        //console.log(this.name + ' has labs: source ' + sourceLabs + ' target ' + targetLabs + ' all ' + labs);
        
        roomObjects[this.name].labs = {};
        roomObjects[this.name].labs.source = util.gatherIdsInArrayFromObjects(sourceLabs);
        roomObjects[this.name].labs.target = util.gatherIdsInArrayFromObjects(targetLabs);
    }
    
}

Room.prototype.searchDroppedResources = function(){
    //Look for all dropped resources in the room
    let droppedResources = this.find(FIND_DROPPED_RESOURCES);
    roomObjects[this.name].dropped = util.gatherIdsInArrayFromObjects(droppedResources);
};