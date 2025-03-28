import {Component} from '@angular/core';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {ColumnOptionConstants, CustomCalculationConstants} from '../../../constants';
import {CustomCalculationMeasureNodeColumnOption} from '../../../models/column-option/custom-calculation-measure-node-column-option.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';

/**
 * Column option component for formula settings
 */
@Component({
    selector: 'explore-custom-calculation-measure-node-column-option',
    templateUrl: './custom-calculation-measure-node-column-option.component.html'
})
export class CustomCalculationMeasureNodeColumnOptionComponent extends BaseColumnOptionComponent<CustomCalculationMeasureNodeColumnOption> {
    static OPTION_KEY = 'customCalculationNodeType';

    /**
     * Get measures nodes Options for aux-select
     */
    measureNodes: ExploreSelectOptionGroup[] = [];
    optionAttributesTitle: string;

    /**
     * Performs the required initialization.
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        let measureOptions: string[];
        if (this.option['isPgsCustomCalculation']) {
            measureOptions = CustomCalculationConstants.PGS_MEASURE_NODES;
        } else {
            // If aggregation is restricted then node value should only be picked from security level.
            const isSecurityLevelValue = this.restrictedColumnOptions?.sections.includes(ColumnOptionConstants.AGGREGATION);
            measureOptions = isSecurityLevelValue ? CustomCalculationConstants.SINGLE_MEASURE_NODES : CustomCalculationConstants.MEASURE_NODES;
        }
        this.measureNodes = [new ExploreSelectOptionGroup(measureOptions
            .map(measureNodeName => new ExploreSelectOption(CustomCalculationMeasureNodeColumnOption.getDisplayNodeName(measureNodeName), measureNodeName)))];

        this.optionAttributesTitle = this.option.columnOptionAttributes[0].title.replace(':', '');
        this.measureNodes[0].values.filter(measureNode => measureNode.value === this.optionValue.nodeTypeValue)[0].isSelected = true;
    }

    /**
     * Gets the config type that this object is configuring.
     */
    protected getOptionValueConfigType(): string {
        return CustomCalculationMeasureNodeColumnOptionComponent.OPTION_KEY;
    }

    /**
     * Set measure Node Type i.e. TOTAL, SECURITY, PARENT, IMMEDIATE PARENT
     */
    setMeasureNodeType(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>) {
        this.optionValue.nodeTypeValue = (event.detail.value as AuxSelectOption).value;
    }
}
