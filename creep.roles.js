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
    creepHarvest: function(creep) {
        var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            return;
        }
        if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }        
        
        if(creep.memory.harvesting && creep.carry.energy == creep.carryCapacity){
            creep.memory.harvesting = false;
            creep.say('Transfer');
        }
        if(!creep.memory.harvesting && creep.carry.energy == 0){
            creep.memory.harvesting = true;
            creep.say('Harvest');
        }
       
	    if(creep.memory.harvesting && creep.carry.energy < creep.carryCapacity) {
	        //TODO: Should be done better
	        if(creep.room.memory.energy.fillSpawn){
	            let rtn = activeCreep.harvestContainer();
	            if(rtn == ERR_NOT_FOUND){
	                rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
	                if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
	                    activeCreep.harvestSource();
	                }
	            }
	            if(rtn == OK){
	                //Creep can perform another action
	                //Roles.creepHarvest(creep);
	            }
	        } else {
	            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
                if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
                    activeCreep.harvestSource();
                }
                if(rtn == OK){
	                //Creep can perform another action
	                //Roles.creepHarvest(creep);                    
                }
	        }
        }
        else {
            let rtn = activeCreep.fillSpawn();
            if(rtn == ERR_NOT_FOUND){
                rtn = activeCreep.fillTower();
                if(rtn == ERR_NOT_FOUND){
                    rtn = activeCreep.fillContainer();
                    if(rtn == ERR_NOT_FOUND){
                        rtn = activeCreep.fillStorage();
                        if(rtn == ERR_NOT_FOUND){
                            Roles.creepBuild(creep);
                        }
                    }
                }
            }
            if(rtn == OK){
	                //Creep can perform another action
	                //Roles.creepHarvest(creep);                   
            }
        }
	},
	creepDedicatedHarvest: function(creep){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
       if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }        
        
        //Get creeps dedicated source
	    let source = [];
	    let sourceContainer = undefined;
	    if(creep.memory.source){
	        //Get from memory
	        source.push(Game.getObjectById(creep.memory.source));
            /*if(creep.memory.sourceContainer){
                sourceContainer = util.gatherObjectsInArrayFromIds(creep.memory,'sourceContainer');
                if(!sourceContainer.length){delete creep.memory.sourceContainer} //This container no longer exists
            }
            else {
                sourceContainer = util.targetsInRange(util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'source'),source,2);
                if(!sourceContainer.length){
                    let containersToBeBuild = creep.room.find(FIND_CONSTRUCTION_SITES, {filter: (site) => {return site.structureType == STRUCTURE_CONTAINER}});
                    sourceContainer = util.targetsInRange(containersToBeBuild,source,2);
                }
                creep.memory.sourceContainer = util.gatherIdsInArrayFromObjects(sourceContainer);                    
            }*/	        
	    }
	    else {
	        //Determine creeps source and store in memory
	        let roomSources = util.gatherObjectsInArrayFromIds(creep.room.memory.sources,'energy');
	        let occupiedSources = [];
	        let roomCreeps = creep.room.find(FIND_MY_CREEPS, {
	            filter: (creep) => {
	                return creep.memory.source;
	            }
	        });
	        for(let i=0; i<roomCreeps.length; i++){
	            occupiedSources.push(Game.getObjectById(roomCreeps[i].memory.source));
	        }
	        let match = false;
	        for(let i=0; i<roomSources.length; i++){
	            match = false;
	            for(let j=0; j<occupiedSources.length && !match; j++){
	                if(roomSources[i].id == occupiedSources[j].id){
	                    match = true;
	                }
	            }
	            if(!match){
	                source.push(roomSources[i]);
	                creep.memory.source = roomSources[i].id;
	                break;
	            }
	        }
	        if(match){
	            //All room sources have allready been assigned to dedicted harvester creeps
	            console.log(creep.name + ' demoted to normal harvester because all sources are allready assigned. Do not create more dedicated harvesters then there are sources in the room');
	            creep.memory.dedicated = false;
	        }
	    }
	    
        if(creep.carry.energy == creep.carryCapacity){
            let toFillContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'source','upgrader','storage').filter((container) => {return _.sum(container.store) < container.storeCapacity});
            let toFillLinks = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'source','upgrader').filter((link) => {return link.energy < link.energyCapacity});
            let targets = toFillLinks.concat(toFillContainers);
            
            let rtn = activeCreep.fillContainer(targets);
            if(rtn == OK){
                activeCreep.harvestSource(source);
            }
            else if(rtn == ERR_NOT_FOUND){
                creep.say('Store full');
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
            let mineralContainers = gatherObjectsInArrayFromIds(creep.room.memory.containers,'mineral','storage').filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
            if(activeCreep.transferResources(mineralContainers) == ERR_NOT_FOUND){
                creep.say('Store full');
            }
        }
        else {
            Roles.creepDedicatedUpgrader(creep);
        }
	},
	creepExplorerHarvest: function(creep,exploreRooms){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }	   

        if(exploreRooms == undefined || exploreRooms[creep.memory.origin] == undefined || !exploreRooms[creep.memory.origin].length){
            console.log('No target rooms specified for' + creep.memory.role + ' explorer ' + creep.name + ' of room ' + creep.memory.origin);
            return;
        }
        var targetRooms = exploreRooms[creep.memory.origin];
        
        //Get creeps dedicate source
        var source = [];
        var sourceContainer = undefined;
        if(creep.memory.source){
            //Get source from memory
            if(!(Game.rooms[creep.memory.sourceRoom] == undefined)){
                source.push(Game.getObjectById(creep.memory.source));
                if(creep.memory.sourceContainer){
                    sourceContainer = util.gatherObjectsInArrayFromIds(creep.memory,'sourceContainer');
                    if(!sourceContainer.length){delete creep.memory.sourceContainer} //This container no longer exists
                }
                else {
                    sourceContainer = util.targetsInRange(util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'source'),source,2);
                    if(!sourceContainer.length){
                        let containersToBeBuild = creep.room.find(FIND_CONSTRUCTION_SITES, {filter: (site) => {return site.structureType == STRUCTURE_CONTAINER}});
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
            for(let i=0; i<targetRooms.length && !foundSource; i++){
                if(!(Game.rooms[targetRooms[i]] == undefined)){
                    let roomSources = Game.rooms[targetRooms[i]].find(FIND_SOURCES);
                    let occupiedSources = [];
                    let roomCreeps = _.filter(Game.creeps, (creep) => {
                        return creep.memory.sourceRoom == Game.rooms[targetRooms[i]].name && creep.memory.source;
                    });
                    for(let j=0; j<roomCreeps.length; j++){
                        occupiedSources.push(Game.getObjectById(roomCreeps[j].memory.source));
                    }
                    let match = false;
                    for(let j=0; j<roomSources.length; j++){
                        match = false;
                        for(let k=0; k<occupiedSources.length && !match; k++){
                            if(roomSources[j].id == occupiedSources[k].id){
                                match = true;
                            }
                        }
                        if(!match){
                            source.push(roomSources[j]);
                            creep.memory.source = roomSources[j].id;
                            creep.memory.sourceRoom = targetRooms[i];
                            foundSource = true;
                            break;
                        }
                    }
                }
                else {
                    darkRooms.push(targetRooms[i]);
                }
            }
            if(!foundSource){
                if(darkRooms.length){
                    //Move to one of the dark rooms to see
                    //console.log(creep.name + ' darkroom ' + darkRooms[0]);
                    activeCreep.moveToRoom(darkRooms[0]);
                    return;
                }
                else {
                    console.log('All sources occupied. Explorer ' + creep.memory.role + ' ' + creep.name + ' has no source to harvest');
                    return;
                }
                
            }
        }
        
        if(creep.carry.energy == creep.carryCapacity){
            let rtn = activeCreep.fillContainer(sourceContainer);
            if(rtn == OK){
                activeCreep.harvestSource(source);
            }
            else if(rtn == ERR_NOT_FOUND){
                /*creep.say('Store full');
                //activeCreep.dropAll();
                }*/
            }
            else if(rtn == ERR_INVALID_TARGET){
                activeCreep.buildStructure(sourceContainer);
                //console.log('Error for creep ' + creep.name + ' ' + rtn);
            }
            else if(rtn == ERR_FULL){
                if(sourceContainer[0].hits < sourceContainer[0].hitsMax){
                    activeCreep.repairStructure(1,sourceContainer);
                }
                //else {
                    //console.log(creep.name + ' countainer full');
                    //activeCreep.dropAll();
                //}
            }
        }
        else {
            activeCreep.harvestSource(source);
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
        
        let targetId = creep.memory.target;
        //console.log(creep.name + ' ' + targetId + ' ' + creep.memory.getting);
        if(targetId && creep.memory.getting){
            let getDropped = activeCreep.collectDroppedResource(RESOURCE_ENERGY)
            //console.log(creep.name + ' getdropped ' + getDropped);
            if(getDropped == ERR_NOT_FOUND){
                //console.log(creep.name + ' harvesting target ' + Game.getObjectById(targetId));
                let rtn = activeCreep.withdrawResource(Game.getObjectById(targetId));
                //console.log(creep.name + ' get from target ' + rtn);
                if(rtn == OK || rtn < 0){
                    delete creep.memory.target;
                    creep.memory.getting = false;
                }
                return;
            }
            else if(getDropped == OK){
                delete creep.memory.target;
                creep.memory.getting = false;
            }
            else if(getDropped == 1){
                return;
            }
        }
        if(targetId && !creep.memory.getting){
            //console.log(creep.name + ' transfering to target' + Game.getObjectById(targetId));
            let rtn = activeCreep.transferResources(Game.getObjectById(targetId));
            if(rtn == OK || rtn == ERR_FULL){
                delete creep.memory.target;
                creep.memory.getting = false;
            }
            return;
        }        
        
	    let spawnContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'spawn');
	    let sourceContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'source');
	    let upgraderContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'upgrader');
	    let storageContainer = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'storage');
	    let toFillUpgraderLinks = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'upgrader').filter((link) => {return link.energy == 0});
	    //console.log('upgrader ' + toFillUpgraderLinks.length);
	    
	    //Filling spawns and extensions is a priority
        var fillSpawn = creep.room.memory.energy.fillSpawn;
        if(_.sum(creep.carry) > creep.carry.energy && creep.memory.target != creep.room.terminal.id){
            //If creep is carrying mineral, store these first
            let notFullContainers = storageContainer.filter((stor) => {return _.sum(stor.store) < stor.storeCapacity});
            if(activeCreep.fillStorage(notFullContainers) == ERR_NOT_FOUND){
                creep.say('Store full');
                //activeCreep.dropAllBut(RESOURCE_ENERGY);
            }
        }
	    else if(fillSpawn){
	        if(creep.carry.energy == 0){
	            //Get energy
	            let filledSourceLinks = util.gatherObjectsInArrayFromIds(creep.memory.links,'source').filter((link) => {return links.energy > 0});
                let filledStorageLink = [];
                if(!toFillUpgraderLinks.length){
                    filledStorageLink = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'storage').filter((link) => {return link.energy > 0});	                    
                }	            
	            let filledSpawnContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'spawn','source','storage').filter(function(container){return container.store[RESOURCE_ENERGY] > 0});
	            let filledContainers = filledSourceLinks.concat(filledStorageLink,filledSpawnContainers);
                
	            //let startFind = Game.cpu.getUsed();
	            let targetContainer = findFilledContainerForCreep(creep,filledContainers,0,2);
	            //let usedFind = Game.cpu.getUsed() - startFind;
	            //console.log(creep.name + ' finding closest target ' + targetContainer + ' took ' + usedFind + ' cpu units');
	            if(targetContainer != ERR_NOT_FOUND){
	                if(activeCreep.harvestContainer(targetContainer) != OK){
	                    creep.memory.target = targetContainer.id;
	                    creep.memory.getting = true;
	                }
	            }
	            else {
	                creep.say('No energy');
	            }
	        }
	        else {
	            creep.memory.getting = false;
	            //Fill spawns and extensions
	            activeCreep.fillSpawn();
	        }
	    }
	    else if(creep.room.memory.defense.underAttack){
	        if(creep.carry.energy == 0){
	            //Get energy
	            let filledSourceLinks = util.gatherObjectsInArrayFromIds(creep.memory.links,'source').filter((link) => {return links.energy > 0});
                let filledStorageLink = [];
                if(!toFillUpgraderLinks.length){
                    filledStorageLink = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'storage').filter((link) => {return link.energy > 0});	                    
                }	            
	            let filledSpawnContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'spawn','source','storage').filter(function(container){return container.store[RESOURCE_ENERGY] > 0});
	            let filledContainers = filledSpawnContainers.concat(filledSourceLinks,filledStorageLink);
	            
	            //let startFind = Game.cpu.getUsed();
	            let targetContainer = findFilledContainerForCreep(creep,filledContainers,0,2);
	            //let usedFind = Game.cpu.getUsed() - startFind;
	            //console.log(creep.name + ' finding closest target ' + targetContainer + ' took ' + usedFind + ' cpu units');
	            if(targetContainer != ERR_NOT_FOUND){
	                if(activeCreep.harvestContainer(targetContainer) != OK){
	                    creep.memory.target = targetContainer.id;
	                    creep.memory.getting = true;
	                }
	            }
	            else {
	                creep.say('No energy');
	            }
	        }
	        else {
	            creep.memory.getting = false;
	            //Fill towers
	            activeCreep.fillTower();
	        }	        
	    }
	    else {
	        let toFillSpawnContainers = spawnContainers.filter(function(container){return _.sum(container.store) < container.storeCapacity});
	        let toFillUpgraderContainers = findNotFilledContainerForCreep(creep,upgraderContainers,1,2);
	        if(toFillUpgraderContainers != ERR_NOT_FOUND){
	            toFillUpgraderContainers = [toFillUpgraderContainers];
	        }
	        else {
	            toFillUpgraderContainers = [];
	        }
	        //console.log(creep.name + ' to fill upgrader containers ' + toFillUpgraderContainers);
	        if(creep.carry.energy == 0){
	            //Empty the source containers
	            if(activeCreep.collectDroppedResource() == ERR_NOT_FOUND){
    	            let filledSourceContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'source').filter(function(container){return container.store[RESOURCE_ENERGY] >= creep.carryCapacity});
    	            let filledMineralContainers = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'mineral').filter((cont) => {return _.sum(cont.store) >= creep.carryCapacity});
    	            let filledStorageLink = [];
    	            if(!toFillUpgraderLinks.length){
    	                //If no upgrader containers have to be filled, storage link can be emptied
    	                filledStorageLink = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'storage').filter((link) => {return link.energy > 0});
    	                //console.log(creep.name +' storage link ' + filledStorageLink);
    	            }
    	            //console.log(filledStorageLink);
    	            let filledContainers = filledSourceContainers.concat(filledStorageLink, filledMineralContainers);
                    //console.log(creep.name + ' filled ' + filledContainers);
    	            //let startFind = Game.cpu.getUsed();
    	            let targetContainer = findFilledContainerForCreep(creep,filledContainers,1,2);
    	            //let usedFind = Game.cpu.getUsed() - startFind;
    	            //console.log(creep.name + ' finding closest target ' + targetContainer);
    	            //console.log('spawn ' + toFillSpawnContainers.length + ' upgraderCont ' + toFillUpgraderContainers.length + ' upgraderLinks ' + toFillUpgraderLinks.length);
    	            if(targetContainer != ERR_NOT_FOUND){
    	                if(activeCreep.harvestContainer(targetContainer) != OK){
    	                    creep.memory.target = targetContainer.id;
    	                    creep.memory.getting = true;
    	                }
    	            }
    	            else if(toFillSpawnContainers.length || toFillUpgraderContainers.length || toFillUpgraderLinks.length){
    	                //console.log(creep.name + ' getting from storage');
    	                if(activeCreep.harvestStorage() == ERR_NOT_FOUND){
    	                    creep.say('No energy');
    	                }
    	            }
    	            else {
    	                let roomOrders = creep.room.memory.orders;
    	                if(roomOrders){
    	                    for(let resource in roomOrders){
    	                        let amount = roomOrders[resource];
    	                        if(amount == 0){
    	                            continue;
    	                        }
    	                        else if(amount > 0){
        	                        let storeResource = util.gatherObjectsInArrayFromIds(creep.room.memory.containers,'source','mineral','storage').filter((cont) => {return cont.store[resource] > 0});
        	                        let withdrawAmount = Math.min(creep.carryCapacity,amount);
        	                        let rtn = activeCreep.withdrawResource(storeResource,resource,withdrawAmount);
        	                        if(rtn == OK){
        	                            //console.log(creep.name + ' type ' + resource + ' amount ' + amount + ' withdrawn ' + withdrawAmount);
        	                            creep.room.memory.orders[resource] = amount - withdrawAmount;
        	                            creep.memory.getting = false;
        	                            creep.memory.target = creep.room.terminal.id;
        	                            return;
        	                        }
        	                        else if(rtn != ERR_NOT_FOUND){
        	                            return;
        	                        }    	                            
    	                        }
    	                        else {
    	                            amount = Math.abs(amount);
    	                            let terminal = [creep.room.terminal].filter((term) => {return term.store[resource] > 0});
    	                            let withdrawAmount = Math.min(creep.carryCapacity,amount);
    	                            let rtn = activeCreep.withdrawResource(terminal,resource,withdrawAmount);
    	                            if(rtn == OK){
    	                                //console.log(creep.name + ' type ' + resource + ' amount ' + amount + ' withdrawn ' + withdrawAmount);
    	                                creep.room.memory.orders[resource] += withdrawAmount;
    	                                return;
    	                            }
    	                            else if(rtn != ERR_NOT_FOUND){
    	                                return;
    	                            }
    	                        }

    	                    }
    	                }
    	            }
	            }
	        }
	        else {
	            creep.memory.getting = false;
	            //Fill spawn containers
	            if(activeCreep.fillContainer(toFillSpawnContainers) == ERR_NOT_FOUND){
	                //Fill storage link if necessary. It will then link to upgrader link.
	                let toFillStorageLinks = [];
	                if(toFillUpgraderLinks.length){
	                    toFillStorageLinks = util.gatherObjectsInArrayFromIds(creep.room.memory.links,'storage').filter((link) => {return link.energy < Math.pow(1-LINK_LOSS_RATIO,2) * link.energyCapacity});
	                    //console.log('Storage links: ' + toFillStorageLinks);
	                }
	                if(activeCreep.transferResources(toFillStorageLinks,RESOURCE_ENERGY) == ERR_NOT_FOUND){
    	                //Fill upgrader containers
    	                let targetUpgraderContainer = findNotFilledContainerForCreep(creep,upgraderContainers,1,2);
    	                //console.log(creep.name + ' upgradercontainer ' + targetUpgraderContainer);
    	                if(targetUpgraderContainer != ERR_NOT_FOUND){
    	                    if(activeCreep.fillContainer(targetUpgraderContainer) != OK){
    	                        creep.memory.target = targetUpgraderContainer.id;
    	                    }
    	                }
    	                else {
    	                    //let towers = util.gatherObjectsInArrayFromIds(creep.room.memory.defense,'tower');
    	                    //let targetTower = findNotFilledContainerForCreep(creep,tower,0,1);
    	                    /*if(targetTower != ERR_NOT_FOUND){
    	                        if(activeCreep.fillTower(targetTower) != OK){
    	                            creep.memory.target = targetTower.id;
    	                        }
    	                    }
    	                    else if(activeCreep.fillStorage() == ERR_NOT_FOUND){
    	                        creep.say('Store full');
    	                    }*/
        	                if(activeCreep.fillTower() == ERR_NOT_FOUND){
            	                //Fill storage
            	                if(activeCreep.fillStorage() == ERR_NOT_FOUND){
            	                    creep.say('Store full');
            	                }	                    
        	                }
    	                }
	                }
	            }
	        }
	    }
	    
	    
	    
	    function findTargetsOfGettingCreeps(creep,test){
	        if(test == undefined){
	            test = true;
	        }
            let creepsGetting = creep.room.find(FIND_MY_CREEPS, {filter: (creep) => {return creep.memory.getting == test}});
            let targetedContainers = [];
            for(let i=0; i<creepsGetting.length; i++){
                if(creepsGetting[i].memory.target){
                    targetedContainers.push(Game.getObjectById(creepsGetting[i].memory.target));
                }
            }
            return targetedContainers;
	    }
	    
	    function findFilledContainerForCreep(creep,containers,fillFraction,nLoops){
	        if(fillFraction == undefined){
	            fillFraction = 1;
	        }
	        if(nLoops == undefined){
	            nLoops = 2;
	        }
	        let found = false;
	        let filledContainers = containers;
	        let targetContainer = ERR_NOT_FOUND;
	        let targetedContainers = findTargetsOfGettingCreeps(creep,true);
	        //console.log(creep.name + ' targetedContainers' + targetedContainers);
	        for(let i=0; i<nLoops && !found; i++){
	            //console.log(creep.name + ' filledContainers ' + filledContainers);
    	        filledContainers = filledContainers.filter((cont) => {
    	            if(cont.structureType == STRUCTURE_CONTAINER || cont.structureType == STRUCTURE_STORAGE){
    	                return _.sum(cont.store) >= (i+1) * fillFraction * creep.carryCapacity;
    	            }
    	            else if(cont.structureType == STRUCTURE_LINK){
    	                return cont.energy >= (i+1) * fillFraction * Math.pow((1-LINK_LOSS_RATIO),4) * cont.energyCapacity;
    	            }
    	            else {
    	                return cont.energy >= (i+1) * fillFraction * creep.carryCapacity;
    	            }
    	        });
    	        //console.log(creep.name + ' filledContainers ' + filledContainers);
    	        targetContainer = findTargetContainerForCreep(creep,filledContainers,targetedContainers);
    	        //console.log(creep.name + ' target ' + targetContainer);
    	        if(targetContainer != ERR_NOT_FOUND){
    	            found = true;
    	        }
    	        else {
    	            targetedContainers = util.findDubbles(targetedContainers);
    	        }
	        }
	        return targetContainer;
	    }
	    
	    function findNotFilledContainerForCreep(creep,containers,emptyFraction,nLoops){
	        if(emptyFraction == undefined){
	            emptyFraction = 1;
	        }
	        if(nLoops == undefined){
	            nLoops = 2;
	        }
	        let found = false;
	        let emptyContainers = containers;
	        let targetContainer = ERR_NOT_FOUND;
	        let targetedContainers = findTargetsOfGettingCreeps(creep,false);
	        //console.log(creep.name + ' targetedContainers' + targetedContainers);
	        for(let i=0; i<nLoops && !found; i++){
	            //console.log(creep.name + ' filledContainers ' + filledContainers);
    	        emptyContainers = emptyContainers.filter((cont) => {
    	            if(cont.structureType == STRUCTURE_CONTAINER || cont.structureType == STRUCTURE_STORAGE){
    	                return cont.storeCapacity - _.sum(cont.store) >= (i+1) * emptyFraction * creep.carryCapacity;
    	            }
    	            else if(cont.structureType == STRUCTURE_LINK){
    	                return cont.energyCapacity - cont.energy >= (i+1) * emptyFraction * Math.pow((1-LINK_LOSS_RATIO),2) * cont.energyCapacity;
    	            }
    	            else {
    	                return cont.energyCapacity - cont.energy >= (i+1) * emptyFraction * creep.carryCapacity;
    	            }
    	        });
    	        //console.log(creep.name + ' filledContainers ' + filledContainers);
    	        targetContainer = findTargetContainerForCreep(creep,emptyContainers,targetedContainers);
    	        //console.log(creep.name + ' target ' + targetContainer);
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
        
        /*let targetId = creep.memory.target;
        let targetRoom = creep.memory.targetRoom;
        //console.log(creep.name + ' ' + targetRoom);        
        if(targetId && creep.memory.getting){
            let getDropped = activeCreep.collectDroppedResource(RESOURCE_ENERGY)
            //console.log(creep.name + ' drop ' + getDropped);
            if(getDropped == ERR_NOT_FOUND){
                //console.log(creep.name + ' harvesting target ' + Game.getObjectById(targetId));
                if(!Game.rooms[targetRoom]){
                    activeCreep.moveToRoom(targetRoom);
                }
                else {
                    let rtn = activeCreep.harvestContainer(Game.getObjectById(targetId));
                    //console.log(creep.name + ' rtn ' + rtn);
                    if(rtn != 1){
                        delete creep.memory.target;
                    }            
                }
                return;
            }
            else if(getDropped == OK){
                delete creep.memory.target;
            }
            else if(getDropped == 1){
                return;
            }
        }*/
        /*if(targetId && !creep.memory.getting){
            //console.log(creep.name + ' transfering to target' + Game.getObjectById(targetId));
            let rtn = activeCreep.transferResources(Game.getObjectById(targetId));
            if(rtn == OK){
                delete creep.memory.target;
            }
            return;
        }*/
        
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
            
            /*if(activeCreep.collectDroppedResource(RESOURCE_ENERGY) == ERR_NOT_FOUND){
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
                let creepsGetting = _.filter(Game.creeps,function(creep){return creep.memory.getting});
                let targetedContainers = [];
                for(let i=0; i<creepsGetting.length; i++){
                    if(creepsGetting[i].memory.target){
                        //console.log(creep.name + ' target '+ creepsGetting[i].memory.target + ' ' + creepsGetting[i].name);
                        let trg = Game.getObjectById(creepsGetting[i].memory.target);
                        if(trg){
                            targetedContainers.push(trg);
                        }
                    }
                }
                //console.log(creep.name + ' filled ' + filledSourceContainers +' targeted '+ targetedContainers);
                let targetContainer = util.findDifferentElement(filledSourceContainers,targetedContainers);
                //console.log('Single targeted containers ' + targetedContainers);
                if(targetContainer != ERR_NOT_FOUND){
                    //console.log(creep.name + ' target found ' + targetContainer);
                    if(activeCreep.harvestContainer([targetContainer]) != OK){
                        creep.memory.getting = true;
                        creep.memory.target = targetContainer.id;
                        creep.memory.targetRoom = targetContainer.pos.roomName;
                    }
                }
                else {
                    //console.log(creep.name + ' Checking double targets');
                    filledSourceContainers = filledSourceContainers.filter((cont) => {return _.sum(cont.store) >= 2*creep.carryCapacity - _.sum(creep.carry)});
                    //console.log('Double filled source containers: '+ filledSourceContainers);
                    let dubbleTargetedContainers = util.findDubbles(targetedContainers);
                    //console.log('Dubbletargeted containers ' + dubbleTargetedContainers);
                    targetContainer = util.findDifferentElement(filledSourceContainers,dubbleTargetedContainers);
                    //console.log('Target: ' + targetContainer);
                    if(targetContainer != ERR_NOT_FOUND){
                        //console.log(creep.name + ' dubble target found ' + targetContainer);
                        if(activeCreep.harvestContainer([targetContainer]) != OK){
                            creep.memory.getting = true;
                            creep.memory.target = targetContainer.id;
                            creep.memory.targetRoom = targetContainer.pos.roomName;                    
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
                //console.log('Containers: ' + filledSourceContainers);
                //activeCreep.harvestContainer(filledSourceContainers);
            }*/
        }
        else {
            creep.memory.getting = false;
            //console.log(creep.name);
            let room = Game.rooms[orRoom];
            let avContainers = gatherObjectsInArrayFromIds(room.memory.containers,'source','spawn','storage').filter((cont) => {return _.sum(cont.store) < cont.storeCapacity});
            let avLinks = gatherObjectsInArrayFromIds(room.memory.links,'source','spawn').filter((link) => {return link.energy < link.energyCapacity});;
            let targets = avContainers.concat(avLinks);
            if(activeCreep.transferResources(targets) == ERR_NOT_FOUND){
                creep.say('Store full');
            }
        }
        
	},
    creepBuild: function(creep) {
        var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }        
        if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }            
        
	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.say('Harvesting');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.say('Building');
	    }
	    if(creep.memory.building) {
	        //Build structures
	        if(activeCreep.buildStructure() == ERR_NOT_FOUND){
	            if(activeCreep.repairStructure() == ERR_NOT_FOUND){
	                if(activeCreep.repairWall() == ERR_NOT_FOUND){
	                    Roles.creepUpgrade(creep);
	                }
	            }
	        }
	    }
	    else {
            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
            if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
                activeCreep.harvestSource();
            }
            if(rtn == OK){
                //Creep can perform another action
                //Roles.creepBuild(creep);                    
            }
	    }
	},
	creepDedicatedBuild: function(creep){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
        if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }            
        
	    let sourceContainers = getArrayObjectsById(creep.room.memory.containers.source);
	    let upgraderContainers = getArrayObjectsById(creep.room.memory.containers.upgrader);
	    let containers = sourceContainers.concat(upgraderContainers);
	    
	    if(creep.carry.energy == 0){
            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
            if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
    	        if(activeCreep.harvestStorage() == ERR_NOT_FOUND){
    	            let filledContainers = containers.filter(function(container){return container.store[RESOURCE_ENERGY] > 0});
    	            if(activeCreep.harvestContainer(filledContainers) == ERR_NOT_FOUND){
    	                Roles.creepBuild(creep);
    	            }
    	        }                
            }
            else if(rtn == OK){
    	        if(activeCreep.buildStructure() == ERR_NOT_FOUND){
            	    let dmgId = creep.room.memory.dmgStructures;
            	    let dmgStructures = [];
            	    for(let i=0; i<dmgId.length; i++){
            	        dmgStructures.push(Game.getObjectById(dmgId[i]));
            	    }    	            
    	            if(activeCreep.repairStructure(1,dmgStructures) == ERR_NOT_FOUND){
    	                Roles.creepDedicatedUpgrader(creep);
    	            }
    	        }                
            }

	    }
	    else {
	        if(activeCreep.buildStructure() == ERR_NOT_FOUND){
        	    let dmgId = creep.room.memory.dmgStructures;
        	    let dmgStructures = [];
        	    for(let i=0; i<dmgId.length; i++){
        	        dmgStructures.push(Game.getObjectById(dmgId[i]));
        	    }  	            
	            if(activeCreep.repairStructure(1,dmgStructures) == ERR_NOT_FOUND){
	                Roles.creepDedicatedUpgrader(creep);
	            }
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
        var orRoom = creep.memory.origin;
        //console.log(orRoom);
        if(exploreRooms == undefined || exploreRooms[orRoom] == undefined || !exploreRooms[orRoom].length){
            console.log('No target rooms specified for' + creep.memory.role + ' explorer ' + creep.name + ' of room ' + creep.memory.origin);
            return;
        }
        var targetRooms = exploreRooms[orRoom];
        var explorerSites = [];
        for(let site in Game.constructionSites){
            let roomName = Game.constructionSites[site].pos.roomName;
            for(let i=0; i<targetRooms.length; i++){
                if(targetRooms[i] == roomName){
                    explorerSites.push(Game.getObjectById(Game.constructionSites[site].id));
                    break;
                }
            }
        }
        //console.log(explorerSites);
        
        if(creep.carry.energy == 0){
            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
            //console.log(creep.name + ' rtn ' + rtn + ' room ' + creep.room.name + ' origin ' + orRoom);;
            if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
                if(creep.room.name == orRoom){
                    if(activeCreep.harvestStorage() == ERR_NOT_FOUND){
                        //Get resources from source containers or full upgrader containers
                        //TODO add these containers to room memory
                        Roles.creepDedicatedBuild(creep);
                    }
                }
                else{
                    let targetContainers = gatherObjectsInArrayFromIds(creep.room.memory.containers,'source','upgrader','storage').filter((cont) => {return cont.store.energy > 0});
                    let targetLinks = gatherObjectsInArrayFromIds(creep.room.memory.links,'source','upgrader').filter((link) => {return link.energy > 0});
                    let targets = targetContainers.concat(targetLinks);
                    //console.log(creep.name + ' targets ' + targets + ' ' + targets.length);
                    if(activeCreep.harvestContainer(targets) == ERR_NOT_FOUND){
                        activeCreep.moveToRoom(orRoom);
                        creep.say('No energy');
                    }
                }                
            }
        }
        else {
            if(activeCreep.buildStructure(explorerSites) == ERR_NOT_FOUND){
                let dmgStructures = [];
                let darkRooms = [];
                for(let i=0; i<targetRooms.length; i++){
                    if(!(Game.rooms[targetRooms[i]] == undefined)){
                        let room = Game.rooms[targetRooms[i]];
                        let dmgStructRoom = getArrayObjectsById(room.memory.dmgStructures);
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
                    if(creep.room.name == orRoom){
                        Roles.creepDedicatedBuild(creep);
                    }
                    else{
                        activeCreep.moveToRoom(orRoom);
                        return;                        
                    }
                }
            }
        }
	},
    creepRepair: function(creep) {
        var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
        if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }                    
        
	    if(creep.memory.repairing && creep.carry.energy == 0) {
            creep.memory.repairing = false;
            creep.say('Harvesting');
	    }
	    if(!creep.memory.repairing && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.repairing = true;
	        creep.say('Repairing');
	    }
	    if(creep.memory.repairing) {
	        //Repair structures
	        if(activeCreep.repairStructure() == ERR_NOT_FOUND){
                if(activeCreep.repairWall() == ERR_NOT_FOUND){
                    Roles.creepBuild(creep);
                }
	        }
	    }
	    else {
            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
            if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
                activeCreep.harvestSource();
            }
            if(rtn == OK){
                //Creep can perform another action
                //Roles.creepBuild(creep);                    
            }
	    }
	},
	creepDedicatedRepair: function(creep){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
        if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }            
        
	    let sourceContainers = getArrayObjectsById(creep.room.memory.containers.source);
	    let upgraderContainers = getArrayObjectsById(creep.room.memory.containers.upgrader);
	    let containers = sourceContainers.concat(upgraderContainers);
	    
	    let dmgStructures = getArrayObjectsById(creep.room.memory.dmgStructures);
	    //console.log(dmgStructures);
        
        if(creep.carry.energy == 0){
            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
            if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
            if(activeCreep.harvestStorage() == ERR_NOT_FOUND){
                    let filledContainers = containers.filter(function(container){return container.store[RESOURCE_ENERGY] > 0});
                    if(activeCreep.harvestContainer(filledContainers) == ERR_NOT_FOUND){
                        Roles.creepRepair(creep);
                    }
                }                
            }
            else if(rtn == OK){
                if(activeCreep.repairStructure(1,dmgStructures) == ERR_NOT_FOUND){
                    Roles.creepDedicatedBuild(creep);
                }                
            }
        }
        else {
            //Repair structures
            if(activeCreep.repairStructure(1,dmgStructures) == ERR_NOT_FOUND){
                Roles.creepDedicatedBuild(creep);
            }
        }
	    
	},
	creepExplorerRepair: function(creep,exploreRooms){
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
        
        if(creep.carry.energy == 0){
            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
            if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
                if(creep.room.name == orRoom){
                    if(activeCreep.harvestStorage() == ERR_NOT_FOUND){
                        //Get resources from source containers or full upgrader containers
                        //TODO add these containers to room memory                        
                        Roles.creepDedicatedRepair(creep);
                    }
                }
                else {
                    if(activeCreep.harvestContainer() == ERR_NOT_FOUND){
                        let targetContainers = gatherObjectsInArrayFromIds(creep.room.memory.containers,'source','upgrader','storage').filter((cont) => {return cont.store.energy > 0});
                        let targetLinks = gatherObjectsInArrayFromIds(creep.room.memory.links,'source','upgrader').filter((link) => {return link.energy > 0});
                        let targets = targetContainers.concat(targetLinks);                        
                        if(activeCreep.harvestContainer(targets) == ERR_NOT_FOUND){
                            activeCreep.moveToRoom(orRoom);
                            creep.say('No energy');
                        }
                    }
                }
            }
        }
        else {
            let dmgStructures = [];
            let darkRooms = [];
            for(let i=0; i<targetRooms.length; i++){
                if(!(Game.rooms[targetRooms[i]] == undefined)){
                    let room = Game.rooms[targetRooms[i]];
                    let dmgStructRoom = getArrayObjectsById(room.memory.dmgStructures);
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
    creepUpgrade: function(creep) {
        var activeCreep = new creepActions(creep);    
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }    
        if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }                    
        
        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('harvesting');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.upgrading = true;
	        creep.say('upgrading');
	    }
	    if(creep.memory.upgrading) {
	        activeCreep.upgrade();
        }
        else {
            let rtn = activeCreep.collectDroppedResource(RESOURCE_ENERGY);
            if(rtn == ERR_NOT_FOUND || rtn == ERR_NOT_IN_RANGE){
                activeCreep.harvestSource();
            }
            if(rtn == OK){
                //Creep can perform another action
                //Roles.creepBuild(creep);                    
            }
        }
	},
	creepDedicatedUpgrader: function(creep){
	    var activeCreep = new creepActions(creep);
        if(activeCreep.moved){
            //console.log(creep.name + ' really moved from memory');
            return;
        }
        if(creep.room.name != creep.memory.origin){
            activeCreep.moveToRoom(creep.memory.origin);
            return;
        }
        let upgraderContainers = gatherObjectsInArrayFromIds(creep.room.memory.containers,'upgrader','source','storage').filter((container) => {return container.store[RESOURCE_ENERGY] > 0});
        let upgraderLinks = gatherObjectsInArrayFromIds(creep.room.memory.links,'upgrader','source').filter((link) => {return link.energy > 0});
        let upgraderTargets = upgraderLinks.concat(upgraderContainers);
	    
	    if(creep.carry.energy == 0){
	        if(activeCreep.harvestContainer(upgraderTargets) == ERR_NOT_FOUND){
	            creep.say('Empty');
	        }
	    }
	    else {
	        activeCreep.upgrade();
	    }
	    
	},
	creepExplorerUpgrader: function(creep,exploreRooms){
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
        
        let controllerRoom = creep.memory.controllerRoom;
        if(!controllerRoom){
            let found = false;
            for(let i=0; i<targetRooms.length && !found; i++){
                if(!(Game.rooms[targetRooms[i]] == undefined)){
                    let room = Game.rooms[targetRooms[i]];
                    let controllerOwner = room.controller.owner;
                    if(controllerOwner){
                        if(controllerOwner.username == 'Vervust'){
                            creep.memory.controllerRoom = room.name;
                            found = true;
                        }
                    }
                }
            }
            if(!found){
                console.log(creep.role + ' ' + creep.name + ' has no external room to upgrade controller');
                //creep.memory.controllerRoom = orRoom;
            }
        }
        
        if(creep.carry.energy == 0){
            if(creep.room.name == orRoom){
                let filledContainers = gatherObjectsInArrayFromIds(creep.room.memory.containers,'source','upgrader','storage').filter((cont) => {return cont.store.energy > 0});
                let filledLinks = gatherObjectsInArrayFromIds(creep.room.memory.links,'source','upgrader').filter((link) => {return link.energy > 0});
                let targets = filledContainers.concat(filledLinks);
                if(activeCreep.harvestContainer(targets) == ERR_NOT_FOUND){
                    creep.say('No energy');
                    //Move to target room to check for energy
                    activeCreep.moveToRoom(controllerRoom);
                }
            }
            else {
                if(activeCreep.collectDroppedResource(RESOURCE_ENERGY) == ERR_NOT_FOUND){
                    let filledContainers = gatherObjectsInArrayFromIds(creep.room.memory.containers,'source','upgrader','storage').filter((cont) => {return cont.store.energy > 0});
                    let filledLinks = gatherObjectsInArrayFromIds(creep.room.memory.links,'source','upgrader').filter((link) => {return link.energy > 0});
                    let targets = filledContainers.concat(filledLinks);
                    if(activeCreep.harvestContainer(targets) == ERR_NOT_FOUND){
                        //Look for energy in origin room
                        activeCreep.moveToRoom(orRoom);
                    }                    
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
	creepMelee: function(creep) {
        var activeCreep = new creepActions(creep); 	    
	    if(creep.room.memory.underAttack == true) {
	        activeCreep.meleeAttack();
	    }
	    else {
	        if(activeCreep.occupyRampart() == ERR_NOT_FOUND){
	            activeCreep.moveTo([creep.room.controller],5);
	        }
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
        
	    /*if(creep.ticksToLive < 300 && creep.ticksToLive > 1){
	        creepsToSpawn[creep.memory.origin][creep.memory.type][creep.memory.role] = targetRooms.length + 1;
	    }        
	    else {
	        creepsToSpawn[creep.memory.origin][creep.memory.type][creep.memory.role] = targetRooms.length;
	    }*/
	    
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
            //console.log('Targets ' + targetRooms);
            //console.log('Patrolled ' + patrolledRooms);
            //console.log('Patrollers ' + patrollerCreeps);
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
                let woundedHarvesters = creep.room.find(FIND_MY_CREEPS, {filter: (creep) => {return creep.memory.role == 'harvester' && creep.hits < creep.hitsMax}});
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

var gatherObjectsInArrayFromIds = function(objects){
    //Gather as many subobjects as desired from object.
    //Subobjects must be Ids in array form.
    let objectsArray = [];
    if(objects == undefined){
        //return empty array
        return objectsArray;
    }
    if(arguments.length == 1){
        //If no subObjects are specified, then get them all.
        for(let subObjectKey in objects){
            let subObjectIds = objects[subObjectKey];
            let subObjectsArray = getArrayObjectsById(subObjectIds);
            objectsArray = objectsArray.concat(subObjectsArray);
        }
    }
    else {
        for(let i=0; i<arguments.length; i++){
            let subObjectIds = objects[arguments[i]];
            if(subObjectIds == undefined){
                continue;
            }
            let subObjectsArray = getArrayObjectsById(subObjectIds);
            objectsArray = objectsArray.concat(subObjectsArray);
        }
    }
    return objectsArray;
};

var getArrayObjectsById = function(ids){
    if(!Array.isArray(ids)){
        return ERR_INVALID_ARGS;
    }
    let objects = [];
    for(let i=0; i<ids.length; i++){
        let obj = Game.getObjectById(ids[i]);
        if(!(obj == undefined)){
            objects.push(Game.getObjectById(ids[i]));
        }
    }
    return objects;
};

module.exports = Roles;