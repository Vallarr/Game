Room.prototype.check = function(){
    this.initialize();
    this.defend();
    if(GCL_FARM[this.name]){
        let ordered = 0;
        if(this.memory.orders && this.memory.orders[RESOURCE_ENERGY]){
            ordered = this.memory.orders[RESOURCE_ENERGY];
        }
        if(this.terminal && this.terminal.isActive() && this.terminal.store[RESOURCE_ENERGY] + ordered < GCL_FARM_TERMINAL_FILL.low && _.sum(this.terminal.store) < MAX_STORE_TERMINAL){
            if(!this.memory.orders){this.memory.orders = {}}
            if(!this.memory.orders[RESOURCE_ENERGY]){this.memory.orders[RESOURCE_ENERGY] = 0}
            this.memory.orders[RESOURCE_ENERGY] += GCL_FARM_TERMINAL_FILL.high - ordered - this.terminal.store[RESOURCE_ENERGY];
        }
    }
};

Room.prototype.defend = function(){
    //Check if room is under attack and activate towers.
    if(!this.memory.defense){
        this.memory.defense = {};
    }    
    if(this.isHighWay){
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
        this.memory.defense.attacker = {};
        this.memory.defense.nAttackers = 0;
        for(let i=0; i<hostiles.length; i++){
            if(!this.memory.defense.attacker[hostiles[i].owner.username]){
                this.memory.defense.attacker[hostiles[i].owner.username] = true;
                this.memory.defense.nAttackers++;
            }
        }
    }
    if(this.memory.defense.underAttack && hostiles.length == 0) {
        //console.log('All enemies in room ' + this.name + ' have been defeated. (Game tick ' + Game.time + ')');
        this.memory.defense.underAttack = false;
        delete this.memory.defense.hopeLess;
        delete this.memory.defense.splitHealerAttack;
    }
    
    if(this.memory.defense.underAttack && this.controller && this.controller.owner && this.controller.my) {
        this.createDefenders();
        
        //Towers
        let towers = util.gatherObjectsInArray(this.structures,STRUCTURE_TOWER);
        
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
            spawns = util.gatherObjectsInArray(this.structures,STRUCTURE_SPAWN);
            if(spawns.length){
                //Spawn must always be inside walls
                reference = spawns[0];
            }
            else {
                reference = this.controller;
            }
        }
        
        let res = PathFinder.search(reference.pos,goals, 
        {
            maxRooms: 1,
            roomCallback: (roomName) => {
                let room = Game.rooms[roomName];
                if(!room) return;
                let costs = new PathFinder.CostMatrix();
                let wallAndRamp = util.gatherObjectsInArray(room.structures,STRUCTURE_WALL,STRUCTURE_RAMPART);
                for(let i=0; i<wallAndRamp.length; i++){
                    costs.set(wallAndRamp[i].pos.x, wallAndRamp[i].pos.y, 0xff);
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
        if(this.memory.defense.hopeLess && Game.time%ROOM_RESET_TIMER == 0){
            this.memory.defense.hopeLess = false;
            this.memory.defense.splitHealerAttack = false;
        }
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
                let healingTowers = towersHealCreeps(damagedCreeps,towers);
                towers = util.findArrayOfDifferentElements(towers,healingTowers);
            }
            
            //Tower damage code
            //Towers which do not need to heal can continue with attacks
            //Check if there are creeps which can get more damage from towers, then they can heal or get healed by creeps within range <=3 of it.
            //Attack creep in this category which can take most net damage, i.e. towerDamage - possible heal
            let loneHostile = getLoneHostile(hostiles,towers,true);
            if(loneHostile){
                for(let i=0; i<towers.length; i++){
                    towers[i].attack(loneHostile);
                }
            }
            else {
                loneHostile = getLoneHostile(hostiles,towers,false);
                if(loneHostile){
                    for(let i=0; i<towers.length; i++){
                        towers[i].attack(loneHostile);
                    }
                }
                else {
                    if(this.memory.defense.splitHealerAttack){
                        this.memory.defense.hopeLess = true;
                        this.memory.defense.splitHealerAttack = false;
                    }
                    if(!this.memory.defense.hopeLess){
                        //If no such creeps exist, there is more heal capacity in room than towers can do damage (or creeps are still to far away)
                        //Towers will each target a separate healer (in hopes healers heal themselves before healing others)
                        //If there are less healers than towers, spare towers can attack non-healer creeps
                        let healers = util.gatherObjectsInArray(this.creeps.hostiles,'heal','meleeHeal','rangedHeal','hybrid');
                        let combatCreeps = util.gatherObjectsInArray(this.creeps.hostiles,'melee','ranged','meleeRanged','claim');
                        if(healers.length > towers.length){
                            this.memory.defense.hopeLess = true;
                            //console.log('To much healing power');
                            //Do nothing untill defender arrives
                            //Determine hostile creep which can take most damage. Towers + attack + ranged attack (do this in 1st check)
                            //Creep which can take most surplus damage is attacked by all within range
                        }
                        else {
                            this.memory.defense.splitHealerAttack = true;
                            let combatMostDmg;
                            let healerMostDmg;
                            for(let i=0; i<towers.length; i++){
                                let closestHealer = towers[i].pos.findClosestByRange(healers);
                                if(closestHealer){
                                    towers[i].attack(closestHealer);
                                    healers = util.findArrayOfDifferentElements(healers,[closestHealer]);
                                    //console.log('Attack healer ' + closestHealer);
                                }
                                else if(combatCreeps.length){
                                    //All leftover towers attack creep which can take most damage
                                    if(!combatMostDmg){
                                        combatMostDmg = mostTowerDamage(combatCreeps,towers.slice(i));
                                    }
                                    towers[i].attack(combatMostDmg);
                                    //console.log('Attack combat ' + combatMostDmg);
                                }
                                else if(healers.length){
                                    //Attack healer which can take most damage
                                    if(!healerMostDmg){
                                        healerMostDmg = mostTowerDamage(healers,towers.slice(i));
                                    }
                                    towers[i].attack(healerMostDmg);
                                    //console.log('Attack healer ' + healerMostDmg);
                                }
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
            let towers = util.gatherObjectsInArray(this.structures,STRUCTURE_TOWER);
            let allCreeps = this.find(FIND_CREEPS);
            let friendlyCreeps = util.findArrayOfDifferentElements(allCreeps,hostiles);
            let damagedCreeps = friendlyCreeps.filter((cr) => cr.hits < cr.hitsMax);
            if(damagedCreeps.length){
                let healingTowers = towersHealCreeps(damagedCreeps,towers);
                towers = util.findArrayOfDifferentElements(towers,healingTowers);
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
    
    function getLoneHostile(hostiles,towers,allHealers){
        let loneHostile;
        let maxDamage = 0;
        let error;
        for(let i=0; i<hostiles.length; i++){
            let netDamage;
            try {
                let potHeal = allHealers ? hostiles[i].potentialHeal : hostiles[i].potentialHealNoDamage;
                let potDmg = hostiles[i].pos.towerDamage(towers); //Will become hostiles[i].pos.potentialDamage;
                let toughHits = hostiles[i].hits - (hostiles[i].toughHealth - hostiles[i].toughness);
                if(potDmg > hostiles[i].toughness){
                    netDamage = potDmg - hostiles[i].toughness - potHeal + toughHits;
                }
                else {
                    netDamage = potDmg * toughHits / hostiles[i].toughness - potHeal;
                }
            }
            catch(err){
                console.log("Error defending " + err);
                console.log(err.stack);
                error = err.stack;
                let healCapacity = 0;
                let hostilesInRange = util.targetsInRange(hostiles,[hostiles[i]],3);
                for(let j=0; j<hostilesInRange.length; j++){
                    hostilesInRange[j].assessThreat();
                    healCapacity += hostilesInRange[j].threat[HEAL];
                }
                if(hostiles[i].getActiveBodyparts(TOUGH)){
                    netDamage = hostiles[i].pos.towerDamage(towers) - healCapacity / CREEP_BODY_HITS * hostiles[i].threat[TOUGH] / hostiles[i].getActiveBodyparts(TOUGH) - DEFENSE_DAMAGE_SURPLUS;
                }
                else {
                    netDamage = hostiles[i].pos.towerDamage(towers) - healCapacity - DEFENSE_DAMAGE_SURPLUS;
                }
            }
            if(netDamage > maxDamage){
                loneHostile = hostiles[i];
                maxDamage = netDamage;
            }
        }
        if(error){
            Game.notify(error,60);
        }
        return loneHostile;
    }
};

Room.prototype.createDefenders = function(){
    if(this.memory.defense.nAttackers == 1  && this.memory.defense.attacker['Invader']){
        //Don't spawn attackers for invaders
        return;
    }
    let towers = util.gatherObjectsInArray(this.structures,STRUCTURE_TOWER);
    let towerDamage = TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF) * towers.length;
    let minDmg = undefined;
    if(this.creeps.hostiles.nTough){
        minDmg = this.creeps.hostiles.heal_power / CREEP_BODY_HITS * this.creeps.hostiles.tough / this.creeps.hostiles.nTough;
    }
    else {
        minDmg = this.creeps.hostiles.heal_power;
    }
    
    //console.log('Min dmg ' + minDmg + ' tower dmg ' + towerDamage);
    
    if( minDmg + DEFENSE_DAMAGE_SURPLUS >= towerDamage){
        //Towers alone are not enough -> need to spawn additional creeps
        let maxBoosts = Math.floor(this.mineralsInRoom[RESOURCE_CATALYZED_UTRIUM_ACID] / LAB_BOOST_MINERAL);
        let nAttack = Math.ceil((minDmg + DEFENSE_DAMAGE_SURPLUS - towerDamage) / ATTACK_POWER);
        let nAttackPerCreep = Math.min(Math.floor(this.energyCapacityAvailable / (BODYPART_COST[ATTACK] + BODYPART_COST[MOVE]/2)),DEFENSE_MAX_NUMBER_ATTACK);;
        let nMovePerCreep = Math.ceil(nAttackPerCreep / 2); 
        if(nAttackPerCreep + nMovePerCreep > MAX_CREEP_SIZE){nAttackPerCreep -= nAttackPerCreep + nMovePerCreep - MAX_CREEP_SIZE}
        let body = util.generateBody({[ATTACK]: nAttackPerCreep, [MOVE]: nMovePerCreep});
        if(nAttack > nAttackPerCreep && maxBoosts > 0){
            nAttack += Math.min(nAttack/BOOSTS[ATTACK][RESOURCE_CATALYZED_UTRIUM_ACID].attack,maxBoosts) - Math.min(nAttack,maxBoosts * BOOSTS[ATTACK][RESOURCE_CATALYZED_UTRIUM_ACID].attack);
        }
        let nCombatCreeps = Math.ceil(nAttack / nAttackPerCreep);

        //console.log(this.name + ' defender creeps ' + nCombatCreeps + ' with body ' + body + ' maxBoosts ' + maxBoosts);
        
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
        
        let boost = {[ATTACK]: RESOURCE_CATALYZED_UTRIUM_ACID};
        if(!addCreepMemory[this.name]){
            addCreepMemory[this.name] = {'defender': {'combat': {'boost': boost}}};
        }
        else if(!addCreepMemory[this.name]['defender']){
            addCreepMemory[this.name]['defender'] = {'combat': {'boost': boost}};
        }
        else {
            addCreepMemory[this.name]['defender']['combat'] = {'boost': boost};
        }
    }
};