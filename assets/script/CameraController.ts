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
    private _isUpdate: boolean = true;
    private cameraMovementResolve: (value: void) => void = null;
    private movementTween: cc.Tween = null;

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
        this.updateNormalCameraPosition();
        this.middleGround?.setPosition(this.camera.node.x + 640, this.camera.node.y + 360);
    }

    public async sceneThreeCameraMovement() {
        this.movementTween = cc
            .tween(this.camera.node)
            .delay(1)
            .to(1, { y: 855 }, cc.easeCircleActionInOut())
            .delay(1)
            .to(2, { x: 1800 }, cc.easeCircleActionInOut())
            .delay(1)
            .to(3, { x: 2800, y: -35 }, cc.easeCircleActionInOut())
            .delay(1)
            .to(2, { x: -240, y: 25 }, cc.easeCircleActionInOut())
            .call(() => this.cameraMovementResolve())
            .start();
        await new Promise((resolve) => (this.cameraMovementResolve = resolve));
    }

    public async sceneFourCameraMovement() {
        this.movementTween = cc
            .tween(this.camera.node)
            .delay(1)
            .to(1, { x: -1280, y: 1950 }, cc.easeCircleActionInOut())
            .delay(1)
            .to(2, { x: 2560, y: 2160 }, cc.easeCircleActionInOut())
            .delay(1)
            .to(1.25, { y: 800 }, cc.easeCircleActionInOut())
            .delay(1)
            .to(0.5, { x: 1780 }, cc.easeCircleActionInOut())
            .delay(1)
            .to(1.5, { x: 0, y: 873.6 }, cc.easeCircleActionInOut())
            .call(() => this.cameraMovementResolve())
            .start();
        await new Promise((resolve) => (this.cameraMovementResolve = resolve));
    }

    public finalSceneSetUp() {
        this.camera.zoomRatio = 1;
        this.camera.node.setContentSize(new cc.Size(1280, 720));
    }

    public normalSceneSetUp() {
        this.camera.zoomRatio = 1.6;
        this.camera.node.setContentSize(new cc.Size(800, 450));
    }

    public reset() {
        this.sceneManager = this.gameStage.getComponentsInChildren(SceneManager).filter((sceneManager) => sceneManager.node.active === true)[0].node;
        this.camera.node.setPosition(this.sceneManager.getComponent(SceneManager).initialCameraPosition);
        this.movementTween?.stop();
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
}

enum CameraMode {
    normal,
    focus,
    zoom,
}
