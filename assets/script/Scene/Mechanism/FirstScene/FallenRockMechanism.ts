import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class FallenRockMechanism extends TimeEffect {
    @property
    private dropSpeed: number = 0;

    @property(cc.Sprite)
    private rock: cc.Sprite = null;

    public rollback() {
        this.status = 'transforming';
        this.rock.node.active = true;
        cc.tween(this.rock.node)
            .to(this.dropSpeed, { y: -30 })
            .call(() => (this.status = 'original'))
            .start();
    }

    public accelerate() {
        this.status = 'transforming';
        cc.tween(this.rock.node)
            .to(this.dropSpeed, { y: -100 })
            .call(() => {
                this.rock.node.active = false;
                this.status = 'triggered';
            })
            .start();
    }

    public slowdown() {}

    public reset() {
        this.status = 'original';
        this.rock.node.active = true;
        this.rock.node.y = -30;
    }
}
