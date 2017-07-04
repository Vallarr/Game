global.roomPlanner = function(roomName,showBuilt=true){
    var outstr = ``;
    
    outstr += `<div class="row">`;
    outstr += `<div class="col-sm-1" style="width:800px">`;
    outstr += svgRoom(roomName,showBuilt);
    outstr += `</div>`;
    outstr += `<div class="col-sm-1" style="width:250px">`;
    let id = getId();
    let dummyType;
    outstr += makeButton(id,dummyType,'Plan', `setPlanOrRemove('${roomName}', 'plan')`);
    id = getId();
    outstr +=`   `;
    outstr += makeButton(id,dummyType,'Remove', `setPlanOrRemove('${roomName}', 'remove')`);
    outstr += `\n`;
    id = getId();
    outstr += `Structure to plan:\n<select style="color:black" type="text" id="selectStructure${id}">`;
    for(let i=0;i<STRUCTURE_ALL.length; i++){
        structureType = STRUCTURE_ALL[i];
        outstr += `<option value=${structureType}>${structureType}</options>`;
    }
    outstr += `</select>\n`;
    outstr += makeButton(id,dummyType,'Set planning structure', `setPlanningStructure('${roomName}', '\${$('#selectStructure${id}').val()}');`);
    outstr += `\n`;
    id = getId();
    outstr += makeButton(id,dummyType,'Toggle RoomVisual', `toggleRoomVisual('${roomName}')`);
    outstr += `</div>`;
    outstr += `</div>`;
    return outstr;
};

global.svgRoom = function(roomName,showBuilt){
    var outstr = ``;
    outstr += `<div style="line-height:0%">`;
    let room = Game.rooms[roomName];
    
    if(room && showBuilt){
        //Draw terrain and planned and built structures
        let planned;
        for(let y=0; y<50; y++){
            for(let x=0; x<50; x++){
                if(room.memory.plan && room.memory.plan[x] && room.memory.plan[x][y]){
                    planned = room.memory.plan[x][y];
                }
                else {planned = []}
                outstr+=svgTerrain(Game.map.getTerrainAt(x,y,roomName),{built: room.lookForAt(LOOK_STRUCTURES,x,y), planned: planned},{x: x, y: y, roomName: roomName});
            }
            outstr +=`\n`;
        }
    }
    else {
        //Only draw terrain and planned structures
        for(let y=0; y<50; y++){
            for(let x=0; x<50; x++){
                let planned;
                if(Memory.rooms[roomName] && Memory.rooms[roomName].plan && Memory.rooms[roomName].plan[x] && Memory.rooms[roomName].plan[x][y]){
                    planned = Memory.rooms[roomName].plan[x][y];
                }
                outstr+=svgTerrain(Game.map.getTerrainAt(x,y,roomName),{planned: planned},{x: x, y: y, roomName: roomName});
            }
            outstr +=`\n`;
        }
    }
    outstr += `</div>`;
    
    return outstr;
};

global.svgTerrain = function(terrain,structures,pos){
    let width = 15;
    let height = width;
    
    var outstr = ``;
    
    outstr += `<style id="terrainStyle">`;
    outstr += `.plain {`;
    outstr += `fill: #2B2B2B;`;
    outstr += `}`;
    outstr += `.plain:hover {`;
    outstr += `fill: #3F3F3F;`;
    outstr += `}`;
    
    outstr += `.swamp {`;
    outstr += `fill: #292B18;`;
    outstr += `}`;
    outstr += `.swamp:hover {`;
    outstr += `fill: #3E402F;`;
    outstr += `}`;
    
    outstr += `.wall {`;
    outstr += `fill: #111111;`;
    outstr += `}`;
    outstr += `.wall:hover {`;
    outstr += `fill: #282828;`;
    outstr += `}`;
    outstr += `</style>`;
    
    let id= getId();
    let command = `planOrRemove({x: ${pos.x}, y: ${pos.y}, roomName: '${pos.roomName}'})`;
    let handler = `customCommand${id}(\`${command}\`)`;
    outstr += `<script>var customCommand${id} = function(command) { $('body').injector().get('Connection').sendConsoleCommand(command); }</script>`;
    outstr += `<svg id="svg${id}" width="${width}" height="${height}" onclick="${handler}">`;
    outstr += `<rect class="${terrain}" x="0" y="0" width="${width}" height="${height}"/>`;
    if(structures){
        if(structures.planned){
            outstr += drawStructures(structures.planned,width,height,false);
        }
        if(structures.built){
            outstr += drawStructures(structures.built,width,height,true);
        }
    }
    outstr += `</svg>`;
    
    return outstr;
};

