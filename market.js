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
    for(let i=0; i<deals.length; i++){
        let order = Game.market.getOrderById(deals[i].id);
        if(order){
            let amount = 0;
            if(order.type == ORDER_BUY){
                amount = Math.min(deals[i].amount,order.amount,Game.rooms[deals[i].room].terminal.store[order.resourceType]);                
            }
            else {
                amount = Math.min(deals[i].amount,order.amount);
            }
            
            let rtn = Game.market.deal(order.id,amount,deals[i].room);
            //console.log('Dealing ' + amount + ' ' + rtn);
            if(rtn == OK){
                console.log('Dealing ' + amount + ' of resource ' + order.resourceType + ' in room ' + deals[i].room + ' ' + rtn);
            }
            else {
                deals[i].id = null;
            }
        }
        else {
            deals[i].id = null;
        }
        //console.log(JSON.stringify(deals[i]));
        //console.log(JSON.stringify(Game.market.getOrderById(deals[i].id)));
    }
    Memory.market.deals = deals;
};

Market.prototype.fillTerminals = function(fillOrders){
    if(fillOrders == undefined){
        return;
    }
    for(let name in Game.rooms){
        if(fillOrders[name]){
            if(Game.rooms[name].memory.orders == undefined){
                Game.rooms[name].memory.orders = {};
            }
            for(let i=0; i<fillOrders[name].length; i++){
                if(fillOrders[name][i].amount != 0){
                    if(Game.rooms[name].memory.orders[fillOrders[name][i].resourceType]){
                        Game.rooms[name].memory.orders[fillOrders[name][i].resourceType] += fillOrders[name][i].amount;
                    }
                    else {
                        Game.rooms[name].memory.orders[fillOrders[name][i].resourceType] = fillOrders[name][i].amount;
                    }
                    fillOrders[name][i].amount = 0;                    
                }
            }
        }
    }
    Memory.market.fillTerminal = fillOrders;
};

Market.prototype.transferResources = function(transfer){
    if(transfer == undefined){
        return;
    }
    for(let i=0; i<transfer.length; i++){
        if(transfer[i].amount >= 100){
            //let distance = Math.max(Math.abs(Number(transfer[i].to.substr(1,2)) - Number(transfer[i].from.substr(1,2))), Math.abs(Number(transfer[i].to.substr(4,2)) - Number(transfer[i].from.substr(4,2))));
            let amount = Math.min(Game.rooms[transfer[i].from].terminal.store[transfer[i].resourceType], transfer[i].amount);
            let cost = Game.market.calcTransactionCost(amount,transfer[i].to,transfer[i].from);
            if(transfer[i].resourceType == RESOURCE_ENERGY){
                amount = Math.min(Math.max(0,Game.rooms[transfer[i].from].terminal.store[transfer[i].resourceType] - cost), transfer[i].amount);
            }
            else {
                amount = Math.min(transfer[i].amount, Game.rooms[transfer[i].from].terminal.store[transfer[i].resourceType], Game.rooms[transfer[i].from].terminal.store[RESOURCE_ENERGY]/cost * transfer[i].amount)
            }
            if(amount >= 100){
                //console.log('Amount of resource ' + transfer[i].resourceType + ' that can be transfered is ' + amount);
                let rtn = Game.rooms[transfer[i].from].terminal.send(transfer[i].resourceType,amount,transfer[i].to);
                console.log('Transfering ' + amount + ' units of ' + transfer[i].resourceType + ' from room ' + transfer[i].from + ' to room ' + transfer[i].to + ' ' + rtn);
                if(rtn == OK){
                    transfer[i].amount -= amount;
                }
                //console.log('Left of resource ' + transfer[i].resourceType + ' is ' + transfer[i].amount);                
            }
        }
    }
};

Market.prototype.balanceRooms = function(){
    //Balance energy in rooms that have a terminal based on tresholds
    //If energy is below treshold -> get energy from rooms that have energy above treshold
    //If storage is almost full of energy -> send to rooms with less energy
    
    //Get all rooms with terminal
    let rooms = [];
    for(let roomName in Game.rooms){
        let room = Game.rooms[roomName];
        if(room.controller && room.controller.my && room.terminal && room.storage){
            rooms.push(room);
        }
    }
    
    //Rooms with energy below low treshold (need to get energy)
    let lowRooms = rooms.filter((r) => roomFilter(r,'low'));
    rooms = util.findArrayOfDifferentRooms(rooms,lowRooms);
    
    //Rooms with energy above max treshold (need to lose energy)
    let maxRooms = rooms.filter((r) => roomFilter(r,'max'));
    rooms = util.findArrayOfDifferentRooms(rooms,maxRooms);
    
    //Rooms with energy above high treshold (can give energy)
    let highRooms = rooms.filter((r) => roomFilter(r,'high'));
    rooms = util.findArrayOfDifferentRooms(rooms,highRooms);
    
    //Balance low rooms with 1. maxRooms 2. highRooms
    //Balance closest rooms. Find lowRoom and maxRoom closest to each other. Balance them and remove the balanced one from array -> repeat
    //Same for lowRoom and highRoom if lowRooms left
    let roomPair = true;
    while(roomPair){
        roomPair = util.findClosestPairOfRooms(lowRooms,maxRooms);
        if(roomPair){
            //getTransfer > 0 if sending and < 0 if receiving
            let shortage = roomTreshold(roomPair[0],'low') - roomPair[0].storage.store.energy + roomPair[0].getTransfer();
            let surplus = roomPair[1].storage.store.energy - roomTreshold(roomPair[1],'high') - roomPair[0].getTransfer();
            if(shortage >= surplus){
                //Add transfer to properties of room memory
                roomPair[0].memory.transfer.push({amount: -surplus, from: roomPair[1].name});
                roomPair[1].memory.transfer.push({amount: surplus, to: roomPair[0].name});
                maxRooms = util.findArrayOfDifferentRooms(maxRooms,roomPair.slice(1));
            }
            else {
                roomPair[0].memory.transfer.push({amount: -shortage, from: roomPair[1].name});
                roomPair[1].memory.transfer.push({amount: shortage, to: roomPair[0].name});
                lowRooms = util.findArrayOfDifferentRooms(lowRooms,roomPair.slice(0,1));
            }
        }
    }
    
    
    //Balance maxRooms with 1. leftover rooms 2. highRooms
    
    
    //If maxRooms cannot lose excess energy -> sell
    
    
    function roomFilter(r,prop){
        return r.storage.store.energy < roomTreshold(r,prop);
    }
    
    function roomTreshold(r,prop){
        let treshold;
        if(roomTreshold[r.name]){
            treshold = roomTreshold[r.name][prop];
        }
        else {
            treshold = defaultRoomTresholds[prop];
        }
        return treshold;
    }
};

module.exports = Market;