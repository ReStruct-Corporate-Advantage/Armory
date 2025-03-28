import {tabBarPage} from '../../../aux-components/tab-bar.page';
import {CheckboxAction, CheckboxIdentifierType, checkboxPage} from '../../../aux-components/checkbox.page';
import {radioPage} from '../../../aux-components/radio.page';
import {selectValueFromAuxSelect} from '../../../sharedElements';

export class FormatTabPage {
    static readonly FORMAT_TAB_LABEL = 'Format';

    /**
     * Select chart type from the dropdown on format tab on the widget settings modal
     * and pass in the selection
     * @param chartType
     */
    selectChartType(chartType: string, columnIndex: number): void {
        selectValueFromAuxSelect('aux-select[id="chartType' + columnIndex + '"]', chartType);
    }

    /**
     * click secondary axis checkbox for the column measure index
     */
    clickSecondaryAxis(columnIndex: number, actionType: CheckboxAction): void {
        checkboxPage.scrollAndClickAuxCheckbox(actionType, 'secondaryAxisCheckbox_' + columnIndex, CheckboxIdentifierType.ID);
    }

    /**
     * Click format tab from the main tabs on the widget settings modal
     */
    clickFormatTab(): void {
        tabBarPage.clickAuxTab(FormatTabPage.FORMAT_TAB_LABEL);
    }

    /**
     * Click baseline checkbox CHECK / UNCHECK
     */
    clickBaselineCheckbox(actionType: CheckboxAction): void {
        checkboxPage.scrollAndClickAuxCheckbox(actionType, ShowLabel.BASELINE, CheckboxIdentifierType.LABEL);
    }

    /**
     * Click grid lines checkbox CHECK / UNCHECK
     */
    clickGridLinesCheckbox(actionType: CheckboxAction): void {
        checkboxPage.scrollAndClickAuxCheckbox(actionType, ShowLabel.GRIDLINES, CheckboxIdentifierType.LABEL);
    }

    /**
     * Select Horizontal radio
     */
    selectHorizontalRadio(): void {
        radioPage.getAuxRadio(OrientationLabel.HORIZONTAL)
            .scrollIntoView()
            .then(() => {
                radioPage.clickAuxRadio(OrientationLabel.HORIZONTAL);
            });
    }

    /**
     * Select Vertical radio
     */
    selectVerticalRadio(): void {
        radioPage.getAuxRadio(OrientationLabel.VERTICAL)
            .scrollIntoView()
            .then(() => {
                radioPage.clickAuxRadio(OrientationLabel.VERTICAL);
            });
    }
}

enum ShowLabel {
    BASELINE = 'Baseline',
    GRIDLINES = 'Grid lines'
}

enum OrientationLabel {
    VERTICAL = 'Vertical',
    HORIZONTAL = 'Horizontal'
}

export enum ChartTypeLabel {
    MARKER = 'Marker',
    BAR = 'Bar',
    LINE = 'Line'
}

export const formatTabPage = new FormatTabPage();
