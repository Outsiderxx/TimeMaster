import TimeEffect from '../TimeEffect';
const { ccclass, property } = cc._decorator;

@ccclass
export default class EnergyRock extends TimeEffect {
    @property(cc.Animation)
    private energyRockAnimation: cc.Animation = null;

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
            this.energyRockAnimation.play('EnergyRockRecharged');
            this.energyRockAnimation.getComponent(cc.CircleCollider).radius = 196;
        }
    }

    public slowdown() {}

    public reset() {
        this.isOpen = false;
        this.energyRockAnimation.play('EnergyRockEmpty');
        this.energyRockAnimation.getComponent(cc.CircleCollider).radius = 0;
    }
}
