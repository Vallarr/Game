var Market = function(){
     
};
 
Market.prototype.trade = function(){
    //this.balanceRooms();
    if(Memory.market){
        this.makeOrders(Memory.market.newOrders);
        this.changeOrders(Memory.market.changeOrders);
        this.makeDeals(Memory.market.deals);
        this.fillTerminals(Memory.market.fillTerminal);
        this.transferResources(Memory.market.transfer);
    }
};

Market.prototype.makeOrders = function(newOrders){
    if(newOrders == undefined){
        return;
    }
    for(let i=0; i<newOrders.length; i++){
        
    }
};

Market.prototype.changeOrders = function(changedOrders){
    if(changedOrders == undefined){
        return;
    }
    
};

Market.prototype.makeDeals = function(deals){
    if(deals == undefined){
        return;
    }
    for(let room in deals){
        let terminal = Game.rooms[room].terminal;
        if(!terminal || terminal.cooldown){continue}
        let roomDeals = deals[room];
        while(roomDeals && roomDeals.length){
            let deal = roomDeals.shift();
            let order = Game.market.getOrderById(deal.id);
            if(order){
                let amount = 0;
                if(order.type == ORDER_BUY){
                    amount = Math.min(deal.amount,order.amount,terminal.store[order.resourceType]);                
                }
                else {
                    amount = Math.min(deal.amount,order.amount);
                }
                
                let rtn = Game.market.deal(order.id,amount,room);
                //console.log('Dealing ' + amount + ' ' + rtn);
                if(rtn == OK){
                    console.log('Dealing ' + amount + ' of resource ' + order.resourceType + ' in room ' + room + ' ' + rtn);
                    break;
                }
                else {
                    console.log('Could not deal ' + amount + ' of resource ' + order.resourceType + ' in room ' + room + ' ' + rtn);
                }
            }
        }
        if(roomDeals && !roomDeals.length){
            delete deals[room];
        }
    }
};

Market.prototype.fillTerminals = function(fillOrders){
    if(fillOrders == undefined){
        return;
    }
    for(let name in fillOrders){
        if(Game.rooms[name].memory.orders == undefined){
            Game.rooms[name].memory.orders = {};
        }
        let nRes = 0;
        for(let resourceType in fillOrders[name]){
            nRes++;
            if(fillOrders[name][resourceType] != 0){
                if(Game.rooms[name].memory.orders[resourceType]){
                    Game.rooms[name].memory.orders[resourceType] += fillOrders[name][resourceType];
                }
                else {
                    Game.rooms[name].memory.orders[resourceType] = fillOrders[name][resourceType];
                }
                delete fillOrders[name][resourceType];
            }
        }
        if(nRes == 0){
            delete fillOrders[name];
        }
    }
};

Market.prototype.transferResources = function(transfer){
    if(transfer == undefined){
        return;
    }
    for(let roomName in transfer){
        transfers = transfer[roomName];
        if(!transfers.length){delete transfer[roomName]}
        let room = Game.rooms[roomName];
        let terminal = room.terminal;
        if(!terminal || terminal.cooldown){continue}
        for(let i=0; i<transfers.length; i++){
            if(transfers[i].amount >= 100){
                //Try to transfer as much as possible in 1 go.
                //If possible send whole order at once, else if terminal is being filled wait, else send whatever can be
                let amount = transfers[i].amount;
                if(amount > terminal.store[transfers[i].resourceType] || !terminal.store[transfers[i].resourceType]){
                    if(room.memory.orders && room.memory.orders[transfers[i].resourceType] > 0 && _.sum(terminal.store) < MAX_STORE_TERMINAL){
                        //Wait for terminal to be filled
                        continue;
                    }
                    else {
                        amount = terminal.store[transfers[i].resourceType] || 0;
                    }
                }
                
                let cost = Game.market.calcTransactionCost(amount, transfers[i].to,roomName);
                if(transfers[i].resourceType == RESOURCE_ENERGY){
                    cost += amount;
                }
                
                if(cost > terminal.store[RESOURCE_ENERGY]){
                    if(room.memory.orders && room.memory.orders[RESOURCE_ENERGY] > 0 && _.sum(terminal.store) < MAX_STORE_TERMINAL){
                        //Wait for terminal to be filled
                        continue; 
                    }
                    else if(transfers[i].resourceType = RESOURCE_ENERGY){
                        //Send available energy
                        let costFrac = 1 - Math.exp(-Game.map.getRoomLinearDistance(roomName,transfers[i].to,true) / 30);
                        amount = Math.min(Math.max(0,Math.floor(terminal.store[transfers[i].resourceType] / (1 + costFrac))), transfers[i].amount);
                    }
                    else {
                        let stored = terminal.store[transfers[i].resourceType] || 0;
                        amount = Math.min(stored, transfers[i].amount, Math.floor(terminal.store[RESOURCE_ENERGY]/cost * transfers[i].amount));
                    }
                }
                
                let targetRoom = Game.rooms[transfers[i].to];
                if(targetRoom){
                    //If target room is visible, don't send more than target terminal can hold
                    if(amount > targetRoom.terminal.storeCapacity - _.sum(targetRoom.terminal.store)){
                        if(targetRoom.memory.orders && targetRoom.memory.orders[RESOURCE_ENERGY] < 0){
                            //Wait until terminal in target room is emptied
                            continue;
                        }
                        else {
                            amount = targetRoom.terminal.storeCapacity - _.sum(targetRoom.terminal.store);
                        }
                    }
                }
                
                if(amount >= 100){
                    let rtn = terminal.send(transfers[i].resourceType,amount,transfers[i].to);
                    console.log('Transfering ' + amount + ' units of ' + transfers[i].resourceType + ' from room ' + roomName + ' to room ' + transfers[i].to + ' ' + rtn);
                    if(rtn == OK){
                        transfers[i].amount -= amount;
                        break;
                    }
                }
            }
            else {
                transfers.splice(i,1);
            }
        }
    }
};

