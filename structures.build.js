var plannedStructures = [{room: 'W15N8', buildings: 
                        [{structureType: STRUCTURE_EXTENSION, pos: {x: [13,14,14,15,16], 
                                                                    y: [31,30,32,31,30]},
                                                                    RCL: 2},
                        {structureType: STRUCTURE_EXTENSION, pos: {x: [12,12,12,13,15], 
                                                                    y: [30,32,33,33,33]},
                                                                    RCL: 3},     
                        {structureType: STRUCTURE_EXTENSION, pos: {x: [16,16,17,17,18,18,18,18,19,19], 
                                                                    y: [32,33,31,33,30,31,32,34,31,33]},
                                                                    RCL: 4},  
                        {structureType: STRUCTURE_EXTENSION, pos: {x: [16,17,18,19,19,20,20,20,20,20], 
                                                                    y: [34,35,35,35,29,29,30,32,33,34]},
                                                                    RCL: 5},
                        {structureType: STRUCTURE_EXTENSION, pos: {x: [21,21,21,22,22,22,22,22,11,11], 
                                                                    y: [29,31,33,28,30,31,32,34,31,33]},
                                                                    RCL: 6}, 
                        {structureType: STRUCTURE_EXTENSION, pos: {x: [], 
                                                                    y: []},
                                                                    RCL: 7},  
                        {structureType: STRUCTURE_EXTENSION, pos: {x: [], 
                                                                    y: []},
                                                                    RCL: 8},    
                        {structureType: STRUCTURE_STORAGE, pos: {x: [17], y: [27]}, RCL: 4},                                                                    
                        {structureType: STRUCTURE_CONTAINER, pos: {x: [7,17,14,29], y: [22,24,31,43]}, RCL: 1},
                        {structureType: STRUCTURE_CONTAINER, pos: {x: [], y: []}, RCL: 3},
                        {structureType: STRUCTURE_TOWER, pos: {x: [], y: []}, RCL: 1},
                        {structureType: STRUCTURE_RAMPART, pos: {x: [], y: []}, RCL: 3},
                        {structureType: STRUCTURE_SPAWN, pos: {x: [], y: []}, RCL: 7},                        
                        {structureType: STRUCTURE_ROAD, pos: {  x: [11,12,13,14,14,15,16,17,17,18,17,10,9,8,7,7,6,7,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,31,30],
                                                                y: [26,27,28,27,29,28,27,26,25,24,23,26,26,25,24,23,22,21,29,28,29,30,31,32,33,34,35,34,34,35,36,37,38,39,40,41,42]}, RCL: 1},
                        {structureType: STRUCTURE_ROAD, pos: {  x: [12,13,13,14,15,15,16],
                                                                y: [31,30,32,33,30,32,31]}, RCL: 2},
                        {structureType: STRUCTURE_ROAD, pos: {  x: [17,17,17,18,18],
                                                                y: [30,32,34,27,33]}, RCL: 3},
                        {structureType: STRUCTURE_ROAD, pos: {  x: [19,19,19,20,20],
                                                                y: [28,32,34,28,35]}, RCL: 4},
                        {structureType: STRUCTURE_ROAD, pos: {  x: [],
                                                                y: []}, RCL: 5},
                        {structureType: STRUCTURE_ROAD, pos: {  x: [21,21,21,21,22,22,11,11,12],
                                                                y: [28,30,32,34,29,33,30,32,29]}, RCL: 6},                                                                
                        {structureType: STRUCTURE_ROAD, pos: {  x: [],
                                                                y: []}, RCL: 7}]}
                        ];
 
 var buildStructures = {
    
    run: function(){
        //Structure planning

        //console.log(plannedStructures);
        for(let name in Game.rooms){
            let structures = _.filter(plannedStructures, (structure) => structure.room == name);
            plannedStructures = _.filter(plannedStructures, (structure) => structure.room != name);
            
            while(structures.length && structures[0].buildings.length){
                let struct = structures[0].buildings.shift();
                let level = undefined;
                if(Game.rooms[name].controller){
                    level = Game.rooms[name].controller.level;
                }
                else {
                    level = 0;
                }                
                if(struct.RCL <= level){
                    let nBuild = Game.rooms[name].find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == struct.structureType);
                        }
                    }).length;
                    let nToBeBuild = Game.rooms[name].find(FIND_CONSTRUCTION_SITES, {
                        filter: (site) => {
                            return (site.structureType == struct.structureType);
                        }
                    }).length;
                    let nAllowed = CONTROLLER_STRUCTURES[struct.structureType][level];
                    //console.log(struct.structureType + ' ' + nBuild + ' ' + nToBeBuild + ' ' + nAllowed);
                    for(let i=0; i<struct.pos.x.length && (nBuild + nToBeBuild) < nAllowed; i++){
                        let lookStruct = [];
                        if(struct.structureType == STRUCTURE_RAMPART){
                            lookStruct = Game.rooms[name].lookForAt(LOOK_STRUCTURES,struct.pos.x[i],struct.pos.y[i]).filter((structure) => {return structure.structureType == STRUCTURE_RAMPART || structure.structureType == STRUCTURE_WALL});
                        }
                        else {
                            lookStruct = Game.rooms[name].lookForAt(LOOK_STRUCTURES,struct.pos.x[i],struct.pos.y[i]).filter((structure) => {return structure.structureType != STRUCTURE_RAMPART});
                        }
                        let lookSite = Game.rooms[name].lookForAt(LOOK_CONSTRUCTION_SITES,struct.pos.x[i],struct.pos.y[i]);
                        if(!lookStruct.length && !lookSite.length){
                            Game.rooms[name].createConstructionSite(struct.pos.x[i],struct.pos.y[i],struct.structureType);
                            console.log('Building ' + struct.structureType + ' at position x=' + struct.pos.x[i] + ' y=' + struct.pos.y[i] + ' in room ' + Game.rooms[name] + ' in game tick ' + Game.time);
                            nToBeBuild++;
                        }
                    }                    
                    
                }
            }
        }
    }
 }
 
 
 
 module.exports = buildStructures;