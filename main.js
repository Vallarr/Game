var Utilities = require('Game.utilities');
global.util = new Utilities();
require('Global.variables');
//require('Global.constants');
require('Creep');
require('Room.checks');
require('Room.build');
require('Link');
require('Spawn');
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
        }
        
        //If number of creeps in memory is wrong use this to recount creeps
        /*try {
            util.countCreeps();
        }
        catch(err) {
            console.log(err);
        }*/
        
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
                let spawn = Game.spawns[name];
                spawn.run();
            }
            catch(err){
                console.log('Error while spanwing with spawn ' + name + ' in room ' + Game.spawns[name].room.name);
                console.log(err);
            }
        }
        
        for(let name in Game.creeps) {
            try {
                Game.creeps[name].animate();
            }
            catch (err){
                console.log('An error occured with ' + Game.creeps[name].memory.role + ' ' + name);
                console.log(err);
            }
        }
        
        for(let name in Game.rooms) {
            try {
                let room = Game.rooms[name];
                room.build();
            }
            catch(err){
                console.log('Error while building structures in room ' + name);
                console.log(err);
            }
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
    });
}