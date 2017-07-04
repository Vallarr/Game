require('Creep.actions');
const profiler = require('screeps.profiler');

Creep.prototype.creepHarvest = function(){
    //Look for source
    let source = [];
    let sourceContainer;
    if(this.memory.source){
        //Get source from memory. Make sure creep is in right room
        if(this.memory.sourceRoom != this.room.name){
            this.moveToRoom(this.memory.sourceRoom);
            return;
        }
        else {
            source.push(Game.getObjectById(this.memory.source));
            //Get source container
            if(this.memory.sourceContainer){
                sourceContainer = util.gatherObjectsInArrayFromIds(this.memory,'sourceContainer');
                if(!sourceContainer.length){delete this.memory.sourceContainer} //Container doesn't exist
            }
            else {
                //Find source container
                let cont = util.gatherObjectsInArray(this.room.links,'source').concat(util.gatherObjectsInArray(this.room.containers,'source'));
                sourceContainer = util.targetsInRange(util.gatherObjectsInArray(this.room.links,'source').concat(util.gatherObjectsInArray(this.room.containers,'source')),source,2);
                if(!sourceContainer.length){
                    //Are there construction sites for containers?
                    //let containersToBeBuild = util.gatherObjectsInArray(this.room,'constructionSites').filter((s) => s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_LINK);
                    let containersToBeBuild = this.room.find(FIND_CONSTRUCTION_SITES, {filter: (site) => {return site.structureType == STRUCTURE_CONTAINER || site.structureType == STRUCTURE_LINK}});
                    sourceContainer = util.targetsInRange(containersToBeBuild,source,2);
                }
                this.memory.sourceContainer = util.gatherIdsInArrayFromObjects(sourceContainer);
            }
        }
    }
    else {
        //Look for source
        if(this.memory.sourceRoom){
            //Creep allready has a room assigned -> look for source in this room
            //Make sure creep is in source Room
            if(this.memory.sourceRoom != this.room.name){
                this.moveToRoom(this.memory.sourceRoom);
                return;
            }
            let occupiedSources = util.targetObjectsOfCreeps('source',this.room);
            let foundSource = false;
            while(!foundSource){
                let roomSources = util.findArrayOfDifferentElements(this.room.sources,occupiedSources);
                let filledSources = roomSources.filter((s) => s.energy > 0);
                let targetSource;
                if(filledSources.length){
                    targetSource = util.findExtremum(filledSources,(s1,s2) => s1.energy > s2.energy);
                }
                else {
                    targetSource = util.findExtremum(roomSources,(s1,s2) => s1.ticksToRegeneration < s2.ticksToRegeneration);
                }
                if(targetSource){
                    this.memory.source = targetSource.id;
                    source.push(targetSource);
                    foundSource = true;
                }
                else {
                    occupiedSources = util.findDubbles(occupiedSources);
                }
            }
        }
        else {
            //Look for source Room for creep
            let foundRoom = false;
            let occupiedRooms = util.targetRoomsOfCreeps('sourceRoom');
            let targetRoom;
            while(!foundRoom){
                targetRoom = util.findDifferentString(this.targetRooms,occupiedRooms);
                if(targetRoom != ERR_NOT_FOUND){
                    this.memory.sourceRoom = targetRoom;
                    foundRoom = true;
                }
                else {
                    occupiedRooms = util.findDubbleStrings(occupiedRooms);
                }
            }
        }
    }
    
    let maxCarry = this.getActiveBodyparts(WORK) * HARVEST_POWER * Math.floor(this.carryCapacity / (this.getActiveBodyparts(WORK) * HARVEST_POWER));
    //Harvest source
    if(this.carry[RESOURCE_ENERGY] >= maxCarry){
        let rtn = this.fillContainer(sourceContainer);
        //console.log(this.name + ' fillContainer ' + sourceContainer + ' ' + rtn);
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
            if(sourceContainer.length > 1){
                this.fillContainer(sourceContainer.filter((c) => {
                    if(c.structureType == STRUCTURE_LINK){
                        return c.energy < c.energyCapacity;
                    }
                    else {
                        return _.sum(c.store) < c.storeCapacity;
                    }
                }));
            }
            else if(sourceContainer[0].hits < sourceContainer[0].hitsMax){
                this.repairStructure(1,sourceContainer);
            }
            else {
                this.dropResource(RESOURCE_ENERGY);
            }
        }
    }
    else {
        let rtn = this.harvestSource(source);
        //console.log(this.name + ' ' + source + ' rtn ' + rtn);
        if(rtn == ERR_NOT_ENOUGH_RESOURCES && this.room.sources.length > 1){
            delete this.memory.source;
            delete this.memory.sourceContainer;
            //Store resources creep is holding
            rtn = this.fillContainer(sourceContainer);
            if(rtn != OK){
                //If creep can't store, then drop the resources
                this.dropResource(RESOURCE_ENERGY);
            }
        }
    }
    
};

