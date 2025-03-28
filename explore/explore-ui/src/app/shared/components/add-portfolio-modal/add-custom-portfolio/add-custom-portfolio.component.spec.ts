import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {AddCustomPortfolioComponent} from './add-custom-portfolio.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TestUtils} from '@utils/test.utils';
import {AdhocPortParams} from '@models/portfolio/adhocModelling/adhoc-port-params.model';
import {AddPortfolioService} from '../add-portfolio.service';
import {Security} from '@interfaces/security.interface';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {IndexSearchTreeItem} from '@models/portfolio/index-search-tree-item.model';
import {AdhocPortfolio} from '@models/portfolio/adhoc-portfolio.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Observable, of, throwError} from 'rxjs';
import {NewSecurityHoldingChange} from '@models/portfolio/composition/new-security-holding-change.model';
import {PortfolioService} from '@services/portfolio';
import {NotificationService} from '@services/notification';
import {SecurityRule} from '@models/portfolio/tradeRules/security-rule.model';
import {
    ColumnConfig,
    DateValue,
    TelemetryCustomPortfolioTrackingParameters
} from '@blk/explore-ui-core';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {NewPortfolioHoldingChange} from '@models/portfolio/composition/new-portfolio-holding-change.model';
import {Benchmark} from '@models/portfolio/benchmark.model';

