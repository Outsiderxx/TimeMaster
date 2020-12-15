const { ccclass, property } = cc._decorator;

@ccclass
export default class TransitionController extends cc.Component {
    @property(cc.Label)
    private message: cc.Label = null;

    @property(cc.Label)
    private hint: cc.Label = null;

    @property(cc.Node)
    private mask: cc.Node = null;

    private tween: cc.Tween = null;

    public showGameResult(isWin: boolean) {
        this.mask.opacity = 150;
        this.message.node.scale = 1;
        this.message.node.active = true;
        this.message.node.setPosition(0, 60);
        this.node.active = true;
        if (isWin) {
            this.message.string = 'CONGRATULATION';
            this.message.node.color = new cc.Color(255, 153, 0);
        } else {
            this.message.string = 'GAME OVER';
            this.message.node.color = new cc.Color(255, 0, 0);
        }
        cc.tween(this.node)
            .to(2, { opacity: 255 })
            .call(() => {
                this.tween = cc
                    .tween(this.hint.node)
                    .then(cc.tween().to(0.5, { opacity: 255 }).to(0.5, { opacity: 0 }))
                    .repeatForever()
                    .start();
                this.node.once(cc.Node.EventType.TOUCH_END, () => {
                    this.node.active = false;
                    this.hint.node.opacity = 0;
                    this.tween.stop();
                    this.node.emit('back', isWin);
                });
            })
            .start();
    }

    public openTransitionferStage() {
        this.node.active = true;
        this.message.string = 'Loading ...';
        // this.message.node.active = true;
        this.message.node.color = new cc.Color(255, 255, 255);
        this.message.node.setPosition(435, -275);
        this.message.node.scale = 0.2;
        this.mask.opacity = 0;
        cc.tween(this.mask)
            .to(1, { opacity: 255 })
            .call(() => {
                this.message.node.active = true;
                this.scheduleOnce(() => this.node.emit('transitionEnd'), 0.1);
            })
            .start();
    }

    public closeTransitionStage() {
        this.message.node.active = false;
        cc.tween(this.mask)
            .to(1, { opacity: 0 })
            .call(() => {
                this.node.active = false;
            })
            .start();
    }
}
