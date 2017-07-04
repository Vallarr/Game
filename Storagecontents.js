// storageContents() - resource overview and management console interface
// Author: Helam
// Collaborators: Dragnar, Dewey, Enrico, ???
// Features:
// - Displays the mineral type, optional reaction type, storage contents, and terminal contents for every room.
// - NEW: Displays empire totals for resources in every storage and terminal in every owned room.
// - Hover over the room mineral type to see the mineral amount and how long until the mineral regenerates (if its empty).
// - Hover over the room reaction type to change it. This sets Memory.rooms[roomName].reactionType to the selected resource constant.
// - Hover over the storage image to see the contents of the storage
// - Hover over the terminal image to see the contents of the terminal:
//    - If enabled (default) the terminal tooltip will have controls to send resources.
//    - NEW: Dropdown menu to select target room for terminal send. Displays the max amount of resources sendable to each room based on current energy amount.
//    - NEW: Add your "favorite" rooms (rooms of allies you frequently send resources to) to the global variable below. (global.favoriteTerminalTargets)
//    - NEW: Add SHORT comments to your favorite room names by appending an underscore and comment to the room name. Example: 'W31N24_foo bar`
//    - NEW: "sell" button next to each terminal resource. Clicking this will log a prompt to the console for creating a sell order for that resource from that room.


// THIS CODE ALSO REQUIRES THE AVERAGE TICK LENGTH MEASUREMENT CODE (pinned in #logging) TO BE PUT AT THE END OF YOUR MAIN LOOP.
// THE REMAINING CODE JUST NEEDS TO BE REQUIRED SOMEWHERE

/**
 * Favorite rooms of other players for sending resources with terminals.
 * Enter room names in the array. You can add an optional SHORT comment by appending
 * an underscore followed by the comment to the room name. Making this comment much
 * more than a few characters will make the dropdown menu awkwardly wide.
 * @type {string[]}
 */
global.favoriteTerminalTargets = ['W21N6_dewey'];


/**
 * Returns the mineral type of the room.
 * Stores it in memory if not already stored.
 */
Object.defineProperty(Room.prototype, 'mineralType', {
    get: function() {
        if (this == undefined || this.name == undefined)
            return undefined;
        if (!this._mineralType) {
            if (!this.memory.mineralType) {
                this.memory.mineralType = (this.find(FIND_MINERALS)[0] || {}).mineralType;
            }
            this._mineralType = this.memory.mineralType;
        }
        return this._mineralType;
    },
    enumerable: false,
    configurable: true
});

/**
 * Returns the reaction type of the room. Shortcut to Memory.rooms[roomName].reactionType.
 * This value gets set by the reaction type menu in the storageContents function.
 */
Object.defineProperty(Room.prototype, 'reactionType', {
    get: function() {
        if (this == undefined || this.name == undefined)
            return undefined;
        if (!this._reactionType) {
            this._reactionType = this.memory.reactionType;
        }
        return this._reactionType;
    },
    enumerable: false,
    configurable: true
});

/**
 * returns string for a link that can be clicked from the console
 * to change which room you are viewing. Useful for other logging functions
 * Author: Helam
 * @param roomArg {Room|RoomObject|RoomPosition|RoomName}
 * @returns {string}
 */
global.roomLink = function(roomArg) {
    if (roomArg instanceof Room) {
        roomArg = roomArg.name;
    } else if (roomArg.pos != undefined) {
        roomArg = roomArg.pos.roomName;
    } else if (roomArg.roomName != undefined) {
        roomArg = roomArg.roomName;
    } else if (typeof roomArg === 'string') {
        roomArg = roomArg;
    } else {
        console.log(`Invalid parameter to roomLink global function: ${roomArg} of type ${typeof roomArg}`);
    }
    return `<a href="#!/room/${roomArg}">${roomArg}</a>`;
};

/**
 * Takes a resource type constant as input and returns
 * the html/svg string for the icon of that resource
 * Author: Helam
 * @param resourceType
 * @param amount {0 by default, pass false to hide it}
 * @returns {string}
 */
