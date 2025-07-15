export class VisualIndicationChangedEvent extends Event{
    #visualIndication:string;

    constructor(visualIndication:string){
        super("visualChanged");
        this.#visualIndication=visualIndication
    }

    getvisualIndication(){
        return this.#visualIndication;
    }
}