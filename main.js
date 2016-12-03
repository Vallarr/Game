var Roles = require('creep.roles');
var buildStructures = require('structures.build');
var autoSpawn = require('spawn.creep');
var roomChecks = require('room.checks');
var Link = require('structures.link');
var util = require('utilities');
var trade = require('market');

//Test

var exploreRooms = {'W32N25': ['W32N26','W33N25'], 'W33N26': ['W32N26']};
var adventureRooms = {'W32N25': ['W35N25','W34N25'], 'W33N26': []};
var claimRooms = {'W32N25': {'W33N26': true}};
                   
module.exports.loop = function () {
    //console.log('Loading scripts took ' + Game.cpu.getUsed() + ' cpu units');
    /*var stringified = JSON.stringify(Memory);
    var startCpu = Game.cpu.getUsed();
    JSON.parse(stringified);
    console.log('CPU spent on Memory parsing:', Game.cpu.getUsed() - startCpu);*/
    for(let name in Game.rooms) {
        try {
            //let start = Game.cpu.getUsed();
            let roomToCheck = new roomChecks(Game.rooms[name]);
            roomToCheck.check();
            //let used = Game.cpu.getUsed() - start;
            //console.log('Determining room specific parameters in room ' + name + ' took ' + used + ' cpu units');
        }
        catch(err){
            console.log('Error while determining room specific parameters of room ' + name);
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
            let type = '';
            if(Memory.creeps[name].settler){
                type = 'settler'
            }
            else if(Memory.creeps[name].explorer){
                type = 'explorer';
            }
            else {
                type = Memory.creeps[name].type;
            }
            if(Memory.rooms[Memory.creeps[name].origin].creeps && Memory.rooms[Memory.creeps[name].origin].creeps[type] && Memory.rooms[Memory.creeps[name].origin].creeps[type][Memory.creeps[name].role]){
                //console.log('-1 for ' + role + ' of ' + type + ' in room ' + origin);
                Memory.rooms[Memory.creeps[name].origin].creeps[type][Memory.creeps[name].role]--;
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
            let spawn = new autoSpawn(Game.spawns[name],exploreRooms,adventureRooms);
            spawn.spawnCreepv2('defender');
            spawn.spawnDedicatedCreep();
            spawn.spawnCreep();
            spawn.spawnExplorerCreep();
            spawn.spawnCreepv2('adventurer');
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
            if(!Game.creeps[name].spawning){
                let creepCPUStart = Game.cpu.getUsed();
                if(Game.creeps[name].memory.role == 'harvester') {
                    if(Game.creeps[name].memory.settler){
                        if(Game.creeps[name].memory.dedicated){
                            //console.log('Dedicated creep');
                            Roles.creepDedicatedHarvest(Game.creeps[name]);
                        }
                        else {
                            Roles.creepHarvest(Game.creeps[name]);                
                        }                    
                    }
                    else if(Game.creeps[name].memory.explorer){
                        Roles.creepExplorerHarvest(Game.creeps[name],exploreRooms);
                    }
                    else if(Game.creeps[name].memory.type == 'adventurer'){
                        Roles.creepExplorerHarvest(Game.creeps[name],adventureRooms);
                    }
                }
                if(Game.creeps[name].memory.role == 'miner'){
                    Roles.creepDedicatedMiner(Game.creeps[name]);
                }
                if(Game.creeps[name].memory.role == 'transporter'){
                    if(Game.creeps[name].memory.settler){
                        Roles.creepDedicatedTransporter(Game.creeps[name]);
                    }
                    else if(Game.creeps[name].memory.explorer){
                        Roles.creepExplorerTransporter(Game.creeps[name],exploreRooms);
                    }
                    else if(Game.creeps[name].memory.type == 'adventurer'){
                        Roles.creepExplorerTransporter(Game.creeps[name],adventureRooms);
                    }
                }
                if(Game.creeps[name].memory.role == 'upgrader') {
                    if(Game.creeps[name].memory.settler){
                        if(Game.creeps[name].memory.dedicated){
                            Roles.creepDedicatedUpgrader(Game.creeps[name]);
                        }
                        else {
                            Roles.creepUpgrade(Game.creeps[name]);
                        }                        
                    }
                    else if(Game.creeps[name].memory.explorer){
                        Roles.creepExplorerUpgrader(Game.creeps[name],exploreRooms);
                    }
                }
                if(Game.creeps[name].memory.role == 'builder') {
                    if(Game.creeps[name].memory.settler){
                        if(Game.creeps[name].memory.dedicated){
                            Roles.creepDedicatedBuild(Game.creeps[name]);
                        }
                        else{
                            Roles.creepBuild(Game.creeps[name]);
                        }                    
                    }
                    else if(Game.creeps[name].memory.explorer){
                        Roles.creepExplorerBuild(Game.creeps[name],exploreRooms);
                    }
                    else if(Game.creeps[name].memory.type == 'adventurer'){
                        Roles.creepExplorerBuild(Game.creeps[name],adventureRooms);
                    }
                }
                if(Game.creeps[name].memory.role == 'repairer') {
                    if(Game.creeps[name].memory.settler){
                        if(Game.creeps[name].memory.dedicated){
                            Roles.creepDedicatedRepair(Game.creeps[name]);
                        }
                        else{
                            Roles.creepRepair(Game.creeps[name]);
                        }                    
                    }
                    else if(Game.creeps[name].memory.explorer){
                        Roles.creepExplorerRepair(Game.creeps[name],exploreRooms);
                    }
                    else if(Game.creeps[name].memory.type == 'adventurer'){
                        Roles.creepExplorerRepair(Game.creeps[name],adventureRooms);
                    }
                }
                if(Game.creeps[name].memory.role == 'reserver'){
                    Roles.creepExplorerReserver(Game.creeps[name],exploreRooms,claimRooms);
                }
                if(Game.creeps[name].memory.role == 'melee') {
                    if(Game.creeps[name].memory.explorer){
                        Roles.creepExplorerMelee(Game.creeps[name],exploreRooms);
                    }
                    else if(Game.creeps[name].memory.settler){
                        Roles.creepMelee(Game.creeps[name]);
                    }
                    else if(Game.creeps[name].memory.type == 'adventurer'){
                        Roles.creepExplorerCombat(Game.creeps[name],adventureRooms);
                    }
                    else if(Game.creeps[name].memory.type == 'defender'){
                        Roles.creepDefenderCombat(Game.creeps[name]);
                    }                     
                }
                if(Game.creeps[name].memory.role == 'ranged') {
                    if(Game.creeps[name].memory.type == 'adventurer'){
                        Roles.creepExplorerCombat(Game.creeps[name],adventureRooms);
                    }
                    else if(Game.creeps[name].memory.type == 'defender'){
                        Roles.creepDefenderCombat(Game.creeps[name]);
                    }                    
                }  
                if(Game.creeps[name].memory.role == 'patroller') {
                    if(Game.creeps[name].memory.type == 'adventurer'){
                        Roles.creepExplorerCombat(Game.creeps[name],adventureRooms);
                    }
                }                  
                //console.log(creep.memory.role + ' creep ' + name + ' used ' + Game.cpu.getUsed()-creepCPUStart + ' cpu units this tick');
                Game.creeps[name].memory.cpu += Game.cpu.getUsed()-creepCPUStart;
                if(Game.creeps[name].ticksToLive == 1){
                    console.log(Game.creeps[name].memory.role + ' creep ' + name + ' died. It used an average of ' + Game.creeps[name].memory.cpu / CREEP_LIFE_TIME + ' cpu units per tick');
                }
            }
        }
        catch (err){
            console.log('An error occured with ' + Game.creeps[name].memory.role + ' ' + name);
            console.log(err);
        }
    }
    
    for(let name in Game.rooms){
        try{
            let energyLinker = new Link(Game.rooms[name]);
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
    
    try {
        
    }
    catch(err){
        console.log('Error in test script');
    }
}