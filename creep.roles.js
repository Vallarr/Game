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
                sourceContainer = util.targetsInRange(util.gatherObjectsInArray(this.room.links,'source').concat(util.gatherObjectsInArray(this.room.containers,'source')),source,2);
                //sourceContainer = util.targetsInRange(util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'source').concat(util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source')),source,2);
                if(!sourceContainer.length){
                    let containersToBeBuild = this.room.find(FIND_CONSTRUCTION_SITES, {filter: (site) => {return site.structureType == STRUCTURE_CONTAINER || site.structureType == STRUCTURE_LINK}});
                    sourceContainer = util.targetsInRange(containersToBeBuild,source,2);
                }
                //console.log(this.name + ' sourceCont ' + sourceContainer);
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
                //roomSources = roomSources.concat(util.gatherObjectsInArrayFromIds(roomObjects[this.targetRooms[i]].sources,'energy'));
                roomSources = roomSources.concat(util.gatherObjectsInArray(Game.rooms[this.targetRooms[i]],'sources'));
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
        //console.log(this.name +' sourceCont ' + sourceContainer + ' rtn ' + rtn);
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
                        //targets = roomObjects[this.targetRooms[i]].structures[type];
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
        //let avContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source','spawn','storage').filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
        let avContainers = util.gatherObjectsInArray(this.room.containers,'source','spawn','storage').filter((cont) => _.sum(cont.store) < cont.storeCapacity);
        //let avLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'source','spawn').filter((link) => {return link.energy < link.energyCapacity});
        let avLinks = util.gatherObjectsInArray(this.room.links,'source','spawn').filter((link) => link.energy < link.energyCapacity);
        let targets = avContainers.concat(avLinks);
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
        if(Game.rooms[this.memory.mineRoom] == undefined){
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
                //let mine = Game.getObjectById(roomObjects[this.targetRooms[i]].sources.mineral);
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
                    //extractor = util.gatherObjectsInArrayFromIds(roomObjects[target.room.name].structures,STRUCTURE_EXTRACTOR);
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
            //let mineralContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'mineral','storage').filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
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
            //let mineralContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'mineral','storage').filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
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
            //let toFillUpgraderLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'upgrader').filter((link) => {return link.energy == 0});
            let toFillUpgraderLinks = util.gatherObjectsInArray(this.room.links,'upgrader').filter((link) => link.energy == 0);
            //let sourceLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'source');
            let sourceLinks = util.gatherObjectsInArray(this.room.links,'source');
            let storageLink = undefined;
            if(!toFillUpgraderLinks.length){
                //storageLink = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'storage');
                storageLink = util.gatherObjectsInArray(this.room.links,'storage');
            }
            else {storageLink = []}
            //let containers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'spawn','source');
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
            //let towers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].structures,STRUCTURE_TOWER);
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
        //let toFillUpgraderLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'upgrader').filter((link) => {return link.energy == 0});
        let toFillUpgraderLinks = util.gatherObjectsInArray(this.room.links,'upgrader').filter((link) => link.energy == 0);
        //let toFillSpawnContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'spawn').filter(function(container){return _.sum(container.store) < container.storeCapacity});
        let toFillSpawnContainers = util.gatherObjectsInArray(this.room.containers,'spawn').filter((cont) => _.sum(cont.store) < cont.storeCapacity);
        //let toFillUpgraderContainers = findNotFilledContainerForCreep(this,util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'upgrader'),1,2);
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
	                //storageLink = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'storage');
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
    	                //let container = findFilledContainerForCreep(this,util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source'),1,2);
    	                let container = findFilledContainerForCreep(this,util.gatherObjectsInArray(this.room.containers,'source'),1,2);
    	                if(container != ERR_NOT_FOUND){
    	                    this.harvestContainer(container);
    	                }
	                }
	            }
	            else if(this.completeOrders() == ERR_NOT_FOUND){
    	            //let sourceContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source');
    	            let sourceContainers = util.gatherObjectsInArray(this.room.containers,'source');
    	            //let mineralContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'mineral');
    	            let mineralContainers = util.gatherObjectsInArray(this.room.containers,'mineral');
    	            //let targetLabs = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].labs,'target');
    	            let targetLabs = util.gatherObjectsInArray(this.room.labs,'target');
    	            let containers = sourceContainers.concat(mineralContainers,targetLabs);
    	            //let containers = sourceContainers.concat(mineralContainers);
    	            let target = findFilledContainerForCreep(this,containers,1,2);
    	            if(target != ERR_NOT_FOUND){
    	                if(this.withdrawResource(target) != OK){
    	                    this.memory.targetContainer = target.id;
    	                    this.memory.getting = true;
    	                }
    	            }
    	            else {
    	                this.supplyLabs();
    	            }
	            }
            }
            else if(this.memory.role == 'transporter'){
	            if(this.collectDroppedResource() == ERR_NOT_FOUND){
    	            //let sourceContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source');
    	            let sourceContainers = util.gatherObjectsInArray(this.room.containers,'source');
    	            //let mineralContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'mineral');
    	            let mineralContainers = util.gatherObjectsInArray(this.room.containers,'mineral');
    	            //let targetLabs = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].labs,'target');
    	            let targetLabs = util.gatherObjectsInArray(this.room.labs,'target');
    	            let storageLink = undefined;
    	            if(!toFillUpgraderLinks.length){
    	                //If no upgrader containers have to be filled, storage link can be emptied
    	                //storageLink = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'storage');
    	                storageLink = util.gatherObjectsInArray(this.room.links,'storage');
    	            }
    	            else {storageLink = []}
    	            //let containers = sourceContainers.concat(storageLink, mineralContainers);
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
                        this.supplyLabs();
    	            }
	            }	                
            }
            else if(this.memory.role == 'courier'){
                if(this.completeOrders() == ERR_NOT_FOUND){
                    if(this.collectDroppedResource() == ERR_NOT_FOUND){
        	            //let sourceContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source');
        	            let sourceContainers = util.gatherObjectsInArray(this.room.containers,'source');
        	            //let mineralContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'mineral');
        	            let mineralContainers = util.gatherObjectsInArray(this.room.containers,'mineral');
        	            //let targetLabs = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].labs,'target');
        	            let targetLabs = util.gatherObjectsInArray(this.room.labs,'target');
        	            let storageLink = undefined;
        	            if(!toFillUpgraderLinks.length){
        	                //If no upgrader containers have to be filled, storage link can be emptied
        	                //storageLink = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'storage');
        	                storageLink = util.gatherObjectsInArray(this.room.links,'storage');
        	            }
        	            else {storageLink = []}
        	            //let containers = sourceContainers.concat(storageLink, mineralContainers);
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
                    }
                }
            }
            else if(this.memory.role == 'labWorker'){
                if(this.supplyLabs() == ERR_NOT_FOUND){
    	            //let sourceContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source');
    	            let sourceContainers = util.gatherObjectsInArray(this.room.containers,'source');
    	            //let mineralContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'mineral');
    	            let mineralContainers = util.gatherObjectsInArray(this.room.containers,'mineral');
    	            //let targetLabs = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].labs,'target');
    	            let targetLabs = util.gatherObjectsInArray(this.room.labs,'target');
    	            let storageLink = undefined;
    	            if(!toFillUpgraderLinks.length){
    	                //If no upgrader containers have to be filled, storage link can be emptied
    	                //storageLink = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'storage');
    	                storageLink = util.gatherObjectsInArray(this.room.links,'storage');
    	            }
    	            else {storageLink = []}
    	            //let containers = sourceContainers.concat(storageLink, mineralContainers);
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
                        this.completeOrders();
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
	                    //toFillStorageLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'storage').filter((link) => {return link.energy < Math.pow(1-LINK_LOSS_RATIO,2) * link.energyCapacity});
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
                //Fill storage link if necessary. It will then link to upgrader link.
                let toFillStorageLinks = [];
                if(toFillUpgraderLinks.length){
                    //toFillStorageLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'storage').filter((link) => {return link.energy < Math.pow(1-LINK_LOSS_RATIO,2) * link.energyCapacity});
                    toFillStorageLinks = util.gatherObjectsInArray(this.room.links,'storage').filter((link) => link.energy < Math.pow(1-LINK_LOSS_RATIO,2) * link.energyCapacity);
                    //console.log('Storage links: ' + toFillStorageLinks);
                }
                if(this.transferResources(toFillStorageLinks,RESOURCE_ENERGY) == ERR_NOT_FOUND){
	                //Fill upgrader containers
	                //let targetUpgraderContainer = findNotFilledContainerForCreep(this,util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'upgrader'),1,2);
	                let targetUpgraderContainer = findNotFilledContainerForCreep(this,util.gatherObjectsInArray(this.room.containers,'upgrader'),1,2);
	                //console.log(this.name + ' upgradercontainer ' + targetUpgraderContainer);
	                if(targetUpgraderContainer != ERR_NOT_FOUND){
	                    if(this.fillContainer(targetUpgraderContainer) != OK){
	                        this.memory.targetContainer = targetUpgraderContainer.id;
	                    }
	                }
	                else {
	                    //Fill towers
	                    //let towers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].structures,STRUCTURE_TOWER);
	                    let towers = util.gatherObjectsInArray(this.room.structures,STRUCTURE_TOWER);
	                    let targetTower = findNotFilledContainerForCreep(this,towers,0,1);
	                    //console.log(this.name + ' targetTower ' + targetTower);
	                    if(targetTower != ERR_NOT_FOUND){
	                        if(this.fillTower(targetTower) != OK){
	                            this.memory.targetContainer = targetTower.id;
	                        }
	                    }
	                    else {
            	            //let sourceContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'source');
            	            let sourceContainers = util.gatherObjectsInArray(this.room.containers,'source');
            	            //let mineralContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].containers,'mineral');
            	            let mineralContainers = util.gatherObjectsInArray(this.room.containers,'mineral');
            	            let storageLink = undefined;
            	            if(!toFillUpgraderLinks.length){
            	                //If no upgrader containers have to be filled, storage link can be emptied
            	                //storageLink = util.gatherObjectsInArrayFromIds(roomObjects[this.room.name].links,'storage');
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
            if(!Game.rooms[this.memory.targetRoom]){
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
                let droppedInRoom = util.gatherObjectsInArrayFromIds(roomObjects[this.targetRooms[i]],'dropped').filter((rs) => {
                    let resourceHarvestPower = HARVEST_POWER;
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
                let filledContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.targetRooms[i]].containers,'source','mineral').filter((cont) => {return _.sum(cont.store) >= this.carryCapacity - _.sum(this.carry)});
                filledSourceContainers = filledSourceContainers.concat(filledContainers);
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
                    allSourceContainers = allSourceContainers.concat(util.getArrayObjectsById(roomObjects[this.targetRooms[i]].containers.source));
                }
            }
            notTargetedContainers = util.findArrayOfDifferentElements(allSourceContainers,targetedContainers);
            target = util.findExtremum(notTargetedContainers,(c1,c2) => _.sum(c1.store) > _.sum(c2.store));
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
            }
        }
    }
    else {
        this.memory.getting = false;
        //console.log(this.name);
        if(_.sum(this.carry) > this.carry.energy){
            //Carrying mineral -> put in storage
            let storageContainer = Game.rooms[this.memory.origin].storage;
            if(this.transferResources(storageContainer) != ERR_NOT_FOUND){
                return;
            }
        }
        let avContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.memory.origin].containers,'source','spawn','storage').filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
        let avUpgraderContainers = util.gatherObjectsInArrayFromIds(roomObjects[this.memory.origin].containers,'upgrader').filter((cont) => {return cont.storeCapacity - _.sum(cont.store) >= this.carry.energy})
        let avLinks = util.gatherObjectsInArrayFromIds(roomObjects[this.memory.origin].links,'source','spawn').filter((link) => {return link.energy < link.energyCapacity});;
        let targets = avLinks.concat(avUpgraderContainers,avContainers);
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
        //if(this.name == 'Scarlett'){console.log(this.name + ' rtn ' + rtn + ' room ' + this.room.name + ' origin ' + this.memory.origin)}
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
    let criticalRepairs = [];
    let darkRooms = [];
    for(let i=0; i<this.targetRooms.length; i++){
        if(Game.rooms[this.targetRooms[i]] != undefined){
            let room = Game.rooms[this.targetRooms[i]];
            let dmgStructRoom = util.getArrayObjectsById(room.memory.dmgStructures);
            dmgStructures = dmgStructures.concat(dmgStructRoom);
            criticalRepairs = criticalRepairs.concat(util.getArrayObjectsById(room.memory.criticalRepairs));
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
        //if(this.name == 'Scarlett'){console.log(this.name)}
        let rtn = this.collectDroppedResource(RESOURCE_ENERGY);
        //if(this.name == 'Scarlett'){console.log(this.name + ' getDropped ' + rtn)}
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
        if(this.repairStructure(1,criticalRepairs) == ERR_NOT_FOUND){
            if(this.repairStructure(1,dmgStructures) == ERR_NOT_FOUND){
                //console.log(this.name,'doing build');
                this.creepBuild();
            }            
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
                if(room.controller && room.controller.owner && room.controller.owner.username == 'Vervust'){
                    this.memory.controllerRoom = room.name;
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
        if(Game.rooms[controllerRoom] != undefined){
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
            if(Game.rooms[this.targetRooms[i]] != undefined){
                if(Game.rooms[this.targetRooms[i]].controller && Game.rooms[this.targetRooms[i]].controller.owner == undefined){
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
        //console.log(this.name + ' in room');
        if(!Memory.rooms[attackedRoom].defense.underAttack){
            if(this.healOther() == ERR_NOT_FOUND){
                console.log(this.memory.role + ' creep ' + this.name + ' its room ' + attackedRoom + ' is no longer under attack. Moving to different room.');
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
                    this.memory.targetRoom = this.targetRooms[i];
                    found = true;
                }
            }
            else if(!Game.rooms[this.targetRooms[i]]){
                darkRooms.push(this.targetRooms[i]);
            }
        }
        if(!found){
            if(attackedRoom){
                this.memory.targetRoom = attackedRoom;
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
        //Go to attacked room, use specified path if present (path is an array of roomNames)
        if(presetPath && presetPath[this.memory.type] && presetPath[this.memory.type][this.memory.origin]){
            //Walk via preset path
            let index = presetPath[this.memory.type][this.memory.origin].indexOf(this.room.name);
            if(index == -1){
                //Find closest room in array
                console.log(this.name + ' diverged form path');
                this.moveToRoom(util.findClosestRoomByRange(this.room.name,presetPath[this.memory.type][this.memory.origin]));
                this.stationaryCombat();
                return;
            }
            else {
                //continue to next room
                console.log(this.name + ' going to next room in preset ' + presetPath[this.memory.type][this.memory.origin][index+1]);
                this.moveToRoom(presetPath[this.memory.type][this.memory.origin][index+1]);
                this.stationaryCombat();
                return;
            }
            
        }
    }
    
    let room = Game.rooms[attackedRoom];
    //console.log('Room ' + room);
    if(!room){
        if(attackedRoom){
            //console.log(this.name + ' Going to attacked room');
            this.moveToRoom(attackedRoom);
            this.stationaryCombat();            
        }
        return;
    }
    
    if(room.controller && room.controller.owner && room.controller.owner.username == 'Vervust'){
        //Main room is under attack
        if(!this.room.memory.defense.breached){
            //console.log(this.name + ' not breached');
            let rampart = [];
            if(this.memory.rampart){
                let creepRampart = Game.getObjectById(this.memory.rampart);
                if(creepRampart){
                    rampart.push(creepRampart)
                    
                }
                else {
                    delete creep.memory.rampart;
                    this.stationaryCombat();
                    return;
                }                
            }
            else {
                let ramparts = roomObjects[room.name].ramparts;
                //console.log('Roomobj ' + JSON.stringify(roomObjects[room.name].ramparts));
                let targetRamparts = undefined;
                if(this.getActiveBodyparts(ATTACK)){
                    targetRamparts = util.gatherObjectsInArrayFromIds(ramparts,'melee');
                }
                else if(this.getActiveBodyparts(RANGED_ATTACK)){
                    targetRamparts = util.gatherObjectsInArrayFromIds(ramparts,'ranged');
                }
                else {
                    targetRamparts = [];
                }
                let occupiedRamparts = util.targetObjectsOfCreeps('rampart',room);
                let target = util.findDifferentElement(targetRamparts, occupiedRamparts);
                //console.log(this.name + ' targets ' + targetRamparts + ' occupied ' + occupiedRamparts);
                if(target != ERR_NOT_FOUND){
                    rampart.push(target);
                    this.memory.rampart = target.id;
                }
                else if(targetRamparts.length){
                    //straight up attack
                    //TODO: Make them attack in pacs
                    let healers = util.gatherObjectsInArrayFromIds(roomObjects[room.name].hostiles,'heal','meleeHeal','rangedHeal','hybrid');
                    if(this.combat(healers) == ERR_NOT_FOUND){
                        let otherHostiles = util.gatherObjectsInArrayFromIds(roomObjects[room.name].hostiles,'melee','ranged','meleeRanged','hybrid','claim');
                        this.combat(otherHostiles);
                    }                      
                }
                else {
                    //Walls are not under attack, wait inside walls
                    //TODO: still attack if opponents don't pose a treath (e.g) only dismantler and healer
                }
            }
            
            if(roomObjects[room.name].hostiles[ATTACK] == 0 && roomObjects[room.name].hostiles[RANGED_ATTACK] == 0){
                //Hostiles can't do damage -> go out and attack them
                let healers = util.gatherObjectsInArrayFromIds(roomObjects[room.name].hostiles,'heal','meleeHeal','rangedHeal','hybrid');
                if(this.combat(healers) == ERR_NOT_FOUND){
                    let otherHostiles = util.gatherObjectsInArrayFromIds(roomObjects[room.name].hostiles,'melee','ranged','meleeRanged','hybrid','claim');
                    this.combat(otherHostiles);
                }                  
            }
            else if(this.occupyRampart(rampart) == OK){
                this.stationaryCombat();
                let healers = util.gatherObjectsInArrayFromIds(roomObjects[room.name].hostiles,'heal','meleeHeal','rangedHeal','hybrid');
                if(this.stationaryCombat(healers) == ERR_NOT_FOUND){
                    let otherHostiles = util.gatherObjectsInArrayFromIds(roomObjects[room.name].hostiles,'melee','ranged','meleeRanged','hybrid','claim');
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
            let healers = util.gatherObjectsInArrayFromIds(roomObjects[room.name].hostiles,'heal','meleeHeal','rangedHeal','hybrid');
            if(this.combat(healers) == ERR_NOT_FOUND){
                let otherHostiles = util.gatherObjectsInArrayFromIds(roomObjects[room.name].hostiles,'melee','ranged','meleeRanged','hybrid','claim');
                if(this.combat(otherHostiles) == ERR_NOT_FOUND){
                    let nonLethalHostiles = util.gatherObjectsInArrayFromIds(roomObjects[room.name].hostiles,'other');
                    this.combat(nonLethalHostiles);
                }
            }            
        }
    }
    else {
        //Remote room is under attack
        let healers = util.gatherObjectsInArrayFromIds(roomObjects[room.name].hostiles,'heal','meleeHeal','rangedHeal','hybrid');
        if(this.combat(healers) == ERR_NOT_FOUND){
            let otherHostiles = util.gatherObjectsInArrayFromIds(roomObjects[room.name].hostiles,'melee','ranged','meleeRanged','hybrid','claim');
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
    
    if(this.memory.harvesting && _.sum(this.carry) == this.carryCapacity){
        this.memory.harvesting = false;
    }
    if(!this.memory.harvesting && _.sum(this.carry) == 0){
        this.memory.harvesting = true;
    }
    if(this.memory.harvesting && this.memory.source){
        let source = Game.getObjectById(this.memory.source);
        if(source && source.energy == 0){
            this.memory.harvesting = false;
        }
    }
    
    if(remoteRooms && remoteRooms['explorer'] && remoteRooms['explorer'][this.memory.starterRoom]){
        this.targetRooms = this.targetRooms.concat(remoteRooms['explorer'][this.memory.starterRoom]);
    }
    
    if(this.memory.harvesting){
        this.creepHarvest();
    }
    else if(Game.rooms[this.memory.starterRoom].controller.ticksToDowngrade < 5000){
        //Don't let controller downgrade
        this.creepUpgrader();
    }
    else if(this.fillTower() == ERR_NOT_FOUND){
        let dmgStructures = [];
        let criticalRepairs = [];
        for(let i=0; i<this.targetRooms.length; i++){
            if(Game.rooms[this.targetRooms[i]] != undefined){
                let room = Game.rooms[this.targetRooms[i]];
                let dmgStructRoom = util.getArrayObjectsById(room.memory.dmgStructures);
                dmgStructures = dmgStructures.concat(dmgStructRoom);
                criticalRepairs = criticalRepairs.concat(util.getArrayObjectsById(room.memory.criticalRepairs));
            }
        }
        if(this.repairStructure(1,criticalRepairs) == ERR_NOT_FOUND){
            if(this.repairStructure(1,dmgStructures) == ERR_NOT_FOUND){
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
                if(this.buildStructure(explorerSites) == ERR_NOT_FOUND){
                    this.creepUpgrader();
                }
            }             
        }
    }
    
};