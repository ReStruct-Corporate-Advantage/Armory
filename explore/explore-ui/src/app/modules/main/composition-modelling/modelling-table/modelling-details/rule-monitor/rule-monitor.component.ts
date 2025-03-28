import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {BaseRule} from '@models/portfolio/tradeRules/base-rule.model';
import {memoize} from 'lodash';
import {AuxTabBarItemSelectedDetailInterface} from '@blk/aladdin-angular-components';

/**
 * component class for composition rule monitor
 */
@Component({
    selector: 'app-rule-monitor',
    templateUrl: './rule-monitor.component.html',
    styleUrls: ['./rule-monitor.component.scss']
})
export class RuleMonitorComponent implements OnInit {

    @Input() portfolio: WhatIfPortfolio;
    @Input() isMonitorOpen: boolean;

    @Output() closeRuleMonitor = new EventEmitter();

    selectedView = '0';
    skippedRules: Record<string, BaseRule[]>;
    passedRules: Record<string, BaseRule[]>;
    ruleMonitorTabsData = [
        {
            'label': 'By Date',
            'uid': '0'
        },
        {
            'label': 'By Rule',
            'uid': '1'
        }];

    /**
     * Returns the skipped and passed rules grouped by key as per selected input.
     * Using cache to get the better performance.
     */
    getSkippedOrPassedRules = memoize(
        (isSkipRules: boolean) => {
            // group the skipped/passed rules against a key i.e. date or rule as per provided input.
            // Example - If we select by date option, it will group the skipped/passed rule as - [{key: '10-apr-2016', rules: [passed rule of date 10-apr-2016]}, {key: '10-may-2016', rules: [passed rule of date 10-apr-2016]}]
            const keyRulesMap: Record<string, BaseRule[]> = {};
            this.portfolio[isSkipRules ? 'skippedRulesForEachDate' : 'passedRulesForEachDate']
                .forEach(skippedOrPassedRule => {
                    // create the key of the skipped/passed rule
                    const keyValue = this.getKey(skippedOrPassedRule);
                    // search if the key already exist in the ruleWithKeyList. If it does not exist, create it and initialize the rule list for that key.
                    keyRulesMap[keyValue] ? keyRulesMap[keyValue].push(skippedOrPassedRule) : keyRulesMap[keyValue] = [skippedOrPassedRule];
                });
            return keyRulesMap;
        },
        (input: boolean) => JSON.stringify(this.portfolio.skippedRulesForEachDate) + JSON.stringify(this.portfolio.passedRulesForEachDate) + JSON.stringify(input) + JSON.stringify(this.selectedView) + this.portfolio.portName + this.portfolio.datePicker.date + this.portfolio.benchmark.name
    );

    /**
     * OnInit hook
     */
    ngOnInit() {
        this.skippedRules = this.getSkippedOrPassedRules(true);
        this.passedRules = this.getSkippedOrPassedRules(false);
    }

    /**
     * Returns the key of the skipped or passed rule.
     */
    getKey(skippedOrPassedRule: BaseRule): string {
        return this.selectedView === '0' ? 'Date:  ' + this.portfolio.datePicker.date : 'Rule:  ' + skippedOrPassedRule.ruleType + ' ' + skippedOrPassedRule.lineItem + ' ' + skippedOrPassedRule.newWeight + '%';
    }

    /**
     * Returns the detail text of the skipped or passed rule.
     */
    getDetailText(skippedOrPassedRule: BaseRule, isSkipped: boolean): string {
        const passedOrSkippedText = isSkipped ? 'Skipped' : 'Passed';
        const ruleDetail = this.selectedView === '0' ? skippedOrPassedRule.ruleType + ' ' + skippedOrPassedRule.lineItem + ' ' + skippedOrPassedRule.newWeight + '%' : this.portfolio.datePicker.date;
        return ruleDetail + '  ' + passedOrSkippedText;
    }

    /**
     * Preserve natural key order
     */
    maintainNaturalOrder(): number {
        return 0;
    }

    /**
     * tab selection change handler
     */
    onTabSelected(evt: CustomEvent<AuxTabBarItemSelectedDetailInterface>): void {
        this.selectedView = evt.detail.uid;
        this.skippedRules = this.getSkippedOrPassedRules(true);
        this.passedRules = this.getSkippedOrPassedRules(false);
    }

    /**
     * to close rule monitor
     */
    closeMonitor(): void {
        this.closeRuleMonitor.emit();
    }
}
