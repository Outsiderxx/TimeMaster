import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class UpDownMoveRockMechanism extends TimeEffect {
    @property
    private movespeed: number = 0;
    @property(cc.Sprite)
    private platform: cc.Sprite = null;

    onLoad(){
        this.status = 'normal';
        cc.tween(this.platform.node)
            .repeatForever(
                    cc.tween().to(this.movespeed, { y: 300 })
                        .to(this.movespeed, { y: 0 }))
            .start();
    }
    
    public rollback() {}
    public accelerate() {
        this.status = 'speedup';
        this.movespeed -= 0.3;
        cc.tween(this.platform.node)
            .repeatForever(
                    cc.tween().to(this.movespeed, { y: 300 })
                        .to(this.movespeed, { y: 0 }))
            .start();
    }

    public slowdown() {
        this.status = 'slowdown';
        this.movespeed += 0.3;
        cc.tween(this.platform.node)
            .repeatForever(
                    cc.tween().to(this.movespeed, { y: 300 })
                        .to(this.movespeed, { y: 0 }))
            .start();  
    }

    public reset() {
        this.status = 'normal';
        this.movespeed = 0.3;
        this.platform.node.y = 0;
    }
}
