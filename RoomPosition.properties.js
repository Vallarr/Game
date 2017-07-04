RoomPosition.prototype.closestByRange = function(targets, cutOffRange){
    //Find target closest to this position based on linear distance
    //This search can span multiple rooms
    if(targets == undefined || !Array.isArray(targets) || !targets.length){
        return null;
    }
    
    let closest = undefined;
    let closestRange = undefined;
    let distance = undefined;
    let range = undefined;
    for(let i=0; i<targets.length; i++){
        if(this.roomName == targets[i].pos.roomName){
            distance = Math.sqrt(Math.pow(this.x - targets[i].pos.x,2) + Math.pow(this.y - targets[i].pos.y,2));
            if(cutOffRange != undefined){
                range = Math.max(Math.abs(this.x - targets[i].pos.x),Math.abs(this.y - targets[i].pos.y));
                if(range <= cutOffRange){
                    return targets[i];
                }
            }            
        }
        else {
            let fromRoom = this.coordinatesFromRoomName();
            let toRoom = targets[i].pos.coordinatesFromRoomName;
            let horRoomDev = undefined;
            let vertRoomDev = undefined;
            if(fromRoom.horDir == toRoom.horDir){
                horRoomDev = toRoom.horCoord - fromRoom.horCoord;
                if(fromRoom.horDir == 'W') {horRoomDev*=-1}
            }
            else {
                horRoomDev = toRoom.horCoord + fromRoom.horCoord + 1;
                if(fromRoom.horDir == 'E') {horRoomDev*=-1}
            }
            if(fromRoom.vertDir == toRoom.vertDir){
                vertRoomDev = toRoom.vertCoord - fromRoom.vertCoord;
                if(fromRoom.vertDir == 'N') {vertRoomDev*=-1}
            }
            else {
                vertRoomDev = toRoom.vertCoord + fromRoom.vertCoord + 1;
                if(fromRoom.vertDir == 'S') {vertRoomDev*=-1}
            }      
            //Not linear distance but sum of difference in 2 coordinates. This is used to penalize movement between rooms.
            distance = Math.abs(targets[i].pos.x - this.x + horRoomDev * 50) + Math.abs(targets[i].pos.y - this.y + vertRoomDev * 50);
        }
        if(!closestRange || distance < closestRange){
            closestRange = distance;
            closest = targets[i];                
        }
    }
    return closest;
};

RoomPosition.prototype.coordinatesFromRoomName = function(){
    let room = this.roomName.split('');
    let horDir = undefined;
    let vertDir = undefined;
    let horCoord = '';
    let vertCoord = '';
    for(let i=0; i<room.length; i++){
        let temp = Number(room[i]);
        if(Number.isNaN(temp)){
            if(!horDir){
                horDir = room[i];
            }
            else {
                vertDir = room[i];
            }
        }
        else{
            if(vertDir){
                vertCoord += room[i];
            }
            else if(horDir){
                horCoord += room[i];
            }
        }
    }
    return {'horDir':horDir, 'vertDir': vertDir, 'horCoord': Number(horCoord), 'vertCoord': Number(vertCoord)};
};

RoomPosition.prototype.towerPower = function(basePower,towers){
    let power = 0;
    if(basePower == undefined){
        return power;
    }
    if(towers == undefined){
        let room = Game.rooms[this.roomName];
        if(!room){
            return power;
        }
        towers = util.gatherObjectsInArray(room.structures,STRUCTURE_TOWER);
    }
    else if(!Array.isArray(towers)){
        return ERR_INVALID_ARGS;
    }
    
    for(let i=0; i<towers.length; i++){
        let range = this.getRangeTo(towers[i].pos);
        //console.log('Range from ' + this + ' to ' + towers[i] + ' is ' + range);
        if(range <= TOWER_OPTIMAL_RANGE){
            //console.log('Close damage');
            power += basePower;
        }
        else if(range >= TOWER_FALLOFF_RANGE){
            //console.log('Far damage');
            power += basePower * (1 - TOWER_FALLOFF);
        }
        else {
            //console.log('Intermediate damage ' + TOWER_POWER_ATTACK * (1 - TOWER_FALLOFF * (range - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE)));
            power += basePower * (1 - TOWER_FALLOFF * (range - TOWER_OPTIMAL_RANGE) / (TOWER_FALLOFF_RANGE - TOWER_OPTIMAL_RANGE));
        }
    }
    return power;
};

RoomPosition.prototype.towerDamage = function(towers){
    return this.towerPower(TOWER_POWER_ATTACK,towers);
};

