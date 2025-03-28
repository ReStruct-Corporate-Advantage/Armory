import {CommonUtils} from '@blk/explore-ui-core';
import {encodeLink} from '@blk/acw-deep-links';
import {CopilotAppContext, PromptRequestAiEngineEnum} from '@blk/aladdin-copilot-utils';
import packageInfo from '../../package.json';

/**
 * Responsible for launching Aladdin Copilot
 */
export class AladdinCopilotLauncher {

    /**
     * Launches Aladdin Copilot with deep linking (Copilot knows that it is being launched from Explore)
     */
    static launchAladdinCopilotDeepLinking() {
        const appContext: CopilotAppContext = {
            hasHeader: true,
            displayMessage: {
                primary: `Hi, I'm Aladdin Copilot, your AI-powered assistant. I can help answer questions about how to use Explore.`,
            },
            aiProps: {
                appName: 'EXPLORE',
                appVersion: packageInfo?.version,
                aiEngine: PromptRequestAiEngineEnum.AladdinV1,
            }

        };

        const urlOrigin = CommonUtils.getURLOrigin();
        const deepLink = encodeLink({
            baseURL: `${urlOrigin}/apps/aladdin-copilot/`,
            moduleId: '@blk/aladdin-copilot',
            state: {
                ...appContext
            },
        });

        const url = this.addSlashBeforeQueryParams(deepLink);

        window.open(url, '_blank');
    }

    /**
     * Adds / before ? in the link
     */
    static addSlashBeforeQueryParams(link: string): string {
        const index = link.indexOf('?');
        return (index === -1) ? link : link.substring(0, index) + '/' + link.substring(index);
    }
}
