import TimeEffect from '../../../TimeEffect';
import FakeRock from './FakeRock';

const { ccclass, property } = cc._decorator;

@ccclass
export default class TouchedMechanism extends TimeEffect {
    @property(FakeRock)
    private fakeRock: FakeRock = null;

    private hasReturn: boolean = false;

    onLoad() {
        this.status = 'triggered';
    }

    update() {
        this.node.getComponent(cc.BoxCollider).offset.y = 381 + this.fakeRock.node.y;
    }

    public rollback() {
        if (!this.hasReturn && this.fakeRock.isDrop) {
            this.hasReturn = true;
            this.fakeRock.rollback();
        }
    }

    public accelerate() {}

    public slowdown() {}

    public reset() {
        this.fakeRock.reset();
        this.hasReturn = false;
        this.node.getComponent(cc.BoxCollider).offset.y = 381;
    }
}
