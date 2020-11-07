const { ccclass, property } = cc._decorator;

@ccclass
export default class MeleeAttack extends cc.Component {
    @property
    private attackSpeed: number = 0;

    private attackTween: cc.Tween = null;

    onLoad() {
        // 視情況改變
        this.attackTween = cc
            .tween()
            .call(() => {
                // this.node.emit('attackStart');
            })
            .by(this.attackSpeed, { angle: 55 })
            .call(() => {
                // this.node.emit('attackEnd');
                this.node.angle = 45;
            });
    }

    public attack() {
        this.attackTween.clone(this.node).start();
    }
}
