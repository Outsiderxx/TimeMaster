// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class JaggedBody extends cc.Component {

    private _pos: cc.Vec3 = null;


    onLoad () {
        this._pos = this.node.position;
    }    
    
    update (dt) {
        this.node.position = this._pos;
        this.getComponent(cc.RigidBody).syncPosition(false);
    }

}