global.svgMineral = function(resourceType, amount = 0, filling = 0) {
    var outstr = ``;

    let length = Math.max(1, Math.ceil(Math.log10(amount + 1) + Math.log10(Math.abs(filling) + 1)));
    let amountWidth = length * 10 + 5;

    if (amount === false)
        amountWidth = 0;

    let textDisplacement = 14;

    var finalWidth = 14 + amountWidth;

    outstr += `<svg width="!!" height="14">`;

    if (resourceType === RESOURCE_ENERGY) {
        outstr += `<circle cx="7" cy="7" r="5" style="fill:#FEE476"/>`;
    } else if (resourceType === RESOURCE_POWER) {
        outstr += `<circle cx="7" cy="7" r="5" style="fill:#F1243A"/>`;
    } else {
        let BASE_MINERALS = {
            [undefined]: {back: `#fff`, front: `#000`},
            [RESOURCE_HYDROGEN]: {back: `#4B4B4B`, front: `#989898`},
            [RESOURCE_OXYGEN]: {back: `#4B4B4B`, front: `#989898`},
            [RESOURCE_UTRIUM]: {back: `#0A5D7C`, front: `#48C5E5`},
            [RESOURCE_LEMERGIUM]: {back: `#265C42`, front: `#24D490`},
            [RESOURCE_KEANIUM]: {back: `#371A80`, front: `#9269EC`},
            [RESOURCE_ZYNTHIUM]: {back: `#58482D`, front: `#D9B478`},
            [RESOURCE_CATALYST]: {back: `#572122`, front: `#F26D6F`}
        };

        let COMPOUNDS = {
            U: {back: `#58D7F7`, front: `#157694`},
            L: {back: `#29F4A5`, front: `#22815A`},
            K: {back: `#9F76FC`, front: `#482794`},
            Z: {back: `#FCD28D`, front: `#7F6944`},
            G: {back: `#FFFFFF`, front: `#767676`},
            O: {back: `#99ccff`, front: `#000066`},
            H: {back: `#99ccff`, front: `#000066`}
        };

        let colors = BASE_MINERALS[resourceType];

        if (colors) {
            outstr += `<circle cx="7" cy="7" r="5" style="stroke-width:1;stroke:${colors.front};fill:${colors.back}"/>`;
            outstr += `<text x="7" y="8" font-family="Verdana" font-size="8" alignment-baseline="middle" text-anchor="middle" style="fill:${colors.front};font-weight:bold;">${resourceType === undefined ? '?' : resourceType}</text>`;
        } else {
            let compoundType = ['U', 'L', 'K', 'Z', 'G', 'H', 'O'].find(type=>resourceType.indexOf(type) !== -1);
            colors = COMPOUNDS[compoundType];
            if (colors) {
                let width = resourceType.length * 9;
                finalWidth += width;
                textDisplacement = width;
                outstr += `<rect x="0" y="0" width="${width}" height="14" style="fill:${colors.back}"/>`;
                outstr += `<text x="${width / 2.0}" y="8" font-family="Verdana" font-size="8" alignment-baseline="middle" text-anchor="middle" style="fill:${colors.front};font-weight:bold;">${resourceType}</text>`;
            } else {
                throw new Error(`Invalid resource type ${resourceType} in global.svgMineral()`);
            }
        }
    }
    if (amount !== false){
        if(filling !== 0){
            outstr += `<text font-family="Verdana" font-size="10" x="${textDisplacement + amountWidth/2}" y="8" alignment-baseline="middle" text-anchor="middle" style="fill:white"> x ${amount.toLocaleString()} (${filling.toLocaleString()})</text>`;
        }
        else {
            outstr += `<text font-family="Verdana" font-size="10" x="${textDisplacement + amountWidth/2}" y="8" alignment-baseline="middle" text-anchor="middle" style="fill:white"> x ${amount.toLocaleString()}</text>`;
        }
    }
    outstr += `</svg>`;

    outstr = outstr.split('!!').join(finalWidth);

    return outstr;
};


/**
 * Used to create unique id numbers to use as the
 * id for html tags for later reference
 * Author: Helam
 * @returns {*|number}
 */
global.getId = function() {
    if (Memory.globalId == undefined || Memory.globalId > 10000) {
        Memory.globalId = 0;
    }
    Memory.globalId = Memory.globalId + 1;
    return Memory.globalId;
};

/**
 * Returns html for a button that will execute the given command when pressed in the console.
 * @param id (from global.getId, value to be used for the id property of the html tags)
 * @param type (resource type, pass undefined most of the time. special parameter for storageContents())
 * @param text (text value of button)
 * @param command (command to be executed when button is pressed)
 * @param browserFunction {boolean} (true if command is a browser command, false if its a game console command)
 * @returns {string}
 * Author: Helam
 */
