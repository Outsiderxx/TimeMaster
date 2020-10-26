const { ccclass, property } = cc._decorator;

@ccclass
export default class SkillCast extends cc.Component {
    @property(cc.Node)
    private skillRange: cc.Node = null;

    @property(cc.Node)
    private camera: cc.Node = null;

    private userPointer: cc.BoxCollider = null;
    private originalPointerPosition: cc.Vec2 = null;
    private scene: cc.Node = null;

    onLoad() {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
        this.userPointer = this.node.getComponent(cc.BoxCollider);
        this.scene = cc.find('Canvas/GameStage/Scene');
        this.scene.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            this.userPointer.node.active = true;
            const originalPos: cc.Vec2 = new cc.Vec2(event.getLocationX(), event.getLocationY());
            const localPos: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(originalPos);
            this.originalPointerPosition = localPos;
            this.addCameraOffset();
        });
        this.scene.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            const originalPos: cc.Vec2 = new cc.Vec2(event.getLocationX(), event.getLocationY());
            const localPos: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(originalPos);
            this.originalPointerPosition = localPos;
            this.addCameraOffset();
        });
        this.scene.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            this.userPointer.node.active = false;
        });
        this.scene.on(cc.Node.EventType.TOUCH_CANCEL, (event: cc.Event.EventTouch) => {
            this.userPointer.node.active = false;
        });
        this.node.active = false;
    }

    update() {
        if (this.userPointer.node.active) {
            this.addCameraOffset();
        }
    }

    private onCollisionEnter(other: cc.Collider, self: cc.Collider) {
        if (this.rangeCheck()) {
            this.node.emit('skillHit', other);
        }
    }

    private addCameraOffset() {
        this.userPointer.node.x = this.originalPointerPosition.x + this.camera.x;
        this.userPointer.node.y = this.originalPointerPosition.y + this.camera.y;
    }

    private rangeCheck(): boolean {
        const skillRangeWorldPosition: cc.Vec3 = this.skillRange.parent.convertToWorldSpaceAR(this.skillRange.position);
        return cc.Intersection.polygonCircle(this.userPointer.world.points, {
            position: new cc.Vec2(skillRangeWorldPosition.x, skillRangeWorldPosition.y),
            radius: (this.skillRange.width / 2 / 2) * this.skillRange.scale, // width / 2, parent scale, self scale
        });
    }
}
