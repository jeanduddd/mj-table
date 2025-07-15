export class FeedbackEffectChangedEvent extends Event{
    #feedbackEffect:string;

    constructor(feedbackEffect:string){
        super("feedbackChanged");
        this.#feedbackEffect=feedbackEffect
    }

    getFeedbackEffect(){
        return this.#feedbackEffect;
    }
}