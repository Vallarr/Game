global.defStructHits = {'W15N8': {walls: 1000000, ramparts: 1000000}
                    };
                    
global.remoteRooms = {'explorer': {'W15N8': ['W16N8','W15N9','W16N9']},
                   'adventurer': {'W15N8': undefined}};
global.claimRooms = {'W15N8': {'W12N9': false, 'W18N7': false}};

global.creepsToSpawn = {'W15N8':   {settler: {harvester: 2, transporter: 1, filler: 2, repairer: 1, builder: 0, upgrader: 1, melee: 0, miner: 1},
                                    explorer: {harvester: 5, transporter: 4, repairer: 1, builder: 0, reserver: 3, upgrader: 0, melee: 0},
                                    adventurer: {harvester: 0, transporter: 0, repairer: 0, builder: 0, melee: 0, ranged: 0, hybrid: 0, patroller: 0, patrollerRanged: 0}}
                        };
global.defaultCreepBodies ={settler:   {harvester: [WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE],
                                        transporter: [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
                                        filler: [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
                                        repairer: [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                        builder: [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                        upgrader: [WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE],
                                        miner: [WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE]},
                            explorer:  {harvester: [WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE],
                                        transporter: [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
                                        repairer: [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                        builder: [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                        reserver: [CLAIM,MOVE,CLAIM,MOVE],
                                        upgrader: [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                        melee: [TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE]},
                            adventurer:{harvester: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE],
                                        transporter: [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
                                        repairer: [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
                                        builder: [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE], 
                                        melee: [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        ranged: [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
                                        hybrid: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL],
                                        patroller: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL],
                                        patrollerRanged: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL]}
                            };
                            
global.creepBodies =   {'W15N8': {settler:   {},
                                  explorer:  {}}
                       };

global.plannedStructures = [{room: 'W15N8', buildings: 
                            [{structureType: STRUCTURE_EXTENSION, pos: {x: [13,14,14,15,16], 
                                                                        y: [31,30,32,31,30]},
                                                                        RCL: 2},
                            {structureType: STRUCTURE_EXTENSION, pos: {x: [12,12,12,13,15], 
                                                                        y: [30,32,33,33,33]},
                                                                        RCL: 3},     
                            {structureType: STRUCTURE_EXTENSION, pos: {x: [16,16,17,17,18,18,18,18,19,19], 
                                                                        y: [32,33,31,33,30,31,32,34,31,33]},
                                                                        RCL: 4},  
                            {structureType: STRUCTURE_EXTENSION, pos: {x: [16,17,18,19,19,20,20,20,20,20], 
                                                                        y: [34,35,35,35,29,29,30,32,33,34]},
                                                                        RCL: 5},
                            {structureType: STRUCTURE_EXTENSION, pos: {x: [21,21,21,22,22,22,22,22,11,11], 
                                                                        y: [29,31,33,28,30,31,32,34,31,33]},
                                                                        RCL: 6}, 
                            {structureType: STRUCTURE_EXTENSION, pos: {x: [12,12,12,11,11,10,10,10,10,10], 
                                                                       y: [34,36,37,35,37,31,32,34,35,36]},
                                                                        RCL: 7},  
                            {structureType: STRUCTURE_EXTENSION, pos: {x: [23,23,23,23,24,24,24,24,24,14], 
                                                                       y: [29,31,33,35,29,30,32,33,34,31]},
                                                                        RCL: 8},    
                            {structureType: STRUCTURE_STORAGE, pos: {x: [17], y: [27]}, RCL: 4},                                                                    
                            {structureType: STRUCTURE_CONTAINER, pos: {x: [7,17,29,21], y: [22,24,43,21]}, RCL: 1},
                            {structureType: STRUCTURE_CONTAINER, pos: {x: [15], y: [40]}, RCL: 6},
                            {structureType: STRUCTURE_EXTRACTOR, pos: {x: [15], y: [39]}, RCL: 6},                        
                            {structureType: STRUCTURE_LINK, pos: {x: [30,16,6], y: [43,28,22]}, RCL: 5},
                            {structureType: STRUCTURE_TOWER, pos: {x: [21,5,28,6,18,28], y: [20,27,31,21,20,30]}, RCL: 1},
                            {structureType: STRUCTURE_RAMPART, pos: {x: [2, 2, 2, 4, 7, 10,15,15,20,21,24,24,31,31], 
                                                                     y: [26,29,31,18,18,18,15,18,14,17,19,22,30,31]}, RCL: 3},
                            {structureType: STRUCTURE_SPAWN, pos: {x: [14,13,15], y: [28,29,29]}, RCL: 7},                        
                            {structureType: STRUCTURE_ROAD, pos: {  x: [11,12,13,14,14,15,16,17,17,18,17,10,9,8,7,7,6,7,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,31,30],
                                                                    y: [26,27,28,27,29,28,27,26,25,24,23,26,26,25,24,23,22,21,29,28,29,30,31,32,33,34,35,34,34,35,36,37,38,39,40,41,42]}, RCL: 1},
                            {structureType: STRUCTURE_ROAD, pos: {  x: [12,13,13,14,15,15,16,12],
                                                                    y: [31,30,32,33,30,32,31,29]}, RCL: 2},
                            {structureType: STRUCTURE_ROAD, pos: {  x: [17,17,17,18,18],
                                                                    y: [30,32,34,27,33]}, RCL: 3},
                            {structureType: STRUCTURE_ROAD, pos: {  x: [19,19,19,20,20],
                                                                    y: [28,32,34,28,35]}, RCL: 4},
                            {structureType: STRUCTURE_ROAD, pos: {  x: [],
                                                                    y: []}, RCL: 5},
                            {structureType: STRUCTURE_ROAD, pos: {  x: [21,21,21,21,22,22,11,11,12,13,12,11,10,23,23,24,25,26],
                                                                    y: [28,30,32,34,29,33,30,32,29,34,35,36,37,30,32,31,32,33]}, RCL: 6},
                            {structureType: STRUCTURE_ROAD, pos: {  x: [11,10,10, 9, 9, 9, 9, 8, 8],
                                                                    y: [34,29,33,30,32,34,36,31,35]}, RCL: 7}]},
                            {room: 'W16N8', buildings: 
                            [{structureType: STRUCTURE_CONTAINER, pos: {x: [23], y: [4]}, RCL: 0}]},
                            {room: 'W16N9', buildings: 
                            [{structureType: STRUCTURE_CONTAINER, pos: {x: [19,31], y: [39,14]}, RCL: 0}]},                        
                            {room: 'W15N9', buildings: 
                            [{structureType: STRUCTURE_CONTAINER, pos: {x: [30,9], y: [44,16]}, RCL: 0}]}                        
                            ];

global.roomObjects = {};
 