import {LoadingMessageInfo} from '@models/loading-message-info.model';

/**
 * model for LoadingMessage
 */
export class LoadingMessage {
    key: string;
    messageInfo: LoadingMessageInfo;

    constructor(key?: string, messageInfo?: LoadingMessageInfo) {
        this.key = key;
        this.messageInfo = new LoadingMessageInfo({
            message: messageInfo.message,
            enableClickOnBackground: messageInfo.enableClickOnBackground
        });
    }
}
