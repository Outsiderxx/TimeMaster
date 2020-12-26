import TimeEffect from '../TimeEffect';
const { ccclass, property } = cc._decorator;

@ccclass
export default class EnergyRock extends TimeEffect {
    @property(cc.Sprite)
    private energyRock: cc.Sprite = null;

    private isOpen: boolean = false;

    onLoad() {
        this.status = 'normal';
    }

    public rollback() {}

    public accelerate() {
        if (this.isOpen) {
            this.reset();
        } else {
            this.isOpen = true;
            this.energyRock.enabled = true;
            this.energyRock.getComponent(cc.CircleCollider).radius = 196;
        }
    }

    public slowdown() {}

    public reset() {
        this.isOpen = false;
        this.energyRock.enabled = false;
        this.energyRock.getComponent(cc.CircleCollider).radius = 0;
    }
}
