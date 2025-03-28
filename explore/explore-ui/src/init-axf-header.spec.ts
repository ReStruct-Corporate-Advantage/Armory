import {createSubMenu, getSecondaryEnv, initAXFHeader, getCustomMenu, getGlobalUtilityButtonOptions} from './init-axf-header';
import {CommonUtils} from '@blk/explore-ui-core';
import {LAUNCH_EXPLORE_FAQS_HEADER_MENU} from '@enums/axf-header.enum';

describe('initAXFHeader', () => {
    it('should initialize AXF header', () => {
        initAXFHeader();
    });

    it('should get secondary environment', () => {
        jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(true);
        expect(getSecondaryEnv()).toEqual('Beta');
        // spy.calls.reset();
        jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(false);
        jest.spyOn(CommonUtils, 'isExploreGamma').mockReturnValue(true);
        expect(getSecondaryEnv()).toEqual('Gamma');
    });

    it('should create sub menu', () => {
        expect(createSubMenu(LAUNCH_EXPLORE_FAQS_HEADER_MENU)).toEqual({
            label: 'Explore FAQs',
            visible: true,
            enabled: true,
            customProp: {
                id: 'LAUNCH_EXPLORE_FAQS',
            }
        });

    });

    it('should return an empty array when SHOW_BETA_FEATURES is false', () => {
        jest.spyOn(CommonUtils, 'getURLParam').mockReturnValue('false');
        expect(getCustomMenu()).toEqual([]);
    });

    it('should return an empty array when not localhost or ExploreBeta', () => {
        jest.spyOn(CommonUtils, 'getURLParam').mockReturnValue('true');
        jest.spyOn(CommonUtils, 'isLocalHost').mockReturnValue(false);
        jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(false);
        expect(getCustomMenu()).toEqual([]);
    });

    it('should return custom menu when SHOW_BETA_FEATURES is true and isLocalHost is true', () => {
        jest.spyOn(CommonUtils, 'getURLParam').mockReturnValue('true');
        jest.spyOn(CommonUtils, 'isLocalHost').mockReturnValue(true);
        const result = getCustomMenu();
        expect(result).toEqual([{
            label: 'Beta Features',
            enabled: true,
            visible: true,
            customProp: {id: 'BETA_FEATURES'},
            submenu: [
                {
                    label: 'Semantic Search (In Testing)',
                    enabled: true,
                    visible: true,
                    customProp: {id: 'SEMANTIC_SEARCH_EXPLORE'}
                }
            ]
        }]);
    });

    it('should return custom menu when SHOW_BETA_FEATURES is true and isExploreBeta is true', () => {
        jest.spyOn(CommonUtils, 'getURLParam').mockReturnValue('true');
        jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(true);
        const result = getCustomMenu();
        expect(result).toEqual([{
            label: 'Beta Features',
            enabled: true,
            visible: true,
            customProp: {id: 'BETA_FEATURES'},
            submenu: [
                {
                    label: 'Semantic Search (In Testing)',
                    enabled: true,
                    visible: true,
                    customProp: {id: 'SEMANTIC_SEARCH_EXPLORE'}
                }
            ]
        }]);
    });

    describe('getGlobalUtilityButtonOptions', () => {
        it('should return global utility buttons when SHOW_BETA_FEATURES is true and isLocalHost is true', () => {
            jest.spyOn(CommonUtils, 'isLocalHost').mockReturnValue(true);
            const result = getGlobalUtilityButtonOptions();
            expect(result).toEqual({
                globalUtilityButtons: [
                    {
                        type: 'overlay',
                        label: 'Job Scheduler',
                        iconSVG: '<svg width="1rem" height="1rem" viewBox="0 0 16 16"><path d="M16 1.03V8.03H14V4H2V8.02H0V1.03H2.99V0H5V1.03H11V0H13V1.03H16ZM14 14.09H2V11H0V16H16V11H14V14.09ZM9 13V8.82L10.15 9.97L11.56 8.56L8 5L4.44 8.56L5.85 9.97L7 8.82V13H9Z" fill="black"></path></svg>',
                        ariaLabel: 'Job Scheduler',
                    }
                ]
            });
        });

        it('should return global utility buttons when SHOW_BETA_FEATURES is true and isExploreBeta is true', () => {

            jest.spyOn(CommonUtils, 'isExploreBeta').mockReturnValue(true);
            const result = getGlobalUtilityButtonOptions();
            expect(result).toEqual({
                globalUtilityButtons: [
                    {
                        type: 'overlay',
                        label: 'Job Scheduler',
                        iconSVG: '<svg width="1rem" height="1rem" viewBox="0 0 16 16"><path d="M16 1.03V8.03H14V4H2V8.02H0V1.03H2.99V0H5V1.03H11V0H13V1.03H16ZM14 14.09H2V11H0V16H16V11H14V14.09ZM9 13V8.82L10.15 9.97L11.56 8.56L8 5L4.44 8.56L5.85 9.97L7 8.82V13H9Z" fill="black"></path></svg>',
                        ariaLabel: 'Job Scheduler',
                    }
                ]
            });
        });

    });
});
