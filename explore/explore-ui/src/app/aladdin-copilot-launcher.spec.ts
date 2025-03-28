import {AladdinCopilotLauncher} from './aladdin-copilot-launcher';
import {CommonUtils} from '@blk/explore-ui-core';

describe('AladdinCopilotLauncher', () => {
    it('launchAladdinCopilotDeepLinking test - DEV', () => {
        jest.spyOn(CommonUtils, 'getURLOrigin').mockReturnValue('https://dev.blackrock.com');
        window.open = jest.fn();

        AladdinCopilotLauncher.launchAladdinCopilotDeepLinking();

        const url = 'https://dev.blackrock.com/apps/aladdin-copilot/?';
        expect(window.open).toHaveBeenCalledWith(expect.stringContaining(url), '_blank');
    });

    it('launchAladdinCopilotDeepLinking test - TST', () => {
        jest.spyOn(CommonUtils, 'getURLOrigin').mockReturnValue('https://tst.blackrock.com');
        window.open = jest.fn();

        AladdinCopilotLauncher.launchAladdinCopilotDeepLinking();

        const url = 'https://tst.blackrock.com/apps/aladdin-copilot/?';
        expect(window.open).toHaveBeenCalledWith(expect.stringContaining(url), '_blank');
    });
});
