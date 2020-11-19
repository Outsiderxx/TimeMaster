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
    private active: boolean = true;

    @property(cc.Sprite)
    private rock: cc.Sprite = null;

    public rollback() {
        this.status = 'transforming';
        this.rock.node.active = true;
        cc.tween(this.rock.node)
            .to(this.dropSpeed, { y: this.intial_y})
            .call(() => (this.status = 'original'))
            .start();
    }

    public accelerate() {
        this.status = 'transforming';
        cc.tween(this.rock.node)
            .to(this.dropSpeed, { y: this.target_y })
            .call(() => {
                this.rock.node.active = this.active;
                this.status = 'triggered';
            })
            .start();
    }

    public slowdown() {}

    public reset() {
        this.status = 'original';
        this.rock.node.active = true;
        this.rock.node.y = this.intial_y;
    }
}