global.drawStructures = function(structures,width,height,built){
    //Structures that have allready been built will appear filled with resources
    //Built ramparts are green, not built ramparts are red
    //Not built walls are red
    var outstr = ``;
    let orWd = 50;
    let orHt = 60;
    let color;
    
    for(let i=0; i<structures.length; i++){
        switch (structures[i].structureType){
            case STRUCTURE_EXTENSION:
                outstr +=`<circle cx="${width/2.0}" cy="${height/2.0}" r="${width*0.4}" style="stroke:#88B18A;fill:#000000"/>`;
                if(built){color = '#FFE56D'}
                else {color = '#555555'}
                outstr +=`<circle cx="${width/2.0}" cy="${height/2.0}" r="${width*0.3}" style="fill:${color}"/>`;
                break;
            case STRUCTURE_RAMPART:
                if(built){color = '#5C725E'}
                else {color = '#FF1931'}
                outstr += `<circle cx="${width/2.0}" cy="${height/2.0}" r="${width*0.47}" style="stroke-width:2;stroke:${color};fill:${color};fill-opacity:0.1"/>`;
                break;
            case STRUCTURE_TOWER:
                outstr += `<circle cx="${width/2.0}" cy="${height/2.0}" r="${width*0.45}" style="stroke:#88B18A;fill:#111111"/>`;
                outstr += `<rect x="${0.38*width}" y="0" width="${0.24*width}" height="${0.3*height}" style="stroke-width:0.05;stroke:#000000;fill:#bbbbbb"/>`;
                if(built){color = '#FFE56D'}
                else {color = '#555555'}
                outstr += `<rect x="${0.2*width}" rx="${0.1*width}" y="${0.3*height}" ry="${0.1*width}" width="${0.6*width}" height="${0.4*height}" style="fill:${color}"/>`;
                break;
            case STRUCTURE_LAB:
                outstr += `<rect x="${0.1*width}" y="${0.85*height}" width="${0.8*width}" height="${0.15*height}" style="stroke:#88B18A;fill:#000000"/>`;
                outstr += `<circle cx="${width/2.0}" cy="${height/2.0}" r="${width*0.45}" style="stroke:#88B18A;fill:#000000"/>`;
                outstr += `<circle cx="${width/2.0}" cy="${height/2.0}" r="${width*0.4}" style="stroke:#000000;fill:#555555"/>`;
                if(built){color = '#FFE56D'}
                else {color = '#000000'}
                outstr += `<rect x="${0.175*width}" y="${0.825*width}" width="${0.65*width}" height="${0.15*height}" style="stroke:#000000;fill:${color}"/>`;
                break;
            case STRUCTURE_WALL:
                if(built){color = '#111111'}
                else {color = '#FF1931'}
                outstr += `<rect x="0" y="0" width="${width}" height="${height}" style="stroke:${color};fill:${color}"/>`;
                outstr += `<line x1="${0.3*width}" y1="${0.325*height}" x2="${0.575*width}" y2="${0.325*height}" style="stroke:#ffffff" />`;
                outstr += `<line x1="${0.7*width}" y1="${0.675*height}" x2="${0.425*width}" y2="${0.675*height}" style="stroke:#ffffff" />`;
                break;
            case STRUCTURE_SPAWN:
                if(built){color = '#FFE56D'}
                else {color = '#555555'}
                outstr += `<circle cx="${width/2.0}" cy="${height/2.0}" r="${width*0.49}" style="fill:#ffffff"/>`;
                outstr += `<circle cx="${width/2.0}" cy="${height/2.0}" r="${width*0.345}" style="stroke-width:4;stroke:#000000;fill:${color}"/>`;
                break;
            case STRUCTURE_CONTAINER:
                if(built){color = '#FFE56D'}
                else {color = '#555555'}
                outstr += `<rect x="${0.25*width}" y="${0.17*height}" width="${0.5*width}" height="${0.66*height}" style="stroke:#000000;fill:${color}"/>`;
                break;
            case STRUCTURE_LINK:
                if(built){color = '#FFE56D'}
                else {color = '#555555'}
                outstr += `<polygon points="${0.5*width},${0.1*height} ${0.15*width},${0.5*height} ${0.5*width},${0.9*height} ${0.85*width},${0.5*height}" style="stroke-width:1.2;stroke:#88B18A;fill:#000000" />`;
                outstr += `<polygon points="${0.5*width},${0.2*height} ${0.25*width},${0.5*height} ${0.5*width},${0.8*height} ${0.75*width},${0.5*height}" style="fill:${color}" />`;
                break;
            case STRUCTURE_STORAGE:
                if(built){color = '#FFE56D'}
                else {color = '#555555'}
                outstr += `<path style="stroke-width: 1;stroke:#90BA94" d='M${16/orWd*width} ${48/orHt*height} C${18/orWd*width} ${52/orHt*height} ${38/orWd*width} ${52/orHt*height} ${40/orWd*width} ${48/orHt*height} C${42/orWd*width} ${46/orHt*height} ${42/orWd*width} ${18/orHt*height} ${40/orWd*width} ${16/orHt*height} C${38/orWd*width} ${12/orHt*height} ${18/orWd*width} ${12/orHt*height} ${16/orWd*width} ${16/orHt*height} C${14/orWd*width} ${18/orHt*height} ${14/orWd*width} ${46/orHt*height} ${16/orWd*width} ${48/orHt*height}' />`;
                outstr += `<path style="fill:${color}" d='M${18/orWd*width} ${46/orHt*height} L${38/orWd*width} ${46/orHt*height} L${38/orWd*width} ${18/orHt*height} L${18/orWd*width} ${18/orHt*height}' />`;
                break;
            case STRUCTURE_TERMINAL:
                if(built){color = '#FFE56D'}
                else {color = '#555555'}
                outstr += `<path vector-effect="non-scaling-stroke" style="stroke:#90BA94" d='M${36/orWd*width} ${40/orHt*height} L${42/orWd*width} ${32/orHt*height} L${36/orWd*width} ${24/orHt*height} L${28/orWd*width} ${18/orHt*height} L${20/orWd*width} ${24/orHt*height} L${14/orWd*width} ${32/orHt*height} L${20/orWd*width} ${40/orHt*height} L${28/orWd*width} ${46/orHt*height} Z' />`;
                outstr += `<path vector-effect="non-scaling-stroke" style="fill:#AAAAAA" d='M${34/orWd*width} ${38/orHt*height} L${38/orWd*width} ${32/orHt*height} L${34/orWd*width} ${26/orHt*height} L${28/orWd*width} ${22/orHt*height} L${22/orWd*width} ${26/orHt*height} L${18/orWd*width} ${32/orHt*height} L${22/orWd*width} ${38/orHt*height} L${28/orWd*width} ${42/orHt*height} Z' />`;
                outstr += `<path vector-effect="non-scaling-stroke" style="stroke-width:2;stroke:black;fill:${color}" d='M${34/orWd*width} ${38/orHt*height} L${34/orWd*width} ${32/orHt*height} L${34/orWd*width} ${26/orHt*height} L${28/orWd*width} ${26/orHt*height} L${22/orWd*width} ${26/orHt*height} L${22/orWd*width} ${32/orHt*height} L${22/orWd*width} ${38/orHt*height} L${28/orWd*width} ${38/orHt*height} Z' />`;
                break;
            case STRUCTURE_NUKER:
                if(built){color = '#FFE56D'}
                else {color = '#555555'}
                outstr += `<rect x="${0.2*width}" y="${0.85*height}" width="${0.6*width}" height="${0.15*height}" style="stroke:#88B18A;fill:#000000"/>`;
                outstr += `<polygon points="${0.2*width},${0.85*height} ${0.5*width},${0.05*height} ${0.8*width},${0.85*height}" style="stroke:#88B18A;fill:#000000" />`;
                outstr += `<polygon points="${0.3*width},${0.75*height} ${0.5*width},${0.25*height} ${0.7*width},${0.75*height}" style="fill:${color}" />`;
                break;
            case STRUCTURE_OBSERVER:
                if(built){color = '#88B18A'}
                else {color = '#FF1931'}
                outstr +=`<circle cx="${0.5*width}" cy="${0.5*height}" r="${width*0.4}" style="stroke-width:1.2;stroke:${color};fill:#000000"/>`;
                outstr +=`<circle cx="${0.5*width}" cy="${0.32*height}" r="${width*0.17}" style="stroke:${color};fill:${color}"/>`;
                break;
            case STRUCTURE_POWER_SPAWN:
                if(built){color = '#FFE56D'}
                else {color = '#555555'}
                outstr += `<circle cx="${width/2.0}" cy="${height/2.0}" r="${width*0.49}" style="stroke:#ffffff;fill:#FF1931"/>`;
                outstr += `<circle cx="${width/2.0}" cy="${height/2.0}" r="${width*0.32}" style="stroke-width:4;stroke:#000000;fill:${color}"/>`;
                break;
            case STRUCTURE_ROAD:
                if(built){color = '#757575'}
                else {color = '#FF1931'}
                outstr += `<circle cx="${width/2.0}" cy="${height/2.0}" r="${width*0.25}" style="fill:${color}"/>`;
                break;
            default:
                console.log('No image for structure ' + structures[i].structureType);
        }
    }
    
    return outstr;
};