global.makeButton = function(id, type, text, command, browserFunction=false) {
    var outstr = ``;
    var handler = ``;
    if (browserFunction) {
        outstr += `<script>var bf${id}${type} = ${command}</script>`;
        handler = `bf${id}${type}()`
    } else {
        handler = `customCommand${id}${type}(\`${command}\`)`;
    }
    outstr += `<script>var customCommand${id}${type} = function(command) { $('body').injector().get('Connection').sendConsoleCommand(command) }</script>`;
    outstr += `<input type="button" value="${text}" style="background-color:#555;color:white;" onclick="${handler}"/>`;
    return outstr;
};

/**
 * Basic sell price information, Modify this to show the info you want
 * Author: Helam
 * @param sellingRoom
 * @param resource
 * @returns {*}
 */
global.sellPriceInformation = function(sellingRoom, resource) {
    let sellingRoomName = sellingRoom.name || sellingRoom;

    let orders = Game.market.getAllOrders(o => {
        return o.type === ORDER_SELL &&
            o.resourceType === resource;
    });

    let numOrders = _.size(orders);
    if (!numOrders) return undefined;

    // Global stats
    let globalPriceSum = _.sum(orders, order => order.price);
    let globalPriceAvg = globalPriceSum / numOrders;
    let globalMin = _.min(orders, o => o.price).price;

    // Stats on orders below the global average
    let ordersBelowAverage = _.filter(orders, o => o.price < globalPriceAvg);
    let numOrdersBelowAvg = _.size(ordersBelowAverage);
    let belowAvgPriceSum = _.sum(ordersBelowAverage, order => order.price);
    let belowAvgPriceAvg = belowAvgPriceSum / numOrdersBelowAvg;

    // Local stats
    const LOCAL_ROOM_RANGE = 20;
    let localOrders = _.filter(orders, o => {
        return Game.map.getRoomLinearDistance(sellingRoomName, o.roomName) <= LOCAL_ROOM_RANGE;
    });
    let numLocal = _.size(localOrders);
    if (numLocal) {
        var localPriceSum = _.sum(localOrders, o => o.price);
        var localPriceAvg = localPriceSum / numLocal;

        var localOrdersBelowAverage = _.filter(localOrders, o => o.price < localPriceAvg);
        var numLocalBelow = _.size(localOrdersBelowAverage);
        var sumLocalBelow = _.sum(localOrdersBelowAverage, o => o.price);
        var localBelowAvg = sumLocalBelow / numLocalBelow;
        var localMin = _.min(localOrders, o => o.price).price;
    }

    let global = {avg: globalPriceAvg, lowAvg: belowAvgPriceAvg, min: globalMin};
    let local = {avg: localPriceAvg, lowAvg: localBelowAvg, min: localMin};
    return {global, local}
};

/**
 * Logs a prompt for creating a sell order for the given resource and
 * selling from the given room name.
 * Author: Helam
 * @param roomName
 * @param resource
 */
global.customSell = function(roomName, resource, amount) {
    let outstr = ``;
    let id = getId();
    outstr += `${roomLink(roomName)}: Sell <input id="amount${id}" placeholder="Amount" type="text"/> x ${svgMineral(resource, false)} `;
    outstr += `at <input id="cost${id}" placeholder="Price" type="text"/> credit(s) per unit of resource. `;
    let type = resource;
    outstr += makeButton(id, type, 'Create Order', `function() { customCommand${id}${type}(\` Game.market.createOrder(ORDER_SELL, '${type}', \${$('#cost${id}').val()}, \${$('#amount${id}').val()}, '${roomName}'); \`) }`, true);
    outstr += `\nPrice Info: ${JSON.stringify(sellPriceInformation(roomName, resource))}`;
    outstr += `\nAmount in terminal: ${amount}`;
    console.log(outstr);
};

global.customFill = function(roomName, resource, amount){
    if(!Memory.market){
        Memory.market = {};
    }
    if(!Memory.market.fillTerminal){
        Memory.market.fillTerminal = {};
    }
    if(!Memory.market.fillTerminal[roomName]){
        Memory.market.fillTerminal[roomName] = {};
    }
    if(!Memory.market.fillTerminal[roomName][resource]){
        Memory.market.fillTerminal[roomName][resource] = amount;
    }
};

