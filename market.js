var Market = function(){
     
};
 
Market.prototype.trade = function(){
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
            let cost = Game.market.calcTransactionCost(transfer[i].amount,transfer[i].to,transfer[i].from);
            let amount = undefined;
            if(transfer[i].resourceType == RESOURCE_ENERGY){
                amount = Math.min(Math.max(0,Game.rooms[transfer[i].from].terminal.store[transfer[i].resourceType] - cost), transfer[i].amount);
            }
            else {
                amount = Math.min(transfer[i].amount, Game.rooms[transfer[i].from].terminal.store[transfer[i].resourceType], Game.rooms[transfer[i].from].terminal.store[RESOURCE_ENERGY]/cost * transfer[i].amount)
            }
            if(amount >= 100){
                //console.log('Amount of resource ' + transfer[i].resourceType + ' that can be transfered is ' + amount);
                console.log('Transfering ' + amount + ' units of ' + transfer[i].resourceType + ' from room ' + transfer[i].from + ' to room ' + transfer[i].to + ' ' + Game.rooms[transfer[i].from].terminal.send(transfer[i].resourceType,amount,transfer[i].to));
                transfer[i].amount -= amount;
                //console.log('Left of resource ' + transfer[i].resourceType + ' is ' + transfer[i].amount);                
            }
        }
    }
};

module.exports = Market;