describe('AddCustomPortfolio', () => {
    let component: AddCustomPortfolioComponent;
    let fixture: ComponentFixture<AddCustomPortfolioComponent>;

    const addPortfolioServiceStub = {
        selectedSecurities: new Map<string, Security>(),
        selectedPortfolioTickers: new Set<PortfolioSearchItem|IndexSearchTreeItem|AdhocPortParams>(),
        adhocPortfoliosList: new Map<AdhocPortParams, AdhocPortfolio>()
    };

    const adhocPort = new AdhocPortfolio('CP1');
    adhocPort.holdingChanges = [new NewSecurityHoldingChange({
        analyticsId: "-9999993873023246",
        changeInCurrentFace: 0,
        changeInDeltaAdjNotional: 0,
        changeInMarketValue: 10,
        changeInNotionalMarketValue: 10,
        changeInParValue: 0,
        changeInQuantity: 7.373106408023497,
        changeInWeight: 1,
        changeInWeightRelativeToMainPort: 1,
        isNavNeutral: true,
        isValid: true,
        lineItem: "037833100",
        newMarketValue: 10,
        newNotionalMarketValue: 10,
        newQuantity: 7.373106408023497,
        newWeight: 1,
        portfolioName: "CP1",
        requiresBenchData: false,
        secDesc: "APPLE INC",
        tradeSize: 1
    })];
    adhocPort.portId = 'CP1-0.999999';

    const portfolioServiceStub = {
        fetchPortfolioInformation$: jest.fn((portfolio: Portfolio): Observable<any> => {
            if (portfolio.portName === 'PEP') {
                return of(new Portfolio('PEP'));
            } else if (portfolio.portName === 'Error') {
                return throwError(new Error('Mock error'));
            } else if (portfolio.portName === 'CP1') {
                return of(adhocPort);
            } else {
                return of('Invalid Portfolio');
            }
        }),
        isValidWhatIfBench: jest.fn(() => true)
    };

    const notificationServiceStub = {
        error: jest.fn()
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AddCustomPortfolioComponent],
            providers: [
                {provide: AddPortfolioService, useValue: addPortfolioServiceStub},
                {provide: PortfolioService, useValue: portfolioServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub}
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(AddCustomPortfolioComponent);
        component = fixture.componentInstance;
        component.modelingColumn = new ColumnConfig('notional_mv');
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should populate select with available currencies', () => {
        expect(component.currencyOptions.length).toBe(1);
    });

    it('should check whether add button is enabled', () => {
        component.adhocPortParams.name = 'cp1';
        expect(component.isAddButtonEnabled).toBeFalsy();
        component.adhocPortParams.currency = 'USD';
        component.adhocPortParams.portMktNotional = 0;
        component.addPortfolioService.selectedSecurities.set('037833100', {
            cusip: '037833100',
            description: 'APPLE INC',
            securityGroup: 'EQUITY',
            currentValue: 0,
            newValue: 0,
            error: undefined
        });
        expect(component.isAddButtonEnabled).toBeFalsy();
    });

    describe('Test addCustomPortfolioToSelectedPortfolioList', () => {
        beforeEach(() => {
            const adhocParams = new AdhocPortParams();
            component.benchmark = new Benchmark();
            component.customPortfolio = new AdhocPortfolio();
            component.customPortfolio.benchmark = new Benchmark();
            adhocParams.name = 'CP1';
            adhocParams.fullName = 'CP Full Name';
            adhocParams.currency = 'USD';
            adhocParams.portMktNotional = 1000;
            component.adhocPortParams = adhocParams;
            component['addPortfolioService'].selectedSecurities.clear();
            component['addPortfolioService'].selectedSecurities.set('037833100', {
                cusip: '037833100',
                description: 'APPLE INC',
                securityGroup: 'EQUITY',
                currentValue: 0,
                newValue: 1,
                error: undefined
            });
            component.addPortfolioService.selectedPortfolioTickers.clear();
            component.addPortfolioService.adhocPortfoliosList.clear();
            component.modelingColumn = new ColumnConfig('notional_mv');
        });

        it('should add Custom Portfolio To SelectedPortfolioList', fakeAsync(() => {
            component.modellingType = 2;
            const addedPortfolio = component.addCustomPortfolioToSelectedPortfolioList();
            addedPortfolio.subscribe(portfolio => {
                expect(portfolio instanceof WhatIfPortfolio).toBeTruthy();
            });
            tick();
            expect(component.customPortfolio.modellingType).toBe(2);
            expect(component.addPortfolioService.selectedPortfolioTickers.size).toBe(1);
            expect(component.addPortfolioService.adhocPortfoliosList.size).toBe(1);
        }));

        it('should not add portfolio if all rules are skippedRules', fakeAsync(() => {
            adhocPort.skippedRulesForEachDate = [new SecurityRule('037833100', 1)];
            const addedPortfolio = component.addCustomPortfolioToSelectedPortfolioList();
            addedPortfolio.subscribe(portfolio => {
                expect(portfolio instanceof Error).toBeTruthy();
            });
            tick();
            expect(component.addPortfolioService.selectedPortfolioTickers.size).toBe(0);
            expect(component.addPortfolioService.adhocPortfoliosList.size).toBe(0);
        }));

        it('should not add portfolio if some rules are skippedRules and some are processed', fakeAsync(() => {
            adhocPort.skippedRulesForEachDate = [new SecurityRule('037833ABC', 2)];
            adhocPort.holdingChanges = [];
            const addedPortfolio = component.addCustomPortfolioToSelectedPortfolioList();
            addedPortfolio.subscribe(portfolio => {
                expect(portfolio instanceof Error).toBeTruthy();
            });
            tick();
            expect(component.addPortfolioService.selectedPortfolioTickers.size).toBe(0);
            expect(component.addPortfolioService.adhocPortfoliosList.size).toBe(0);
        }));
    });

    it('tests on date change', () => {
        component.adhocPortParams.date = DateValue.newRelativeDate('T-1');
        const newRelativeDate = DateValue.newRelativeDate('T-5');
        component.customPortfolio = new AdhocPortfolio();
        component.customPortfolio.benchmark = new Benchmark();
        component.customPortfolio.datePicker = new DateValue();
        jest.spyOn(component['portfolioService'], 'isValidWhatIfBench').mockReturnValue(true);
        component.onDateChange(newRelativeDate);
        expect(component.adhocPortParams.date).toStrictEqual(newRelativeDate);
        expect(component.customPortfolio.datePicker).toStrictEqual(newRelativeDate);
        expect(portfolioServiceStub.isValidWhatIfBench).toBeCalledTimes(1);

    });

    describe('input value change tests', () => {
        it('should update portfolio name', () => {
            const name = 'cp1';
            const mockEvent = {detail: {value: name}} as CustomEvent;

            component.updatePortfolioName(mockEvent);

            expect(component.adhocPortParams.name).toBe(name);
        });

        it('should update full portfolio name', () => {
            const fullName = 'custom port 1';
            const mockEvent = {detail: {value: fullName}} as CustomEvent;

            component.updatePortfolioFullName(mockEvent);

            expect(component.adhocPortParams.fullName).toBe(fullName);
        });

        describe('portfolio notional market value input tests', () => {

            it('should update portfolio market notional value', () => {
                const newValue = 45;
                const mockEvent = {detail: {value: newValue}} as CustomEvent;

                component.updatePortNotionalMV(mockEvent);

                expect(component.portNMV).toBe(newValue);
            });

            it('should validate portfolio market notional value after input is complete', () => {
                const newValue = '1M';
                const expectedValue = '1,000.00';
                const mockEvent = {detail: {value: newValue}} as CustomEvent;
                component.telemetryStats.push(new TelemetryCustomPortfolioTrackingParameters());

                component.updatePortNotionalMV(mockEvent);
                component.validatePortNotionalMV();

                expect(component.telemetryStats[0].isCalculateNavUsed).toBeTruthy();
                expect(component.portNMV).toBe(expectedValue.toString());
                expect(component.adhocPortParams.portMktNotional).toEqual(1000);
            });

            it('should clear portfolio market notional value if invalid', () => {
                const newValue = 'abc';
                const mockEvent = {detail: {value: newValue}} as CustomEvent;

                component.updatePortNotionalMV(mockEvent);
                component.validatePortNotionalMV();

                expect(component.portNMV).toEqual('0.00');
                expect(component.adhocPortParams.portMktNotional).toBeNull();
            });
        });

        it('should update portfolio currency', () => {
            const currency = 'USD';
            const mockEvent = {detail: {value: {value: currency}}} as CustomEvent;

            component.updateCurrency(mockEvent);

            expect(component.adhocPortParams.currency).toBe(currency);
        });
    });

    it('should copy portfolio name to full name if full name is left blank', () => {
        component.adhocPortParams.fullName = null;
        component.benchmark = new Benchmark();
        component.customPortfolio = new AdhocPortfolio();
        component.customPortfolio.benchmark = new Benchmark();
        component.adhocPortParams.name = 'test';
        component.addCustomPortfolioToSelectedPortfolioList();
        expect(component.adhocPortParams.fullName).toBe('test');
    });

    it('tests onModelingColumnUpdated', () => {
        component.modelingColumn = undefined;
        expect(component.modelingColumn).toBeUndefined();
        let column = new ColumnConfig('notional_mv');
        component.onModelingColumnUpdated(column);
        expect(component.showCalculateNAVOption).toBeTruthy();
        expect(component.modelingColumn).toStrictEqual(column);

        column = new ColumnConfig('pct_notional_val');
        component.onModelingColumnUpdated(column);
        expect(component.showCalculateNAVOption).toBeFalsy();
        expect(component.modelingColumn).toStrictEqual(column);
    });

    it('tests setModellingType', () => {
        expect(component.modellingType).toBeUndefined();
        component.setModellingType(2);
        expect(component.modellingType).toBe(2);
        expect(component.showModellingTypes).toBeFalsy();
    });

    it('tests trackCustomPortfolioViaTelemetry', () => {
        const port = new WhatIfPortfolio();
        port.holdingChanges = [new NewPortfolioHoldingChange({favId: 123}), new NewPortfolioHoldingChange(), new NewPortfolioHoldingChange()];
        component.telemetryStats = [];
        component.modellingType = 2;
        component.modelingColumn = new ColumnConfig({columnTag: 'market_val'});
        component.trackCustomPortfolioViaTelemetry(port);
        expect(component.telemetryStats.length).toBe(1);
        expect(component.telemetryStats[0].addedPortfoliosTypeToCountMap.size).toBe(2);
    });
});
