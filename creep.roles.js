require('Creep.actions');
const profiler = require('screeps.profiler');

Creep.prototype.creepHarvest = function(){
    //Get creeps dedicate source
    let source = [];
    let sourceContainer = undefined;
    if(this.memory.source){
        //Get source from memory
        if(Game.rooms[this.memory.sourceRoom] != undefined){
            source.push(Game.getObjectById(this.memory.source));
            if(this.memory.sourceContainer){
                sourceContainer = util.gatherObjectsInArrayFromIds(this.memory,'sourceContainer');
                if(!sourceContainer.length){delete this.memory.sourceContainer} //This container no longer exists
            }
            else {
                sourceContainer = util.targetsInRange(util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'source').concat(util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source')),source,2);
                if(!sourceContainer.length){
                    let containersToBeBuild = this.room.find(FIND_CONSTRUCTION_SITES, {filter: (site) => {return site.structureType == STRUCTURE_CONTAINER || site.structureType == STRUCTURE_LINK}});
                    sourceContainer = util.targetsInRange(containersToBeBuild,source,2);
                }
                this.memory.sourceContainer = util.gatherIdsInArrayFromObjects(sourceContainer); 
            }
        }
        else {
            this.moveToRoom(this.memory.sourceRoom);
            return;                
        }
    }
    else {
        //Search for source and store in memory
        let foundSource = false;
        let darkRooms = [];
        let roomSources = [];
        let occupiedSources = util.targetObjectsOfCreeps('source'); //If this takes a lot of time, can detect setllers and only search their origin room for ocuppied sources.
        for(let i=0; i<this.targetRooms.length; i++){
            if(Game.rooms[this.targetRooms[i]] != undefined){
                roomSources = roomSources.concat(util.gatherObjectsInArrayFromIds(roomObjects[this.targetRooms[i]].sources,'energy'));
            }
            else {
                darkRooms.push(this.targetRooms[i]);
            }
        }
        let target = undefined;
        while(!foundSource){
            target = util.findDifferentElement(roomSources,occupiedSources);
            //console.log(this.name + ' found target ' + target + ' from ' + roomSources + ' with occupied ' + occupiedSources);
            if(target != ERR_NOT_FOUND){
                source.push(target);
                this.memory.source = target.id;
                this.memory.sourceRoom = target.pos.roomName;
                foundSource = true;
            }
            if(!foundSource){
                if(darkRooms.length){
                    this.moveToRoom(darkRooms[0]);
                    return;                        
                }
                else {
                    occupiedSources = util.findDubbles(occupiedSources);
                    //console.log(this.name + ' found no source in rooms ' + this.targetRooms + '. Trying again ' + ' Ocuppied ' + occupiedSources);                        
                }
            }
        }
    }
    //console.log(this.name + ' source ' + source);
    
    if(this.carry.energy == this.carryCapacity){
        let rtn = this.fillContainer(sourceContainer);
        if(rtn == OK){
            this.harvestSource(source);
        }
        else if(rtn == ERR_NOT_FOUND){
            //this.dropAll();
        }
        else if(rtn == ERR_INVALID_TARGET){
            this.buildStructure(sourceContainer);
        }
        else if(rtn == ERR_FULL){
            if(sourceContainer[0].hits < sourceContainer[0].hitsMax){
                this.repairStructure(1,sourceContainer);
            }
            else {
                //this.dropAll();
            }
        }
    }
    else {
        //console.log(this.name);
        this.harvestSource(source);
    }
    
};

Creep.prototype.creepDismantle = function(){
    if(dismantle == undefined){
        return ERR_NOT_FOUND;
    }
    
    let darkRooms = [];
    let targets = undefined;
    let found = false
    for(let i=0; i<this.targetRooms.length && !found; i++){
        if(dismantle[this.targetRooms[i]]){
            if(Game.rooms[this.targetRooms[i]] != undefined){
                if(dismantle[this.targetRooms[i]].ids){
                    targets = util.gatherObjectsInArrayFromIds(dismantle[this.targetRooms[i]],'ids');
                    if(targets.length){found = true}
                }
                if(!found && dismantle[this.targetRooms[i]].structureTypes){
                    for(let j=0; j<dismantle[this.targetRooms[i]].structureTypes.length; j++){
                        let type = dismantle[this.targetRooms[i]].structureTypes[j];
                        targets = roomObjects[this.targetRooms[i]].structures[type];
                        if(targets.length){
                            found = true;
                            break;
                        }
                    }
                }
            }
            else {
                darkRooms.push(this.targetRooms[i]);
            }
        }
    }
    if(!found){
        if(darkRooms.length){
            this.moveToRoom(darkRooms[0]);
        }
        else {
            return ERR_NOT_FOUND;
        }
    }
    
    if(this.carry.energy < this.carryCapacity){
        this.dismantleStructure(targets);
    }
    else {
        //store energy
        let avContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source','spawn','storage').filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
        let avLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'source','spawn').filter((link) => {return link.energy < link.energyCapacity});;
        let targets = avContainers.concat(avLinks);
        if(this.transferResources(targets) == ERR_NOT_FOUND){
            if(this.room.name  != this.memory.origin){
                this.moveToRoom(this.memory.origin);
            }
        }
    }        
};

