Object.defineProperty(Creep.prototype, 'healPower', {
    get: function(){
        if(this === Creep.prototype || this == undefined){return}
        if(this._healPower == undefined){
            this._healPower = 0;
            if(this.getActiveBodyparts(HEAL)){
                for(let i=0; i<this.body.length; i++){
                    let part = this.body[i];
                    if(part.hits && part.type == HEAL){
                        let boost;
                        if(part.boost){boost = BOOSTS[part.type][part.boost].heal}
                        if(boost == undefined){boost = 1}
                        this._healPower += boost * HEAL_POWER;
                    }
                }
            }
        }
        return this._healPower;
    },
    set: function(value){
        this._healPower = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Creep.prototype, 'rangedHealPower', {
    get: function(){
        if(this === Creep.prototype || this == undefined){return}
        if(this._rangedHealPower == undefined){
            this._rangedHealPower = 0;
            if(this.getActiveBodyparts(HEAL)){
                for(let i=0; i<this.body.length; i++){
                    let part = this.body[i];
                    if(part.hits && part.type == HEAL){
                        let boost;
                        if(part.boost){boost = BOOSTS[part.type][part.boost].rangedHeal}
                        if(boost == undefined){boost = 1}
                        this._rangedHealPower += boost * RANGED_HEAL_POWER;
                    }
                }
            }
        }
        return this._rangedHealPower;
    },
    set: function(value){
        this._rangedHealPower = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Creep.prototype, 'attackPower', {
    get: function(){
        if(this === Creep.prototype || this == undefined){return}
        if(this._attackPower == undefined){
            this._attackPower = 0;
            if(this.getActiveBodyparts(ATTACK)){
                for(let i=0; i<this.body.length; i++){
                    let part = this.body[i];
                    if(part.hits && part.type == ATTACK){
                        let boost;
                        if(part.boost){boost = BOOSTS[part.type][part.boost].attack}
                        if(boost == undefined){boost = 1}
                        this._attackPower += boost * ATTACK_POWER;
                    }
                }
            }
        }
        return this._attackPower;
    },
    set: function(value){
        this._attackPower = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Creep.prototype, 'rangedAttackPower', {
    get: function(){
        if(this === Creep.prototype || this == undefined){return}
        if(this._rangedAttackPower == undefined){
            this._rangedAttackPower = 0;
            if(this.getActiveBodyparts(RANGED_ATTACK)){
                for(let i=0; i<this.body.length; i++){
                    let part = this.body[i];
                    if(part.hits && part.type == RANGED_ATTACK){
                        let boost;
                        if(part.boost){boost = BOOSTS[part.type][part.boost].rangedAttack}
                        if(boost == undefined){boost = 1}
                        this._rangedAttackPower += boost * RANGED_ATTACK_POWER;
                    }
                }
            }
        }
        return this._rangedAttackPower;
    },
    set: function(value){
        this._rangedAttackPower = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Creep.prototype, 'potentialHeal', {
    get: function(){
        if(this === Creep.prototype || this == undefined){return}
        if(this._potentialHeal == undefined){
            this._potentialHeal = 0;
            if((this.my && this.room.controller && this.room.controller.my) || (!this.my && this.room.controller && this.room.controller.owner && this.room.controller.owner.username == this.owner.username)){
                //Friendly towers can heal
                let towers = util.gatherObjectsInArray(this.room.structures,STRUCTURE_TOWER).filter((t) => t.energy >= 10);
                this._potentialHeal += this.pos.towerHeal(towers);
            }
            if(this.my || ALLIES[this.owner.username]){
                //Allied creeps can heal
                let myCreeps = this.room.creeps.my;
                this._potentialHeal += this.pos.creepHeal(myCreeps);
                let alliedCreeps = this.room.creeps.allies;
                this._potentialHeal += this.pos.creepHeal(alliedCreeps);
            }
            else {
                //Enemy creeps will heal it
                let healers = util.gatherObjectsInArray(this.room.creeps.hostiles,'heal','meleeHeal','rangedHeal','hybrid');
                this._potentialHeal += this.pos.creepHeal(healers);
            }
        }
        return this._potentialHeal;
    },
    set: function(value){
        this._potentialHeal = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Creep.prototype, 'potentialHealNoDamage', {
    //As opposed to potentialHeal, this one will not count healing by damaged healers, as they are assumed to heal themselves first
    get: function(){
        if(this === Creep.prototype || this == undefined){return}
        if(this._potentialHeal == undefined){
            this._potentialHeal = 0;
            if((this.my && this.room.controller && this.room.controller.my) || (!this.my && this.room.controller && this.room.controller.owner && this.room.controller.owner.username == this.owner.username)){
                //Friendly towers can heal
                let towers = util.gatherObjectsInArray(this.room.structures,STRUCTURE_TOWER).filter((t) => t.energy >= 10);
                this._potentialHeal += this.pos.towerHeal(towers);
            }
            if(this.my || ALLIES[this.owner.username]){
                //Allied creeps can heal
                let myCreeps = this.room.creeps.my;
                this._potentialHeal += this.pos.creepHeal(myCreeps);
                let alliedCreeps = this.room.creeps.allies;
                this._potentialHeal += this.pos.creepHeal(alliedCreeps);
            }
            else {
                //Enemy creeps will heal it
                let healers = util.gatherObjectsInArray(this.room.creeps.hostiles,'heal','meleeHeal','rangedHeal','hybrid').filter((c) => c.hits == c.hitsMax);
                this._potentialHeal += this.pos.creepHeal(healers);
            }
        }
        return this._potentialHeal;
    },
    set: function(value){
        this._potentialHeal = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Creep.prototype, 'potentialDamage', {
    get: function(){
        if(this === Creep.prototype || this == undefined){return}
        if(this._potentialDamage == undefined){
            this._potentialDamage = 0;
            if(!this.my && this.room.controller && this.room.controller.my){
                //My towers can attack
                let towers = util.gatherObjectsInArray(this.room.structures,STRUCTURE_TOWER).filter((t) => t.energy >= 10);
                this._potentialDamage += this.pos.towerDamage(towers);
            }
            if(this.my || ALLIES[this.owner.username]){
                //Enemie creeps cause damage
                let enemies = util.gatherObjectsInArray(this.room.creeps.hostiles,'meleeHeal','rangedHeal','hybrid','melee','ranged','meleeRanged');
                this._potentialDamage += this.pos.creepDamage(enemies);
            }
            else {
                //My creeps cause damage
                let myCreeps = this.room.creeps.my;
                this._potentialDamage += this.pos.creepDamage(myCreeps);
            }
        }
        return this._potentialDamage;
    },
    set: function(value){
        this._potentialDamage = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Creep.prototype, 'toughness', {
    get: function(){
        if(this === Creep.prototype || this == undefined){return}
        if(this._toughness == undefined){
            this._toughness = 0;
            if(this.getActiveBodyparts(TOUGH)){
                for(let i=0; i<this.body.length; i++){
                    let part = this.body[i];
                    if(part.hits && part.type == TOUGH){
                        let boost;
                        if(part.boost){boost = BOOSTS[part.type][part.boost].damage}
                        if(boost == undefined){boost = 1}
                        this._toughness += part.hits/boost;
                    }
                }
            }
        }
        return this._toughness;
    },
    set: function(value){
        this._toughness = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Creep.prototype, 'toughHealth', {
    get: function(){
        if(this === Creep.prototype || this == undefined){return}
        if(this._toughHealth == undefined){
            this._toughHealth = 0;
            if(!this.getActiveBodyparts(TOUGH)){
                this._toughHealth = this.hits;
            }
            else {
                for(let i=0; i<this.body.length; i++){
                    let part = this.body[i];
                    if(part.type != TOUGH){
                        this._toughHealth += part.hits;
                    }
                }
                this._toughHealth += this.toughness;
            }
        }
        return this._toughHealth;
    },
    set: function(value){
        this._toughHealth = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Creep.prototype, 'fatigueRatio', {
    get: function(){
        if(this === Creep.prototype || this == undefined){return}
        if(this._fatigueRatio == undefined){
            if(!this.getActiveBodyparts(MOVE)){
                this._fatigueRatio = 100;
            }
            else {
                let reduceFatigue = 0;
                let increaseFatigue = 0;
                for(let i=0; i<this.body.length; i++){
                    let part = this.body[i];
                    if(part.hits && part.type == MOVE){
                        let boost;
                        if(part.boost){boost = BOOSTS[part.type][part.boost].fatigue}
                        if(boost == undefined){boost = 1}
                        reduceFatigue += boost * 2;
                    }
                    else if(part.type != MOVE && part.type != CARRY){
                        increaseFatigue += 2;
                    }
                }
                if(this.carryCapacity != 0){
                    increaseFatigue += 2 * Math.ceil(_.sum(this.carry)/this.carryCapacity * this.getActiveBodyparts(CARRY));
                }
                this._fatigueRatio = increaseFatigue/reduceFatigue;
            }
        }
        return this._fatigueRatio;
    },
    set: function(value){
        this._fatigueRatio = value;
    },
    enumerable: false,
    configurable: true
});

Object.defineProperty(Creep.prototype, 'firstResource', {
    get: function(){
        if(this === Creep.prototype || this == undefined){return}
        if(!this._firstResource){
            for(let resource in this.carry){
                if(this.carry[resource] > 0){
                    this._firstResource = resource;
                    break;
                }
            }
        }
        return this._firstResource;
    },
    set: function(value){
        this._firstResource = value;
    },
    enumerable: false,
    configurable: true
});