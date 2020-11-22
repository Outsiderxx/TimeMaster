import SceneManager from './Scene/SceneManager';
import PlayerManager from './Player/PlayerManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class CameraController extends cc.Component {
    @property(cc.Camera)
    private camera: cc.Camera = null;

    @property(cc.Node)
    private mask: cc.Node = null;

    @property(cc.Node)
    private adapter: cc.Node = null;

    @property(cc.Node)
    private middleGround: cc.Node = null;

    @property(PlayerManager)
    private player: PlayerManager = null;

    @property([cc.Vec2])
    private floorWidthEdgeOffset: cc.Vec2[] = []; // x: top, y: down

    private sceneManager: cc.Node = null;
    private isFocus: boolean = false;
    private mode: CameraMode = 0;
    private currentFloor: number = 0;

    onLoad() {
        this.sceneManager = cc.find('Canvas/GameStage/Mask/Adapter/Scene');
    }

    update() {
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
        this.mask.setPosition(this.camera.node.x, this.camera.node.y);
        this.adapter.setPosition(-this.mask.x, -this.mask.y);
        this.middleGround.setPosition(this.camera.node.x + 640, this.camera.node.y + 360);
    }

    public reset() {
        this.mode = CameraMode.normal;
        this.camera.node.setPosition(new cc.Vec2(-240, -100));
        this.sceneManager = cc.find('Canvas/GameStage/Mask/Adapter/Scene');
        this.middleGround = this.sceneManager.getChildByName('Foreground');
    }

    private updateNormalCameraPosition() {
        // x coordinate
        const cameraLeftEnd: number = this.player.node.x - this.camera.node.width / 2;
        const cameraRightEnd: number = this.player.node.x + this.camera.node.width / 2;
        const sceneLeftEnd: number = this.sceneManager.x + this.floorWidthEdgeOffset[this.currentFloor].x;
        const sceneRightEnd: number = this.sceneManager.x + this.sceneManager.width + this.floorWidthEdgeOffset[this.currentFloor].y;
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
