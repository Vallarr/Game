/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('Creep');
 * mod.thing == 'a thing'; // true
 */
 
Creep.prototype.animate = function(exploreRooms,claimRooms){
    if(this.moveFromMemory()){return}
    
    if(exploreRooms == undefined){
        this.targetRooms = [this.memory.origin];
    }
    else if(exploreRooms[this.memory.origin] == undefined || !exploreRooms[this.memory.origin].length){
        console.log('No target rooms specified for ' + this.memory.role + ' ' + this.memory.type + ' ' + this.name + ' of room ' + this.memory.origin);
        return;            
    }
    else {
        this.targetRooms = exploreRooms[creep.memory.origin];
    }
    
    if(this.memory.role == 'harvester') {
        this.creepHarvest()
    }
    if(this.memory.role == 'miner'){
        this.creepDedicatedMiner();
    }
    if(this.memory.role == 'transporter' || this.memory.role == 'filler'){
        if(this.memory.type == 'settler'){
            this.creepDedicatedTransporter();
        }
        else if(this.memory.type == 'explorer'){
            this.creepExplorerTransporter();
        }
        else if(this.memory.type == 'adventurer'){
            this.creepExplorerTransporter();
        }
    }
    if(this.memory.role == 'upgrader') {
        this.creepExplorerUpgrader();
    }
    if(this.memory.role == 'builder') {
        this.creepExplorerBuild();
    }
    if(this.memory.role == 'repairer') {
        this.creepExplorerRepair();
    }
    if(this.memory.role == 'reserver'){
        this.creepExplorerReserver();
    }
    if(this.memory.role == 'melee') {
        if(this.memory.type == 'explorer'){
            this.creepExplorerMelee(this,exploreRooms);
        }
        else if(this.memory.type == 'adventurer'){
            this.creepExplorerCombat();
        }
    }
    if(this.memory.role == 'ranged') {
        if(this.memory.type == 'adventurer'){
            this.creepExplorerCombat();
        }
    }  
    if(this.memory.role == 'hybrid') {
        if(this.memory.type == 'adventurer'){
            this.creepExplorerCombat();
        }
    }                  
    if(this.memory.role == 'patroller' || this.memory.role == 'patrollerRanged') {
        if(this.memory.type == 'adventurer'){
            this.creepExplorerPatroll();
        }
    }                  
}

Creep.prototype.moveFromMemory = function(){
    if(!this.fatigue && this.memory.path && this.memory.path.length){
        let nextStep = this.memory.path.shift();
        if(this.pos.inRangeTo(nextStep,1) && this.move(this.pos.getDirectionTo(nextStep.x,nextStep.y)) == OK){
            return true;
        }
    }
    if(this.room.memory.defense.underAttack && this.memory.role != 'melee' && this.memory.role != 'ranged' && this.memory.role != 'hybrid' && this.memory.role != 'patroller' && this.memory.role != 'patrollerRanged' && this.flee() != ERR_NOT_FOUND){
        return true;
    }
    return false;
}
 
Creep.prototype.test = function(){
    console.log('Testing');
}

module.exports = 'extenedCreepPrototype';