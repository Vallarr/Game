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
                if(structure.structureType != STRUCTURE_ROAD && structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_CONTAINER){
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

Object.defineProperty(roomObjectContainer.prototype, 'CostMatrix', {
    get: function(){
        if(this === roomObjectContainer.prototype || this == undefined){return}
        if(!this._CostMatrix){
            let costs = this.baseCostMatrix.clone();
            this.creeps.forEach((c) => {
                if(!c.my && !ALLIES[c.owner.username]){
                    for(let i=-4; i<5; i++){
                        for(let j=-4; j<5; j++){
                            costs.set(c.pos.x+i,c.pos.y+j,0xff);
                        }
                    }
                }
            });
            this._CostMatrix = costs;
        }
        return this._CostMatrix;
    },
    set: function(value){
        this._CostMatrix = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(roomObjectContainer.prototype, 'CombatCostMatrix', {
    get: function(){
        if(this === roomObjectContainer.prototype || this == undefined){return}
        if(!Memory.rooms[this.roomName].underAttack){
            return this.CostMatrix;
        }
        else if(!this._CombatCostMatrix){
            let costs = this.baseCostMatrix.clone();
            this.creeps.forEach((c) => {
                costs.set(c.pos.x, c.pos.y, 0xff);
            });
        }
        return this._CombatCostMatrix;
    },
    set: function(value){
        this._CombatCostMatrix = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(roomObjectContainer.prototype, 'containers', {
    get: function(){
        if(this === roomObjectContainer.prototype || this == undefined){return}
        if(!this._containers && Game.rooms[this.roomName]){
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
                    upgraderContainers : util.targetsInRange(containers,[room.controller],2);
                }
                else {upgraderContainers = []}
                containers = util.findArrayOfDifferentElements(containers,sourceContainers.concat(mineralContainers,upgraderContainers));
                let spawnContainers = util.targetsInRange(containers,spawns,3);
                containers = util.findArrayOfDifferentElements(containers,spawnContainers);
                
                this._containers = {};
                this._containers.source = sourceContainers.concat(containers).map((c) => c.id);
                this._containers.mineral = mineralContainers.map((c) => c.id);
                this._containers.spawn = spawnContainers.map((c) => c.id);
                this._containers.upgrader = upgraderContainers.map((c) => c.id);
                if(room.storage){this._containers.storage = room.storage.id}
            }
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
            let links = room.structures[STRUCTURE_LINK].filter((l) => l.my);
            let sources = room.sources;
            let spawns = room.structures[STRUCTURE_SPAWN];
            if(spawns == undefined){spawns = []}
            
            if(links){
                let sourceLinks = util.targetsInRange(links,sources,2);
                let storageLinks;
                if(room.storage){
                    storageLinks = util.targetsInRange(links,[room.storage],1);
                }
                else {storageLinks = []}
                let upgraderLinks;
                if(room.controller){
                    upgraderLinks = util.targetsInRange(links,[room.controller],2);
                }
                else {upgraderLinks = []}
                links = util.findArrayOfDifferentElements(links,sourcesLinks.concat(storageLinks,upgraderLinks));
                let spawnLinks = util.targetsInRange(links,spawns,3);
                links = util.findArrayOfDifferentElements(links,spawnLinks);
                
                this._links = {};
                this._links.source = sourceLinks.map((l) => l.id);
                this._links.storage = storageLinks.map((l) => l.id);
                this._links.upgrader = upgraderLinks.map((l) => l.id);
                this._links.spawn = spawnLinks.map((l) => l.id);
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
                
                this._labs = {};
                this._labs.source = sourceLabs.map((l) => l.id);
                this._labs.target = targetLabs.map((l) => l.id);
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

module.exports = roomObjectContainer;