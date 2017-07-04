global.transitioned = {
    'W15N8': true,
    'W27N11': true,
    'W11N6': true,
    'W14N7': true,
    'W15N1': true,
    'W11N7': true,
    'W25N7': true,
    'W89N5': true,
    'W13N5': true,
    'W23N9': true
};

global.roomStorageTreshold = {
    /*'W11N7': {
        min: 600000,
        low: 800000,
        med: 850000,
        high:900000,
        max: 950000,
        critical: 975000
    },*/
};

global.dontBalance = {
    'W89N5': true,
    'W25N7': true
};

global.GCL_FARM = {
    'W11N7': true
}

global.roomBlackList = {
    //Sector W15N5
    'W18N2': true, 'W18N8': true, 'W13N4': true, 'W13N2': true, 'W13N1': true, 'W12N2': true, 'W11N1': true,
    //Sector W25N5
    'W21N6': true, 'W21N4': true, 'W23N1': true, 'W25N1': true, 'W27N1': true, 'W29N3': true, 'W27N4': true, 'W28N8': true,
    //Sector W25N15
    'W24N11':true, 'W23N12': true, 'W29N12': true, 'W22N14': true, 'W28N14': true, 'W29N15': true, 'W21N16': true, 'W26N18': true, 'W28N18': true
};

global.defStructHits = {
    'W15N8': {walls: 15000000, ramparts: 15000000},
    'W18N7': {walls: 13000000, ramparts: 13000000},
    'W13N9': {walls: 13000000, ramparts: 13000000},
    'W17N4': {walls: 13000000, ramparts: 13000000},
    'W13N5': {walls: 13000000, ramparts: 13000000},
    'W25N7': {walls: 17000000, ramparts: 17000000},
    'W23N9': {walls: 13000000, ramparts: 13000000},
    'W17N3': {walls: 13000000, ramparts: 13000000},
    'W11N6': {walls: 13000000, ramparts: 13000000},
    'W27N11':{walls: 4000000, ramparts: 4000000},
    'W14N7': {walls: 4000000, ramparts: 4000000},
    'W15N1': {walls: 1000000, ramparts: 1000000},
    'W11N7': {walls: 4000000, ramparts: 4000000},
    'W89N5': {walls: 500000, ramparts: 500000}
};

global.rampartHits = {
};
                    
global.remoteRooms = {
    'explorer': {
        'W15N8': ['W16N8','W15N9','W16N9','W17N8','W17N9','W16N7'],
        'W18N7': ['W17N7','W18N6','W17N6'],
        'W13N9': ['W12N9','W11N9','W14N9','W13N11','W14N11','W13N10','W14N10'],
        'W17N4': [],
        'W13N5': [],
        'W25N7': ['W24N7','W24N8'],
        'W23N9': ['W23N8','W22N9','W24N8','W21N9','W21N8','W22N8'],
        'W17N3': ['W16N3','W18N4','W18N3','W15N3'],
        'W11N6': ['W12N6','W12N7','W13N6'],
        'W27N11': ['W28N11','W26N11','W27N12','W26N12'],
        'W15N1': ['W14N1','W16N1','W14N2','W15N0','W16N0'],
        'W11N7': ['W11N8'],
        'W14N7': ['W13N7'],
        'W89N5': ['W88N6','W89N6']
    },
    'rescuer': {
        'W15N8': ['W18N2'],
        'W17N4': ['W18N4']
    },
    'adventurer': {
        'W15N8': ['W16N6'],
        'W18N7': ['W16N6'],
        'W17N4': ['W16N4','W15N4','W16N5'],
        'W17N3': ['W11N7'],
        'W13N5': ['W14N5','W14N4'],
        'W25N7': ['W25N6','W24N6','W25N5'],
        'W13N9': ['W11N7'],
        'W14N7': ['W14N6','W15N6']
    },
    'starter': {
        'W15N8': ['W15N1'],
        'W17N4': ['W17N3'],
        'W18N7': ['W25N7'],
        'W25N7': ['W23N9'],
        'W13N9': ['W11N7'],
        'W13N5': ['W89N5'],
        'W23N9': ['W27N11'],
        'W27N11': ['W28N11'],
        'W17N3': ['W15N1'],
        'W11N6': ['W11N7']
    },
    'attacker': {
        'W17N4': ['W14N7'],
        'W15N8': ['W19N6','W19N7'],
        'W13N5': ['W13N6']
    }
};

global.claimRooms = {
    'W15N8': {'W13N9': true, 'W18N7': true, 'W17N4': true, 'W13N5': true},
    'W17N4': {'W25N7': true}, 'W18N7': {'W25N7': true},'W25N7': {'W23N9': true},
    'W13N5': {'W17N3': true, 'W14N7': true, 'W89N5': true},
    'W13N9': {'W11N6': true},
    'W23N9': {'W27N11': true},
    'W17N3': {'W15N1': true},
    'W11N6': {'W11N7': true}
};

