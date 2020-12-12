import ClockMechanism from './ClockMechanism';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ClockPlatform extends cc.Component {
    @property(ClockMechanism)
    private clock: ClockMechanism = null;

    @property(cc.Node)
    private hourPlatform: cc.Node = null;

    @property(cc.Node)
    private minutePlatform: cc.Node = null;

    @property
    private hourHandRadius: number = 0;

    @property
    private minuteHandRadius: number = 0;

    onLoad() {
        this.clock.node.on('reset', () => this.reset());
    }

    update() {
        this.hourPlatform.setPosition(this.angleToPosition(this.clock.hourHand.angle, this.hourHandRadius));
        this.minutePlatform.setPosition(this.angleToPosition(this.clock.minuteHand.angle, this.minuteHandRadius));
    }

    private reset() {}

    private angleToPosition(angle: number, radius: number) {
        while (angle < 360) {
            angle += 360;
        }
        while (angle - 360 > 0) {
            angle -= 360;
        }
        return new cc.Vec2(radius * Math.cos(this.angleToRadians(angle)), radius * Math.sin(this.angleToRadians(angle)));
    }

    private angleToRadians(angle: number) {
        return (angle * Math.PI) / 180;
    }
}
