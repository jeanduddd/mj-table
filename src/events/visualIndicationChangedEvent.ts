//custom event made to indicate when the visual indication changes
export class VisualIndicationChangedEvent extends Event{
    //name of the visual indication
    #visualIndication:string;

    constructor(visualIndication:string){
        super("visualChanged");
        this.#visualIndication=visualIndication
    }

    getvisualIndication(){
        return this.#visualIndication;
    }
}