global.customSend = function(roomName, targetRoom, resource, amount){
    if(!Memory.market){
        Memory.market = {};
    }
    if(!Memory.market.transfer){
        Memory.market.transfer = {};
    }
    if(!Memory.market.transfer[roomName]){
        Memory.market.transfer[roomName] = [{amount: amount, to: targetRoom, resourceType: resource}];
    }
    else {
        Memory.market.transfer[roomName].push({amount: amount, to: targetRoom, resourceType: resource});
    }
};

global.customDeal = function(roomName, amount, id){
    if(!Memory.market){
        Memory.market = {};
    }
    if(!Memory.market.deals){
        Memory.market.deals = {};
    }
    if(!Memory.market.deals[roomName]){
        Memory.market.deals[roomName] = [{amount: amount, id: id}];
    }
    else {
        Memory.market.deals[roomName].push({amount: amount, id: id});
    }
};

/**
 * Get <select> options for owned rooms
 * Author: Enrico, Helam
 * @param excludeRoom (The room doing the sending)
 * @returns {string}
 */
global.showRoomSelectOptions = function (excludeRoom) {
    function sendCostPercentage(fromRoomName, toRoomName) {
        let dist = Game.map.getRoomLinearDistance(fromRoomName, toRoomName);
        return 1 - Math.exp(-dist / 30);
    }
    function maxSendableAmount(fromRoomName, toRoomName) {
        return Math.floor(Game.rooms[fromRoomName].terminal.store.energy / sendCostPercentage(fromRoomName, toRoomName));
    }
    let outstr = `<option value="custom">Enter target room</option>`;
    let ownRooms = _.filter(Game.rooms, r => r.name != excludeRoom && r.controller && r.controller.my && r.terminal);
    ownRooms.forEach(r => {
        outstr += `<option value="${r.name}">${r.name} | ${sendCostPercentage(excludeRoom, r.name).toLocaleString().slice(0,5)}</option>`;
    });
    if (favoriteTerminalTargets) {
        outstr += `<optgroup label="Favorites">`;
        favoriteTerminalTargets.forEach(r => {
            let [favorite, comment] = r.split("_");
            outstr += `<option value="${favorite}">${favorite}${comment ? `  |  ${comment}` : ``} | ${sendCostPercentage(excludeRoom, favorite).toLocaleString().slice(0,5)}</option>`;
        });
        outstr += '</optgroup>';
    }
    return outstr;
};

/**
 * Outputs the contents of any room object with a '.store' property in svg format.
 * Author: Helam, Enrico
 * @param object {StructureStorage|StructureTerminal|StructureContainer}
 * @param vertical {boolean} (true will put a new line after each resource)
 * @param send {boolean} (whether or not to have the "send" button after each one)
 * @param sell {boolean} (whether or not to have the "sell" button after each one)
 * @returns {string}
 */
global.showStore = function(object, vertical=false, send=false, sell=false, fill=false) {
    if (object.store) {
        var outstr = ``;
        var id;
        if (send) {
            id = getId();
            outstr += `Amount:<input style="color:black" type="text" id="amount${id}"/>\n`;
            outstr += `To Room:<select style="color:black" type="text" id="selectroom${id}">${showRoomSelectOptions(object.pos.roomName)}</select>\n`;
            outstr += `To Room:<input style="color:black" type="text" id="toroom${id}"/>\n`;
            outstr += `Deal id:<input style="color:black" type="text" id="dealId${id}"/>`;
            let dummyType;
            outstr += makeButton(id, dummyType,'deal', `customDeal('${object.room.name}', \${$('#amount${id}').val()}, '\${$('#dealId${id}').val()}');`);
            outstr += `\n`;
        }
        else if(fill){
            id = getId();
            outstr += `Amount:<input style="color:black" type="text" id="amount${id}"/>\n`;
        }

        Object.keys(object.store).forEach(function(type) {
            if(object.room && Memory.rooms[object.room.name].orders && Memory.rooms[object.room.name].orders[type]){
                let f = object.structureType === STRUCTURE_STORAGE ? -1 : 1;
                outstr += svgMineral(type, object.store[type],f*Memory.rooms[object.room.name].orders[type]);
            }
            else {
                outstr += svgMineral(type, object.store[type]);
            }
            
            if (send) {
                outstr += ` `;
                outstr += makeButton(id, type,'send', `customSend('${object.room.name}', '\${$('#selectroom${id}').val() == 'custom' ? $('#toroom${id}').val() : $('#selectroom${id}').val()}', '${type}', \${$('#amount${id}').val()});`);
            }
            if (sell) {
                let sellId = getId();
                outstr += ` `;
                outstr += makeButton(sellId, type, 'sell', `customSell('${object.room.name}', '${type}', \${$('#amount${id}').val()});`);
            }
            if (fill) {
                let fillId = getId();
                outstr += ` `;
                outstr += makeButton(fillId, type, 'fill', `customFill('${object.room.name}', '${type}', \${$('#amount${id}').val()});`);
            }
            if (vertical) {
                outstr += `\n`;
            } else {
                outstr += `\t`;
            }
        });
        return outstr;
    } else {
        throw new Error(`Invalid argument to global.showStore()! Argument must be an object with a 'store' property.`);
    }
};

