import {Component, Input} from '@angular/core';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';

@Component({
    selector: 'app-rule-table',
    templateUrl: './rule-table.component.html',
    styleUrls: ['./rule-table.component.scss']
})
export class RuleTableComponent {
    /**
     * rules to be presented in the table
     */
    @Input() tradeRules: BaseRule[];
    @Input() showNumbering: boolean;
}
