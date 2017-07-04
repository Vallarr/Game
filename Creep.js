require('Creep.roles');
require('Creep.actions');

Creep.prototype.setCostInMatrix = function(){
    if(this.fatigue || (this.memory.path && !this.memory.path.length) || !this.memory.path){
        //If creep is not moving, set its position as unwalkable
        this.room.CostMatrix.set(this.pos.x,this.pos.y,0xff);
        this.room.CombatCostMatrix.set(this.pos.x,this.pos.y,0xff);
    }
};

Creep.prototype.animate = function(){
    if(this.memory.boost){this.prepareBoosts()} //Boosts are loaded before creep is actually spawned -> save time
    if(this.spawning){return}
    //if(this.leadAndFollow()){return}
    //else if(this.moveFromMemory()){return}
    if(this.moveFromMemory()){return}
    if(this.memory.boost && this.applyBoosts()){return} //Go get boosted
    if(this.memory.portal && this.usePortal()){return}
    
    if(this.memory.type == 'powerHarvester'){
        this.targetRooms = [];
        let orRoom = Game.rooms[this.memory.origin];
        Object.keys(orRoom.memory.powerRooms).forEach((r) => this.targetRooms.push(r));
    }
    else if(remoteRooms == undefined || remoteRooms[this.memory.type] == undefined){
        this.targetRooms = [this.memory.origin];
    }
    else if(remoteRooms[this.memory.type][this.memory.origin] == undefined || !remoteRooms[this.memory.type][this.memory.origin].length){
        console.log('No target rooms specified for ' + this.memory.role + ' ' + this.memory.type + ' ' + this.name + ' of room ' + this.memory.origin);
        return;            
    }
    else {
        this.targetRooms = remoteRooms[this.memory.type][this.memory.origin];
    }
    
    if(this.memory.role == 'harvester') {
        this.creepHarvest();
    }
    if(this.memory.role == 'miner'){
        this.creepMiner();
    }
    if(this.memory.role == 'sender'){
        this.creepSender();
    }
    if(this.memory.role == 'transporter' || this.memory.role == 'filler' || this.memory.role == 'courier' || this.memory.role == 'labWorker'){
        if(this.memory.type == 'settler'){
            if(transitioned[this.memory.origin]){
                if(this.memory.role == 'filler'){
                    this.creepFillerv2();
                }
                else if(this.memory.role == 'courier'){
                    this.creepCourierv2();
                }
                else {
                    this.creepDedicatedTransporter();
                }
            }
            else {
                this.creepDedicatedTransporter();
            }
        }
        else if(this.memory.type == 'explorer'){
            if(transitioned[this.memory.origin]){
                this.creepTransporter();
            }
            else {
                this.creepExplorerTransporter();
            }
        }
        else if(this.memory.type == 'adventurer'){
            if(transitioned[this.memory.origin]){
                this.creepTransporter();
            }
            else {
                this.creepExplorerTransporter();
            }
        }
        else if(this.memory.type == 'starter'){
            this.creepStarterTransporter();
        }
        else if(this.memory.type == 'powerHarvester'){
            this.creepPowerTransporter();
        }
    }
    if(this.memory.role == 'upgrader') {
        this.creepUpgrader();
    }
    if(this.memory.role == 'builder') {
        this.creepBuild();
    }
    if(this.memory.role == 'repairer') {
        this.creepRepair();
    }
    if(this.memory.role == 'dismantler' || this.memory.role == 'dismantler2') {
        if(this.memory.type == 'attacker'){
            this.creepAttackDismantler();
        }
        else {
            this.creepDismantle();
        }
    }
    if(this.memory.role == 'reserver'){
        if(this.memory.type == 'attacker'){
            this.creepAttackReserver();
        }
        else {
            this.creepReserver();
        }
    }
    if(this.memory.role == 'startUp'){
        this.creepStartUpBuilder();
    }
    if(this.memory.role == 'combat'){
        this.creepCombat();
    }
    if(this.memory.role == 'melee') {
        if(this.memory.type == 'explorer'){
            this.creepExplorerMelee();
        }
        else if(this.memory.type == 'adventurer'){
            this.creepCombat();
        }
    }
    if(this.memory.role == 'ranged') {
        if(this.memory.type == 'adventurer'){
            this.creepCombat();
        }
    }  
    if(this.memory.role == 'hybrid') {
        if(this.memory.type == 'adventurer'){
            this.creepCombat();
        }
    }                  
    if(this.memory.role == 'patroller' || this.memory.role == 'patrollerRanged') {
        if(this.memory.type == 'adventurer'){
            this.creepPatroll();
        }
    }
    if(this.memory.role == 'drainer'){
        this.creepDrainer();
    }
    if(this.memory.role == 'healer' || this.memory.role == 'healer2'){
        if(this.memory.type == 'attacker' || this.memory.type == 'powerHarvester'){
            this.creepAttackHealer();
        }
    }
    if(this.memory.role == 'attacker' && this.memory.type == 'powerHarvester'){
        this.creepPowerAttacker();
    }
};

