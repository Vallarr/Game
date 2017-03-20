Room.prototype.checkCreepsToSpawn = function(){
    //TODO: expand to also allow body to be assigned here
    //      Also allow to add memory -> can specify target room for creeps (e.g. for reserver or harvester)
    // ??? Integrate with spawn queue
    // ??? How to check which creeps with which bodies and targetRooms are still alive
    if(!creepsToSpawn || ! creepsToSpawn[this.name]){return}
    for(let type in creepsToSpawn[this.name]){
        for(let role in creepsToSpawn[this.name][type]){
            if(creepsToSpawn[this.name][type][role] && creepsToSpawn[this.name][type][role] < 0){
                let targetRooms;
                if(remoteRooms == undefined || remoteRooms[type] == undefined){
                    targetRooms = [this.name];
                }
                else if(remoteRooms[type][this.name] == undefined || !remoteRooms[type][this.name].length){
                    console.log('No target rooms specified for ' + type + ' ' + ' of room ' + this.name);
                    return; 
                }
                else {
                    targetRooms = remoteRooms[type][this.name];
                }
                let temp = this.calcCreepsToSpawn[role](targetRooms,this.name,type);
                //console.log('Set creepsToSpawn of type ' + type + ' and role ' + role + ' to ' + temp + ' in room ' + this.name);
                creepsToSpawn[this.name][type][role] = temp;
                //creepsToSpawn[this.name][type][role] = this.calcCreepsToSpawn[role](targetRooms);
            }
        }
    }
};

