/**
 * Explore Dialog Param Model used for aux-dialog
 */
export class ExploreDialogParam {
    type: string;
    header: string;
    message: string;
    primaryButtonLabel?: string;
    secondaryButtonLabel?: string;
    dialogCallBack1?: any;
    dialogCallBack2?: any;
    dialogCallBackArgs?: any;

    /**
     * constructor
     */
    constructor(type: string, header: string, message: string, primaryButtonLabel?: string, secondaryButtonLabel?: string, dialogCallBack1?: any, dialogCallBack2?: any, dialogCallBackArgs?: any) {
        // type can be 'alert', 'alert-with-options', or 'prompt'
        this.type = type;
        this.header = header;
        this.message = message;

        // left side of the button default being 'Submit'
        if (primaryButtonLabel) {
            this.primaryButtonLabel = primaryButtonLabel;
        }

        // right side button default being 'Cancel' ( doesn't exist on type 'alert')
        if (secondaryButtonLabel) {
            this.secondaryButtonLabel = secondaryButtonLabel;
        }

        // optional call back on primary button if it will
        if (dialogCallBack1) {
            this.dialogCallBack1 = dialogCallBack1;
        }

        // optional second call back
        if (dialogCallBack2) {
            this.dialogCallBack2 = dialogCallBack2;
        }

        // optional call back args
        if (dialogCallBackArgs) {
            this.dialogCallBackArgs = dialogCallBackArgs;
        }
    }
}
