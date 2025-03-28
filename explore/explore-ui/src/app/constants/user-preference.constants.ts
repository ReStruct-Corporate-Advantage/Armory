import {isNil} from 'lodash';

/**
 * All the different user preferences that we have in Explore.
 */
export class UserPreference {
    static readonly DEFAULT_WORKSPACE = new UserPreference('defaultWorkspace');
    static readonly NAVIGATION_DRAWER_OPEN = new UserPreference('navDrawerOpen', 'true');
    static readonly THEME = new UserPreference('theme', 'light');
    static readonly SHOW_WIDGET_PREVIEW = new UserPreference('showWidgetPreview', 'true');
    static readonly EXPORT_EXCEL = new UserPreference('excelExportOptions', null);
    static readonly EXPORT_PDF = new UserPreference('PDFExportOptions', null);
    static readonly API_REQUEST_FORMAT = new UserPreference('APIRequestFormat', null);
    static readonly DISPLAY_FULL_PORTFOLIO_NAME = new UserPreference('displayFullPortName', 'false');
    static readonly RECENT_COLUMNS = new UserPreference('recentColumn', null);
    static readonly  LOCALE = new UserPreference('locale', null);


    /**
     * The name of the preference to save.
     */
    name: string;

    /**
     * The default value the preference will take if the user does not already have something set.
     */
    defaultValue: string;

    /**
     * Flag to indicate that this preference should be saved and preserved across sessions.
     */
    isSticky = true;

    /**
     * These should only be created within this class, so is intentionally private.
     * @param name  The name of the user preference.
     * @param defaultValue Optional default value for the preference if the user has not set it.
     * @param isSticky Optional value to indicate that the preference is saved between sessions.
     */
    private constructor(name: string, defaultValue?: string, isSticky?: boolean) {
        this.name = name;
        this.defaultValue = defaultValue;
        this.isSticky = isNil(isSticky) ? true : isSticky;
    }
}
