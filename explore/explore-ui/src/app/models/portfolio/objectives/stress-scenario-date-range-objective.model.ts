import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import {DateScenario} from '@blk/explore-ui-core';
import {isEmpty, isObject, isNil} from 'lodash';
import {ScenarioColumnOption} from '@blk/explore-ui-column-option';
import {OptimizationConstants} from '@constants/optimization.constants';

export class StressScenarioDateRangeObjective extends PortfolioObjective {
    dateRangeScenarios: DateScenario[];
    type = OptimizationConstants.STRESS_SCENARIO_DATE_RANGE;

    /**
     * Default constructor
     */
    constructor(data?: any) {
        super(data);
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Return data to be saved for this Portfolio Objective
     */
    serialize(): any {
        return {
            ...super.serialize(),
            type: this.type,
            dateRangeScenarios: ScenarioColumnOption.serializeScenarios(this.dateRangeScenarios)
        };
    }

    /**
     * Set attributes from the passed in data on this portfolio Objective
     */
    deserialize(data: any): void {
        super.deserialize(data);
        // Deserialize the date scenarios if there are any.
        this.dateRangeScenarios = new Array<DateScenario>();
        if (!isEmpty(data.dateRangeScenarios)) {
            this.dateRangeScenarios = data.dateRangeScenarios.map(item => new DateScenario(item));
        }
    }

    /**
     * Checks if the objective is valid or not
     */
    isDateRangeValid(): boolean {
        return !(isEmpty(this.dateRangeScenarios) || isNil(this.dateRangeScenarios?.[0]?.toDate?.date) || isNil(this.dateRangeScenarios?.[0]?.fromDate?.date));
    }
}
