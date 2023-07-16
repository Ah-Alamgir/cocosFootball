import { _decorator, Component, Node , Vec2,v2, RigidBody, Prefab, instantiate, RigidBody2D, EventTouch, Camera, Canvas, UITransform, Vec3, } from 'cc';
const { ccclass, property } = _decorator;



@ccclass
export default class BubbleShooter extends Component {
    @property(Prefab)
    bubblePrefab: Prefab = null;

    @property(Node)
    bubbleLayer: Node = null;

    @property(Node)
    cannon: Node = null;




    @property(Number)
    bubbleSpeed: number = 0;

    @property(Canvas)
    canvas: Canvas = null;
                   

    private _touchPos: Vec2 = null;

    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch) {
        const touchPos = event.getLocation();

        const worldPos = this.canvas.node.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(touchPos.x, touchPos.y,0));

        
        
        const direction = worldPos.subtract(this.cannon.getComponent(UITransform).convertToWorldSpaceAR(this.cannon.position));
        var vect2Direction = new Vec2(direction.x, direction.y);
        const angle = vect2Direction.signAngle(v2(1, 0));
        this.cannon.angle = angle / Math.PI * 180;
        this._touchPos = new Vec2(worldPos.x, worldPos.y);
    }

    onTouchMove(event: EventTouch) {
        const touchPos = event.getLocation();
        const worldPos = this.canvas.node.getComponent(UITransform).convertToWorldSpaceAR(new Vec3(touchPos.x, touchPos.y,0));
        const direction = worldPos.subtract(this.cannon.getComponent(UITransform).convertToWorldSpaceAR(this.cannon.position));
        var vect2Direction = new Vec2(direction.x, direction.y);
        const angle = vect2Direction.signAngle(v2(1, 0));
        this.cannon.angle = angle / Math.PI * 180;
        this._touchPos = new Vec2(worldPos.x, worldPos.y);
    }

    onTouchEnd(event: EventTouch) {
        if (this.bubblePrefab) {
            const bubbleNode = instantiate(this.bubblePrefab);
            bubbleNode.parent = this.bubbleLayer;
            bubbleNode.position = this.cannon.position;
            console.log(bubbleNode.position)
            const direction = v2(this._touchPos.x - this.cannon.position.x, this._touchPos.y - this.cannon.position.y);
            bubbleNode.getComponent(RigidBody2D).linearVelocity = direction.normalize().multiplyScalar(this.bubbleSpeed);
        }
    }
}



