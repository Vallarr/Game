Object.defineProperty(Game, 'targetsOfCreeps', {
    get: function(){
        console.log('I got called');
        if(this == undefined){return}
        console.log('I really got called');
        if(!this._targetsOfCreeps){
            this._targetsOfCreeps = {};
            let possibleTargets = ['targetContainer','getDropped','controller','source','mineralSource','targetRoom','controllerRoom','sourceRoom','mineRoom','starterRoom'];
            for(let name in Game.creeps){
                let creep = Game.creeps[name];
                for(let i=0; i<possibleTargets.length; i++){
                    if(creep.memory[possibleTargets[i]]){
                        if(!this._targetsOfCreeps[possibleTargets[i]]){
                            this._targetsOfCreeps[possibleTargets[i]] = {[creep.memory[possibleTargets[i]]]: [creep], all: [creep.memory[possibleTargets[i]]]};
                        }
                        else {
                            this._targetsOfCreeps[possibleTargets[i]].all.push(creep.memory[possibleTargets[i]]);
                            if(!this._targetsOfCreeps[possibleTargets[i]][creep.memory[possibleTargets[i]]]){
                                this._targetsOfCreeps[possibleTargets[i]][creep.memory[possibleTargets[i]]] = [creep];
                            }
                            else {
                                this._targetsOfCreeps[possibleTargets[i]][creep.memory[possibleTargets[i]]].push(creep);
                            }
                        }
                    }
                }
            }
        }
        return this._targetsOfCreeps;
    },
    set: function(value){
        this._targetsOfCreeps = value;
    },
    enumerable: false,
    configurable: true
});