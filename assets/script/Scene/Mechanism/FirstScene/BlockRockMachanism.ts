import Mechanism from '../Mechanism';

const { ccclass, property } = cc._decorator;
const Input = {};
@ccclass
export default class BlockRockMechanism extends Mechanism {
    @property(cc.Sprite)
    private rock: cc.Sprite = null;

    @property
    private shrinkDuration: number = 0;

    public rollback() {
        cc.tween(this.rock.node)
            .to(this.shrinkDuration, { scale: 1 })
            .call(() => (this.status = 'original'))
            .start();
    }

    public accelerate() {
        cc.tween(this.rock.node)
            .to(this.shrinkDuration, { scale: 0 })
            .call(() => (this.status = 'triggered'))
            .start();
    }

    public slowdown() {}

    public reset() {
        this.status = 'original';
        this.rock.node.scale = 1;
    }
}
