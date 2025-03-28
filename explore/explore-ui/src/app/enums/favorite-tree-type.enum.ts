/**
 * Favorite Tree Type class
 */
class FavoriteTreeType {
    private TYPE: string;
    private LABEL: string;
    private PLACEHOLDER: string;
    private DEFAULT_MAX: number;
    private ROOT_FOLDER_NAME: string;
    private DISPLAY: string;
    private DISPLAY_TREE: string;

    constructor(type: string, label: string, placeHolder: string, defaultMax: number, rootFolderName: string, display?: string, displayTree?: string) {
        this.TYPE = type;
        this.LABEL = label;
        this.PLACEHOLDER = placeHolder;
        this.DEFAULT_MAX = defaultMax;
        this.ROOT_FOLDER_NAME = rootFolderName;
        this.DISPLAY = display;
        this.DISPLAY_TREE = displayTree;
    }
}

/**
 * Favorite Tree Types
 */
export const LAYOUT = new FavoriteTreeType('LAYOUT', 'Browse Layouts:', 'Select Layout', 5, 'REPORT', 'Reports');
export const WORKSPACE = new FavoriteTreeType('WORKSPACE', 'Browse Workspace:', 'Select a Workspace', 1, 'WORKSPACE', 'Workspace', 'Enterprise Tree');
export const BATCH_REPORT = new FavoriteTreeType('BATCH_REPORT', 'Browse Batch Reports:', 'Select Batch Report', 1, 'BATCH REPORT');
export const COMP_RULES = new FavoriteTreeType('COMP_RULES', 'Browse Rules', 'Select a Rule', 1, 'COMPOSITION RULE', 'Composition Rule');
export const PORT_WITH_RULES = new FavoriteTreeType('WHATIF_RULES', 'Portfolio with Rules/Filter', 'Select a Portfolio with Rules', 1, 'RULE BASED WHAT IF PORTFOLIO', 'What If Portfolios');
export const WHATIF_RULES = new FavoriteTreeType('WHATIF_RULES', 'Portfolio with Rules/Filter', 'Select a Portfolio with Rules', 1, 'RULE BASED WHAT IF PORTFOLIO', 'What If Portfolios');
export const PORT_WITH_POSITIONS = new FavoriteTreeType('WHATIF_POS', 'Position Based Portfolio', 'Select a Portfolio', 1, 'POSITION BASED PORTFOLIO');
export const WHATIF_POS = new FavoriteTreeType('WHATIF_POS', 'Position Based Portfolio', 'Select a Portfolio', 1, 'POSITION BASED PORTFOLIO', 'What If Portfolios');
export const WHAT_IF_PORT = new FavoriteTreeType('WHAT_IF_PORT', 'Browse Rules', 'Select a Rule', 1, 'WHAT IF PORTFOLIO', 'What If Portfolios');
export const OPTO_SETTINGS = new FavoriteTreeType('OPTO_SETTINGS', 'Browse Optimization Settings', 'Select Optimization Settings', 1, 'OPTIMIZATION SETTING');
export const COLUMN = new FavoriteTreeType('CUSTOM_CALCULATION', 'Browse Custom Calculation Column:', 'Select Custom Calculation Column', 1, 'CUSTOM CALCULATION', 'Custom Calculation Column');
