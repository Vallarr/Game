require('Creep.roles');
 
Creep.prototype.animate = function(){
    //console.log('Animating ' + this.name);
    let creepCPUStart = Game.cpu.getUsed();
    if(this.spawning){return}
    if(this.moveFromMemory()){return}
    
    if(remoteRooms == undefined || remoteRooms[this.memory.type] == undefined){
        this.targetRooms = [this.memory.origin];
    }
    else if(remoteRooms[this.memory.type][this.memory.origin] == undefined || !remoteRooms[this.memory.type][this.memory.origin].length){
        console.log('No target rooms specified for ' + this.memory.role + ' ' + this.memory.type + ' ' + this.name + ' of room ' + this.memory.origin);
        return;            
    }
    else {
        this.targetRooms = remoteRooms[this.memory.type][this.memory.origin];
    }

    if(this.memory.role == 'harvester') {
        this.creepHarvest()
    }
    if(this.memory.role == 'miner'){
        this.creepMiner();
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
        this.creepUpgrader();
    }
    if(this.memory.role == 'builder') {
        this.creepBuild();
    }
    if(this.memory.role == 'repairer') {
        this.creepRepair();
    }
    if(this.memory.role == 'reserver'){
        this.creepReserver();
    }
    if(this.memory.role == 'melee') {
        if(this.memory.type == 'explorer'){
            this.creepExplorerMelee();
        }
        else if(this.memory.type == 'adventurer'){
            this.creepCombat();
        }
    }
    if(this.memory.role == 'ranged') {
        if(this.memory.type == 'adventurer'){
            this.creepCombat();
        }
    }  
    if(this.memory.role == 'hybrid') {
        if(this.memory.type == 'adventurer'){
            this.creepCombat();
        }
    }                  
    if(this.memory.role == 'patroller' || this.memory.role == 'patrollerRanged') {
        if(this.memory.type == 'adventurer'){
            this.creepPatroll();
        }
    }
    this.memory.cpu += Game.cpu.getUsed() - creepCPUStart;
    if(this.ticksToLive == 1){
        if(this.memory.role == 'reserver'){
            console.log(this.memory.role + ' creep ' + this.name + ' died. It used an average of ' + this.memory.cpu / CREEP_CLAIM_LIFE_TIME + ' cpu units per tick');
        }
        else {
            console.log(this.memory.role + ' creep ' + this.name + ' died. It used an average of ' + this.memory.cpu / CREEP_LIFE_TIME + ' cpu units per tick');
        }
    }
};

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
    if(this.fatigue && this.memory.path && this.memory.path.length){
        //Creep will still move in comming ticks -> don't need to reexecute creep script
        return true;
    }
    return false;
};