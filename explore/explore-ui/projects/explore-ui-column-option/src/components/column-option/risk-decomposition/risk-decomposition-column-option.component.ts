import {Component} from '@angular/core';
import {AuxRadioGroupChangedDetailInterface, AuxRadioInterface} from '@blk/aladdin-angular-components';
import {has, isEqual, map} from 'lodash';
import {RiskDecompositionType} from '../../../enums/risk-decomposition-type.enum';
import {RiskDecompositionColumnOption} from '../../../models/column-option/risk-decomposition-column-option.model';
import {BaseColumnOptionComponent} from '../base-column-option.component';

/**
 * Component for the risk decomposition column options.
 * It will be dynamically created in the container object of column-option component.
 */
@Component({
    selector: 'explore-risk-decomposition-column-option',
    templateUrl: './risk-decomposition-column-option.component.html'
})
export class RiskDecompositionColumnOptionComponent extends BaseColumnOptionComponent<RiskDecompositionColumnOption> {
    static readonly OPTION_KEY = RiskDecompositionColumnOption.CONFIG_TYPE;

    /** Decomposition types */
    decompositionTypes: AuxRadioInterface[];

    /**
     * Get the type of option value this component should create.
     */
    protected getOptionValueConfigType(): string {
        return RiskDecompositionColumnOption.CONFIG_TYPE;
    }

    /**
     * Init the component.
     */
    protected initializeComponent(): void {
        super.initializeComponent();
        this.initializeDecompositionTypes();
    }

    /**
     * Initialize decomposition types
     */
    private initializeDecompositionTypes(): void {
        const columnOptions: Map<RiskDecompositionType, boolean> = RiskDecompositionColumnOption.options(this.option);
        this.decompositionTypes = map(RiskDecompositionType.values(), (riskDecompositionType) => {
            return {
                eventData: riskDecompositionType,
                label: RiskDecompositionType.displayName(riskDecompositionType),
                checked: isEqual(riskDecompositionType, this.optionValue.decompositionType),
                disabled: !columnOptions.get(riskDecompositionType)
            };
        });
    }

    /**
     * On decomposition type option changed
     * @param event custom event
     */
    onDecompositionTypeOptionChanged(event: CustomEvent<AuxRadioGroupChangedDetailInterface>): void {
        if (has(event.detail, 'value')) {
            this.optionValue.decompositionType = event.detail.value.eventData;
        }
    }
}
