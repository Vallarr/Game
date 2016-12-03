var creepsToSpawn = {'W32N25':  {settler: {harvester: 2, transporter: 2, repairer: 1, builder: 0, upgrader: 2, melee: 0, miner: 1},
                                explorer: {harvester: 3, transporter: 3, repairer: 1, builder: 0, reserver: 2, upgrader: 0, melee: 0},
                                adventurer: {harvester: 3, transporter: 7, repairer: 2, builder: 0, melee: 0, ranged: 0, patroller: 0},
                                defender: {repairer: 0, builder: 0, melee: 0, ranged: 0}},
                     'W33N26':  {settler: {harvester: 2, transporter: 2, repairer: 1, builder: 0, upgrader: 2, melee: 0, miner: 1},
                                explorer: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, melee: 0},
                                adventurer: {harvester: 0, transporter: 0, repairer: 0, builder: 0, melee: 0, ranged: 0, patroller: 0},
                                defender: {repairer: 0, builder: 0, melee: 0, ranged: 0}}
                    };
var defaultCreepBodies =   {settler:   {harvester: [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE],
                                        transporter: [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        repairer: [WORK,CARRY,WORK,CARRY,MOVE,WORK,CARRY,WORK,CARRY,MOVE,WORK,CARRY,WORK,CARRY,MOVE,MOVE,MOVE,MOVE],
                                        builder: [WORK,CARRY,WORK,CARRY,MOVE,WORK,CARRY,WORK,CARRY,MOVE,WORK,CARRY,WORK,CARRY,MOVE,MOVE,MOVE,MOVE],
                                        upgrader: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE],
                                        miner: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE]},
                            explorer:  {harvester: [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE],
                                        transporter: [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        repairer: [WORK,CARRY,WORK,CARRY,MOVE,WORK,CARRY,WORK,CARRY,MOVE,WORK,CARRY,WORK,CARRY,MOVE,WORK,CARRY,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        builder: [WORK,CARRY,WORK,CARRY,MOVE,WORK,CARRY,WORK,CARRY,MOVE,WORK,CARRY,WORK,CARRY,MOVE,WORK,CARRY,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        reserver: [CLAIM,CLAIM,MOVE,MOVE], 
                                        upgrader: [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        melee: [TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]},
                            adventurer:{harvester: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
                                        transporter: [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
                                        repairer: [WORK,CARRY,WORK,CARRY,MOVE,WORK,CARRY,WORK,CARRY,MOVE,WORK,CARRY,WORK,CARRY,MOVE,MOVE,MOVE,MOVE],
                                        builder: [WORK,CARRY,WORK,CARRY,MOVE,WORK,CARRY,WORK,CARRY,MOVE,WORK,CARRY,WORK,CARRY,MOVE,MOVE,MOVE,MOVE], 
                                        melee: [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        ranged: [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        patroller: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL]},
                            defender:  {repairer: [WORK,WORK,WORK,WORK,CARRY,WORK,CARRY,WORK,CARRY,WORK,CARRY,WORK,CARRY,WORK,CARRY,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        builder: [WORK,WORK,WORK,WORK,CARRY,WORK,CARRY,WORK,CARRY,WORK,CARRY,WORK,CARRY,WORK,CARRY,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        melee: [TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE],
                                        ranged: [TOUGH,TOUGH,TOUGH,TOUGH,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]}
                            };                  
var creepBodies =   {'W32N25': {settler:   {harvester: [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE],
                                            transporter: [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                            repairer: [CARRY,WORK,CARRY,WORK,CARRY,WORK,CARRY,WORK,CARRY,WORK,MOVE,MOVE,MOVE,MOVE,MOVE],
                                            builder: [CARRY,WORK,CARRY,CARRY,WORK,CARRY,CARRY,WORK,MOVE,MOVE,MOVE,MOVE],
                                            upgrader: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE],
                                            miner: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE]},
                                explorer:  {harvester: [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE],
                                            transporter: [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                            repairer: [CARRY,WORK,CARRY,WORK,CARRY,WORK,CARRY,WORK,CARRY,WORK,MOVE,MOVE,MOVE,MOVE,MOVE],
                                            builder: [WORK,CARRY,CARRY,WORK,CARRY,CARRY,WORK,CARRY,CARRY,WORK,MOVE,MOVE,MOVE,MOVE,MOVE],
                                            reserver: [CLAIM,CLAIM,MOVE,MOVE], 
                                            upgrader: [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                                            melee: [TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]}},
                     'W33N26': {settler:   {harvester: [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE],
                                            transporter: [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                            repairer: [CARRY,WORK,CARRY,WORK,CARRY,WORK,CARRY,WORK,MOVE,MOVE,MOVE,MOVE],
                                            builder: [CARRY,WORK,CARRY,CARRY,WORK,CARRY,CARRY,WORK,MOVE,MOVE,MOVE,MOVE],
                                            upgrader: [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE],
                                            miner: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE]},
                                explorer:  {harvester: [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE],
                                            transporter: [CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                            repairer: [CARRY,WORK,CARRY,WORK,CARRY,WORK,CARRY,WORK,CARRY,WORK,MOVE,MOVE,MOVE,MOVE,MOVE],
                                            builder: [WORK,CARRY,CARRY,WORK,CARRY,CARRY,WORK,CARRY,CARRY,WORK,MOVE,MOVE,MOVE,MOVE,MOVE],
                                            reserver: [CLAIM,CLAIM,MOVE,MOVE],
                                            upgrader: [WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE],
                                            melee: [TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE]}}                      
                    };
 
 
 var Spawn = function(spawn,explorerRooms,adventureRooms){
     this.spawn = spawn;
     this.spawning = spawn.spawning;
     this.explorerRooms = explorerRooms;
     this.adventureRooms = adventureRooms;
     this.checkExplorerAttack();
     this.checkAttack(adventureRooms,'adventurer');
     this.roles = ['melee','harvester','builder','repairer','upgrader'];
     this.roles.settler = ['harvester','transporter','repairer','builder','upgrader','melee','miner'];
     this.roles.defender = ['repairer','builder','melee','ranged']
     this.roles.explorer = ['melee','harvester','transporter','repairer','builder','reserver','upgrader'];
     this.roles.adventurer = ['ranged','patroller','melee','harvester','transporter','repairer','builder'];
 };
 
 Spawn.prototype.checkExplorerAttack = function(){
     if(this.explorerRooms[this.spawn.room.name] != undefined){
         creepsToSpawn[this.spawn.room.name]['explorer']['melee'] = 0;
         for(let i=0; i<this.explorerRooms[this.spawn.room.name].length; i++){
             if(Memory.rooms[this.explorerRooms[this.spawn.room.name][i]].defense.underAttack){
                 //console.log('Room '+ this.explorerRooms[this.spawn.room.name][i] + ' under attack, spawning melees');
                 creepsToSpawn[this.spawn.room.name]['explorer']['melee'] += Memory.rooms[this.explorerRooms[this.spawn.room.name][i]].defense.hostiles.number;
             }
         }
     }
 };
 
Spawn.prototype.checkAttack = function(targetRooms,type){
 if(targetRooms[this.spawn.room.name] != undefined){
     creepsToSpawn[this.spawn.room.name][type]['melee'] = 0;
     creepsToSpawn[this.spawn.room.name][type]['ranged'] = 0;
     for(let i=0; i<targetRooms[this.spawn.room.name].length; i++){
         //console.log(JSON.stringify(Memory.rooms[targetRooms[this.spawn.room.name][i]]));
         if(Memory.rooms[targetRooms[this.spawn.room.name][i]].defense.underAttack){
             if(Memory.rooms[targetRooms[this.spawn.room.name][i]].defense.lastAttacker == 'Invader'){
                 //console.log('Room '+ targetRooms[this.spawn.room.name][i] + ' under attack, spawning melees');
                 creepsToSpawn[this.spawn.room.name][type]['melee'] += Math.ceil(Memory.rooms[targetRooms[this.spawn.room.name][i]].defense.hostiles.number/2);
                 creepsToSpawn[this.spawn.room.name][type]['ranged'] += Math.ceil(Memory.rooms[targetRooms[this.spawn.room.name][i]].defense.hostiles.number/2);
                 //console.log('Attackers ' + creepsToSpawn[this.spawn.room.name]['adventurer']['melee']);
                 //console.log('Ranged ' + creepsToSpawn[this.spawn.room.name]['adventurer']['ranged']);                 
             }
             else if(Memory.rooms[targetRooms[this.spawn.room.name][i]].defense.lastAttacker != 'Source Keeper'){
                 let controller = this.spawn.room.controller;
                 if(controller && controller.owner && controller.owner.username == 'Vervust'){
                     let ramparts = this.spawn.room.memory.rampart;
                     creepsToSpawn[this.spawn.room.name][type]['melee'] = ramparts.melee.length;
                     creepsToSpawn[this.spawn.room.name][type]['ranged'] = ramparts.ranged.length;
                 }
             }
         }
     }
 }
};
 
 Spawn.prototype.spawnCreepv2 = function(creepType){
     if(this.spawning){
         return;
     }
     
     let needSpawn = this.needSpawn(creepType);
     if(!needSpawn){
         return;
     }
     
     let maxCost = this.spawn.energyCapacity + this.spawn.room.memory.energy.extensions.max;
     let avEnergy = this.spawn.room.memory.energy[this.spawn.name] + this.spawn.room.memory.energy.extensions.available;
     
     let body = undefined;
     if(!creepBodies[this.spawn.room.name] || ! creepBodies[this.spawn.room.name][creepType] || !creepBodies[this.spawn.room.name][creepType][needSpawn.role]){
         body = defaultCreepBodies[creepType][needSpawn.role];
     }
     else {
         body = creepBodies[this.spawn.room.name][creepType][needSpawn.role];
     }
     let bodyCost = this.bodyCost(body);
     
     if(avEnergy >= bodyCost) {
         if(this.spawn.canCreateCreep(body) == OK){
             console.log(this.spawn.name + ' is spanwing ' + creepType + ' ' + needSpawn.role + ' ' + this.spawn.createCreep(body,null,{role: needSpawn.role, type: creepType, origin: this.spawn.room.name}) + ' with body: ' + body + ' in game tick ' + Game.time);
             this.spawning = true;
             this.logMemory(creepType,needSpawn.role);
         }
     }
 }
 
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
    let body = creepBodies[this.spawn.room.name]['settler'][needSpawn.role];
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

Spawn.prototype.spawnExplorerCreep = function(){
    if(this.spawning){
        return;
    }
    
    let needSpawn = this.needSpawn('explorer');    
    //console.log(needSpawn.role);
    if(!needSpawn){
        return;
    }

    let body = creepBodies[this.spawn.room.name]['explorer'][needSpawn.role];
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

Spawn.prototype.logMemory = function(type,role){
    //let start = Game.cpu.getUsed();
    
    if(this.spawn.room.memory.creeps == undefined){
        //console.log('First entry in room ' + spawn.room.name);
        let mem = {};
        mem[type] = {};
        mem[type][role] = 1;
        spawn.room.memory.creeps = mem;
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