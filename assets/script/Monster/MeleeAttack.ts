const { ccclass, property } = cc._decorator;

@ccclass
export default class MeleeAttack extends cc.Component {

    private endAttack() {
        this.node.destroy();
    }

    onLoad() {
        this.schedule(this.endAttack,0.3,0);
    }
}
