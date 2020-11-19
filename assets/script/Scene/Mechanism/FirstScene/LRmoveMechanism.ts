import TimeEffect from '../../../TimeEffect';

const { ccclass, property } = cc._decorator;

@ccclass
export default class LPmoveRockMechanism extends TimeEffect {
    @property
    private movespeed: number = 0;
    @property(cc.Sprite)
    private platform: cc.Sprite = null;

    onLoad(){
        this.status = 'normal';
        cc.tween(this.platform.node)
            .repeatForever(
                    cc.tween().to(this.movespeed, { x: 450 })
                        .to(this.movespeed, { x: 0 }))
            .start();
    }
    
    public rollback() {}
    public accelerate() {
        
    }

    public slowdown() {
        
    }

    public reset() {
        this.status = 'normal';
        this.platform.node.x = 0;
    }
}