/**
 * Takes a room and outputs the html/svg string for the storage and terminal of that room,
 * Work in progress.
 * Hovering over the storage just shows it contents.
 * Hovering over ther terminal will show a menu for sending resources via that terminal.
 * Currently this does not dynamically change the console output, though you can scroll down
 * in the console to see what value the terminal.send command returned and act accordingly.
 * Author: Helam
 * Tooltips: Dragnar
 * @param roomArg {Room|RoomName}
 * @param terminalSendControls {boolean} (enable/disable terminal send controls)
 * @param terminalSellControls {boolean} (enable/disable terminal sell controls)
 * @returns {string}
 */
global.svgRoomStorage = function(roomArg, terminalSendControls = true, terminalSellControls = true, terminalFillControls = true) {
    var room;
    var storage;
    var terminal;
    if (roomArg instanceof Room) {
        room = roomArg;
    } else if (typeof roomArg === 'string') {
        room = Game.rooms[roomArg];
    } else if (roomArg.storage && roomArg.terminal) {
        room = roomArg;
    }
    if (!room) throw new Error(`Invalid argument or no access to room in global.svgRoomStorage()`);

    storage = room.storage;
    terminal = room.terminal;

    var outstr = ``;

    outstr += `<style id="dropdownStyle">`;
    outstr += `.dropbtn {`;
    outstr += `background-color: #4CAF50;`;
    outstr += `color: white;`;
    outstr += `padding: 16px;`;
    outstr += `font-size: 16px;`;
    outstr += `border: none;`;
    outstr += `cursor: pointer;`;
    outstr += `}`;

    outstr += `.dropdown {`;
    outstr += `position: relative;`;
    outstr += `display: inline-block;`;
    outstr += `}`;

    outstr += `.dropdown-content {`;
    outstr += `display: none;`;
    outstr += `z-index: 1;`;
    outstr += `padding: 5px;`;
    outstr += `border-radius: 6px;`;
    outstr += `text-align: center;`;
    outstr += `position: absolute;`;
    outstr += `background-color: #f9f9f9;`;
    outstr += `min-width: 200px;`;
    outstr += `box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);`;
    outstr += `}`;

    outstr += `.dropdown-content a {`;
    outstr += `color: black;`;
    //outstr += `padding: 12px 16px;`;
    outstr += `text-decoration: none;`;
    outstr += `display: block;`;
    outstr += `}`;

    outstr += `.dropdown-content a:hover {background-color: #f1f1f1}`;

    outstr += `.dropdown:hover .dropdown-content {`;
    outstr += `display: block;`;
    outstr += `}`;

    outstr += `.dropdown:hover .dropbtn {`;
    outstr += `background-color: #3e8e41;`;
    outstr += `}`;
    outstr += `</style>`;


    outstr += `<style id="tooltipStyle">`;
    outstr += `.tool {`;
    outstr += `position: relative;`;
    outstr += `display: inline-block;`;
    outstr += `}`;
    outstr += `.tool .tip {`;
    outstr += `visibility: hidden;`;
    outstr += `width: 300px;`;
    outstr += `background-color: #111111`;//2c2c2c;`;
    outstr += `color: #000;`; //fff`;
    outstr += `text-align: center;`;
    outstr += `border-radius: 6px;`;
    outstr += `padding: 5px 0;`;
    outstr += `position: absolute;`;
    outstr += `z-index: 1;`;
    outstr += `opacity: 0;`;
    outstr += `transition: opacity 1s;`;
    outstr += `}`;
    outstr += `.tool .tipRight {`;
    outstr += `top: -5px;`;
    outstr += `left: 101%;`;
    outstr += `}`;
    outstr += `.tool:hover .tip {`;
    outstr += `visibility: visible;`;
    outstr += `opacity: 0.9;`;
    outstr += `}`;
    outstr += `.tool table {`;
    outstr += `text-align: left;`;
    outstr += `margin-left: 5px;`;
    outstr += `}`;
    outstr += `</style>`;

    outstr += `<span class="tool">`;
    outstr += `<span style="background-color:#000" class="tip">`;
    if (storage) {
        //outstr += `${JSON.stringify(storage.store)}`;
        outstr += showStore(storage, true, false, false, terminalFillControls);
    } else {
        outstr += `No Storage Built`;
    }
    outstr += `</span>`;
    outstr += `<svg width="50" height="60">`;
    outstr += `<path style="stroke-width: 1;stroke:#90BA94" d='M16 48 C18 52 38 52 40 48 C42 46 42 18 40 16 C38 12 18 12 16 16 C14 18 14 46 16 48' />`;
    outstr += `<path style="fill:#555555" d='M18 46 L38 46 L38 18 L18 18' />`;
    outstr += `<!-- coords of storage inner box -->`;
    outstr += `<!--<rect x="18" y="18" width="20" height="28" style="fill:#F1243A" />-->`;
    if (storage) {
        let capacity = storage.storeCapacity;
        let energy = storage.store[RESOURCE_ENERGY];
        let power = storage.store[RESOURCE_POWER] || 0;
        let other = _.sum(storage.store) - energy - power;

        const HEIGHT = 28;
        const START_Y = 18;

        let energyHeight = HEIGHT * (energy/capacity);
        let otherHeight = HEIGHT * (other/capacity) + energyHeight;
        let powerHeight = HEIGHT * (power/capacity) + otherHeight;

        outstr += `<!-- power -->`;
        outstr += `<rect x="18" y="${START_Y + (HEIGHT - powerHeight)}" width="20" height="${powerHeight}" style="fill:#F1243A" />`;
        outstr += `<!-- minerals -->`;
        outstr += `<rect x="18" y="${START_Y + (HEIGHT - otherHeight)}" width="20" height="${otherHeight}" style="fill:#FFFFFF" />`;
        outstr += `<!-- energy -->`;
        outstr += `<rect x="18" y="${START_Y + (HEIGHT - energyHeight)}" width="20" height="${energyHeight}" style="fill:#FEE476" />`;
    } else {
        outstr += `<path style="fill:red" d='M44 18 L42 16 L28 30 L14 16 L12 18 L26 32 L12 46 L14 48 L28 34 L42 48 L44 46 L30 32 Z' />`;
    }
    outstr += `</svg>`;
    outstr += `</span>`;

    outstr += `<span class="tool">`;
    outstr += `<span style="background-color:#000" class="tip">`;
    if (terminal) {
        //outstr += `${JSON.stringify(terminal.store)}`;
        outstr += showStore(terminal, true, terminalSendControls, terminalSellControls, terminalFillControls);
    } else {
        outstr += `No Terminal Built`;
    }
    outstr += `</span>`;
    outstr += `<svg width="50" height="60" style="transform:scale(1.2,1.2)">`;
    outstr += `<path vector-effect="non-scaling-stroke" style="stroke:#90BA94" d='M36 40 L42 32 L36 24 L28 18 L20 24 L14 32 L20 40 L28 46 Z' />`;
    outstr += `<path vector-effect="non-scaling-stroke" style="fill:#AAAAAA" d='M34 38 L38 32 L34 26 L28 22 L22 26 L18 32 L22 38 L28 42 Z' />`;
    outstr += `<path vector-effect="non-scaling-stroke" style="stroke-width:2;stroke:black;fill:#555555" d='M34 38 L34 32 L34 26 L28 26 L22 26 L22 32 L22 38 L28 38 Z' />`;
    if (terminal) {
        let capacity = terminal.storeCapacity;
        let energy = terminal.store[RESOURCE_ENERGY];
        let power = terminal.store[RESOURCE_POWER] || 0;
        let other = _.sum(terminal.store) - energy - power;

        const RADIUS = 6;

        const START_X = 22;
        const START_Y = 26;

        let energyRadius = RADIUS * (energy/capacity);
        let otherRadius = RADIUS * (other/capacity) + energyRadius;
        let powerRadius = RADIUS * (power/capacity) + otherRadius;

        let powerX = START_X + (RADIUS - powerRadius);
        let otherX = START_X + (RADIUS - otherRadius);
        let energyX = START_X + (RADIUS - energyRadius);

        let powerY = START_Y + (RADIUS - powerRadius);
        let otherY = START_Y + (RADIUS - otherRadius);
        let energyY = START_Y + (RADIUS - energyRadius);

        outstr += `<!-- power -->`;
        outstr += `<rect x="${powerX}" y="${powerY}" width="${powerRadius * 2}" height="${powerRadius * 2}" style="fill:#F1243A" />`;
        outstr += `<!-- minerals -->`;
        outstr += `<rect x="${otherX}" y="${otherY}" width="${otherRadius * 2}" height="${otherRadius * 2}" style="fill:#FFFFFF" />`;
        outstr += `<!-- energy -->`;
        outstr += `<rect x="${energyX}" y="${energyY}" width="${energyRadius * 2}" height="${energyRadius * 2}" style="fill:#FEE476" />`;
    } else {
        outstr += `<path style="fill:red" d='M44 18 L42 16 L28 30 L14 16 L12 18 L26 32 L12 46 L14 48 L28 34 L42 48 L44 46 L30 32 Z' />`;
    }
    outstr += `</svg>`;
    outstr += `</span>`;

    //console.log(outstr);
    return outstr;
};

