import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {ExploreRadioButton, SubscribableComponent, TokenConstants, TokenUtils} from '@blk/explore-ui-core';
import { TierDefinition } from '@models/portfolio/optimization/tier-definition.model';
import {
    AuxRadioInterface,
    AuxButtonSizeEnum,
    AuxTextInputValueChangedDetailInterface, Validator
} from '@blk/aladdin-angular-components';
import {OptimizationConstants} from '@constants/optimization.constants';
import {TierDefinitionType} from '@enums/tier-definition-type.enum';
import {isNil} from 'lodash';

@Component({
    selector: 'app-tier-definition',
    templateUrl: './tier-definition.component.html',
    styleUrls: ['./tier-definition.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

/**
 * Tier Definition Component used in Risk Parity Settings
 */
export class TierDefinitionComponent extends SubscribableComponent implements OnInit {

    private readonly INVALID_INPUT = 'Invalid input';
    isFixedAssetRatioVisible = false;

    @Input() tiers: TierDefinition;
    readonly AuxButtonSizeEnum = AuxButtonSizeEnum;
    tierDefinitionTypeOptions: AuxRadioInterface[] = [];

    validator: Validator[];

    ngOnInit() {
        this.validator = [{
            validate: (value: number) => {
                return !isNil(value) && !isNaN(value);
            },
            errorMessage: this.INVALID_INPUT
        }];
        this.isFixedAssetRatioVisible = TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_RISK_BUDGET_TIER_VISIBLE);
        this.initializeTierDefinitionTypeOptions();
    }

    /**
     * Tier One change handler
     * @param event
     */
    updateTierOne(event: any): any {
        this.tiers.tierOne = Number(event.detail.value);
    }

    /**
     * Tier Two change handler
     * @param event
     */
    updateTierTwo(event: any): any {
        this.tiers.tierTwo = Number(event.detail.value);
    }

    /**
     * populates radio options for Tier Definition Type
     */
    initializeTierDefinitionTypeOptions(): void {
        this.tierDefinitionTypeOptions = OptimizationConstants.TIER_DEFINITION_TYPE_OPTIONS.map(option =>
            new ExploreRadioButton(option.label, this.tiers.tierType === option.value, false, {
                helpText: option.tooltipText,
                tierDefinitionType: option.value
            })
        );
    }

    /**
     * TierDefinition type change handler
     * @param eventData
     */
    onTierDefinitionTypeOptionChanged(eventData: {helpText: string, tierDefinitionType: TierDefinitionType}): void {
        this.tiers.tierType = eventData.tierDefinitionType;
        this.initializeTierDefinitionTypeOptions();
    }

    /**
     * Handler for Tier 2 Risk Contribution Ratio - RiskBudgetTierRatio
     * @param event
     */
    onRiskBudgetTierRatioChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        if (this.validator[0].validate(event.detail.value)) {
            this.tiers.riskBudgetTierRatio = event.detail.value;
        }
    }

    /**
     * Handler for Tier 3 Risk Contribution Ratio - RiskBudgetFixedAssetRatio
     * @param event
     */
    onRiskBudgetFixedAssetRatioChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        if (this.validator[0].validate(event.detail.value)) {
            this.tiers.riskBudgetFixedAssetRatio = event.detail.value;
        }
    }
}

