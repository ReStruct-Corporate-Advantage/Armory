import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AddCashComponent} from './add-cash.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {TestUtils} from '@utils/test.utils';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {WorkspaceStore} from '@stores/workspace.store';
import {BehaviorSubject} from 'rxjs';
import {PortfolioSecurityHoldingChange} from '@models/portfolio/composition/portfolio-security-holding-change.model';
import {NAVSecurityRule} from '@models/portfolio/tradeRules/nav-security-rule.model';
import {ProRateCashRule} from '@models/portfolio/tradeRules/prorate-cash-rule.model';
import {ErrorTypeConstants, UIErrorParameters} from '@blk/explore-ui-core';
import {ModellingType} from '@enums/modelling-type.enum';
import {PortfolioNavSecurityRule} from '@models/portfolio/tradeRules/portfolio-nav-security-rule.model';

describe('AddCashComponent', () => {
  let component: AddCashComponent;
  let fixture: ComponentFixture<AddCashComponent>;

  beforeAll((done) => {
      TestUtils.initialize(done);
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCashComponent ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    fixture = TestBed.createComponent(AddCashComponent);
    component = fixture.componentInstance;
    component.portfolio = new WhatIfPortfolio('PEP');
    component.portfolio.currency = 'USD';

    WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(component.portfolio);

    fixture.detectChanges();
  });

    describe('On ngOninit', () => {
        it('should populate the variable on initialize', () => {
            component.ngOnInit();
            expect(component.selectedCurrency).not.toBeUndefined();
            expect(component.currencyOptions).not.toBeUndefined();
        });

        it('should populate the variable on initialize with holding changes', () => {
            component.portfolio.holdingChanges = [new PortfolioSecurityHoldingChange({})];
            component.ngOnInit();
            expect(component.selectedCurrency).not.toBeUndefined();
            expect(component.currencyOptions).not.toBeUndefined();
        });
    });

    describe('On currency change', () => {
        it('should assign selected currency on initialize', () => {
            component.onCurrencyChange('CAD');
            expect(component.selectedCurrency).toBe('CAD');
        });
    });

    describe('On addToPortfolio change', () => {
        it('should assign addToPortfolio on initialize', () => {
            component.onAddToPortfolioChanged('PEP');
            expect(component.addToPortfolio).toBe('PEP');
        });
    });

    describe('On text box edit', () => {
        it('should assign the value to newCashValue', () => {
            const event = {detail: {value: '657.87'}};
            component.updateNewCashValue(event as CustomEvent);
            expect(component.newCashValue).toBe('657.87');
        });
    });

    describe('Tests parseCashValue method', () => {
        it('should parse the value and show error in case of invalid value', () => {
            component.newCashValue = '123456.987';
            component.parseCashValue();
            expect(component.newCashValue).toBe('123,456.987');

            component.newCashValue = 'invalidCashValue';
            jest.spyOn(component['notificationService'], 'error');
            component.parseCashValue();
            expect(component.newCashValue).toBe('');
            expect(component['notificationService'].error).toHaveBeenCalledWith('Invalid value inserted.', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_PARSE_CASH_VALUE_ERROR);
        });
    });

    describe('Tests injectCash Method', () => {
        it('should emit and create new rule', () => {
            jest.spyOn(component.showCompositionTable, 'emit');
            component.newCashValue = '200000';
            component.injectCash();
            expect(component.cusip).toBe('USD_CCASH');
            expect(component.newCashValue).toBe('');
            expect(component.showCompositionTable.emit).toHaveBeenCalled();
        });

        it('should emit and create new rule for PortfolioNAVSecurityRule', () => {
            const emitSpy = jest.spyOn(component.showCompositionTable, 'emit');
            component.newCashValue = '200000';
            component.portfolio.modellingType = ModellingType.PORTFOLIO;
            component.injectCash();
            expect(component.cusip).toBe('USD_CCASH');
            expect(component.newCashValue).toBe('');
            expect(component.showCompositionTable.emit).toHaveBeenCalled();
            expect(emitSpy.mock.calls[0][0].tradeRule[0] instanceof PortfolioNavSecurityRule).toBeTruthy();
        });

        it('should show error message in case of SkippedRules', () => {
            jest.spyOn(component['notificationService'], 'error');
            component.portfolio.skippedRulesForEachDate = [new NAVSecurityRule('USD_CCASH', 1000000)];
            component.cusip = 'USD_CCASH';
            component.checkForSkippedRules();
            expect(component['notificationService'].error).toHaveBeenCalledWith('Analytics not found for cash security - USD_CCASH. Please try for a different date/currency.', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_CHECK_FOR_SKIPPED_RULES_ERROR);
        });
    });

    describe('Tests injectProRataCash Method', () => {
        it('should emit and create new rule', () => {
            jest.spyOn(component.showCompositionTable, 'emit');
            component.newCashValue = '200000';
            component.selectedCurrency = 'USD';
            component.injectProRataCash();
            expect(component.newCashValue).toBe('');
            expect(component.showCompositionTable.emit).toHaveBeenCalledWith({callbackFunction: component.checkForSkippedRules, tradeRule: [new ProRateCashRule(200000, 'USD')]});
        });
    });
});