global.creepsToSpawn = {
    'W15N8':   {
        settler: {harvester: 1, transporter: 0, filler: 1, courier: 1, labWorker: 0, sender: 1, repairer: -1, builder: 1, upgrader: -1, melee: 0, miner: -1},
        defender: {combat: 0, repairer: 0},
        rescuer: {combat: 0},
        explorer: {harvester: 6, transporter: 10, repairer: -1, builder: 0, reserver: -1, upgrader: 0, melee: 0, dismantler: 0},
        adventurer: {harvester: 0, transporter: 2, repairer: -1, builder: 0, melee: 0, ranged: 0, hybrid: 0, patroller: 1, patrollerRanged: 1, miner: 0},
        starter: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, dismantler: 0, combat: 0, startUp: 0},
        attacker:{drainer: 0, dismantler: 0, healer: 0}
    },
    'W18N7':   {
        settler: {harvester: 1, transporter: 1, filler: 1, courier: 1, labWorker: 1, repairer: -1, builder: 0, upgrader: -1, melee: 0, miner: -1},
        defender: {combat: 0, repairer: 0},
        rescuer: {combat: 0},
        explorer: {harvester: 3, transporter: 3, repairer: -1, builder: 0, reserver: -1, upgrader: 0, melee: 0, dismantler: 0},
        adventurer: {harvester: 2, transporter: 8, repairer: -1, builder: 0, melee: 0, ranged: 0, hybrid: 0, patroller: 0, patrollerRanged: 0, miner: -1},
        starter: {harvester: 0, transporter: 0, repairer: 1, builder: 1, reserver: 0, upgrader: 0, dismantler: 0, combat: 0, startUp: 0},
        attacker:{drainer: 0, dismantler: 0, healer: 0} 
    },
    'W13N9':   {
        settler: {harvester: 1, transporter: 1, filler: 1, courier: 3, labWorker: 1, repairer: -1, builder: 1, upgrader: -1, melee: 0, miner: -1},
        defender: {combat: 0, repairer: 0},
        rescuer: {combat: 0},
        explorer: {harvester: 5, transporter: 10, repairer: -1, builder: 0, reserver: -1, upgrader: 0, melee: 0, dismantler: 0},
        adventurer: {harvester: 0, transporter: 0, repairer: 0, builder: 0, melee: 0, ranged: 0, hybrid: 0, patroller: 0, patrollerRanged: 0, miner: 0},
        starter: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, dismantler: 0, combat: 0, startUp: 0},
        attacker:{drainer: 0, dismantler: 0, healer: 0},
        powerHarvester: {attacker: -1, healer: -1, transporter: -1} 
    },
    'W17N4':   {
        settler: {harvester: 1, transporter: 1, filler: 1, courier: 1, labWorker: 1, repairer: -1, builder: 1, upgrader: -1, melee: 0, miner: -1},
        defender: {combat: 0, repairer: 0},
        rescuer: {combat: 0},
        explorer: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, melee: 0, dismantler: 0},
        adventurer: {harvester: 6, transporter: 12, repairer: -1, builder: 1, melee: 0, ranged: 0, hybrid: 0, patroller: 3, patrollerRanged: 3, miner: -1},
        starter: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, dismantler: 0, combat: 0, startUp: 0},
        attacker:{drainer: 0, dismantler: 0, healer: 0}
    },
    'W13N5':   {
        settler: {harvester: 1, transporter: 0, filler: 1, courier: 1, labWorker: 0, sender: 1, repairer: -1, builder: 2, upgrader: -1, melee: 0, miner: -1},
        defender: {combat: 0, repairer: 0},
        rescuer: {combat: 0},
        explorer: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, melee: 0, dismantler: 0},
        adventurer: {harvester: 4, transporter: 10, repairer: -1, builder: 0, melee: 0, ranged: 0, hybrid: 0, patroller: 2, patrollerRanged: 2, miner: -1},
        starter: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, dismantler: 0, combat: 0, startUp: 0},
        attacker:{drainer: 0, dismantler: 0, healer: 0, dismantler2: 0, healer2: 0, reserver: 0}
    },
    'W25N7':   {
        settler: {harvester: 1, transporter: 0, filler: 1, courier: 1, labWorker: 0, sender: 1, repairer: -1, builder: 2, upgrader: -1, melee: 0, miner: -1},
        defender: {combat: 0, repairer: 0},
        rescuer: {combat: 0},
        explorer: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, melee: 0, dismantler: 0},
        adventurer: {harvester: 6, transporter: 12, repairer: -1, builder: 0, melee: 0, ranged: 0, hybrid: 0, patroller: 3, patrollerRanged: 3, miner: -1},
        starter: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, dismantler: 0, combat: 0, startUp: 0},
        attacker:{drainer: 0, dismantler: 0, healer: 0}
    },
    'W23N9':   {
        settler: {harvester: 1, transporter: 0, filler: 1, courier: 2, labWorker: 0, sender: 1, repairer: -1, builder: 2, upgrader: -1, melee: 0, miner: -1},
        defender: {combat: 0, repairer: 0},
        rescuer: {combat: 0},
        explorer: {harvester: 6, transporter: 12, repairer: -1, builder: 1, reserver: -1, upgrader: 0, melee: 0, dismantler: 1},
        adventurer: {harvester: 0, transporter: 0, repairer: 0, builder: 0, melee: 0, ranged: 0, hybrid: 0, patroller: 0, patrollerRanged: 0, miner: 0},
        starter: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, dismantler: 0, combat: 0, startUp: 1},
        attacker:{drainer: 0, dismantler: 0, healer: 0},
        powerHarvester: {attacker: -1, healer: -1, transporter: -1} 
    },
    'W17N3':   {
        settler: {harvester: 1, transporter: 1, filler: 1, courier: 1, labWorker: 1, repairer: -1, builder: 0, upgrader: -1, melee: 0, miner: -1},
        defender: {combat: 0, repairer: 0},
        rescuer: {combat: 0},
        explorer: {harvester: 4, transporter: 8, repairer: -1, builder: 1, reserver: -1, upgrader: 0, melee: 0, dismantler: 0},
        adventurer: {harvester: 0, transporter: 0, repairer: 0, builder: 0, melee: 0, ranged: 0, hybrid: 0, patroller: 0, patrollerRanged: 0, miner: 0},
        starter: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, dismantler: 0, combat: 0, startUp: 0},
        attacker:{drainer: 0, dismantler: 0, healer: 0}
    },
    'W11N6':   {
        settler: {harvester: 1, transporter: 0, filler: 1, courier: 1, labWorker: 0, sender: 1, repairer: -1, builder: 0, upgrader: -1, melee: 0, miner: -1},
        defender: {combat: 0, repairer: 0},
        rescuer: {combat: 0},
        explorer: {harvester: 3, transporter: 5, repairer: -1, builder: 1, reserver: -1, upgrader: 0, melee: 0, dismantler: 0},
        adventurer: {harvester: 0, transporter: 0, repairer: 0, builder: 0, melee: 0, ranged: 0, hybrid: 0, patroller: 0, patrollerRanged: 0, miner: 0},
        starter: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, dismantler: 0, combat: 0, startUp: 0},
        attacker:{drainer: 0, dismantler: 0, healer: 0},
        powerHarvester: {attacker: -1, healer: -1, transporter: -1}
    },
    'W27N11':   {
        settler: {harvester: 1, transporter: 0, filler: 1, courier: 1, labWorker: 0, sender: 1, repairer: -1, builder: 1, upgrader: -1, melee: 0, miner: -1},
        defender: {combat: 0, repairer: 0},
        rescuer: {combat: 0},
        explorer: {harvester: 4, transporter: 7, repairer: -1, builder: 0, reserver: -1, upgrader: 0, melee: 0, dismantler: 0},
        adventurer: {harvester: 0, transporter: 0, repairer: 0, builder: 0, melee: 0, ranged: 0, hybrid: 0, patroller: 0, patrollerRanged: 0, miner: 0},
        starter: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, dismantler: 0, combat: 0, startUp: 0},
        attacker:{drainer: 0, dismantler: 0, healer: 0},
        powerHarvester: {attacker: -1, healer: -1, transporter: -1} 
    },
    'W14N7':   {
        settler: {harvester: 1, transporter: 0, filler: 1, courier: 2, labWorker: 0, sender: 1, repairer: -1, builder: 1, upgrader: -1, melee: 0, miner: -1},
        defender: {combat: 0, repairer: 0},
        rescuer: {combat: 0},
        explorer: {harvester: 1, transporter: 2, repairer: -1, builder: 0, reserver: -1, upgrader: 0, melee: 0, dismantler: 2},
        adventurer: {harvester: 4, transporter: 10, repairer: -1, builder: 0, melee: 0, ranged: 0, hybrid: 0, patroller: 2, patrollerRanged: 2, miner: -1},
        starter: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, dismantler: 0, combat: 0, startUp: 0},
        attacker:{drainer: 0, dismantler: 0, healer: 0}
    },
    'W15N1':   {
        settler: {harvester: 1, transporter: 0, filler: 1, courier: 1, labWorker: 0, sender: 1, repairer: -1, builder: 1, upgrader: -1, melee: 0, miner: -1},
        defender: {combat: 0, repairer: 0},
        rescuer: {combat: 0},
        explorer: {harvester: 3, transporter: 8, repairer: -1, builder: 0, reserver: -1, upgrader: 0, melee: 0, dismantler: 2},
        adventurer: {harvester: 0, transporter: 0, repairer: 0, builder: 0, melee: 0, ranged: 0, hybrid: 0, patroller: 0, patrollerRanged: 0, miner: 0},
        starter: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, dismantler: 0, combat: 0, startUp: 0},
        attacker:{drainer: 0, dismantler: 0, healer: 0},
        powerHarvester: {attacker: -1, healer: -1, transporter: -1}        
    },
    'W11N7':   {
        settler: {harvester: 1, transporter: 0, filler: 1, courier: 2, labWorker: 0, sender: 1, repairer: -1, builder: 0, upgrader: -1, melee: 0, miner: -1},
        defender: {combat: 0, repairer: 0},
        rescuer: {combat: 0},
        explorer: {harvester: 1, transporter: 2, repairer: -1, builder: 0, reserver: -1, upgrader: 0, melee: 0, dismantler: 0},
        adventurer: {harvester: 0, transporter: 0, repairer: 0, builder: 0, melee: 0, ranged: 0, hybrid: 0, patroller: 0, patrollerRanged: 0, miner: 0},
        starter: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, dismantler: 0, combat: 0, startUp: 0},
        attacker:{drainer: 0, dismantler: 0, healer: 0}
    },
    'W89N5':   {
        settler: {harvester: 1, transporter: 0, filler: 1, courier: 1, labWorker: 0, sender: 1, repairer: -1, builder: 2, upgrader: -1, melee: 0, miner: 0},
        defender: {combat: 0, repairer: 0},
        rescuer: {combat: 0},
        explorer: {harvester: 2, transporter: 4, repairer: -1, builder: 0, reserver: -1, upgrader: 0, melee: 0, dismantler: 0},
        adventurer: {harvester: 0, transporter: 0, repairer: 0, builder: 0, melee: 0, ranged: 0, hybrid: 0, patroller: 0, patrollerRanged: 0, miner: 0},
        starter: {harvester: 0, transporter: 0, repairer: 0, builder: 0, reserver: 0, upgrader: 0, dismantler: 0, combat: 0, startUp: 0},
        attacker:{drainer: 0, dismantler: 0, healer: 0},
        powerHarvester: {attacker: -1, healer: -1, transporter: -1} 
    }
};

