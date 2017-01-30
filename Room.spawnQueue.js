//A room specific spawn queue is created and maintained. New spawn orders are added to the queue, based on their priority (highest priority first).
//The spawn queue object also contains information on the number of creeps of each type and role that are queued and the total number of ticks needed to spawn all creeps in the queue

Room.prototype.populateSpawnQueue = function(){
    if(!this.controller || !this.controller.my){return}
    let spawnCreeps = this.determineCreepsToSpawn();
    /*if(spawnCreeps.length){
        console.log('Need to spawn creeps in room ' + this.name + ' ' + JSON.stringify(spawnCreeps));
    }*/
    for(let i=0; i<spawnCreeps.length; i++){
        this.determinePriority(spawnCreeps[i]);
        this.addToQueue(spawnCreeps[i]);
    }
    /*if(spawnCreeps.length){
        console.log('Spawn queue for room ' + this.name + ': ' + JSON.stringify(this.memory.spawnQueue));
    }*/
};

Room.prototype.determineCreepsToSpawn = function(){
    let spawnCreeps = [];
    let nCreeps;
    for(let type in creepsToSpawn[this.name]){
        for(let role in creepsToSpawn[this.name][type]){
            if(this.memory.creeps && this.memory.creeps[type] && this.memory.creeps[type][role]){
                nCreeps = this.memory.creeps[type][role];
            }
            else {
                nCreeps = 0;
            }
            if(this.memory.spawnQueue && this.memory.spawnQueue.nCreeps && this.memory.spawnQueue.nCreeps[type] && this.memory.spawnQueue.nCreeps[type][role]) {
                nCreeps += this.memory.spawnQueue.nCreeps[type][role];
            }
            if(nCreeps < creepsToSpawn[this.name][type][role]){
                console.log(this.name + ' ' + type + ' ' + role + ' need: ' + creepsToSpawn[this.name][type][role] + ' have ' + nCreeps);
                let body = undefined;
                if(!creepBodies[this.name] || !creepBodies[this.name][type] || !creepBodies[this.name][type][role]){
                    //console.log(this.name + ' using default');
                    body = defaultCreepBodies[type][role];
                }
                else {
                    //console.log(this.name + ' not using default');
                    body = creepBodies[this.name][type][role];
                }
                //console.log('Need to spawn ' + type + ' ' + role + ' in room ' + this.name);
                for(i=0; i<creepsToSpawn[this.name][type][role] - nCreeps; i++){
                    spawnCreeps.push({body: body, memory: {origin: this.name, type: type, role: role}});
                }
            }
        }
    }
    return spawnCreeps;
};

Room.prototype.determinePriority = function(spawnCreep){
    //Lower values mean the priority is higher
    let priority = spawnBasePriority[spawnCreep.memory.type][spawnCreep.memory.role];
    spawnCreep.priority = priority;
};

Room.prototype.addToQueue = function(spawnCreep){
    if(!spawnCreep.priority){
        return;
    }
    if(!this.memory.spawnQueue){
        this.memory.spawnQueue = {queue: [], spawnTime: 0, nCreeps: {}};
    }
    
    let found = false;
    for(let i=0; i<this.memory.spawnQueue.queue.length && !found; i++){
        if(this.memory.spawnQueue.queue[i].priority > spawnCreep.priority){
            this.memory.spawnQueue.queue.splice(i,0,spawnCreep);
            found = true;
        }
    }
    if(!found){
        //Is lowest priority so add to end of array
        this.memory.spawnQueue.queue.push(spawnCreep);
    }
    this.memory.spawnQueue.spawnTime += spawnCreep.body.length * CREEP_SPAWN_TIME;
    if(!this.memory.spawnQueue.nCreeps[spawnCreep.memory.type]){
        this.memory.spawnQueue.nCreeps[spawnCreep.memory.type] = {[spawnCreep.memory.role]: 1};
    }
    else if(!this.memory.spawnQueue.nCreeps[spawnCreep.memory.type][spawnCreep.memory.role]){
        this.memory.spawnQueue.nCreeps[spawnCreep.memory.type][spawnCreep.memory.role] = 1;
    }
    else {
        this.memory.spawnQueue.nCreeps[spawnCreep.memory.type][spawnCreep.memory.role]++;
    }
};

Room.prototype.getNextInQueue = function(){
    let next = this.memory.spawnQueue.queue.shift();
    this.memory.spawnQueue.spawnTime -= next.body.length * CREEP_SPAWN_TIME;
    this.memory.spawnQueue.nCreeps[next.memory.type][next.memory.role]--;
    return next;
};