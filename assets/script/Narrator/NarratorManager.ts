const { ccclass, property } = cc._decorator;

@ccclass
export default class NarratorManaget extends cc.Component {
    @property(cc.Label)
    private text: cc.Label = null;

    @property([cc.Node])
    private plotPoints: cc.Node[] = [];

    onLoad() {
        this.plotPoints.forEach((point) => {
            point.on('trigger', (text: string) => {
                this.text.node.active = true;
                this.text.string = text;
            });
            point.on('untrigger', () => {
                this.text.node.active = false;
            });
        });
    }
}