global.defaultCreepBodies ={
    settler:   {
        harvester:      [WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE],
        transporter:    [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
        filler:         [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
        courier:        [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
        labWorker:      [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
        sender:         [CARRY,CARRY,CARRY,CARRY,MOVE,CARRY,CARRY,CARRY,CARRY,MOVE,CARRY,CARRY,CARRY,CARRY,MOVE,CARRY,CARRY,CARRY,CARRY,MOVE],
        repairer:       [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
        builder:        [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
        upgrader:       [WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE],
        miner:          [WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE]
    },
    defender:  {
        combat:         [TOUGH,TOUGH,MOVE,MOVE,ATTACK,ATTACK],
        repairer:       [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE]
    },
    rescuer:   {
        combat:         [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK]
    },
    explorer:  {
        harvester:      [WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE],
        transporter:    [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
        repairer:       [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
        builder:        [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
        dismantler:     [WORK,MOVE,WORK,CARRY,MOVE,WORK,WORK,CARRY,MOVE,WORK,MOVE,WORK,CARRY,MOVE,WORK,WORK,CARRY,MOVE,WORK,MOVE,WORK,CARRY,MOVE,WORK,WORK,CARRY,MOVE,WORK,MOVE,WORK,CARRY,MOVE,WORK,WORK,CARRY,MOVE,WORK,MOVE,WORK,CARRY,MOVE,WORK,WORK,CARRY,MOVE],
        reserver:       [CLAIM,MOVE,CLAIM,MOVE],
        upgrader:       [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
        melee:          [TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE,ATTACK,MOVE]
    },
    adventurer:{
        harvester:      [CARRY,CARRY,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
        transporter:    [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
        repairer:       [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
        builder:        [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE], 
        melee:          [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
        ranged:         [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
        hybrid:         [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,RANGED_ATTACK,ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL],
        patroller:      [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL],
        patrollerRanged:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL],
        miner:          [CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
    },
    starter:   {
        harvester:      [WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE],
        transporter:    [CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE],
        repairer:       [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
        builder:        [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE],
        dismantler:     [WORK,MOVE,WORK,CARRY,MOVE,WORK,MOVE,WORK,CARRY,MOVE,WORK,MOVE,WORK,CARRY,MOVE,WORK,MOVE,WORK,CARRY,MOVE,WORK,MOVE,WORK,CARRY,MOVE,WORK,MOVE,WORK,CARRY,MOVE,WORK,MOVE,WORK,CARRY,MOVE,WORK,MOVE,WORK,CARRY,MOVE,WORK,MOVE,WORK,CARRY,MOVE,WORK,MOVE,WORK,CARRY,MOVE],
        reserver:       [MOVE,MOVE,MOVE,MOVE,MOVE,CLAIM],
        upgrader:       [WORK,MOVE,WORK,MOVE,WORK,MOVE,WORK,MOVE,CARRY,WORK,MOVE,WORK,MOVE,WORK,MOVE,WORK,MOVE,CARRY,WORK,MOVE,WORK,MOVE,WORK,MOVE,WORK,MOVE,CARRY,WORK,MOVE,WORK,MOVE,WORK,MOVE,WORK,MOVE,CARRY,WORK,MOVE,WORK,MOVE,WORK,MOVE,WORK,MOVE,CARRY],
        combat:         [],
        startUp:        [WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE,WORK,CARRY,MOVE]
    },
    attacker:  {
        drainer:        [TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,MOVE,MOVE,WORK],
        dismantler:     [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK],
        healer:         [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
        reserver:       [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM,CLAIM]
    },
    powerHarvester:{
        attacker:       [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK],
        healer:         [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL],
        transporter:    [CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE,CARRY,MOVE]
    }
};

global.creepBodies =   {
    'W15N8': {
        settler: {
            upgrader:   [CARRY,MOVE,MOVE,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE],
            harvester:  [WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE],
            filler:     [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE]
        },
        explorer:{
            harvester:  [WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,MOVE,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE]
        },
        attacker:{
            drainer:    [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL],
            dismantler: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK]
        }
    },
    'W17N4': {
        settler: {
            upgrader:   [CARRY,MOVE,MOVE,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE]
        },
        attacker: {
            drainer:    [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,MOVE,MOVE,MOVE,HEAL,HEAL,HEAL,HEAL],
            dismantler: [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK]
        },
        defender: {
            combat:     [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK]
        },
        rescuer:  {
            combat:     [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK]
        }
    },
    'W18N7': {
        settler: {
            upgrader:   [CARRY,MOVE,MOVE,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE]
        }
    },
    'W13N9': {
        settler: {
            upgrader:   [CARRY,MOVE,MOVE,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE]
        }
    },
    'W13N5': {
        settler: {
            upgrader:   [CARRY,MOVE,MOVE,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE],
            filler:     [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
            courier:    [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE]
        },
        explorer:{
            transporter:[CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
        },
        attacker:{
            dismantler: [WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            healer:     [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            dismantler2:[TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE],
            healer2:    [TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,HEAL,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE]
        }
    },
    'W25N7': {
        settler: {
            upgrader:   [CARRY,MOVE,MOVE,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE],
            filler:     [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
            courier:    [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE]
        }
    },
    'W23N9': {
        settler: {
            upgrader:   [CARRY,MOVE,MOVE,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE],
            filler:     [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
            courier:    [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE]
        }
    },
    'W17N3': {
        settler: {
            upgrader:   [CARRY,MOVE,MOVE,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE]
        }
    },
    'W11N6': {
        settler: {
            upgrader:   [CARRY,MOVE,MOVE,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE],
            filler:     [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
            courier:    [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE]
        },
        starter: {
            upgrader:   [MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CARRY,CARRY,CARRY,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK],
            transporter:[CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE]
        }
    },
    'W14N7': {
        settler: {
            upgrader:   [CARRY,MOVE,MOVE,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE],
            filler:     [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
            courier:    [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE]
        }
    },
    'W27N11': {
        settler:{
            upgrader:   [CARRY,MOVE,MOVE,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,WORK,WORK,WORK,MOVE,WORK,WORK,CARRY,MOVE],
            courier:    [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
            filler:     [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE]
        }
    },
    'W15N1': {
        settler:{
            courier:    [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
            filler:     [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE]
        }
    },
    'W89N5': {
        settler: {
            filler:     [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE],
            courier:    [CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE,CARRY,CARRY,MOVE]
        }
    },
};

global.addCreepMemory = {
    'W13N5':{
        attacker: {
            dismantler: {nHealers: 0, color: COLOR_WHITE, boost: {[WORK]: RESOURCE_CATALYZED_ZYNTHIUM_ACID, [MOVE]: RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE}},
            healer:     {color: COLOR_WHITE, boost: {[TOUGH]: RESOURCE_CATALYZED_GHODIUM_ALKALIDE, [RANGED_ATTACK]: RESOURCE_CATALYZED_KEANIUM_ALKALIDE, [HEAL]: RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, [MOVE]: RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE}},
            dismantler2:{nHealers: 1, color: COLOR_ORANGE, boost: {[TOUGH]: RESOURCE_CATALYZED_GHODIUM_ALKALIDE, [WORK]: RESOURCE_CATALYZED_ZYNTHIUM_ACID, [MOVE]: RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE}},
            healer2:    {color: COLOR_ORANGE, boost: {[TOUGH]: RESOURCE_CATALYZED_GHODIUM_ALKALIDE, [RANGED_ATTACK]: RESOURCE_CATALYZED_KEANIUM_ALKALIDE, [HEAL]: RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE, [MOVE]: RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE}}
        },
        starter: {
            reserver: {portal: 'W15N5'},
            startUp: {portal: 'W15N5'}
        }
    },
    'W17N3':{
        powerHarvester: {
            attacker:   {nHealers: 2, color: COLOR_RED},
            healer:     {color: COLOR_RED}
        }
    },
    'W11N6':{
        powerHarvester: {
            attacker:   {nHealers: 2, color: COLOR_YELLOW},
            healer:     {color: COLOR_YELLOW}
        }
    },
    'W23N9':{
        powerHarvester: {
            attacker:   {nHealers: 2, color: COLOR_BLUE},
            healer:     {color: COLOR_BLUE}
        }
    },
    'W13N9':{
        powerHarvester: {
            attacker:   {nHealers: 2, color: COLOR_BROWN},
            healer:     {color: COLOR_BROWN}
        }
    },
    'W15N1':{
        powerHarvester: {
            attacker:   {nHealers: 2, color: COLOR_GREEN},
            healer:     {color: COLOR_GREEN}
        }
    },
    'W27N11':{
        powerHarvester: {
            attacker:   {nHealers: 2, color: COLOR_PURPLE},
            healer:     {color: COLOR_PURPLE}
        }
    },
    'W89N5':{
        powerHarvester: {
            attacker:   {nHealers: 2, color: COLOR_GREY},
            healer:     {color: COLOR_GREY}
        }
    }
};

global.plannedStructures = [
{
	room: 'W15N8',
	buildings: [
		{structureType: 'constructedWall', pos: {x: [1,2,2,2,2,2,2,2,3,5,6,8,9,15,15,15,20,20,20,24,24,24,24,31,31], y: [32,18,24,25,27,28,30,32,18,18,18,18,18,16,17,19,15,16,17,20,21,23,24,32,33]}, RCL: 1},
		{structureType: 'rampart', pos: {x: [2,2,2,4,5,6,7,7,9,10,11,15,15,16,18,20,21,21,21,24,24,28,28,31,31], y: [26,29,31,18,27,21,18,27,27,18,29,15,18,29,20,14,17,20,29,19,22,30,31,30,31]}, RCL: 1},
		{structureType: 'tower', pos: {x: [5,6,18,21,28,28], y: [27,21,20,20,30,31]}, RCL: 1},
		{structureType: 'container', pos: {x: [7,13,15,17,19], y: [22,29,40,24,28]}, RCL: 1},
		{structureType: 'link', pos: {x: [7,7,12,16,20,30], y: [26,28,33,32,33,43]}, RCL: 1},
		{structureType: 'storage', pos: {x: [7], y: [27]}, RCL: 1},
		{structureType: 'terminal', pos: {x: [], y: []}, RCL: 1},
		{structureType: 'extension', pos: {x: [9,9,9,9,10,10,10,10,10,11,11,11,11,12,12,12,12,12,13,13,13,13,14,14,14,15,15,15,16,16,17,17,17,17,17,17,18,18,18,18,18,18,19,19,19,19,20,20,20,20,20,21,21,22,22,22,22,23,23,23], y: [32,33,34,35,30,31,32,35,36,30,33,34,36,29,31,32,34,36,30,31,32,33,30,31,32,29,31,32,30,34,28,29,31,32,34,35,28,30,31,32,33,35,30,31,33,35,28,29,31,32,34,30,33,30,31,32,34,32,33,34]}, RCL: 1},
		{structureType: 'road', pos: {x: [10,10,11,11,11,12,12,13,13,14,14,15,15,16,16,17,17,18,18,19,19,20,20,21,21,21], y: [33,34,31,32,35,30,35,29,34,29,33,30,33,31,33,30,33,29,34,29,34,30,35,31,32,34]}, RCL: 1},
		{structureType: 'spawn', pos: {x: [11,16,21], y: [29,29,29]}, RCL: 1}
	]
},
{
	room: 'W18N7',
	buildings: [
		{structureType: 'constructedWall', pos: {x: [], y: []}, RCL: 1},
		{structureType: 'rampart', pos: {x: [2,2,2,2,2,3,5,5,6,9,9,11,14,17,19,19,20,22,22,23,25,25,25,28,28,28,28,28,28,28,28,28,28], y: [19,22,25,28,31,33,22,27,33,20,33,33,19,34,20,31,34,12,14,34,10,13,24,6,9,12,15,17,20,23,25,27,30]}, RCL: 1},
		{structureType: 'container', pos: {x: [4,11,17,25,36], y: [15,19,19,20,45]}, RCL: 1},
		{structureType: 'tower', pos: {x: [5,5,19,25,25,25], y: [22,27,31,10,13,24]}, RCL: 1},
		{structureType: 'extension', pos: {x: [7,7,7,8,8,8,8,9,9,9,9,10,10,10,10,10,11,11,11,11,11,12,12,12,12,13,13,13,13,14,14,15,15,15,15,16,16,16,16,17,17,17,17,17,18,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21], y: [22,23,24,21,22,24,25,21,23,25,26,19,20,22,24,26,21,22,23,25,26,21,22,24,25,19,21,22,24,20,24,19,21,22,24,21,22,24,25,21,22,23,25,26,19,20,22,24,26,21,23,25,26,21,22,24,25,22,23,24]}, RCL: 1},
		{structureType: 'road', pos: {x: [8,9,9,9,10,10,10,11,11,11,11,12,12,12,12,13,13,13,14,14,14,15,15,15,16,16,16,16,17,17,17,17,18,18,18,19,19,19,20], y: [23,19,22,24,18,21,25,18,19,20,24,18,19,20,23,18,20,23,18,21,23,18,20,23,18,19,20,23,18,19,20,24,18,21,25,19,22,24,23]}, RCL: 1},
		{structureType: 'spawn', pos: {x: [9,14,19], y: [20,19,20]}, RCL: 1},
		{structureType: 'link', pos: {x: [10,14,18,21,21,23], y: [23,22,23,14,31,14]}, RCL: 1},
		{structureType: 'terminal', pos: {x: [22], y: [12]}, RCL: 1},
		{structureType: 'storage', pos: {x: [22], y: [14]}, RCL: 1}
	]
},
{
	room: 'W13N9',
	buildings: [
		{structureType: 'tower', pos: {x: [5,5,20,30,44,44], y: [44,46,6,6,13,28]}, RCL: 1},
		{structureType: 'rampart', pos: {x: [5,5,20,23,23,28,28,28,30,30,30,32,35,36,36,38,38,38,40,41,43,44,44,45,45,45], y: [44,46,6,45,46,25,27,29,6,25,41,25,40,25,35,25,27,35,41,30,30,13,28,30,32,34]}, RCL: 1},
		{structureType: 'link', pos: {x: [6,31,35,36,36,39], y: [15,44,43,34,36,44]}, RCL: 1},
		{structureType: 'container', pos: {x: [19,32,38,42,43], y: [16,40,40,40,45]}, RCL: 1},
		{structureType: 'extractor', pos: {x: [20], y: [15]}, RCL: 1},
		{structureType: 'road', pos: {x: [26,27,28,29,29,30,30,30,31,31,31,32,32,32,32,33,33,33,33,34,34,34,35,35,35,35,35,35,36,36,36,36,36,37,37,37,37,37,37,37,38,38,38,38,38,38,39,39,39,39,40,40,40,41,41,42,43,43], y: [44,43,42,41,44,40,43,45,39,42,46,39,40,41,45,39,40,41,44,39,41,44,34,35,36,39,42,44,33,37,39,41,44,34,35,36,39,40,41,44,34,36,39,40,41,45,35,39,42,46,40,43,45,41,44,42,43,44]}, RCL: 1},
		{structureType: 'constructedWall', pos: {x: [], y: []}, RCL: 1},
		{structureType: 'extension', pos: {x: [28,28,28,29,29,29,29,30,30,30,30,31,31,31,31,31,32,32,32,32,32,33,33,33,33,34,34,34,34,35,35,36,36,36,36,37,37,37,37,37,38,38,38,38,38,39,39,39,39,39,40,40,40,40,41,41,41,41,42,42,42], y: [43,44,45,42,43,45,46,42,44,46,47,40,41,43,45,47,42,43,44,46,47,42,43,45,46,40,42,43,45,41,45,40,42,43,45,42,43,43,45,46,42,43,44,46,47,40,41,43,45,47,42,44,46,47,42,43,45,46,43,44,45]}, RCL: 1},
		{structureType: 'spawn', pos: {x: [30,35,40], y: [41,40,41]}, RCL: 1},
		{structureType: 'storage', pos: {x: [36], y: [35]}, RCL: 1}
	]
},
{
	room: 'W17N4',
	buildings: [
		{structureType: 'rampart', pos: {x: [5,5,5,5,5,7,9,11,11,12,13,14,16,17,18,19,19,19,23,24,25,25,27,28,28,29,29,31,31,32,34,34,35,36,36,38,38,41,43,44,45,47,47,47,47], y: [14,17,20,24,26,26,26,11,14,23,11,27,11,27,18,11,29,32,17,33,30,33,11,14,18,11,32,24,31,11,23,25,11,15,19,15,19,19,6,14,6,11,14,15,18]}, RCL: 1},
		{structureType: 'constructedWall', pos: {x: [5,5,5,5,5,6,8,10,12,14,15,15,16,17,18,18,19,19,19,19,26,26,27,28,29,30,30,31,33,34,34,35,36,37,39,40,42,44,46,47,47,47,47], y: [15,16,18,19,25,26,26,11,11,11,11,27,27,11,11,27,27,28,30,31,11,33,33,11,31,11,31,11,11,11,24,19,11,19,19,19,19,6,6,12,13,16,17]}, RCL: 1},
		{structureType: 'link', pos: {x: [8,19,23,27,38,38], y: [22,21,20,21,14,16]}, RCL: 1},
		{structureType: 'tower', pos: {x: [11,12,25,28,31,44], y: [14,23,30,14,24,14]}, RCL: 1},
		{structureType: 'extension', pos: {x: [16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,19,20,20,20,20,20,21,21,21,21,22,22,22,22,23,23,24,24,24,24,25,25,25,25,26,26,26,26,26,27,27,27,27,27,28,28,28,28,29,29,29,29,30,30,30], y: [20,21,22,19,20,22,23,19,21,23,24,17,18,20,22,24,19,20,21,23,24,19,20,22,23,17,19,20,22,18,22,17,19,20,22,19,20,22,23,19,20,21,23,24,17,18,20,22,24,19,21,23,24,19,20,22,23,20,21,22]}, RCL: 1},
		{structureType: 'road', pos: {x: [17,18,18,19,19,20,20,20,21,21,22,22,23,23,24,24,25,25,26,26,26,27,27,28,28,29], y: [21,20,22,19,23,17,18,22,18,21,18,21,19,21,18,21,18,21,17,18,22,19,23,20,22,21]}, RCL: 1},
		{structureType: 'spawn', pos: {x: [18,23,28], y: [18,17,18]}, RCL: 1},
		{structureType: 'container', pos: {x: [20,26,26,40,44], y: [17,17,42,12,9]}, RCL: 1},
		{structureType: 'extractor', pos: {x: [25], y: [42]}, RCL: 1},
		{structureType: 'storage', pos: {x: [38], y: [15]}, RCL: 1}
	]
},
{
    room: 'W13N5',
    buildings:  [
        {structureType: 'rampart', pos: {x: [7,7,7,7,8,10,10,10,10,12,12,12,15,19,23,27,28,28,28,29,31,37,37,40,40,41,44,47], y: [27,30,32,35,10,10,13,23,29,23,42,44,37,20,19,42,19,39,42,12,12,15,28,27,30,12,12,12]}, RCL: 1},
        {structureType: 'constructedWall', pos: {x: [7,7,7,7,7,9,11,12,12,12,12,25,26,30,32,33,40,40,40,40,40,42,43,45,46], y: [28,29,31,33,34,10,10,10,40,41,43,42,42,12,12,12,12,25,26,28,29,12,12,12,12]}, RCL: 1},
        {structureType: 'tower', pos: {x: [10,10,15,28,37,37], y: [13,29,37,39,15,28]}, RCL: 1},
        {structureType: 'terminal', pos: {x: [], y: []}, RCL: 1},
        {structureType: 'link', pos: {x: [12,12,16,19,20,23], y: [22,24,20,28,26,21]}, RCL: 1},
        {structureType: 'storage', pos: {x: [12], y: [23]}, RCL: 1},
        {structureType: 'extension', pos: {x: [16,16,16,17,17,17,17,18,18,18,18,18,18,18,19,19,19,19,20,20,20,20,20,20,20,20,20,20,21,21,21,21,21,21,22,22,22,22,22,22,22,23,23,23,24,24,25,25,26,26,27,27,27,27,28,28,28,29,29,29], y: [27,28,29,26,27,29,30,21,22,25,26,28,30,31,21,27,29,31,19,20,22,23,24,25,27,28,29,31,21,22,23,28,30,31,19,21,22,26,27,29,30,27,28,29,19,21,19,21,21,22,19,21,23,24,20,22,23,20,21,22]}, RCL: 1},
        {structureType: 'container', pos: {x: [16,21,26,30,36], y: [38,19,19,32,14]}, RCL: 1},
        {structureType: 'road', pos: {x: [17,18,18,19,19,19,19,19,19,20,20,21,21,21,21,21,21,22,22,22,23,23,24,24,25,25,26,26,26,27,27,28], y: [28,27,29,22,23,24,25,26,30,21,30,20,24,25,26,27,29,20,23,28,20,22,20,22,20,22,19,20,23,20,22,21]}, RCL: 1},
        {structureType: 'spawn', pos: {x: [19,23,28], y: [20,19,19]}, RCL: 1}
    ]
},
{
	room: 'W25N7',
	buildings: [
		{structureType: 'container', pos: {x: [24,33,37,41], y: [26,45,30,25]}, RCL: 1},
		{structureType: 'tower', pos: {x: [25,27,41,41,41,41], y: [42,42,22,24,31,33]}, RCL: 1},
		{structureType: 'rampart', pos: {x: [25,25,26,27,36,38,38,38,41,41,41,41,41,44,44,44,44,44,44], y: [42,45,45,42,30,30,32,34,22,24,26,31,33,22,23,24,31,32,33]}, RCL: 1},
		{structureType: 'constructedWall', pos: {x: [27,28], y: [45,45]}, RCL: 1},
		{structureType: 'extension', pos: {x: [32,33,33,33,34,34,34,34,34,34,34,34,34,34,34,34,35,35,35,35,35,35,35,35,36,36,36,36,36,36,36,36,36,37,37,37,37,37,37,37,38,38,38,38,38,38,38,39,39,39,39,39,40,40,40,40,40,40,40,41], y: [16,15,17,19,14,16,17,18,20,21,22,24,25,26,28,29,15,17,19,21,23,25,27,29,15,16,18,19,20,22,26,27,28,16,17,19,21,22,27,28,18,20,21,22,25,26,28,21,23,25,27,29,22,23,24,26,27,28,29,21]}, RCL: 1},
		{structureType: 'road', pos: {x: [32,33,33,34,34,34,34,35,35,35,35,35,35,36,36,36,36,37,37,38,38,38,38,39,39,39,39,39,40,40,41], y: [17,16,18,15,19,23,27,16,20,22,24,26,28,17,21,25,29,18,29,19,23,27,29,20,22,24,26,28,21,25,25]}, RCL: 1},
		{structureType: 'link', pos: {x: [32,35,37,37,37,39], y: [29,18,20,26,32,32]}, RCL: 1},
		{structureType: 'spawn', pos: {x: [36,38,41], y: [30,30,26]}, RCL: 1},
		{structureType: 'storage', pos: {x: [38], y: [32]}, RCL: 1},
		{structureType: 'terminal', pos: {x: [], y: []}, RCL: 1}
	]
},
{
	room: 'W23N9',
	buildings: [
		{structureType: 'link', pos: {x: [6,20,24,25,25,28], y: [28,41,40,32,34,41]}, RCL: 1},
		{structureType: 'extension', pos: {x: [17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,20,21,21,21,21,21,22,22,22,22,23,23,23,23,24,24,25,25,25,25,26,26,26,26,27,27,27,27,27,28,28,28,28,28,29,29,29,29,30,30,30,30,31,31,31], y: [40,41,42,39,40,42,43,39,41,43,44,37,38,40,42,44,39,40,41,43,44,39,40,42,43,37,39,40,42,38,42,37,39,40,42,39,40,42,43,39,40,41,43,44,37,38,40,42,44,39,41,43,44,39,40,42,43,40,41,42]}, RCL: 1},
		{structureType: 'road', pos: {x: [18,19,19,19,20,20,20,21,21,21,21,22,22,22,22,23,23,23,24,24,24,24,24,25,25,25,25,25,26,26,26,26,26,26,26,27,27,27,27,27,27,28,28,28,28,29,29,29,30,30,31,32], y: [41,37,40,42,36,39,43,36,37,38,42,36,37,38,41,36,38,41,32,33,34,36,41,31,35,36,38,41,32,33,34,36,37,38,41,32,34,36,37,38,42,33,36,39,43,37,40,42,38,41,39,40]}, RCL: 1},
		{structureType: 'spawn', pos: {x: [19,24,29], y: [38,37,38]}, RCL: 1},
		{structureType: 'rampart', pos: {x: [19,24,25,27,29,30,32,34,35,37,37,44,44,44,47,47,47,47], y: [38,37,33,33,38,44,47,44,47,44,47,22,25,29,21,24,26,29]}, RCL: 1},
		{structureType: 'container', pos: {x: [21,23,27,36,37], y: [37,13,37,30,41]}, RCL: 1},
		{structureType: 'extractor', pos: {x: [23], y: [14]}, RCL: 1},
		{structureType: 'storage', pos: {x: [25], y: [33]}, RCL: 1},
		{structureType: 'tower', pos: {x: [30,34,37,44,44,44], y: [44,44,44,22,25,29]}, RCL: 1},
		{structureType: 'constructedWall', pos: {x: [30,31,33,34,36,38,39,39,47,47,47,47,47,47,47,47,47,48,48], y: [47,47,47,47,47,47,47,48,19,20,22,23,25,27,28,30,31,19,31]}, RCL: 1}
	]
},
{
	room: 'W17N3',
	buildings: [
		{structureType: 'extension', pos: {x: [8,8,8,9,9,9,9,10,10,10,10,11,11,11,11,11,12,12,12,12,12,13,13,13,13,14,14,14,14,15,15,16,16,16,16,17,17,17,17,18,18,18,18,18,19,19,19,19,19,20,20,20,20,21,21,21,21,22,22,22], y: [23,24,25,22,23,25,26,22,24,26,27,20,21,23,25,27,22,23,24,26,27,22,23,25,26,20,22,23,25,21,25,20,22,23,25,22,23,25,26,22,23,24,26,27,20,21,23,25,27,22,24,26,27,22,23,25,26,23,24,25]}, RCL: 1},
		{structureType: 'road', pos: {x: [9,10,10,11,11,12,12,13,13,14,14,15,15,16,16,17,17,18,18,19,19,20,20,21], y: [24,23,25,22,26,21,25,21,24,21,24,22,24,21,24,21,24,21,25,22,26,23,25,24]}, RCL: 1},
		{structureType: 'spawn', pos: {x: [10,15,20], y: [21,20,21]}, RCL: 1},
		{structureType: 'rampart', pos: {x: [10,15,17,18,18,18,19,20,21,22,29,30,31,33,33,42,42,46,47], y: [21,20,2,5,29,31,2,21,5,2,2,5,2,2,5,37,41,37,36]}, RCL: 1},
		{structureType: 'link', pos: {x: [11,15,17,19,19,32], y: [24,23,29,24,29,39]}, RCL: 1},
		{structureType: 'container', pos: {x: [12,17,18,31,41], y: [20,35,20,29,11]}, RCL: 1},
		{structureType: 'constructedWall', pos: {x: [16,18,20,21,23,24,27,28,30,32,34,35,46,48], y: [2,2,2,2,2,2,2,2,2,2,2,2,36,36]}, RCL: 1},
		{structureType: 'tower', pos: {x: [18,21,30,33,42,42], y: [5,5,5,5,37,41]}, RCL: 1},
		{structureType: 'storage', pos: {x: [18], y: [29]}, RCL: 1},
		{structureType: 'extractor', pos: {x: [18], y: [36]}, RCL: 1}
	]
},
{
	room: 'W11N6',
	buildings: [
		{structureType: 'constructedWall', pos: {x: [2,2,2,2,2,47,47], y: [34,39,41,42,44,34,35]}, RCL: 1},
		{structureType: 'rampart', pos: {x: [2,2,2,2,5,5,23,23,26,29,33,34,34,34,37,37,44,44,47,47], y: [35,38,40,43,38,42,32,34,36,36,35,11,12,13,12,13,34,37,32,33]}, RCL: 1},
		{structureType: 'tower', pos: {x: [5,5,37,37,44,44], y: [38,42,12,13,34,37]}, RCL: 1},
		{structureType: 'container', pos: {x: [6,19,26,31,38], y: [7,26,35,35,18]}, RCL: 1},
		{structureType: 'link', pos: {x: [10,22,24,28,28,30], y: [31,34,34,39,42,39]}, RCL: 1},
		{structureType: 'terminal', pos: {x: [], y: []}, RCL: 1},
		{structureType: 'storage', pos: {x: [23], y: [34]}, RCL: 1},
		{structureType: 'extension', pos: {x: [24,24,25,25,25,25,25,26,26,26,26,26,27,27,27,27,27,27,28,28,28,28,28,29,29,29,29,29,29,29,30,30,30,30,30,30,30,31,31,31,31,31,31,32,32,32,32,32,32,33,33,33,33,33,34,34,34,35,35,35], y: [43,44,36,37,38,42,44,39,40,41,43,45,37,38,40,42,43,45,36,38,41,44,45,37,39,40,41,42,43,45,35,36,38,40,41,42,44,37,38,39,41,43,44,35,37,38,40,42,43,37,39,40,41,42,36,38,39,36,37,38]}, RCL: 1},
		{structureType: 'road', pos: {x: [25,26,26,26,26,27,27,27,27,28,28,28,29,29,30,30,31,31,31,32,32,32,33,33,34], y: [43,37,38,42,44,36,39,41,44,37,40,43,38,44,37,43,36,40,42,36,39,41,36,38,38]}, RCL: 1},
		{structureType: 'spawn', pos: {x: [26,29,33], y: [36,36,35]}, RCL: 1}
	]
},
{
	room: 'W27N11',
	buildings: [
		//{structureType: 'container', pos: {x: [14,36,37,43], y: [43,44,35,35]}, RCL: 1},
		{structureType: 'rampart', pos: {x: [20,21,21,21,23,24,25,26,27,29,29,29,31,32,33,35,35,37,39,40,42,43,45,46,47], y: [41,33,36,39,30,35,33,30,33,30,37,37,37,30,33,30,36,30,29,35,29,29,36,25,25]}, RCL: 1},
		//{structureType: 'constructedWall', pos: {x: [21,21,21,21,21,21,24,25,27,28,30,31,33,34,36,38,39,48], y: [34,35,37,38,40,41,30,30,30,30,30,30,30,30,30,30,30,25]}, RCL: 1},
		{structureType: 'tower', pos: {x: [24,25,27,33,42,43], y: [35,33,33,33,29,29]}, RCL: 1},
		{structureType: 'terminal', pos: {x: [], y: []}, RCL: 1},
		{structureType: 'link', pos: {x: [31,31,36,40,40,44], y: [36,38,39,22,38,39]}, RCL: 1},
		//{structureType: 'storage', pos: {x: [31], y: [37]}, RCL: 1},
		//{structureType: 'extension', pos: {x: [33,33,33,34,34,34,34,35,35,35,35,36,36,36,36,36,37,37,37,37,37,38,38,38,38,38,39,39,39,39,40,40,41,41,41,41,42,42,42,42,43,43,43,43,43,44,44,44,44,44,45,45,45,45,46,46,46,46,47,47,47], y: [38,39,40,37,38,40,41,37,39,41,42,35,36,38,40,42,37,38,39,41,42,37,38,40,41,41,35,37,38,40,36,40,35,37,38,40,37,38,40,41,37,38,39,41,42,35,36,38,40,42,37,39,41,42,37,38,40,41,38,39,40]}, RCL: 1},
		//{structureType: 'road', pos: {x: [34,35,35,36,36,37,37,38,38,39,39,40,40,41,41,42,42,43,43,44,44,45,45,46], y: [39,38,40,37,41,36,40,36,39,36,39,37,39,36,39,36,39,36,40,37,41,38,40,39]}, RCL: 1},
		//{structureType: 'spawn', pos: {x: [35,40,45], y: [36,35,36]}, RCL: 1},
		{structureType: 'lab', pos: {x: [], y: []}, RCL: 1}
	]
},
{
	room: 'W14N7',
	buildings: [
		{structureType: 'constructedWall', pos: {x: [2,4,6,8,8,9,10,12,14,16,19,20,22,23,25,27], y: [17,17,17,17,34,17,34,34,34,34,18,18,18,18,18,18]}, RCL: 1},
		{structureType: 'rampart', pos: {x: [3,5,5,6,7,7,9,10,10,11,12,13,15,15,21,21,22,23,24,25,26], y: [17,17,24,20,17,20,34,23,31,34,31,34,24,34,18,24,21,24,18,21,18]}, RCL: 1},
		{structureType: 'extension', pos: {x: [3,3,3,4,4,4,4,5,5,5,5,6,6,6,6,6,7,7,7,7,7,8,8,8,8,9,9,9,9,10,10,11,11,11,11,12,12,12,12,13,13,13,13,13,14,14,14,14,14,15,15,15,15,16,16,16,16,17,17,17], y: [26,27,28,25,26,28,29,25,27,29,30,23,24,26,28,30,25,26,27,29,30,25,26,28,29,23,25,26,28,24,28,23,25,26,28,25,26,28,29,25,26,27,29,30,23,24,26,28,30,25,27,29,30,25,26,28,29,26,27,28]}, RCL: 1},
		{structureType: 'road', pos: {x: [4,5,5,6,6,7,7,7,8,8,8,9,9,10,10,11,11,12,12,12,13,13,13,14,14,15,15,16], y: [27,26,28,25,29,23,24,28,23,24,27,24,27,25,27,24,27,23,24,27,23,24,28,25,29,26,28,27]}, RCL: 1},
		{structureType: 'spawn', pos: {x: [5,10,15], y: [24,23,24]}, RCL: 1},
		{structureType: 'tower', pos: {x: [6,7,10,12,22,25], y: [20,20,31,31,21,21]}, RCL: 1},
		{structureType: 'link', pos: {x: [6,10,14,23,23,27], y: [27,26,27,23,25,31]}, RCL: 1},
		{structureType: 'container', pos: {x: [7,13,15,37,44], y: [23,23,45,37,16]}, RCL: 1},
		{structureType: 'terminal', pos: {x: [], y: []}, RCL: 1},
		{structureType: 'storage', pos: {x: [23], y: [24]}, RCL: 1},
		{structureType: 'lab', pos: {x: [], y: []}, RCL: 1}
	]
},
{
	room: 'W11N7',
	buildings: [
		{structureType: 'constructedWall', pos: {x: [7,8,10,12,13,26,27,47,47,47,47,47,47], y: [2,2,2,2,2,2,2,8,10,12,14,16,17]}, RCL: 1},
		{structureType: 'container', pos: {x: [7,19,20,36,45], y: [17,34,34,31,31]}, RCL: 1},
		{structureType: 'rampart', pos: {x: [9,11,14,28,29,31,31,31,47,47,47,47], y: [2,2,2,2,2,26,27,28,9,11,13,15]}, RCL: 1},
		{structureType: 'link', pos: {x: [19,38,21,38,39,43], y: [35,10,35,11,39,35]}, RCL: 1},
		{structureType: 'tower', pos: {x: [27,28,35,35,44,44], y: [6,6,26,25,11,14]}, RCL: 1},
		{structureType: 'spawn', pos: {x: [34,41,46], y: [31,31,31]}, RCL: 1},
		{structureType: 'extension', pos: {x: [34,34,34,35,36,36,36,37,37,37,37,37,38,38,38,38,38,38,39,39,39,39,39,40,40,40,40,40,40,40,41,41,41,41,41,42,42,42,42,42,43,43,43,43,43,44,44,44,44,44,45,45,45,45,46,46,46,47,47,47], y: [32,34,35,33,33,37,39,31,32,38,40,41,30,31,33,39,41,42,30,32,33,40,42,30,31,33,38,39,41,42,32,34,37,38,40,32,33,35,36,37,31,32,34,36,38,31,33,34,35,37,33,34,36,37,32,35,36,32,33,34]}, RCL: 1},
		{structureType: 'road', pos: {x: [34,35,35,35,35,35,36,36,37,37,38,38,39,39,40,40,41,41,42,42,43,43,44,44,45,45,46,46], y: [33,32,34,35,36,37,32,38,33,39,32,40,31,41,32,40,33,39,34,38,33,37,32,36,32,35,33,34]}, RCL: 1},
		{structureType: 'storage', pos: {x: [37], y: [9]}, RCL: 1},
		{structureType: 'terminal', pos: {x: [], y: []}, RCL: 1}
	]
},
{
	room: 'W15N1',
	buildings: [
		{structureType: 'extension', pos: {x: [4,5,5,5,6,6,6,6,7,7,7,7,7,8,8,8,8,8,9,9,9,9,9,10,10,10,11,12,12,13,13,14,15,16,17,18,19,19,19,19,20,20,20,20,20,21,21,21,21,21,22,22,22,22,23,23,23,24,24,24], y: [7,6,8,9,5,7,9,10,4,6,8,10,11,4,5,8,9,11,6,7,9,10,12,10,11,13,12,10,12,10,12,12,12,12,12,12,8,9,11,12,7,8,10,12,14,7,9,10,11,13,7,8,10,12,8,9,11,9,10,11]}, RCL: 1},
		{structureType: 'road', pos: {x: [5,6,6,7,7,8,8,8,9,9,10,10,11,11,12,12,13,13,14,14,15,15,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23], y: [7,6,8,5,9,6,7,10,8,11,9,12,10,13,11,13,11,13,11,13,11,13,11,13,11,13,11,13,10,13,9,13,8,12,9,11,10]}, RCL: 1},
		{structureType: 'constructedWall', pos: {x: [6,9,11,12,14,15,17,18,20,22,23,28], y: [25,25,25,25,25,25,25,25,25,25,25,11]}, RCL: 1},
		{structureType: 'link', pos: {x: [7,11,16,16,20,26], y: [7,11,16,18,11,29]}, RCL: 1},
		{structureType: 'rampart', pos: {x: [7,8,11,12,12,13,14,15,16,16,18,18,19,20,21,24,25,25,28,28], y: [25,25,22,14,22,25,17,14,17,25,14,22,25,22,25,25,10,11,12,13]}, RCL: 1},
		{structureType: 'container', pos: {x: [10,14,19,32], y: [17,14,14,35]}, RCL: 1},
		{structureType: 'tower', pos: {x: [11,12,18,20,25,25], y: [22,22,22,22,10,11]}, RCL: 1},
		{structureType: 'spawn', pos: {x: [12,15,18], y: [14,14,14]}, RCL: 1},
		{structureType: 'storage', pos: {x: [16], y: [17]}, RCL: 1},
		{structureType: 'extractor', pos: {x: [33], y: [36]}, RCL: 1}
	]
},
/*{
	room: 'W89N5',
	buildings: [
		{structureType: 'constructedWall', pos: {x: [7,7,7,11,13,18,19,21,22,24,25,25,28,30,32,36], y: [23,25,27,16,16,16,16,16,16,16,15,16,14,14,14,35]}, RCL: 1},
		{structureType: 'rampart', pos: {x: [7,7,11,11,12,14,17,17,20,20,22,23,27,27,27,28,29,31,33,34,37,38], y: [24,26,22,28,16,16,16,28,16,19,27,16,22,24,28,17,14,14,31,31,35,35]}, RCL: 1},
		{structureType: 'tower', pos: {x: [11,11,20,28,33,34], y: [22,28,19,17,31,31]}, RCL: 1},
		{structureType: 'extractor', pos: {x: [11], y: [34]}, RCL: 1},
		{structureType: 'container', pos: {x: [12,19,25,43,44], y: [34,27,27,37,28]}, RCL: 1},
		{structureType: 'extension', pos: {x: [15,15,15,16,16,16,16,17,17,17,17,18,18,18,18,18,19,19,19,19,19,20,20,20,20,21,21,21,21,22,22,23,23,23,23,24,24,24,24,25,25,25,25,25,26,26,26,26,26,27,27,27,27,28,28,28,28,29,29,29], y: [30,31,32,29,30,32,33,29,31,33,34,27,28,30,32,34,29,30,31,33,34,29,30,32,33,27,29,30,32,28,32,27,29,30,32,29,30,32,33,29,30,31,33,34,27,28,30,32,34,29,31,33,34,29,30,32,33,30,31,32]}, RCL: 1},
		{structureType: 'link', pos: {x: [17,18,22,26,26,28], y: [19,31,30,24,31,24]}, RCL: 1},
		{structureType: 'spawn', pos: {x: [17,22,27], y: [28,27,28]}, RCL: 1},
		{structureType: 'road', pos: {x: [17,18,19,20,21,22,22,23,23,24,24,25,25,26,26,27,27,28], y: [32,33,32,31,31,29,31,28,31,28,31,28,32,29,33,30,32,31]}, RCL: 1},
		{structureType: 'storage', pos: {x: [27], y: [24]}, RCL: 1}
	]
},*/
    {room: 'W18N3', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [27,28], y: [24,16]}, RCL: 0}]},
    {room: 'W15N3', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [18], y: [35]}, RCL: 0}]},
    {room: 'W28N11', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [28,24], y: [40,14]}, RCL: 0}]},
    {room: 'W26N11', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [30,35], y: [33,33]}, RCL: 0}]},
    {room: 'W18N6', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [39], y: [33]}, RCL: 0}]},
    {room: 'W17N6', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [35], y: [32]}, RCL: 0}]},                            
    {room: 'W17N9', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [36], y: [11]}, RCL: 0}]},
    {room: 'W13N11', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [42,29], y: [31,13]}, RCL: 0}]},
    {room: 'W14N11', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [33], y: [41]}, RCL: 0}]},
    {room: 'W12N9', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [16,16], y: [26,18]}, RCL: 0}]},
    {room: 'W11N9', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [9,28], y: [7,25]}, RCL: 0}]},                                   
    {room: 'W14N9', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [41], y: [22]}, RCL: 0}]},                            
    {room: 'W17N7', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [46], y: [31]}, RCL: 0}]},
    {room: 'W17N8', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [24], y: [26]}, RCL: 0}]},
    {room: 'W16N8', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [23], y: [4]}, RCL: 0}]},
    {room: 'W16N9', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [19,31], y: [39,14]}, RCL: 0}]},
    {room: 'W16N7', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [28,42], y: [38,42]}, RCL: 0}]},
    {room: 'W16N6', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [40,5,32,6], y: [8,45,44,8]}, RCL: 0}]},                            
    {room: 'W18N4', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [43], y: [43]}, RCL: 0}]},
    {room: 'W16N4', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [7,44,36,4], y: [39,43,15,7]}, RCL: 0}]},
    {room: 'W16N3', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [9,9], y: [41,2]}, RCL: 0}]},
    {room: 'W15N4', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [5,35,7,32], y: [45,40,15,13]}, RCL: 0}]},
    {room: 'W16N5', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [12,35,4,36], y: [33,41,16,8]}, RCL: 0}]},
    {room: 'W17N3', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [41,32], y: [10,28]}, RCL: 0}]},
    {room: 'W15N9', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [30,9], y: [44,16]}, RCL: 0}]},
    {room: 'W14N5', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [44,7,34,8], y: [33,45,15,8]}, RCL: 0}]},
    {room: 'W14N4', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [8,36,32,10], y: [6,15,33,39]}, RCL: 0}]},
    {room: 'W25N6', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [41,9,11,39], y: [5,13,45,39]}, RCL: 0}]},
    {room: 'W24N8', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [10,37], y: [25,8]}, RCL: 0}]},
    {room: 'W22N9', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [26,38], y: [35,10]}, RCL: 0}]},
    {room: 'W23N8', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [18,38], y: [20,12]}, RCL: 0}]},
    {room: 'W24N6', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [13,39,5,45], y: [36,37,10,8]}, RCL: 0}]},
    {room: 'W25N5', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [39,7,14,39], y: [7,9,35,46]}, RCL: 0}]},
    {room: 'W12N6', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [42], y: [15]}, RCL: 0}]},
    {room: 'W11N7', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [19], y: [34]}, RCL: 0}]},
    {room: 'W12N7', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [44], y: [42]}, RCL: 0}]},
    {room: 'W27N12', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [16], y: [45]}, RCL: 0}]},
    {room: 'W26N12', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [6], y: [30]}, RCL: 0}]},
    {room: 'W13N7', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [34], y: [33]}, RCL: 0}]},
    {room: 'W14N8', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [38], y: [18]}, RCL: 0}]},
    {room: 'W14N6', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [9,35,47,9], y: [17,14,39,46]}, RCL: 0}]},
    {room: 'W15N6', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [9,33,7,31], y: [9,16,40,42]}, RCL: 0}]},
    {room: 'W13N6', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [36,38], y: [20,8]}, RCL: 0}]},
    {room: 'W21N9', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [24,45], y: [47,31]}, RCL: 0}]},
    {room: 'W21N8', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [21,31], y: [34,16]}, RCL: 0}]},
    {room: 'W22N8', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [30], y: [33]}, RCL: 0}]},
    {room: 'W14N1', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [7,35], y: [32,30]}, RCL: 0}]},
    {room: 'W16N1', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [10,36], y: [32,31]}, RCL: 0}]},
    {room: 'W14N2', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [35], y: [40]}, RCL: 0}]},
    {room: 'W89N6', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [31], y: [8]}, RCL: 0}]},
    {room: 'W88N6', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [8], y: [42]}, RCL: 0}]},
    {room: 'W11N8', buildings: 
        [{structureType: STRUCTURE_CONTAINER, pos: {x: [45], y: [25]}, RCL: 0}]}
];

