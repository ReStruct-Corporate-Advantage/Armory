/**
 * loading message info model
 */
export class LoadingMessageInfo {
    message: string;   // message to be shown with the spinner
    enableClickOnBackground: boolean;   // set to true will allow to click in the background when spinner is on

    /**
     * model constructor
     * optionally taken json to deserialize
     */
    constructor(data?: any) {
        if (data) {
            this.deserialize(data);
        }
    }

    /**
     * deserialize logic for the model
     */
    deserialize(data?: any) {
        if (!data) {
            return;
        }

        if (data.message) {
            this.message = data.message;
        }
        if (data.enableClickOnBackground) {
            this.enableClickOnBackground = data.enableClickOnBackground;
        }
    }
}
