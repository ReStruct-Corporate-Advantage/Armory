import {tabBarPage} from '../../../aux-components/tab-bar.page';
import {CheckboxAction, CheckboxIdentifierType, checkboxPage} from '../../../aux-components/checkbox.page';
import {textInputPage} from '../../../aux-components/text-input.page';
import {inputMaskPage} from '../../../aux-components/input-mask.page';

class AxisTabPage {
    static readonly AXIS_TAB_LABEL = 'Axis';
    static readonly HIDE_AXIS_TITLE_LABEL = 'Hide axis title';

    private getAxisSettingsSelector = (axisType: AxisType): string => `app-axis-settings[ng-reflect-axis-type="${axisType}"]`;

    /**
     * Click axis tab from the main tabs on the widget settings modal
     */
    clickAxisTab(): void {
        tabBarPage.clickAuxTab(AxisTabPage.AXIS_TAB_LABEL);
    }

    /**
     * Click baseline checkbox CHECK / UNCHECK
     */
    clickHideAxisTitleCheckbox(actionType: CheckboxAction, axisType = AxisType.PRIMARY): void {
        const context = cy.get(this.getAxisSettingsSelector(axisType));
        checkboxPage.scrollAndClickAuxCheckbox(actionType, AxisTabPage.HIDE_AXIS_TITLE_LABEL, CheckboxIdentifierType.LABEL, context);
    }

    typeInAxisOverrideTextInput(input: string, axisType = AxisType.PRIMARY): void {
        this.typeInTextInput(axisType === AxisType.PRIMARY ? AxisOverrideLabel.PRIMARY : AxisOverrideLabel.SECONDARY, input, axisType);
    }

    typeInMinBoundInputMask(input: string, axisType = AxisType.PRIMARY): void {
        this.typeInInputMask(BoundLabel.MIN, input, axisType);
    }

    typeInMaxBoundInputMask(input: string, axisType = AxisType.PRIMARY): void {
        this.typeInInputMask(BoundLabel.MAX, input, axisType);
    }

    private typeInTextInput(label: string, input: string, axisType = AxisType.PRIMARY): void {
        const axisSettingsSelector = this.getAxisSettingsSelector(axisType);
        textInputPage.getAuxTextInput(label, axisSettingsSelector)
            .scrollIntoView()
            .then(() => {
                textInputPage.typeInTextInput(label, input, axisSettingsSelector);
            });
    }

    typeInIntervalBoundInputMask(input: string, axisType = AxisType.PRIMARY): void {
        this.typeInInputMask(BoundLabel.INTERVAL, input, axisType);
    }

    private typeInInputMask(label: string, input: string, axisType = AxisType.PRIMARY): void {
        const axisSettingsSelector = this.getAxisSettingsSelector(axisType);
        inputMaskPage.getAuxInputMask(label, axisSettingsSelector)
            .scrollIntoView()
            .then(() => {
                inputMaskPage.typeInInput(label, input, axisSettingsSelector);
            });
    }
}

enum AxisType {
    PRIMARY = 'PRIMARY',
    SECONDARY = 'SECONDARY',
}

enum AxisOverrideLabel {
    PRIMARY = 'Primary axis override',
    SECONDARY = 'Secondary axis override',
}

enum BoundLabel {
    MIN = 'Minimum',
    MAX = 'Maximum',
    INTERVAL = 'Interval',
}

export const axisTabPage = new AxisTabPage();
