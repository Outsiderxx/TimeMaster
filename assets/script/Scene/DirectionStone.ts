import TimeEffect from '../TimeEffect';
import { SkillSet } from '../Player/PlayerManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class DirectionStone extends TimeEffect {
    onLoad() {
        this.status = 'normal';
    }

    public accelerate() {
        this.node.emit('onClick', SkillSet.accelerate);
    }

    public slowdown() {
        this.node.emit('onClick', SkillSet.slowdown);
    }

    public rollback() {
        this.node.emit('onClick', SkillSet.rollback);
    }

    public reset() {}
}