Creep.prototype.moveFromMemory = function(){ 
    //Flee if necessary
    if(!this.fatigue && this.room.memory.defense.underAttack && this.memory.type != 'attacker' && this.memory.role != 'melee' && this.memory.role != 'ranged' && this.memory.role != 'hybrid' && this.memory.role != 'patroller' && this.memory.role != 'patrollerRanged'&& this.memory.role != 'combat' && this.flee() != ERR_NOT_FOUND){
        this.stationaryCombat();
        return true;
    }
    //Wait for followers if necessary
    if(this.memory.followers){
        let followers = util.gatherObjectsInArrayFromIds(this.memory,'followers');
        if(!followers.length){
            //Suicide if followers all died and little ticks to live
            if(this.ticksToLive < 2 * 50 * Game.map.getRoomLinearDistance(this.room.name,this.memory.origin)){
                //this.suicide();
                //return true;
            }
            delete this.memory.followers;
            return false;
        }
        for(let i=0; i<followers.length; i++){
            //Wait for fatigued followers
            if(followers[i].fatigue){
                //console.log(this.name + ' waiting for fatigued followers');
                this.stationaryCombat();
                this.room.CostMatrix.set(this.pos.x,this.pos.y,0xff);
                this.room.CombatCostMatrix.set(this.pos.x,this.pos.y,0xff);
                return true;
            }
        }
        let inRange = util.targetsInRange(followers,[this],followers.length);
        let inRange1 = util.targetsInRange(followers,[this],1);
        //console.log('In range 1 ' + inRange1 + ' in range ' + inRange);
        if((!inRange1.length || inRange.length < followers.length) && !this.pos.onExit && !this.pos.nextToExit){
            //Wait for followers to get in range
            //console.log(this.name + ' waiting for out of range followers ' + inRange1.length + ' in 1 ' + inRange.length + ' total');
            this.stationaryCombat();
            this.room.CostMatrix.set(this.pos.x,this.pos.y,0xff);
            this.room.CombatCostMatrix.set(this.pos.x,this.pos.y,0xff);
            return true;
        }
    }
    //Follow leader
    if(this.memory.leader){
        let leader = Game.getObjectById(this.memory.leader);
        if(!leader){
            //Suicide if leader died and little ticks to live
            if(this.ticksToLive < 2 * 50 * Game.map.getRoomLinearDistance(this.room.name,this.memory.origin)){
                this.suicide();
                return true;
            }
            delete this.memory.leader;
            return false;
        }
        let nextPos;
        if(!this.pos.inRangeTo(leader,1)){
            //console.log(this.name + ' not near leader');
            nextPos = leader.pos;
        }
        if(!nextPos && this.memory.posLeader){
            let next = this.memory.posLeader;
            nextPos = new RoomPosition(next.x,next.y,next.roomName);
            //console.log(this.name + ' got position ' + nextPos + ' from leader');
            //console.log(this.name + ' at ' + this.pos + ' is ' + this.pos.inRangeTo(nextPos,1) + ' in range to ' + nextPos);
            if(this.pos.inRangeTo(nextPos,1)){
                //If leader is animated after follower, path in memory is behind 1 step and thus needs to be cleared
                delete this.memory.posLeader;
                nextPos = undefined;
            }
        }
        if(!nextPos && !this.memory.posLeader && leader.memory.path && leader.memory.path.length && !leader.fatigue){
            let next = leader.memory.path[0];
            nextPos = new RoomPosition(next.x,next.y,next.roomName);
            //console.log(this.name + ' got position ' + nextPos + ' from leader memory');
        }
        if(nextPos){
            if(this.pos.onExit){
                if(nextPos.x == 1){nextPos.x++}
                else if(nextPos.x == 48){nextPos.x--}
                else if(nextPos.y == 1){nextPos.y++}
                else if(nextPos.y == 48){nextPos.y--}
            }
            this.moveTo([{pos: nextPos}],1);
            this.stationaryCombat();
            return true;
        }
        else if(!this.redo){
            //Animate creep again after all others have been animated, to make sure leader is not moving this turn
            //console.log(this.name + ' leader might still move');
            this.redo = true;
            RedoCreeps.push(this);
            return true;
        }
        else if(this.pos.onExit){
            //Move healer away from border into room
            //console.log(this.name + ' on border');
            if(leader.pos.x == 48){nextPos = new RoomPosition(leader.pos.x-1,leader.pos.y,leader.pos.roomName)}
            else if(leader.pos.x == 1){nextPos = new RoomPosition(leader.pos.x+1,leader.pos.y,leader.pos.roomName)}
            else if(leader.pos.y == 48){nextPos = new RoomPosition(leader.pos.x,leader.pos.y-1,leader.pos.roomName)}
            else if(leader.pos.y == 1){nextPos = new RoomPosition(leader.pos.x,leader.pos.y+1,leader.pos.roomName)}
            this.moveTo([{pos: nextPos}],1);
            this.stationaryCombat();
            return true;
        }
    }
    //Move via path in memory
    if(!this.fatigue && this.memory.path && this.memory.path.length){
        let nextStep = this.memory.path.shift();
        if(nextStep.x == this.pos.x && nextStep.y == this.pos.y && nextStep.roomName == this.pos.roomName && this.memory.path.length){
            //allready there
            nextStep = this.memory.path.shift();
        }
        let room = Game.rooms[nextStep.roomName];
        let emptySpace = true;
        if(room){
            emptySpace = room.CostMatrix.get(nextStep.x,nextStep.y) < 0xff;
        }
        if(emptySpace && this.pos.inRangeTo(nextStep,1) && this.move(this.pos.getDirectionTo(nextStep.x,nextStep.y)) == OK){
            this.stationaryCombat();
            if(this.memory.followers){
                let followers = util.gatherObjectsInArrayFromIds(this.memory,'followers');
                for(let i=0; i<followers.length; i++){
                    followers[i].memory.posLeader = nextStep;
                }
            }
            if(room){
                room.CostMatrix.set(nextStep.x,nextStep.y,0xff);
                room.CombatCostMatrix.set(nextStep.x,nextStep.y,0xff);
            }
            return true;
        }
    }
    if(this.fatigue && this.memory.path && this.memory.path.length){
        //Creep will still move in comming ticks -> don't need to reexecute creep script
        this.stationaryCombat();
        return true;
    }
    return false;
};