global.planOrRemove = function(pos){
    let roomName = pos.roomName;
    //Get planning
    let planning;
    if(Memory.rooms[roomName] && Memory.rooms[roomName].plan && Memory.rooms[roomName].plan.planning){
        planning = Memory.rooms[roomName].plan.planning;
    }
    else {
        console.log('Plan or remove not defined');
        return;
    }
    
    //Get structureType
    let structureType;
    if(Memory.rooms[roomName] && Memory.rooms[roomName].plan && Memory.rooms[roomName].plan.planningStructure){
        structureType = Memory.rooms[roomName].plan.planningStructure;
    }
    else {
        console.log('Structure not defined');
    }
    
    if(planning === 'plan'){
        planStructure(roomName,structureType,pos.x,pos.y);
    }
    else {
        deletePlannedStructures(roomName,structureType,pos.x,pos.y);
    }
};

global.setPlanningStructure = function(roomName, structureType){
    if(!Memory.rooms[roomName]){
        Memory.rooms[roomName] = {};
    }
    if(!Memory.rooms[roomName].plan){
        Memory.rooms[roomName].plan = {};
    }
    Memory.rooms[roomName].plan.planningStructure = structureType;
    return 'Planning structure ' + structureType;
};

global.setPlanOrRemove = function(roomName,planOrRemove){
    if(!Memory.rooms[roomName]){
        Memory.rooms[roomName] = {};
    }
    if(!Memory.rooms[roomName].plan){
        Memory.rooms[roomName].plan = {};
    }
    Memory.rooms[roomName].plan.planning = planOrRemove;
    
    return 'Set planning to ' + planOrRemove;
};

