/**
 * CustomCalcParameters serves to capture data when the user uses custom calc
 */
export class CustomCalcParameters {
    widgetType: string;
    formulaShortcut: string;

    constructor(widgetType: string, formulaShortcut: string) {
        this.widgetType = widgetType;
        this.formulaShortcut = formulaShortcut;
    }
}