Creep.prototype.prepareBoosts = function(){
    let boosts = {};
    for(let part in this.memory.boost){
        boosts[this.memory.boost[part]] = true;
    }
    
    let room = Game.rooms[this.memory.origin];
    if(!room.memory.prepBoosts){
        room.memory.prepBoosts = boosts;
    }
    else {
        for(let boost in boosts){
            room.memory.prepBoosts[boost] = true;
        }
    }
};

Creep.prototype.applyBoosts = function(){
    let nBoosts = 0;
    let boostLabs = util.gatherObjectsInArray(this.room.labs,'boost');
    if(!boostLabs.length){
        delete this.memory.boost;
        return false;
    }
    let targetLab;
    let targetPart;
    let foundLab = false;
    for(let part in this.memory.boost){
        nBoosts++;
        for(let i=0; i<boostLabs.length; i++){
            if(boostLabs[i].mineralType == this.memory.boost[part]){
                targetLab = boostLabs[i];
                targetPart = part;
                foundLab = true;
                break;
            }
        }
        if(foundLab){break}
    }
    //console.log(this.room.name + ' nBoosts ' + nBoosts + ' found lab ' + foundLab + ' ' + targetLab);
    if(nBoosts == 0){
        //console.log('Deleting boosts from memory');
        delete this.memory.boost;
        return false;
    }
    if(!foundLab){
        let minAv = 0;
        for(let part in this.memory.boost){
            //console.log(this.room.name + ' minAv of type ' + this.memory.boost[part] + ' is ' + this.room.mineralsInRoom[this.memory.boost[part]]);
            if(this.room.mineralsInRoom[this.memory.boost[part]]){
                minAv += this.room.mineralsInRoom[this.memory.boost[part]];
            }
        }
        if(minAv <= LAB_BOOST_MINERAL){
            //console.log('Not enough minerals in room to get boosted');
            delete this.memory.boost;
            return false;
        }
        else {
            return true;
        }
    }
    if(targetLab.mineralAmount >= this.getActiveBodyparts(targetPart) * LAB_BOOST_MINERAL || this.room.mineralsInRoom[this.memory.boost[targetPart]] == targetLab.mineralAmount && !(this.room.mineralsInRoom[this.memory.boost[targetPart]] < LAB_BOOST_MINERAL)){
        let nPartToBoost;
        if(this.room.mineralsInRoom[this.memory.boost[targetPart]] == targetLab.mineralAmount){
            nPartToBoost = Math.min(this.getActiveBodyparts(targetPart),Math.floor(targetLab.mineralAmount / LAB_BOOST_MINERAL));
        }
        else {
            nPartToBoost = this.getActiveBodyparts(targetPart);
        }
        let lab = this.moveTo([targetLab],1);
        //console.log('Boosting ' + nPartToBoost + ' parts in lab ' + lab);
        if(lab != OK && lab != ERR_NOT_FOUND && targetLab.energy >= nPartToBoost * LAB_BOOST_ENERGY){
            if(targetLab.boostCreep(this) == OK){
                //console.log('Got boosted');
                if(!this.room.memory.war){
                    delete this.room.memory.prepBoosts[this.memory.boost[targetPart]];
                }
                delete this.memory.boost[targetPart];
            }
        }
        if(lab < 0){
            return false;
        }
        else {
            return true;
        }
    }
    else if(this.room.mineralsInRoom[this.memory.boost[targetPart]] < LAB_BOOST_MINERAL){
        delete this.memory.boost[targetPart];
        return false;
    }
    if(this.ticksToLive < 0.7 * CREEP_LIFE_TIME){
        delete this.memory.boost;
        return false;
    }
    //console.log('Did not get boosted yet ');
    return true;
};

Creep.prototype.usePortal = function(){
    if(this.memory.destinationRoom && this.room.name == this.memory.destinationRoom){
        let portals = util.gatherObjectsInArray(this.room.structures,STRUCTURE_PORTAL);
        this.flee(portals,1);
        delete this.memory.destinationRoom;
        delete this.memory.portal;
    }
    let portalRoom = this.memory.portal;
    let room = Game.rooms[portalRoom];
    if(!room){
        this.moveToRoom(portalRoom);
        return true;
    }
    let portals = util.gatherObjectsInArray(room.structures,STRUCTURE_PORTAL);
    if(!portals.length){
        delete this.memory.portal;
        return false;
    }
    let portal = this.moveTo(portals,1);
    if(portal != OK && portal != ERR_NOT_FOUND){
        if(this.move(this.pos.getDirectionTo(portal)) == OK){
            this.memory.destinationRoom = portal.destination.roomName;
        }
        return true;
    }
    else if(portal == ERR_NOT_FOUND){
        delete this.memory.portal;
        return false;
    }
    return true;
};