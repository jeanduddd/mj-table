export class HandChangedEvent extends Event{
    #LeftOrRight:boolean;
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