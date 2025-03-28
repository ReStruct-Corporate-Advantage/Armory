import {Component, SimpleChanges} from '@angular/core';
import {ColumnSectorRule} from '../../../models/sector/column-sector/column-sector-rule.model';
import {GroupRule} from '../../../models/sector/group-rule.model';
import {isEmpty} from 'lodash';
import {BaseCustomSectorRuleComponent} from '../base-custom-sector-rule.component';

/**
 * Component to show nested Fund sector rule i.e. Portfolio or Index custom type rules.
 */
@Component({
    selector: 'explore-nested-fund-sector-rule',
    templateUrl: './nested-fund-sector-rule.component.html',
    styleUrls: ['../custom-sector-column-rule/custom-sector-column-rule.component.scss']
})
export class NestedFundSectorRuleComponent extends BaseCustomSectorRuleComponent<GroupRule> {

    portfolioRule: ColumnSectorRule;

    cusipRule: ColumnSectorRule;

    /**
     * @inheritDocs
     */
    onChanges(changes: SimpleChanges) {
        if (changes.rule && this.rule) {
            this.portfolioRule = this.rule.subRules[0] as ColumnSectorRule;
            this.cusipRule = this.rule.subRules[1] as ColumnSectorRule;
        }
    }

    /**
     * Method to update rule with newly created rule
     */
    updateRule(nestedFundSectorRule: GroupRule) {
        this.portfolioRule.copy(nestedFundSectorRule.subRules[0] as ColumnSectorRule);
        this.cusipRule.copy(nestedFundSectorRule.subRules[1] as ColumnSectorRule);
    }

    /**
     * @inheritDocs
     */
    public updateRuleText(): void {
        // Only update the text if there is a rule and it has a column specified.
        if (this.portfolioRule && this.cusipRule && this.portfolioRule.columnTag && !isEmpty((this.portfolioRule).comparisonValues)) {
            this.ruleText = this.portfolioRule.getDisplayTextForFundSectoring();
        }
    }

}
