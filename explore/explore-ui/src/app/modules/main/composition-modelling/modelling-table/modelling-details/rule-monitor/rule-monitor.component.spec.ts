import {ComponentFixture, TestBed} from '@angular/core/testing';

import {RuleMonitorComponent} from './rule-monitor.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {SectorRule} from '@models/portfolio/tradeRules/sector-rule.model';
import {DateValue} from '@blk/explore-ui-core';

describe('RuleMonitorComponent', () => {
    let component: RuleMonitorComponent;
    let fixture: ComponentFixture<RuleMonitorComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [RuleMonitorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });

        fixture = TestBed.createComponent(RuleMonitorComponent);
        component = fixture.componentInstance;
        component.portfolio = new WhatIfPortfolio();
        component.portfolio.datePicker = new DateValue();
        component.portfolio.benchmark = new Benchmark();
        fixture.detectChanges();
    });

    it('Checks the working of getSkippedOrPassedRules method', () => {
        component.portfolio = new WhatIfPortfolio('IP');
        component.portfolio.datePicker = new DateValue({date: '10-mar-2016'});
        component.portfolio.benchmark = new Benchmark({name: 'LEH_AGG'});

        // set passed rules
        component.portfolio.passedRulesForEachDate = [];
        const passedRule1 = new SectorRule('ABS', 10, []);
        const passedRule2 = new SectorRule('BND', 60, []);
        component.portfolio.passedRulesForEachDate.push(passedRule1);
        component.portfolio.passedRulesForEachDate.push(passedRule2);

        // set skipped rules
        component.portfolio.skippedRulesForEachDate = [];
        const skippedRule = new SectorRule('SYNTH', 20, []);
        component.portfolio.skippedRulesForEachDate.push(skippedRule);

        const allPassedRules = component.getSkippedOrPassedRules(false);
        const allSkippedRules = component.getSkippedOrPassedRules(true);

        expect(Object.keys(allPassedRules).length).toBe(1);
        expect(allPassedRules['Date:  10-mar-2016'].length).toBe(2);
        expect(allPassedRules['Date:  10-mar-2016'][0].lineItem).toBe('ABS');
        expect(allPassedRules['Date:  10-mar-2016'][1].lineItem).toBe('BND');

        expect(Object.keys(allSkippedRules).length).toBe(1);
        expect(allSkippedRules['Date:  10-mar-2016'].length).toBe(1);
        expect(allSkippedRules['Date:  10-mar-2016'][0].lineItem).toBe('SYNTH');
    });

    it('Checks the working of getDetailText method', () => {
        const rule = new SectorRule('ABS', 10, []);
        const skippedRuleDetail = component.getDetailText(rule, true);
        const passedRuleDetail = component.getDetailText(rule, false);
        expect(skippedRuleDetail).toBe('Sector ABS 10%  Skipped');
        expect(passedRuleDetail).toBe('Sector ABS 10%  Passed');
    });

    it('tests onTabSelected', () => {
        jest.spyOn(component, 'getSkippedOrPassedRules').mockReturnValue(null);
        component.onTabSelected({detail: {uid: '0'}} as any);
        expect(component.selectedView).toBe('0');
        expect(component.getSkippedOrPassedRules).toHaveBeenCalledTimes(2);
    });

    it('tests getKey', () => {
        component.portfolio = new WhatIfPortfolio('IP');
        component.portfolio.datePicker = new DateValue({date: '10-mar-2016'});

        component.selectedView = '0';
        expect(component.getKey(new SectorRule('SYNTH', 20, []))).toEqual('Date:  10-mar-2016');

        component.selectedView = '1';
        expect(component.getKey(new SectorRule('SYNTH', 20, []))).toEqual('Rule:  Sector SYNTH 20%');
    });

    it('tests getDetailText', () => {
        component.portfolio = new WhatIfPortfolio('IP');
        component.portfolio.datePicker = new DateValue({date: '10-mar-2016'});

        component.selectedView = '0';
        expect(component.getDetailText(new SectorRule('SYNTH', 20, []), true)).toEqual('Sector SYNTH 20%  Skipped');

        component.selectedView = '1';
        expect(component.getDetailText(new SectorRule('SYNTH', 20, []), false)).toEqual('10-mar-2016  Passed');
    });
});
