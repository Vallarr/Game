 Spawn.prototype.spawnCreep = function(){
    //Stop of spawn is already bussy
    if(this.spawning){
        return;
    }
    
    //Check whether new creeps have to be created. If not, stop
    let needSpawn = this.needSpawn('settler');
    //console.log(needSpawn.role);
    if(!needSpawn){
        return;
    }    
    
    //Check for available energy vs energy capacity
    let maxCost = this.spawn.energyCapacity + this.spawn.room.memory.energy.extensions.max;
    let avEnergy = this.spawn.room.memory.energy[this.spawn.name] + this.spawn.room.memory.energy.extensions.available;    

    if(avEnergy == maxCost || (needSpawn.role == 'harvester' && needSpawn.number == 0 && avEnergy > 200) || (needSpawn.role == 'melee' && this.spawn.room.memory.underAttack)) {
        //Now we will spawn
        let df = this.detPaths();
        var d = df.d;
        var f = df.f;
        //console.log('d ' + d + ' f: ' + f);
        var creepEff = {melee:  function(nBp,d,f,maxCost) {
                                var nAM = Math.floor(maxCost/(BODYPART_COST[MOVE] + BODYPART_COST[ATTACK]));
                                if(nBp[3]<nAM){return -3}
                                if(nBp[2]<nAM){return -2}
                                var left = maxCost - nAM * (BODYPART_COST[MOVE] + BODYPART_COST[ATTACK]);
                                var nT = Math.min(nAM,left/BODYPART_COST[TOUGH]);
                                if(nBp[4]<nT){return -4}
                                left -= nT * BODYPART_COST[TOUGH];
                                var nTTM = Math.floor(left/(2 * BODYPART_COST[TOUGH] + BODYPART_COST[MOVE]));
                                if(nBp[2]<(nAM+nTTM)){return -2}
                                if(nBp[4]<(nT+2*nTTM)){return -4}
                                return -10},                
                        harvester:  function(nBp,d,f){ 
                                    if(nBp[0] == 0){return 0}
                                    if(nBp[1] == 0){return -1}
                                    if(nBp[2] == 0){return -2}
                                    return 1.0/2.0/nBp[0] + d/CARRY_CAPACITY/nBp[1] * (Math.ceil(f/2.0*(nBp[1]+nBp[0])/nBp[2]) + Math.ceil(f/2.0*nBp[0]/nBp[2])) + 100*(nBp[3] + nBp[4])},
                        builder:    function(nBp,d,f){ 
                                    if(nBp[0] == 0){return 0}
                                    if(nBp[1] == 0){return -1}
                                    if(nBp[2] == 0){return -2}                                
                                    return 7.0/10.0/nBp[0] + d/CARRY_CAPACITY/nBp[1] * (Math.ceil(f/2.0*(nBp[1]+nBp[0])/nBp[2]) + Math.ceil(f/2.0*nBp[0]/nBp[2])) + 100*(nBp[3] + nBp[4])},
                        repairer:   function(nBp,d,f){ 
                                    if(nBp[0] == 0){return 0}
                                    if(nBp[1] == 0){return -1}
                                    if(nBp[2] == 0){return -2}                                
                                    return 7.0/10.0/nBp[0] + d/CARRY_CAPACITY/nBp[1] * (Math.ceil(f/2.0*(nBp[1]+nBp[0])/nBp[2]) + Math.ceil(f/2.0*nBp[0]/nBp[2])) + 100*(nBp[3] + nBp[4])},                            
                        upgrader:   function(nBp,d,f){ 
                                    if(nBp[0] == 0){return 0}
                                    if(nBp[1] == 0){return -1}
                                    if(nBp[2] == 0){return -2}                                
                                    return 3.0/2.0/nBp[0] + d/CARRY_CAPACITY/nBp[1] * (Math.ceil(f/2.0*(nBp[1]+nBp[0])/nBp[2]) + Math.ceil(f/2.0*nBp[0]/nBp[2])) + 100*(nBp[3] + nBp[4])}
                        };
        //console.log(needSpawn.role + ' ' + avEnergy);
        var nBodyParts = this.detBodyParts(avEnergy,creepEff[needSpawn.role],d[needSpawn.role],f[needSpawn.role]);
        var body = this.generateBody(nBodyParts);
        let canMakeCreep = this.spawn.canCreateCreep(body);
        console.log(this.spawn.name + ' is spawning ' + needSpawn.role + ' ' + this.spawn.createCreep(body,null,{role: needSpawn.role, settler: true, origin: this.spawn.room.name}) + ' with body: ' + body + ' in game tick ' + Game.time );
        this.spawning = true;
        if(canMakeCreep == OK){
            this.logMemory('settler',needSpawn.role);
        }
    }
 };
 
