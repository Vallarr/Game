Object.defineProperty(Creep.prototype, 'healPower', {
    get: function(){
        if(this === Creep.prototype || this == undefined){return}
        if(!this._healPower){
            this._healPower = 0;
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
        return this._healPower;
    },
    set: function(value){
        this._healPower = value;
    },
    enumerable: true,
    configurable: false
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