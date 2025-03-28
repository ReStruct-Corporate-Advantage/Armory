import {GenericColumnDefinition} from '../generic-column-definition.model';
import {PerformanceConstants} from '../../../performance/performance.constants';
import {TokenUtils} from '../../token/token.utils';
import {TokenConstants} from '../../token/token.constants';

export class PraadaAttributionCalculatorMethod extends GenericColumnDefinition {

    sectorLevels: string[];

    constructor(data?: any) {
        super(data);
    }

    /**
     * Convert praadaAttributionCalculator definitions received from backend into appropriate models
     */
    static createPraadaAttributionCalculatorDefinitions(data): PraadaAttributionCalculatorMethod[] {
        const praadaSettings: any = data.praadaSettings;
        const attributionCalculatorMethods: PraadaAttributionCalculatorMethod[] = [];
        for (const attributionCalculatorMethod of praadaSettings.attributionCalculatorMethods) {
            attributionCalculatorMethods.push(new PraadaAttributionCalculatorMethod(attributionCalculatorMethod));
        }

        return attributionCalculatorMethods;
    }

    /**
     * doDeserialize
     */
    doDeserialize(data: any): void {
        super.doDeserialize(data);

        if (TokenUtils.isFeatureEnabled(TokenConstants.EXPLORE_SUPPRESS_ATTRIB_SETTINGS)) {
            if (data.value === PerformanceConstants.CALCULATION_METHOD.RELATIVE ||
                data.value === PerformanceConstants.CALCULATION_METHOD.RELATIVEI ||
                data.value === PerformanceConstants.CALCULATION_METHOD.RELATIVE_SCALED) {
                this.sectorLevels = [PerformanceConstants.CALCULATION_LEVEL.IMMEDIATE_PARENT_LEVEL, PerformanceConstants.CALCULATION_LEVEL.BENCHMARK_TOTAL_LEVEL, PerformanceConstants.CALCULATION_LEVEL.FIRST_LEVEL];
            }
            if (data.value === PerformanceConstants.CALCULATION_METHOD.INDEX_EQUITY) {
                this.sectorLevels = [PerformanceConstants.CALCULATION_LEVEL.IMMEDIATE_PARENT_LEVEL, PerformanceConstants.CALCULATION_LEVEL.BENCHMARK_TOTAL_LEVEL];
            }
        } else {
            if (data.value === PerformanceConstants.CALCULATION_METHOD.RELATIVE ||
                data.value === PerformanceConstants.CALCULATION_METHOD.RELATIVEI ||
                data.value === PerformanceConstants.CALCULATION_METHOD.RELATIVE_SCALED) {
                this.sectorLevels = [PerformanceConstants.CALCULATION_LEVEL.IMMEDIATE_PARENT_LEVEL, PerformanceConstants.CALCULATION_LEVEL.BENCHMARK_TOTAL_LEVEL];
            }

            if (data.value === PerformanceConstants.CALCULATION_METHOD.TOP_DOWN_NORM ||
                data.value === PerformanceConstants.CALCULATION_METHOD.HYBRID) {
                this.sectorLevels = [PerformanceConstants.CALCULATION_LEVEL.IMMEDIATE_PARENT_LEVEL];
            }
            if (data.value === PerformanceConstants.CALCULATION_METHOD.MA_RELATIVE ||
                data.value === PerformanceConstants.CALCULATION_METHOD.INDEX_EQUITY) {
                this.sectorLevels = [PerformanceConstants.CALCULATION_LEVEL.BENCHMARK_TOTAL_LEVEL];
            }
        }

    }
}