RoomPosition.prototype.towerHeal = function(towers){
    return this.towerPower(TOWER_POWER_HEAL,towers);
};

RoomPosition.prototype.creepHeal = function(creeps){
    //Determine possible healing at this position from creeps
    let heal = 0;
    for(let i=0; i<creeps.length; i++){
        if(this.inRangeTo(creeps[i].pos,1)){
            heal += creeps[i].healPower;
        }
        else if(this.inRangeTo(creeps[i].pos,3)){
            heal += creeps[i].rangedHealPower;
        }
    }
    return heal;
};

RoomPosition.prototype.creepDamage = function(creeps){
    //Determine possible damage at this position from creeps
    let dmg = 0;
    for(let i=0; i<creeps.length; i++){
        if(this.inRangeTo(creeps[i].pos,1) && this.getActiveBodyparts(ATTACK)){
            dmg += creeps[i].attackPower;
        }
        if(this.inRangeTo(creeps[i].pos,3) && this.getActiveBodyparts(RANGED_ATTACK)){
            dmg += creeps[i].rangedAttackPower;
        }
    }
    return dmg;
};

Object.defineProperty(RoomPosition.prototype, 'onExit', {
    get: function(){
        if(this === RoomPosition.prototype || this == undefined){return}
        if(!this._onExit){
            this._onExit = this.x == 0 || this.x == 49 || this.y == 0 || this.y == 49;
        }
        return this._onExit;
    },
    set: function(value){
        this._onExit = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(RoomPosition.prototype, 'nextToExit', {
    get: function(){
        if(this === RoomPosition.prototype || this == undefined){return}
        if(!this._nextToExit){
            this._nextToExit = this.x == 1 || this.x == 48 || this.y == 1 || this.y == 48;
        }
        return this._nextToExit;
    },
    set: function(value){
        this._nextToExit = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(RoomPosition.prototype, 'isWalkable', {
    get: function(){
        if(this === RoomPosition.prototype || this == undefined){return}
        if(this._isWalkable == undefined){
            let struct = this.lookFor(LOOK_STRUCTURES);
            let terrain = this.lookFor(LOOK_TERRAIN);
            if(OBSTACLES[terrain[0]]){this._isWalkable = false}
            else {this._isWalkable = true}
            for(let i=0; i<struct.length && this._isWalkable; i++){
                if(OBSTACLES[struct[i].structureType]){this._isWalkable = false}
            }
        }
        return this._isWalkable;
    },
    set: function(value){
        this._isWalkable = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(RoomPosition.prototype, 'walkableNeighborPositions', {
    get: function(){
        if(this === RoomPosition.prototype || this == undefined){return}
        if(!this._walkableNeighborPositions){
            this._walkableNeighborPositions = [];
            for(let i=-1; i<=1; i++){
                for(let j=-1; j<=1; j++){
                    if((i !== 0 || j !== 0) && this.x+i >= 0 && this.y+j >= 0 && this.x+i <= 49 && this.y+j <= 49){
                        let pos = new RoomPosition(this.x+i,this.y+j,this.roomName);
                        if(pos.isWalkable){
                            this._walkableNeighborPositions.push(pos);
                        }
                    }
                }
            }
        }
        return this._walkableNeighborPositions;
    },
    set: function(value){
        this._walkableNeighborPositions = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(RoomPosition.prototype, 'adjacentStructures', {
    get: function(){
        if(this === RoomPosition.prototype || this == undefined){return}
        if(!this._adjacentStructures){
            //let st = Game.cpu.getUsed();
            this._adjacentStructures = {};
            let room = Game.rooms[this.roomName];
            for(let i=-1; i<=1; i++){
                for(let j=-1; j<=1; j++){
                    if((i !== 0 || j !== 0) && this.x+i >= 0 && this.y+j >= 0 && this.x+i <= 49 && this.y+j <= 49){
                        let struct = room.lookForAt(LOOK_STRUCTURES,this.x+i,this.y+j);
                        for(let k=0; k<struct.length; k++){
                            if(this._adjacentStructures[struct[k].structureType]){
                                this._adjacentStructures[struct[k].structureType].push(struct[k]);
                            }
                            else {
                                this._adjacentStructures[struct[k].structureType] = [struct[k]];
                            }
                        }
                    }
                }
            }
            //console.log('Searching adjacent structures took ',Game.cpu.getUsed() - st);
        }
        return this._adjacentStructures;
    },
    set: function(value){
        this._adjacentStructures = value;
    },
    enumerable: false,
    configurable: true
});

