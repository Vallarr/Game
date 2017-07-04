var roomObjectContainer = function(roomName) {
    this.roomName = roomName;
};

Object.defineProperty(roomObjectContainer.prototype, 'structures', {
    get: function(){
        if(this === roomObjectContainer.prototype || this == undefined){return}
        if(!this._structures && Game.rooms[this.roomName]){
            let structures = Game.rooms[this.roomName].find(FIND_STRUCTURES);
            this._structures = {};
            for(let i=0; i<structures.length; i++){
                if(this._structures[structures[i].structureType] == undefined){
                    this._structures[structures[i].structureType] = [structures[i].id];
                }
                else {
                    this._structures[structures[i].structureType].push(structures[i].id);
                }
            }
        }
        return this._structures;
    },
    set: function(value){
        this._structures = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(roomObjectContainer.prototype, 'constructionSites', {
    get: function(){
        if(this === roomObjectContainer.prototype || this == undefined){return}
        if(!this._constructionSites){
            if(Game.rooms[this.roomName]){
                this._constructionSites = Game.rooms[this.roomName].find(FIND_CONSTRUCTION_SITES).map(site => site.id);
            }
            else {
                this._constructionSites = [];
                for(let site in Game.constructionSites){
                    if(this.roomName == Game.constructionSites[site].pos.roomName){
                        this._constructionSites.push(site);
                    }
                }
            }
        }
        return this._constructionSites;
    },
    set: function(value){
        this._constructionSites = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(roomObjectContainer.prototype, 'baseCostMatrix', {
    get: function(){
        if(this === roomObjectContainer.prototype || this == undefined){return}
        if(!this._baseCostMatrix){
            let costs = new PathFinder.CostMatrix();
            for(let structureType in this.structures){
                let structures = util.getArrayObjectsById(this.structures[structureType]);
                for(let i=0; i<structures.length; i++){
                    if(structureType == STRUCTURE_ROAD) {
                        // Favor roads over plain tiles
                        costs.set(structures[i].pos.x, structures[i].pos.y, 1);
                    }
                    else if (structureType == STRUCTURE_WALL) {
                        costs.set(structures[i].pos.x, structures[i].pos.y, 0xff);
                    }
                    else if (structureType !== STRUCTURE_CONTAINER && (structureType !== STRUCTURE_RAMPART || !structures[i].my)) {
                        // Can't walk through non-walkable buildings
                        costs.set(structures[i].pos.x, structures[i].pos.y, 0xff);
                    } 
                }
            }
            // Avoid construction sites
            this.constructionSites.forEach((s) => {
                let structure = Game.constructionSites[s];
                if(structure && structure.structureType != STRUCTURE_ROAD && structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_CONTAINER){
                    costs.set(structure.pos.x, structure.pos.y, 0xff);
                }
            });
            this._baseCostMatrix = costs;
        }
        return this._baseCostMatrix;
    },
    set: function(value){
        this._baseCostMatrix = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(roomObjectContainer.prototype, 'containers', {
    get: function(){
        if(this === roomObjectContainer.prototype || this == undefined){return}
        if(!this._containers && Game.rooms[this.roomName]){
            this._containers = {};
            let room = Game.rooms[this.roomName];
            let containers = room.structures[STRUCTURE_CONTAINER];
            let sources = room.sources;
            let mineral = room.mineral;
            let spawns = room.structures[STRUCTURE_SPAWN];
            if(spawns == undefined){spawns = []}

            if(containers){
                let sourceContainers = util.targetsInRange(containers,sources,2);
                let mineralContainers = util.targetsInRange(containers,mineral,2);
                let upgraderContainers;
                if(room.controller) {
                    upgraderContainers = util.targetsInRange(containers,[room.controller],2);
                }
                else {upgraderContainers = []}
                containers = util.findArrayOfDifferentElements(containers,sourceContainers.concat(mineralContainers,upgraderContainers));
                let spawnContainers = util.targetsInRange(containers,spawns,3);
                containers = util.findArrayOfDifferentElements(containers,spawnContainers);
                
                if(transitioned[this.roomName]){
                    this._containers.source = sourceContainers.map((c) => c.id);
                    this._containers.spawn = spawnContainers.concat(containers).map((c) => c.id);
                }
                else {
                    this._containers.source = sourceContainers.concat(containers).map((c) => c.id);
                    this._containers.spawn = spawnContainers.map((c) => c.id);
                }
                this._containers.mineral = mineralContainers.map((c) => c.id);
                this._containers.upgrader = upgraderContainers.map((c) => c.id);
            }
            if(room.storage){this._containers.storage = [room.storage.id]}
        }
        return this._containers;
    },
    set: function(value){
        this._containers = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(roomObjectContainer.prototype, 'links', {
    get: function(){
        if(this === roomObjectContainer.prototype || this == undefined){return}
        if(!this._links){
            let room = Game.rooms[this.roomName];
            let links = room.structures[STRUCTURE_LINK];
            let sources = room.sources;
            let spawns = room.structures[STRUCTURE_SPAWN];
            if(spawns == undefined){spawns = []}
            
            if(links){
                links = links.filter((l) => l.my);
                let sourceLinks = util.targetsInRange(links,sources,2);
                links = util.findArrayOfDifferentElements(links,sourceLinks);
                let storageLinks;
                if(room.storage){
                    let targets = [room.storage];
                    if(room.terminal){targets.push(room.terminal)}
                    storageLinks = util.targetsInRange(links,targets,1);
                }
                else {storageLinks = []}
                links = util.findArrayOfDifferentElements(links,storageLinks);
                let upgraderLinks;
                if(room.controller){
                    upgraderLinks = util.targetsInRange(links,[room.controller],2);
                }
                else {upgraderLinks = []}
                links = util.findArrayOfDifferentElements(links,upgraderLinks);
                let spawnLinks = util.targetsInRange(links,spawns,3);
                links = util.findArrayOfDifferentElements(links,spawnLinks);
                
                this._links = {};
                if(transitioned[this.roomName]){
                    this._links.source = sourceLinks.map((l) => l.id);
                    this._links.spawn = spawnLinks.concat(links).map((l) => l.id);
                }
                else {
                    this._links.source = sourceLinks.concat(links).map((l) => l.id);
                    this._links.spawn = spawnLinks.map((l) => l.id);
                }
                this._links.storage = storageLinks.map((l) => l.id);
                this._links.upgrader = upgraderLinks.map((l) => l.id);
            }
        }
        return this._links;
    },
    set: function(value){
        this._links = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(roomObjectContainer.prototype, 'labs', {
    get: function(){
        if(this === roomObjectContainer.prototype || this == undefined){return}
        if(!this._labs){
            //Auto detect source labs, destination and boosting labs. Always use same setup on 4x4 space (L=lab,R=road,0=empty/whatever)
            // RCL7         RCL8
            //R L L 0      R L L 0
            //0 R L 0      L R L L
            //0 L R 0      L L R L
            //0 L L R      0 L L R
            let room = Game.rooms[this.roomName];
            let labs = room.structures[STRUCTURE_LAB];
            if(labs){
                let sourceLabs = [];
                for(let i=0; i<labs.length && sourceLabs.length<2; i++){
                    if(util.targetsInRange(labs,labs.slice(i,i+1),2).length == labs.length){
                        sourceLabs.push(labs[i]);
                    }
                }
                let targetLabs = util.findArrayOfDifferentElements(labs,sourceLabs);
                let nBoosts = 0;
                if(room.memory.prepBoosts){
                    for(let boost in room.memory.prepBoosts){
                        nBoosts++;
                    }
                }
                let boostLabs = targetLabs.splice(0,nBoosts);
                
                /*if(room.name == 'W17N4'){
                    console.log(nBoosts + ' labs ' + boostLabs);
                    console.log('Source ' + sourceLabs);
                    console.log('target ' + targetLabs);
                }*/
                
                this._labs = {};
                this._labs.source = sourceLabs.map((l) => l.id);
                this._labs.target = targetLabs.map((l) => l.id);
                this._labs.boost = boostLabs.map((l) => l.id);
            }
        }
        return this._labs;
    },
    set: function(value){
        this._labs = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(roomObjectContainer.prototype, 'dropped', {
    get: function(){
        if(this === roomObjectContainer.prototype || this == undefined){return}
        if(!this._dropped){
            this._dropped = Game.rooms[this.roomName].find(FIND_DROPPED_RESOURCES).map((r) => r.id);
        }
        return this._dropped;
    },
    set: function(value){
        this._dropped = value;
    },
    enumerable: false,
    configurabel: true
});

Object.defineProperty(roomObjectContainer.prototype, 'dmgStructures', {
    get: function(){
        if(this === roomObjectContainer.prototype || this == undefined){return}
        if(!this._dmgStructures){
            if(defStructHits[this.roomName] == undefined){
                let room = Game.rooms[this.roomName];
                if(room && room.controller && room.controller.my){
                    console.log('No hits defined for defensive structures in room ' + this.name + '. Using default of 30K hits');
                    defStructHits[this.roomName] = {walls: 30000, ramparts: 30000};
                }
                else{defStructHits[this.roomName] = {walls: 1, ramparts: 1}}
            }

            if(!Memory.rooms[this.roomName].dmgStructures){
                Memory.rooms[this.roomName].dmgStructures = [];
            }
            //Search for structures to be repaired
            //1st remove completely repaired structures from list
            //Also remove structures that no longer exist
            Memory.rooms[this.roomName].dmgStructures = _.filter(Memory.rooms[this.roomName].dmgStructures, (id) => {
                let structure = Game.getObjectById(id);
                if(structure == undefined){
                    return false;
                }
                if(GCL_FARM[this.roomName] && !structure.isActive()){return false}
                if(structure.owner && !structure.my){return false}        
                let hitFrac = 1.0;
                if(structure.structureType == STRUCTURE_WALL){
                    hitFrac *= defStructHits[this.roomName].walls/structure.hitsMax;
                }
                else if(structure.structureType == STRUCTURE_RAMPART){
                    if(rampartHits[this.roomName] && rampartHits[this.roomName][structure.id]){
                        hitFrac *= Math.min(rampartHits[this.roomName][structure.id],structure.hitsMax)/structure.hitsMax;
                    }
                    else {
                        hitFrac *= Math.min(defStructHits[this.roomName].ramparts,structure.hitsMax)/structure.hitsMax;
                    }
                }
                return structure.hits < hitFrac * structure.hitsMax;            
            });

            //Find all structures which have hits below the treshold
            let damagedStructures = [];
            for(let structureType in this.structures){
                damagedStructures = damagedStructures.concat(this.structures[structureType].filter((id) => {
                    let structure = Game.getObjectById(id);
                    if(!structure){return false}
                    if(GCL_FARM[this.roomName] && !structure.isActive()){return false}
                    if(structure.owner && !structure.my){return false}
                    let hitFrac = 1/2;
                    if(structure.structureType == STRUCTURE_WALL){
                        hitFrac *= 2*defStructHits[this.roomName].walls/structure.hitsMax;
                    }
                    else if(structure.structureType == STRUCTURE_RAMPART){
                        if(rampartHits[this.roomName] && rampartHits[this.roomName][structure.id]){
                            hitFrac *= 2*0.9*Math.min(rampartHits[this.roomName][structure.id],structure.hitsMax)/structure.hitsMax;
                        }
                        else {
                            hitFrac *= 2*0.9*Math.min(defStructHits[this.roomName].ramparts,structure.hitsMax)/structure.hitsMax;
                        }
                    }
                    return structure.hits < hitFrac * structure.hitsMax;            
                }));
            }
            
            damagedStructures = util.getArrayObjectsById(damagedStructures);
            let dismantleStructures = undefined;
            if(dismantle[this.roomName]){
                dismantleStructures = util.getArrayObjectsById(dismantle[this.roomName].ids);
            }
            else {dismantleStructures = []}
            damagedStructures = util.findArrayOfDifferentElements(damagedStructures,dismantleStructures);
            
            for(let i=0; i<damagedStructures.length; i++){
                let match = false;
                for(let j=0; j<Memory.rooms[this.roomName].dmgStructures.length && !match; j++){
                    match = damagedStructures[i].id == Memory.rooms[this.roomName].dmgStructures[j];
                }
                if(!match){
                    //New repair
                    Memory.rooms[this.roomName].dmgStructures.push(damagedStructures[i].id);
                }
            }
            this._dmgStructures = Memory.rooms[this.roomName].dmgStructures;
        }
        return this._dmgStructures;
    },
    set: function(value){
        this._dmgStructures = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(roomObjectContainer.prototype, 'criticalRepairs', {
    get: function(){
        if(this === roomObjectContainer.prototype || this == undefined){return}
        if(!this._criticalRepairs){
            if(!Memory.rooms[this.roomName].criticalRepairs){
                Memory.rooms[this.roomName].criticalRepairs = [];
            }
            Memory.rooms[this.roomName].criticalRepairs = this.dmgStructures.filter((st) => {
                let structure = Game.getObjectById(st);
                let hitFrac = 0.1;
                if(structure.structureType == STRUCTURE_WALL){
                    hitFrac *= defStructHits[this.roomName].walls/structure.hitsMax;
                }
                else if(structure.structureType == STRUCTURE_RAMPART){
                    hitFrac *= defStructHits[this.roomName].ramparts/structure.hitsMax;
                }
                return structure.hits < hitFrac * structure.hitsMax;        
            });
            this._criticalRepairs = Memory.rooms[this.roomName].criticalRepairs;
        }
        return this._criticalRepairs;
    },
    set: function(value){
        this._criticalRepairs = value;
    },
    enumerable: false,
    configurable: true
});

module.exports = roomObjectContainer;