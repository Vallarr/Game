global.ALLIES = {
    'Helam': true,
    'Rajecz': true,
    'Dewey' : true,
    'CrazyPilot' : true,
    'Lamus' : true,
    'Tirao' : true,
    'McGnomington': true,
    'Dragnar': true,
    'Baldey': true,
    'Vultured': true,
    'Ransom': true,
    'Hive_': true,
    'Greenfox': true,
    'haaduken': true,
    'rouhet': true,
    'kraiik': true,
    'userwins': true,
    'PervyPenguin': true,
    'gastraph': true,
    'Violaman': true,
    'IFor': true,
	'QuickStrike': true
};

global.OBSTACLES = {
    "spawn": true,
    "creep": true,
    "wall": true,
    "source":true,
    "constructedWall": true,
    "extension": true,
    "link": true,
    "storage": true,
    "tower": true,
    "observer": true,
    "powerSpawn": true,
    "powerBank": true,
    "lab": true,
    "terminal": true,
    "nuker": true
};

global.defaultRoomStorageTreshold = {
    min: 100000,
    low: 150000,
    med: 200000,
    high: 250000,
    max: 300000,
    critical: 350000
};

global.ROOM_RESET_TIMER = 10;

global.MAX_STORE_TERMINAL = 280000;

global.GCL_FARM_TERMINAL_FILL = {
    low: 50000,
    high: 150000
};

global.TYPE_SETTLER = 'settler';
global.TYPE_EXPLORER = 'explorer';
global.TYPE_ADVENTURER = 'adventurer';

global.ROLE_HARVESTER = 'harvester';
global.ROLE_TRANSPORTER = 'transporter';
global.ROLE_REPAIRER = 'repairer';
global.ROLE_BUILDER = 'builder';
global.ROLE_UPGRADER = 'upgrader';
global.ROLE_MELEE = 'melee';
global.ROLE_MINER = 'miner';
global.ROLE_RESERVER = 'reserver';
global.ROLE_RANGED = 'ranged';
global.ROLE_HYBRID = 'hybrid';
global.ROLE_PATROLLER = 'patroller';
global.ROLE_PATROLLERRANGED = 'patrollerRanged';

global.RESOURCE_ANY = 'any';

global.CREEP_BODY_HITS = 100;
global.DEFENSE_DAMAGE_SURPLUS = 200;
global.DEFENSE_MAX_NUMBER_ATTACK = 33;

global.CONTROLLER_RESERVE_MIN = 1000;
global.CONTROLLER_RESERVE_OK = 0.9 * CONTROLLER_RESERVE_MAX;

global.DEFAULT_DECAY = 200;

global.STRUCTURE_ALL = [
    STRUCTURE_SPAWN,
    STRUCTURE_EXTENSION,
    STRUCTURE_ROAD,
    STRUCTURE_WALL,
    STRUCTURE_RAMPART,
    STRUCTURE_LINK,
    STRUCTURE_STORAGE,
    STRUCTURE_TOWER,
    STRUCTURE_OBSERVER,
    STRUCTURE_POWER_SPAWN,
    STRUCTURE_EXTRACTOR,
    STRUCTURE_LAB,
    STRUCTURE_TERMINAL,
    STRUCTURE_CONTAINER,
    STRUCTURE_NUKER
]

global.spawnBasePriority = {
    defender: {
        combat: 1,
        repairer: 2
    },
    settler: {
        harvester: 101,
        filler: 102,
        transporter: 103,
        courier: 104,
        repairer: 105,
        builder: 106,
        labWorker: 107,
        upgrader: 108,
        miner: 109
    },
    rescuer: {
        combat: 201
    },
    explorer: {
        melee: 300,
        harvester: 301,
        reserver: 302,
        repairer: 303,
        transporter: 304,
        builder: 305,
        upgrader: 306,
        miner: 307
    },
    adventurer: {
        patroller: 401,
        patrollerRanged: 402,
        harvester: 403,
        repairer: 404,
        transporter: 405,
        builder: 406,
        miner: 407
    },
    starter: {
        combat: 501,
        reserver: 502,
        startUp: 503,
        harvester: 504,
        transporter: 505,
        dismantler: 506,
        repairer: 507,
        builder: 508,
        upgrader: 509
    },
    attacker: {
        drainer: 601,
        dismantler: 602
    }
};