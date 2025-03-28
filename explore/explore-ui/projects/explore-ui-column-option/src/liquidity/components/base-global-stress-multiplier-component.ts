import {ExploreNumericStepperGroup} from '@blk/explore-ui-core';
import {BaseLiquiditySettingsComponent} from './base-liquidity-settings.component';
import {GlobalStressMultiplier} from '../models/global-stress-multiplier';
import {isNil} from 'lodash';
import {AuxNumericStepperValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {AbstractLiquiditySettings} from '../models/abstract-liquidity-settings.model';
import {Directive} from '@angular/core';

@Directive()
export abstract class BaseGlobalStressMultiplierComponent<T extends AbstractLiquiditySettings> extends BaseLiquiditySettingsComponent<T> {
    public stressMultipliersGroup: ExploreNumericStepperGroup[];

    initializeStressMultiplierGroup(globalStressMultiplier: GlobalStressMultiplier): void {
        /* commenting below line as this feature is not yet implemented on Liquidity side
        this.stressMultipliersGroup = [
            new ExploreNumericStepperGroup(
                isNil(globalStressMultiplier.fixedCostMultiplier) ? GlobalStressMultiplier.DEFAULT_STRESS_MULTIPLIER : globalStressMultiplier.fixedCostMultiplier, GlobalStressMultiplier.FIXED_COST_MULTIPLIER_LABEL, true),
            new ExploreNumericStepperGroup(
                isNil(globalStressMultiplier.marketImpactMultiplier) ? GlobalStressMultiplier.DEFAULT_STRESS_MULTIPLIER : globalStressMultiplier.marketImpactMultiplier, GlobalStressMultiplier.MARKET_IMPACT_MULTIPLIER_LABEL, true),
            new ExploreNumericStepperGroup(
                isNil(globalStressMultiplier.marketDepthMultiplier) ? GlobalStressMultiplier.DEFAULT_STRESS_MULTIPLIER : globalStressMultiplier.marketDepthMultiplier, GlobalStressMultiplier.MARKET_DEPTH_MULTIPLIER_LABEL, true)
        ]; */

        this.stressMultipliersGroup = [new ExploreNumericStepperGroup(
                isNil(globalStressMultiplier.marketDepthMultiplier) ? GlobalStressMultiplier.DEFAULT_STRESS_MULTIPLIER : globalStressMultiplier.marketDepthMultiplier, GlobalStressMultiplier.LEGACY_STRESS_MULTIPLIER_LABEL, true)
        ];
    }

    onStressMultiplierChanged(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>, label: string, globalStressMultiplier: GlobalStressMultiplier): void {
        if (isNil(event)) {
            return;
        }
        const value = event.detail.value;
        switch (label) {
            case GlobalStressMultiplier.FIXED_COST_MULTIPLIER_LABEL: {
                globalStressMultiplier.fixedCostMultiplier = Number(value);
                break;
            }
            case GlobalStressMultiplier.MARKET_IMPACT_MULTIPLIER_LABEL: {
                globalStressMultiplier.marketImpactMultiplier = Number(value);
                break;
            }
            case GlobalStressMultiplier.MARKET_DEPTH_MULTIPLIER_LABEL: {
                globalStressMultiplier.marketDepthMultiplier = Number(value);
                break;
            }
            case GlobalStressMultiplier.LEGACY_STRESS_MULTIPLIER_LABEL: {
                globalStressMultiplier.marketDepthMultiplier = Number(value);
            }
        }
    }
}
