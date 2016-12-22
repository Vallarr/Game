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
                            lookStruct = Game.rooms[name].lookForAt(LOOK_STRUCTURES,struct.pos.x[i],struct.pos.y[i]).filter((structure) => {return structure.structureType == STRUCTURE_RAMPART});
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