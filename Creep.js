require('Creep.roles');
 
Creep.prototype.animate = function(){
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
    if(this.memory.role == 'transporter' || this.memory.role == 'filler' || this.memory.role == 'courier' || this.memory.role == 'labWorker'){
        if(this.memory.type == 'settler'){
            this.creepDedicatedTransporter();
        }
        else if(this.memory.type == 'explorer'){
            this.creepExplorerTransporter();
        }
        else if(this.memory.type == 'adventurer'){
            this.creepExplorerTransporter();
        }
        else if(this.memory.type = 'starter'){
            this.creepStarterTransporter();
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
    if(this.memory.role == 'dismantler') {
        this.creepDismantle();
    }
    if(this.memory.role == 'reserver'){
        this.creepReserver();
    }
    if(this.memory.role == 'startUp'){
        this.creepStartUpBuilder();
    }
    if(this.memory.role == 'combat'){
        this.creepCombat();
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
    if(this.memory.role == 'drainer'){
        this.creepDrainer();
    }
};

Creep.prototype.moveFromMemory = function(){
    let moved = false;
    if(!this.fatigue && this.memory.path && this.memory.path.length){
        let nextStep = this.memory.path.shift();
        if(nextStep.x == this.pos.x && nextStep.y == this.pos.y && nextStep.roomName == nextStep.roomName && this.memory.path.length){
            //allready there
            nextStep = this.memory.path.shift();
        }
        if(this.pos.inRangeTo(nextStep,1) && this.move(this.pos.getDirectionTo(nextStep.x,nextStep.y)) == OK){
            this.stationaryCombat();
            moved = true;
        }
    }
    if(!this.fatigue && this.room.memory.defense.underAttack && this.memory.role != 'melee' && this.memory.role != 'ranged' && this.memory.role != 'hybrid' && this.memory.role != 'patroller' && this.memory.role != 'patrollerRanged'&& this.memory.role != 'combat' && this.flee() != ERR_NOT_FOUND){
        this.stationaryCombat();
        moved = true;
    }
    if(this.fatigue && this.memory.path && this.memory.path.length){
        //Creep will still move in comming ticks -> don't need to reexecute creep script
        this.stationaryCombat();
        moved = true;
    }
    return moved;
};