Creep.prototype.creepMiner = function(){
    if(this.room.name != this.memory.origin){
        this.moveToRoom(this.memory.origin);
        return;
    }               
    
    let mineralSource = [];
    let extractor = [];
    if(this.memory.mineralSource && this.memory.extractor){
        //console.log('Get mineral source');
        mineralSource.push(Game.getObjectById(this.memory.mineralSource));
        extractor.push(Game.getObjectById(this.memory.extractor));
        //console.log('Mineral ' + mineralSource + ' extractor ' + extractor);
    }
    else {
        //Always max 1 source and 1 extractor per room
        mineralSource = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].sources,'mineral');
        this.memory.mineralSource = mineralSource[0].id;
        extractor = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].structures,STRUCTURE_EXTRACTOR);
        if(extractor.length){
            this.memory.extractor = extractor[0].id;
        }
        else {
            console.log(this.memory.role + ' ' + this.name + ' cannot mine minerals, because there is no extractor');
        }
    }
    if(mineralSource[0].mineralAmount > 0){
        if(_.sum(this.carry) == this.carryCapacity){
            let mineralContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'mineral','storage').filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
            let rtn = this.transferResources(mineralContainers);
            if(rtn == OK && !extractor[0].cooldown){
                this.harvestSource(mineralSource);
            }
            else if(rtn == ERR_NOT_FOUND){
                this.say('Store full');
            }
        }
        else if(!extractor[0].cooldown){
            //console.log(this.name + ' harvest mineral');
            this.harvestSource(mineralSource);
        }            
    }
    else if(this.carry[mineralSource[0].mineralType] > 0){
        //Store resources
        let mineralContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'mineral','storage').filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
        if(this.transferResources(mineralContainers) == ERR_NOT_FOUND){
            this.say('Store full');
        }
    }
    else if(this.room.controller && this.room.controller.owner && this.room.controller.owner.username == 'Vervust' && this.room.controller.level < 8){
        this.creepUpgrader();
    }
    else {
        this.creepRepair();
    }
};

