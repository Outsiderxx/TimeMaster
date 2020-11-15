import PlayerManager, { StateSet } from './PlayerManager'
const { ccclass, property } = cc._decorator;

@ccclass
export default class AnumationEvent extends cc.Component {

    @property(PlayerManager)
    private playerManager: PlayerManager = null;
    public endHurt() {
        this.playerManager.playerState = StateSet.none;
        console.log("endHurt");
    }

    public endSkill() {
        this.playerManager.playerState = StateSet.none;
        console.log("endSkill");
    }

    public endJump() {
        this.playerManager.playerState = StateSet.none;
        console.log("endJump");
    }
}
