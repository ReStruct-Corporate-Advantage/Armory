/**
 *  Folder Type class
 */
class FolderType {
    private ROOT_FOLDER_NAME: string;
    private DISPLAY: string;

    constructor(rootFolderName: string, display?: string) {
        this.ROOT_FOLDER_NAME = rootFolderName;
        this.DISPLAY = display;
    }
}

/**
 * Folder Types
 */
export const BREAKDOWN = new FolderType('BREAKDOWN', 'Breakdown');
export const FILTER = new FolderType('FILTER', 'Filter');
export const REPORT = new FolderType('COLUMN SET', 'Column Set');
export const RETURN_REPORT = new FolderType('COLUMN SET', 'Column Set');
export const CHART_REPORT = new FolderType('COLUMN SET', 'Column Set');
export const RISK_REPORT = new FolderType('COLUMN SET', 'Risk Column Set');
export const EXPOST_REPORT = new FolderType('COLUMN SET', 'Column Set');
export const CUSTOM_SEC = new FolderType('FILTER', 'Filter');
export const FAC_BKD = new FolderType('FACTOR BREAKDOWN', 'Factor Breakdown');
export const FACT_CUSTOM_SEC = new FolderType('FACTOR CUSTOM SECTOR', 'Factor Custom Sector');
export const SECT_CONSTR_BKD = new FolderType('CONSTRAINT BREAKDOWN');
export const MULTI_REPORT = new FolderType('COLUMN SET', 'Column Set');
export const LT_FILTER_RULES = new FolderType('LOOK-THROUGH LOGIC RULE', 'Look-through Logic Rules');
