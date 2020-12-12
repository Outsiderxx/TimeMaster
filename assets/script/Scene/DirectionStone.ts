import TimeEffect from '../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class DirectionStone extends TimeEffect {
    onLoad() {
        this.status = 'normal';
    }

    public accelerate() {
        this.node.emit('onClick', 'accelerate');
    }

    public slowdown() {
        this.node.emit('onClick', 'slowdown');
    }

    public rollback() {
        this.node.emit('onClick', 'rollback');
    }

    public reset() {}
}
