import { _decorator, Animation, CircleCollider2D, Collider, Collider2D, Component,  Contact2DType,  EventMouse,  Input, input, IPhysics2DContact, Node,  Quat, RigidBody2D, UITransform, v2, v3,  Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('trying')
export class trying extends Component {

    // attach this script to ball node which you want to shoot
    
    @property(Node)
    public ball: Node = null;
    @property(Node)
    public player:Node = null;



    public speed = 100; // the speed of the ball





    start() {
        input.on(Input.EventType.MOUSE_DOWN,this.getangle, this );
        

        this.ball.getComponent(Collider2D).on(Contact2DType.BEGIN_CONTACT, this.onColide, this )

    }


    onColide(selfColider: Collider2D, otherColider: Collider2D, contant: IPhysics2DContact | null){
       if(otherColider.node.name == 'player'){
        this.ball.getComponent(RigidBody2D).sleep();
        console.log('not goal');
       }else if(otherColider.node.name == 'goal'){
            console.log('goal');
            
            this.resetBall();
       }
    }












    public angle;
    public mousePos: Vec3=  null;
    public angleToradian;
    public canReset: boolean = false;

    

    getangle(event: EventMouse){
        this.player.getComponent(Animation).stop()
        this.mousePos = this.ball.getComponent(UITransform).convertToNodeSpaceAR(v3(event.getUILocationX(), event.getUILocationY(),0))
        this.angle = (360+Math.round(180*Math.atan2(this.mousePos.y, this.mousePos.x)/Math.PI))%360;
        console.log(this.angle)



        let radian = this.angle * Math.PI / 180;
        // Calculate the horizontal and vertical components of the velocity
        let vx = this.speed * Math.cos(radian);
        let vy = this.speed * Math.sin(radian);
        // Apply an impulse force to the rigidbody of the ball
        this.ball.getComponent(RigidBody2D).linearVelocity = v2(vx,vy);
        this.canReset = true;

        setTimeout(() => {
            this.resetBall();
        },3000);
        
    
        
}


resetBall(){
    if( this.canReset){
        this.ball.setRotation(new Quat(0,0,0,0))
        this.ball.setPosition(0,-333)
        this.ball.getComponent(RigidBody2D).sleep(); 
        this.canReset = false;
    }
      
}




}

