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
    this.roles.settler = ['harvester','sender','filler','transporter','courier','labWorker','repairer','builder','upgrader','melee','miner'];
    this.roles.defender = ['combat','repairer'];
    this.roles.rescuer = ['combat'];
    this.roles.explorer = ['melee','harvester','reserver','transporter','repairer','builder','upgrader','dismantler'];
    this.roles.adventurer = ['hybrid','ranged','patroller','patrollerRanged','melee','harvester','transporter','repairer','builder','miner'];
    this.roles.starter = ['reserver','startUp','harvester','transporter','repairer','builder','upgrader','dismantler','combat'];
    this.roles.attacker = ['drainer','dismantler','healer','dismantler2','healer2','reserver'];
    this.roles.powerHarvester = ['attacker','healer','transporter'];
    this.spawnCreep('defender');
    this.spawnCreep('attacker');
    this.spawnCreep('powerHarvester');
    this.spawnCreep('settler',true);
    this.spawnCreep('rescuer');
    this.spawnCreep('explorer',true);
    this.spawnCreep('adventurer');
    this.spawnCreep('starter');
    this.spawnCreep('attacker');
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
    let avEnergy = Math.min(this.room.energyAvailable,maxCost); //If extensions are inactive avEnergy can be higher than maxCost -> limit
     
    let body = undefined;
    if(!creepBodies || !creepBodies[this.room.name] || !creepBodies[this.room.name][creepType] || !creepBodies[this.room.name][creepType][needSpawn.role]){
        body = defaultCreepBodies[creepType][needSpawn.role];
    }
    else {
        body = creepBodies[this.room.name][creepType][needSpawn.role];
    }
    let bodyCost = this.bodyCost(body);
    
    let creepMemory = {role: needSpawn.role, type: creepType, origin: this.room.name};
    if(addCreepMemory && addCreepMemory[this.room.name] && addCreepMemory[this.room.name][creepType] && addCreepMemory[this.room.name][creepType][needSpawn.role]){
        for(let addMem in addCreepMemory[this.room.name][creepType][needSpawn.role]){
            creepMemory[addMem] = addCreepMemory[this.room.name][creepType][needSpawn.role][addMem];
        }
    }
     
    if(essential && bodyCost > avEnergy){
        //Spawn best creep you can with available energy
        let nTransporters = undefined;
        let nSenders = undefined;
        if(this.room.memory.creeps && this.room.memory.creeps['settler']){
            nTransporters = this.room.memory.creeps['settler']['filler']  + this.room.memory.creeps['settler']['courier'];
            nSenders = this.room.memory.creeps['settler']['sender'];
            let stLinks = util.gatherObjectsInArray(this.room.links,'storage');
            if(!stLinks.length){nSenders = 0}
        }
        if(this.room.name == "W27N11"){
            //console.log(nTransporters + ", " + nSenders + ", " + avEnergy);
            //console.log((((transitioned[this.room.name] && !nSenders) || !nTransporters) && avEnergy) >= SPAWN_ENERGY_START);
            
        }
        if(((((transitioned[this.room.name] && !nSenders) || !nTransporters) && avEnergy) >= SPAWN_ENERGY_START) || (((transitioned[this.room.name] && nSenders) || !transitioned[this.room.name]) && nTransporters && avEnergy == maxCost)){
            //Spawns and extensions won't be filled by transporters and energy won't regenerate OR spawns will be filled but bodyCost is higher than maxCost
            body = this.reduceBody(body,avEnergy)             
        }
    }
    if(this.canCreateCreep(body) == OK){
        let rtn = this.createCreep(body,null,creepMemory);
        //console.log(this.name + ' in room ' + this.room.name + ' is spanwing ' + creepType + ' ' + rtn + ' with body: ' + body + ' in game tick ' + Game.time);
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
        let need = 0;
        if(creepsToSpawn[this.room.name] && creepsToSpawn[this.room.name][creepType] && creepsToSpawn[this.room.name][creepType][this.roles[creepType][i]]){
            need += creepsToSpawn[this.room.name][creepType][this.roles[creepType][i]];
        }
        needSpawn = needSpawn || nCreep[i] < need;
        /*if(this.room.name == 'W15N8'){
            //console.log(this.name + ' ' + creepType + ' ' + this.roles[creepType][i] + ' need: ' + creepsToSpawn[this.room.name][creepType][this.roles[creepType][i]] + ' have ' + nCreep[i]);
            //console.log(nCreep[i] < creepsToSpawn[this.room.name][creepType][this.roles[creepType][i]], ' ', needSpawn);
            //console.log(Number.isInteger(creepsToSpawn[this.room.name][creepType][this.roles[creepType][i]]));
        }*/
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

let createCreepPrototype = StructureSpawn.prototype.createCreep;
    StructureSpawn.prototype.createCreep = function(){
        if(!arguments[2] || ! arguments[2].role){
            return ERR_INVALID_ARGS;
        }
        
        if(!arguments[1]) {
            arguments[1] = (arguments[2].role + '-' + ('0000' + Memory.nameCounter).slice(-4));
        }
        
        let rtn = createCreepPrototype.apply(this,arguments);
        if (_.isString(rtn)) {
            Memory.nameCounter = Memory.nameCounter < 9999 ? Memory.nameCounter + 1 : 0;
        }
        else {
            console.log(this.room.name + ' failed to spawn ' + arguments[2].role + ': ' + rtn);
        }
        return rtn;
    };