import TimeEffect from '../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class StretchPlatformMechanism extends TimeEffect {
    @property
    private initX: number = 0;

    @property
    private targetY: number = 0;

    public stretch() {
        // cc.tween(this.node).to()
    }

    public accelerate() {}

    public reset() {
        this.node.x = this.initX;
    }

    public slowdown() {}
    public rollback() {}
}
