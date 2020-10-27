const { ccclass, property } = cc._decorator;

@ccclass
export default class TerrainGenerator extends cc.Component {
    onLoad() {
        cc.director.getPhysicsManager().enabled = true;
        // cc.director.getPhysicsManager().debugDrawFlags = 1; // for collider debug
        // 獲取 tiledMap 資訊
        const tiledmap: cc.TiledMap = this.node.getComponent(cc.TiledMap);
        const tiledSize = tiledmap.getTileSize();
        const layer = tiledmap.getLayer('platform');
        const layerSize = layer.getLayerSize();

        // 每格掃描 若有物件則生成 collider & rigidBody
        for (let i = 0; i < layerSize.width; i++) {
            for (let j = 0; j < layerSize.height; j++) {
                const tiled: cc.TiledTile = layer.getTiledTileAt(i, j, true);
                if (tiled.gid != 0) {
                    const body: cc.RigidBody = tiled.node.addComponent(cc.RigidBody);
                    const collider: cc.PhysicsBoxCollider = tiled.node.addComponent(cc.PhysicsBoxCollider);
                    tiled.node.group = 'default';
                    body.type = cc.RigidBodyType.Static;
                    collider.offset = cc.v2(tiledSize.width / 2, tiledSize.height / 2);
                    collider.size = tiledSize;
                    collider.apply();
                }
            }
        }
    }
}
