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
    'Rumatah': true
};

global.ROOM_RESET_TIMER = 10;

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

global.CREEP_BODY_HITS = 100;
global.DEFENSE_DAMAGE_SURPLUS = 100;
global.DEFENSE_MAX_NUMBER_ATTACK = 33;

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