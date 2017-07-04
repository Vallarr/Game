Room.prototype.build = function(){
    let nConstructionSites = 0
    for(let site in Game.constructionSites){nConstructionSites++}
    if(nConstructionSites >= MAX_CONSTRUCTION_SITES){return}
    //Structure planning

    let structures = _.filter(plannedStructures, (structure) => structure.room == this.name);
    plannedStructures = _.filter(plannedStructures, (structure) => structure.room != this.name);
    
    while(structures.length && structures[0].buildings.length){
        let struct = structures[0].buildings.shift();
        let level = undefined;
        if(this.controller){
            level = this.controller.level;
        }
        else {
            level = 0;
        }                
        if(struct.RCL <= level){
            let nBuild = undefined;
            if(this.structures[struct.structureType]){
                nBuild = this.structures[struct.structureType].length;
            }
            else {
                nBuild = 0;
            }

            let nToBeBuild = this.find(FIND_CONSTRUCTION_SITES, {
                filter: (site) => {
                    return (site.structureType == struct.structureType);
                }
            }).length;
            let nAllowed = CONTROLLER_STRUCTURES[struct.structureType][level];
            //console.log(struct.structureType + ' ' + nBuild + ' ' + nToBeBuild + ' ' + nAllowed);
            for(let i=0; i<struct.pos.x.length && (nBuild + nToBeBuild) < nAllowed; i++){
                let lookStruct = [];
                if(struct.structureType == STRUCTURE_RAMPART){
                    lookStruct = this.lookForAt(LOOK_STRUCTURES,struct.pos.x[i],struct.pos.y[i]).filter((structure) => {return structure.structureType == STRUCTURE_RAMPART});
                }
                else if(struct.structureType == STRUCTURE_ROAD){
                    lookStruct = this.lookForAt(LOOK_STRUCTURES,struct.pos.x[i],struct.pos.y[i]).filter((structure) => {return structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_CONTAINER});
                }
                else if(struct.structureType == STRUCTURE_CONTAINER){
                    lookStruct = this.lookForAt(LOOK_STRUCTURES,struct.pos.x[i],struct.pos.y[i]).filter((structure) => {return structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_ROAD});
                }
                else {
                    lookStruct = this.lookForAt(LOOK_STRUCTURES,struct.pos.x[i],struct.pos.y[i]).filter((structure) => {return structure.structureType != STRUCTURE_RAMPART});
                }
                let lookSite = this.lookForAt(LOOK_CONSTRUCTION_SITES,struct.pos.x[i],struct.pos.y[i]);
                if(!lookStruct.length && !lookSite.length){
                    let rtn = this.createConstructionSite(struct.pos.x[i],struct.pos.y[i],struct.structureType);
                    console.log('Building ' + struct.structureType + ' at position x=' + struct.pos.x[i] + ' y=' + struct.pos.y[i] + ' in room ' + this + ' in game tick ' + Game.time + ' ' + rtn);
                    nToBeBuild++;
                }
            }
        }
    }
};