Spawn.prototype.spawnDedicatedCreep = function(){
    if(this.spawning){
        return;
    }

    let needSpawn = this.needSpawn('settler');    
    //console.log(needSpawn.role);
    if(!needSpawn){
        return;
    }
    this.spawning = true;
     let body = undefined;
     if(!creepBodies[this.spawn.room.name] || !creepBodies[this.spawn.room.name]['settler'] || !creepBodies[this.spawn.room.name]['settler'][needSpawn.role]){
         //console.log(this.spawn.name + ' using default');
         body = defaultCreepBodies['settler'][needSpawn.role];
     }
     else {
         //console.log(this.spawn.name + ' not using default');
         body = creepBodies[this.spawn.room.name]['settler'][needSpawn.role];
     }
    let bodyCost = this.bodyCost(body);

    //Check for available energy vs energy capacity
    let maxCost = this.spawn.energyCapacity + this.spawn.room.memory.energy.extensions.max;
    let avEnergy = this.spawn.room.memory.energy[this.spawn.name] + this.spawn.room.memory.energy.extensions.available; 
    
    //Make sure there is always at least 1 transporter to fill spawns and 1 harvester
    //TODO only do this once colony is established. i.e. Once source/upgrade/spawn containers have been built
    if(needSpawn.role == 'transporter' && needSpawn.number == 0 && avEnergy < bodyCost && avEnergy >= (2*BODYPART_COST[CARRY] + BODYPART_COST[MOVE])){
        let nCCM = Math.floor(avEnergy/(2*BODYPART_COST[CARRY] + BODYPART_COST[MOVE]));
        let body = [];
        for(let i=0; i<nCCM; i++){body.push(CARRY,CARRY)}
        for(let i=0; i<nCCM; i++){body.push(MOVE)}
        let canMakeCreep = this.spawn.canCreateCreep(body);
        console.log(this.spawn.name + ' is spawning dedicated ' + needSpawn.role + ' ' + this.spawn.createCreep(body,null,{role: needSpawn.role, dedicated: true, settler: true, origin: this.spawn.room.name}) + ' with body: ' + body + ' in game tick ' + Game.time );
        if(canMakeCreep == OK){
            this.logMemory('settler',needSpawn.role);
        }        
    }
    else if(needSpawn.role == 'harvester' && needSpawn.number == 0 && avEnergy < bodyCost && avEnergy >= (BODYPART_COST[WORK] + BODYPART_COST[CARRY] + BODYPART_COST[MOVE])){
        let nW = Math.floor((avEnergy - BODYPART_COST[CARRY] - BODYPART_COST[MOVE])/BODYPART_COST[WORK]);
        let body = [];
        for(let i=0; i<nW; i++){body.push(WORK)}
        body.push(CARRY,MOVE);
        let canMakeCreep = this.spawn.canCreateCreep(body);        
        console.log(this.spawn.name + ' is spawning dedicated ' + needSpawn.role + ' ' + this.spawn.createCreep(body,null,{role: needSpawn.role, dedicated: true, settler: true, origin: this.spawn.room.name}) + ' with body: ' + body + ' in game tick ' + Game.time );
        if(canMakeCreep == OK){
            this.logMemory('settler',needSpawn.role);
        }          
    }
    else if(avEnergy >= bodyCost) {
        let canMakeCreep = this.spawn.canCreateCreep(body);        
        console.log(this.spawn.name + ' is spawning dedicated ' + needSpawn.role + ' ' + this.spawn.createCreep(body,null,{role: needSpawn.role, dedicated: true, settler: true, origin: this.spawn.room.name}) + ' with body: ' + body + ' in game tick ' + Game.time );
        if(canMakeCreep == OK){
            this.logMemory('settler',needSpawn.role);
        }          
    }
    /*else if(maxCost < bodyCost){
        //In this case spawn optimal creep with available energy
        this.spawning = false;
    }
    */
}; 
 
  Spawn.prototype.detPaths = function(){
     let sources = this.spawn.room.find(FIND_SOURCES);
     let goals = [];
     for(let i=0; i<sources.length; i++){
         goals.push({pos: sources[i].pos, range: 1});
     }     
     
     //Spawn to sources
     let resSp = PathFinder.search(this.spawn.pos,goals, {
         plainCost: 2,
         swampCost: 10,
         roomCallback: function(roomName){
             if(!Game.rooms[roomName]) return;
             return PathFinder.CostMatrix.deserialize(room.memory.CostMatrix);             
         }
     });
     let dSp = resSp.path.length;
     let fSp = resSp.cost / dSp;
     
     //Controller to sources
     let resC = PathFinder.search(this.spawn.room.controller.pos,goals, {
         plainCost: 2,
         swampCost: 10,
         roomCallback: function(roomName){
             if(!Game.rooms[roomName]) return;
             return PathFinder.CostMatrix.deserialize(room.memory.CostMatrix);
         }
     });
     let dC = resC.path.length;
     let fC = resC.cost / dC;
     
     //Temporary override
     dSp = 17;
     //['melee','harvester','builder','repairer','upgrader']
     return {d: {melee: 0, harvester: dSp, builder: 1.5*dSp, repairer: 1.5*dSp, upgrader: dC}, f: {melee: 0, harvester: fSp, buidler: fSp, repairer: fSp, upgrader: fC}};
 };
 
 Spawn.prototype.detBodyParts = function(maxCost,creepEfficiency,d,f) {
    var parts = [WORK,CARRY,MOVE,ATTACK,TOUGH];
    var costParts = [];
    for(var i=0;i<parts.length;i++){
        costParts.push(BODYPART_COST[parts[i]]);
    }
    var nBodyParts = [0,0,0,0,0];   //Work, Carry, Move, Attack, Tough
    var cost = 0;
    var avParts = [];
    for(var i=0; i<costParts.length;i++){
        avParts[i] = Math.floor((maxCost - cost)/costParts[i]);
    }
    var cEff = creepEfficiency(nBodyParts,d,f,maxCost);
    var min = cEff;
    var addPart = 0;
    var done = false;
    //console.log('d: ' + d + 'f: ' + f);
    console.log(maxCost);
    while(avParts.reduce((a,b) => a+b, 0) > 0 && nBodyParts.reduce((a,b) => a+b,0) < MAX_CREEP_SIZE && !done) {
        let foundBp = false;
        for(var i=0;i<avParts.length; i++) {
            if(avParts[i]>0){
                var tempnBodyParts = [];
                for(var j=0; j<nBodyParts.length; j++){
                    tempnBodyParts[j] = nBodyParts[j];
                }
                tempnBodyParts[i] += 1;
                cEff = creepEfficiency(tempnBodyParts,d,f,maxCost);
                //console.log('cEff: ' + cEff +' min: ' + min);
                if(cEff == -10){
                    done = true;
                    break;
                }
                else if(cEff <= 0) {
                    min = Infinity;
                    addPart = Math.abs(cEff);
                    foundBp = true;
                    break;
                }
                else if(cEff <= min){
                    min = cEff;
                    addPart = i;
                    foundBp = true;
                }
            }
        }
        if(foundBp){
            nBodyParts[addPart] += 1;
            cost += BODYPART_COST[parts[addPart]];            
        }
        else {
            done = true;
        }
        console.log(nBodyParts);
        console.log(cost);
        for(var i=0; i<costParts.length; i++){
            avParts[i] = Math.floor((maxCost - cost)/costParts[i]);
        }
        console.log(avParts);
    }
    return nBodyParts;
};
 