Creep.prototype.creepDismantle = function(){
    
    if(dismantle == undefined){
        return ERR_NOT_FOUND;
    }
    
    if(this.memory.building && this.carry.energy == 0){
        this.memory.building = false;
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
                        targets = Game.rooms[this.targetRooms[i]].structures[type];
                        if(targets && targets.length){
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
        else if(this.targetRooms[0] != this.memory.origin){
            this.targetRooms = [this.memory.origin];
            return this.creepDismantle();
        }
        else {
            return ERR_NOT_FOUND;
        }
    }

    if((this.carry.energy < this.carryCapacity && !this.memory.building) || this.carryCapacity == 0){
        this.dismantleStructure(targets);
    }
    else {
        //store energy
        if(this.memory.building){
            let sites = this.room.find(FIND_CONSTRUCTION_SITES);
            if(this.buildStructure(sites) != ERR_NOT_FOUND){return}
        }
        let avContainers = util.gatherObjectsInArray(this.room.containers,'source','spawn','storage').filter((cont) => _.sum(cont.store) < cont.storeCapacity);
        let avUpgraderCont = util.gatherObjectsInArray(this.room.containers,'upgrader').filter((c) => c.storeCapacity - _.sum(c.store) >= this.carryCapacity);
        let avLinks = util.gatherObjectsInArray(this.room.links,'source','spawn').filter((link) => link.energy < link.energyCapacity);
        let targets = avContainers.concat(avUpgraderCont,avLinks);
        if(this.transferResources(targets) == ERR_NOT_FOUND){
            let construct = this.room.find(FIND_CONSTRUCTION_SITES);
            if(this.buildStructure(construct) == ERR_NOT_FOUND){
                this.memory.building = false;
                if(this.room.name  != this.memory.origin){
                    this.moveToRoom(this.memory.origin);
                }                
            }
            else {
                this.memory.building = true;
            }
        }
    }        
};

Creep.prototype.creepMiner = function(){
    let mineralSource = [];
    let extractor = [];
    if(this.memory.mineRoom && this.memory.mineralSource && this.memory.extractor){
        if(this.memory.mineRoom != this.room.name && _.sum(this.carry) < this.carryCapacity){
            this.moveToRoom(this.memory.mineRoom);
            return;
        }
        mineralSource.push(Game.getObjectById(this.memory.mineralSource));
        extractor.push(Game.getObjectById(this.memory.extractor));        
    }
    else {
        let foundDeposit = false;
        let darkRooms = [];
        let mineralDeposits = [];
        //console.log(this.name + ' targetRooms ' + this.targetRooms);
        for(let i=0; i<this.targetRooms.length; i++){
            if(Game.rooms[this.targetRooms[i]] != undefined){
                let mine = Game.rooms[this.targetRooms[i]].mineral
                //console.log(this.name + ' mine ' + mine);
                if(mine && mine[0].mineralAmount > 0){
                    mineralDeposits.push(mine[0]);
                }
            }
            else {
                darkRooms.push(this.targetRooms[i]);
            }
        }
        if(mineralDeposits.length){
            let occupiedDeposits = util.targetObjectsOfCreeps('mineralSource');
            let target = undefined;
            //console.log(this.name + ' occupied ' + occupiedDeposits + ' all ' + mineralDeposits);
            while(!foundDeposit){
                target = util.findDifferentElement(mineralDeposits,occupiedDeposits);
                //console.log(this.name + ' target ' + JSON.stringify(target));
                if(target != ERR_NOT_FOUND){
                    mineralSource.push(target);
                    this.memory.mineralSource = target.id;
                    this.memory.mineRoom = target.room.name;
                    extractor = util.gatherObjectsInArray(target.room.structures,STRUCTURE_EXTRACTOR);
                    if(extractor.length){
                        this.memory.extractor = extractor[0].id;
                    }
                    else {
                        console.log(this.memory.role + ' ' + this.name + ' cannot mine minerals, because there is no extractor');
                    }
                    foundDeposit = true;
                }
                if(!foundDeposit) {
                    if(darkRooms.length){
                        this.moveToRoom(darkRooms[0]);
                        return;
                    }
                    else {
                        occupiedDeposits = util.findDubbles(occupiedDeposits);
                    }
                }
            }            
        }
    }

    if(extractor.length && mineralSource.length && mineralSource[0].mineralAmount > 0){
        if(_.sum(this.carry) == this.carryCapacity){
            let mineralContainers = util.gatherObjectsInArray(this.room.containers,'mineral','storage').filter((cont) => _.sum(cont.store) < cont.storeCapacity);
            let rtn = this.transferResources(mineralContainers);
            if(rtn == OK && !extractor[0].cooldown){
                this.harvestSource(mineralSource);
            }
            else if(rtn == ERR_NOT_FOUND){
                if(this.room.name != this.memory.origin){
                    this.moveToRoom(this.memory.origin)
                }
            }
        }
        else if(!extractor[0].cooldown){
            //console.log(this.name + ' harvest mineral');
            this.harvestSource(mineralSource);
        }            
    }
    else {
        delete this.memory.mineralSource;
        delete this.memory.mineRoom;
        delete this.memory.extractor;
        if(_.sum(this.carry) > this.carry.energy){
            //Store resources
            let mineralContainers = util.gatherObjectsInArray(this.room.containers,'mineral','storage').filter((cont) => _.sum(cont.store) < cont.storeCapacity);
            if(this.transferResources(mineralContainers) == ERR_NOT_FOUND){
                this.say('Store full');
            }
        }
        else if(this.room.controller && this.room.controller.owner && this.room.controller.owner.username == 'Vervust' && this.room.controller.level < 8){
            //console.log(this.name + ' upgrade ');
            this.creepUpgrader();
        }
        else {
            //console.log(this.name + ' repair');
            this.creepRepair();
        }        
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
            let toFillUpgraderLinks = util.gatherObjectsInArray(this.room.links,'upgrader').filter((link) => link.energy == 0);
            let sourceLinks = util.gatherObjectsInArray(this.room.links,'source');
            let storageLink = undefined;
            if(!toFillUpgraderLinks.length){
                storageLink = util.gatherObjectsInArray(this.room.links,'storage');
            }
            else {storageLink = []}
            let containers = util.gatherObjectsInArray(this.room.containers,'spawn','source');
            let storage = undefined;
            if(this.room.storage){
                storage = [this.room.storage].filter((st) => st.store.energy > 0);
            }
            else {storage = []}
            let terminal = undefined;
            if(this.room.terminal && this.room.memory.orders && this.room.memory.orders.energy < -this.carryCapacity){
                //Terminal is set to remove energy from it -> take from terminal
                terminal = [this.room.terminal].filter((term) => term.store.energy > 0);
                //console.log(this.name + ' ' + terminal);
            }
            else {terminal = []}
            let LinksAndContainers = containers.concat(sourceLinks,storageLink,storage,terminal);
            let target = findFilledContainerForCreep(this,LinksAndContainers,0,2);
            //console.log(this.name + ' ' + target);
            if(target.structureType == STRUCTURE_TERMINAL){
                //Energy will be withdrawn from the terminal
                this.room.memory.orders.energy += this.carryCapacity;
            }
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
            let towers = util.gatherObjectsInArray(this.room.structures,STRUCTURE_TOWER);
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
        let toFillUpgraderLinks = util.gatherObjectsInArray(this.room.links,'upgrader').filter((link) => link.energy == 0);
        let toFillSpawnContainers = util.gatherObjectsInArray(this.room.containers,'spawn').filter((cont) => _.sum(cont.store) < cont.storeCapacity);
        let toFillUpgraderContainers = findNotFilledContainerForCreep(this,util.gatherObjectsInArray(this.room.containers,'upgrader'),1,2);
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
	                storageLink = util.gatherObjectsInArray(this.room.links,'storage');
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
    	                let container = findFilledContainerForCreep(this,util.gatherObjectsInArray(this.room.containers,'source'),1,2);
    	                if(container != ERR_NOT_FOUND){
    	                    this.harvestContainer(container);
    	                }
	                }
	            }
	            else if(this.completeOrders() == ERR_NOT_FOUND){
    	            let sourceContainers = util.gatherObjectsInArray(this.room.containers,'source');
    	            let mineralContainers = util.gatherObjectsInArray(this.room.containers,'mineral');
    	            let targetLabs = util.gatherObjectsInArray(this.room.labs,'target');
    	            let containers = sourceContainers.concat(mineralContainers,targetLabs);
    	            let target = findFilledContainerForCreep(this,containers,1,2);
    	            if(target != ERR_NOT_FOUND){
    	                if(this.withdrawResource(target) != OK){
    	                    this.memory.targetContainer = target.id;
    	                    this.memory.getting = true;
    	                }
    	            }
    	            else if(this.supplyLabs() == ERR_NOT_FOUND){
    	                this.supplyNuker();
    	            }
	            }
            }
            else if(this.memory.role == 'transporter'){
	            if(this.collectDroppedResource() == ERR_NOT_FOUND){
    	            let sourceContainers = util.gatherObjectsInArray(this.room.containers,'source');
    	            let mineralContainers = util.gatherObjectsInArray(this.room.containers,'mineral');
    	            let targetLabs = util.gatherObjectsInArray(this.room.labs,'target');
    	            let storageLink = undefined;
    	            if(!toFillUpgraderLinks.length){
    	                //If no upgrader containers have to be filled, storage link can be emptied
    	                storageLink = util.gatherObjectsInArray(this.room.links,'storage');
    	            }
    	            else {storageLink = []}
    	            let containers = sourceContainers.concat(storageLink, mineralContainers, targetLabs);
    	            let target = findFilledContainerForCreep(this,containers,1,2);
    	            if(target == ERR_NOT_FOUND && fillSpawn){
    	                target = findFilledContainerForCreep(this,sourceContainers.concat(storageLink),0,2);
    	            }
    	            
    	            if(target != ERR_NOT_FOUND){
    	                if(this.withdrawResource(target) != OK){
    	                    this.memory.targetContainer = target.id;
    	                    this.memory.getting = true;
    	                }
    	            }
    	            else if(toFillUpgraderContainers.length || toFillUpgraderLinks.length || fillSpawn){
    	                this.harvestStorage();
    	            }
    	            else if(this.completeOrders() == ERR_NOT_FOUND && this.supplyLabs() == ERR_NOT_FOUND){
                        this.supplyNuker();
    	            }
	            }	                
            }
            else if(this.memory.role == 'courier'){
                //console.log(this.room.name + ' ' + this.name +' ' + this.completeOrders());
                if(this.completeOrders() == ERR_NOT_FOUND){
                    if(this.collectDroppedResource() == ERR_NOT_FOUND){
        	            let sourceContainers = util.gatherObjectsInArray(this.room.containers,'source');
        	            let mineralContainers = util.gatherObjectsInArray(this.room.containers,'mineral');
        	            let targetLabs = util.gatherObjectsInArray(this.room.labs,'target');
        	            let storageLink = undefined;
        	            if(!toFillUpgraderLinks.length){
        	                //If no upgrader containers have to be filled, storage link can be emptied
        	                storageLink = util.gatherObjectsInArray(this.room.links,'storage');
        	            }
        	            else {storageLink = []}
        	            let containers = sourceContainers.concat(storageLink, mineralContainers, targetLabs);
        	            let target = findFilledContainerForCreep(this,containers,1,2);
        	            if(target == ERR_NOT_FOUND && fillSpawn){
        	                target = findFilledContainerForCreep(this,sourceContainers.concat(storageLink),0,2);
        	            }
        	            
        	            if(target != ERR_NOT_FOUND){
        	                if(this.withdrawResource(target) != OK){
        	                    this.memory.targetContainer = target.id;
        	                    this.memory.getting = true;
        	                }
        	            }
        	            else if(toFillUpgraderContainers.length || toFillUpgraderLinks.length || fillSpawn){
        	                this.harvestStorage();
        	            }
        	            else {
        	                this.supplyNuker();
        	            }
                    }
                }
            }
            else if(this.memory.role == 'labWorker'){
                if(this.supplyLabs() == ERR_NOT_FOUND){
    	            let sourceContainers = util.gatherObjectsInArray(this.room.containers,'source');
    	            let mineralContainers = util.gatherObjectsInArray(this.room.containers,'mineral');
    	            let targetLabs = util.gatherObjectsInArray(this.room.labs,'target');
    	            let storageLink = undefined;
    	            if(!toFillUpgraderLinks.length){
    	                //If no upgrader containers have to be filled, storage link can be emptied
    	                storageLink = util.gatherObjectsInArray(this.room.links,'storage');
    	            }
    	            else {storageLink = []}
    	            let containers = sourceContainers.concat(storageLink, mineralContainers, targetLabs);
    	            let target = findFilledContainerForCreep(this,containers,1,2);
    	            if(target == ERR_NOT_FOUND && fillSpawn){
    	                target = findFilledContainerForCreep(this,sourceContainers.concat(storageLink),0,2);
    	            }
    	            
    	            if(target != ERR_NOT_FOUND){
    	                if(this.withdrawResource(target) != OK){
    	                    this.memory.targetContainer = target.id;
    	                    this.memory.getting = true;
    	                }
    	            }
    	            else if(toFillUpgraderContainers.length || toFillUpgraderLinks.length || fillSpawn){
    	                this.harvestStorage();
    	            }
    	            else if(this.completeOrders() == ERR_NOT_FOUND){
                        this.supplyNuker();
    	            }
                }
            }
        }
        else {
            this.memory.getting = false;
            if(this.memory.role == 'filler' || this.memory.role == 'labWorker'){
                //Fill spawn containers
	            if(this.fillContainer(toFillSpawnContainers) == ERR_NOT_FOUND){
	                //Fill storage link if necessary. It will then link to upgrader link.
	                let toFillStorageLinks = [];
	                if(toFillUpgraderLinks.length){
	                    toFillStorageLinks = util.gatherObjectsInArray(this.room.links,'storage').filter((link) => link.energy < Math.pow(1-LINK_LOSS_RATIO,2) * link.energyCapacity);
	                    //console.log('Storage links: ' + toFillStorageLinks);
	                }
	                if(this.transferResources(toFillStorageLinks,RESOURCE_ENERGY) == ERR_NOT_FOUND){
	                    if(fillSpawn){
	                        this.fillSpawn();
	                    }
	                    else {
	                        this.fillStorage();
	                    }
	                }
	            }	                
            }
            else if(this.memory.role == 'transporter' || this.memory.role == 'courier'){
                if(this.memory.role == 'courier' && this.room.hasActiveOrders && this.room.storage && this.transferResources([this.room.storage]) == OK){
                    //If there are active orders -> store resources in storage and complete more orders
                    //console.log(this.name + ' completing orders in ' + this.room.name);
                    return;
                }
                //Fill storage link if necessary. It will then link to upgrader link.
                let toFillStorageLinks = [];
                if(toFillUpgraderLinks.length){
                    toFillStorageLinks = util.gatherObjectsInArray(this.room.links,'storage').filter((link) => link.energy < Math.pow(1-LINK_LOSS_RATIO,2) * link.energyCapacity);
                    //console.log('Storage links: ' + toFillStorageLinks);
                }
                if(this.transferResources(toFillStorageLinks,RESOURCE_ENERGY) == ERR_NOT_FOUND){
	                //Fill upgrader containers
	                let targetUpgraderContainer = findNotFilledContainerForCreep(this,util.gatherObjectsInArray(this.room.containers,'upgrader'),1,2);
	                //console.log(this.name + ' upgradercontainer ' + targetUpgraderContainer);
	                if(targetUpgraderContainer != ERR_NOT_FOUND){
	                    if(this.fillContainer(targetUpgraderContainer) != OK){
	                        this.memory.targetContainer = targetUpgraderContainer.id;
	                    }
	                }
	                else {
	                    //Fill towers
	                    let towers = util.gatherObjectsInArray(this.room.structures,STRUCTURE_TOWER);
	                    let targetTower = findNotFilledContainerForCreep(this,towers,0,1);
	                    //console.log(this.name + ' targetTower ' + targetTower);
	                    if(targetTower != ERR_NOT_FOUND){
	                        if(this.fillTower(targetTower) != OK){
	                            this.memory.targetContainer = targetTower.id;
	                        }
	                    }
	                    else {
            	            let sourceContainers = util.gatherObjectsInArray(this.room.containers,'source');
            	            let mineralContainers = util.gatherObjectsInArray(this.room.containers,'mineral');
            	            let storageLink = undefined;
            	            if(!toFillUpgraderLinks.length){
            	                //If no upgrader containers have to be filled, storage link can be emptied
            	                storageLink = util.gatherObjectsInArray(this.room.links,'storage');
            	            }
            	            else {storageLink = []}
            	            let containers = sourceContainers.concat(storageLink, mineralContainers);
            	            //console.log(this.name + ' containers ' + containers);
            	            let target = findFilledContainerForCreep(this,containers,1,2);
            	            //console.log('Target ' + target);
	                        if(fillSpawn && target == ERR_NOT_FOUND){
	                            this.fillSpawn();
	                        }
	                        else if(this.fillStorage() == ERR_NOT_FOUND && fillSpawn){
                                this.fillSpawn();
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
            //console.log(creep.name + ' cont ' + cont);
            if(cont.structureType == STRUCTURE_CONTAINER || cont.structureType == STRUCTURE_STORAGE || cont.structureType == STRUCTURE_TERMINAL){
                content =  _.sum(cont.store);
            }
            else if(cont.structureType == STRUCTURE_LAB){
                content = cont.mineralAmount;
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
            if(cont.structureType == STRUCTURE_CONTAINER || cont.structureType == STRUCTURE_STORAGE || cont.structureType == STRUCTURE_TERMINAL){
                diff = cont.storeCapacity - _.sum(cont.store);
            }
            else if(cont.structureType == STRUCTURE_LAB){
                diff = cont.mineralCapacity - cont.mineralAmount;
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
            //console.log('B4 ' + creep.name + ' containers ' + containers + ' targetedContainers ' + targetedContainers + ' target ' + targetContainer);
	        containers = containers.filter((cont) => {
	            if(cont.structureType == STRUCTURE_CONTAINER || cont.structureType == STRUCTURE_STORAGE  || cont.structureType == STRUCTURE_TERMINAL){
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

Creep.prototype.creepFiller = function(){
    //This creeps main responsibility is to make sure the spawns and extensions are refilled
    //Other tasks:  1. Move resources between storage and terminal (i.e. completing orders) and fill/empty storage links
    //              2. Supply labs with minerals
    //              3. Empty source containers and pick up dropped resources
    //              4. Supply Upgrader containers
    //              5. Supply towers
    //              6. Fill nukers
    
    //This creep is only active in its origin room
    if(this.room.name != this.memory.origin){
        this.moveToRoom(this.memory.origin);
        return;
    }
    
    //If creep is carrying anything -> no longer need to collect (ok for short ranges in origin room)
    if(this.memory.collecting && _.sum(this.carry) != 0){
        this.memory.collecting = false;
    }
    //If creep has nothing -> collect
    if(!this.memory.collecting && _.sum(this.carry) == 0){
        this.memory.collecting = true;
    }
    
    if(this.handleTargets()){return}
    
    //If creep is carrying minerals and has no targetContainer, these are stored first
    let storing = false;
    if(_.sum(this.carry) > this.carry.energy && (!this.memory.targetContainer || (this.room.terminal && this.memory.targetContainer != this.room.terminal.id) || (this.room.storage && this.memory.targetContainer != this.room.storage.id))){
        storing = true;
        let options = {storage: true, terminal: true};
        //console.log(this.name + ' in ' + this.room.name + ' storing minerals');
        if(this.storeResource(options) == ERR_NOT_FOUND){
            //console.log(this.name + ' in ' + this.room.name + ' dropping minerals');
            this.dropResource();
        }
    }
    
    //Main task: Fill spawns and extensions
    let fillSpawn = this.room.energyAvailable < this.room.energyCapacityAvailable;
    let filling = false;
    if(!storing && fillSpawn){
        //console.log(this.name + ' in ' + this.room.name + ' filling spawns and extensions');
        //Here creep needs to transfer any energy it has to spawn or tower, so no creep.memory.collecting check. So creep fills even if its own energy is last energy in room (important for startup rooms)
        if(this.memory.collecting){
            //Get energy
            let toFillUpgraderLinks = util.gatherObjectsInArray(this.room.links,'upgrader').filter((l) => l.available[RESOURCE_ENERGY] == 0);
            let options = {resourceType: RESOURCE_ENERGY, storage: true, terminal: true, dropped: true, containers: ['source','spawn'], amount: 1};
            if(toFillUpgraderLinks.length){
                options.links = ['spawn','source'];
            }
            else {
                options.links = ['storage','spawn','source'];
            }
            //console.log(this.name + ' in ' + this.room.name + ' getting energy to fill spawns and extensions');
            if(this.getResource(options) != ERR_NOT_FOUND){
                filling = true;
            }
        }
        else {
            //console.log(this.name + ' in ' + this.room.name + ' putting energy in spawns and extensions');
            options = {spawnsAndExtensions: true};
            if(this.storeResource(options) != ERR_NOT_FOUND){
                filling = true;
            }
        }
    }
    if(!storing && !filling){
        //console.log(this.name + ' in ' + this.room.name + ' completing other tasks');
        let toFillUpgraderContainers = util.gatherObjectsInArray(this.room.containers,'upgrader').filter((c) => c.storeCapacity - _.sum(c.store) - _.sum(c.inTransit) > this.carryCapacity);
        let toFillUpgraderLinks = util.gatherObjectsInArray(this.room.links,'upgrader').filter((l) => l.energy == 0);
        let toFillSpawnContainers = util.gatherObjectsInArray(this.room.containers,'spawn').filter((c) => _.sum(c.store) < c.storeCapacity);
        let toFillTowers = util.gatherObjectsInArray(this.room.structures,STRUCTURE_TOWER).filter((t) => t.energyCapacity - t.energy - t.inTransit[RESOURCE_ENERGY] > Math.min(this.carryCapacity,0.8*TOWER_CAPACITY));
        if(this.memory.collecting){
            //console.log(this.name + ' in ' + this.room.name + ' getting energy for job');
            //Fill or empty storage links
            let options;
            if(toFillUpgraderLinks.length || toFillSpawnContainers.length){
                //console.log(this.name + ' in ' + this.room.name + ' upgrader links and spawn containers');
                //Get energy to fill storage links, which will link to upgrader links or spawn containers
                options = {resourceType: RESOURCE_ENERGY, storage: true, terminal: true, dropped: true, containers: ['source']};
            }
            else {
                //console.log(this.name + ' in ' + this.room.name + ' empty storage links');
                //Empty storage links completely
                options = {resourceType: RESOURCE_ENERGY, amount: 1, links: ['storage']};
            }
            //Handle storage links, complete orders and 2. Supply Labs
            if(this.getResource(options) == ERR_NOT_FOUND && this.completeOrders() == ERR_NOT_FOUND && this.supplyLabs() == ERR_NOT_FOUND){
                //console.log(this.name + ' in ' + this.room.name + ' empty containers');
                //3. Empty source containers, labs and pick up dropped resources
                options = {resourceType: RESOURCE_ANY, dropped: true, containers: ['source','mineral'], labs: ['target']};
                if(this.getResource(options) == ERR_NOT_FOUND){
                    //console.log(this.name + ' in ' + this.room.name + ' supply upgrader and towers');
                    //4. Supply upgrader containers or 5. towers
                    if(toFillUpgraderContainers.length || toFillTowers.length){
                        //Get energy to fill upgrader containers or towers
                        options = {resourceType: RESOURCE_ENERGY, storage: true, terminal: true}
                        this.getResource(options);
                    }
                    else{
                        //console.log(this.name + ' in ' + this.room.name + ' filling nuker');
                        //6. Fill nukers
                        this.supplyNuker();
                    }
                }
            }
        }
        else {
            //console.log(this.name + ' in ' + this.room.name + ' transporting resource');
            let options;
            if(toFillSpawnContainers.length){
                //console.log(this.name + ' in ' + this.room.name + ' filling spawn containers');
                //Fill spawn containers
                options = {containers: ['spawn'], amount: 1};
                
            }
            else if(toFillUpgraderLinks.length){
                //console.log(this.name + ' in ' + this.room.name + ' filling storage links');
                //Fill storage links
                options = {links: ['storage'], amount: 1};
            }
            else if(toFillUpgraderContainers.length){
                //console.log(this.name + ' in ' + this.room.name + ' filling upgrader containers');
                //Fill upgrader containers
                options = {containers: ['upgrader']};
            }
            else if(toFillTowers.length){
                //console.log(this.name + ' in ' + this.room.name + ' fill towers');
                //Fill towers
                options = {towers: true, amount: Math.min(this.carryCapacity,0.8*TOWER_CAPACITY)};
            }
            if(!options || this.storeResource(options) == ERR_NOT_FOUND){
                //console.log(this.name + ' in ' + this.room.name + ' store resource in storage');
                //Store resources in storage
                options = {storage: true, terminal: true};
                this.storeResource(options);
            }
        }
    }
};

Creep.prototype.creepFillerv2 = function(){
    //The creep only concerns itsself with filling spawns and extensions
    if(this.memory.fillPath && this.memory.fillPath !== 'noPath'){
        this.creepFillerByPath();
        return;
    }
    else if(this.memory.fillPath == undefined){
        let path = this.room.findExtPath();
        if(path !== ERR_NOT_FOUND){
            this.memory.fillPath = util.serializePath(path);
        }
        else {
            this.memory.fillPath = 'noPath';
        }
        return;
    }
    
    //This creep is only active in its origin room
    if(this.room.name != this.memory.origin){
        this.moveToRoom(this.memory.origin);
        return;
    }
    
    //If creep is carrying anything -> no longer need to collect (ok for short ranges in origin room)
    if(this.memory.collecting && _.sum(this.carry) != 0){
        this.memory.collecting = false;
    }
    //If creep has nothing -> collect
    if(!this.memory.collecting && _.sum(this.carry) == 0){
        this.memory.collecting = true;
    }
    
    if(this.handleTargets()){return}
    
    filling = false;
    if(this.room.energyAvailable < this.room.energyCapacityAvailable){
        //console.log(this.name + ' in ' + this.room.name + ' filling spawns and extensions');
        if(this.memory.collecting){
            //Get energy
            let toFillUpgraderLinks = util.gatherObjectsInArray(this.room.links,'upgrader').filter((l) => l.available[RESOURCE_ENERGY] == 0);
            let options = {resourceType: RESOURCE_ENERGY, storage: true, terminal: true, containers: ['source','spawn'], amount: 1};
            if(toFillUpgraderLinks.length){
                options.links = ['spawn','source'];
            }
            else {
                options.links = ['storage','spawn','source'];
            }
            //console.log(this.name + ' in ' + this.room.name + ' getting energy to fill spawns and extensions');
            if(this.getResource(options) != ERR_NOT_FOUND){
                filling = true;
            }
        }
        else {
            //console.log(this.name + ' in ' + this.room.name + ' putting energy in spawns and extensions');
            options = {spawnsAndExtensions: true};
            if(this.storeResource(options) != ERR_NOT_FOUND){
                filling = true;
            }
        }
    }
};

Creep.prototype.creepFillerByPath = function(){
    cap = profiler.registerFN(cap);
    //This creep is only active in its origin room
    if(this.room.name != this.memory.origin){
        this.moveToRoom(this.memory.origin);
        return;
    }
    if(this.room.energyAvailable < this.room.energyCapacityAvailable){
        //Fill spawns and extensions
        let adjToFill = util.gatherObjectsInArray(this.pos.adjacentStructures,STRUCTURE_EXTENSION,STRUCTURE_SPAWN,STRUCTURE_TOWER).filter((e) => e.energy < e.energyCapacity);
        let adjCont = util.gatherObjectsInArray(this.pos.adjacentStructures,STRUCTURE_CONTAINER,STRUCTURE_LINK).filter((c) => cap(c) > 0);
        if(adjToFill.length){
            //Creep is near extensions/spawns to fill
            //console.log('Near to fill');
            if(this.carry[RESOURCE_ENERGY] > 0){
                //Fill
                //console.log('Have energy');
                this.transfer(adjToFill[0],RESOURCE_ENERGY);
                if(adjToFill.length == 1){
                    //Was last to fill so move on
                    //console.log('Was last to fill');
                    this.memory.fillPath = this.moveInCircularPath(this.memory.fillPath);
                    if(adjCont.length){
                        //Get energy if possible
                        //console.log('Getting energy before move');
                        let cont = util.findExtremum(adjCont,(a,b) => cap(a) > cap(b));
                        if(cont){
                            this.withdraw(cont,RESOURCE_ENERGY);
                        }
                    }
                }
                else if(adjCont.length){
                    //Empty container or link if creep can carry everything
                    let redCont = adjCont.filter((c) => cap(c) <= this.carryCapacity - this.carry[RESOURCE_ENERGY]);
                    let cont = util.findExtremum(redCont,(a,b) => cap(a) > cap(b));
                    if(cont){
                        //console.log('Extra withdrawl')
                        this.withdraw(cont,RESOURCE_ENERGY);
                    }
                }
            }
            else if(adjCont.length){
                //Get energy
                //console.log('Got no energy, getting from container or link');
                let cont = util.findExtremum(adjCont, (a,b) => cap(a) > cap(b));
                if(cont){
                    this.withdraw(cont,RESOURCE_ENERGY);
                }
            }
            else {
                //console.log('Move to find energy');
                this.memory.fillPath = this.moveInCircularPath(this.memory.fillPath);
            }
        }
        else {
            //console.log('Nothing to fill, move');
            if(adjCont.length && this.carry[RESOURCE_ENERGY] < this.carryCapacity){
                //Get energy from container
                //console.log('Getting energy from adj');
                let cont = util.findExtremum(adjCont, (a,b) => cap(a) > cap(b));
                if(cont){
                    this.withdraw(cont,RESOURCE_ENERGY);
                }
            }
            //Move on
            //this.moveToByPath(util.deserializePath(this.memory.fillPath));
            this.memory.fillPath = this.moveInCircularPath(this.memory.fillPath);
        }
    }
    else if(this.carry[RESOURCE_ENERGY] < this.carryCapacity){
        //If all spawns and extensions are filled and can carry more energy
        //console.log('All filled');
        let adjCont = util.gatherObjectsInArray(this.pos.adjacentStructures,STRUCTURE_CONTAINER,STRUCTURE_LINK).filter((c) => cap(c) > 0);
        if(adjCont.length){
            //Get energy from container
            //console.log('Getting energy from cont');
            let cont = util.findExtremum(adjCont, (a,b) => cap(a) > cap(b));
            if(cont){
                this.withdraw(cont,RESOURCE_ENERGY);
            }
        }
        else {
            //console.log('Moving to find energy');
            this.memory.fillPath = this.moveInCircularPath(this.memory.fillPath);
        }
    }
    
    function cap(c) {
        if(c.structureType == STRUCTURE_CONTAINER){return c.store[RESOURCE_ENERGY]}
        else if(c.structureType == STRUCTURE_LINK){return c.energy}
        else {return 0}
    }
};

Creep.prototype.creepCourier = function(){
    //This creeps main responsibility is to empty source containers/storage links and pick up dropped resources, and supply upgrader containers/links and towers (when under attack)
    //Other tasks:  1. Supply labs with minerals
    //              2. Move resources between storage and terminal (i.e. completing orders)
    //              3. Fill spawns and extensions
    //              4. Supply towers
    //              5. Fill nukers
    
    
    //If there is no filler, this creep takes over the filler's job
    if(this.room.memory.creeps && this.room.memory.creeps[this.memory.type] && this.room.memory.creeps[this.memory.type]['filler'] == 0){
        this.creepFiller();
        return;
    }
    
    //This creep is only active in its origin room
    if(this.room.name != this.memory.origin){
        this.moveToRoom(this.memory.origin);
        return;
    }
    
    //If creep is carrying anything -> no longer need to collect (ok for short ranges in origin room)
    if(this.memory.collecting && _.sum(this.carry) != 0){
        this.memory.collecting = false;
    }
    //If creep has nothing -> collect
    if(!this.memory.collecting && _.sum(this.carry) == 0){
        this.memory.collecting = true;
    }
    
    if(this.handleTargets()){return}
    
    //If creep is carrying minerals and has no targetContainer, these are stored first
    let storing = false;
    if(_.sum(this.carry) > this.carry.energy && (!this.memory.targetContainer || (this.room.terminal && this.memory.targetContainer != this.room.terminal.id) || (this.room.storage && this.memory.targetContainer != this.room.storage.id))){
        storing = true;
        let options = {storage: true, terminal: true};
        console.log(this.name + ' in ' + this.room.name + ' storing minerals');
        if(this.storeResource(options) == ERR_NOT_FOUND){
            console.log(this.name + ' in ' + this.room.name + ' dropping minerals');
            this.dropResource();
        }
    }
    
    //If room is under attack, filling towers is a priority
    let filling = false;
    if(!storing && this.room.memory.defense.underAttack){
        if(this.memory.collecting){
            let toFillUpgraderLinks = util.gatherObjectsInArray(this.room.links,'upgrader').filter((l) => l.available[RESOURCE_ENERGY] == 0);
            let options = {resourceType: RESOURCE_ENERGY, storage: true, terminal: true, dropped: true, containers: ['source'], amount: 1};
            if(toFillUpgraderLinks.length){
                options.links = ['source'];
            }
            else {
                options.links = ['storage','source'];
            }
            if(this.getResource(options) != ERR_NOT_FOUND){
                filling = true;
            }
        }
        else {
            let options = {towers: true, amount: Math.min(this.carryCapacity,0.2*TOWER_CAPACITY)};
            if(this.storeResource(options) != ERR_NOT_FOUND){
                filling = true;
            }
        }
    }
    if(!storing && !filling){
        let toFillUpgraderContainers = util.gatherObjectsInArray(this.room.containers,'upgrader').filter((c) => c.storeCapacity - _.sum(c.store) - _.sum(c.inTransit) > this.carryCapacity);
        let toFillUpgraderLinks = util.gatherObjectsInArray(this.room.links,'upgrader').filter((l) => l.energy == 0);
        let toFillSpawnContainers = util.gatherObjectsInArray(this.room.containers,'spawn').filter((c) => _.sum(c.store) < c.storeCapacity);
        let toFillTowers = util.gatherObjectsInArray(this.room.structures,STRUCTURE_TOWER).filter((t) => t.energyCapacity - t.energy - t.inTransit[RESOURCE_ENERGY] > Math.min(this.carryCapacity,0.8*TOWER_CAPACITY));
        if(this.memory.collecting){
            //Fill or empty storage links and supply upgrader containers
            let options;
            if(toFillUpgraderLinks.length || toFillUpgraderContainers.length){
                //console.log(this.name + ' in ' + this.room.name + ' upgrader links and spawn containers');
                //Get energy to fill storage links, which will link to upgrader links or spawn containers
                options = {resourceType: RESOURCE_ENERGY, storage: true, terminal: true, dropped: true, containers: ['source']};
            }
            else {
                //console.log(this.name + ' in ' + this.room.name + ' empty storage links');
                //Empty storage links completely
                options = {resourceType: RESOURCE_ENERGY, amount: 1, links: ['storage']};
            }
            if(this.getResource(options) == ERR_NOT_FOUND){
                // Empty source containers, labs and pick up dropped resources. Supply labs and complete orders
                options = {resourceType: RESOURCE_ANY, dropped: true, containers: ['source','mineral'], labs: ['target']};
                if(this.getResource(options) == ERR_NOT_FOUND && this.supplyLabs() == ERR_NOT_FOUND && this.completeOrders() == ERR_NOT_FOUND){
                    if(this.room.energyAvailable < this.room.energyCapacityAvailable || toFillTowers.length){
                        //Get energy to fill spawns or towers
                        options = {resourceType: RESOURCE_ENERGY, storage: true, terminal: true}
                        this.getResource(options);
                    }
                    else{
                        //Supply nukers
                        this.supplyNuker();
                    }
                }
            }
        }
        else {
            let options;
            if(toFillUpgraderLinks.length){
                //console.log(this.name + ' in ' + this.room.name + ' filling storage links');
                //Fill storage links
                options = {links: ['storage'], amount: 1};
            }
            else if(toFillUpgraderContainers.length){
                //console.log(this.name + ' in ' + this.room.name + ' filling upgrader containers');
                //Fill upgrader containers
                options = {containers: ['upgrader']};
            }
            else {
                let emptyOptions = {resourceType: RESOURCE_ANY, dropped: true, containers: ['source','mineral'], labs: ['target'], amount: this.carryCapacity, nWork: Math.max(5,this.getActiveBodyparts(WORK)), pos: this.pos};
                let toEmptyContainers = this.room.availableResources(emptyOptions);
                if(toEmptyContainers.length || this.room.hasActiveOrders){
                    //Store in storage and then continue emptying containers
                    options = {storage: true, terminal: true};
                }
                else if(this.room.energyAvailable < this.room.energyCapacityAvailable){
                    //Fill spawns and extensions
                    options = {spawnsAndExtensions: true};
                }
                else if(toFillTowers.length){
                    //Fill towers
                    options = {towers: true, amount: Math.min(this.carryCapacity,0.8*TOWER_CAPACITY)};
                }
            }
            if(!options || this.storeResource(options) == ERR_NOT_FOUND){
                //Store resources in storage
                options = {storage: true, terminal: true};
                this.storeResource(options);
            }
            
        }
    }
};

Creep.prototype.creepCourierv2 = function(){
    //This creep supplies upgrader and spawn containers, towers (when under attack)
    //It empties the rooms source containers and supplies labs and nukers
    //Filling towers when not under attack is low priority
    
    //If there is no filler, this creep takes over the filler's job
    if(this.room.memory.creeps && this.room.memory.creeps[this.memory.type] && this.room.memory.creeps[this.memory.type]['filler'] == 0){
        this.creepFillerv2();
        return;
    }
    
    //This creep is only active in its origin room
    if(this.room.name != this.memory.origin){
        this.moveToRoom(this.memory.origin);
        return;
    }
    
    //If creep is carrying anything -> no longer need to collect (ok for short ranges in origin room)
    if(this.memory.collecting && _.sum(this.carry) != 0){
        this.memory.collecting = false;
    }
    //If creep has nothing -> collect
    if(!this.memory.collecting && _.sum(this.carry) == 0){
        this.memory.collecting = true;
    }
    
    if(this.handleTargets()){return}
    
    //If creep is carrying minerals and has no targetContainer, these are stored first
    let storing = false;
    if(_.sum(this.carry) > this.carry.energy && (!this.memory.targetContainer || (this.room.terminal && this.memory.targetContainer != this.room.terminal.id) || (this.room.storage && this.memory.targetContainer != this.room.storage.id))){
        storing = true;
        let options = {storage: true, terminal: true};
        //console.log(this.name + ' in ' + this.room.name + ' storing minerals');
        if(this.storeResource(options) == ERR_NOT_FOUND){
            //console.log(this.name + ' in ' + this.room.name + ' dropping minerals');
            this.dropResource();
        }
    }
    
    //If room is under attack, filling towers is a priority
    let filling = false;
    if(!storing && this.room.memory.defense.underAttack){
        if(this.memory.collecting){
            let toFillUpgraderLinks = util.gatherObjectsInArray(this.room.links,'upgrader').filter((l) => l.available[RESOURCE_ENERGY] == 0);
            let options = {resourceType: RESOURCE_ENERGY, storage: true, terminal: true, dropped: true, containers: ['source'], amount: 1};
            if(toFillUpgraderLinks.length){
                options.links = ['source'];
            }
            else {
                options.links = ['storage','source'];
            }
            if(this.getResource(options) != ERR_NOT_FOUND){
                filling = true;
            }
        }
        else {
            let options = {towers: true, amount: Math.min(this.carryCapacity,0.2*TOWER_CAPACITY)};
            if(this.storeResource(options) != ERR_NOT_FOUND || this.supplyLabs() != ERR_NOT_FOUND){
                filling = true;
            }
        }
    }
    
    if(!storing && !filling){
        let toFillUpgraderContainers = util.gatherObjectsInArray(this.room.containers,'upgrader').filter((c) => c.storeCapacity - _.sum(c.store) - _.sum(c.inTransit) >= this.carryCapacity);
        let toFillUpgraderLinks = util.gatherObjectsInArray(this.room.links,'upgrader').filter((l) => l.energy == 0);
        let toFillSpawnContainers = util.gatherObjectsInArray(this.room.containers,'spawn').filter((c) => c.storeCapacity - _.sum(c.store) - _.sum(c.inTransit) >= this.carryCapacity);
        let toFillTowers = util.gatherObjectsInArray(this.room.structures,STRUCTURE_TOWER).filter((t) => t.energyCapacity - t.energy - t.inTransit[RESOURCE_ENERGY] >= Math.min(this.carryCapacity,0.2*TOWER_CAPACITY));
        if(this.memory.collecting){
            let options;
            if(toFillUpgraderContainers.length || toFillSpawnContainers.length){
                //console.log(this.name + ' in ' + this.room.name + ' upgrader links and spawn containers');
                //Get energy to upgrader containers
                options = {resourceType: RESOURCE_ENERGY, storage: true, terminal: true, dropped: true, containers: ['source']};
            }
            if(!options || this.getResource(options) == ERR_NOT_FOUND){
                // Empty source containers, labs and pick up dropped resources. Supply labs
                options = {resourceType: RESOURCE_ANY, dropped: true, containers: ['source','mineral'], labs: ['target']};
                if(this.getResource(options) == ERR_NOT_FOUND && this.supplyLabs() == ERR_NOT_FOUND){
                    if(toFillTowers.length){
                        //console.log('Getting energy for towers');
                        //Get energy to fill spawns or towers
                        options = {resourceType: RESOURCE_ENERGY, storage: true, terminal: true};
                        this.getResource(options);
                    } //Supply nukers
                    else if(this.supplyNuker() == ERR_NOT_FOUND){
                        this.supplyPowerSpawn();
                    }
                    
                }
            }
        }
        else {
            let options;
            if(toFillUpgraderContainers.length){
                //console.log(this.name + ' in ' + this.room.name + ' filling upgrader containers');
                //Fill upgrader containers
                options = {containers: ['upgrader']};
            }
            else if(toFillSpawnContainers.length){
                //console.log(this.name + ' in ' + this.room.name + ' filling spawn containers');
                //Fill spawn containers
                options = {containers: ['spawn']};
            }
            else if(toFillTowers.length){
                //Fill towers
                options = {towers: true, amount: Math.min(this.carryCapacity,0.2*TOWER_CAPACITY)};
            }
            if(!options || this.storeResource(options) == ERR_NOT_FOUND){
                //Store resources in storage
                options = {storage: true, terminal: true};
                this.storeResource(options);
            }
        }
    }
};

Creep.prototype.creepSender = function(){
    //This creep stays near the storage.
    //It empties and fills the storage links and completes orders
    
    //This creep is only active in its origin room
    if(this.room.name != this.memory.origin){
        this.moveToRoom(this.memory.origin);
        return;
    }
    
    //If creep is carrying anything -> no longer need to collect (ok for short ranges in origin room)
    if(this.memory.collecting && _.sum(this.carry) != 0){
        this.memory.collecting = false;
    }
    //If creep has nothing -> collect
    if(!this.memory.collecting && _.sum(this.carry) == 0){
        this.memory.collecting = true;
    }
    
    if(this.handleTargets()){return}
    
    //If creep is carrying minerals and has no targetContainer, these are stored first
    let storing = false;
    if(_.sum(this.carry) > this.carry.energy && (!this.memory.targetContainer || (this.room.terminal && this.memory.targetContainer != this.room.terminal.id) || (this.room.storage && this.memory.targetContainer != this.room.storage.id))){
        storing = true;
        let options = {storage: true, terminal: true};
        //console.log(this.name + ' in ' + this.room.name + ' storing minerals');
        if(this.storeResource(options) == ERR_NOT_FOUND){
            //console.log(this.name + ' in ' + this.room.name + ' dropping minerals');
            this.dropResource();
        }
    }
    
    if(!storing){
        let toFillUpgraderLinks = util.gatherObjectsInArray(this.room.links,'upgrader').filter((l) => l.energy == 0);
        let toFillSpawnLinks = util.gatherObjectsInArray(this.room.links,'spawn').filter((l) => l.energy == 0);
        let nSourceLinks = util.gatherObjectsInArray(this.room.links,'source').length;
        if(this.memory.collecting){
            //Fill or empty storage links
            let notFullStorageLinks = util.gatherObjectsInArray(this.room.links,'storage').filter((l) => l.energy < l.energyCapacity);
            let options;
            if((toFillUpgraderLinks.length || toFillSpawnLinks.length) && notFullStorageLinks.length){
                //console.log(this.name + ' in ' + this.room.name + ' upgrader links and spawn links');
                //Get energy to fill storage links, which will link to upgrader links or spawn links
                options = {resourceType: RESOURCE_ENERGY, storage: true, terminal: true};
            }
            else if(nSourceLinks){
                //console.log(this.name + ' in ' + this.room.name + ' empty storage links');
                //Empty storage links completely
                options = {resourceType: RESOURCE_ENERGY, amount: 1, links: ['storage']};
            }
            if(!options || this.getResource(options) == ERR_NOT_FOUND){
                //Complete order
                this.completeOrders();
            }
        }
        else {
            let options;
            if(toFillUpgraderLinks.length || toFillSpawnLinks.length){
                //console.log(this.name + ' in ' + this.room.name + ' filling storage links');
                //Fill storage links
                options = {links: ['storage'], amount: 1};
            }
            else if(this.room.hasActiveOrders){
                //Store in storage and then continue completing orders
                options = {storage: true, terminal: true};
            }
            if(!options || this.storeResource(options) == ERR_NOT_FOUND){
                //Store resources in storage
                options = {storage: true, terminal: true};
                this.storeResource(options);
            }
        }
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
            if(resource){
                if(resource.room.name != this.room.name){
                    this.moveToRoom(resource.room.name);
                }
                else if(this.collectDroppedResource(resource.resourceType,resource) != 1){
                    delete this.memory.getDropped;
                }
            }
            else {
                delete this.memory.getDropped;
            }
            return;
        }
        else if(this.memory.targetContainer) {
            if(this.room.name != this.memory.targetRoom){
                this.moveToRoom(this.memory.targetRoom);
            }
            else {
                let targetContainer = Game.getObjectById(this.memory.targetContainer);
                //console.log(this.name + ' ' + this.harvestContainer(targetContainer));
                if(targetContainer && this.withdrawResource(targetContainer) != 1){
                    delete this.memory.targetContainer;
                }
                else if(!targetContainer){
                    delete this.memory.targetContainer;
                }
            }
            return;
        }
        else if(this.memory.nextTargetContainer){
            if(this.room.name != this.memory.targetRoom){
                this.moveToRoom(this.memory.targetRoom);
            }
            else {
                let nextTargetContainer = Game.getObjectById(this.memory.nextTargetContainer);
                if(nextTargetContainer){
                    if(_.sum(nextTargetContainer.store) >= this.carryCapacity - _.sum(this.carry)){
                        this.memory.targetContainer = nextTargetContainer.id;
                        delete this.memory.nextTargetContainer;
                    }
                    else if(this.moveTo([nextTargetContainer],1) == ERR_NOT_FOUND){
                        delete this.memory.nextTargetContainer;
                    }
                }
                else if(!nextTargetContainer){
                    delete this.memory.nextTargetContainer;
                }
            }
            return;
        }
    }
    
    if(this.memory.collecting){
        let droppedResources = [];
        for(let i=0; i<this.targetRooms.length; i++){
            if(Game.rooms[this.targetRooms[i]] != undefined){
                let droppedInRoom = util.gatherObjectsInArray(Game.rooms[this.targetRooms[i]],'dropped').filter((rs) => {
                    let resourceHarvestPower = HARVEST_POWER;
                    //console.log(this.name + ' resource ' + rs);
                    if(rs.resourceType != RESOURCE_ENERGY){
                        resourceHarvestPower = HARVEST_MINERAL_POWER;
                    }
                    return rs.amount > Math.max(5,this.body.filter((bP) => {return bP.type == WORK}).length) * resourceHarvestPower * Math.ceil(Math.sqrt(Math.pow(this.pos.x-rs.pos.x,2) + Math.pow(this.pos.y-rs.pos.y,2)));
                });
                droppedResources = droppedResources.concat(droppedInRoom);
            }
        }
        let notTargetedResources = undefined;
        if(droppedResources.length) {
            let targetedDroppedResources = util.targetObjectsOfCreeps('getDropped');
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
                let room = Game.rooms[this.targetRooms[i]];
                let filledContainers = util.gatherObjectsInArray(room.containers,'source','mineral').filter((cont) => _.sum(cont.store) >= this.carryCapacity - _.sum(this.carry));
                filledSourceContainers = filledSourceContainers.concat(filledContainers);
                if(room.terminal && _.sum(room.terminal.store) >= this.carryCapacity - _.sum(this.carry)){
                    filledSourceContainers.push(room.terminal);
                }
                if(room.storage && _.sum(room.storage.store) >= this.carryCapacity - _.sum(this.carry)){
                    filledSourceContainers.push(room.storage);
                }
            }
            else {
                darkRooms.push(this.targetRooms[i]);
            }
        }
        //let targetedContainers = util.targetObjectsOfCreeps('targetContainer');
        let targetedContainers = util.targetObjectsOfCreeps('targetContainer').concat(util.targetObjectsOfCreeps('nextTargetContainer'));
        let notTargetedContainers = util.findArrayOfDifferentElements(filledSourceContainers,targetedContainers);
        filledSourceContainers = filledSourceContainers.filter((cont) => {return _.sum(cont.store) >= 2*this.carryCapacity - _.sum(this.carry)});
        let dubbleTargetedContainers = util.findDubbles(targetedContainers);
        notTargetedContainers = notTargetedContainers.concat(util.findArrayOfDifferentElements(filledSourceContainers,dubbleTargetedContainers));
        let target = this.pos.closestByRange(notTargetedResources.concat(notTargetedContainers));

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
            let allSourceContainers = [];
            for(let i=0; i<this.targetRooms.length; i++){
                if(Game.rooms[this.targetRooms[i]] != undefined){
                    allSourceContainers = allSourceContainers.concat(util.gatherObjectsInArray(Game.rooms[this.targetRooms[i]].containers,'source'));
                }
            }
            notTargetedContainers = util.findArrayOfDifferentElements(allSourceContainers,targetedContainers);
            //notTargetedContainers.sort((a,b) => _.sum(b.store) - _.sum(a.store));
            //Devide containers in categories according to priority
            //  1. Near active harvester and content + energy in source is enough to fill creep
            //  2. Near filled source and content + energy in source is enough to fill creep
            //  3. Near empty source with active creep -> will be next source to be harvested
            //  4. Near empty source
            //  5. Near active harvester and content + energy in source is not enough to fill creep
            //  6. Near filled source and content + energy in source is not enough to fill creep
            let containers = {"1": [], "2": [], "3": [], "4": [], "5": [], "6": []};
            for(let i=0; i<notTargetedContainers.length; i++){
                let targetedSources = util.targetObjectsOfCreeps('source',notTargetedContainers[i].room);
                let targetedSourcesInRange = util.targetsInRange(targetedSources,notTargetedContainers.slice(i,i+1));
                let sourcesInRange = util.targetsInRange(notTargetedContainers[i].room.sources,notTargetedContainers.slice(i,i+1));
                let sourceEnergy = 0;
                for(let j=0; j<sourcesInRange.length; j++){sourceEnergy+=sourcesInRange[j].energy}
                if(targetedSourcesInRange.length){
                    //The source near the container has an active harvester
                    if(sourceEnergy + _.sum(notTargetedContainers[i].store) >= this.carryCapacity - _.sum(this.carry)){
                        //Case 1
                        containers["1"].push(notTargetedContainers[i]);
                    }
                    else if(sourceEnergy == 0){
                        //Case 3
                        containers["3"].push(notTargetedContainers[i]);
                    }
                    else {
                        //Case 5
                        containers["5"].push(notTargetedContainers[i]);
                    }
                }
                else {
                    //No active harvester
                    if(sourceEnergy + _.sum(notTargetedContainers[i].store) >= this.carryCapacity - _.sum(this.carry)){
                        //Case 2
                        containers["2"].push(notTargetedContainers[i]);
                    }
                    else if(sourceEnergy == 0){
                        //Case 4
                        containers["4"].push(notTargetedContainers[i]);
                    }
                    else {
                        //Case 6
                        containers["6"].push(notTargetedContainers[i]);
                    }
                }

            }
            //console.log(this.name + ' from ' + this.memory.origin + ' not targeted ' + notTargetedContainers + ' containers ' + JSON.stringify(containers));
            let foundContainer = false;
            for(let category in containers){
                if(containers[category].length){
                    foundContainer = true;
                    this.memory.getting = true;
                    this.memory.targetRoom = containers[category][0].pos.roomName;
                    //this.memory.nextTargetContainer = containers[category][0].id;
                    this.memory.targetContainer = containers[category][0].id;
                    //console.log(this.name + ' got target ' + containers[category][0]);
                    break;
                }
            }
            if(!foundContainer){
                this.moveToRoom(this.targetRooms[0]);
                return;
            }
            
            
            /*target = util.findExtremum(notTargetedContainers,(c1,c2) => _.sum(c1.store) > _.sum(c2.store));
            //console.log(this.name + ' in room ' + this.room.name + ' moving to next container ' + target + ' not targeted ' + notTargetedContainers +  ' targeted ' + targetedContainers);
            if(target){
                this.memory.getting = true;
                this.memory.targetRoom = target.pos.roomName;
                this.memory.nextTargetContainer = target.id;
            }
            else {
                //console.log(this.name + ' in room ' + this.room.name + ' has no next target container');
                this.moveToRoom(this.targetRooms[0]);
                return;                
            }*/
        }
    }
    else {
        this.memory.getting = false;
        //console.log(this.name);
        if(this.room.name != this.memory.origin){
            //First move to room to decrease cost of search for multiple targets
            this.moveToRoom(this.memory.origin);
            return;
        }
        if(_.sum(this.carry) > this.carry.energy){
            //Carrying mineral -> put in storage
            let storageContainer = Game.rooms[this.memory.origin].storage;
            if(this.transferResources(storageContainer) != ERR_NOT_FOUND){
                return;
            }
        }
        let avContainers = util.gatherObjectsInArray(Game.rooms[this.memory.origin].containers,'source','spawn','storage').filter((cont) => _.sum(cont.store) < cont.storeCapacity);
        let avUpgraderContainers = util.gatherObjectsInArray(Game.rooms[this.memory.origin].containers,'upgrader').filter((cont) => cont.storeCapacity - _.sum(cont.store) >= this.carry.energy);
        let avLinks = util.gatherObjectsInArray(Game.rooms[this.memory.origin].links,'source','spawn').filter((link) => link.energy < link.energyCapacity);
        let targets = avLinks.concat(avUpgraderContainers,avContainers);
        
        if(this.transferResources(targets) == ERR_NOT_FOUND){
            //this.say('Store full');
        }
    }
};

Creep.prototype.creepTransporter = function(){
    //This creep gathers energy and minerals from its target rooms and stores them in the origin rooms storage/terminal, upgrader containers or spawn containers
    if(this.memory.collecting && _.sum(this.carry) == this.carryCapacity){
        this.memory.collecting = false;
    }
    if(!this.memory.collecting && _.sum(this.carry) == 0){
        this.memory.collecting = true;
    }
    
    if(this.handleTargets()){return}
    
    if(this.memory.collecting){
        let options = {resourceType: RESOURCE_ANY, storage: true, terminal: true, dropped: true, containers: ['source','mineral']};
        if(this.getResource(options) == ERR_NOT_FOUND){
            options.amount = 1;
            this.getResource(options);
        }
    }
    else {
        let options;
        if(_.sum(this.carry) > this.carry[RESOURCE_ENERGY]){
            options = {targetRooms: [this.memory.origin], storage: true, terminal: true};
        }
        else {
            options = {targetRooms: [this.memory.origin], storage: true, terminal: true, containers: ['spawn','upgrader']};
        }
        this.storeResource(options);
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
            let containers = util.gatherObjectsInArray(Game.rooms[this.memory.starterRoom].containers,'source','storage','upgrader','spawn').filter((cont) => _.sum(cont.store) < cont.storeCapacity);
            let links = util.gatherObjectsInArray(Game.rooms[this.memory.starterRoom].links,'source').filter((l) => l.energy < l.energyCapacity);
            if(this.transferResources(containers.concat(links),RESOURCE_ENERGY) == ERR_NOT_FOUND){
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
        //if(this.name == 'Scarlett'){console.log(this.name + ' rtn ' + rtn + ' room ' + this.room.name + ' origin ' + this.memory.origin)}
        if(rtn == ERR_NOT_FOUND){
            let targetContainers = util.gatherObjectsInArray(this.room.containers,'source','storage').filter((cont) => cont.store.energy > 0);
            let targetLinks = util.gatherObjectsInArray(this.room.links,'source').filter((link) => link.energy > 0);
            let terminal = undefined;
            if(this.room.terminal && this.room.memory.orders && this.room.memory.orders.energy < -this.carryCapacity){
                //Terminal is set to remove energy from it -> take from terminal
                terminal = [this.room.terminal].filter((term) => term.store.energy > 0);
                //console.log(this.name + ' ' + terminal);
            }
            else {terminal = []}
            let targets = targetContainers.concat(targetLinks,terminal);
            let target = this.pos.closestByRange(targets);
            let rtn;
            if(target && (rtn=this.harvestContainer([target])) == ERR_NOT_FOUND || !target){
                this.moveToRoom(this.memory.origin);
            }
            else if(target && rtn == OK && target.structureType == STRUCTURE_TERMINAL){
                this.room.memory.orders[RESOURCE_ENERGY] += this.carryCapacity;
            }
        }
    }
    else {
        //console.log(this.buildStructure(explorerSites));
        let closestSite = this.pos.closestByRange(explorerSites,3);
        if(!closestSite){closestSite = []}
        if(this.buildStructure(closestSite) == ERR_NOT_FOUND){
            //console.log(this.name,'nothing to build');
            let dmgStructures = [];
            let darkRooms = [];
            for(let i=0; i<this.targetRooms.length; i++){
                if(Game.rooms[this.targetRooms[i]] != undefined){
                    let room = Game.rooms[this.targetRooms[i]];
                    let dmgStructRoom = util.gatherObjectsInArray(room.dmgStructures);
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
            let closestDmgStructure = this.pos.closestByRange(dmgStructures,3);
            if(!closestDmgStructure){closestDmgStructure = []}
            if(this.repairStructure(1,closestDmgStructure) == ERR_NOT_FOUND){
                if(this.creepDismantle() == ERR_NOT_FOUND){
                    if(this.targetRooms[0] != this.memory.origin){
                        this.targetRooms = [this.memory.origin];
                        this.creepBuild();
                    }
                    else if(!GCL_FARM[this.room.name] && this.room.controller && this.room.controller.owner && this.room.controller.owner.username == 'Vervust' && this.room.controller.level < 8){
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
    let criticalRepairs = [];
    let darkRooms = [];
    for(let i=0; i<this.targetRooms.length; i++){
        if(Game.rooms[this.targetRooms[i]] != undefined){
            let room = Game.rooms[this.targetRooms[i]];
            let dmgStructRoom = util.gatherObjectsInArray(room.dmgStructures);
            dmgStructures = dmgStructures.concat(dmgStructRoom);
            criticalRepairs = criticalRepairs.concat(util.gatherObjectsInArray(room.criticalRepairs));
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
            let targetContainers = util.gatherObjectsInArray(this.room.containers,'source','storage').filter((cont) => cont.store.energy > 0);
            let targetLinks = util.gatherObjectsInArray(this.room.links,'source').filter((link) => link.energy > 0);
            let terminal = undefined;
            if(this.room.terminal && this.room.memory.orders && this.room.memory.orders.energy < -this.carryCapacity){
                //Terminal is set to remove energy from it -> take from terminal
                terminal = [this.room.terminal].filter((term) => term.store.energy > 0);
                //console.log(this.name + ' ' + terminal);
            }
            else {terminal = []}
            let targets = targetContainers.concat(targetLinks);
            let target = this.pos.closestByRange(targets);
            let rtn;
            if(target && (rtn=this.harvestContainer([target])) == ERR_NOT_FOUND || !target){
                this.moveToRoom(this.memory.origin);
            }
            else if(target && rtn == OK && target.structureType == STRUCTURE_TERMINAL){
                this.room.memory.orders[RESOURCE_ENERGY] += this.carryCapacity;
            }
        }
    }
    else {
        if(!dmgStructures.length && darkRooms.length){
            //console.log(this.name,'going to dark room');
            this.moveToRoom(darkRooms[0]);
            return;
        }
        let closestCritDmgStructure = this.pos.closestByRange(criticalRepairs,3);
        if(!closestCritDmgStructure){closestCritDmgStructure = []}
        if(this.repairStructure(1,closestCritDmgStructure) == ERR_NOT_FOUND){
            let closestDmgStructure = this.pos.closestByRange(dmgStructures,3);
            if(!closestDmgStructure){closestDmgStructure = []}
            if(this.repairStructure(1,closestDmgStructure) == ERR_NOT_FOUND){
                //console.log(this.name,'doing build');
                this.creepBuild();
            }            
        }
    }
};

Creep.prototype.creepUpgrader = function(){

    /*if(this.memory.getDropped) {
        let resource = Game.getObjectById(this.memory.getDropped);
        if(resource && this.collectDroppedResource(resource.resourceType,resource) !=1){
            delete this.memory.getDropped;
        }
        else if(!resource){
            delete this.memory.getDropped;
        }
        return;
    }*/
    
    //If creep is carrying anything -> no longer need to collect (ok for short ranges in origin room)
    if(this.memory.collecting && _.sum(this.carry) != 0){
        this.memory.collecting = false;
    }
    //If creep has nothing -> collect
    if(!this.memory.collecting && _.sum(this.carry) == 0){
        this.memory.collecting = true;
    }
    
    if(this.handleTargets()){return}
    
    let controllerRoom = this.memory.controllerRoom;
    if(!controllerRoom){
        let found = false;
        for(let i=0; i<this.targetRooms.length && !found; i++){
            if(Game.rooms[this.targetRooms[i]] != undefined){
                let room = Game.rooms[this.targetRooms[i]];
                if(room.controller && room.controller.owner && room.controller.owner.username == 'Vervust'){
                    this.memory.controllerRoom = room.name;
                    controllerRoom = room.name;
                    found = true;
                }
            }
        }
        if(!found){
            if(this.memory.origin == this.targetRooms[0]){
                console.log(this.role + ' ' + this.name + ' has no room to upgrade controller');
                return;
            }
            else {
                this.targetRooms = [this.memory.origin];
                this.creepUpgrader();
                return;
            }
            
        }
    }
    
    if(this.memory.controllerRoom && this.room.name != this.memory.controllerRoom){
        this.moveToRoom(this.memory.controllerRoom);
        return;
    }
    
    if(this.carry.energy == 0){
        let options = {resourceType: RESOURCE_ENERGY, containers: ['upgrader'], links: ['upgrader'], amount: 1};
        if(this.getResource(options) == ERR_NOT_FOUND){
            options = {resourceType: RESOURCE_ENERGY, storage: true, terminal: true, dropped: true, containers: ['source'], links: ['source'], amount: 1};
            this.getResource(options);
        }
        /*let upgraderContainers = util.gatherObjectsInArray(this.room.containers,'upgrader').filter((c) => c.store.energy > 0);
        let upgraderLinks = util.gatherObjectsInArray(this.room.links,'upgrader').filter((l) => l.energy > 0);
        let targets = upgraderLinks.concat(upgraderContainers);
        if(this.harvestContainer(targets) == ERR_NOT_FOUND){
            let filledContainers = util.gatherObjectsInArray(this.room.containers,'source','storage').filter((cont) => cont.store.energy > 0);
            let filledLinks = util.gatherObjectsInArray(this.room.links,'source').filter((link) => link.energy > 0);
            targets = filledLinks.concat(filledContainers);
            if(GCL_FARM[this.room.name] && this.room.terminal && this.room.terminal.store[RESOURCE_ENERGY] > 0){
                targets.push(this.room.terminal);
            }
            //console.log(this.name + ' targets ' + targets);
            if(this.harvestContainer(targets) == ERR_NOT_FOUND){
                if(this.collectDroppedResource(RESOURCE_ENERGY) == ERR_NOT_FOUND){
                    //this.moveToRoom(this.memory.origin);
                }
            }
        }*/
    }
    else {
        if(this.room.name == controllerRoom){
            let rtn = this.upgrade();
            if(rtn == OK && this.carry.energy <= this.getActiveBodyparts(WORK) * UPGRADE_CONTROLLER_POWER){
                let options = {resourceType: RESOURCE_ENERGY, containers: ['upgrader'], links: ['upgrader'], amount: 1};
                if(this.getResource(options) == ERR_NOT_FOUND){
                    options = {resourceType: RESOURCE_ENERGY, storage: true, terminal: true, dropped: true, containers: ['source'], links: ['source'], amount: 1};
                    this.getResource(options);
                }
                /*let upgraderContainers = util.gatherObjectsInArray(this.room.containers,'upgrader').filter((c) => c.store.energy > 0);
                let upgraderLinks = util.gatherObjectsInArray(this.room.links,'upgrader').filter((l) => l.energy > 0);
                let targets = upgraderLinks.concat(upgraderContainers);
                if(this.harvestContainer(targets) == ERR_NOT_FOUND){
                    let filledContainers = util.gatherObjectsInArray(this.room.containers,'source','storage').filter((cont) => cont.store.energy > 0);
                    let filledLinks = util.gatherObjectsInArray(this.room.links,'source').filter((link) => link.energy > 0);
                    targets = filledLinks.concat(filledContainers);
                    if(GCL_FARM[this.room.name] && this.room.terminal && this.room.terminal.store[RESOURCE_ENERGY] > 0){
                        targets.push(this.room.terminal);
                    }
                    //console.log(this.name + ' targets ' + targets);
                    if(this.harvestContainer(targets) == ERR_NOT_FOUND){
                        if(this.collectDroppedResource(RESOURCE_ENERGY) == ERR_NOT_FOUND){
                            //this.moveToRoom(this.memory.origin);
                        }
                    }
                }*/
            }
        }
        else {
            this.moveToRoom(controllerRoom);
        }
    }
};

Creep.prototype.creepReserver = function(){
    
    //Get creep controller to reserve
    let controllerId = this.memory.controller;
    let controllerRoom = this.memory.controllerRoom;
    let controller = [];
    if(controllerId){
        //Get from memory
        if(this.room.name != this.memory.controllerRoom){
            this.moveToRoom(controllerRoom);
            return;
        }
        else {
            controller.push(Game.getObjectById(controllerId));
        }
    }
    else {
        //Determine creeps controller and store in memory
        let allControllers = [];
        let darkRooms = [];
        for(let i=0; i<this.targetRooms.length; i++){
            if(Game.rooms[this.targetRooms[i]] != undefined){
                if(Game.rooms[this.targetRooms[i]].controller && Game.rooms[this.targetRooms[i]].controller.owner == undefined){
                    allControllers.push(Game.rooms[this.targetRooms[i]].controller);
                }
            }
            else {
                darkRooms.push(this.targetRooms[i]);
            }
        }
        let resControllers = util.targetObjectsOfCreeps('controller');
        let notTargetedControllers = util.findArrayOfDifferentElements(allControllers,resControllers);
        let targetController = util.findExtremum(notTargetedControllers, (a,b) => {
            if(a.owner){return false}
            if(b.owner){return true}
            //At this point: There are no owners
            if(!a.reservation){return true}
            if(!b.reservation){return false}
            //At this point: There are reservations
            if(a.reservation.username != 'Vervust'){return false}
            if(b.reservation.username != 'Vervust'){return true}
            //At this point: The reservations are mine
            return a.reservation.ticksToEnd < b.reservation.ticksToEnd;
        });
        //console.log(this.name + ' from ' + this.memory.origin + ' going to controller ' + targetController + ' possible targets were ' + notTargetedControllers);
        if(targetController){
            this.memory.controller = targetController.id;
            this.memory.controllerRoom = targetController.room.name;
        }
        else if(darkRooms.length){
            this.moveToRoom(darkRooms[0]);
            return;
        }
        else {
            //All rooms already have at least one reserver.
            targetController = util.findExtremum(allControllers, (a,b) => {
                if(a.owner){return false}
                if(b.owner){return true}
                //At this point: There are no owners
                if(!a.reservation){return true}
                if(!b.reservation){return false}
                //At this point: There are reservations
                if(a.reservation.username != 'Vervust'){return false}
                if(b.reservation.username != 'Vervust'){return true}
                //At this point: The reservations are mine
                return a.reservation.ticksToEnd < b.reservation.ticksToEnd;
            });
            if(targetController){
                this.memory.controller = targetController.id;
                this.memory.controllerRoom = targetController.room.name;
            }
        }
    }
    
    let claim = false;
    if(claimRooms && claimRooms[this.memory.origin] && claimRooms[this.memory.origin][controllerRoom]){
        claim = true;
        this.claim(controller);
    }
    if(!claim){
        this.reserve(controller);
        if(controller[0] && controller[0].reservation && controller[0].reservation.ticksToEnd >= CONTROLLER_RESERVE_MAX - 1){
            delete this.memory.controller;
            delete this.memory.controllerRoom;
        }
    }
};

Creep.prototype.creepAttackReserver = function(){
    let controllerId = this.memory.controller;
    let controllerRoom = this.memory.controllerRoom;
    let controller = [];
    if(controllerId){
        if(this.room.name != controllerRoom){
            this.moveToRoom(controllerRoom);
            return;
        }
        else {
            controller.push(Game.getObjectById(controllerId));
        }
    }
    else {
        let allControllers = [];
        let darkRooms = [];
        for(let i=0; i<this.targetRooms.length; i++){
            if(Game.rooms[this.targetRooms[i]] != undefined){
                if(Game.rooms[this.targetRooms[i]].controller && Game.rooms[this.targetRooms[i]].controller.owner){
                    allControllers.push(Game.rooms[this.targetRooms[i]].controller);
                }
            }
            else {
                darkRooms.push(this.targetRooms[i]);
            }
        }
        let targetedControllers = util.targetObjectsOfCreeps('controller');
        let found = false;
        while(!found && allControllers.length){
            let notTargetedControllers = util.findArrayOfDifferentElements(allControllers,targetedControllers);
            if(notTargetedControllers.length){
                this.memory.controller = notTargetedControllers[0].id;
                this.memory.controllerRoom = notTargetedControllers[0].room.name;
                found = true;
            }
            else {
                targetedControllers = util.findDubbles(targetedControllers);
            }
        }
        if(!found && darkRooms.length){
            this.moveToRoom(darkRooms[0]);
            return;
        }
    }
    
    this.downgradeController(controller);
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
            let ramparts = util.gatherObjectsInArray(this.room.structures,STRUCTURE_RAMPART);
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
            //console.log(this.memory.role + ' creep ' + this.name + ' its room ' + attackedRoom + ' is no longer under attack. Moving to different room.');
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
                let nEnemies = roomMemory.defense.nHostiles;
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
    
    let attackedRoom = this.memory.defendRoom;
    if(attackedRoom){
        //console.log(this.name + ' in room ' + attackedRoom + ' ' + Memory.rooms[attackedRoom].defense.underAttack);
        if(!Memory.rooms[attackedRoom].defense.underAttack){
            if(this.healOther() == ERR_NOT_FOUND){
                //console.log(this.memory.role + ' creep ' + this.name + ' its room ' + attackedRoom + ' is no longer under attack. Moving to different room.');
                this.stationaryCombat();
                delete this.memory.defendRoom;
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
        let darkRooms = [];
        for(let i=0; i<this.targetRooms.length && !found; i++){
            let roomMemory = Memory.rooms[this.targetRooms[i]];
            if(roomMemory && roomMemory.defense.underAttack){
                attackedRoom = this.targetRooms[i];
                let nEnemies = roomMemory.defense.nHostiles;
                let roomCombatCreeps = util.targetRoomsOfCreeps('defendRoom');
                if(nEnemies > roomCombatCreeps){
                    this.memory.defendRoom = this.targetRooms[i];
                    found = true;
                }
            }
            else if(!Game.rooms[this.targetRooms[i]]){
                darkRooms.push(this.targetRooms[i]);
            }
        }
        if(!found){
            if(attackedRoom){
                this.memory.defendRoom = attackedRoom;
                console.log(this.memory.role + ' creep ' + this.name + ' moving to ' + attackedRoom);
            }
            else if(darkRooms.length){
                console.log(this.name + ' going to dark rooms (combat) ' + darkRooms[0]);
                this.moveToRoom(darkRooms[0]);
                this.stationaryCombat();
                return;
            }
            else {
                //console.log(this.memory.role + ' creep ' + this.name + ' has no room to go to');
                if(this.healOther() == ERR_NOT_FOUND){
                    //If creep is in rampart: move out of it to let workers pass
                    if(this.targetRooms.length){this.moveToRoom(this.targetRooms[0])};
                    this.stationaryCombat();
                }
                return;
            }
        }
    }
    
    if(this.room.name != attackedRoom){
        //Go to attacked room
        this.moveToRoom(attackedRoom);
        this.stationaryCombat();
        return;
    }
    
    if(this.room.controller && this.room.controller.owner && this.room.controller.my){
        //Main room is under attack
        //console.log(this.name + ' in origin room breached ' + this.room.memory.defense.breached);
        if(!this.room.memory.defense.breached){
            //console.log(this.name + ' not breached');
            let rampart = [];
            if(this.memory.rampart){
                let creepRampart = Game.getObjectById(this.memory.rampart);
                if(creepRampart){
                    rampart.push(creepRampart);
                }
                else {
                    delete creep.memory.rampart;
                    this.stationaryCombat();
                    return;
                }                
            }
            else {
                let ramparts = this.room.ramparts;
                let targetRamparts = undefined;
                if(this.getActiveBodyparts(ATTACK)){
                    targetRamparts = util.gatherObjectsInArray(ramparts,'melee');
                }
                else if(this.getActiveBodyparts(RANGED_ATTACK)){
                    targetRamparts = util.gatherObjectsInArray(ramparts,'ranged');
                }
                else {
                    targetRamparts = [];
                }
                let occupiedRamparts = util.targetObjectsOfCreeps('rampart',this.room);
                let target = util.findDifferentElement(targetRamparts, occupiedRamparts);
                //console.log(this.name + ' targets ' + targetRamparts + ' occupied ' + occupiedRamparts);
                if(target != ERR_NOT_FOUND){
                    rampart.push(target);
                    this.memory.rampart = target.id;
                }
                else if(targetRamparts.length){
                    //straight up attack
                    //TODO: Make them attack in pacs
                    let healers = util.gatherObjectsInArray(this.room.creeps.hostiles,'heal','meleeHeal','rangedHeal','hybrid');
                    if(this.combat(healers,false) == ERR_NOT_FOUND){
                        let otherHostiles = util.gatherObjectsInArray(this.room.creeps.hostiles,'melee','ranged','meleeRanged','hybrid','claim');
                        this.combat(otherHostiles);
                    }                      
                }
                else {
                    //Walls are not under attack, wait inside walls
                    //TODO: still attack if opponents don't pose a treath (e.g) only dismantler and healer
                }
            }
            
            if(this.room.creeps.hostiles[ATTACK] == 0 && this.room.creeps.hostiles[RANGED_ATTACK] == 0){
                //Hostiles can't do damage -> go out and attack them
                let healers = util.gatherObjectsInArray(this.room.creeps.hostiles,'heal','meleeHeal','rangedHeal','hybrid');
                if(this.combat(healers,false) == ERR_NOT_FOUND){
                    let otherHostiles = util.gatherObjectsInArray(this.room.creeps.hostiles,'melee','ranged','meleeRanged','hybrid','claim');
                    this.combat(otherHostiles);
                }                  
            }
            else if(this.occupyRampart(rampart) == OK){
                let healers = util.gatherObjectsInArray(this.room.creeps.hostiles,'heal','meleeHeal','rangedHeal','hybrid');
                if(this.stationaryCombat(healers,false) == ERR_NOT_FOUND){
                    let otherHostiles = util.gatherObjectsInArray(this.room.creeps.hostiles,'melee','ranged','meleeRanged','hybrid','claim');
                    if(this.stationaryCombat(otherHostiles) == ERR_NOT_FOUND){
                        //No hostiles in range of ramparts
                        delete this.memory.rampart;
                        //Move inside walls to prevent creep from going to other rampart via outside of walls
                        this.moveTo([this.room.storage],5);
                    }
                }
            }
            else {
                this.stationaryCombat();
            }
        }
        else {
            //Defenses breached. Attack from ramparts no longer makes sense
            let healers = util.gatherObjectsInArray(this.room.creeps.hostiles,'heal','meleeHeal','rangedHeal','hybrid');
            if(this.combat(healers,false) == ERR_NOT_FOUND){
                let otherHostiles = util.gatherObjectsInArray(this.room.creeps.hostiles,'melee','ranged','meleeRanged','hybrid','claim');
                if(this.combat(otherHostiles) == ERR_NOT_FOUND){
                    let nonLethalHostiles = util.gatherObjectsInArray(this.room.creeps.hostiles,'other');
                    this.combat(nonLethalHostiles);
                }
            }            
        }
    }
    else {
        //Remote room is under attack
        let healers = util.gatherObjectsInArray(this.room.creeps.hostiles,'heal','meleeHeal','rangedHeal','hybrid');
        if(this.combat(healers,false) == ERR_NOT_FOUND){
            let otherHostiles = util.gatherObjectsInArray(this.room.creeps.hostiles,'melee','ranged','meleeRanged','hybrid','claim');
            this.combat(otherHostiles);
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
        let found = false;
        while(!found && this.targetRooms.length){
            patrollRoom = util.findDifferentString(this.targetRooms,patrolledRooms);
            if(patrollRoom != ERR_NOT_FOUND){
                this.memory.targetRoom = patrollRoom;
                found = true;
            }
            else {
                patrolledRooms = util.findDubbleStrings(patrolledRooms);
            }
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
        let healers = util.gatherObjectsInArray(room.creeps.hostiles,'heal','meleeHeal','hybrid','rangedHeal');
        let others = util.gatherObjectsInArray(room.creeps.hostiles,'melee','meleeRanged','ranged','claim','other');
        let hostiles = healers.concat(others);
        let bodyCount = util.countBodyParts(this)[0];
        //console.log('Hostiles ' + hostiles);
        let rtn;
        if((rtn=this.combat(healers,false)) == ERR_NOT_FOUND && (rtn=this.combat(others,false)) == ERR_NOT_FOUND){
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
        else if(rtn != OK){
            this.stationaryCombat();
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

Creep.prototype.creepDrainer = function(){
    
    if(!this.memory.attackRoom){
        let attackedRooms = util.targetRoomsOfCreeps('attackRoom');
        let found = false;
        while(!found){
            let notTargetedRooms = util.findArrayOfDifferentStrings(this.targetRooms,attackedRooms);
            if(notTargetedRooms.length){
                this.memory.attackRoom = notTargetedRooms[0];
                found = true;
            }
            else {
                attackedRooms = util.findDubbleStrings(attackedRooms);
            }
        }
    }
    
    if(this.memory.attackRoom){
        //Creep will move to room and sit on border to drain towers
        this.moveToRoom(this.memory.attackRoom);
    }
    this.stationaryCombat();
};

Creep.prototype.creepStartUpBuilder = function(){
    if(this.memory.targetContainer) {
        if(this.room.name != this.memory.targetRoom){
            this.moveToRoom(this.memory.targetRoom);
        }
        else {
            let targetContainer = Game.getObjectById(this.memory.targetContainer);
            //console.log(this.name + ' ' + this.harvestContainer(targetContainer));
            if(targetContainer && this.withdrawResource(targetContainer) != 1){
                delete this.memory.targetContainer;
            }
            else if(!targetContainer){
                delete this.memory.targetContainer;
            }
        }
        return;
    }
    
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
    
    let room = Game.rooms[this.memory.starterRoom];
    if(!room && this.memory.starterRoom){
        this.moveToRoom(this.memory.starterRoom);
        return;
    }
    if(this.room.name == this.memory.starterRoom){
        this.memory.arrived = true;
    }
    
    if((this.memory.harvesting || this.memory.getting) && _.sum(this.carry) == this.carryCapacity){
        this.memory.harvesting = false;
        this.memory.getting = false;
    }
    if(!this.memory.getting && _.sum(this.carry) == 0){
        this.memory.getting = true;
    }
    
    if(remoteRooms && remoteRooms['explorer'] && remoteRooms['explorer'][this.memory.starterRoom]){
        this.targetRooms = this.targetRooms.concat(remoteRooms['explorer'][this.memory.starterRoom]);
    }
    
    //console.log(this.name + ' targets ' + this.targetRooms);
    
    if(this.memory.getting){
        if(this.memory.harvesting){
            if(this.memory.source){
                let source = Game.getObjectById(this.memory.source);
                if(source && source.energy == 0){
                    this.memory.harvesting = false;
                    this.memory.getting = false;
                }
                else {
                    this.creepHarvest();
                }
            }
            else {
                this.creepHarvest();
            }
        }
        else if(this.memory.arrived){
            let containers = util.gatherObjectsInArray(this.room.containers,'source','storage').filter((c) => c.store.energy > 0);
            let links = util.gatherObjectsInArray(this.room.links,'source').filter((l) => l.energy > 0);
            let targeted = util.targetObjectsOfCreeps('targetContainer');
            let notTargeted = util.findArrayOfDifferentElements(containers.concat(links),targeted);
            let target = this.pos.closestByRange(notTargeted);
            //console.log(this.name + ' targets ' + target + ' not targeted ' + notTargeted);
            if(target){
                this.memory.targetContainer = target.id;
                this.memory.targetRoom = target.pos.roomName;
            }
            else if(this.collectDroppedResource(RESOURCE_ENERGY) == ERR_NOT_FOUND){
                this.memory.harvesting = true;
                this.creepHarvest();
            }
        }
        else {
            this.creepHarvest();
        }
    }
    else if(Game.rooms[this.memory.starterRoom].controller.ticksToDowngrade < 2000){
        //Don't let controller downgrade
        this.creepUpgrader();
    }
    else if(this.fillTower() == ERR_NOT_FOUND){
        let dmgStructures = [];
        let criticalRepairs = [];
        for(let i=0; i<this.targetRooms.length; i++){
            if(Game.rooms[this.targetRooms[i]] != undefined){
                let room = Game.rooms[this.targetRooms[i]];
                let dmgStructRoom = util.gatherObjectsInArray(room.dmgStructures);
                dmgStructures = dmgStructures.concat(dmgStructRoom);
                criticalRepairs = criticalRepairs.concat(util.gatherObjectsInArray(room.criticalRepairs));
            }
        }
        let closestCritDmgStructure = this.pos.closestByRange(criticalRepairs,3);
        //console.log(this.room + ' Closest ' + closestCritDmgStructure + ' all ' + criticalRepairs);
        if(!closestCritDmgStructure){closestCritDmgStructure = []}
        if(this.repairStructure(1,closestCritDmgStructure) == ERR_NOT_FOUND){
            let closestDmgStructure = this.pos.closestByRange(dmgStructures,3);
            if(!closestDmgStructure){closestDmgStructure = []}
            if(this.repairStructure(1,closestDmgStructure) == ERR_NOT_FOUND){
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
                let closestSite = this.pos.closestByRange(explorerSites,3);
                if(!closestSite){closestSite = []}
                if(this.buildStructure(closestSite) == ERR_NOT_FOUND){
                    this.creepUpgrader();
                }
            }             
        }
    }
    
};

Creep.prototype.creepAttackDismantler = function(){
    /**This creep moves together with a certain amount of healers (this.memory.nHealers) and will not move untill he's accompanied bij its healers.
     * Store id's of healers in memory (this.memory.healers).
     * If this creep is about to move -> give information to healers so they can follow. (Work with leader this.memory.leader and followers this.memory.followers)
     * Set flag as rally point (COLOR_WHITE), flag secondary color is kill squad specific (this.memory.color). When in range of flag, assign leaders and followers.
     **/
    if(!this.memory.followers && this.memory.nHealers){
        //Move to rally point to meet healers
        this.rallyHealers();
        return;
    }
    
    //Determine room to attack (goto flag or pick room from targetRooms)
    /** If no flags are used:
     *     Move to target room. If no path to towers, spawn, extensions -> take down wall or rampart.
     *     If path to towers, spawn, extension: determine which have no rampart on them and take those down first.
     * */
    /** If flags are used: Primary color COLOR_RED means attack at this place, flag secondary color is kill squad specific (this.memory.color).
     *     Move to flag and destroy target structure (1st rampart then structure).
     *     If no structure at flag location -> go to next flag in room or flagless scenario.
     * */
    //If no towers, spawns, extensions left -> destroy labs
    //If room cleared -> move to next flagged room or flagless scenario
    let attackRoom = this.memory.attackRoom;
    let attackPositions = [];
    for(let name in Game.flags){
        let flag = Game.flags[name];
        if(flag.color == COLOR_RED && flag.secondaryColor == this.memory.color){
            attackPositions.push(flag);
        }
    }
    attackPositions = attackPositions.filter((p) => {
        if(attackRoom && p.pos.roomName != attackRoom){return false} //Once in a room, stick with it
        let room = Game.rooms[p.pos.roomName];
        if(!room){return true}
        let struct = p.pos.lookFor(LOOK_STRUCTURES);
        if(!struct.length || (struct.length == 1 && struct[0].structureType == STRUCTURE_ROAD)){
            p.remove();
            return false
        }
        return true;
    });
    if(attackPositions.length){
        let rtn = this.moveTo(attackPositions,1);
        if(rtn != OK && rtn != ERR_NOT_FOUND){
            let struct = rtn.pos.lookFor(LOOK_STRUCTURES);
            let target = struct[0];;
            for(let i=0; i<struct.length; i++){
                if(struct[i].structureType == STRUCTURE_RAMPART){
                    target = struct[i];
                }
            }
            if(!attackRoom){this.memory.attackRoom = rtn.pos.roomName}
            if(this.dismantleStructure([target]) != ERR_NOT_FOUND){return}
        }
        return;
    }
    
    
    if(!attackRoom){
        let targetedRooms = util.targetRoomsOfCreeps('attackRoom');
        while(!attackRoom && this.targetRooms.length){
            let notTargetedRooms = util.findArrayOfDifferentStrings(this.targetRooms, targetedRooms);
            if(notTargetedRooms.length){
                attackRoom = notTargetedRooms[0];
                this.memory.attackRoom = notTargetedRooms[0];
            }
            else {
                targetedRooms = util.findDubbleStrings(targetedRooms);
            }
        }
    }
    if(!attackRoom){return}
    if(this.room.name != attackRoom){
        //console.log('Moving to attack room ' + attackRoom);
        this.moveToRoom(attackRoom);
        return;
    }
    
    
    //Structures without ramparts
    let towers = util.gatherObjectsInArray(this.room.structures,STRUCTURE_TOWER);
    let extensions = util.gatherObjectsInArray(this.room.structures,STRUCTURE_EXTENSION);
    let spawns = util.gatherObjectsInArray(this.room.structures,STRUCTURE_SPAWN);
    let loneTowers = towers.filter((t) => !t.hasRampart);
    let loneExtensions = extensions.filter((e) => !e.hasRampart);
    let loneSpawns = spawns.filter((s) => !s.hasRampart);
    //console.log('Lone, towers ' + loneTowers + ' extension ' + loneExtensions + ' spawns ' + loneSpawns);
    if(this.dismantleStructure(loneTowers) != ERR_NOT_FOUND || this.dismantleStructure(loneSpawns) != ERR_NOT_FOUND || this.dismantleStructure(loneExtensions) != ERR_NOT_FOUND){
        //console.log('Dismantling structures without ramparts');
        return;
    }
    else if(this.dismantleStructure(towers) != ERR_NOT_FOUND || this.dismantleStructure(spawns) != ERR_NOT_FOUND || this.dismantleStructure(extensions) != ERR_NOT_FOUND){
        //console.log('Dismantling structures with rampart');
        return;
    }
    else if(towers.length || extensions.length || spawns.length){
        console.log('Cannot reach towers, spawns or extensions');
        //Find out which wall to attack
    }
    else {
        //Room has been cleared -> move to other room
        console.log('Room cleared ' + attackRoom);
        this.targetRooms = util.findArrayOfDifferentStrings(this.targetRooms,[attackRoom]);
        delete this.memory.attackRoom;
        this.creepAttackDismantler();
    }
};

Creep.prototype.creepAttackHealer = function(){
    
    if(!this.memory.leader){
        this.goToRallyPoint();
        return;
    }
    
    //Healer will never move on its own -> only stationary combat
    this.stationaryCombat();
    //Possible improvement: Use rangedMassAttack when near hostile extensions to destroy them
};

Creep.prototype.creepPowerAttacker = function(){
    if(!this.memory.followers && this.memory.nHealers){
        //Move to rally point and meet healers
        this.rallyHealers();
        return;
    }
    
    let powerRoom = this.memory.powerRoom;
    if(!powerRoom){
        let origin = Game.rooms[this.memory.origin];
        let targetRooms = this.targetRooms.filter((r) => {
            let pR = Game.rooms[r];
            if(pR){
                let pB = util.gatherObjectsInArray(pR.structures,STRUCTURE_POWER_BANK)[0];
                if(!pB){return false}
            }
            let d = origin.nonLinearDistance(r);
            let ttd = origin.memory.powerRooms[r].ticksToDecay;
            let hits = origin.memory.powerRooms[r].hits;
            let dmg = ATTACK_POWER * this.getActiveBodyparts(ATTACK);
            if(hits == 0){return false}
            if(hits/dmg / (CREEP_LIFE_TIME - 50 * d) * CREEP_LIFE_TIME < ttd){return true}
            return false;
        });
        if(!targetRooms.length){targetRooms = this.targetRooms};
        let targeted;
        if(util.targOfCreeps['powerRoom']){
            targeted = util.targOfCreeps['powerRoom'].all
        }
        else {targeted = []}
        let targets;
        let found = false;
        while(!found){
            targets = util.findArrayOfDifferentStrings(targetRooms,targeted);
            if(targets.length){
                powerRoom = targets[0];
                this.memory.powerRoom = targets[0];
                found = true;
            }
            else if(!targetRooms.length){
                return;
            }
            else {
                targeted = util.findDubbleStrings(targeted);
            }
        }
    }
    
    let room = Game.rooms[powerRoom];
    if(!room){
        this.moveToRoom(powerRoom);
        return;
    }
    
    let powerBank = util.gatherObjectsInArray(room.structures,STRUCTURE_POWER_BANK);
    if(!powerBank.length){
        delete this.memory.powerRoom;
        let power = util.gatherObjectsInArray(room,'dropped').filter((r) => r.resourceType == RESOURCE_POWER);
        if(power.length){
            this.flee(power,3);
        }
    }
    else if (this.hits > this.getActiveBodyparts(ATTACK) * ATTACK_POWER / 2){
        this.meleeAttack(powerBank);
    }
};

Creep.prototype.creepPowerTransporter = function(){
    if(this.memory.collecting && _.sum(this.carry) == this.carryCapacity){
        this.memory.collecting = false;
    }
    if(!this.memory.collecting && _.sum(this.carry) == 0){
        this.memory.collecting = true;
    }
    
    if(this.handleTargets()){return}
    
    let powerRoom = this.memory.getPowerRoom;
    if(this.memory.collecting){
        if(!powerRoom){
            let origin = Game.rooms[this.memory.origin];
            let targetRooms = this.targetRooms.filter((r) => {
                let d = origin.nonLinearDistance(r);
                let hits = origin.memory.powerRooms[r].hits;
                let ttd = origin.memory.powerRooms[r].ticksToDecay;
                let power = origin.memory.powerRooms[r].power;
                let dmg = ATTACK_POWER * 24;
                let carry = CARRY_CAPACITY * 25;
                let nNeeded = Math.ceil(power/carry);
                let nTrips = Math.min(Math.max(Math.floor((this.ticksToLive - 100) / (2 * 50 * d)),1),2);
                nNeeded = Math.ceil(nNeeded/nTrips);
                let nTargeted = 0;
                if(util.targOfCreeps['getPowerRoom']){
                    nTargeted = util.targOfCreeps['getPowerRoom'].all.filter((name) => name == r).length;
                }
                if(hits/dmg / (CREEP_LIFE_TIME - 50 * d) * CREEP_LIFE_TIME < ttd && nTargeted < nNeeded){return true}
                return false;
            });
            let powerBankDown = targetRooms.find((t) => origin.memory.powerRooms[t].hits == 0);
            if(powerBankDown){
                this.memory.getPowerRoom = powerBankDown;
                powerRoom = powerBankDown;
            }
            else {
                let targetRoom = targetRooms[0];
                if(targetRoom){
                    this.memory.getPowerRoom = targetRoom;
                    powerRoom = targetRoom;
                }
                else {
                    return;
                }
            }
        }
    }
    
    if(this.memory.collecting){
        let options = {targetRooms: [powerRoom], resourceType: RESOURCE_POWER, dropped: true, amount: 1};
        if(this.getResource(options) == ERR_NOT_FOUND){
            if(this.room.name != powerRoom){
                this.moveToRoom(powerRoom)
            }
            else if(!this.room.structures[STRUCTURE_POWER_BANK]){
                //No power and power bank left in this room
                if(_.sum(this.carry) > 0){
                    this.memory.collecting = false;
                }
                delete this.memory.getPowerRoom;
            }
            else {
                let powerBank = util.gatherObjectsInArray(this.room.structures,STRUCTURE_POWER_BANK);
                this.moveTo(powerBank,3);
            }
        }
    }
    else {
        if(this.memory.getPowerRoom){delete this.memory.getPowerRoom}
        let options;
        if(_.sum(this.carry) > this.carry[RESOURCE_ENERGY]){
            options = {targetRooms: [this.memory.origin], storage: true, terminal: true};
        }
        else {
            options = {targetRooms: [this.memory.origin], storage: true, terminal: true, containers: ['spawn','upgrader']};
        }
        console.log(this.name + ' storing ');
        this.storeResource(options);
    }
};