Creep.prototype.creepDedicatedTransporter = function(){
    findContainerForCreep = profiler.registerFN(findContainerForCreep);
    
    if(this.room.name != this.memory.origin){
        this.moveToRoom(this.memory.origin);
        return;
    }
    
    if(this.memory.collecting && _.sum(this.carry) == this.carryCapacity){
        this.memory.collecting = false;
    }
    if(!this.memory.collecting && _.sum(this.carry) == 0){
        this.memory.collecting = true;
    }
    
    if(this.memory.getting){
        if(this.memory.getDropped) {
            let resource = Game.getObjectById(this.memory.getDropped);
            if(resource && this.collectDroppedResource(resource.resourceType,resource) !=1){
                delete this.memory.getDropped;
            }
            else if(!resource){
                delete this.memory.getDropped;
            }
            return;
        }
        else if(this.memory.targetContainer) {
            let targetContainer = Game.getObjectById(this.memory.targetContainer);
            if(targetContainer && this.withdrawResource(targetContainer) != 1){
                delete this.memory.targetContainer;
            }
            else if(!targetContainer){
                delete this.memory.targetContainer;
            }
            return;
        }
    }
    else if(this.memory.targetContainer){
        let targetContainer = Game.getObjectById(this.memory.targetContainer);
        if(targetContainer && this.transferResources(targetContainer) != 1){
            delete this.memory.targetContainer;
        }
        else if(!targetContainer){
            delete this.memory.targetContainer;
        }
        return;
    }
    
    //If creep is carrying mineral, store these first
    let storing = false;
    if(_.sum(this.carry) > this.carry.energy && (!this.memory.targetContainer || this.memory.targetContainer != this.room.terminal.id)){
        //console.log(this.name + ' storing resource');
        storing = true;
        if(this.fillStorage() == ERR_NOT_FOUND){
            this.say('Store full');
            //this.dropAllBut(RESOURCE_ENERGY);
        }
    }
    //Filling spawns and extensions is a priority
    let fillSpawn = this.room.energyAvailable < this.room.energyCapacityAvailable;
    //console.log('Fillspawn ' + fillSpawn);
    let filling = false;
    if(!storing && ((fillSpawn && this.memory.role == 'filler') || (this.room.memory.defense.underAttack && this.memory.role == 'transporter'))){
        //Here creep needs to transfer any energy it has to spawn or tower, so no creep.memory.collecting check
        //console.log(this.name + ' fillspawn or underAttack ' + this.memory.role);
        if(this.carry.energy == 0){
            //Get energy
            let toFillUpgraderLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'upgrader').filter((link) => {return link.energy == 0});
            let sourceLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'source');
            let storageLink = undefined;
            if(!toFillUpgraderLinks.length){
                storageLink = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'storage');	                    
            }
            else {storageLink = []}
            let containers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'spawn','source','storage');
            let LinksAndContainers = sourceLinks.concat(storageLink,containers);
            let target = findFilledContainerForCreep(this,LinksAndContainers,0,2);
            //console.log(this.name + ' target ' + target + ' from ' + LinksAndContainers);
            if(target != ERR_NOT_FOUND && this.harvestContainer(target) != OK){
                //console.log(this.name + ' target id ' + target.id);
                this.memory.targetContainer = target.id;
                this.memory.getting = true;
                filling = true;
            }
            else if(target != ERR_NOT_FOUND){
                filling = true;
            }
        }
        else if (fillSpawn && this.memory.role == 'filler'){
            this.memory.getting = false;
            //Fill spawns and extensions
            if(this.fillSpawn() != ERR_NOT_FOUND){
                filling = true;
            }
        }
        else if(this.room.memory.defense.underAttack && this.memory.role == 'transporter'){
            this.memory.getting = false;
            //Fill towers
            let towers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].structures,STRUCTURE_TOWER);
            let targetTower = findNotFilledContainerForCreep(this,towers,0.5,1);
            if(targetTower != ERR_NOT_FOUND){
                if(this.fillTower(targetTower) != OK){
                    this.memory.targetContainer = targetTower.id;
                }	                
                filling = true;
            }
        }
    }
    if(!filling && !storing) {
        //console.log(this.name + 'doing extras');
        let toFillUpgraderLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'upgrader').filter((link) => {return link.energy == 0});
        let toFillSpawnContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'spawn').filter(function(container){return _.sum(container.store) < container.storeCapacity});
        let toFillUpgraderContainers = findNotFilledContainerForCreep(this,util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'upgrader'),1,2);
        if(toFillUpgraderContainers != ERR_NOT_FOUND){
            toFillUpgraderContainers = [toFillUpgraderContainers];
        }
        else {
            toFillUpgraderContainers = [];
        }
        //console.log(this.name + ' to fill upgrader containers ' + toFillUpgraderContainers);
        if(this.carry.energy == 0){
            //Empty the source containers
            if(this.memory.role == 'filler'){
	            let storageLink = undefined;
	            if(!toFillUpgraderLinks.length){
	                //If no upgrader containers have to be filled, storage link can be emptied
	                storageLink = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'storage');
	            }
	            else {storageLink = []}
	            //console.log(this.name + ' link ' + storageLink);
	            let target = findFilledContainerForCreep(this,storageLink,1,2);
	            //console.log('target ' + target);
	            if(target != ERR_NOT_FOUND){
	                if(this.harvestContainer(target) != OK){
	                    this.memory.targetContainer = target.id;
	                    this.memory.getting = true;
	                }
	            }
	            else if(toFillSpawnContainers.length || toFillUpgraderLinks.length){
	                if(this.harvestStorage() == ERR_NOT_FOUND){
    	                let container = findFilledContainerForCreep(this,util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source'),1,2);
    	                if(container != ERR_NOT_FOUND){
    	                    this.harvestContainer(container);
    	                }
	                }
	            }
	            else if(this.completeOrders() == ERR_NOT_FOUND){
    	            let sourceContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source');
    	            let mineralContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'mineral');
    	            let containers = sourceContainers.concat(mineralContainers);
    	            let target = findFilledContainerForCreep(this,containers,1,2);
    	            if(target != ERR_NOT_FOUND){
    	                if(this.withdrawResource(target) != OK){
    	                    this.memory.targetContainer = target.id;
    	                    this.memory.getting = true;
    	                }
    	            }
	            }
            }
            else if(this.memory.role == 'transporter'){
	            if(this.collectDroppedResource() == ERR_NOT_FOUND){
    	            let sourceContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source');
    	            let mineralContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'mineral');
    	            let storageLink = undefined;
    	            if(!toFillUpgraderLinks.length){
    	                //If no upgrader containers have to be filled, storage link can be emptied
    	                storageLink = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'storage');
    	            }
    	            else {storageLink = []}
    	            let containers = sourceContainers.concat(storageLink, mineralContainers);
    	            let target = findFilledContainerForCreep(this,containers,1,2);
    	            if(target == ERR_NOT_FOUND && fillSpawn){
    	                target = findFilledContainerForCreep(this,containers,0,2);
    	            }
    	            
    	            if(target != ERR_NOT_FOUND){
    	                if(this.withdrawResource(target) != OK){
    	                    this.memory.targetContainer = target.id;
    	                    this.memory.getting = true;
    	                }
    	            }
    	            else if(toFillUpgraderContainers.length || toFillUpgraderLinks.length){
    	                this.harvestStorage()
    	            }
    	            else if(this.completeOrders() == ERR_NOT_FOUND){
                        
    	            }
	            }	                
            }
        }
        else {
            this.memory.getting = false;
            if(this.memory.role == 'filler'){
                //Fill spawn containers
	            if(this.fillContainer(toFillSpawnContainers) == ERR_NOT_FOUND){
	                //Fill storage link if necessary. It will then link to upgrader link.
	                let toFillStorageLinks = [];
	                if(toFillUpgraderLinks.length){
	                    toFillStorageLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'storage').filter((link) => {return link.energy < Math.pow(1-LINK_LOSS_RATIO,2) * link.energyCapacity});
	                    //console.log('Storage links: ' + toFillStorageLinks);
	                }
	                if(this.transferResources(toFillStorageLinks,RESOURCE_ENERGY) == ERR_NOT_FOUND){
	                    this.fillStorage();
	                }
	            }	                
            }
            else if(this.memory.role == 'transporter'){
                //Fill storage link if necessary. It will then link to upgrader link.
                let toFillStorageLinks = [];
                if(toFillUpgraderLinks.length){
                    toFillStorageLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'storage').filter((link) => {return link.energy < Math.pow(1-LINK_LOSS_RATIO,2) * link.energyCapacity});
                    //console.log('Storage links: ' + toFillStorageLinks);
                }
                if(this.transferResources(toFillStorageLinks,RESOURCE_ENERGY) == ERR_NOT_FOUND){
	                //Fill upgrader containers
	                let targetUpgraderContainer = findNotFilledContainerForCreep(this,util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'upgrader'),1,2);
	                //console.log(this.name + ' upgradercontainer ' + targetUpgraderContainer);
	                if(targetUpgraderContainer != ERR_NOT_FOUND){
	                    if(this.fillContainer(targetUpgraderContainer) != OK){
	                        this.memory.targetContainer = targetUpgraderContainer.id;
	                    }
	                }
	                else {
	                    //Fill towers
	                    let towers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].structures,STRUCTURE_TOWER);
	                    let targetTower = findNotFilledContainerForCreep(this,towers,0,1);
	                    if(targetTower != ERR_NOT_FOUND){
	                        if(this.fillTower(targetTower) != OK){
	                            this.memory.targetContainer = targetTower.id;
	                        }
	                    }
	                    else {
            	            let sourceContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source');
            	            let mineralContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'mineral');
            	            let storageLink = undefined;
            	            if(!toFillUpgraderLinks.length){
            	                //If no upgrader containers have to be filled, storage link can be emptied
            	                storageLink = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'storage');
            	            }
            	            else {storageLink = []}
            	            let containers = sourceContainers.concat(storageLink, mineralContainers);
            	            let target = findFilledContainerForCreep(this,containers,1,2);
	                        if(fillSpawn && target == ERR_NOT_FOUND){
	                            this.fillSpawn();
	                        }
	                        else if(this.fillStorage() == ERR_NOT_FOUND){

	                        }
	                    }
	                }
                }
            }
        }
    }
    
    function findFilledContainerForCreep(creep,containers,fillFraction,nLoops){
        return findContainerForCreep(creep,containers,fillFraction,nLoops,(cont) => {
            let content = undefined;
            if(cont.structureType == STRUCTURE_CONTAINER || cont.structureType == STRUCTURE_STORAGE){
                content =  _.sum(cont.store);
            }
            else {
                content = cont.energy;
            }
            if (content == 0){return -1}
            return content;
        });
    }
    
    function findNotFilledContainerForCreep(creep,containers,emptyFraction,nLoops){
        return findContainerForCreep(creep,containers,emptyFraction,nLoops,(cont) => {
            let diff = 0;
            if(cont.structureType == STRUCTURE_CONTAINER || cont.structureType == STRUCTURE_STORAGE){
                diff = cont.storeCapacity - _.sum(cont.store);
            }
            else {
                diff = cont.energyCapacity - cont.energy;
            }
            if(diff == 0){return -1}
            return diff;
        });
    }
    
    function findContainerForCreep(creep,containers,fraction,nLoops,f){
        if(fraction == undefined){
            fraction = 1;
        }
        if(nLoops == undefined){
            nLoops = 2;
        }
        let found = false;
        let targetContainer = ERR_NOT_FOUND;
        let targetedContainers = util.targetObjectsOfCreeps('targetContainer',creep.room);
        //console.log(creep.name + ' targetedContainers ' + targetedContainers);
        for(let i=0; i<nLoops && !found; i++){
            //console.log(creep.name + ' filledContainers ' + filledContainers);
	        containers = containers.filter((cont) => {
	            if(cont.structureType == STRUCTURE_CONTAINER || cont.structureType == STRUCTURE_STORAGE){
	                return f(cont) >= (i+1) * fraction * creep.carryCapacity;
	            }
	            else if(cont.structureType == STRUCTURE_LINK){
	                return f(cont) >= (i+1) * fraction * Math.pow((1-LINK_LOSS_RATIO),4) * cont.energyCapacity;
	            }
	            else {
	                return f(cont) >= (i+1) * fraction * creep.carryCapacity;
	            }
	        });
	        targetContainer = findTargetContainerForCreep(creep,containers,targetedContainers);
	        //console.log(creep.name + ' containers ' + containers + ' targetedContainers ' + targetedContainers + ' target ' + targetContainer);
	        if(targetContainer != ERR_NOT_FOUND){
	            found = true;
	        }
	        else {
	            targetedContainers = util.findDubbles(targetedContainers);
	        }
        }
        return targetContainer;
    }
    
    function findTargetContainerForCreep(creep,containers,targetedContainers){
        let notTargetedFilledContainers = util.findArrayOfDifferentElements(containers,targetedContainers);
        //console.log(creep.name + ' targetedContainers ' + targetedContainers + ' not targeted ' + notTargetedFilledContainers);
        let targetContainer = ERR_NOT_FOUND;
        if(notTargetedFilledContainers.length){
            targetContainer = creep.pos.closestByRange(notTargetedFilledContainers);
        }
        return targetContainer;
    }
};

