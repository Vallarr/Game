/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('market');
 * mod.thing == 'a thing'; // true
 */
 
var Market = function(){
     
};
 
Market.prototype.trade = function(){
    if(Memory.market){
        this.makeOrders(Memory.market.newOrders);
        this.changeOrders(Memory.market.changeOrders);
        this.makeDeals(Memory.market.deals);
        this.fillTerminals(Memory.market.fillTerminal);
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

module.exports = Market;