Room.prototype.calcCreepsToSpawn = {
    //Determine number of creeps to spawn
    //Should take into account not to strain the spawn to much
    'harvester': function(targetRooms){
        //Spawn number of harvesters equal to the number of sources in rooms
        let nHarv = 0;
        for(let i=0; i<targetRooms.length; i++){
            let room = Game.rooms[targetRooms[i]];
            if(!room){
                let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(targetRooms[i]);
                let isHighway = (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
                if(!isHighway){
                    //Room will contain at least 1 source. Send harvester to explore
                    nHarv++;
                }
            }
            else if(room.sources){
                let sources = room.sources;
                for(let j=0; j<sources.length; j++){
                    if(sources[j]){
                        nHarv++;
                    }
                }
            }
        }
        //console.log(targetRooms + ' nHarvester ' + nHarv);
        return nHarv;
    },
    'hauler': function(targetRooms){
        //Spawn haulers based in number of sources and distance to sources
        
    },
    'transporter': function(targetRooms){
        //Spawn transporters based on energy comming into room -> will do filler tasks if own tasks are done
    },
    'filler': function(targetRooms){
        //Spawn based on energy going into spawns and extensions -> will do part of transporter tasks if own tasks are done
        
    },
    'courier': function(targetRooms){
        //Spawn if there is a terminal in the room -> will also take role of transporter
        
    },
    'labWorker': function(targetRooms){
        //Spawn if labs are in room -> will also take role of filler
        
    },
    'repairer': function(targetRooms,orRoom,type){
        //Spawn based on number of decaying structures in room -> will do builder tasks if done repairing & building & dismantling
        let origin = Game.rooms[orRoom];
        if(!origin){return 0}
        let percOnSwamp = 0.5; //Assumption (calculating this per room will take to much time)
        let repairerEfficiency = 0.5; //Assumption that repairer is only actively repairing 50% of the time
        let nVis = 0;
        let damage = util.gatherObjectsInArray(origin.structures,STRUCTURE_SPAWN).length * CREEP_LIFE_TIME / CREEP_SPAWN_TIME * ROAD_DECAY_AMOUNT / ROAD_DECAY_TIME * (1 + percOnSwamp * (CONSTRUCTION_COST_ROAD_SWAMP_RATIO - 1)); //Damage from creeps walking on roads
        //console.log(orRoom + ' base damage from walking creeps ' + damage);
        for(let i=0; i<targetRooms.length; i++){
            let room = Game.rooms[targetRooms[i]];
            if(room != undefined){
                nVis++;
                let nRoads = util.gatherObjectsInArray(room.structures,STRUCTURE_ROAD).length;
                let nCont = util.gatherObjectsInArray(room.structures,STRUCTURE_CONTAINER).length;
                let nRamp = util.gatherObjectsInArray(room.structures,STRUCTURE_RAMPART).length;
                //console.log(targetRooms[i] + ' nRoads ' + nRoads + ' nCont ' + nCont + ' nRamp ' + nRamp);
                damage += nRoads * ROAD_DECAY_AMOUNT / ROAD_DECAY_TIME * (1 + percOnSwamp * (CONSTRUCTION_COST_ROAD_SWAMP_RATIO - 1));
                damage += nRamp * RAMPART_DECAY_AMOUNT / RAMPART_DECAY_TIME;
                if(room.controller && room.controller.my){
                    damage += nCont * CONTAINER_DECAY / CONTAINER_DECAY_TIME_OWNED;
                }
                else {
                    damage += nCont * CONTAINER_DECAY / CONTAINER_DECAY_TIME;
                }
            }
        }
        if(nVis){
            damage *= targetRooms.length / nVis;
        }
        else {
            damage += targetRooms.length * DEFAULT_DECAY;
        }
        let nWork = Math.ceil(damage / REPAIR_POWER / repairerEfficiency);
        let maxWork = Math.min(Math.floor(origin.energyCapacityAvailable / (BODYPART_COST[WORK] + BODYPART_COST[CARRY] + BODYPART_COST[MOVE])),Math.floor(MAX_CREEP_SIZE/3));
        let nRep = Math.ceil(nWork / maxWork);
        let nWorkPerCreep = Math.ceil(nWork / nRep);
        let body = util.generateBody({[CARRY]: nWorkPerCreep, [WORK]: nWorkPerCreep, [MOVE]: nWorkPerCreep});
        if(!creepBodies[orRoom]){
            creepBodies[orRoom] = {[type]: {'repairer': body}};
        }
        else if(!creepBodies[orRoom][type]){
            creepBodies[orRoom][type] = {'repairer': body};
        }
        else {
            creepBodies[orRoom][type]['repairer'] = body;
        }
        //console.log(orRoom + ' needs ' + nRep + ' ' + type + ' repairers with ' + nWorkPerCreep + ' work parts to repair ' + damage + ' damage. Total needed work parts is ' + nWork + '. Max work parts is ' + maxWork);
        return nRep;
    },
    'builder': function(targetRooms){
        //Spawn based on number of structures to be build -> will do upgrading tasks if done building & repairing & dismantling
        
    },
    'upgrader': function(targetRooms,orRoom,type){
        //Spawn based on RCL and energy in storage (if build) (or on energy coming in and going out)
        let nUpgrader = 0;
        for(let i=0; i<targetRooms.length; i++){
            let room = Game.rooms[targetRooms[i]];
            if(room){nUpgrader++}
        }

        if(targetRooms.length == 1 && targetRooms[0] == orRoom){
            //Creep in origin room
            let origin = Game.rooms[orRoom];
            if(origin.controller.level == 8 && origin.mineralsInRoom[RESOURCE_CATALYZED_GHODIUM_ACID] > 0){
                let boost = {[WORK]: RESOURCE_CATALYZED_GHODIUM_ACID};
                if(!addCreepMemory[orRoom]){
                    addCreepMemory[orRoom] = {[type]: {'upgrader': {'boost': boost}}};
                }
                else if(!addCreepMemory[orRoom][type]){
                    addCreepMemory[orRoom][type] = {'upgrader': {'boost': boost}};
                }
                else {
                    addCreepMemory[orRoom][type]['upgrader'] = {'boost': boost};
                }
            }
        }
        return nUpgrader;
    },
    'miner': function(targetRooms){
        //Spawn based on number of active mines
        let nMiners = 0;
        for(let i=0; i<targetRooms.length; i++){
            let room = Game.rooms[targetRooms[i]];
            if(room && room.mineral){
                let mines = room.mineral;
                for(let j=0; j<mines.length; j++){
                    if(mines[j].mineralAmount > 0){
                        nMiners++;
                    }
                }
            }
            //else? This is a dark room. Will always send at least 1 harvester to check
        }
        //console.log(targetRooms + ' miners ' + nMiners);
        return nMiners;
    },
    'combat': function(targetRooms){
        //Spawn based on threat
    },
    'reserver': function(targetRooms,orRoom,type){
        //Spawn based on number of rooms that have to be reserved and the state of the reservation in that room
        let origin = Game.rooms[orRoom];
        if(!origin){return targetRooms.length}
        let maxClaim = Math.min(Math.floor(origin.energyCapacityAvailable / (BODYPART_COST[CLAIM] + BODYPART_COST[MOVE])), Math.floor(MAX_CREEP_SIZE/2));
        let maxReserve = Math.min(CREEP_CLAIM_LIFE_TIME * (CONTROLLER_RESERVE * maxClaim - 1), CONTROLLER_RESERVE_MAX - CONTROLLER_RESERVE_MIN);
        let nClaim = Math.floor((maxReserve / CREEP_CLAIM_LIFE_TIME + 1) / CONTROLLER_RESERVE);
        let nRes = origin.reservingRooms.length;
        //Set body of creeps
        //console.log(util.generateBody({CLAIM: nClaim, MOVE: nClaim}));
        if(!creepBodies[orRoom]){
            creepBodies[orRoom] = {[type]: {'reserver': util.generateBody({[CLAIM]: nClaim, [MOVE]: nClaim})}};
        }
        else if(!creepBodies[orRoom][type]){
            creepBodies[orRoom][type] = {'reserver': util.generateBody({[CLAIM]: nClaim, [MOVE]: nClaim})};
        }
        else {
            creepBodies[orRoom][type]['reserver'] = util.generateBody({[CLAIM]: nClaim, [MOVE]: nClaim});
        }
        for(let i=0; i<targetRooms.length; i++){
            if(util.findDifferentString(targetRooms.slice(i,i+1),origin.reservingRooms) == ERR_NOT_FOUND){
                continue;
            }
            let targetRoom = Game.rooms[targetRooms[i]];
            //console.log(targetRooms[i] + ' ', CONTROLLER_RESERVE_MAX - targetRoom.controller.reservation.ticksToEnd);
            if(targetRoom && targetRoom.controller && ((!targetRoom.controller.reservation && !targetRoom.controller.owner ) || (targetRoom.controller.reservation && targetRoom.controller.reservation.username == 'Vervust' && CONTROLLER_RESERVE_MAX - targetRoom.controller.reservation.ticksToEnd >= maxReserve))){
                nRes++;
                origin.reservingRooms.push(targetRooms[i]);
                //console.log('New reserve ' + targetRooms[i]);
            }
        }
        /*if(nRes > 0){
            console.log(orRoom + ' maxReserve ' + maxReserve + ' nClaim ' + nClaim);
            console.log('Need ' + nRes + ' reservers from room ' + orRoom);
            console.log('Reserving ' + origin.reservingRooms);
        }*/
        return nRes;
    },
    'dismantler': function(targetRooms){
        return 0;
    },
    'patroller': function(targetRooms){
        //Spawn based on number of SK rooms
        return targetRooms.length;
    },
    'patrollerRanged': function(targetRooms){
        //Spawn based on number of SK rooms
        return targetRooms.length;
    },
    'startUp': function(targetRooms){
        return 0;
    },
    'drainer': function(targetRooms){
        return 0;
    }
};