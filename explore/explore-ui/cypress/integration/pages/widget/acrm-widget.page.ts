import {WidgetPage} from './widget.page';
import {CheckboxAction, CheckboxIdentifierType, checkboxPage} from '../aux-components/checkbox.page';
import {radioPage} from '../aux-components/radio.page';
import {tabBarPage} from '../aux-components/tab-bar.page';

export class AcrmWidgetPage extends WidgetPage {
    clickBaseCheckbox(actionType: CheckboxAction): void {
        checkboxPage.scrollAndClickAuxCheckbox(actionType, 'baseScenarioCheckbox', CheckboxIdentifierType.ID);
    }

    clickStressScenarioCheckbox(actionType: CheckboxAction): void {
        checkboxPage.scrollAndClickAuxCheckbox(actionType, 'stressScenarioCheckbox', CheckboxIdentifierType.ID);
    }

    /**
     * Select Horizontal radio
     */
    selectPercentileRangeRadio(percentileRange: string): void {
        radioPage.getAuxRadio(percentileRange)
            .scrollIntoView()
            .then(() => {
                radioPage.clickAuxRadio(percentileRange);
            });
    }

    clickAcrmWidgetTab(tabLabel: AcrmWidgetTabLabel): void {
        tabBarPage.clickAuxTab(tabLabel);
    }
}

export const acrmWidgetPage = new AcrmWidgetPage();

export enum AcrmWidgetTabLabel {
    PROJECTED_NAV = 'Projected NAV',
    PROJECTED_CALLS = 'Projected Calls',
    PROJECTED_DISTRIBUTIONS = 'Projected Distributions',
    PROJECTED_J_CURVE = 'Projected J-Curve',
    STATISTICS = 'Statistics'
}
