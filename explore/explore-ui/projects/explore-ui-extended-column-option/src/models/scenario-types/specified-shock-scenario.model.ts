import {RequestParamsCreator, Serializable} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {ScenarioConstants} from '../../constants/scenario.constant';
import {isObject} from 'lodash';

export class SpecifiedShockScenario implements Serializable, RequestParamsCreator {

    columns: ColumnSet = new ColumnSet();
    dxsShockUnit: string = ScenarioConstants.DXS_SHOCK_UNIT.PERCENTAGE_OF_SPREAD;

    /**
     * Used to make different calls to fetch specified scenario data
     * 1. Create from scratch workflow when this is false
     * 2. Saved scenario workflow when this is true
     */
    isSavedSpecifiedScenario = false;

    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
            // For Saved Specified scenarios
            this.isSavedSpecifiedScenario = true;
        }
    }

    serialize() {
        throw new Error('Method not implemented.');
    }

    deserialize(data: any) {
        if (data.dxsShockUnit) {
            this.dxsShockUnit = data.dxsShockUnit;
        }
    }

    addRequestParams(requestParams: any): void {
        if (this.dxsShockUnit) {
            requestParams.dxsShockUnit = this.dxsShockUnit;
        }
        if (this.columns.columns.length !== 0) {
            this.columns.addRequestParams(requestParams);
        }
    }

}
