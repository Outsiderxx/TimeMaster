import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class FallenRockMechanism extends TimeEffect {
    @property
    private dropSpeed: number = 0;

    @property
    private intial_y: number = 0;

    @property
    private target_y: number = 0;

    @property
    private needRemainDisplaying: boolean = false;

    @property
    private isTriggered: boolean = false;

    @property
    private isColliderMoving: boolean = false;

    @property
    private isResetTriggered: boolean = false;

    @property(cc.Sprite)
    private rock: cc.Sprite = null;

    @property(cc.Node)
    private sandParticle: cc.Node = null;

    @property(cc.AudioClip)
    private sound: cc.AudioClip = null;

    onLoad() {
        this.status = this.isTriggered ? 'triggered' : 'original';
    }

    public rollback() {
        this.status = 'transforming';
        this.rock.node.active = true;
        cc.tween(this.rock.node)
            .to(this.dropSpeed, { y: this.intial_y })
            .call(() => {
                this.status = 'original';
                this.sandParticle.active = true;
                if (this.isColliderMoving) {
                    this.node.getComponent(cc.BoxCollider).offset.y = this.intial_y;
                }
            })
            .start();
    }

    public accelerate() {
        cc.audioEngine.playEffect(this.sound, false);
        this.status = 'transforming';
        cc.tween(this.rock.node)
            .to(this.dropSpeed, { y: this.target_y })
            .call(() => {
                this.rock.node.active = this.needRemainDisplaying;
                this.status = 'triggered';
                this.sandParticle.active = false;
                if (this.isColliderMoving) {
                    this.node.getComponent(cc.BoxCollider).offset.y = this.target_y;
                }
            })
            .start();
    }

    public slowdown() {}

    public reset() {
        if (this.isResetTriggered) {
            this.status = 'transforming';
            this.sandParticle.active = false;
            cc.tween(this.rock.node)
                .to(this.dropSpeed, { y: this.target_y })
                .call(() => {
                    this.rock.node.active = this.needRemainDisplaying;
                    this.status = 'triggered';
                    if (this.isColliderMoving) {
                        this.node.getComponent(cc.BoxCollider).offset.y = this.target_y;
                    }
                })
                .start();
        } else {
            this.rock.node.active = true;
            this.rollback();
        }
    }
}
