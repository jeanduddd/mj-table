//custom event made to indicate when the hand that has to take the ball changes
export class HandChangedEvent extends Event{
    //indicate if the hand that has to take the ball is the left or riht hand, left = true, right = false
    #LeftOrRight:boolean;
    //color of th ball that has to be taken
    #TargetColor:string

    constructor(LeftOrRight:boolean,TargetColor:string){
        super("handChanged");
        this.#LeftOrRight=LeftOrRight
        this.#TargetColor=TargetColor
    }

    getLoR(){
        return this.#LeftOrRight;
    }

    getTargetColor(){
        return this.#TargetColor;
    }
}