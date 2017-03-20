var Utilities = require('Game.utilities');
global.util = new Utilities();
require('Global.variables');
require('Global.constants');
require('Creep');
require('Creep.properties');
global.roomObjectContainer = require('roomObjectContainer');
require('Room.properties');
require('Room.checks');
require('Room.build');
require('Link');
require('Spawn');
require('Lab');
require('Structures.properties');
//require('Game.properties');
require('Room.spawnQueue');
require('Room.creepsToSpawn');
require('Storagecontents');

var trade = require('Market');

const profiler = require('screeps.profiler');
profiler.enable();

module.exports.loop = function () {
    /*console.log('Loading scripts took ' + Game.cpu.getUsed() + ' cpu units');
    var stringified = JSON.stringify(Memory);
    var startCpu = Game.cpu.getUsed();
    JSON.parse(stringified);
    console.log('CPU spent on Memory parsing:', Game.cpu.getUsed() - startCpu);*/
    
    profiler.wrap(function() {
        for(let name in Game.rooms) {
            //let st = Game.cpu.getUsed();
            try {
                let room = Game.rooms[name];
                room.check();
                //console.log(room.name + ' ' + JSON.stringify(room));
            }
            catch(err){
                console.log('Error while determining room specific parameters of room ' + name);
                console.log(err);
            }
            try {
                let room = Game.rooms[name];
                room.linkEnergy();
            }
            catch(err){
                console.log('Error while linking energy in room ' + name);
                console.log(err);
            }
            try {
                let room = Game.rooms[name];
                room.createBoosts();
            }
            catch(err){
                console.log('Error while creating boosts in room ' + name);
                console.log(err);
            }
            /*let used = Game.cpu.getUsed() - st;
            if(used > 2){
                console.log(name + ' cpu ', used);
            }*/
        }
        
        for(let name in Game.rooms) {
            //let st = Game.cpu.getUsed();
            try {
                let room = Game.rooms[name];
                room.checkCreepsToSpawn();
            }
            catch(err){
                console.log('Error while determining number of creeps to spawn');
                console.log(err);
            }
            /*let used = Game.cpu.getUsed() - st;
            if(used > 2){
                console.log(name + ' cpu ', used);
            }*/
        }
        
        for(let name in Memory.creeps) {
            if(!Game.creeps[name]) {
                let type = Memory.creeps[name].type;
                if(Memory.rooms[Memory.creeps[name].origin].creeps && Memory.rooms[Memory.creeps[name].origin].creeps[type] && Memory.rooms[Memory.creeps[name].origin].creeps[type][Memory.creeps[name].role]){
                    Memory.rooms[Memory.creeps[name].origin].creeps[type][Memory.creeps[name].role]--;
                    if(Memory.rooms[Memory.creeps[name].origin].creeps[type][Memory.creeps[name].role] < 0){
                        Memory.rooms[Memory.creeps[name].origin].creeps[type][Memory.creeps[name].role] = 0;
                    }
                }
                delete Memory.creeps[name];
            }
        }
        
        for(let name in Game.spawns){
            try {
                //let st = Game.cpu.getUsed();                
                let spawn = Game.spawns[name];
                spawn.run();
                /*let used = Game.cpu.getUsed() - st;
                if(used > 1){
                    console.log(name + ' cpu ', used);
                }*/
            }
            catch(err){
                console.log('Error while spanwing with spawn ' + name + ' in room ' + Game.spawns[name].room.name);
                console.log(err);
            }
        }
        
        //console.log('Spawns ' + Game.cpu.getUsed());
        
        for(let name in Game.creeps) {
            try {
                Game.creeps[name].setCostInMatrix();
            }
            catch(err){
                console.log('Error while setting creep costs in costMatrix for creep ' + name + ' in room ' + Game.creeps[name].room.name);
                console.log(err);
            }
        }
        
        global.RedoCreeps = [];
        for(let name in Game.creeps) {
            try {
                //let st = Game.cpu.getUsed();
                Game.creeps[name].animate();
                /*let used = Game.cpu.getUsed() - st;
                if(used > 2){
                    console.log(name + ' cpu ', used);
                }*/
            }
            catch (err){
                console.log('An error occured with ' + Game.creeps[name].memory.role + ' ' + name + ' in room ' + Game.creeps[name].room.name);
                console.log(err);
            }
        }
        if(RedoCreeps.length){
            for(let i=0; i<RedoCreeps.length; i++){
                try {
                    RedoCreeps[i].animate();
                }
                catch(err){
                    console.log('An error occured during redo of ' + RedoCreeps[i].memory.role + ' ' + RedoCreeps[i].name + ' in room ' + RedoCreeps[i].room.name);
                    console.log(err);
                }
            }
        }
        
        //console.log('Creeps ' + Game.cpu.getUsed());
        
        for(let name in Game.rooms) {
            try {
                let room = Game.rooms[name];
                room.build();
            }
            catch(err){
                console.log('Error while building structures in room ' + name);
                console.log(err);
            }
            /*try {
                let room = Game.rooms[name];
                room.populateSpawnQueue();
            }
            catch(err) {
                console.log('Error while filling spawn queue');
                console.log(err);
            }*/
        }
        
        //console.log('Build & nSpawn ' + Game.cpu.getUsed());
        
        try {
            let merchant = new trade();
            merchant.trade();
        }
        catch(err){
            console.log('Error while trading');
            console.log(err);
        }
        
        //console.log('Market ' + Game.cpu.getUsed());
    
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
            let currentSeconds = Date.now() / 1000;
            let previousSeconds = Memory.previousSeconds || currentSeconds;
            let tickLength = currentSeconds - previousSeconds;
            
            if (Memory.averageTickLength == undefined) {
                Memory.averageTickLength = tickLength;
            }
            if (Memory.averageTickLengthCounter == undefined || Memory.averageTickLengthCounter > 10000) {
                Memory.averageTickLengthCounter = 1;
            }
            let multiplied = Memory.averageTickLength * Memory.averageTickLengthCounter;
            let newMultiplied = multiplied + tickLength;
            Memory.averageTickLengthCounter = Memory.averageTickLengthCounter + 1;
            Memory.averageTickLength = newMultiplied / Memory.averageTickLengthCounter;
            
            Memory.previousSeconds = currentSeconds;
        }
        catch(err){
            console.log('Error in tick length counting');
            console.log(err);
        }
        
        try {
            //console.log('B4');
            //console.log(JSON.stringify(util.targOfCreeps));
        }
        catch(err){
            console.log('Error in test script');
            console.log(err);
        }
        
        //console.log('Test ' + Game.cpu.getUsed());
    });
}