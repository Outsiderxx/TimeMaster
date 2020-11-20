import PlayerManager, { StateSet } from './PlayerManager';
const { ccclass, property } = cc._decorator;

@ccclass
export default class AnimationEvent extends cc.Component {
    private playerManager: PlayerManager = null;

    onLoad() {
        this.playerManager = this.node.parent.getComponent(PlayerManager);
    }

    public endHurt() {
        this.playerManager.playerState = StateSet.none;
        console.log('endHurt');
    }

    public endSkill() {
        this.playerManager.playerState = StateSet.none;
        console.log('endSkill');
    }

    public endJump() {
        this.playerManager.playerState = StateSet.none;
        console.log('endJump');
    }
}
