/**
 * Input Type class
 */
class InputType {
    private ROOT_FOLDER_NAME: string;
    private DISPLAY: string;

    constructor(rootFolderName: string, display?: string) {
        this.ROOT_FOLDER_NAME = rootFolderName;
        this.DISPLAY = display;
    }
}

/**
 * Input Types
 */
export const BREAKDOWN = new InputType('BREAKDOWN', 'Breakdown');
export const FILTER = new InputType('FILTER', 'Filter');
export const REPORT = new InputType('COLUMN SET', 'Column Set');
export const RETURN_REPORT = new InputType('COLUMN SET', 'Column Set');
export const CHART_REPORT = new InputType('COLUMN SET', 'Column Set');
export const RISK_REPORT = new InputType('COLUMN SET', 'Risk Column Set');
export const EXPOST_REPORT = new InputType('COLUMN SET', 'Column Set');
export const CUSTOM_SEC = new InputType('FILTER', 'Filter');
export const CONSTRAINT_SEC = new InputType('CONSTRAINT SECTOR');
export const FAC_BKD = new InputType('FACTOR BREAKDOWN', 'Factor Breakdown');
export const FACT_CUSTOM_SEC = new InputType('FACTOR CUSTOM SECTOR', 'Factor Custom Sector');
export const SECT_CONSTR_BKD = new InputType('CONSTRAINT BREAKDOWN');
export const MULTI_REPORT = new InputType('COLUMN SET', 'Column Set');
export const COLUMN = new InputType('CUSTOM CALCULATION', 'Custom Calculation');
