import SceneManager from '../Scene/SceneManager';

const { ccclass, property } = cc._decorator;

@ccclass
export default class SkillCast extends cc.Component {
    @property(cc.Node)
    private skillRange: cc.Node = null;

    @property(cc.Node)
    private camera: cc.Node = null;

    private userPointer: cc.BoxCollider = null;
    private originalPointerPosition: cc.Vec2 = cc.v2(640, 360);
    private scene: cc.Node = null;
    private currentCollider: cc.Collider = null;
    private secondCollider: cc.Collider = null;
    private currentColliders: Map<string, cc.Collider> = new Map();

    onLoad() {
        cc.director.getCollisionManager().enabled = true;
        // cc.director.getCollisionManager().enabledDebugDraw = true;
        this.userPointer = this.node.getComponent(cc.BoxCollider);
        this.userPointer.getComponent(cc.Animation).play();
        this.scene = this.node.parent.getComponentsInChildren(SceneManager).filter((sceneManager) => sceneManager.node.active === true)[0].node;
        this.scene.on(cc.Node.EventType.MOUSE_MOVE, this.trackPointerPosition, this);
        this.scene.on(cc.Node.EventType.MOUSE_UP, this.onPointerClick, this);
    }

    update() {
        if (this.userPointer.node.active) {
            this.addCameraOffset();
        }
    }

    public changeScene() {
        this.currentColliders.clear();
        // this.currentCollider = null;
        // this.secondCollider = null;
        this.scene.off(cc.Node.EventType.MOUSE_MOVE, this.trackPointerPosition, this);
        this.scene.off(cc.Node.EventType.MOUSE_UP, this.onPointerClick, this);
        this.scene = this.node.parent.getComponentsInChildren(SceneManager).filter((sceneManager) => sceneManager.node.active === true)[0].node;
        this.scene.on(cc.Node.EventType.MOUSE_MOVE, this.trackPointerPosition, this);
        this.scene.on(cc.Node.EventType.MOUSE_UP, this.onPointerClick, this);
    }

    private trackPointerPosition(event: cc.Event.EventMouse) {
        const originalPos: cc.Vec2 = new cc.Vec2(event.getLocationX(), event.getLocationY());
        const localPos: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(originalPos);
        this.originalPointerPosition = localPos;
        this.addCameraOffset();
    }

    private onPointerClick() {
        if (this.currentColliders.size !== 0 && this.rangeCheck()) {
            this.currentColliders.forEach((collider) => {
                this.node.emit('skillHit', collider);
            });
        }
    }

    // private onCollisionEnter(other: cc.Collider) {
    //     // 顯示時鐘pointer
    //     this.node.getComponent(cc.Sprite).enabled = true;
    //     if (this.currentCollider !== null) {
    //         this.secondCollider = other;
    //     } else {
    //         this.currentCollider = other;
    //     }
    // }
    private onCollisionEnter(other: cc.Collider) {
        // 顯示時鐘pointer
        this.node.getComponent(cc.Sprite).enabled = true;
        this.currentColliders.set(other.node.name, other);
    }

    // private onCollisionExit() {
    //     if (this.secondCollider === null) {
    //         this.node.getComponent(cc.Sprite).enabled = false;
    //         this.currentCollider = null;
    //     } else {
    //         this.currentCollider = this.secondCollider;
    //         this.secondCollider = null;
    //     }
    // }
    private onCollisionExit(other: cc.Collider) {
        this.currentColliders.delete(other.node.name);
        if (this.currentColliders.size === 0) {
            this.node.getComponent(cc.Sprite).enabled = false;
        }
    }

    private addCameraOffset() {
        this.userPointer.node.x = this.originalPointerPosition.x / this.camera.getComponent(cc.Camera).zoomRatio + this.camera.x;
        this.userPointer.node.y = this.originalPointerPosition.y / this.camera.getComponent(cc.Camera).zoomRatio + this.camera.y;
    }

    private rangeCheck(): boolean {
        const skillRangeWorldPosition: cc.Vec3 = this.skillRange.parent.convertToWorldSpaceAR(this.skillRange.position);
        return cc.Intersection.polygonCircle(this.userPointer.world.points, {
            position: new cc.Vec2(skillRangeWorldPosition.x, skillRangeWorldPosition.y),
            radius: (this.skillRange.width / 2 / 2.2) * this.skillRange.scale, // width / 2, parent scale, self scale
        });
    }
}
