//custom event made to indicate when the feedback effect changes
export class FeedbackEffectChangedEvent extends Event{
    //name of the feedback effect
    #feedbackEffect:string;

    constructor(feedbackEffect:string){
        super("feedbackChanged");
        this.#feedbackEffect=feedbackEffect
    }

    getFeedbackEffect(){
        return this.#feedbackEffect;
    }
}