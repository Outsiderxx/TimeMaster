import SceneManager from './Scene/SceneManager';
import PlayerManager from './Player/PlayerManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraController extends cc.Component {
    @property(cc.Camera)
    private camera: cc.Camera = null;

<<<<<<< HEAD
    @property(cc.Node)
    private mask: cc.Node = null;

    @property(cc.Node)
    private adapter: cc.Node = null;

    @property(cc.Node)
    private middleGround: cc.Node = null;
=======
    @property(cc.Sprite)
    private background: cc.Sprite = null;
>>>>>>> c4923516ab869143154832a5cc0222c321448c81

    @property(PlayerManager)
    private player: PlayerManager = null;

    @property(SceneManager)
    private sceneManager: SceneManager = null;

    private isFocus: boolean = false;

    update() {
        if (this.player.node.x <= 0) {
            this.camera.node.x = 0;
        } else if (this.player.node.x >= this.sceneManager.node.width - 640 - 640) {
            this.camera.node.x = this.sceneManager.node.width - 640 - 640;
        } else {
            this.camera.node.x = this.player.node.x;
        }
        if (this.player.node.y <= 0) {
            this.camera.node.y = 0;
        } else if (this.player.node.y >= this.sceneManager.node.height - 360 - 360) {
            this.camera.node.y = this.sceneManager.node.height - 360 - 360;
        } else {
            this.camera.node.y = this.player.node.y;
        }
<<<<<<< HEAD
        this.mask.setPosition(this.camera.node.x, this.camera.node.y);
        this.adapter.setPosition(-this.mask.x, -this.mask.y);
        this.middleGround.setPosition(this.camera.node.x + 640, this.camera.node.y + 360);
=======
        this.background.node.setPosition(this.camera.node.x + 640, this.camera.node.y + 360);
>>>>>>> c4923516ab869143154832a5cc0222c321448c81
    }

    public focusOn(position: cc.Vec2, scale: number) {}

    public reset() {
        this.camera.node.setPosition(new cc.Vec2(0, 0));
    }
}
