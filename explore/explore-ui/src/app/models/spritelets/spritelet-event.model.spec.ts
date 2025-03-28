import {SpriteletEvent} from '@models/spritelets/spritelet-event.model';

describe('SpriteletEvent tests', function () {

    /**
     * Test SpriteleEvent initialization
     */
    it('SpriteleEvent initialization', (function () {
        const params = {
            node: null,
            api: null,
            defaultItems: undefined,
            column: null,
            value: null,
            columnApi:  null,
            context: null
        };
        const spriteletEvent = new SpriteletEvent('ACTION_NAME', params);
        expect(spriteletEvent.actionName).toBe('ACTION_NAME');
        expect(spriteletEvent.params).toBeDefined();
    }));
});
