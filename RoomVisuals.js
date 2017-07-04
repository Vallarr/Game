RoomVisual.prototype.drawPath = function(path,style){
    if(style == undefined){style = {}}
    if(style.lineStyle == undefined){style.lineStyle = 'dashed'}
    this.poly(path,style);
};

RoomVisual.prototype.drawStructure = function(list, drawFunc){
    if(!list){return}
    for(let i=0; i<list.length; i++){
        drawFunc.call(this,list[i]);
    }
};

RoomVisual.prototype.drawRoomPlan = function(plan){
    if(plan == undefined){
        let room = Game.rooms[this.roomName];
        if(!room){return}
        if(room.memory.plan){
            plan = gatherPlan(room.memory.plan);
        }
        else {return}
    }
    
    this.drawStructure(plan[STRUCTURE_ROAD], (obj) => {
        this.circle(obj.x, obj.y, {radius: .35, fill: "#757575"});
    });    
    
    this.drawStructure(plan[STRUCTURE_EXTENSION], (obj) => {
        this.circle(obj.x, obj.y, {radius: .35, fill: "#777777", stroke: "#88B18A"});
        this.circle(obj.x, obj.y, {radius: .3, fill: "#FFE56D", stroke: "#000000"});
    });
    
    this.drawStructure(plan[STRUCTURE_RAMPART], (obj) =>
    {
        this.circle(obj.x, obj.y, {radius: .5, fill: "#3F3F3F", stroke: "#5C725E"});
        this.circle(obj.x, obj.y, {radius: .5, fill: "#5C725E", stroke: "#5C725E"});
    });
    
    this.drawStructure(plan[STRUCTURE_TOWER], (obj) =>
    {
        this.circle(obj.x, obj.y, {radius: .65, fill: "#111", stroke: "#88B18A", strokeWidth: 0.05});
        this.rect(obj.x -.4, obj.y -.3, .8, .6, {fill: "#777"});
        this.rect(obj.x -.18, obj.y -.85, .36, .5, {fill: "#BBB", stroke: "#000", strokeWidth: 0.05});
    });
    
    this.drawStructure(plan[STRUCTURE_LAB], (obj) =>
    {
        this.rect(obj.x -.4, obj.y +.4, .8, .15, {fill: "#000", stroke: "#88B18A", strokeWidth: .05});
        this.circle(obj.x, obj.y, {radius: .5, fill: "#000", stroke: "#88B18A", strokeWidth: .05});
        this.circle(obj.x, obj.y, {radius: .45, fill: "#777", stroke: "#000", strokeWidth: .1});
        this.rect(obj.x -.325, obj.y +.375, .65, .15, {fill: "#FFE56D", stroke: "#000", strokeWidth: .05});
    });
    
    this.drawStructure(plan[STRUCTURE_WALL], (obj) =>
    {
        this.circle(obj.x, obj.y, {radius: .5, fill: "#000", stroke: "#000"});
        this.line(obj.x-.2, obj.y-.175, obj.x+.075, obj.y-.175, {width: 0.025});
        this.line(obj.x+.2, obj.y+.175, obj.x-.075, obj.y+.175, {width: 0.025});
    });
    
    this.drawStructure(plan[STRUCTURE_SPAWN], (obj) =>
    {
        this.circle(obj.x, obj.y, {radius: .65, fill:"#000", stroke:"#FFF", strokeWidth: 0.12});
        this.circle(obj.x, obj.y, {radius: .35, fill:"#FFE56D"});
    });
    
    this.drawStructure(plan[STRUCTURE_CONTAINER], (obj) =>
    {
        this.rect(obj.x-.25, obj.y-.33, .5, .56, {fill: "#777", stroke: "#000", strokeWidth: 0.12});
    });
    
    this.drawStructure(plan[STRUCTURE_LINK], (obj) =>
    {
        this.poly([[obj.x, obj.y-.5], [obj.x-.4, obj.y], [obj.x, obj.y+.5], [obj.x+.4, obj.y]], {fill: "#88B18A", strokeWidth:0.001});
        this.poly([[obj.x, obj.y-.45], [obj.x-.35, obj.y], [obj.x, obj.y+.45], [obj.x+.35, obj.y]], {fill: "#000", strokeWidth:0.001, opacity: .75});
        this.poly([[obj.x, obj.y-.35], [obj.x-.25, obj.y], [obj.x, obj.y+.35], [obj.x+.25, obj.y]], {fill: "#777", strokeWidth:0.001});
    });
    
    this.drawStructure(plan[STRUCTURE_STORAGE], (obj) =>
    {
        this.rect(obj.x-.6, obj.y-.8, 1.2, 1.6, {fill:"#000", stroke: "#88B18A", strokeWidth:0.07});
        this.rect(obj.x-.5, obj.y-.6, 1, 1.2, {fill:"#777"});
    });
    
    this.drawStructure(plan[STRUCTURE_TERMINAL], (obj) =>
    {
        this.poly([[obj.x-1, obj.y], [obj.x, obj.y-1], [obj.x+1, obj.y], [obj.x, obj.y+1]], {fill:"#88B18A", strokeWidth:0.001});
        this.poly([[obj.x-.95, obj.y], [obj.x, obj.y-.95], [obj.x+.95, obj.y], [obj.x, obj.y+.95]], {fill:"#000", strokeWidth:0.001, opacity:.7});
        this.poly([[obj.x-.85, obj.y], [obj.x, obj.y-.85], [obj.x+.85, obj.y], [obj.x, obj.y+.85]], {fill:"#DDD", strokeWidth:0.001});
        this.rect(obj.x-.4, obj.y-.4, .8, .8, {fill:"#333", stroke:"#000"});
    });
    
    this.drawStructure(plan[STRUCTURE_NUKER], (obj) =>
    {
        this.text("N", obj.x, obj.y);
    });
    
    this.drawStructure(plan[STRUCTURE_OBSERVER], (obj) =>
    {
        this.text("O", obj.x, obj.y);
    });
    
    this.drawStructure(plan[STRUCTURE_POWER_SPAWN], (obj) =>
    {
        this.text("P", obj.x, obj.y);
    });
};

global.gatherPlan = function(mem){
    let plan = {};
    for(let x in mem){
        if(x == 'planning' || x == 'planningStructure' || x == 'drawing'){continue}
        for(let y in mem[x]){
            let st = mem[x][y];
            for(let i=0; i<st.length; i++){
                if(plan[st[i].structureType]){
                    plan[st[i].structureType].push({x: Number(x), y: Number(y)});
                }
                else {
                    plan[st[i].structureType] = [{x: Number(x), y: Number(y)}];
                }
            }
        }
    }
    return plan;
}