global.planStructure = function(roomName,structureType,x,y){
    if(!Memory.rooms[roomName]){
        Memory.rooms[roomName] = {};
    }
    if(!Memory.rooms[roomName].plan){
        Memory.rooms[roomName].plan = {};
    }
    if(!Memory.rooms[roomName].plan[x]){
        Memory.rooms[roomName].plan[x] = {};
    }
    if(!Memory.rooms[roomName].plan[x][y]){
        Memory.rooms[roomName].plan[x][y] = [{structureType: structureType}];
    }
    else {
        Memory.rooms[roomName].plan[x][y].push({structureType: structureType});
    }
    return 'Planned ' + structureType;
};

global.deletePlannedStructures = function(roomName,structureType,x,y){
    if(Memory.rooms[roomName] && Memory.rooms[roomName].plan && Memory.rooms[roomName].plan[x] && Memory.rooms[roomName].plan[x][y]){
        let planned = Memory.rooms[roomName].plan[x][y];
        for(let i=0; i<planned.length; i++){
            if(planned[i].structureType === structureType){
                planned.splice(i,1);
                i--;
            }
        }
        if(!planned.length){
            delete Memory.rooms[roomName].plan[x][y];
        }
        let nX=0;
        for(let y in Memory.rooms[roomName].plan[x]){
            nX++;
        }
        if(nX === 0){
            delete Memory.rooms[roomName].plan[x];
        }
    }
    return 'Removed structure ' + structureType;
};

global.toggleRoomVisual = function(roomName){
    if(!Memory.rooms[roomName]){
        Memory.rooms[roomName] = {};
    }
    if(!Memory.rooms[roomName].plan){
        Memory.rooms[roomName].plan = {};
    }
    if(Memory.rooms[roomName].plan.drawing){
        Memory.rooms[roomName].plan.drawing = false;
    }
    else {
        Memory.rooms[roomName].plan.drawing = true;
    }
};

global.writeRoomPlan = function(roomName){
    let plan;
    if(Memory.rooms[roomName] && Memory.rooms[roomName].plan){
        plan = gatherPlan(Memory.rooms[roomName].plan);
    }
    else {return 'Room ' + roomName + ' has no plan'}
    

    var outstr = `{\n\troom: '${roomName}',\n\tbuildings: [`;
    for(let structureType in plan){
        let locations = plan[structureType];
        let xLoc=``;
        let yLoc=``;
        for(let i=0; i<locations.length-1; i++){
            xLoc+=`${locations[i].x},`;
            yLoc+=`${locations[i].y},`;
        }
        xLoc+=`${locations[locations.length-1].x}`;
        yLoc+=`${locations[locations.length-1].y}`;
        outstr += `\n\t\t{structureType: '${structureType}', pos: {x: [${xLoc}], y: [${yLoc}]}, RCL: 1},`;
    }
    outstr = outstr.slice(0,outstr.length-1);
    outstr += `\n\t]\n},`;
    return outstr;
};