Creep.prototype.creepExplorerTransporter = function(){

    if(this.memory.collecting && _.sum(this.carry) == this.carryCapacity){
        this.memory.collecting = false;
    }
    if(!this.memory.collecting && _.sum(this.carry) == 0){
        this.memory.collecting = true;
    }
    
    if(this.memory.getting){
        if(this.memory.getDropped) {
            let resource = Game.getObjectById(this.memory.getDropped);
            if(resource && this.collectDroppedResource(resource.resourceType,resource) != 1){
                delete this.memory.getDropped;
            }
            else if(!resource){
                delete this.memory.getDropped;
            }
            return;
        }
        else if(this.memory.targetContainer) {
            if(!Game.rooms[this.memory.targetRoom]){
                this.moveToRoom(this.memory.targetRoom);
            }
            else {
                let targetContainer = Game.getObjectById(this.memory.targetContainer);
                //console.log(this.name + ' ' + this.harvestContainer(targetContainer));
                if(targetContainer && this.harvestContainer(targetContainer) != 1){
                    delete this.memory.targetContainer;
                }
                else if(!targetContainer){
                    delete this.memory.targetContainer;
                }
            }
            return;
        }
    }
    
    if(this.memory.collecting){
        let droppedResources = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name],'dropped').filter((rs) => {
            let resourceHarvestPower = HARVEST_POWER;
            if(rs.resourceType != RESOURCE_ENERGY){
                resourceHarvestPower = HARVEST_MINERAL_POWER;
            }
            return rs.amount > Math.max(5,this.body.filter((bP) => {return bP.type == WORK}).length) * resourceHarvestPower * Math.ceil(Math.sqrt(Math.pow(this.pos.x-rs.pos.x,2) + Math.pow(this.pos.y-rs.pos.y,2)));
        });
        let notTargetedResources = undefined;
        if(droppedResources.length) {
            let targetedDroppedResources = util.targetObjectsOfCreeps('getDropped',this.room);
            notTargetedResources = util.findArrayOfDifferentElements(droppedResources,targetedDroppedResources);
        }
        else {
            notTargetedResources = [];
        }
        //console.log(this.name + ' in room ' + this.room.name + ' found dropped resources ' + droppedResources + '. not targeted ' + notTargetedResources);
        let filledSourceContainers = [];
        let darkRooms = [];
        for(let i=0; i<this.targetRooms.length; i++){
            if(Game.rooms[this.targetRooms[i]] != undefined){
                let filledContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.targetRooms[i]].containers,'source').filter((cont) => {return _.sum(cont.store) >= this.carryCapacity - _.sum(this.carry)});
                filledSourceContainers = filledSourceContainers.concat(filledContainers);
            }
            else {
                darkRooms.push(this.targetRooms[i]);
            }
        }
        let targetedContainers = util.targetObjectsOfCreeps('targetContainer');
        //console.log(this.name + ' filled ' + filledSourceContainers +' targeted '+ targetedContainers);
        let notTargetedContainers = util.findArrayOfDifferentElements(filledSourceContainers,targetedContainers);
        filledSourceContainers = filledSourceContainers.filter((cont) => {return _.sum(cont.store) >= 2*this.carryCapacity - _.sum(this.carry)});
        let dubbleTargetedContainers = util.findDubbles(targetedContainers);
        //console.log(this.name + 'dubble filled ' + filledSourceContainers + ' dubble targeted ' + dubbleTargetedContainers);
        notTargetedContainers = notTargetedContainers.concat(util.findArrayOfDifferentElements(filledSourceContainers,dubbleTargetedContainers));
        //console.log(this.name + ' not targeted ' + notTargetedContainers);
        //console.log(this.name + ' targets to pick from ' + notTargetedResources.concat(notTargetedContainers));
        let target = this.pos.closestByRange(notTargetedResources.concat(notTargetedContainers));
        //console.log(this.name + ' target ' + target);
        
        if(target){
            this.memory.getting = true;
            this.memory.targetRoom = target.pos.roomName;
            if(target.structureType){
                this.memory.targetContainer = target.id;
            }
            else if(target.resourceType){
                this.memory.getDropped = target.id;
            }
        }
        else if(darkRooms.length){
            this.moveToRoom(darkRooms[0]);
            return;
        }
        else if(this.targetRooms.length){
            this.moveToRoom(this.targetRooms[0]);
            return;
        }
    }
    else {
        this.memory.getting = false;
        //console.log(this.name);
        let avContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.memory.origin].containers,'source','spawn','storage').filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
        let avUpgraderContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.memory.origin].containers,'upgrader').filter((cont) => {return cont.storeCapacity - _.sum(cont.store) >= this.carry.energy})
        let avLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.memory.origin].links,'source','spawn').filter((link) => {return link.energy < link.energyCapacity});;
        let targets = avContainers.concat(avLinks,avUpgraderContainers);
        if(this.transferResources(targets) == ERR_NOT_FOUND){
            this.say('Store full');
        }
    }
    
};

