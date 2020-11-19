import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class VineMechanism extends TimeEffect {
    @property(cc.Animation)
    private vineAnimation: cc.Animation = null;

    // TODO: need to add joint point at the root

    onLoad() {
        this.vineAnimation.on('play', () => {
            this.status = 'transforming';
        });
        this.vineAnimation.on('finished', () => {
            this.status = this.vineAnimation.currentClip.name === 'vineGrows' ? 'triggered' : 'original';
            const climbCollider: cc.BoxCollider = this.vineAnimation.getComponent(cc.BoxCollider);
            const skillCollider: cc.BoxCollider = this.getComponent(cc.BoxCollider);
            climbCollider.size.height = this.vineAnimation.node.height;
            climbCollider.offset.y = -this.vineAnimation.node.height / 2;
            if (this.vineAnimation.currentClip.name === 'vineGrows') {
                skillCollider.size.height = this.vineAnimation.node.height * 0.8;   //animation size's problem
                skillCollider.offset.y = -this.vineAnimation.node.height / 2;
            } else {
                skillCollider.size.height = 150;
                skillCollider.offset.y = -75;
            }
        });
    }

    update() {
        // if (this.status === 'transforming') {
        //     let collider = this.vineAnimation.getComponent(cc.BoxCollider);
        //     collider.size.width = this.node.width * 1.8;
        //     collider.size.height = this.node.height * 1.8;
        //     collider.apply();
        // }
    }

    public rollback() {
        this.vineAnimation.play('vineGrownBack');
    }

    public accelerate() {
        this.vineAnimation.play('vineGrows');
    }

    public slowdown() {}

    public reset() {
        // const climbCollider: cc.BoxCollider = this.vineAnimation.getComponent(cc.BoxCollider);
        // const skillCollider: cc.BoxCollider = this.getComponent(cc.BoxCollider);
        this.vineAnimation.play('vineGrownBack');
        // climbCollider.size.height = this.vineAnimation.node.height;
        // climbCollider.offset.y = -this.vineAnimation.node.height / 2;
        // skillCollider.size.height = 300;
        // skillCollider.offset.y = -150;
    }
}
