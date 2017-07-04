Room.prototype.observe = function(){
    let observer = util.gatherObjectsInArray(this.structures,[STRUCTURE_OBSERVER])[0];
    if(observer && this.memory.observe){
        let observedRoom = this.memory.observe[this.memory.observe.length-1];
        let room = Game.rooms[observedRoom];
        if(room){
            this.identifyPowerBanks(room);
        }
        let nextObservedRoom = this.memory.observe.shift();
        this.memory.observe.push(nextObservedRoom);
        observer.observeRoom(nextObservedRoom);
    }
};

Room.prototype.identifyPowerBanks = function(room){
    let powerBank = util.gatherObjectsInArray(room.structures,STRUCTURE_POWER_BANK);
    if(!this.memory.powerRooms){this.memory.powerRooms = {}}
    if(powerBank.length){
        this.memory.powerRooms[room.name] = {hits: powerBank[0].hits, ticksToDecay: powerBank[0].ticksToDecay, power: powerBank[0].power};
    }
    else {
        let droppedPower = util.gatherObjectsInArray(room.dropped).filter((r) => r.resourceType == RESOURCE_POWER);
        if(droppedPower.length){
            this.memory.powerRooms[room.name] = {hits: 0, ticksToDecay: POWER_BANK_DECAY, power: droppedPower[0].amount};
        }
        else if(this.memory.powerRooms[room.name]){
            delete this.memory.powerRooms[room.name];
        }
    }
};