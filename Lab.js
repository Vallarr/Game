
Room.prototype.createBoosts = function(){
    
    this.readReaction();
    this.react();
};

Room.prototype.readReaction = function() {
    if(Memory.boosts && Memory.boosts[this.name] && Memory.boosts[this.name].amount) {
        if(this.memory.boosts){
            //Still creating another boost
            let newType = REACTIONS[Memory.boosts[this.name].reagents[0]][Memory.boosts[this.name].reagents[1]];
            let found = false;
            for(let i=0; i<this.memory.boosts.length && !found; i++){
                if(this.memory.boosts[i].type == newType){
                    //Boost is allready in queue
                    this.memory.boosts[i].amount += Memory.boosts[this.name].amount;
                    found = true;
                }                
            }
            if(!found){
                //Add new boost to queue
                this.memory.boosts.push({amount: Memory.boosts[this.name].amount, type: newType, reagents: Memory.boosts[this.name].reagents});
            }
        }
        else {
            this.memory.boosts = [{amount: Memory.boosts[this.name].amount, type: REACTIONS[Memory.boosts[this.name].reagents[0]][Memory.boosts[this.name].reagents[1]], reagents: Memory.boosts[this.name].reagents}];
        }
        Memory.boosts[this.name].amount = 0;
    }
};

Room.prototype.react = function(){
    if(!this.memory.boosts || !this.memory.boosts.length || !roomObjects[this.name].labs){return}
    let sourceLabs = util.gatherObjectsInArrayFromIds(roomObjects[this.name].labs,'source');
    let targetLabs = util.gatherObjectsInArrayFromIds(roomObjects[this.name].labs,'target');
    
    if(sourceLabs.length != 2 || targetLabs.length < 1){
        //Not the right amount of labs to perform reaction
        return;
    }
    let reagents = [];
    if(this.memory.boosts[0].reagents){
        reagents = this.memory.boosts[0].reagents;
    }
    else {
        for(let reagent in this.memory.boosts[0].supply){reagents.push(reagent)}
    }
    let mineralsInLabs = [];
    for(let i=0; i<sourceLabs.length; i++){
        if(sourceLabs[i].mineralType){
            mineralsInLabs.push(sourceLabs[i].mineralType);
        }
    }
    let missingReagents = util.findArrayOfDifferentStrings(reagents,mineralsInLabs);
    if(missingReagents.length && this.memory.boosts[0].amount){return}
    
    for(let i=0; i<targetLabs.length; i++){
        if(targetLabs[i].mineralType && targetLabs[i].mineralType != this.memory.boosts[0].type){
            //Lab has to be emptied first
            continue;
        }
        if(this.memory.boosts[0].amount){
            if(!targetLabs[i].cooldown && targetLabs[i].runReaction(sourceLabs[0],sourceLabs[1]) == OK){
                //console.log('Reacted');
                this.memory.boosts[0].amount -= LAB_REACTION_AMOUNT;
                if(this.memory.boosts[0].amount < 0) {this.memory.boosts[0].amount = 0}
            }
        }
        else {
            this.memory.boosts.shift();
            break;
        }        
    }
};

