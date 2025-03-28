import {HoldingChange} from '@models/portfolio/composition/holding-change.model';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {isEmpty, isObject} from 'lodash';
import {HoldingChangeFactory} from '../../../factories/holding-change.factory';
import {RuleFactory} from '../../../factories/rule.factory';
import {Deserialize} from '@blk/explore-ui-core';

export class HoldingChangeResponse implements Deserialize {
    holdingChanges: HoldingChange[] = [];
    skippedRules: BaseRule[] = [];

    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    deserialize(data: any) {
        if (!data) {
            return;
        }

        if (!isEmpty(data.holdingChanges)) {
            this.holdingChanges = data.holdingChanges.map(change => HoldingChangeFactory.convertObjectToHoldingChange(change));
        }
        if (!isEmpty(data.skippedRules)) {
            this.skippedRules = data.skippedRules.map(rule => RuleFactory.createRuleBasedOnType(rule));
        }
    }
}