Creep.prototype.creepStarterTransporter = function(){
    
    if(!this.memory.starterRoom){
        let targetedRooms = util.targetRoomsOfCreeps('starterRoom');
        let targetRoom = undefined;
        let found = false;
        while(!found){
            targetRoom = util.findArrayOfDifferentStrings(this.targetRooms,targetedRooms);
            if(targetRoom.length){
                found = true;
                this.memory.starterRoom = targetRoom[0];
            }
            else {
                targetedRooms = util.findDubbleStrings(targetedRooms);
            }
        }
    }
    
    if(this.carry.energy == 0){
        this.harvestStorage(Game.rooms[this.memory.origin].storage);
    }
    else {
        if(this.room.name == this.memory.starterRoom){
            let containers = util.gatherObjectsInArrayFromIds(roomObjects[this.memory.starterRoom].containers,'source','storage','upgrader','spawn').filter((cont) => _.sum(cont.store) < cont.storeCapacity);
            if(this.transferResources(containers,RESOURCE_ENERGY) == ERR_NOT_FOUND){
                this.dropResource(RESOURCE_ENERGY);
            }
        }
        else {
            this.moveToRoom(this.memory.starterRoom);
        }
    }
};

Creep.prototype.creepBuild = function(){
    let explorerSites = [];
    for(let site in Game.constructionSites){
        let roomName = Game.constructionSites[site].pos.roomName;
        for(let i=0; i<this.targetRooms.length; i++){
            if(this.targetRooms[i] == roomName){
                explorerSites.push(Game.constructionSites[site]);
                break;
            }
        }
    }
    if(!explorerSites.length && this.creepDismantle() != ERR_NOT_FOUND){
        return;
    }
    //console.log(explorerSites);
    
    if(this.carry.energy == 0){
        let rtn = this.collectDroppedResource(RESOURCE_ENERGY);
        //console.log(this.name + ' rtn ' + rtn + ' room ' + this.room.name + ' origin ' + orRoom);
        if(rtn == ERR_NOT_FOUND){
            let targetContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source','storage').filter((cont) => {return cont.store.energy > 0});
            let targetLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'source').filter((link) => {return link.energy > 0});
            let targets = targetContainers.concat(targetLinks);
            if(this.harvestContainer(targets) == ERR_NOT_FOUND){
                this.moveToRoom(this.memory.origin);
            }
        }
    }
    else {
        //console.log(this.buildStructure(explorerSites));
        if(this.buildStructure(explorerSites) == ERR_NOT_FOUND){
            //console.log(this.name,'nothing to build');
            let dmgStructures = [];
            let darkRooms = [];
            for(let i=0; i<this.targetRooms.length; i++){
                if(Game.rooms[this.targetRooms[i]] != undefined){
                    let room = Game.rooms[this.targetRooms[i]];
                    let dmgStructRoom = util.getArrayObjectsById(room.memory.dmgStructures);
                    dmgStructures = dmgStructures.concat(dmgStructRoom);
                }
                else {
                    darkRooms.push(this.targetRooms[i]);
                }
            }
            if(!dmgStructures.length && darkRooms.length){
                this.moveToRoom(darkRooms[0]);
                return;
            } 
            if(this.repairStructure(1,dmgStructures) == ERR_NOT_FOUND){
                //TODO: Other task. Go be dedicated builder in origin room
                if(this.creepDismantle() == ERR_NOT_FOUND){
                    if(this.targetRooms[0] != this.memory.origin){
                        this.targetRooms = [this.memory.origin];
                        this.creepBuild();
                    }
                    else if(this.room.controller && this.room.controller.owner && this.room.controller.owner.username == 'Vervust' && this.room.controller.level < 8){
                        this.creepUpgrader();
                    }
                    else if(this.room.name != this.memory.origin){
                        this.moveToRoom(this.memory.origin);
                    }                    
                }
            }
        }
    }
};