Spawn.prototype.generateBody = function(nBodyParts){
    var parts = [WORK,CARRY,MOVE,ATTACK,TOUGH];
    var body = [];
    var nT = nBodyParts.pop();
    var nM = nBodyParts[2];
    nBodyParts.splice(2,1);
    while(nBodyParts.reduce((a,b) => a+b,0)>0){
        if(nBodyParts[2]>0){
            body.unshift(parts[3]);
            nBodyParts[2]--;
        }
        if(nBodyParts[1]>0){
            body.unshift(parts[1]);
            nBodyParts[1]--;
        }            
        if(nBodyParts[0]>0){
            body.unshift(parts[0]);
            nBodyParts[0]--;
        }
    }
    //Tough parts
    for(let i=0; i<nT; i++){
        body.unshift(parts[4]);
    }
    //Move parts
    for(let i=0; i<nM; i++){
        body.push(parts[2]);
    }
    return body;
}; 

Spawn.prototype.spawnExplorerCreep = function(){
    if(this.spawning){
        return;
    }
    
    let needSpawn = this.needSpawn('explorer');    
    //console.log(needSpawn.role);
    if(!needSpawn){
        return;
    }

     let body = undefined;
     if(!creepBodies[this.spawn.room.name] || !creepBodies[this.spawn.room.name]['explorer'] || !creepBodies[this.spawn.room.name]['explorer'][needSpawn.role]){
         //console.log(this.spawn.name + ' using default');
         body = defaultCreepBodies['explorer'][needSpawn.role];
     }
     else {
         //console.log(this.spawn.name + ' not using default');
         body = creepBodies[this.spawn.room.name]['explorer'][needSpawn.role];
     }
    let bodyCost = this.bodyCost(body);
    
    //Check for available energy vs energy capacity
    let maxCost = this.spawn.energyCapacity + this.spawn.room.memory.energy.extensions.max;
    let avEnergy = this.spawn.room.memory.energy[this.spawn.name] + this.spawn.room.memory.energy.extensions.available; 

    if(avEnergy >= bodyCost) {
        let canMakeCreep = this.spawn.canCreateCreep(body);        
        console.log(this.spawn.name + ' is spawning explorer ' + needSpawn.role + ' ' + this.spawn.createCreep(body,null,{role: needSpawn.role, explorer: true, origin: this.spawn.room.name}) + ' with body: ' + body + ' in game tick ' + Game.time);
        this.spawning = true;
        if(canMakeCreep == OK){
            this.logMemory('explorer',needSpawn.role);
        }          
    }
};

    creepHarvest: function(creep) {
        var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            return;
        }
        if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }        
        
        if(creep.memory.harvesting && creep.carry.energy == creep.carryCapacity){
            creep.memory.harvesting = false;
            creep.say('Transfer');
        }
        if(!creep.memory.harvesting && creep.carry.energy == 0){
            creep.memory.harvesting = true;
            creep.say('Harvest');
        }
       
	    if(creep.memory.harvesting && creep.carry.energy < creep.carryCapacity) {
	        //TODO: Should be done better
	        if(creep.room.memory.energy.fillSpawn){
	            let rtn = activeCreep.harvestContainer();
	            if(rtn == ERR_NOT_FOUND){
	                rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
	                if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
	                    activeCreep.harvestSource();
	                }
	            }
	            if(rtn == OK){
	                //Creep can perform another action
	                //Roles.creepHarvest(creep);
	            }
	        } else {
	            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
                if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
                    activeCreep.harvestSource();
                }
                if(rtn == OK){
	                //Creep can perform another action
	                //Roles.creepHarvest(creep);                    
                }
	        }
        }
        else {
            let rtn = activeCreep.fillSpawn();
            if(rtn == ERR_NOT_FOUND){
                rtn = activeCreep.fillTower();
                if(rtn == ERR_NOT_FOUND){
                    rtn = activeCreep.fillContainer();
                    if(rtn == ERR_NOT_FOUND){
                        rtn = activeCreep.fillStorage();
                        if(rtn == ERR_NOT_FOUND){
                            Roles.creepBuild(creep);
                        }
                    }
                }
            }
            if(rtn == OK){
	                //Creep can perform another action
	                //Roles.creepHarvest(creep);                   
            }
        }
	}
	
    creepBuild: function(creep) {
        var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }        
        if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }            
        
	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('Harvesting');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('Building');
	    }
	    if(creep.memory.building) {
	        //Build structures
	        if(activeCreep.buildStructure() == ERR_NOT_FOUND){
	            if(activeCreep.repairStructure() == ERR_NOT_FOUND){
	                if(activeCreep.repairWall() == ERR_NOT_FOUND){
	                    Roles.creepUpgrade(creep);
	                }
	            }
	        }
	    }
	    else {
            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
            if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
                activeCreep.harvestSource();
            }
            if(rtn == OK){
                //Creep can perform another action
                //Roles.creepBuild(creep);                    
            }
	    }
	}
	
    creepRepair: function(creep) {
        var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
        if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }                    
        
	    if(creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
            creep.say('Harvesting');
	    }
	    if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.repairing = true;
	        creep.say('Repairing');
	    }
	    if(creep.memory.repairing) {
	        //Repair structures
	        if(activeCreep.repairStructure() == ERR_NOT_FOUND){
                if(activeCreep.repairWall() == ERR_NOT_FOUND){
                    Roles.creepBuild(creep);
                }
	        }
	    }
	    else {
            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
            if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
                activeCreep.harvestSource();
            }
            if(rtn == OK){
                //Creep can perform another action
                //Roles.creepBuild(creep);                    
            }
	    }
	}
	
    creepUpgrade: function(creep) {
        var activeCreep = new creepActions(creep);    
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }    
        if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }                    
        
        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('upgrading');
	    }
	    if(creep.memory.upgrading) {
	        activeCreep.upgrade();
        }
        else {
            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
            if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
                activeCreep.harvestSource();
            }
            if(rtn == OK){
                //Creep can perform another action
                //Roles.creepBuild(creep);                    
            }
        }
	}	
	
	creepMelee: function(creep) {
        var activeCreep = new creepActions(creep); 	    
	    if(creep.room.memory.underAttack == true) {
	        activeCreep.meleeAttack();
	    }
	    else {
	        if(activeCreep.occupyRampart() == ERR_NOT_FOUND){
	            activeCreep.moveTo([creep.room.controller],5);
	        }
	    }
	},	
	
	creepDedicatedHarvest: function(creep){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
       if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }        
        
        //Get creeps dedicated source
	    let source = [];
	    let sourceContainer = undefined;
	    if(creep.memory.source){
	        //Get from memory
	        source.push(Game.getObjectById(creep.memory.source));
            if(creep.memory.sourceContainer){
                sourceContainer = util.gatherObjectsInArrayFromIds(creep.memory,'sourceContainer');
                if(!sourceContainer.length){delete creep.memory.sourceContainer} //This container no longer exists
            }
            else {
                sourceContainer = util.targetsInRange(util.gatherObjectsInArrayFromIds(creep.room.memory.links,'source').concat(util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'source')),source,2);
                if(!sourceContainer.length){
                    let containersToBeBuild = creep.room.find(FIND_CONSTRUCTION_SITES, {filter: (site) => {return site.structureType == STRUCTURE_CONTAINER || site.structureType == STRUCTURE_LINK}});
                    sourceContainer = util.targetsInRange(containersToBeBuild,source,2);
                }
                creep.memory.sourceContainer = util.gatherIdsInArrayFromObjects(sourceContainer);                    
            }        
	    }
	    else {
	        //Determine creeps source and store in memory
	        let roomSources = util.gatherObjectsInArrayFromIds(creep.room.memory.sources,'energy');
	        let occupiedSources = util.targetObjectsOfCreeps('source',creep.room);
            let target = util.findDifferentElement(roomSources,occupiedSources);
            if(target != ERR_NOT_FOUND){
                source.push(target);
                creep.memory.source = target.id;
            }
            else {
	            //All room sources have allready been assigned to dedicted harvester creeps
                //Assign creep to source that is already harvested                
            }
	    }
	    
        if(creep.carry.energy == creep.carryCapacity){
            let rtn = activeCreep.fillContainer(sourceContainer);
            if(rtn == OK){
                activeCreep.harvestSource(source);
            }
            else if(rtn == ERR_NOT_FOUND){
                //activeCreep.dropAll();
            }
            else if(rtn == ERR_INVALID_TARGET){
                activeCreep.buildStructure(sourceContainer);
            }
            else if(rtn == ERR_FULL){
                if(sourceContainer[0].hits < sourceContainer[0].hitsMax){
                    activeCreep.repairStructure(1,sourceContainer);
                }
                else {
                    //activeCreep.dropAll();
                }                
            }
        }
        else {
            activeCreep.harvestSource(source);
        }
	},	
	
	creepDedicatedBuild: function(creep){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
        if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }            
        
	    let sourceContainers = util.getArrayObjectsById(creep.room.memory.containers.source);
	    let upgraderContainers = util.getArrayObjectsById(creep.room.memory.containers.upgrader);
	    let containers = sourceContainers.concat(upgraderContainers);
	    
	    if(creep.carry.energy == 0){
            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
            if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
    	        if(activeCreep.harvestStorage() == ERR_NOT_FOUND){
    	            let filledContainers = containers.filter(function(container){return container.store[RESOURCE_ENERGY] > 0});
    	            if(activeCreep.harvestContainer(filledContainers) == ERR_NOT_FOUND){
    	                Roles.creepBuild(creep);
    	            }
    	        }                
            }
            else if(rtn == OK){
    	        if(activeCreep.buildStructure() == ERR_NOT_FOUND){
            	    let dmgId = creep.room.memory.dmgStructures;
            	    let dmgStructures = [];
            	    for(let i=0; i<dmgId.length; i++){
            	        dmgStructures.push(Game.getObjectById(dmgId[i]));
            	    }    	            
    	            if(activeCreep.repairStructure(1,dmgStructures) == ERR_NOT_FOUND){
    	                Roles.creepDedicatedUpgrader(creep);
    	            }
    	        }                
            }

	    }
	    else {
	        if(activeCreep.buildStructure() == ERR_NOT_FOUND){
        	    let dmgId = creep.room.memory.dmgStructures;
        	    let dmgStructures = [];
        	    for(let i=0; i<dmgId.length; i++){
        	        dmgStructures.push(Game.getObjectById(dmgId[i]));
        	    }  	            
	            if(activeCreep.repairStructure(1,dmgStructures) == ERR_NOT_FOUND){
	                Roles.creepDedicatedUpgrader(creep);
	            }
	        }
	    }
	},	
	
	creepDedicatedRepair: function(creep){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
        if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }            
        
	    let sourceContainers = util.getArrayObjectsById(creep.room.memory.containers.source);
	    let upgraderContainers = util.getArrayObjectsById(creep.room.memory.containers.upgrader);
	    let containers = sourceContainers.concat(upgraderContainers);
	    
	    let dmgStructures = util.getArrayObjectsById(creep.room.memory.dmgStructures);
	    //console.log(dmgStructures);
        
        if(creep.carry.energy == 0){
            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
            if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
            if(activeCreep.harvestStorage() == ERR_NOT_FOUND){
                    let filledContainers = containers.filter(function(container){return container.store[RESOURCE_ENERGY] > 0});
                    if(activeCreep.harvestContainer(filledContainers) == ERR_NOT_FOUND){
                        //Roles.creepRepair(creep);
                    }
                }                
            }
            else if(rtn == OK){
                if(activeCreep.repairStructure(1,dmgStructures) == ERR_NOT_FOUND){
                    Roles.creepExplorerBuild(creep);
                }                
            }
        }
        else {
            //Repair structures
            if(activeCreep.repairStructure(1,dmgStructures) == ERR_NOT_FOUND){
                Roles.creepExplorerBuild(creep);
            }
        }
	    
	},	
	
	creepDedicatedUpgrader: function(creep){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
        if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }
        let upgraderContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'upgrader','source','storage').filter((container) => {return container.store[RESOURCE_ENERGY] > 0});
        let upgraderLinks = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'upgrader','source').filter((link) => {return link.energy > 0});
        let upgraderTargets = upgraderLinks.concat(upgraderContainers);
	    
	    if(creep.carry.energy == 0){
	        if(activeCreep.harvestContainer(upgraderTargets) == ERR_NOT_FOUND){
	            creep.say('Empty');
	        }
	    }
	    else {
	        activeCreep.upgrade();
	    }
	    
	},	