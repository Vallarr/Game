Room.prototype.linkEnergy = function(){
    let storageLinks = util.gatherObjectsInArray(this.links,'storage');
    let sourceLinks = util.gatherObjectsInArray(this.links,'source');
    let upgraderLinks = util.gatherObjectsInArray(this.links,'upgrader');
    let spawnLinks = util.gatherObjectsInArray(this.links,'spawn');
    
    //Link sources to spawn or storage
    this.linkFromTo(sourceLinks,spawnLinks,upgraderLinks,storageLinks);
    
    //Link storage to spawn or upgrader
    this.linkFromTo(storageLinks,spawnLinks,upgraderLinks);
};

Room.prototype.linkFromTo = function(from){
    //Specify from which link energy is to be transfered and any number of target groups
    if(!from.length){
        return ERR_NOT_FOUND;
    }
    if(arguments.length < 2){
        return ERR_INVALID_ARGS;
    }
    for(let i=0; i<from.length; i++){
        if(!from[i].cooldown && from[i].energy >= Math.pow((1-LINK_LOSS_RATIO),2) * from[i].energyCapacity){
            let to = [];
            let targetLinks = {};
            for(let j=1; j<arguments.length; j++){
                to = arguments[j];
                targetLink = from[i].bestTransfer(to);
                if(targetLink != ERR_NOT_FOUND){
                    from[i].transfer(targetLink);
                    targetLink.receiving = true;
                    break;
                }
            }
        }
    }
};

StructureLink.prototype.bestTransfer = function(to){
    if(!to.length){
        return ERR_NOT_FOUND;
    }
    let bestLink = {};
    let toTransfer = this.energyCapacity;
    let amountMax = 0;
    let amount = 0;
    for(let i=0; i<to.length; i++){
        //Edit: Only transfer to empty links
        if(to[i].energy == 0 && !to[i].receiving){
            amount = to[i].energyCapacity - to[i].energy;
            if(amount == toTransfer){
                return to[i];
            }
            else if(amount > amountMax){
                amountMax = amount;
                bestLink = to[i];
            }            
        }
    }
    if(amountMax > 0){
        return bestLink;
    }
    else {
        return ERR_NOT_FOUND;
    }
};

StructureLink.prototype.transfer = function(targetLink,amount){
    if(amount == undefined){
        amount = Math.min(this.energy,targetLink.energyCapacity - targetLink.energy);
    }
    return this.transferEnergy(targetLink, amount);
};

Object.defineProperty(StructureLink.prototype, 'receiving', {
    get: function(){
        if(this === StructureLink.prototype || this == undefined){return}
        if(!this._receiving){
            this._receiving = false;
        }
        return this._receiving;
    },
    set: function(value){
        this._receiving = value;
    },
    enumerable: false,
    configurable: true
});