Creep.prototype.creepRepair = function(){
    
    let dmgStructures = [];
    let darkRooms = [];
    for(let i=0; i<this.targetRooms.length; i++){
        if(!(Game.rooms[this.targetRooms[i]] == undefined)){
            let room = Game.rooms[this.targetRooms[i]];
            let dmgStructRoom = util.getArrayObjectsById(room.memory.dmgStructures);
            dmgStructures = dmgStructures.concat(dmgStructRoom);
        }
        else {
            darkRooms.push(this.targetRooms[i]);
        }
    }
    if(!dmgStructures.length && !darkRooms.length){
        this.creepBuild();
        return;
    }

    if(this.carry.energy == 0){
        let rtn = this.collectDroppedResource(RESOURCE_ENERGY);
        if(rtn == ERR_NOT_FOUND){
            let targetContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source','storage').filter((cont) => {return cont.store.energy > 0});
            let targetLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'source').filter((link) => {return link.energy > 0});
            let targets = targetContainers.concat(targetLinks);
            if(this.harvestContainer(targets) == ERR_NOT_FOUND){
                this.moveToRoom(this.memory.origin);
            }
        }
    }
    else {
        if(!dmgStructures.length && darkRooms.length){
            //console.log(this.name,'going to dark room');
            this.moveToRoom(darkRooms[0]);
            return;
        }          
        if(this.repairStructure(1,dmgStructures) == ERR_NOT_FOUND){
            //console.log(this.name,'doing build');
            this.creepBuild();
        }
    }
};

Creep.prototype.creepUpgrader = function(){

    if(this.memory.getDropped) {
        let resource = Game.getObjectById(this.memory.getDropped);
        if(resource && this.collectDroppedResource(resource.resourceType,resource) !=1){
            delete this.memory.getDropped;
        }
        else if(!resource){
            delete this.memory.getDropped;
        }
        return;
    }        
    
    let controllerRoom = this.memory.controllerRoom;
    if(!controllerRoom){
        let found = false;
        for(let i=0; i<this.targetRooms.length && !found; i++){
            if(Game.rooms[this.targetRooms[i]] != undefined){
                let room = Game.rooms[this.targetRooms[i]];
                if(room.controller.owner && room.controller.owner.username == 'Vervust'){
                    this.memory.controllerRoom = room.name;
                    found = true;
                }
            }
        }
        if(!found){
            console.log(this.role + ' ' + this.name + ' has no room to upgrade controller');
        }
    }
    
    if(this.carry.energy == 0){
        let filledContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source','upgrader','storage').filter((cont) => {return cont.store.energy > 0});
        let filledLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'source','upgrader').filter((link) => {return link.energy > 0});
        let targets = filledLinks.concat(filledContainers);
        //console.log(this.name + ' targets ' + targets);
        if(this.harvestContainer(targets) == ERR_NOT_FOUND){
            if(this.collectDroppedResource(RESOURCE_ENERGY) == ERR_NOT_FOUND){
                this.moveToRoom(this.memory.origin);
            }
        }
    }
    else {
        if(this.room.name == controllerRoom){
            this.upgrade();
        }
        else {
            this.moveToRoom(controllerRoom);
        }
    }
};

Creep.prototype.creepReserver = function(){
    
    //Get creep controller to upgrade
    var controllerId = this.memory.controller;
    var controllerRoom = this.memory.controllerRoom;
    var controller = [];
    if(controllerId){
        //Get from memory
        if(!(Game.rooms[controllerRoom] == undefined)){
            controller.push(Game.getObjectById(controllerId));
        }
        else {
            this.moveToRoom(controllerRoom);
            return;
        }
    }
    else {
        //Determine creeps controller and store in memory
        let allControllers = [];
        let darkRooms = [];
        for(let i=0; i<this.targetRooms.length; i++){
            if(!(Game.rooms[this.targetRooms[i]] == undefined)){
                if(Game.rooms[this.targetRooms[i]].controller.owner == undefined){
                    allControllers.push(Game.rooms[this.targetRooms[i]].controller);
                }
            }
            else {
                darkRooms.push(this.targetRooms[i]);
            }
        }
        let resControllers = [];
        let reserveCreeps = _.filter(Game.creeps, (cr) => {
            return cr.memory.controller && cr.memory.origin == this.memory.origin;
        });
        for(let i=0; i<reserveCreeps.length; i++){
            resControllers.push(Game.getObjectById(reserveCreeps[i].memory.controller));
        }
        let match = false;
        for(let i=0; i<allControllers.length; i++){
            match = false;
            for(let j=0; j<resControllers.length && !match; j++) {
                if(allControllers[i].id == resControllers[j].id){
                    match = true;
                }
            }
            if(!match){
                controller.push(allControllers[i]);
                this.memory.controller = allControllers[i].id;
                this.memory.controllerRoom = allControllers[i].room.name;
                break;
            }
        }
        if((match || !allControllers.length) && darkRooms.length){
            //Go look for controller in dark room
            this.moveToRoom(darkRooms[0]);
            return;
        }
        if(match){
            //All rooms already have at least one reserver.
            if(allControllers.length >1){
                controller.push(allControllers.reduce(function(c1,c2){
                    if(c1.reservation.ticksToEnd < c2.reservation.ticksToEnd){return c1}
                    else {return c2}
                }));
            }
            else {
                controller.push(allControllers[0]);
            }
        }
    }
    let claim = false;
    if(claimRooms != undefined && claimRooms[this.memory.origin] != undefined && claimRooms[this.memory.origin][controllerRoom]){
        claim = true;
        this.claim(controller);
    }
    if(!claim){
        this.reserve(controller);
    }
};

