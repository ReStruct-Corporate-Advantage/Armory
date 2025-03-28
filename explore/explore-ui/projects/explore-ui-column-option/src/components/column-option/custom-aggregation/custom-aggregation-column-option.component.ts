import {Component, EventEmitter, Output} from '@angular/core';
import {CustomAggregationColumnOption} from '../../../models/column-option/custom-aggregation-column-option.model';
import {AuxRadioInterface, AuxSelectSelectionChangedDetailInterface, AuxNumericStepperValueChangedDetailInterface, AuxSelectOption, AuxCheckboxChangedDetailInterface, AuxButtonTypeEnum} from '@blk/aladdin-angular-components';
import {SubtotallerConstants} from '../../../constants';
import {ColumnOptionAttribute, ColumnOptionAttributeValue, CommonUtils, CoreDefinitionStore, TokenConstants} from '@blk/explore-ui-core';
import {ColumnOptionUtils} from '../../../utils';
import {BaseColumnOptionComponent} from '../base-column-option.component';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {UseType} from '@blk/explore-ui-core';

@Component({
    selector: 'explore-custom-aggregation-column-option',
    templateUrl: './custom-aggregation-column-option.component.html',
    styleUrls: ['./custom-aggregation-column-option.component.scss']
})
/**
 * Column option component for custom aggregation column option
 */
export class CustomAggregationColumnOptionComponent extends BaseColumnOptionComponent<CustomAggregationColumnOption> {
    /**
     * Enum for the aux button type
     */
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;

    /**
     * Label for the scenario dropdown
     */
    public readonly SCENARIO_HELPER_TEXT: string = 'Aggregation Formulas';

    /**
     * URL to learn more about commitment risk scenarios (temporary link)
     */ 
    static readonly COMMITMENT_RISK_SCENARIO_LEARN_MORE_URL = '/acs/literature/aladdin-publication/acrm-multiperiod-scenarios.pdf';

    public static OPTION_KEY = 'customAggregation';

    public static EXCLUDE_VALUES_LABEL = 'Exclude values outside limits';

    public static CAP_VALUES_LABEL = 'Map values below/above limits to min/max';

    @Output() aggregationOptionUpdated = new EventEmitter<void>();

    customAggregationListAttribute: ColumnOptionAttribute;
    displayDataForCustomAggregationList: ExploreSelectOptionGroup[];

    minValueAttribute: ColumnOptionAttribute;
    maxValueAttribute: ColumnOptionAttribute;

    excludeOrCapAttribute: ColumnOptionAttribute;
    excludeCapOptions: AuxRadioInterface[];

    weightTypeAttribute: ColumnOptionAttribute;
    displayDataForWeightType: ExploreSelectOptionGroup[];

    colWeightTypeAttribute: ColumnOptionAttribute;
    displayDataForColWeightType: ExploreSelectOptionGroup[];

    /**
     * BaseColumnOptionComponent.initializeComponent()
     */
    protected initializeComponent(): void {
        // Grab out the settings for each part of the display.
        this.option.columnOptionAttributes.forEach((columnOptionAttribute: ColumnOptionAttribute) => {
            switch (columnOptionAttribute.key) {
                case CustomAggregationColumnOption.SUBTOTAL_TYPE:
                    this.customAggregationListAttribute = columnOptionAttribute;
                    this.setupDisplayDataForCustomAggregationListAttribute();
                    break;
                case CustomAggregationColumnOption.MIN_AGG_VALUE:
                    this.minValueAttribute = columnOptionAttribute;
                    break;
                case CustomAggregationColumnOption.MAX_AGG_VALUE:
                    this.maxValueAttribute = columnOptionAttribute;
                    break;
                case CustomAggregationColumnOption.EXCLUDE_OR_CAP:
                    this.excludeOrCapAttribute = columnOptionAttribute;
                    this.setupDisplayDataForExcludeOrCapAttribute();
                    break;
                case CustomAggregationColumnOption.WEIGHT_TYPE:
                    this.weightTypeAttribute = columnOptionAttribute;
                    this.setupDisplayDataForWeightTypeAttribute();
                    break;
                case CustomAggregationColumnOption.COL_WEIGHT_TYPE:
                    this.colWeightTypeAttribute = columnOptionAttribute;
                    this.setupDisplayDataForColWeighTypeAttribute();
                    break;
            }
        });
    }

    /**
     * Setup display data for customAggregationListAttribute select box
     */
    setupDisplayDataForCustomAggregationListAttribute() {
        this.displayDataForCustomAggregationList = [new ExploreSelectOptionGroup()];
        ColumnOptionUtils.populateFromColumnOptionAttribute(this.displayDataForCustomAggregationList[0], this.customAggregationListAttribute, this.optionValue.subtotalType);
    }


