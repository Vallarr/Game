Room.prototype.handlePower = function(){
    let powerSpawn = util.gatherObjectsInArray(this.structures,STRUCTURE_POWER_SPAWN)[0];
    if(!powerSpawn || !Memory.power || !Memory.power.process || ! this.storage){return}
    //Make sure power spawn is always filled with power and energy if power is available in the room
    let minPower = 1;
    let ordered = 0;
    if(this.memory.orders && this.memory.orders[RESOURCE_ENERGY]){ordered = this.memory.orders[RESOURCE_ENERGY]}
    if(powerSpawn.power >= minPower  && powerSpawn.energy > minPower * POWER_SPAWN_ENERGY_RATIO && this.energyTreshold['low'] - this.storage.store.energy + ordered < 0){
        powerSpawn.processPower();
    }
};