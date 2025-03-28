import { Injectable } from '@angular/core';
import { BaseChatService, CopilotAppContext, Product, PromptRequestAiEngineEnum, PromptResponse, QueryResult } from '@blk/aladdin-copilot-utils';

@Injectable({
    providedIn: 'root'
})
export class CopilotChatService extends BaseChatService {
    constructor() {
        const appContext: CopilotAppContext = {
            hasHeader: false,
            aiProps: {
                appName: 'EXPLORE',
                aiEngine: PromptRequestAiEngineEnum.AladdinV1,
                contentFilters: {
                    product: [Product.Explore]
                }
            }
        };
        super(appContext, true);
    }

    async promptResponseHandlerCallback(promptResponse: PromptResponse): Promise<QueryResult[]> {
        const baseResult = await super.promptResponseHandlerCallback(promptResponse);

        // Append more content to the response using the convertReactToParcel() method

        return [...baseResult];
    }
}