Creep.prototype.creepMelee = function() {
    
    if(!this.room.memory.defense.underAttack){
        //TODO: Get creep to move out of the way
        return;
    }
    else if(!this.room.memory.defense.breached){
        //Attack creeps from ramparts
        
        let rampartId = this.memory.rampart;
        let rampart = [];
        if(rampartId){
            let creepRampart = Game.getObjectById(rampartId);
            if(creepRamaprt){
                rampart.push(creepRampart);
            }
            else {
                //Rampart no longer exists
                delete this.memory.rampart;
                return;
            }
        }
        else {
            //Look for ramparts near hostile creeps
            let ramparts = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].structures,STRUCTURE_RAMPART);
            let creepsInRamparts = this.room.find(FIND_MY_CREEPS, {filter: (creep) => {return creep.memory.rampart}});
            let occupiedRamparts = [];
            for(let i=0; i<creepsInRamparts.length; i++){
                let creepRampart = Game.getObjectById(creepsInRampart[i].memory.rampart);
                if(creepRampart){
                    occupiedRamparts.push(creepRampart);
                }
            }
            let rampartsWithHostiles = ramparts.filter(
                (ramp) => {
                    return ramp.room.lookForAtArea(LOOK_CREEPS,ramp.pos.y-1,ramp.pos.x-1,ramp.pos.y+1,ramp.pos.x+1,true).filter(
                        (seenCreep) => {
                            console.log('Creep near rampart ' + JSON.stringify(seenCreep));
                            return seenCreep.creep.owner.username != 'Vervust';
                        });
                }
            );
            let target = util.findDifferentElement(rampartsWithHostiles,occupiedRamparts);
            if(target != ERR_NOT_FOUND){
                rampart.push(target);
                this.memory.rampart = target.id;
            }
            else if(rampartsWithHostiles.length) {
                //Move towards rampart
                this.moveTo(rampartsWithHostiles,5);
                return;
            }
            else {
                target = util.findDifferentElement(ramparts,occupiedRamparts);
                if(target != ERR_NOT_FOUND){
                    rampart.push(target);
                    this.memory.rampart = target.id;
                }
            }
        }
        
        if(this.occupyRampart(rampart) == OK){
            let hostilesInRange = this.room.lookForAtArea(LOOK_CREEPS,this.pos.y-1,this.pos.x-1,this.pos.y+1,this.pos.x+1,true).filter(
                (seenCreep) => {
                    return seenCreep.creep.owner.username != 'Vervust';
                }
            );
            let healersInRange = hostilesInRange.filter((host) => {
                return host.body.filter((bp) => {
                    return bp.type == HEAL;
                }).length;
            });
            if(healersInRange.length){
                this.meleeAttack(healersInRange);
            }
            else {
                this.meleeAttack(hostilesInRange);
            }
        }
    }
    else {
        //Attack invaders
        let hostiles = this.room.find(FIND_HOSTILE_CREEPS);
        let healers = hostiles.filter((host) => {
            return host.body.filter((bp) => {
                return bp.type == HEAL;
            }).length;
        });
        if(healers.length){
            this.meleeAttack(healers);
        }
        else {
            this.meleeAttack(hostiles);
        }
    }
};

Creep.prototype.creepExplorerMelee = function(){

    let attackedRoom = this.memory.targetRoom;
    if(attackedRoom){
        if(!Memory.rooms[attackedRoom].defense.underAttack){
            console.log(this.memory.role + ' creep ' + this.name + ' its room ' + attackedRoom + ' is no longer under attack. Moving to different room.');
            delete this.memory.targetRoom;
            return;
        }
        if(!Game.rooms[attackedRoom]){
            this.moveToRoom(attackedRoom);
            return;
        }
    }
    else {
        let found = false;
        for(let i=0; i<this.targetRooms.length && !found; i++){
            let roomMemory = Memory.rooms[this.targetRooms[i]];
            if(roomMemory && roomMemory.defense.underAttack){
                attackedRoom = this.targetRooms[i];
                let nEnemies = roomMemory.defense.hostiles.number;
                let roomMeleeCreeps = _.filter(Game.creeps,(cr) => {return cr.role == 'melee' && cr.targetRoom == this.targetRooms[i]}).length;
                if(nEnemies > roomMeleeCreeps){
                    this.memory.targetRoom = this.targetRooms[i];
                    found = true;
                }
            }
        }
        if(!found){
            if(attackedRoom){
                this.memory.targetRoom = attackedRoom;
                console.log(this.memory.role + ' creep ' + this.name + ' moving to ' + attackedRoom);
            }
            else {
                //console.log(this.memory.role + ' creep ' + this.name + ' has no room to go to');
                if(this.targetRooms.length){this.moveToRoom(this.targetRooms[0])};
                return;
            }
        }
    }
    
    let room = Game.rooms[attackedRoom];
    if(!room){
        this.moveToRoom(attackedRoom);
        return;
    }
    
    let hostiles = room.find(FIND_HOSTILE_CREEPS);
    let healers = hostiles.filter((hostile) => {return hostile.body.filter((bodyPart) => {return bodyPart.type == HEAL}).length});
    if(this.meleeAttack(healers) == ERR_NOT_FOUND){
        if(this.meleeAttack(hostiles) == ERR_NOT_FOUND){
            this.say('All Clear');
        }
    }
};

