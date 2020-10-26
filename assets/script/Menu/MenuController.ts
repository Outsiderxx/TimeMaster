const { ccclass, property } = cc._decorator;

@ccclass
export default class MenuController extends cc.Component {
    @property(cc.Node)
    private menuPanel: cc.Node = null;

    @property(cc.Node)
    private menuBackground: cc.Node = null;

    @property(cc.Button)
    private helpBtn: cc.Button = null;

    @property(cc.Toggle)
    private volumeToggle: cc.Toggle = null;

    @property(cc.Button)
    private backBtn: cc.Button = null;

    @property(cc.Node)
    private helpPanel: cc.Node = null;

    @property(cc.Button)
    private closeBtn: cc.Button = null;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, () => {
            cc.director.pause();
            this.menuPanel.active = true;
        });
        this.menuBackground.on(cc.Node.EventType.TOUCH_END, () => {
            this.menuPanel.active = false;
            cc.director.resume();
        });
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.menuPanel.active = false;
            this.helpPanel.active = true;
        });
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.helpPanel.active = false;
            cc.director.resume();
        });
        this.volumeToggle.node.on('toggle', () => {
            // TODO: Music Manager Enable / Disable
        });
        this.backBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.menuPanel.active = false;
            cc.director.resume();
            this.node.emit('back');
        });
    }
}
