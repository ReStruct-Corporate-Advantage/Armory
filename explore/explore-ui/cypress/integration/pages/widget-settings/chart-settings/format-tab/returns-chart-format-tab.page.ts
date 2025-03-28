import {CheckboxAction, CheckboxIdentifierType, checkboxPage} from '../../../aux-components/checkbox.page';
import {FormatTabPage} from './format-tab.page';

class ReturnsChartFormatTabPage extends FormatTabPage {

    clickPortCheckbox(actionType: CheckboxAction): void {
        checkboxPage.scrollAndClickAuxCheckbox(actionType, 'Portfolio', CheckboxIdentifierType.LABEL);

    }
    clickBenchCheckbox(actionType: CheckboxAction): void {
        checkboxPage.scrollAndClickAuxCheckbox(actionType, 'Benchmark', CheckboxIdentifierType.LABEL);

    }
    clickActiveCheckbox(actionType: CheckboxAction): void {
        checkboxPage.scrollAndClickAuxCheckbox(actionType, 'Active', CheckboxIdentifierType.LABEL);
    }
    clickPortCumCheckbox(actionType: CheckboxAction): void {
        checkboxPage.scrollAndClickAuxCheckbox(actionType, 'Portfolio cumulative', CheckboxIdentifierType.LABEL);
    }
    clickBenchCumCheckbox(actionType: CheckboxAction): void {
        checkboxPage.scrollAndClickAuxCheckbox(actionType, 'Benchmark cumulative', CheckboxIdentifierType.LABEL);
    }
    clickActiveCumCheckbox(actionType: CheckboxAction): void {
        checkboxPage.scrollAndClickAuxCheckbox(actionType, 'Active cumulative', CheckboxIdentifierType.LABEL);
    }

    clickDataMarkersCheckbox(actionType: CheckboxAction): void {
        checkboxPage.scrollAndClickAuxCheckbox(actionType, 'Data markers', CheckboxIdentifierType.LABEL);
    }
}

export const returnsChartFormatTabPage = new ReturnsChartFormatTabPage();
