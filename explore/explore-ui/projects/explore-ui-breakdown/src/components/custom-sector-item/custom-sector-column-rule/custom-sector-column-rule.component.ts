import {Component, Input, SimpleChanges} from '@angular/core';
import {isEmpty} from 'lodash';
import {BaseCustomSectorRuleComponent} from '../base-custom-sector-rule.component';
import {ColumnSectorRule} from '../../../models/sector/column-sector/column-sector-rule.model';
import {CustomSectorType} from '../../../enums/custom-sector-type.enum';

@Component({
    selector: 'explore-custom-sector-column-rule',
    templateUrl: './custom-sector-column-rule.component.html',
    styleUrls: ['./custom-sector-column-rule.component.scss']
})
export class CustomSectorColumnRuleComponent extends BaseCustomSectorRuleComponent<ColumnSectorRule> {

    @Input()
    ruleCaption: string;

    /**
     * @inheritDocs
     */
    onChanges(changes: SimpleChanges) {
        if (changes.ruleCaption) {
            this.updateRuleText();
        }
    }

    /**
     * Method to update rule with newly created rule
     */
    updateRule(columnSectorRule: ColumnSectorRule) {
        this.rule.copy(columnSectorRule);
    }

    /**
     * Updates the display text for this rule.
     */
    public updateRuleText(): void {
        let text = this.ruleCaption ? this.ruleCaption : 'Double click to define custom sector';

        // Only update the text if there is a rule and it has a column specified.
        if (this.rule && this.rule.columnTag && !isEmpty(this.rule.comparisonValues)) {
            text = (this.rule.customSectorType === undefined || this.rule.customSectorType === CustomSectorType.ATTRIBUTES) ? this.rule.getDisplayText() : this.rule.getDisplayTextForFundSectoring();
        }

        this.ruleText = text;
    }
}
