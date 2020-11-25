const { ccclass, property } = cc._decorator;

@ccclass
export default class MenuController extends cc.Component {
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

    private isOpen: boolean = false;

    onLoad() {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event: cc.Event.EventKeyboard) => {
            if (event.keyCode === cc.macro.KEY.escape) {
                if (this.isOpen) {
                    this.isOpen = false;
                    this.helpPanel.active = false;
                    this.node.active = false;
                    cc.director.resume();
                } else {
                    this.isOpen = true;
                    this.node.active = true;
                    cc.director.pause();
                }
            }
        });
        this.helpBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.helpPanel.active = true;
        });
        this.closeBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.helpPanel.active = false;
        });
        this.volumeToggle.node.on('toggle', () => {
            // TODO: Music Manager Enable / Disable
        });
        this.backBtn.node.on(cc.Node.EventType.TOUCH_END, () => {
            this.node.active = false;
            this.helpPanel.active = false;
            this.isOpen = false;
            cc.director.resume();
            this.node.emit('back');
        });
        this.node.active = false;
        this.node.opacity = 255;
    }
}
