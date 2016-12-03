var Roles = require('creep.roles');
var buildStructures = require('structures.build');
var autoSpawn = require('spawn.creep');
var roomChecks = require('room.checks');
var Link = require('structures.link');
var util = require('utilities');
var trade = require('market');

var exploreRooms = {'W32N25': ['W32N26','W33N25'], 'W33N26': ['W32N26']};
var claimRooms = {'W32N25': {'W33N26': true}};
                   
module.exports.loop = function () {

    for(let name in Game.rooms) {
        let room = Game.rooms[name];
        //console.log(name);
        try {
            let roomToCheck = new roomChecks(room);
            roomToCheck.check();
        }
        catch(err){
            console.log('Error while determining room specific parameters of room ' + room.name);
            console.log(err);
        }
    }
    
    //If number of creeps in memory is wrong use this to recount creeps
    /*let startCount = Game.cpu.getUsed();
    try {
        util.countCreeps();
    }
    catch(err) {
        console.log(err);
    }
    let usedCount = Game.cpu.getUsed() - startCount;
    console.log('Counting creeps took ' + usedCount + ' cpu units');*/
    
    //let startClear = Game.cpu.getUsed();
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            let mem = Memory.creeps[name];
            let role = mem.role;
            let type = '';
            if(mem.settler){
                type = 'settler'
            }
            else if(mem.explorer){
                type = 'explorer';
            }
            else if(mem.defender){
                type = 'defender';
            }
            let origin = mem.origin;
            if(Memory.rooms[origin].creeps && Memory.rooms[origin].creeps[type] && Memory.rooms[origin].creeps[type][role]){
                //console.log('-1 for ' + role + ' of ' + type + ' in room ' + origin);
                Memory.rooms[origin].creeps[type][role]--;
            }
            delete Memory.creeps[name];
            //console.log('Clearing non-existing creep memory:', name);
        }
    }
    //let usedClear = Game.cpu.getUsed() - startClear;
    //console.log('Clearing creep memory took ' + usedClear + ' cpu units');
    
    for(let name in Game.spawns){
        try {
            /*if(name != 'Spawn3'){
                
            }*/
            //let start = Game.cpu.getUsed();            
            let spawn = new autoSpawn(Game.spawns[name],exploreRooms);
            spawn.spawnDefenderCreep();
            spawn.spawnDedicatedCreep();
            spawn.spawnCreep();
            spawn.spawnExplorerCreep();
            //let used = Game.cpu.getUsed()-start;
            //console.log('Checking spawns for '+ name + ' took ' + used + ' cpu units');            
        }
        catch(err){
            console.log('Error while spanwing with spawn ' + name + ' in room ' + Game.spawns[name].room.name);
            console.log(err);
        }
    }
    
    for(let name in Game.creeps) {
        try {
            let creep = Game.creeps[name];
            if(!creep.spawning){
                let creepCPUStart = Game.cpu.getUsed();
                if(creep.memory.role == 'harvester') {
                    if(creep.memory.settler){
                        if(creep.memory.dedicated){
                            //console.log('Dedicated creep');
                            Roles.creepDedicatedHarvest(creep);
                        }
                        else {
                            Roles.creepHarvest(creep);                
                        }                    
                    }
                    else if(creep.memory.explorer){
                        Roles.creepExplorerHarvest(creep,exploreRooms);
                    }
                }
                if(creep.memory.role == 'miner'){
                    Roles.creepDedicatedMiner(creep);
                }
                if(creep.memory.role == 'transporter'){
                    if(creep.memory.settler){
                        Roles.creepDedicatedTransporter(creep);
                    }
                    else if(creep.memory.explorer){
                        Roles.creepExplorerTransporter(creep,exploreRooms);
                    }
                }
                if(creep.memory.role == 'upgrader') {
                    if(creep.memory.settler){
                        if(creep.memory.dedicated){
                            Roles.creepDedicatedUpgrader(creep);
                        }
                        else {
                            Roles.creepUpgrade(creep);
                        }                        
                    }
                    else if(creep.memory.explorer){
                        Roles.creepExplorerUpgrader(creep,exploreRooms);
                    }
                }
                if(creep.memory.role == 'builder') {
                    if(creep.memory.settler){
                        if(creep.memory.dedicated){
                            Roles.creepDedicatedBuild(creep);
                        }
                        else{
                            Roles.creepBuild(creep);
                        }                    
                    }
                    else if(creep.memory.explorer){
                        Roles.creepExplorerBuild(creep,exploreRooms);
                    }
                }
                if(creep.memory.role == 'repairer') {
                    if(creep.memory.settler){
                        if(creep.memory.dedicated){
                            Roles.creepDedicatedRepair(creep);
                        }
                        else{
                            Roles.creepRepair(creep);
                        }                    
                    }
                    else if(creep.memory.explorer){
                        Roles.creepExplorerRepair(creep,exploreRooms);
                    }
                }
                if(creep.memory.role == 'reserver'){
                    Roles.creepExplorerReserver(creep,exploreRooms,claimRooms);
                }
                if(creep.memory.role == 'melee') {
                    if(creep.memory.explorer){
                        Roles.creepExplorerMelee(creep,exploreRooms);
                    }
                    else if(creep.memory.settler){
                        Roles.creepMelee(creep);
                    }
                    else if(creep.memory.defender){
                        Roles.creepDefenderMelee(creep);
                    }
                }
                if(creep.memory.role == 'ranged'){
                    if(creep.memory.defender){
                        Roles.creepDefenderRanged(creep);
                    }
                }
                let creepLifetimeCPU = creep.memory.cpu;
                let creepTickCPU = Game.cpu.getUsed()-creepCPUStart;
                //console.log(creep.memory.role + ' creep ' + name + ' used ' + creepTickCPU + ' cpu units this tick');
                creepLifetimeCPU += creepTickCPU;
                creep.memory.cpu = creepLifetimeCPU;
                if(creep.ticksToLive == 1){
                    console.log(creep.memory.role + ' creep ' + name + ' died. It used an average of ' + creep.memory.cpu / CREEP_LIFE_TIME + ' cpu units per tick');
                }
            }
        }
        catch (err){
            console.log('An error occured with ' + Game.creeps[name].memory.role + ' ' + name);
            console.log(err);
        }
    }
    
    for(let name in Game.rooms){
        let room = Game.rooms[name];
        try{
            let energyLinker = new Link(room);
            energyLinker.linkEnergy();
        }
        catch(err){
            console.log('Error while linking energy in room ' + name);
            console.log(err);
        }        
    }

    
    try {
        //let start = Game.cpu.getUsed();
        buildStructures.run();
        //let used = Game.cpu.getUsed()-start;
        //console.log('Placing buildings took ' + used + ' cpu units');
    }
    catch(err){
        console.log('Error while building structures');
        console.log(err);
    }
    
    try {
        let merchant = new trade();
        merchant.trade();
    }
    catch(err){
        console.log('Error while trading');
        console.log(err);
    }

    if(Memory.cpu){
        if(Game.time%2000 == 0){
            console.log('Used an average of ' + Memory.cpu.units / Memory.cpu.ticks + ' cpu units per tick in the last 2000 ticks');
            Memory.cpu.ticks = 1;
            Memory.cpu.units = Game.cpu.getUsed();            
        }
        else {
            Memory.cpu.ticks++;
            Memory.cpu.units += Game.cpu.getUsed();             
        }
    }
    else {
        //1st time
        Memory.cpu = {ticks: 1, units: Game.cpu.getUsed()};
    }
    if(Game.time%1000 == 0){
        console.log(Game.cpu.getUsed() + ' cpu units were used during game tick ' + Game.time);
        console.log('There are ' + Game.cpu.bucket + ' cpu units in your bucket');
    }

    //console.log(JSON.stringify(Game.creeps));
    //console.log(JSON.stringify(Memory.rooms['W34N26']));
}