Creep.prototype.creepCombat = function(){
    
    let attackedRoom = this.memory.targetRoom;
    if(attackedRoom){
        //console.log(this.name + ' in room');
        if(!Memory.rooms[attackedRoom].defense.underAttack){
            if(this.healOther() == ERR_NOT_FOUND){
                console.log(this.memory.role + ' creep ' + this.name + ' its room ' + attackedRoom + ' is no longer under attack. Moving to different room.');
                this.stationaryCombat();
                delete this.memory.targetRoom;
            }
            return;                 
        }
        if(!Game.rooms[attackedRoom]){
            //console.log(this.name + ' Going to attacked room');
            this.moveToRoom(attackedRoom);
            this.stationaryCombat();
            return;
        }
    }
    else {
        let found = false;
        for(let i=0; i<this.targetRooms.length && !found; i++){
            let roomMemory = Memory.rooms[this.targetRooms[i]];
            if(roomMemory && roomMemory.defense.underAttack){
                attackedRoom = this.targetRooms[i];
                let nEnemies = roomMemory.defense.hostiles.number;
                let roomCombatCreeps = _.filter(Game.creeps,(cr) => {return (cr.role == 'melee' || cr.role == 'ranged') && cr.targetRoom == this.targetRooms[i]}).length;
                if(nEnemies > roomCombatCreeps/2){
                    this.memory.targetRoom = this.targetRooms[i];
                    found = true;
                }
            }
        }
        if(!found){
            if(attackedRoom){
                this.memory.targetRoom = attackedRoom;
                console.log(this.memory.role + ' creep ' + this.name + ' moving to ' + attackedRoom);
            }
            else {
                //console.log(this.memory.role + ' creep ' + this.name + ' has no room to go to');
                if(this.healOther() == ERR_NOT_FOUND){
                    if(this.targetRooms.length){this.moveToRoom(this.targetRooms[0])};
                    this.stationaryCombat();
                }
                return;
            }
        }
    }
    
    let room = Game.rooms[attackedRoom];
    //console.log('Room ' + room);
    if(!room){
        //console.log(this.name + ' Going to attacked room');
        this.moveToRoom(attackedRoom);
        this.stationaryCombat();
        return;
    }
    
    let hostiles = room.find(FIND_HOSTILE_CREEPS);
    //console.log(JSON.stringify(hostiles));
    let healers = hostiles.filter((hostile) => {return hostile.body.filter((bodyPart) => {return bodyPart.type == HEAL}).length});
    if(this.combat(healers) == ERR_NOT_FOUND){
        if(this.combat(hostiles) == ERR_NOT_FOUND){
            this.say('All Clear');
        }
    }
};

Creep.prototype.creepPatroll = function(){
    
    let patrollRoom = this.memory.targetRoom;
    if(patrollRoom){
        if(!Game.rooms[patrollRoom]){
            //console.log(this.name + ' Going to attacked room');
            this.moveToRoom(patrollRoom);
            this.stationaryCombat();
            return;
        }
    }
    else {
        let patrollerCreeps = _.filter(Game.creeps,(cr) => {return cr.memory.role == this.memory.role});
        let patrolledRooms = [];
        for(let i=0; i<patrollerCreeps.length; i++){
            if(patrollerCreeps[i].memory.targetRoom){
                patrolledRooms.push(patrollerCreeps[i].memory.targetRoom);
            }
        }
        patrollRoom = util.findDifferentString(this.targetRooms,patrolledRooms);
        if(patrollRoom != ERR_NOT_FOUND){
            //console.log('Found room ' + patrollRoom);
            this.memory.targetRoom = patrollRoom;
        }
        else {
            this.moveToRoom(this.targetRooms[0]);
            this.stationaryCombat();                
            return;
        }
    }
    
    let room = Game.rooms[patrollRoom];
    //console.log('Room ' + room);
    if(!room){
        //console.log(this.name + ' Going to attacked room');
        this.moveToRoom(patrollRoom);
        this.stationaryCombat();
        return;
    }
    if(this.room.name == patrollRoom){
        let hostiles = util.gatherObjectsInArrayFromIds(roomObjects[room.name].hostiles);
        let bodyCount = util.countBodyParts(this)[0];
        //console.log('Hostiles ' + hostiles);
        if(this.combat(hostiles) == ERR_NOT_FOUND){
            let woundedHarvesters = this.room.find(FIND_MY_CREEPS, {filter: (creep) => {return (creep.memory.role == 'harvester' || creep.memory.role == 'miner') && creep.hits < creep.hitsMax}});
            if(this.healOther(woundedHarvesters) == ERR_NOT_FOUND){
                let spawns = this.room.find(FIND_HOSTILE_STRUCTURES, {filter: (str) => {return str.structureType == STRUCTURE_KEEPER_LAIR}});
                if(spawns.length){
                    let nextSpawn = spawns.reduce((a,b) => {
                        //console.log('Spawn ' + JSON.stringify(a));
                        if(a.ticksToSpawn){
                            if(b.ticksToSpawn){
                                if(a.ticksToSpawn < b.ticksToSpawn){
                                    return a;
                                }
                                else {
                                    return b;
                                }
                            }
                            else {
                                return a;
                            }
                        }
                        else {
                            return b;
                        }
                    });
                    //console.log('All hostiles dead. Going to ' + nextSpawn);
                    if(bodyCount[RANGED_ATTACK] && !bodyCount[ATTACK]){
                        this.moveTo([nextSpawn],3);
                    }
                    else {
                        //console.log(this.name + ' going to ' + nextSpawn);
                        this.moveTo([nextSpawn],1);
                    }                        
                                            
                }
                else{
                    this.moveTo([{pos: {x: 24,y: 24,'roomName': this.room.name}}],5);
                }
                this.stationaryCombat();                    
            }
        }
        if(bodyCount[RANGED_ATTACK] && !bodyCount[ATTACK]){
            this.flee(hostiles,3);
        }
    }
    else {
        //console.log('Moving to patroller room');
        this.moveToRoom(patrollRoom);
        this.stationaryCombat();
    }
};