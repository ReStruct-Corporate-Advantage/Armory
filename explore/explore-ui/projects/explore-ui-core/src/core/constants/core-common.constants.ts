export class CoreCommonConstants {
    static readonly EMPTY_STRING = '';
    static readonly COMMA_SEPARATOR = ',';
    static readonly UNDERSCORE = '_';
    static readonly SINGLE_SPACE = ' ';
    static readonly TODAY_OVERRIDE = 'todayOverride';

    static readonly BUTTON_TEXT = {
        'OK': 'OK',
        'CANCEL': 'Cancel',
        'APPLY': 'Apply',
        'CLOSE': 'Close',
        'APPLY_AND_CLOSE': 'Apply And Close',
        'SAVE': 'Save',
        'SAVE_AS': 'Save As',
        'CONTINUE': 'Continue',
        'DELETE': 'Delete',
        'REMOVE': 'Remove',
        'ADD': 'Add',
        'BROWSE': 'Browse',
        'LOAD': 'Load',
        'SUBMIT': 'Submit',
        'RESET': 'Reset',
        'COMPARE': 'Compare',
        'PASTE_WIDGET': 'Paste Widget ...',
        'COPY_WIDGET': 'Copy Widget',
        'DONE': 'Done',
        'COPY': 'Copy',
        'INFO': 'Info',
        'USE_ONCE': 'Use Once',
        'RESTORE_DEFAULT': 'Restore To Default',
        'COPY_URL': 'Copy URL'
    };

    static readonly BASIS_POINT = 'Basis Point (bp)';
    static readonly PERCENT = 'Percent (%)';
    static readonly THOUSANDS = 'Thousands (m)';
    static readonly MILLIONS = 'Millions (mm)';
    static readonly BILLIONS = 'Billions (mmm)';

    static readonly M = 'm';
    static readonly MM = 'mm';
    static readonly MMM = 'mmm';

    static readonly ORIGINAL = 'original';

    static readonly SETTINGS_HIERARCHY_TYPE = {
        ORG_DEFAULT: 'Org Default',
        PORT_DEFAULT: 'Port Default',
        PORTFOLIO: 'Portfolio',
        WIDGET: 'Widget',
        COLUMN: 'Column'
    };

    static readonly SETTINGS_HIERARCHY_DISPLAY_NAME = {
        [this.SETTINGS_HIERARCHY_TYPE.ORG_DEFAULT]: 'Organization (Default)',
        [this.SETTINGS_HIERARCHY_TYPE.PORT_DEFAULT]: 'Portfolio (Default)',
        [this.SETTINGS_HIERARCHY_TYPE.PORTFOLIO]: 'Portfolio (User Selected)',
        [this.SETTINGS_HIERARCHY_TYPE.WIDGET]: 'Widget (User Selected)',
        [this.SETTINGS_HIERARCHY_TYPE.COLUMN]: 'Column (User Selected)'
    };

    static readonly COLUMN_ORDER_IN_SEARCH_RESULTS = 'numericalColumnOrder';
}
