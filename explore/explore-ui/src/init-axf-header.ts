import {isElectron} from '@blk/acw-message-bus';
import {WebHeaderOptions} from '@blk/aladdin-header';
import {CommonUtils} from '@blk/explore-ui-core';
import {
    AXFHeaderMenuOption,
    LAUNCH_ABOUT_EXPLORE_HEADER_MENU,
    LAUNCH_EXPLORE_FAQS_HEADER_MENU,
    SEMANTIC_SEARCH_EXPLORE_HEADER_MENU
} from '@enums/axf-header.enum';
import {ExploreConstants} from '@constants/explore.constants';
import {URLConstants} from '@constants/url.constants';


export const initAXFHeader = (): void => {
    if (isElectron) {
        return;
    }

    // Dynamically importing AXF WebHeader
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const {WebHeader} = require('@blk/aladdin-header/web');

    try {
        new WebHeader({
            appName: ExploreConstants.EXPLORE,
            aladdinHelpPath: '/apps/aladdinhelp/resources/?appName=Explore&sequencesBaseUrl=/apps/explore/assets/data/&issuesBaseUrl=/apps/explore/assets/data/',
            secondaryEnv: getSecondaryEnv(),
            hasCustomPreferences: true,
            persistThemePreference: true,
            customHelpLinks: [
                // Update Visibility after checking access
                createSubMenu(LAUNCH_EXPLORE_FAQS_HEADER_MENU),
                createSubMenu(LAUNCH_ABOUT_EXPLORE_HEADER_MENU)
            ],
            menu: getCustomMenu(),
            globalUtilityButtonOptions: getGlobalUtilityButtonOptions(),
            aladdinCopilotOptions: {
                enabled: true,
                // Update Visibility after checking access
                visible: false
            },
            accountOptions: {
                enabled: true
            }
        } as WebHeaderOptions);
    } catch (err) {
        console.error('[Error] Unable to initialize AXF Web Header:', err);
    }
};

export const getSecondaryEnv = (): string => {
    if (CommonUtils.isExploreBeta()) {
        return ExploreConstants.BETA;
    } else if (CommonUtils.isExploreGamma()) {
        return ExploreConstants.GAMMA;
    } else {
        return null;
    }
};

/**
 * Create AXF sub menu
 */
export const createSubMenu = (menuOption: AXFHeaderMenuOption, visible = true): { label: string, enabled: boolean, visible: boolean, customProp: {id: string} } => {
    return {label: menuOption.DISPLAY, enabled: true, visible, customProp: {id: menuOption.ID}};
};

export const getCustomMenu = () => {
    if (CommonUtils.getURLParam(URLConstants.SHOW_BETA_FEATURES) === 'true' && (CommonUtils.isLocalHost() || CommonUtils.isExploreBeta())) {
        return [
            {
                label: 'Beta Features',
                enabled: true,
                visible: true,
                customProp: {id: 'BETA_FEATURES'},
                submenu: [
                    createSubMenu(SEMANTIC_SEARCH_EXPLORE_HEADER_MENU)
                ]
            }
        ];
    }
    return [];
};

export const getGlobalUtilityButtonOptions = () => {

    return {
        globalUtilityButtons: [
            {
                type: 'overlay',
                label: 'Job Scheduler',
                iconSVG: '<svg width="1rem" height="1rem" viewBox="0 0 16 16"><path d="M16 1.03V8.03H14V4H2V8.02H0V1.03H2.99V0H5V1.03H11V0H13V1.03H16ZM14 14.09H2V11H0V16H16V11H14V14.09ZM9 13V8.82L10.15 9.97L11.56 8.56L8 5L4.44 8.56L5.85 9.97L7 8.82V13H9Z" fill="black"></path></svg>',
                ariaLabel: 'Job Scheduler'
            }
        ]
    };

};