/**
 * Console function: prints svg's showing the contents of
 * the storage and terminal for each claimed room.
 * If reactionTypeSetting is true, setting the reaction type
 * of a room will set the corresponding value in Memory.rooms[roomName].reactionType
 * Author: Helam, Dewey
 * @param reactionTypeSetting {boolean} (whether or not to include room reaction types and the menu for setting them)
 */
global.storageContents = function(reactionTypeSetting = true) {
    var outputString = "";
    outputString += '<div style="width:1200px">';

    let totalStorage = {store: {[RESOURCE_ENERGY]: 0}, storeCapacity: 0};
    let totalTerminal = {store: {[RESOURCE_ENERGY]: 0}, storeCapacity: 0};

    function addToGlobalStore(storeObject) {
        let toAddTo;
        if (storeObject instanceof StructureStorage)
            toAddTo = totalStorage;
        else if (storeObject instanceof StructureTerminal)
            toAddTo = totalTerminal;
        else
            return;

        Object.keys(storeObject.store).forEach(type => {
            toAddTo.store[type] = (toAddTo.store[type] || 0) + storeObject.store[type];
        });
        toAddTo.storeCapacity += storeObject.storeCapacity;
    }

    var maxResources = 1;

    Object.keys(Game.rooms).map( name => Game.rooms[name])
        .filter(r => r.controller && r.controller.my)
        .sort( (a,b) => b.controller.level - a.controller.level || b.controller.progress - a.controller.progress )
        .forEach( room => {
            outputString += `<div class="row" style="white-space:normal;">`;
            // roomlink and mineral types
            outputString += `<div class="col-sm-1" style="width:60px"> ${roomLink(room)}\n`;
            outputString += `<span class="tool">`;
            outputString += `T:${svgMineral(room.mineralType, false)}\n`;
            outputString += `<span style="background-color:#000" class="tip">Room Mineral Type:\n${svgMineral(room.mineral[0].mineralType,room.mineral[0].mineralAmount)}${room.mineral[0].ticksToRegeneration != undefined ? `\nRegeneration in: ${room.mineral[0].ticksToRegeneration} ticks${Memory.averageTickLength ? `\n(${((room.mineral[0].ticksToRegeneration * Memory.averageTickLength) / 3600).toFixed(2)} hours)` : ``}` : ``}</span>`;
            outputString += `</span>`;
            if (reactionTypeSetting) {
                outputString += `<span class="dropdown">`;
                let reactionTypeId1 = getId();
                outputString += `R:<span id="${reactionTypeId1}">${svgMineral(room.reactionType, false)}</span>`;
                // vvvvvvvv tooltip
                let reactionTypeId2 = getId();
                outputString += `<div style="background-color:#000" class="dropdown-content">`;
                outputString += `Room Reaction Type: <span id="${reactionTypeId2}">${svgMineral(room.reactionType, false)}</span>\n`;
                outputString += `${showReactions(room, reactionTypeId1, reactionTypeId2)}`;
                outputString += `</div>`;
                // /\/\/\/\ tooltip
                outputString += `</span>`;
            }
            outputString += `</div>`;

            outputString += '<div class="col-sm-1" style="width:130px">' + svgRoomStorage(room) + '</div>';
            if (room.storage) outputString += `<div class="col-sm-::"> Storage: ${_.sum(room.storage.store).toLocaleString()}/${room.storage.storeCapacity.toLocaleString()} \n${showStore(room.storage)} </div>`;
            if (room.terminal) outputString += `<div class="col-sm-?? col-sm-offset-1"> Terminal: ${_.sum(room.terminal.store).toLocaleString()}/${room.terminal.storeCapacity.toLocaleString()} \n${showStore(room.terminal)} </div>`;
            if (room.storage) maxResources = Math.max(Object.keys(room.storage.store).length, maxResources);
            addToGlobalStore(room.storage);
            addToGlobalStore(room.terminal);
            outputString += `</div>`;
        });

    outputString += `<div class="row" style="white-space:normal;">`;
    outputString += `<div class="col-sm-1" style="width:60px">Empire Totals:\n</div>`
    let room = {storage: totalStorage, terminal: totalTerminal};
    outputString += '<div class="col-sm-1" style="width:130px">' + svgRoomStorage(room, false, false, false) + '</div>';
    if (room.storage) outputString += `<div class="col-sm-::"> Storage: ${_.sum(room.storage.store).toLocaleString()}/${room.storage.storeCapacity.toLocaleString()} \n${showStore(room.storage)} </div>`;
    if (room.terminal) outputString += `<div class="col-sm-?? col-sm-offset-1"> Terminal: ${_.sum(room.terminal.store).toLocaleString()}/${room.terminal.storeCapacity.toLocaleString()} \n${showStore(room.terminal)} </div>`;
    if (room.storage) maxResources = Math.max(Object.keys(room.storage.store).length, maxResources);
    outputString += `</div>`;


    outputString += "</div>";

    let storageColumns = Math.min(5, maxResources);
    let terminalColumns = 10 - storageColumns - 1;

    //console.log(storageColumns);
    //console.log(terminalColumns);

    outputString = outputString.split(`::`).join(storageColumns);
    outputString = outputString.split(`??`).join(terminalColumns);

    console.log(outputString);
    //return outputString;
};

