const { ccclass, property } = cc._decorator;

@ccclass
export default class MainMenuController extends cc.Component {
    @property(cc.Button)
    private startBtn: cc.Button = null;

    @property(cc.Button)
    private settingBtn: cc.Button = null;

    @property(cc.Button)
    private helpBtn: cc.Button = null;

    @property(cc.Button)
    private exitBtn: cc.Button = null;

    @property(cc.Node)
    private gameStage: cc.Node = null;

    onLoad() {
        this.startBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.active = false;
            this.node.emit('enterFirstScene');
        });
        this.exitBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            cc.game.end();
        });
    }
}
