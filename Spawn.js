Spawn.prototype.run = function(){
    if(this.spawning){return}
    this.isSpawning = false;
    this.explorerRooms = remoteRooms['explorer'];
    this.adventureRooms = remoteRooms['adventurer'];
    this.checkExplorerAttack();
    if(this.adventureRooms){
        this.checkAttack(this.adventureRooms,'adventurer');
    }
    //console.log('Spawn checked ' + this.name);
    this.roles = {settler: undefined, defender: undefined, explorer: undefined, adventurer: undefined};
    this.roles.settler = ['harvester','transporter','filler','repairer','builder','upgrader','melee','miner'];
    this.roles.defender = ['repairer','builder','melee','ranged']
    this.roles.explorer = ['melee','harvester','reserver','transporter','repairer','builder','upgrader','dismantler'];
    this.roles.adventurer = ['hybrid','ranged','patroller','patrollerRanged','melee','harvester','transporter','repairer','builder'];
    this.roles.starter = ['reserver','harvester','transporter','repairer','builder','upgrader'];
    this.spawnCreep('settler',true);
    this.spawnCreep('explorer',true);
    this.spawnCreep('adventurer');
    this.spawnCreep('starter');
};
 
Spawn.prototype.checkExplorerAttack = function(){
    if(this.explorerRooms && this.explorerRooms[this.room.name] != undefined){
        creepsToSpawn[this.room.name]['explorer']['melee'] = 0;
        for(let i=0; i<this.explorerRooms[this.room.name].length; i++){
            if(Memory.rooms[this.explorerRooms[this.room.name][i]] && Memory.rooms[this.explorerRooms[this.room.name][i]].defense.underAttack){
                //console.log('Room '+ this.explorerRooms[this.room.name][i] + ' under attack, spawning melees');
                creepsToSpawn[this.room.name]['explorer']['melee'] += 1;
            }
        }
    }
};
 
Spawn.prototype.checkAttack = function(targetRooms,type){
    if(targetRooms && targetRooms[this.room.name] != undefined){
        creepsToSpawn[this.room.name][type]['melee'] = 0;
        creepsToSpawn[this.room.name][type]['ranged'] = 0;
        creepsToSpawn[this.room.name][type]['hybrid'] = 0;
        for(let i=0; i<targetRooms[this.room.name].length; i++){
            //console.log(JSON.stringify(Memory.rooms[targetRooms[this.spawn.room.name][i]]));
            if(Memory.rooms[targetRooms[this.room.name][i]] && Memory.rooms[targetRooms[this.room.name][i]].defense.underAttack && Memory.rooms[targetRooms[this.room.name][i]].defense.lastAttacker == 'Invader'){
                //creepsToSpawn[this.spawn.room.name][type]['melee'] += Math.ceil(Memory.rooms[targetRooms[this.spawn.room.name][i]].defense.hostiles.number/5);
                //creepsToSpawn[this.spawn.room.name][type]['ranged'] += Math.ceil(Memory.rooms[targetRooms[this.spawn.room.name][i]].defense.hostiles.number/5);
                //creepsToSpawn[this.spawn.room.name][type]['hybrid'] = 1;
            }
        }
    }
};
 
Spawn.prototype.spawnCreep = function(creepType,essential){
    if(this.isSpawning){return}
     
    let needSpawn = this.needSpawn(creepType);
    if(!needSpawn){return}
     
    if(essential == undefined){essential = false}     
     
    let maxCost = this.room.energyCapacityAvailable;
    let avEnergy = this.room.energyAvailable;
     
    let body = undefined;
    if(!creepBodies[this.room.name] || !creepBodies[this.room.name][creepType] || !creepBodies[this.room.name][creepType][needSpawn.role]){
        //console.log(this.name + ' using default');
        body = defaultCreepBodies[creepType][needSpawn.role];
    }
    else {
        //console.log(this.name + ' not using default');
        body = creepBodies[this.room.name][creepType][needSpawn.role];
    }
    let bodyCost = this.bodyCost(body);
     
    if(essential && bodyCost > avEnergy){
        //Spawn best creep you can with available energy
        let nTransporters = undefined;
        if(this.room.memory.creeps && this.room.memory.creeps['settler']){nTransporters = this.room.memory.creeps['settler']['filler']}
        if((!nTransporters && avEnergy >= SPAWN_ENERGY_START) || (nTransporters && avEnergy == maxCost)){
            //Spawns and extensions won't be filled by transporters and energy won't regenerate OR spawns will be filled but bodyCost is higher than maxCost
            body = this.reduceBody(body,avEnergy)             
        }
    }
    if(this.canCreateCreep(body) == OK){
        console.log(this.name + ' is spanwing ' + creepType + ' ' + needSpawn.role + ' ' + this.createCreep(body,null,{role: needSpawn.role, type: creepType, origin: this.room.name}) + ' with body: ' + body + ' in game tick ' + Game.time);
        this.isSpawning = true;
        this.logMemory(creepType,needSpawn.role);
    }     
};

Spawn.prototype.needSpawn = function(creepType){
    let nCreep = [];
    let needSpawn = false;
    for(let i=0; i<this.roles[creepType].length && !needSpawn; i++){
        if(this.room.memory.creeps && this.room.memory.creeps[creepType] && this.room.memory.creeps[creepType][this.roles[creepType][i]]){
            nCreep[i] = this.room.memory.creeps[creepType][this.roles[creepType][i]];
        }
        else {
            //No creeps of this type yet
            nCreep[i] = 0;
        }
        //console.log(this.name + ' ' + creepType + ' ' + this.roles[creepType][i] + ' need: ' + creepsToSpawn[this.room.name][creepType][this.roles[creepType][i]] + ' have ' + nCreep[i]);
        needSpawn = needSpawn || nCreep[i] < creepsToSpawn[this.room.name][creepType][this.roles[creepType][i]];
        if(needSpawn){
            return {role: this.roles[creepType][i], number: nCreep[i]};
        }
    }
    return needSpawn;
};
 
Spawn.prototype.bodyCost = function(body){
    let cost = 0;
    for(let i=0; i<body.length; i++){
        cost += BODYPART_COST[body[i]];
    }
    return cost;
};
 
Spawn.prototype.reduceBody = function(body,maxCost){
    //Select bodyparts from body, starting at the end of the array, such that the total cost is not higher than maxCost.
    let reducedBody = [];
    if(body == undefined || maxCost == undefined || !Array.isArray(body)){
        return reducedBody;
    }    
    
    let cost = 0;    
    for(let i=body.length-1; i>=0; i--){
        cost += BODYPART_COST[body[i]];
        if(cost <= maxCost){
            reducedBody.unshift(body[i]);
        }
        else {
            break;
        }
    }
    return reducedBody;
}; 

Spawn.prototype.logMemory = function(type,role){
    if(this.room.memory.creeps == undefined){
        let mem = {};
        mem[type] = {};
        mem[type][role] = 1;
        this.room.memory.creeps = mem;
    }
    else if(this.room.memory.creeps[type] == undefined){
        let mem = {};
        mem[role] = 1;
        this.room.memory.creeps[type] = mem;
    }
    else if(this.room.memory.creeps[type][role] == undefined){
        this.room.memory.creeps[type][role] = 1;
    }
    else {
        this.room.memory.creeps[type][role]++;
    }
};