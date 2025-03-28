import {ClosedPositionAggregation} from '@models/definitions/column-definitions/closed-position-aggregation.model';
import {PositionAggregationType} from '@models/definitions/column-definitions/position-aggregation-type.model';
import {SplitPositionType} from '@models/definitions/column-definitions/split-position-types.model';
import {Objectives} from '@models/definitions/optimization/objectives.model';
import {OptimizationConstraint} from '@models/definitions/optimization/optimization-constraint.model';
import {LtSecurityTypes, LtSecurityProxyTypes} from '@blk/explore-ui-look-through-settings';

export class DefinitionsStore {

    /**
     * List Of user overridden custom colors
     */
    static customColors: string[] = [];

    /**
     * Optimization Parameter
     */
    static optimizationConstraint: OptimizationConstraint[] = [];

    static optimizationObjective: Objectives[] = [];

    /**
     * Lt Security parameters
     */
    static ltSecurityType: LtSecurityTypes[] = [];

    static ltSecurityProxyType: LtSecurityProxyTypes[] = [];

    static splitPositionType: SplitPositionType[] = [];

    static closedPositionAggregationType: ClosedPositionAggregation[] = [];

    static positionAggregationTypes: PositionAggregationType[] = [];

    static currency: string[];

    static fundCharacteristicBreakdown: string[] = [];

    static indexLookbackDate: string;

    static exposureLookBackDate: string;

    static maxSelectedDate: string;

    static rasCutoffDate: string;

    static topDownEligibleCols: readonly string[];

    static commitmentRiskGroupingModels: { text: string, value: string }[] = [];

    static commitmentRiskStressScenarios: { text: string, value: string }[] = [];
}
