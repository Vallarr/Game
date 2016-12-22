 var Spawn = function(spawn){
     this.spawn = spawn;
     this.spawning = spawn.spawning;
     this.explorerRooms = remoteRooms['explorer'];
     this.adventureRooms = remoteRooms['adventurer'];
     this.checkExplorerAttack();
     if(this.adventureRooms){
         this.checkAttack(this.adventureRooms,'adventurer');
     }
     //console.log('Spawn checked ' + this.spawn.name);
     this.roles = {settler: undefined, defender: undefined, explorer: undefined, adventurer: undefined};
     this.roles.settler = ['harvester','transporter','filler','repairer','builder','upgrader','melee','miner'];
     this.roles.defender = ['repairer','builder','melee','ranged']
     this.roles.explorer = ['melee','harvester','reserver','transporter','repairer','builder','upgrader'];
     this.roles.adventurer = ['hybrid','ranged','patroller','patrollerRanged','melee','harvester','transporter','repairer','builder'];
 };
 
 Spawn.prototype.checkExplorerAttack = function(){
     if(this.explorerRooms && this.explorerRooms[this.spawn.room.name] != undefined){
         creepsToSpawn[this.spawn.room.name]['explorer']['melee'] = 0;
         for(let i=0; i<this.explorerRooms[this.spawn.room.name].length; i++){
             if(Memory.rooms[this.explorerRooms[this.spawn.room.name][i]] && Memory.rooms[this.explorerRooms[this.spawn.room.name][i]].defense.underAttack){
                 //console.log('Room '+ this.explorerRooms[this.spawn.room.name][i] + ' under attack, spawning melees');
                 creepsToSpawn[this.spawn.room.name]['explorer']['melee'] += Memory.rooms[this.explorerRooms[this.spawn.room.name][i]].defense.hostiles.number;
             }
         }
     }
 };
 
