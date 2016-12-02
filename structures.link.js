
var Link = function(room){
    this.room = room;
};

Link.prototype.linkEnergy = function(){
    let room = this.room;
    
    let roomLinks = room.memory.links;
    if(roomLinks == undefined){
        return;
    }
    //console.log(JSON.stringify(roomLinks));
    let storageLinks = getArrayObjectsById(roomLinks.storage);
    if(roomLinks.storage == undefined){
        //Need a storage link, since everything is linked to it.
        return;
    }
    let sourceLinks = getArrayObjectsById(roomLinks.source);
    let upgraderLinks = getArrayObjectsById(roomLinks.upgrader);
    let spawnLinks = getArrayObjectsById(roomLinks.spawn);
    
    //Link sources to spawn or storage
    if(sourceLinks){
        this.linkFromTo(sourceLinks,spawnLinks,upgraderLinks,storageLinks);
    }
    
    //Link storage to spawn or upgrader
    this.linkFromTo(storageLinks,spawnLinks,upgraderLinks);
    
    
    
};

Link.prototype.linkFromTo = function(from){
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
                targetLink = this.bestTransfer(from[i],to);
                if(!(targetLink == ERR_NOT_FOUND)){
                    this.transfer(from[i],targetLink);
                    break;
                }
            }
        }
    }
}


Link.prototype.bestTransfer = function(from,to){
    if(!to.length){
        return ERR_NOT_FOUND;
    }
    let bestLink = {};
    let toTransfer = from.energyCapacity;
    let amountMax = 0;
    let amount = 0;
    for(let i=0; i<to.length; i++){
        //Edit: Only transfer to empty links
        if(to[i].energy == 0){
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

Link.prototype.transfer = function(fromLink,targetLink,amount){
    if(amount == undefined){
        amount = Math.min(fromLink.energy,targetLink.energyCapacity - targetLink.energy);
    }
    return fromLink.transferEnergy(targetLink, amount);
};


var getArrayObjectsById = function(ids){
    if(!Array.isArray(ids)){
        return ERR_INVALID_ARGS;
    }
    let objects = [];
    for(let i=0; i<ids.length; i++){
        objects.push(Game.getObjectById(ids[i]));
    }
    return objects;
};

module.exports = Link;