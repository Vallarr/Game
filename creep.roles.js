/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('creep.roles');
 * mod.thing == 'a thing'; // true
 */
 
var creepActions = require('creep.actions');
var util = require('utilities');

var Roles = {
    /** @param {Creep} creep **/
	creepHarvest: function(creep,exploreRooms){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
        let targetRooms = undefined
        if(exploreRooms == undefined){
            targetRooms = [creep.memory.origin];
        }
        else if(exploreRooms[creep.memory.origin] == undefined || !exploreRooms[creep.memory.origin].length){
            console.log('No target rooms specified for ' + creep.memory.role + ' ' + creep.memory.type + ' ' + creep.name + ' of room ' + creep.memory.origin);
            return;            
        }
        else {
            targetRooms = exploreRooms[creep.memory.origin];
        }
        
        //Get creeps dedicate source
        let source = [];
        let sourceContainer = undefined;
        if(creep.memory.source){
            //Get source from memory
            if(Game.rooms[creep.memory.sourceRoom] != undefined){
                source.push(Game.getObjectById(creep.memory.source));
                if(creep.memory.sourceContainer){
                    sourceContainer = util.gatherObjectsInArrayFromIds(creep.memory,'sourceContainer');
                    if(!sourceContainer.length){delete creep.memory.sourceContainer} //This container no longer exists
                }
                else {
                    sourceContainer = util.targetsInRange(util.gatherObjectsInArrayFromIds(creep.room.memory.links,'source').concat(util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'source')),source,2);
                    if(!sourceContainer.length){
                        let containersToBeBuild = creep.room.find(FIND_CONSTRUCTION_SITES, {filter: (site) => {return site.structureType == STRUCTURE_CONTAINER || site.structureType == STRUCTURE_LINK}});
                        sourceContainer = util.targetsInRange(containersToBeBuild,source,2);
                    }
                    creep.memory.sourceContainer = util.gatherIdsInArrayFromObjects(sourceContainer); 
                }
            }
            else {
                activeCreep.moveToRoom(creep.memory.sourceRoom);
                return;                
            }
        }
        else {
            //Search for source and store in memory
            let foundSource = false;
            let darkRooms = [];
            let roomSources = [];
            let occupiedSources = util.targetObjectsOfCreeps('source'); //If this takes a lot of time, can detect setllers and only search their origin room for ocuppied sources.
            for(let i=0; i<targetRooms.length; i++){
                if(Game.rooms[targetRooms[i]] != undefined){
                    roomSources = roomSources.concat(util.gatherObjectsInArrayFromIds(Game.rooms[targetRooms[i]].memory.sources,'energy'));
                }
                else {
                    darkRooms.push(targetRooms[i]);
                }
            }
            let target = undefined;
            while(!foundSource){
                target = util.findDifferentElement(roomSources,occupiedSources);
                //console.log(creep.name + ' found target ' + target + ' from ' + roomSources + ' with occupied ' + occupiedSources);
                if(target != ERR_NOT_FOUND){
                    source.push(target);
                    creep.memory.source = target.id;
                    creep.memory.sourceRoom = target.pos.roomName;
                    foundSource = true;
                }
                if(!foundSource){
                    if(darkRooms.length){
                        activeCreep.moveToRoom(darkRooms[0]);
                        return;                        
                    }
                    else {
                        occupiedSources = util.findDubbles(occupiedSources);
                        //console.log(creep.name + ' found no source in rooms ' + targetRooms + '. Trying again ' + ' Ocuppied ' + occupiedSources);                        
                    }
                }
            }
        }
        
        if(creep.carry.energy == creep.carryCapacity){
            let rtn = activeCreep.fillContainer(sourceContainer);
            if(rtn == OK){
                activeCreep.harvestSource(source);
            }
            else if(rtn == ERR_NOT_FOUND){
                //activeCreep.dropAll();
            }
            else if(rtn == ERR_INVALID_TARGET){
                activeCreep.buildStructure(sourceContainer);
            }
            else if(rtn == ERR_FULL){
                if(sourceContainer[0].hits < sourceContainer[0].hitsMax){
                    activeCreep.repairStructure(1,sourceContainer);
                }
                else {
                    //activeCreep.dropAll();
                }
            }
        }
        else {
            activeCreep.harvestSource(source);
        }
        
	},	
	creepDedicatedMiner: function(creep){
	    let activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
        if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }               
        
        let mineralSource = [];
        let extractor = [];
        if(creep.memory.mineralSource && creep.memory.extractor){
            //console.log('Get mineral source');
            mineralSource.push(Game.getObjectById(creep.memory.mineralSource));
            extractor.push(Game.getObjectById(creep.memory.extractor));
            //console.log('Mineral ' + mineralSource + ' extractor ' + extractor);
        }
        else {
            //Always max 1 source and 1 extractor per room
            mineralSource = creep.room.find(FIND_MINERALS);
            creep.memory.mineralSource = mineralSource[0].id;
            extractor = creep.room.find(FIND_STRUCTURES, {filter: (struct) => {return struct.structureType == STRUCTURE_EXTRACTOR}});
            if(extractor.length){
                creep.memory.extractor = extractor[0].id;
            }
            else {
                console.log(creep.role + ' ' + creep.name + ' cannot mine minerals, because there is no extractor');
            }
        }
        if(mineralSource[0].mineralAmount > 0){
            //console.log('Mineral present');
            if(_.sum(creep.carry) == creep.carryCapacity){
                let mineralContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'mineral','storage').filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
                let rtn = activeCreep.transferResources(mineralContainers);
                if(rtn == OK && !extractor[0].cooldown){
                    activeCreep.harvestSource(mineralSource);
                }
                else if(rtn == ERR_NOT_FOUND){
                    creep.say('Store full');
                }
            }
            else if(!extractor[0].cooldown){
                //console.log(creep.name + ' harvest mineral');
                activeCreep.harvestSource(mineralSource);
            }            
        }
        else if(creep.carry[mineralSource[0].mineralType] > 0){
            //Store resources
            let mineralContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'mineral','storage').filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
            if(activeCreep.transferResources(mineralContainers) == ERR_NOT_FOUND){
                creep.say('Store full');
            }
        }
        else if(creep.room.controller && creep.room.controller.owner && creep.room.controller.owner == 'Vervust' && creep.room.controller.level < 8){
            Roles.creepExplorerUpgrader(creep);
        }
        else {
            Roles.creepExplorerRepair(creep);
        }
	},
	creepDedicatedTransporter: function(creep){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
        if(!(creep.room.name == creep.memory.origin)){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }
        
        if(creep.memory.collecting && _.sum(creep.carry) == creep.carryCapacity){
            creep.memory.collecting = false;
        }
        if(!creep.memory.collecting && _.sum(creep.carry) == 0){
            creep.memory.collecting = true;
        }
        
        if(creep.memory.getting){
            if(creep.memory.getDropped) {
                let resource = Game.getObjectById(creep.memory.getDropped);
                if(resource && activeCreep.collectDroppedResource(resource.resourceType,resource) !=1){
                    delete creep.memory.getDropped;
                }
                else if(!resource){
                    delete creep.memory.getDropped;
                }
                return;
            }
            else if(creep.memory.targetContainer) {
                let targetContainer = Game.getObjectById(creep.memory.targetContainer);
                if(targetContainer && activeCreep.withdrawResource(targetContainer) != 1){
                    delete creep.memory.targetContainer;
                }
                else if(!targetContainer){
                    delete creep.memory.targetContainer;
                }
                return;
            }
        }
        else if(creep.memory.targetContainer){
            let targetContainer = Game.getObjectById(creep.memory.targetContainer);
            if(targetContainer && activeCreep.transferResources(targetContainer) != 1){
                delete creep.memory.targetContainer;
            }
            else if(!targetContainer){
                delete creep.memory.targetContainer;
            }
            return;
        }
        
	    let toFillUpgraderLinks = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'upgrader').filter((link) => {return link.energy == 0});
	    
        //If creep is carrying mineral, store these first
        let storing = false;
        if(_.sum(creep.carry) > creep.carry.energy && (!creep.memory.targetContainer || creep.memory.targetContainer != creep.room.terminal.id)){
            //console.log(creep.name + ' storing resource');
            let notFullStorageContainer = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'storage').filter((stor) => {return _.sum(stor.store) < stor.storeCapacity});
            if(activeCreep.fillStorage(notFullStorageContainer) == ERR_NOT_FOUND){
                creep.say('Store full');
                //activeCreep.dropAllBut(RESOURCE_ENERGY);
            }
            else {
                storing = true;
            }
        }
	    //Filling spawns and extensions is a priority
        let fillSpawn = creep.room.memory.energy.fillSpawn;
        let filling = false;
	    if(!storing && ((fillSpawn && creep.memory.role == 'filler') || (creep.room.memory.defense.underAttack && creep.memory.role == 'transporter'))){
	        //Here creep needs to transfer any energy it has to spawn or tower, so no creep.memory.collecting check
	        //console.log(creep.name + ' fillspawn or underAttack ' + creep.memory.role);
	        if(creep.carry.energy == 0){
	            //Get energy
	            let sourceLinks = util.gatherObjectsInArrayFromIds(creep.memory.links,'source');
                let storageLink = undefined;
                if(!toFillUpgraderLinks.length){
                    storageLink = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'storage');	                    
                }
                else {storageLink = []}
	            let containers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'spawn','source','storage');
	            let LinksAndContainers = sourceLinks.concat(storageLink,containers);
	            let target = findFilledContainerForCreep(creep,LinksAndContainers,0,2);
	            if(target != ERR_NOT_FOUND && activeCreep.harvestContainer(target) != OK){
                    creep.memory.targetContainer = target.id;
                    creep.memory.getting = true;
	            }
	        }
	        else if (fillSpawn && creep.memory.role == 'filler'){
	            creep.memory.getting = false;
	            //Fill spawns and extensions
	            if(activeCreep.fillSpawn() != ERR_NOT_FOUND){
	                filling = true;
	            }
	        }
	        else if(creep.room.memory.defense.underAttack && creep.memory.role == 'transporter'){
	            creep.memory.getting = false;
	            //Fill towers
                let towers = util.gatherObjectsInArrayFromIds(creep.room.memory.defense,'tower');
                let targetTower = findNotFilledContainerForCreep(creep,towers,0,1);	            
	            if(targetTower != ERR_NOT_FOUND){
                    if(activeCreep.fillTower(targetTower) != OK){
                        creep.memory.targetContainer = targetTower.id;
                    }	                
	                filling = true;
	            }
	        }
	    }
	    if(!filling && !storing) {
	        //console.log(creep.name + 'doing extras');
	        let toFillSpawnContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'spawn').filter(function(container){return _.sum(container.store) < container.storeCapacity});
	        let toFillUpgraderContainers = findNotFilledContainerForCreep(creep,util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'upgrader'),1,2);
	        if(toFillUpgraderContainers != ERR_NOT_FOUND){
	            toFillUpgraderContainers = [toFillUpgraderContainers];
	        }
	        else {
	            toFillUpgraderContainers = [];
	        }
	        //console.log(creep.name + ' to fill upgrader containers ' + toFillUpgraderContainers);
	        if(creep.carry.energy == 0){
	            //Empty the source containers
	            if(creep.memory.role == 'filler'){
    	            let storageLink = undefined;
    	            if(!toFillUpgraderLinks.length){
    	                //If no upgrader containers have to be filled, storage link can be emptied
    	                storageLink = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'storage');
    	            }
    	            else {storageLink = []}
    	            let target = findFilledContainerForCreep(creep,storageLink,1,2);
    	            if(target != ERR_NOT_FOUND){
    	                if(activeCreep.harvestContainer(target) != OK){
    	                    creep.memory.targetContainer = target.id;
    	                    creep.memory.getting = true;
    	                }
    	            }
    	            else if(toFillSpawnContainers.length || toFillUpgraderLinks.length){
    	                if(activeCreep.harvestStorage() == ERR_NOT_FOUND){
        	                let container = findFilledContainerForCreep(creep,util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'source'),1,2);
        	                if(container != ERR_NOT_FOUND){
        	                    activeCreep.harvestContainer(container);
        	                }
    	                }
    	            }
    	            else {
    	                activeCreep.completeOrders();
    	            }
	                
	            }
	            else if(creep.memory.role == 'transporter'){
    	            if(activeCreep.collectDroppedResource() == ERR_NOT_FOUND){
        	            let sourceContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'source');
        	            let mineralContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'mineral');
        	            let storageLink = undefined;
        	            if(!toFillUpgraderLinks.length){
        	                //If no upgrader containers have to be filled, storage link can be emptied
        	                storageLink = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'storage');
        	            }
        	            else {storageLink = []}
        	            let containers = sourceContainers.concat(storageLink, mineralContainers);
        	            let target = findFilledContainerForCreep(creep,containers,1,2);
        	            if(target != ERR_NOT_FOUND){
        	                if(activeCreep.withdrawResource(target) != OK){
        	                    creep.memory.targetContainer = target.id;
        	                    creep.memory.getting = true;
        	                }
        	            }
        	            else if(toFillUpgraderContainers.length || toFillUpgraderLinks.length){
        	                activeCreep.harvestStorage()
        	            }
        	            else {
        	                activeCreep.completeOrders();
        	            }
    	            }	                
	            }
	        }
	        else {
	            creep.memory.getting = false;
	            if(creep.memory.role == 'filler'){
	                //Fill spawn containers
    	            if(activeCreep.fillContainer(toFillSpawnContainers) == ERR_NOT_FOUND){
    	                //Fill storage link if necessary. It will then link to upgrader link.
    	                let toFillStorageLinks = [];
    	                if(toFillUpgraderLinks.length){
    	                    toFillStorageLinks = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'storage').filter((link) => {return link.energy < Math.pow(1-LINK_LOSS_RATIO,2) * link.energyCapacity});
    	                    //console.log('Storage links: ' + toFillStorageLinks);
    	                }
    	                if(activeCreep.transferResources(toFillStorageLinks,RESOURCE_ENERGY) == ERR_NOT_FOUND){
    	                    activeCreep.fillStorage();
    	                }
    	            }	                
	            }
	            else if(creep.memory.role == 'transporter'){
	                //Fill storage link if necessary. It will then link to upgrader link.
	                let toFillStorageLinks = [];
	                if(toFillUpgraderLinks.length){
	                    toFillStorageLinks = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'storage').filter((link) => {return link.energy < Math.pow(1-LINK_LOSS_RATIO,2) * link.energyCapacity});
	                    //console.log('Storage links: ' + toFillStorageLinks);
	                }
	                if(activeCreep.transferResources(toFillStorageLinks,RESOURCE_ENERGY) == ERR_NOT_FOUND){
    	                //Fill upgrader containers
    	                let targetUpgraderContainer = findNotFilledContainerForCreep(creep,util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'upgrader'),1,2);
    	                //console.log(creep.name + ' upgradercontainer ' + targetUpgraderContainer);
    	                if(targetUpgraderContainer != ERR_NOT_FOUND){
    	                    if(activeCreep.fillContainer(targetUpgraderContainer) != OK){
    	                        creep.memory.targetContainer = targetUpgraderContainer.id;
    	                    }
    	                }
    	                else {
    	                    //Fill towers
    	                    let towers = util.gatherObjectsInArrayFromIds(creep.room.memory.defense,'tower');
    	                    let targetTower = findNotFilledContainerForCreep(creep,towers,0,1);
    	                    if(targetTower != ERR_NOT_FOUND){
    	                        if(activeCreep.fillTower(targetTower) != OK){
    	                            creep.memory.targetContainer = targetTower.id;
    	                        }
    	                    }
    	                    else if(activeCreep.fillStorage() == ERR_NOT_FOUND){
    	                        creep.say('Store full');
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
	        let targetContainer = ERR_NOT_FOUND;
	        if(notTargetedFilledContainers.length){
	            targetContainer = creep.pos.findClosestByRange(notTargetedFilledContainers);
	        }
	        return targetContainer;
	    }
	},
	creepExplorerTransporter: function(creep,exploreRooms){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }	   
        var orRoom = creep.memory.origin;
        //console.log(orRoom);
        if(exploreRooms == undefined || exploreRooms[orRoom] == undefined || !exploreRooms[orRoom].length){
            console.log('No target rooms specified for' + creep.memory.role + ' explorer ' + creep.name + ' of room ' + creep.memory.origin);
            return;
        }
        var targetRooms = exploreRooms[orRoom];
        
        if(creep.memory.collecting && _.sum(creep.carry) == creep.carryCapacity){
            creep.memory.collecting = false;
        }
        if(!creep.memory.collecting && _.sum(creep.carry) == 0){
            creep.memory.collecting = true;
        }
        
        if(creep.memory.getting){
            if(creep.memory.getDropped) {
                let resource = Game.getObjectById(creep.memory.getDropped);
                /*if(resource){
                    console.log(creep.name + ' getting dropped ' + resource + ' ' + activeCreep.collectDroppedResource(resource.resourceType,resource));
                }*/
                if(resource && activeCreep.collectDroppedResource(resource.resourceType,resource) !=1){
                    delete creep.memory.getDropped;
                }
                else if(!resource){
                    delete creep.memory.getDropped;
                }
                
                return;
            }
            else if(creep.memory.targetContainer) {
                if(!Game.rooms[creep.memory.targetRoom]){
                    activeCreep.moveToRoom(creep.memory.targetRoom);
                }
                else {
                    let targetContainer = Game.getObjectById(creep.memory.targetContainer);
                    /*if(targetContainer){
                        console.log(creep.name + ' getting from  ' + targetContainer + ' ' + activeCreep.harvestContainer(targetContainer));
                    }*/
                    if(targetContainer && activeCreep.harvestContainer(targetContainer) != 1){
                        delete creep.memory.targetContainer;
                    }
                    else if(!targetContainer){
                        delete creep.memory.targetContainer;
                    }
                }
                return;
            }
        }
        
        if(creep.memory.collecting){
            let droppedResources = util.gatherObjectsInArrayFromIds(creep.room.memory,'dropped').filter((rs) => {
                let resourceHarvestPower = HARVEST_POWER;
                if(rs.resourceType != RESOURCE_ENERGY){
                    resourceHarvestPower = HARVEST_MINERAL_POWER;
                }
                return rs.amount > Math.max(5,creep.body.filter((bP) => {return bP.type == WORK}).length) * resourceHarvestPower * Math.ceil(Math.sqrt(Math.pow(creep.pos.x-rs.pos.x,2) + Math.pow(creep.pos.y-rs.pos.y,2)));
            });
            let notTargetedResources = undefined;
            if(droppedResources.length) {
                let targetedDroppedResources = util.targetObjectsOfCreeps('getDropped',creep.room);
                notTargetedResources = util.findArrayOfDifferentElements(droppedResources,targetedDroppedResources);
            }
            else {
                notTargetedResources = [];
            }
            //console.log(creep.name + ' in room ' + creep.room.name + ' found dropped resources ' + droppedResources + '. not targeted ' + notTargetedResources);
            let filledSourceContainers = [];
            let darkRooms = [];
            for(let i=0; i<targetRooms.length; i++){
                if(!(Game.rooms[targetRooms[i]] == undefined)){
                    let filledContainers = util.gatherObjectsInArrayFromIds(Game.rooms[targetRooms[i]].memory.containers,'source').filter((cont) => {return _.sum(cont.store) >= creep.carryCapacity - _.sum(creep.carry)});
                    filledSourceContainers = filledSourceContainers.concat(filledContainers);
                }
                else {
                    darkRooms.push(targetRooms[i]);
                }
            }
            let targetedContainers = util.targetObjectsOfCreeps('targetContainer');
            //console.log(creep.name + ' filled ' + filledSourceContainers +' targeted '+ targetedContainers);
            let notTargetedContainers = util.findArrayOfDifferentElements(filledSourceContainers,targetedContainers);
            filledSourceContainers = filledSourceContainers.filter((cont) => {return _.sum(cont.store) >= 2*creep.carryCapacity - _.sum(creep.carry)});
            let dubbleTargetedContainers = util.findDubbles(targetedContainers);
            //console.log(creep.name + 'dubble filled ' + filledSourceContainers + ' dubble targeted ' + dubbleTargetedContainers);
            notTargetedContainers = notTargetedContainers.concat(util.findArrayOfDifferentElements(filledSourceContainers,dubbleTargetedContainers));
            //console.log(creep.name + ' not targeted ' + notTargetedContainers);
            //console.log(creep.name + ' targets to pick from ' + notTargetedResources.concat(notTargetedContainers));
            let target = util.findClosestByRange(creep,notTargetedResources.concat(notTargetedContainers))
            //console.log(creep.name + ' target ' + target);
            
            if(target){
                creep.memory.getting = true;
                creep.memory.targetRoom = target.pos.roomName;
                if(target.structureType){
                    creep.memory.targetContainer = target.id;
                }
                else if(target.resourceType){
                    creep.memory.getDropped = target.id;
                }
            }
            else if(darkRooms.length){
                activeCreep.moveToRoom(darkRooms[0]);
                return;
            }
            else if(targetRooms.length){
                activeCreep.moveToRoom(targetRooms[0]);
                return;
            }
        }
        else {
            creep.memory.getting = false;
            //console.log(creep.name);
            let room = Game.rooms[orRoom];
            let avContainers = util.gatherObjectsInArrayFromIds(room.memory.containers,'source','spawn','storage').filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
            let avLinks = util.gatherObjectsInArrayFromIds(room.memory.links,'source','spawn').filter((link) => {return link.energy < link.energyCapacity});;
            let targets = avContainers.concat(avLinks);
            if(activeCreep.transferResources(targets) == ERR_NOT_FOUND){
                creep.say('Store full');
            }
        }
        
	},
	creepExplorerBuild: function(creep,exploreRooms,activeCreep){
	    if(activeCreep == undefined){
	        activeCreep = new creepActions(creep);
	    }
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
        let targetRooms = undefined;
        if(exploreRooms == undefined){
            targetRooms = [creep.memory.origin];
        }
        else if(exploreRooms[creep.memory.origin] == undefined || !exploreRooms[creep.memory.origin].length){
            console.log('No target rooms specified for ' + creep.memory.role + ' ' + creep.memory.type + ' ' + creep.name + ' of room ' + creep.memory.origin);
            return;            
        }
        else {
            targetRooms = exploreRooms[creep.memory.origin];
        }

        let explorerSites = [];
        for(let site in Game.constructionSites){
            let roomName = Game.constructionSites[site].pos.roomName;
            for(let i=0; i<targetRooms.length; i++){
                if(targetRooms[i] == roomName){
                    explorerSites.push(Game.constructionSites[site]);
                    break;
                }
            }
        }
        //console.log(explorerSites);
        
        if(creep.carry.energy == 0){
            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
            //console.log(creep.name + ' rtn ' + rtn + ' room ' + creep.room.name + ' origin ' + orRoom);;
            if(rtn == ERR_NOT_FOUND){
                let targetContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'source','storage').filter((cont) => {return cont.store.energy > 0});
                let targetLinks = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'source').filter((link) => {return link.energy > 0});
                let targets = targetContainers.concat(targetLinks);
                if(activeCreep.harvestContainer(targets) == ERR_NOT_FOUND){
                    activeCreep.moveToRoom(creep.memory.origin);
                }
            }
        }
        else {
            if(activeCreep.buildStructure(explorerSites) == ERR_NOT_FOUND){
                let dmgStructures = [];
                let darkRooms = [];
                for(let i=0; i<targetRooms.length; i++){
                    if(Game.rooms[targetRooms[i]] != undefined){
                        let room = Game.rooms[targetRooms[i]];
                        let dmgStructRoom = util.getArrayObjectsById(room.memory.dmgStructures);
                        dmgStructures = dmgStructures.concat(dmgStructRoom);
                    }
                    else {
                        darkRooms.push(targetRooms[i]);
                    }
                }
                if(!dmgStructures.length && darkRooms.length){
                    activeCreep.moveToRoom(darkRooms[0]);
                    return;
                } 
                if(activeCreep.repairStructure(1,dmgStructures) == ERR_NOT_FOUND){
                    //TODO: Other task. Go be dedicated builder in origin room
                    if(targetRooms[0] != creep.memory.origin){
                        Roles.creepExplorerBuild(creep)
                    }
                    else if(creep.room.controller && creep.room.controller.owner && creep.room.controller.owner.username == 'Vervust' && creep.room.controller.level < 8){
                        Roles.creepExplorerUpgrader(creep);
                    }
                }
            }
        }
	},
	creepExplorerRepair: function(creep,exploreRooms){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
        let targetRooms = undefined;
        if(exploreRooms == undefined){
            targetRooms = [creep.memory.origin];
        }
        else if(exploreRooms[creep.memory.origin] == undefined || !exploreRooms[creep.memory.origin].length){
            console.log('No target rooms specified for ' + creep.memory.role + ' ' + creep.memory.type + ' ' + creep.name + ' of room ' + creep.memory.origin);
            return;            
        }
        else {
            targetRooms = exploreRooms[creep.memory.origin];
        }
        
        if(creep.carry.energy == 0){
            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
            if(rtn == ERR_NOT_FOUND){
                let targetContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'source','storage').filter((cont) => {return cont.store.energy > 0});
                let targetLinks = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'source').filter((link) => {return link.energy > 0});
                let targets = targetContainers.concat(targetLinks);
                if(activeCreep.harvestContainer(targets) == ERR_NOT_FOUND){
                    activeCreep.moveToRoom(creep.memory.origin);
                }
            }
        }
        else {
            let dmgStructures = [];
            let darkRooms = [];
            for(let i=0; i<targetRooms.length; i++){
                if(!(Game.rooms[targetRooms[i]] == undefined)){
                    let room = Game.rooms[targetRooms[i]];
                    let dmgStructRoom = util.getArrayObjectsById(room.memory.dmgStructures);
                    dmgStructures = dmgStructures.concat(dmgStructRoom);
                }
                else {
                    darkRooms.push(targetRooms[i]);
                }
            }
            if(!dmgStructures.length && darkRooms.length){
                activeCreep.moveToRoom(darkRooms[0]);
                return;
            }      
            if(activeCreep.repairStructure(1,dmgStructures) == ERR_NOT_FOUND){
                Roles.creepExplorerBuild(creep,exploreRooms,activeCreep);
            }
        }
	},
	creepExplorerUpgrader: function(creep,exploreRooms){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }	    
        let targetRooms = undefined
        if(exploreRooms == undefined){
            targetRooms = [creep.memory.origin];
        }
        else if(exploreRooms[creep.memory.origin] == undefined || !exploreRooms[creep.memory.origin].length){
            console.log('No target rooms specified for ' + creep.memory.role + ' ' + creep.memory.type + ' ' + creep.name + ' of room ' + creep.memory.origin);
            return;            
        }
        else {
            targetRooms = exploreRooms[creep.memory.origin];
        }
        
        let controllerRoom = creep.memory.controllerRoom;
        if(!controllerRoom){
            let found = false;
            for(let i=0; i<targetRooms.length && !found; i++){
                if(Game.rooms[targetRooms[i]] != undefined){
                    let room = Game.rooms[targetRooms[i]];
                    if(room.controller.owner && room.controller.owner.username == 'Vervust'){
                        creep.memory.controllerRoom = room.name;
                        found = true;
                    }
                }
            }
            if(!found){
                console.log(creep.role + ' ' + creep.name + ' has no room to upgrade controller');
                //creep.memory.controllerRoom = creep.memory.origin;
            }
        }
        
        if(creep.carry.energy == 0){
            let filledContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'source','upgrader','storage').filter((cont) => {return cont.store.energy > 0});
            let filledLinks = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'source','upgrader').filter((link) => {return link.energy > 0});
            let targets = filledContainers.concat(filledLinks);
            if(activeCreep.harvestContainer(targets) == ERR_NOT_FOUND){
                if(activeCreep.collectDroppedResources(RESOURCE_ENERGY) == ERR_NOT_FOUND){
                    activeCreep.moveToRoom(creep.memory.origin);
                }
            }
        }
        else {
            if(creep.room.name == controllerRoom){
                activeCreep.upgrade();
            }
            else {
                activeCreep.moveToRoom(controllerRoom);
            }
        }
	},
	creepExplorerReserver: function(creep,exploreRooms,claimRooms){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
        var orRoom = creep.memory.origin;
        if(exploreRooms == undefined || exploreRooms[orRoom] == undefined || !exploreRooms[orRoom].length){
            console.log('No target rooms specified for' + creep.memory.role + ' explorer ' + creep.name + ' of room ' + creep.memory.origin);
            return;
        }
        var targetRooms = exploreRooms[orRoom];
        
        //Get creep controller to upgrade
        var controllerId = creep.memory.controller;
        var controllerRoom = creep.memory.controllerRoom;
        var controller = [];
        if(controllerId){
            //Get from memory
            if(!(Game.rooms[controllerRoom] == undefined)){
                controller.push(Game.getObjectById(controllerId));
            }
            else {
                activeCreep.moveToRoom(controllerRoom);
                return;
            }
        }
        else {
            //Determine creeps controller and store in memory
            let allControllers = [];
            let darkRooms = [];
            for(let i=0; i<targetRooms.length; i++){
                if(!(Game.rooms[targetRooms[i]] == undefined)){
                    if(Game.rooms[targetRooms[i]].controller.owner == undefined){
                        allControllers.push(Game.rooms[targetRooms[i]].controller);
                    }
                }
                else {
                    darkRooms.push(targetRooms[i]);
                }
            }
            let resControllers = [];
            let reserveCreeps = _.filter(Game.creeps, function(creep){
                return creep.memory.controller && creep.memory.origin == orRoom;
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
                    creep.memory.controller = allControllers[i].id;
                    creep.memory.controllerRoom = allControllers[i].room.name;
                    break;
                }
            }
            if((match || !allControllers.length) && darkRooms.length){
                //Go look for controller in dark room
                activeCreep.moveToRoom(darkRooms[0]);
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
        if(!(claimRooms == undefined)){
            if(!(claimRooms[orRoom] == undefined)){
                if(claimRooms[orRoom][controllerRoom]){
                    claim = true;
                    activeCreep.claimController(controller);
                }
            }
        }
        if(!claim){
            activeCreep.reserveController(controller);
        }
	},
	creepDedicatedMelee: function(creep) {
	    var activeCreep = new creepActions(creep);
	    
	    if(!creep.room.memory.underAttack){
	        //TODO: Get creep to move out of the way
	        return;
	    }
	    else if(!creep.room.memory.defense.breached){
	        //Attack creeps from ramparts
	        
	        let rampartId = creep.memory.rampart;
	        let rampart = [];
	        if(rampartId){
	            let creepRampart = Game.getObjectById(rampartId);
	            if(creepRamaprt){
	                rampart.push(creepRampart);
	            }
	            else {
	                //Rampart no longer exists
	                delete creep.memory.rampart;
	                return;
	            }
	        }
	        else {
	            //Look for ramparts near hostile creeps
	            let ramparts = util.gatherObjectsInArrayFromIds(creep.room.memory.defense,'ramparts');
	            let creepsInRamparts = creep.room.find(FIND_MY_CREEPS, {filter: (creep) => {return creep.memory.rampart}});
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
	                creep.memory.rampart = target.id;
	            }
	            else if(rampartsWithHostiles.length) {
	                //Move towards rampart
	                activeCreep.moveTo(rampartsWithHostiles,5);
	                return;
	            }
	            else {
	                target = util.findDifferentElement(ramparts,occupiedRamparts);
	                if(target != ERR_NOT_FOUND){
	                    rampart.push(target);
	                    creep.memory.rampart = target.id;
	                }
	            }
	        }
	        
	        if(activeCreep.occupyRampart(rampart) == OK){
	            let hostilesInRange = creep.room.lookForAtArea(LOOK_CREEPS,creep.pos.y-1,creep.pos.x-1,creep.pos.y+1,creep.pos.x+1,true).filter(
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
	                activeCreep.meleeAttack(healersInRange);
	            }
	            else {
	                activeCreep.meleeAttack(hostilesInRange);
	            }
	        }
	    }
	    else {
	        //Attack invaders
	        let hostiles = creep.room.find(FIND_HOSTILE_CREEPS);
	        let healers = hostiles.filter((host) => {
	            return host.body.filter((bp) => {
	                return bp.type == HEAL;
	            }).length;
	        });
	        if(healers.length){
	            activeCreep.meleeAttack(healers);
	        }
	        else {
	            activeCreep.meleeAttack(hostiles);
	        }
	    }
	},
	creepExplorerMelee: function(creep,exploreRooms){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }

        var orRoom = creep.memory.origin;
        //console.log(orRoom);
        if(exploreRooms == undefined || exploreRooms[orRoom] == undefined || !exploreRooms[orRoom].length){
            console.log('No target rooms specified for' + creep.memory.role + ' explorer ' + creep.name + ' of room ' + creep.memory.origin);
            return;
        }
        var targetRooms = exploreRooms[orRoom];
        
        let attackedRoom = creep.memory.targetRoom;
        if(attackedRoom){
            if(!Memory.rooms[attackedRoom].defense.underAttack){
                console.log(creep.memory.role + ' creep ' + creep.name + ' its room ' + attackedRoom + ' is no longer under attack. Moving to different room.');
                delete creep.memory.targetRoom;
                return;
            }
            if(!Game.rooms[attackedRoom]){
                activeCreep.moveToRoom(attackedRoom);
                return;
            }
        }
        else {
            let found = false;
            for(let i=0; i<targetRooms.length && !found; i++){
                let roomMemory = Memory.rooms[targetRooms[i]];
                if(roomMemory && roomMemory.defense.underAttack){
                    attackedRoom = targetRooms[i];
                    let nEnemies = roomMemory.defense.hostiles.number;
                    let roomMeleeCreeps = _.filter(Game.creeps,(cr) => {return cr.role == 'melee' && cr.targetRoom == targetRooms[i]}).length;
                    if(nEnemies > roomMeleeCreeps){
                        creep.memory.targetRoom = targetRooms[i];
                        found = true;
                    }
                }
            }
            if(!found){
                if(attackedRoom){
                    creep.memory.targetRoom = attackedRoom;
                    console.log(creep.memory.role + ' creep ' + creep.name + ' moving to ' + attackedRoom);
                }
                else {
                    //console.log(creep.memory.role + ' creep ' + creep.name + ' has no room to go to');
                    if(targetRooms.length){activeCreep.moveToRoom(targetRooms[0])};
                    return;
                }
            }
        }
        
        let room = Game.rooms[attackedRoom];
        if(!room){
            activeCreep.moveToRoom(attackedRoom);
            return;
        }
        
        let hostiles = room.find(FIND_HOSTILE_CREEPS);
        let healers = hostiles.filter((hostile) => {return hostile.body.filter((bodyPart) => {return bodyPart.type == HEAL}).length});
        if(activeCreep.meleeAttack(healers) == ERR_NOT_FOUND){
            if(activeCreep.meleeAttack(hostiles) == ERR_NOT_FOUND){
                creep.say('All Clear');
            }
        }
	},
	creepExplorerCombat: function(creep,exploreRooms){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            activeCreep.stationaryCombat();
            return;
        }

        var orRoom = creep.memory.origin;
        //console.log(orRoom);
        if(exploreRooms == undefined || exploreRooms[orRoom] == undefined || !exploreRooms[orRoom].length){
            console.log('No target rooms specified for' + creep.memory.role + ' explorer ' + creep.name + ' of room ' + creep.memory.origin);
            return;
        }
        var targetRooms = exploreRooms[orRoom];
        
        let attackedRoom = creep.memory.targetRoom;
        if(attackedRoom){
            //console.log(creep.name + ' in room');
            if(!Memory.rooms[attackedRoom].defense.underAttack){
                if(activeCreep.healOther() == ERR_NOT_FOUND){
                    console.log(creep.memory.role + ' creep ' + creep.name + ' its room ' + attackedRoom + ' is no longer under attack. Moving to different room.');
                    activeCreep.stationaryCombat();
                    delete creep.memory.targetRoom;
                }
                return;                 
            }
            if(!Game.rooms[attackedRoom]){
                //console.log(creep.name + ' Going to attacked room');
                activeCreep.moveToRoom(attackedRoom);
                activeCreep.stationaryCombat();
                return;
            }
        }
        else {
            let found = false;
            for(let i=0; i<targetRooms.length && !found; i++){
                let roomMemory = Memory.rooms[targetRooms[i]];
                if(roomMemory && roomMemory.defense.underAttack){
                    attackedRoom = targetRooms[i];
                    let nEnemies = roomMemory.defense.hostiles.number;
                    let roomCombatCreeps = _.filter(Game.creeps,(cr) => {return (cr.role == 'melee' || cr.role == 'ranged') && cr.targetRoom == targetRooms[i]}).length;
                    if(nEnemies > roomCombatCreeps/2){
                        creep.memory.targetRoom = targetRooms[i];
                        found = true;
                    }
                }
            }
            if(!found){
                if(attackedRoom){
                    creep.memory.targetRoom = attackedRoom;
                    console.log(creep.memory.role + ' creep ' + creep.name + ' moving to ' + attackedRoom);
                }
                else {
                    //console.log(creep.memory.role + ' creep ' + creep.name + ' has no room to go to');
                    if(activeCreep.healOther() == ERR_NOT_FOUND){
                        if(targetRooms.length){activeCreep.moveToRoom(targetRooms[0])};
                        activeCreep.stationaryCombat();
                    }
                    return;
                }
            }
        }
        
        let room = Game.rooms[attackedRoom];
        //console.log('Room ' + room);
        if(!room){
            //console.log(creep.name + ' Going to attacked room');
            activeCreep.moveToRoom(attackedRoom);
            activeCreep.stationaryCombat();
            return;
        }
        
        let hostiles = room.find(FIND_HOSTILE_CREEPS);
        //console.log(JSON.stringify(hostiles));
        let healers = hostiles.filter((hostile) => {return hostile.body.filter((bodyPart) => {return bodyPart.type == HEAL}).length});
        if(activeCreep.combat(healers) == ERR_NOT_FOUND){
            if(activeCreep.combat(hostiles) == ERR_NOT_FOUND){
                creep.say('All Clear');
            }
        }
	},
	creepExplorerPatroll: function(creep,exploreRooms){
	    var activeCreep = new creepActions(creep);
	    
        var orRoom = creep.memory.origin;
        //console.log(orRoom);
        if(exploreRooms == undefined || exploreRooms[orRoom] == undefined || !exploreRooms[orRoom].length){
            console.log('No target rooms specified for' + creep.memory.role + ' explorer ' + creep.name + ' of room ' + creep.memory.origin);
            return;
        }	    
        var targetRooms = exploreRooms[orRoom].filter((rm) => {
            let horCoDev = Math.abs(Number(rm.substr(1,2))%10-5);
            let vertCoDev = Math.abs(Number(rm.substr(4,2))%10-5);
            //console.log('HorCoDev ' + horCoDev + ' vert ' + vertCoDev);
            return horCoDev <= 1 && vertCoDev <= 1;
        });
	    
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            activeCreep.stationaryCombat();
            return;
        }
        
        let patrollRoom = creep.memory.targetRoom;
        if(patrollRoom){
            if(!Game.rooms[patrollRoom]){
                //console.log(creep.name + ' Going to attacked room');
                activeCreep.moveToRoom(patrollRoom);
                activeCreep.stationaryCombat();
                return;
            }
        }
        else {
            let patrollerCreeps = _.filter(Game.creeps,(cr) => {return cr.memory.role == creep.memory.role});
            let patrolledRooms = [];
            for(let i=0; i< patrollerCreeps.length; i++){
                if(patrollerCreeps[i].memory.targetRoom){
                    patrolledRooms.push(patrollerCreeps[i].memory.targetRoom);
                }
            }
            patrollRoom = util.findDifferentString(targetRooms,patrolledRooms);
            if(patrollRoom != ERR_NOT_FOUND){
                //console.log('Found room ' + patrollRoom);
                creep.memory.targetRoom = patrollRoom;
            }
            else {
                activeCreep.moveToRoom(exploreRooms[orRoom][0]);
                activeCreep.stationaryCombat();                
                return;
            }
        }
        
        let room = Game.rooms[patrollRoom];
        //console.log('Room ' + room);
        if(!room){
            //console.log(creep.name + ' Going to attacked room');
            activeCreep.moveToRoom(patrollRoom);
            activeCreep.stationaryCombat();
            return;
        }
        if(creep.room.name == patrollRoom){
            let hostiles = util.gatherObjectsInArrayFromIds(room.memory.defense.hostiles);
            let bodyCount = util.countBodyParts(creep)[0];
            //console.log('Hostiles ' + hostiles);
            if(activeCreep.combat(hostiles,creep.hitsMax) == ERR_NOT_FOUND){
                let woundedHarvesters = creep.room.find(FIND_MY_CREEPS, {filter: (creep) => {return (creep.memory.role == 'harvester' || creep.memory.role == 'miner') && creep.hits < creep.hitsMax}});
                if(activeCreep.healOther(woundedHarvesters) == ERR_NOT_FOUND){
                    let spawns = creep.room.find(FIND_HOSTILE_STRUCTURES, {filter: (str) => {return str.structureType == STRUCTURE_KEEPER_LAIR}});
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
                            activeCreep.moveTo([nextSpawn],3);
                        }
                        else {
                            //console.log(creep.name + ' going to ' + nextSpawn);
                            activeCreep.moveTo([nextSpawn],1);
                        }                        
                                                
                    }
                    else{
                        activeCreep.moveTo([{pos: {x: 24,y: 24,'roomName': creep.room.name}}],5);
                    }
                    activeCreep.stationaryCombat();                    
                }
            }
            if(bodyCount[RANGED_ATTACK] && !bodyCount[ATTACK]){
                activeCreep.flee(hostiles,3);
            }
        }
        else {
            //console.log('Moving to patroller room');
            activeCreep.moveToRoom(patrollRoom);
            activeCreep.stationaryCombat();
        }
	}
};

module.exports = Roles;