/**
 * Creates the contents of the menu for setting room reaction types.
 * Only shows a compound if the room's storage or terminal contains at least
 * one of the resources required for that reaction.
 * The buttons in the menu will change the svg tags in the console output to match
 * the new reaction type and will also set Memory.rooms[roomName].reactionType to the given mineral.
 * Author: Helam
 * @param room {Room}
 * @param reactionTypeId1 (id from getId() for one of the html tags that contains the svg for the reaction type of the room)
 * @param reactionTypeId2 (id from getId() for the other of the html tags that contains the svg for the reaction type of the room)
 * @returns {string}
 */
global.showReactions = function(room, reactionTypeId1, reactionTypeId2) {

    var outstr = ``;
    let id = getId();
    outstr += `Amount:<input style="color:black" type="text" id="amount${id}"/>\n`;
    outstr += `Reagants:<input style="color:black" type="text" id="reagent1${id}"/>`;
    outstr += ` <input style="color:black" type="text" id="reagent2${id}"/>\n`;
    let reactId = getId();
    let dummy;
    outstr += makeButton(reactId, dummy, 'set', `customReaction('${room.name}', \${$('#amount${id}').val()}, '\${$('#reagent1${id}').val()}', '\${$('#reagent2${id}').val()}');`);
    return outstr;
};

global.customReaction = function(room, amount, reagent1, reagent2){
    if(!Memory.boosts){
        Memory.boosts = {};
    }
    if(!Memory.boosts[room]){
        Memory.boosts[room] = {amount: amount, reagents: [reagent1,reagent2]};
    }
}