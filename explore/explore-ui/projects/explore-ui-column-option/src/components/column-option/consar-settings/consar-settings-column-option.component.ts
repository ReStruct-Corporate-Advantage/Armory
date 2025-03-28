import {Component} from '@angular/core';
import {has, isEqual, isNil, map} from 'lodash';
import {AuxRadioInterface, AuxRadioGroupChangedDetailInterface, AuxNumericStepperValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ConsarSettingsColumnOption} from '../../../models/column-option/consar-settings-column-option.model';
import {ConsarScenarioTypeUtils} from '../../../enums/consar-scenario-type.enum';
import {BaseColumnOptionComponent} from '../base-column-option.component';

/**
 * Component for the consar settings column option.
 * It will be dynamically created in the container object of column-option component.
 */
@Component({
    selector: 'explore-consar-settings-column-option',
    templateUrl: './consar-settings-column-option.component.html',
    styleUrls: ['./consar-settings-column-option.component.scss']
})
export class ConsarSettingsColumnOptionComponent extends BaseColumnOptionComponent<ConsarSettingsColumnOption> {
    static readonly OPTION_KEY = ConsarSettingsColumnOption.CONFIG_TYPE;

    /** Scenario types */
    scenarioTypes: AuxRadioInterface[];

    private optionAttributes: Map<string, boolean>;

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return ConsarSettingsColumnOption.CONFIG_TYPE;
    }

    /**
     * Init the component.
     */
    protected initializeComponent(): void {
        super.initializeComponent();

        this.optionAttributes = ConsarSettingsColumnOption.options(this.option);
        this.initializeScenarioTypes();
    }

    /**
     * Initialize scenario types
     */
    private initializeScenarioTypes(): void {
        this.scenarioTypes = map(ConsarScenarioTypeUtils.values(), (scenarioType) => {
            return {
                eventData: scenarioType,
                label: ConsarScenarioTypeUtils.displayName(scenarioType),
                checked: isEqual(scenarioType, this.optionValue.scenarioType)
            };
        });
    }

    /**
     * Show scenario type
     */
    showScenarioType(): boolean {
        return this.showOption(ConsarSettingsColumnOption.SCENARIO_TYPE);
    }

    /**
     * Show confidence level
     */
    showConfidenceLevel(): boolean {
        return this.showOption(ConsarSettingsColumnOption.CONFIDENCE_LEVEL);
    }

    /**
     * Show history
     */
    showHistory(): boolean {
        return this.showOption(ConsarSettingsColumnOption.HISTORY);
    }

    private showOption(key: string): boolean {
        if (isNil(this.optionAttributes)) {
            return false;
        }

        return this.optionAttributes.get(key);
    }

    /**
     * On scenario type option changed
     * @param event custom event
     */
    onScenarioTypeOptionChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        if (has(event.detail, 'value')) {
            this.optionValue.scenarioType = event.detail.value.eventData;
        }
    }

    /**
     * On confidence level changed
     * @param event custom event
     */
    onConfidenceLevelChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        this.optionValue.confidenceLevel = Number(event.detail.value);
    }

    /**
     * On history changed
     * @param event custom event
     */
    onHistoryChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>): void {
        this.optionValue.history = Number(event.detail.value);
    }
}