    /**
     * Setup display data for ExcludeCap radio group
     */
    setupDisplayDataForExcludeOrCapAttribute() {
        this.excludeCapOptions = [];
        this.excludeOrCapAttribute.values.forEach((colOptionAttributeValue: ColumnOptionAttributeValue) => {
            this.excludeCapOptions.push({
                label: colOptionAttributeValue.value ? CustomAggregationColumnOptionComponent.EXCLUDE_VALUES_LABEL : CustomAggregationColumnOptionComponent.CAP_VALUES_LABEL,
                eventData: colOptionAttributeValue.value,
                checked: colOptionAttributeValue.value === this.optionValue.excludeOrCap
            });
        });
    }

    /**
     * Setup display data for Weight type select box
     */
    setupDisplayDataForWeightTypeAttribute() {
        this.displayDataForWeightType = [new ExploreSelectOptionGroup()];
        ColumnOptionUtils.populateFromColumnOptionAttribute(this.displayDataForWeightType[0], this.weightTypeAttribute, this.optionValue.weightType);
        if (this.enableColumnWeight()) {
            // Filter out the "All" option
            this.displayDataForWeightType[0].values = this.displayDataForWeightType[0].values.filter((value: ExploreSelectOption) => value.value !== UseType.ALL);
        }
    }

    /**
     * Setup display data for Col Weight Type select box
     */
    setupDisplayDataForColWeighTypeAttribute() {
        this.displayDataForColWeightType = [new ExploreSelectOptionGroup()];
        ColumnOptionUtils.populateFromColumnOptionAttribute(this.displayDataForColWeightType[0], this.colWeightTypeAttribute, this.optionValue.colWeightType);
    }

    /**
     * Method called on custom aggregation type change
     */
    onCustomAggregationChange($event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.optionValue.subtotalType = Number(($event.detail.value as AuxSelectOption).value);
        this.setupDisplayDataForWeightTypeAttribute();
        this.aggregationOptionUpdated.emit();
    }

    /**
     * Method called on min value changed
     */
    onMinAggValueChanged($event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        this.optionValue.minAggValue = Number($event.detail.value);
    }

    /**
     * Method called on max value changed
     */
    onMaxAggValueChanged($event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        this.optionValue.maxAggValue = Number($event.detail.value);
    }

    /**
     * Callback to update the ExcludeCapSetting with what the user selected
     */
    onExcludeCapRadioGroupChanged(option: any): void {
        this.optionValue.excludeOrCap = option.eventData;
    }

    /**
     * Method called on weight type value changed
     */
    onWeightTypeChange($event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.optionValue.weightType = ($event.detail.value as AuxSelectOption).value;
        this.aggregationOptionUpdated.emit();
    }

    /**
     * Method called on col weight type value changed
     */
    onColWeightTypeChange($event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.optionValue.colWeightType = ($event.detail.value as AuxSelectOption).value;
        this.aggregationOptionUpdated.emit();
    }

    /**
     * Handler to update the exclude null values.
     */
    onExcludeNullValuesChange(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.optionValue.excludeNullValues = event.detail.value.checked;
        this.aggregationOptionUpdated.emit();
    }

    /**
     * Indicates whether to enable column weight attribute.
     * @returns True if column weight is to be enabled; false otherwise.
     */
    enableColumnWeight (): boolean {
        const aggType = this.optionValue.subtotalType;
        return aggType === SubtotallerConstants.WEIGHTED_AVERAGE.id ||
            aggType === SubtotallerConstants.WEIGHTED_AVERAGE_HARMONIC_MEAN.id ||
            aggType === SubtotallerConstants.SCORE_MINUS.id;
    }

    /**
     * @returns True if None subtotaller is selected.
     */
    isNoneSubtotallerSelected (): boolean {
        return this.optionValue.subtotalType === Number(SubtotallerConstants.NO_SUBTOTALLER.id);
    }

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return CustomAggregationColumnOption.CONFIG_TYPE;
    }

    /**
     * Opens link to documentation about scenarios
     */
    openScenariosDocumentationLink(): void {
        // use path if set in token, otherwise default
        const path = CoreDefinitionStore.tokens[TokenConstants.EXPLORE_ACRM_SCENARIO_DOC_URL] || CustomAggregationColumnOptionComponent.COMMITMENT_RISK_SCENARIO_LEARN_MORE_URL;
        // example: https://spc.blackrock.com/acs/literature/aladdin-publication/acrm-multiperiod-scenarios.pdf
        const url = CommonUtils.getURLOrigin() + path;
        window.open(url, '_blank');
    }
}