Market.prototype.balanceRooms = function(){
    //Balance energy in rooms that have a terminal based on tresholds
    //If energy is below treshold -> get energy from rooms that have energy above treshold
    //If storage is almost full of energy -> send to rooms with less energy
    
    //Get all rooms with terminal and storage
    let rooms = [];
    for(let roomName in Game.rooms){
        let room = Game.rooms[roomName];
        if(!dontBalance[roomName] && room.controller && room.controller.my && room.terminal && room.storage && (!GCL_FARM[room.name] || (room.storage.isActive() && room.terminal.isActive()))){
            rooms.push(room);
        }
    }
    
    //Rooms with energy above critical treshold (need to lose energy)
    let criticalRooms = rooms.filter((r) => roomFilter(r,'critical'));
    rooms = util.findArrayOfDifferentRooms(rooms,criticalRooms);
    
    //Rooms with energy above max treshold (need to lose energy)
    let maxRooms = rooms.filter((r) => roomFilter(r,'max'));
    rooms = util.findArrayOfDifferentRooms(rooms,maxRooms);  
    
    //Rooms with energy above high treshold (can give energy)
    let highRooms = rooms.filter((r) => roomFilter(r,'high'));
    rooms = util.findArrayOfDifferentRooms(rooms,highRooms);
    
    //Rooms with energy above med treshold (ok)
    let medRooms = rooms.filter((r) => roomFilter(r,'med'));
    rooms = util.findArrayOfDifferentRooms(rooms,medRooms);
    
    //Rooms with energy above low treshold (ok)
    let okRooms = rooms.filter((r) => roomFilter(r,'low'));
    rooms = util.findArrayOfDifferentRooms(rooms,okRooms);
    
    //Rooms with energy above min treshold (ok)
    let lowRooms = rooms.filter((r) => roomFilter(r,'min'));
    
    //Rooms with energy below min treshold (need energy)
    let minRooms = util.findArrayOfDifferentRooms(rooms,lowRooms);
    
    
    //console.log('MaxRooms ' + maxRooms);
    //console.log('HighRooms ' + highRooms);
    //console.log('okRooms ' + okRooms);
    //console.log('lowRooms ' + lowRooms);
    //console.log('minRooms ' + minRooms);
    
    
    //Balance low rooms with 1. critical rooms 2. maxRooms 3. highRooms
    //Balance closest rooms. Find lowRoom and maxRoom closest to each other. Balance them and remove the balanced one from array -> repeat
    //Same for lowRoom and highRoom if lowRooms left
    balance(minRooms,criticalRooms,'low','max');
    balance(minRooms,maxRooms,'low','high');
    balance(minRooms,highRooms,'low','med');
    
    //Balance critical rooms with low and ok rooms
    balance(lowRooms,criticalRooms,'med','max');
    balance(okRooms,criticalRooms,'high','max');
    
    //Balance maxRooms with low rooms
    balance(lowRooms,maxRooms,'med','high');
    
    
    
    //If maxRooms cannot lose excess energy -> sell
    
    
    function roomFilter(r,prop){
        let ordered = 0;
        if(r.memory.orders && r.memory.orders[RESOURCE_ENERGY]){ordered = r.memory.orders[RESOURCE_ENERGY]}
        return r.storage.store.energy - ordered > r.energyTreshold[prop];
    }
    
    function balance(roomsTo,roomsFrom,propTo,propFrom){
        let roomPair = util.findClosestPairOfRooms(roomsTo,roomsFrom);
        //console.log('Closest rooms ' + roomPair);
        while(roomPair.length){
            //If room dropped below low -> fill to high
            let costFrac = 1 - Math.exp(-Game.map.getRoomLinearDistance(roomPair[0].name,roomPair[1].name,true) / 30);
            let ordered = 0;
            if(roomPair[0].memory.orders && roomPair[0].memory.orders[RESOURCE_ENERGY]){ordered = roomPair[0].memory.orders[RESOURCE_ENERGY]}
            let shortage = roomPair[0].energyTreshold[propTo] - roomPair[0].storage.store.energy + ordered;
            let surplus = roomPair[1].storage.available[RESOURCE_ENERGY] - roomPair[1].energyTreshold[propFrom];
            if(shortage > 0 && surplus > 0){
                let amount = 0;
                let maxSend = Math.floor(surplus / (1 + costFrac));
                if(shortage >= maxSend){
                    //Add transfer to market memory
                    amount = maxSend;
                    roomsFrom.splice(roomsFrom.indexOf(roomPair[1]),1);
                }
                else {
                    amount = shortage;
                    roomsTo.splice(roomsTo.indexOf(roomPair[0]),1);
                }
                if(amount > 0){
                    console.log('Balancing shortage of ' + shortage + ' in ' + roomPair[0] + ' with surplus of ' + surplus + ' in ' + roomPair[1] + ' transfering  ' + amount);
                    roomPair[1].addToTransfer(amount,roomPair[0].name,RESOURCE_ENERGY);
                    if(!roomPair[0].memory.orders){roomPair[0].memory.orders = {}}
                    if(!roomPair[0].memory.orders[RESOURCE_ENERGY]){roomPair[0].memory.orders[RESOURCE_ENERGY] = 0}
                    roomPair[0].memory.orders[RESOURCE_ENERGY] -= amount;
                    if(!roomPair[1].memory.orders){roomPair[1].memory.orders = {}}
                    if(!roomPair[1].memory.orders[RESOURCE_ENERGY]){roomPair[1].memory.orders[RESOURCE_ENERGY] = 0}
                    roomPair[1].memory.orders[RESOURCE_ENERGY] += Math.ceil(amount * (1 + costFrac));
                }
            }
            else {
                if(shortage <= 0){
                    roomsTo.splice(roomsTo.indexOf(roomPair[0]),1);
                }
                if(surplus <= 0){
                    roomsFrom.splice(roomsFrom.indexOf(roomPair[1]),1);
                }
            }
            roomPair = util.findClosestPairOfRooms(roomsTo,roomsFrom);
        }
    }
};

Object.defineProperty(Room.prototype, 'energyTreshold', {
    get: function(){
        if(this === Room.prototype || this == undefined){return}
        if(!this._energyTreshold){
            if(roomStorageTreshold[this.name]){
                this._energyTreshold = roomStorageTreshold[this.name];
            }
            else {
                this._energyTreshold = defaultRoomStorageTreshold;
            }
        }
        return this._energyTreshold;
    },
    set: function(value){
        this._energyTreshold = value;
    },
    enumerable: false,
    configurable: true
});

Room.prototype.addToTransfer = function(amount,to,resourceType){
    if(!Memory.market){Memory.market = {}}
    if(!Memory.market.transfer){Memory.market.transfer = {}}
    if(!Memory.market.transfer[this.name]){Memory.market.transfer[this.name] = []}
    let transfers = Memory.market.transfer[this.name];
    for(let i=0; i<transfers.length; i++){
        if(transfers[i].to == to && transfers[i].resourceType == resourceType){
            transfers[i].amount += amount;
            return;
        }
    }
    transfers.push({amount: amount, to: to, resourceType: resourceType});
};

module.exports = Market;