global.roomObjects = {};

global.dismantle = {
    'W15N1': {ids: ['55def8eeb7eaa361247901e1','55def8f1f9ae346f3061bc15','55defa0bf9ae346f3061bd1d','55def8d943f00eea6b1a29bc','55def8f4d5990373298ccaad','55def9f8481558ae299d6b7d','55def8ea2725257e24544c57','55def9df481558ae299d6b60','55def8e4cdc0638c30a2c765','55defa1b0869b1266c0a3b2f','55defa49b7eaa36124790310','55def9fac8cf5eb1766c0b4f','55defa0ad5990373298ccbd8','55def8e7c8cf5eb1766c0a66','55defa0ad5990373298ccbd9']},
    'W11N6': {ids: ['58cb119fde8946453fc8332c','58cae6e63851bcc164042496','58caf578dec5890170933c0d']},
    'W13N5': {ids: ['58c27ffe6831bfa21936c065','58c2793595e4714e70bb9171','58d8dade41e2e819ae4b6840','58c246cf7ebab01163135bf7','58c246b1a19e06338fee3a5f']},
    'W88N6': {ids: ['589a5fe52178d0a73c1a886f','589a5fe91678b3ae5371bf34','589a5fef3d0efb1a20471eaa','589a5ff72c441c56246117cc','589a5ff6e96912483e1cb746','589a5ffa6b3cbb31559b3791','589a5ffe0dc8548e7c8f2a98','589a604907cab1237c79a933','589a604c06848cd2654b4b38','589a60508b4ce3650c1db8be','589a6053533051cb5349c563','589cd009692df30af1a59696','589cd00da56c0b0a121ec48e','589cd01022c5660b3783472b','589cd0141161df4038ca88aa']},
    'W16N1': {ids: ['56d743555758c641537fa9ae','56b17efab808fb6464138095','56d743863d135b843c93b82c']},
    'W21N9': {ids: ['576c8213bfa5c7073ca4ed4c','576c8215b27850083c068c5a','576f28af888f856f39c3328e','576f28b3d4ac7db007924d4b','576f28b6fd42ed473931808a','576f28d4e69f9a6539ff829c','576f28f9e605d47a39a103b4','576f2924018780054259abbe','576f292d3540229264fb207d','576bd1be2d2547835df2ccc7','577419633be9ba4031a462a8','57741967b196b47577f28f51','5774196abbf30196152ff69c','5774196c14b72d1631f037a7','57757f2b625841ca5aedd06c','57757f469e676a284155c889','57757f4f9afc9575627b63ef','57758553d89d149359eb6e6d','577976492ccc1bb957006f1c','57797655d8653260453a6bfd','57797658e95b5e9e573a0789','57798086dd50fda6221fd03f','5779808c295ffbad6c59dfdc','579401b0ea4df68a6148c0f1','579401b68eafcc9c4ea07c42','579401beec7a3abb61ca8de3','579401c6d59fbe32706a75d8','57942b67b7972bd74b3a3783','579610089082f12d4dd05203','5796100d862283fe77e8f969','579610151c44d62e799cf177']},
    'W13N7': {ids: ['5613f7e055bdff8119b28dee','561ace8c4117356e773fbcbc','5613e77a95f1ef242a3cd9c8','5618027a1d4899a444a9405a','561a50319de9064c18c2e0aa','5613e7812c83c4fb78715a67','561a503c7e3d2ed531a29cfb','5613db42ed59e58f43f95a76','5613de9a6441307c798e0a25','5613a7e34479f2a526537f2e','5618fd89642e952b43c7d648','5613a7d44382bdf85100e7c8','5613a8b3ddfaa00a1eb3e859','5618fd7a73653b0b4337d12a','561902bd9acde11a4218595a']}
};
 