Spawn.prototype.checkAttack = function(targetRooms,type){
 if(targetRooms && targetRooms[this.spawn.room.name] != undefined){
     creepsToSpawn[this.spawn.room.name][type]['melee'] = 0;
     creepsToSpawn[this.spawn.room.name][type]['ranged'] = 0;
     creepsToSpawn[this.spawn.room.name][type]['hybrid'] = 0;
     for(let i=0; i<targetRooms[this.spawn.room.name].length; i++){
         //console.log(JSON.stringify(Memory.rooms[targetRooms[this.spawn.room.name][i]]));
         if(Memory.rooms[targetRooms[this.spawn.room.name][i]] && Memory.rooms[targetRooms[this.spawn.room.name][i]].defense.underAttack && Memory.rooms[targetRooms[this.spawn.room.name][i]].defense.lastAttacker == 'Invader'){
             //console.log('Room '+ targetRooms[this.spawn.room.name][i] + ' under attack, spawning melees');
             //creepsToSpawn[this.spawn.room.name][type]['melee'] += Math.ceil(Memory.rooms[targetRooms[this.spawn.room.name][i]].defense.hostiles.number/5);
             //creepsToSpawn[this.spawn.room.name][type]['ranged'] += Math.ceil(Memory.rooms[targetRooms[this.spawn.room.name][i]].defense.hostiles.number/5);
             //creepsToSpawn[this.spawn.room.name][type]['hybrid'] = 1;
             //console.log('Attackers ' + creepsToSpawn[this.spawn.room.name]['adventurer']['melee']);
             //console.log('Ranged ' + creepsToSpawn[this.spawn.room.name]['adventurer']['ranged']);
         }
     }
 }
};
 
 Spawn.prototype.spawnCreepv2 = function(creepType,essential){
     if(this.spawning){
         return;
     }
     
     let needSpawn = this.needSpawn(creepType);
     if(!needSpawn){
         return;
     }
     
     if(essential == undefined){
         essential = false;
     }     
     
     let maxCost = this.spawn.energyCapacity + this.spawn.room.energy.extensions.max;
     let avEnergy = this.spawn.room.energy[this.spawn.name] + this.spawn.room.energy.extensions.available;
     
     let body = undefined;
     if(!creepBodies[this.spawn.room.name] || !creepBodies[this.spawn.room.name][creepType] || !creepBodies[this.spawn.room.name][creepType][needSpawn.role]){
         //console.log(this.spawn.name + ' using default');
         body = defaultCreepBodies[creepType][needSpawn.role];
     }
     else {
         //console.log(this.spawn.name + ' not using default');
         body = creepBodies[this.spawn.room.name][creepType][needSpawn.role];
     }
     let bodyCost = this.bodyCost(body);
     
    if(essential && bodyCost > avEnergy){
         //Spawn best creep you can with available energy
         let nTransporters = undefined;
         if(this.spawn.room.memory.creeps && this.spawn.room.memory.creeps['settler']){nTransporters = this.spawn.room.memory.creeps['settler']['filler']}
         if((!nTransporters && avEnergy >= SPAWN_ENERGY_START) || (nTransporters && avEnergy == maxCost)){
             //Spawns and extensions won't be filled by transporters and energy won't regenerate OR spawns will be filled but bodyCost is higher than maxCost
             body = this.reduceBody(body,avEnergy)             
         }
     }
     if(this.spawn.canCreateCreep(body) == OK){
         console.log(this.spawn.name + ' is spanwing ' + creepType + ' ' + needSpawn.role + ' ' + this.spawn.createCreep(body,null,{role: needSpawn.role, type: creepType, origin: this.spawn.room.name}) + ' with body: ' + body + ' in game tick ' + Game.time);
         this.spawning = true;
         this.logMemory(creepType,needSpawn.role);
     }     
 };

 Spawn.prototype.needSpawn = function(creepType){
     //let start = Game.cpu.getUsed();
     
     let nCreep = [];
     let needSpawn = false;
     for(let i=0; i<this.roles[creepType].length && !needSpawn; i++){
         if(this.spawn.room.memory.creeps && this.spawn.room.memory.creeps[creepType] && this.spawn.room.memory.creeps[creepType][this.roles[creepType][i]]){
             nCreep[i] = this.spawn.room.memory.creeps[creepType][this.roles[creepType][i]];
         }
         else {
             //No creeps of this type yet
             nCreep[i] = 0;
         }
         //console.log(this.spawn.name + ' ' + creepType + ' ' + this.roles[creepType][i] + ' need: ' + creepsToSpawn[this.spawn.room.name][creepType][this.roles[creepType][i]] + ' have ' + nCreep[i]);
         needSpawn = needSpawn || nCreep[i] < creepsToSpawn[this.spawn.room.name][creepType][this.roles[creepType][i]];
         if(needSpawn){
             //let used = Game.cpu.getUsed() - start;
             //console.log('Checking needSpawn for ' + spawn.name + ' took ' + used + ' cpu units');
             return {role: this.roles[creepType][i], number: nCreep[i]};
         }
     }
     //let used = Game.cpu.getUsed() - start;
     //console.log('Checking needSpawn for ' + spawn.name + ' took ' + used + ' cpu units');     
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
    //let start = Game.cpu.getUsed();
    
    if(this.spawn.room.memory.creeps == undefined){
        //console.log('First entry in room ' + spawn.room.name);
        let mem = {};
        mem[type] = {};
        mem[type][role] = 1;
        this.spawn.room.memory.creeps = mem;
    }
    else if(this.spawn.room.memory.creeps[type] == undefined){
        //console.log('New role ' + role + ' of ' + type +' add for room ' + spawn.room.name);
        let mem = {};
        mem[role] = 1;
        this.spawn.room.memory.creeps[type] = mem;
    }
    else if(this.spawn.room.memory.creeps[type][role] == undefined){
        //console.log('New role ' + role + ' of ' + type +' add for room ' + spawn.room.name);
        this.spawn.room.memory.creeps[type][role] = 1;
    }
    else {
        //console.log('+1 for ' + role + ' of ' + type + ' in room' + spawn.room.name);
        this.spawn.room.memory.creeps[type][role]++;
    }
    //let used = Game.cpu.getUsed() - start;
    //console.log('Adding spawn creep to memory count took ' + used + ' cpu units');
};
 
module.exports = Spawn;