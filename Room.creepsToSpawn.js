Room.prototype.checkCreepsToSpawn = function(){
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
                let temp = this.calcCreepsToSpawn[role](targetRooms);
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
            if(roomObjects[targetRooms[i]] && roomObjects[targetRooms[i]].sources){
                let sources = util.gatherObjectsInArrayFromIds(roomObjects[targetRooms[i]].sources,'energy');
                for(let j=0; j<sources.length; j++){
                    if(sources[j]){
                        nHarv++;
                    }
                }
            }
            else if(!Game.rooms[targetRooms[i]]){
                let parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(targetRooms[i]);
                let isHighway = (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
                if(!isHighway){
                    //Room will contain at least 1 source. Send harvester to explore
                    nHarv++;
                }
            }
        }
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
    'repairer': function(targetRooms){
        //Spawn based on number of decaying structures in room -> will do builder tasks if done repairing & building & dismantling
        
    },
    'builder': function(targetRooms){
        //Spawn based on number of structures to be build -> will do upgrading tasks if done building & repairing & dismantling
        
    },
    'upgrader': function(targetRooms){
        //Spawn based on RCL and energy in storage (if build) (or on energy coming in and going out)
        
    },
    'miner': function(targetRooms){
        //Spawn based on number of active mines
        let nMiners = 0;
        for(let i=0; i<targetRooms.length; i++){
            if(roomObjects[targetRooms[i]] && roomObjects[targetRooms[i]].sources){
                let mines = util.gatherObjectsInArrayFromIds(roomObjects[targetRooms[i]].sources,'mineral');
                for(let j=0; j<mines.length; j++){
                    if(mines[j].mineralAmount > 0){
                        nMiners++;
                    }
                }
            }
            //else? This is a dark room. Will always send at least 1 harvester to check
        }
        return nMiners;
    },
    'combat': function(targetRooms){
        //Spawn based on threat
    },
    'reserver': function(targetRooms){
        //Spawn based on number of rooms that have to be reserved
        return targetRooms.length;
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