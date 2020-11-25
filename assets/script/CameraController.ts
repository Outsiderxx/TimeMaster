import SceneManager from './Scene/SceneManager';
import PlayerManager from './Player/PlayerManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraController extends cc.Component {
    @property(cc.Camera)
    private camera: cc.Camera = null;

    @property(cc.Node)
    private gameStage: cc.Node = null;

    @property(cc.Node)
    private middleGround: cc.Node = null;

    @property(PlayerManager)
    private player: PlayerManager = null;

    private sceneManager: cc.Node = null;
    private isFocus: boolean = false;
    private mode: CameraMode = 0;
    private _isUpdate: boolean = true;

    public set isUpdate(flag: boolean) {
        this._isUpdate = flag;
    }

    onLoad() {
        this.sceneManager = this.gameStage.getComponentInChildren(SceneManager).node;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event: cc.Event.EventKeyboard) => {
            if (event.keyCode === cc.macro.KEY.z) {
                this.reset();
            }
        });
    }

    update() {
        if (!this._isUpdate) {
            return;
        }
        const { normal, focus, zoom } = CameraMode;
        switch (this.mode) {
            case normal:
                this.updateNormalCameraPosition();
                break;
            case focus:
                this.updateFocusCameraPosition();
                break;
            case zoom:
                this.updateZoomCameraPosition();
                break;
            default:
                break;
        }
        this.middleGround.setPosition(this.camera.node.x + 640, this.camera.node.y + 360);
    }

    public reset() {
        this.mode = CameraMode.normal;
        this.sceneManager = this.gameStage.getComponentsInChildren(SceneManager).filter((sceneManager) => sceneManager.node.active === true)[0].node;
        this.camera.node.setPosition(this.sceneManager.getComponent(SceneManager).initialCameraPosition);
        this.middleGround = this.sceneManager.getChildByName('Foreground');
        this._isUpdate = true;
    }

    private updateNormalCameraPosition() {
        // x coordinate
        const cameraLeftEnd: number = this.player.node.x - this.camera.node.width / 2;
        const cameraRightEnd: number = this.player.node.x + this.camera.node.width / 2;
        const sceneLeftEnd: number = this.sceneManager.x + this.sceneManager.getComponent(SceneManager).getCurrentFloorEdgeOffset().x;
        const sceneRightEnd: number = this.sceneManager.x + this.sceneManager.width + this.sceneManager.getComponent(SceneManager).getCurrentFloorEdgeOffset().y;
        if (cameraLeftEnd >= sceneLeftEnd && cameraRightEnd <= sceneRightEnd) {
            this.camera.node.x = this.player.node.x;
        }
        // y coordinate
        const cameraTopEnd: number = this.player.node.y + this.camera.node.height / 2;
        const cameraDownEnd: number = this.player.node.y - this.camera.node.height / 2;
        const sceneTopEnd: number = this.sceneManager.y + this.sceneManager.height;
        const sceneDownEnd: number = this.sceneManager.y;
        if (cameraTopEnd <= sceneTopEnd && cameraDownEnd >= sceneDownEnd) {
            this.camera.node.y = this.player.node.y;
        }
    }

    private updateFocusCameraPosition() {}

    private updateZoomCameraPosition() {}
}

enum CameraMode {
    normal,
    focus,
    zoom,
}
