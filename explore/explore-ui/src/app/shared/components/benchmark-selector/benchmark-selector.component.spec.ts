import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange, SimpleChanges} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
    AbstractFavoriteConfig,
    AlertConstants,
    CommonUtils,
    DateValue,
    ExploreDialogParam,
    ExploreSelectOption,
    ExploreSelectOptionGroup
} from '@blk/explore-ui-core';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {BatchExportRunAs} from '@enums/batch-reporting/batch-export-run-as.enum';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {IndexWeight} from '@models/portfolio/index-weight.model';
import {PortfolioTooltipInfo} from '@models/portfolio/portfolio-tooltip-info.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PublishStateService} from '@services/publishState/publish-state.service';
import {Observable, of, Subscription, throwError} from 'rxjs';
import {BenchmarkConstants} from '../../../constants';
import {PortfolioInputPanelComponentSpec} from '../../../modules/main/portfolio-input-panel/portfolio-input-panel.component.spec';
import {ExplorePortfolioSearchService} from '@services/explore-portfolio-search/explore-portfolio-search.service';
import {PortfolioService} from '@services/portfolio';
import {BenchmarkSelectorComponent} from './benchmark-selector.component';
import {BenchmarkSelectorUtils} from './benchmark-selector.utils';
import dummyScheduledJobs from '@assets/data/dummy-scheduled-jobs.json';

export class BenchmarkSelectorComponentSpec {
    static createBenchmarkPortfolio(): Portfolio {
        const benchmarkPortfolio: Portfolio = new Portfolio('MSAC_APACN', new DateValue({
            date: '01/22/2020',
            calCode: 'GP_HK_STD',
            dateString: false,
            dateStringValue: ''
        }));
        benchmarkPortfolio.fullName = 'MSCI AC Asia Pacific Index (Net Total Return)';
        benchmarkPortfolio.currency = 'USD';
        const indexWeight1Portfolio: Portfolio = new Portfolio('MS_TH', undefined, false);
        indexWeight1Portfolio.fullName = 'MSCI Emerging - Thailand';
        const indexWeight1: IndexWeight = new IndexWeight({weight: 0.5, portfolio: indexWeight1Portfolio});
        const indexWeight2Portfolio: Portfolio = new Portfolio('MS_AU', undefined, false);
        indexWeight2Portfolio.fullName = 'MSCI Developed - Australia';
        const indexWeight2: IndexWeight = new IndexWeight({weight: 0.5, portfolio: indexWeight1Portfolio});
        benchmarkPortfolio.indexWeights = [indexWeight1, indexWeight2];
        return benchmarkPortfolio;
    }

    static createBenchmarks(): Benchmark[] {
        const benchmarks: Benchmark[] = [];
        benchmarks.push(Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'MSAC_APACN'));
        benchmarks.push(Benchmark.create(BenchmarkConstants.PERFORM, 1, 'MSAC_APACN'));
        benchmarks.push(Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 15, 'MSAC_APACN'));
        benchmarks.push(Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 7, 'MSAC_APACN'));
        benchmarks.push(Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 2, 'MSAC_APACN'));
        benchmarks.push(Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, 2, 'MSAC_APACN'));
        benchmarks.push(Benchmark.create(BenchmarkConstants.MODEL, 1, 'MSAC_APACN'));
        benchmarks.push(Benchmark.create(BenchmarkConstants.BENCH_TYPE_FORWARD, 2, 'MSAC_APACN'));
        benchmarks.push(Benchmark.create(BenchmarkConstants.MODEL, 2, 'MSAC_APACN'));
        return benchmarks;
    }

    /**
     * This function is merely for developing purposes. It should be deleted once we are retrieving the portfolio
     */
    static buildDemoPortfolio(): Portfolio {
        const demoPortfolio = new Portfolio('PEP', new DateValue({
            date: '01/22/2020',
            calCode: 'GP_HK_STD',
            dateString: false,
            dateStringValue: ''
        }), false, 'BGF Pacific Equity Fund');
        demoPortfolio.benchmarks = this.createBenchmarks();
        demoPortfolio.currency = 'USD';
        demoPortfolio.benchmark = demoPortfolio.benchmarks[0];
        return demoPortfolio;
    }
}

describe('BenchmarkSelectorComponent', () => {
    let component: BenchmarkSelectorComponent;
    let fixture: ComponentFixture<BenchmarkSelectorComponent>;
    const initialPortfolio: Portfolio = BenchmarkSelectorComponentSpec.buildDemoPortfolio();
    const portfolioObservable: Observable<Portfolio> = of(initialPortfolio);
    const portfolioSubscription: Subscription = new Subscription();

    const portfolioServiceStub = {
        fetchPortfolioInformation$: jest.fn((): Observable<Portfolio> => {
            return of(BenchmarkSelectorComponentSpec.createBenchmarkPortfolio());
        }),
        isValidWhatIfBench: jest.fn(() => true)
    };

    const publishStateServiceStub = {
        fetchPublishedState$: jest.fn((): Observable<Portfolio> => {
            return of(null);
        }),
    };

    const portfolioSearchServiceStub = {
        searchPortfolio: jest.fn()
    };

    const benchClickedEvent: any = {
        type: BenchmarkConstants.OTHER_BENCH
    };

    const expectedBenchmarkOptions: ExploreSelectOptionGroup[] = [
        new ExploreSelectOptionGroup(
            [
                new ExploreSelectOption(
                    'Primary (MSAC_APACN)',
                    Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'MSAC_APACN'),
                    true
                ),
                new ExploreSelectOption(
                    'Secondary (MSAC_APACN)',
                    Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 2, 'MSAC_APACN'),
                    false
                ),
                new ExploreSelectOption(
                    'Bench 7 (MSAC_APACN)',
                    Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 7, 'MSAC_APACN'),
                    false
                ),
                new ExploreSelectOption(
                    'Bench 15 (MSAC_APACN)',
                    Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 15, 'MSAC_APACN'),
                    false
                )
            ],
            BenchmarkConstants.BENCHMARK_TYPES_DISPLAY[BenchmarkConstants.BENCH_TYPE_RISK]
        ),
        new ExploreSelectOptionGroup(
            [
                new ExploreSelectOption(
                    'Primary (MSAC_APACN)',
                    Benchmark.create(BenchmarkConstants.PERFORM, 1, 'MSAC_APACN'),
                    false
                )
            ],
            BenchmarkConstants.BENCHMARK_TYPES_DISPLAY[BenchmarkConstants.PERFORM]
        ),
        new ExploreSelectOptionGroup(
            [
                new ExploreSelectOption(
                    'Primary (MSAC_APACN)',
                    Benchmark.create(BenchmarkConstants.MODEL, 1, 'MSAC_APACN'),
                    false
                ),
                new ExploreSelectOption(
                    'Secondary (MSAC_APACN)',
                    Benchmark.create(BenchmarkConstants.MODEL, 2, 'MSAC_APACN'),
                    false
                ),
            ],
            BenchmarkConstants.BENCHMARK_TYPES_DISPLAY[BenchmarkConstants.MODEL]
        ),
        new ExploreSelectOptionGroup(
            [
                new ExploreSelectOption(
                    'Group Aggregate - Secondary',
                    Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, 2, 'MSAC_APACN'),
                    false
                )
            ],
            BenchmarkConstants.BENCHMARK_TYPES_DISPLAY[BenchmarkConstants.BENCH_AGGREGATE]
        ),
        new ExploreSelectOptionGroup(
            [
                new ExploreSelectOption(
                    'Secondary (MSAC_APACN)',
                    Benchmark.create(BenchmarkConstants.BENCH_TYPE_FORWARD, 2, 'MSAC_APACN'),
                    false
                )
            ],
            BenchmarkConstants.BENCHMARK_TYPES_DISPLAY[BenchmarkConstants.BENCH_TYPE_FORWARD]
        ),
        new ExploreSelectOptionGroup(
            [
                new ExploreSelectOption(
                    BenchmarkConstants.NONE_BENCH,
                    Benchmark.create(BenchmarkConstants.NONE_BENCH, null, BenchmarkConstants.NONE_BENCH),
                    false
                )
            ]
        ),
    ];

    beforeEach(() => {
        jest.spyOn(portfolioObservable, 'subscribe').mockImplementation((fn: Function): Subscription => {
            fn(initialPortfolio);
            return portfolioSubscription;
        });
        TestBed.configureTestingModule({
            declarations: [BenchmarkSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ExplorePortfolioSearchService, useValue: portfolioSearchServiceStub},
                {provide: PortfolioService, useValue: portfolioServiceStub},
                {provide: PublishStateService, useValue: publishStateServiceStub}
            ]
        });

        fixture = TestBed.createComponent(BenchmarkSelectorComponent);
        component = fixture.debugElement.componentInstance;
        component.portfolio = initialPortfolio;
        component.tooltipInfo = new PortfolioTooltipInfo();
        jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockReturnValue('-0.999999');
    });

    describe('getBenchmarkOptions Test', () => {
        let benchmarks: Benchmark[];
        beforeEach(() => {
            component.ngOnChanges({
                portfolio: {
                    currentValue: initialPortfolio,
                    previousValue: undefined,
                    firstChange: true,
                    isFirstChange: () => true
                }
            });
        });
        beforeAll(() => {
            benchmarks = BenchmarkSelectorComponentSpec.createBenchmarks();
        });

        it('Test getBenchmarkOptions with empty benchmarks', () => {
            const benchmarkOptions = BenchmarkSelectorUtils.getBenchmarkOptions([], component.portfolio, component.allowOther);
            expect(benchmarkOptions.length).toBe(1);
            expect(benchmarkOptions[0].values[0].displayValue).toBe(BenchmarkConstants.NONE_BENCH);
        });

        it('Test getBenchmarkOptions with batchRunAs PortGroup', () => {
            component.batchRunAs = BatchExportRunAs.PORTGROUP;
            const benchmarkOptions = BenchmarkSelectorUtils.getBenchmarkOptions(benchmarks, component.portfolio, component.allowOther);
            expect(benchmarkOptions).toEqual(expectedBenchmarkOptions);
        });

        it('should test getBenchmarkOptions without OTHER as benchmark option', () => {
            component.allowOther = false;
            const benchmarkOptions = BenchmarkSelectorUtils.getBenchmarkOptions(benchmarks, component.portfolio, component.allowOther);
            expect(benchmarkOptions).toEqual(expectedBenchmarkOptions);
        });

        it('should test getBenchmarkOptions with OTHER as benchmark option', () => {
            component.allowOther = true;
            const benchmarkOptions = BenchmarkSelectorUtils.getBenchmarkOptions(benchmarks, component.portfolio, component.allowOther);
            expectedBenchmarkOptions.push({
                'values': [
                    {
                        value: Benchmark.create(BenchmarkConstants.OTHER_BENCH, null, BenchmarkConstants.OTHER_BENCH),
                        'displayValue': BenchmarkConstants.OTHER_BENCH,
                        'isSelected': false
                    }
                ]
            });
            expect(benchmarkOptions).toEqual(expectedBenchmarkOptions);
        });
    });

    describe('onBenchmarkClicked Test', () => {
        it('should test method with a benchmark of type "Other"', () => {
            jest.spyOn(component, 'setBenchmark');
            jest.spyOn(component['notificationService'], 'invokeWidgetReloadPrompt');
            component.dropdownOpenedFlag = true;
            component.onBenchmarkClicked(benchClickedEvent);
            expect(component.displayPortfolioSearch).toBe(true);
            expect(component['notificationService'].invokeWidgetReloadPrompt).toHaveBeenCalled();
            expect(component.setBenchmark).toHaveBeenCalled();
        });

        it('tests method with a benchmark that is not of type "Other"', () => {
            jest.spyOn(component, 'setBenchmark');
            jest.spyOn(component['notificationService'], 'invokeWidgetReloadPrompt');
            benchClickedEvent.type = BenchmarkConstants.BENCH_TYPE_RISK;
            component.dropdownOpenedFlag = true;
            component.onBenchmarkClicked(benchClickedEvent);
            expect(component['notificationService'].invokeWidgetReloadPrompt).toHaveBeenCalled();
            expect(component.displayPortfolioSearch).toBe(false);
            expect(component.setBenchmark).toHaveBeenCalled();
        });

        it('should test method with a benchmark of type "Other" - reload widgets events disabled', () => {
            jest.spyOn(component, 'setBenchmark');
            jest.spyOn(component['notificationService'], 'invokeWidgetReloadPrompt');
            component.dropdownOpenedFlag = true;
            component.triggerWidgetReloadEvents = false;
            component.onBenchmarkClicked(benchClickedEvent);
            expect(component['notificationService'].invokeWidgetReloadPrompt).not.toHaveBeenCalled();
            expect(component.setBenchmark).toHaveBeenCalled();
        });
    });

    describe('setBenchmark Test', () => {
        it('should call report and change the benchmark', () => {
            jest.spyOn(component, 'resetReport');
            jest.spyOn(publishStateServiceStub, 'fetchPublishedState$');
            component.portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'MSAC_APACN');
            const benchmark: Benchmark = Benchmark.create(BenchmarkConstants.PERFORM, 2, 'MSAC_APACN');
            component.setBenchmark(benchmark);
            expect(component.portfolio.benchmark).toBe(benchmark);
            expect(publishStateServiceStub.fetchPublishedState$).toHaveBeenCalledWith(component.portfolio);

            const otherBench: Benchmark = Benchmark.create(BenchmarkConstants.OTHER_BENCH, null, 'OTHER');
            component.setBenchmark(otherBench);
            expect(component.portfolio.benchmark).toBe(otherBench);
            expect(component.resetReport).toHaveBeenCalledTimes(2);
            // expect(publishStateServiceStub.fetchPublishedState$).toHaveBeenCalledTimes(1);

            // when benchmark type is None and benchmark name is undefined then we need to default the benchmark name to None
            component.portfolio.benchmark.name = '';
            const NoneBenchmark: Benchmark = Benchmark.create(BenchmarkConstants.NONE_BENCH);
            component.setBenchmark(NoneBenchmark);
            expect(component.portfolio.benchmark.name).toBe(BenchmarkConstants.NONE_BENCH);
        });
    });

    describe('setOtherBenchmark Test', () => {
        it('if portfolio is not valid then show dialog box', () => {
            jest.spyOn(component['notificationService'], 'openDialog');
            jest.spyOn(console, 'error');
            jest.spyOn(component['portfolioService'], 'fetchPortfolioInformation$').mockReturnValueOnce(throwError('error'));
            component.setOtherBenchmark(new PortfolioSearchItem('Invalid Portfolio'));
            expect(portfolioServiceStub.fetchPortfolioInformation$).toHaveBeenCalledWith(expect.any(Object), {isLightVersion: true, includeMandate: false}, true);
            expect(component['notificationService'].openDialog).toHaveBeenCalledWith(new ExploreDialogParam(
                AlertConstants.TYPE.ALERT,
                AlertConstants.HEADER.PORT_INFO_MISSING,
                AlertConstants.BODY.PORT_INFO_MISSING,
                AlertConstants.BTN.OK
            ));
            expect(console.error).toHaveBeenCalledWith('error');
        });

        it('should set the new benchmark according to what the user looked for', () => {
            component.portfolio.benchmark.name = 'MS_IE';
            const portfolioSearchItem: PortfolioSearchItem = new PortfolioSearchItem('MSAC_APACN');
            jest.spyOn(component['notificationService'], 'invokeWidgetReloadPrompt');
            component.setOtherBenchmark(portfolioSearchItem);
            expect(portfolioServiceStub.fetchPortfolioInformation$).toHaveBeenCalledWith(expect.any(Object), {isLightVersion: true, includeMandate: false}, true);
            expect(component.portfolio.benchmark.name).toBe(portfolioSearchItem.ticker);
            expect(component.portfolio.benchmark.portfolio.isBench).toBeTruthy();
            expect(component['notificationService'].invokeWidgetReloadPrompt).toHaveBeenCalled();
            component.portfolio.benchmark.portfolio.isBench = false;
            expect(component.portfolio.benchmark.portfolio.equals(BenchmarkSelectorComponentSpec.createBenchmarkPortfolio())).toBeTruthy();
        });
    });

    describe('ngOnchanges Tests', () => {
        it('should test ngOnChanges', () => {
            component.portfolio = new Portfolio('PEP');
            // Test empty changes
            component.ngOnChanges({});
            expect(component.portfolio.portName).toBe('PEP');

            const changes: SimpleChanges = {portfolio: new SimpleChange(undefined, new Portfolio('IP'), false)} as SimpleChanges;
            jest.spyOn(BenchmarkSelectorUtils, 'getBenchmarkOptions').mockImplementationOnce((obj) => {
                component.portfolio = changes.portfolio.currentValue;
            });

            component.ngOnChanges(changes);
            expect(component.portfolio.portName).toBe('IP');
        });
    });

    describe('openPopoverBenchmark Test', () => {

        beforeEach(() => {
            component.portfolio = PortfolioInputPanelComponentSpec.buildDemoPortfolio();
            jest.spyOn(portfolioServiceStub, 'fetchPortfolioInformation$').mockClear();
        });

        it('should set the benchmark Header to be None', () => {
            component.portfolio.benchmark = Benchmark.create(BenchmarkConstants.NONE_BENCH, null, BenchmarkConstants.NONE_BENCH);
            component.openPopover(true);
            expect(component.benchmarkHeader).toBe(BenchmarkConstants.NONE_BENCH);
            expect(portfolioServiceStub.fetchPortfolioInformation$).not.toHaveBeenCalled();
            expect(component.showBenchPopover).toBeFalsy();
            expect(component.showOtherPopover).toBeFalsy();
        });

        it('should set the benchmark Header to be BenchAggregate', () => {
            // The last benchmark in this demo is of type BenchAggregate
            component.portfolio.benchmark = component.portfolio.benchmarks[5];
            component.openPopover(true);
            expect(component.benchmarkHeader).toBe(BenchmarkConstants.GROUP_AGGREGATE + ' - ' + component.portfolio.benchmark.name);
            expect(portfolioServiceStub.fetchPortfolioInformation$).not.toHaveBeenCalled();
            expect(component.showBenchPopover).toBeFalsy();
            expect(component.showOtherPopover).toBeFalsy();
        });

        it('should set the benchmark Header to be Other', () => {
            component.portfolio.benchmark = Benchmark.create(BenchmarkConstants.OTHER_BENCH, null, BenchmarkConstants.OTHER_BENCH);
            component.openPopover(true);
            expect(component.benchmarkHeader).toBe(BenchmarkConstants.OTHER_BENCH);
            expect(portfolioServiceStub.fetchPortfolioInformation$).not.toHaveBeenCalled();
            expect(component.showBenchPopover).toBeFalsy();
            expect(component.showOtherPopover).toBeFalsy();
        });


        it('should set the tooltip info to benchmark.portfolio when the bench is type Other', () => {
            component.portfolio.benchmark = Benchmark.create(BenchmarkConstants.OTHER_BENCH, null, BenchmarkConstants.OTHER_BENCH);
            component.portfolio.benchmark.portfolio = BenchmarkSelectorComponentSpec.createBenchmarkPortfolio();
            component.openPopover();
            expect(portfolioServiceStub.fetchPortfolioInformation$).toHaveBeenCalledWith(expect.any(Object), {isLightVersion: true, includeMandate: false}, true);
            expect(component.showBenchPopover).toBeFalsy();
            expect(component.showOtherPopover).toBeTruthy();
            expect(component.tooltipInfo.portName).toBe(component.portfolio.benchmark.portfolio.portName);
            expect(component.tooltipInfo.fullName).toBe(component.portfolio.benchmark.portfolio.fullName);
            expect(component.tooltipInfo.currency).toBe(component.portfolio.benchmark.portfolio.currency);
            expect(component.tooltipInfo.indexWeights).toEqual(component.portfolio.benchmark.portfolio.indexWeights);
            expect(component.otherBenchmarkHeader).toBe(component.tooltipInfo.portName + ' | ' + component.tooltipInfo.fullName);
        });

    });

    describe('closePopovers Tests', () => {
        it('should close all popovers', () => {
            component.closePopovers();
            expect(component.showBenchPopover).toBeFalsy();
            expect(component.showOtherPopover).toBeFalsy();
        });
    });


    describe('getDisplayName Test', () => {
        it('should return empty string with no item', () => {
            expect(BenchmarkSelectorUtils['getDisplayName'](undefined)).toBe('');
        });

        it('should return Primary/Secondary when item.name is Primary or Secondary', () => {
            const item = {name: 'Primary'} as Benchmark;
            const item2 = {name: 'Secondary'} as Benchmark;

            expect(BenchmarkSelectorUtils['getDisplayName'](item)).toBe('Primary');
            expect(BenchmarkSelectorUtils['getDisplayName'](item2)).toBe('Secondary');
        });

        it('should specify primary/secondary and the name it', () => {
            const item = {name: 'IP', order: 1, type: 'REPACCT'} as Benchmark;
            expect(BenchmarkSelectorUtils['getDisplayName'](item)).toBe('Primary (IP)');
        });

        it('should test other cases', () => {
            let name: string;

            name = BenchmarkSelectorUtils['getDisplayName']({name: 'Bench Name'} as Benchmark);
            expect(name).toBe('Bench Name');

            name = BenchmarkSelectorUtils['getDisplayName']({
                type: BenchmarkConstants.BENCH_AGGREGATE,
                name: BenchmarkConstants.BENCH_PRIMARY,
                order: 1
            } as Benchmark);
            expect(name).toBe(BenchmarkConstants.GROUP_AGGREGATE);

            name = BenchmarkSelectorUtils['getDisplayName']({type: '', order: 1, name: 'PEP'} as Benchmark);
            expect(name).toBe('Primary (PEP)');

            name = BenchmarkSelectorUtils['getDisplayName']({type: '', order: 2, name: 'PEP'} as Benchmark);
            expect(name).toBe('Secondary (PEP)');
        });
    });

    it('tests onDropdownOpened', () => {
        component.dropdownOpenedFlag = false;
        component.onDropdownOpened();
        expect(component.dropdownOpenedFlag).toBeTruthy();
    });

    it('setDefaultSettingsForBenchmark test case', () => {
        component.portfolio = null;
        expect(component.setDefaultSettingsForBenchmark(component.portfolio)).toBeUndefined();

        component.portfolio = new Portfolio('PEP');
        component.portfolio.benchmark = new Benchmark({type: 'Dummy'});

        // As benchmark is not Other displaySearchPortfolio boolean will remain false and otherBenchmark label as empty string
        component.setDefaultSettingsForBenchmark(component.portfolio);
        expect(component.displayPortfolioSearch).toBeFalsy();
        expect(component.otherBenchmarkLabel).toBe('');

        component.portfolio.benchmark.type = BenchmarkConstants.OTHER_BENCH;
        component.setDefaultSettingsForBenchmark(component.portfolio);
        expect(component.displayPortfolioSearch).toBeTruthy();
    });

    it('isSelectedBenchmark test case', () => {
        let benchmark: Benchmark = Benchmark.create('RISK', 1, 'SNP500PRO');
        component.portfolio.benchmark = Benchmark.create('PERFORM', 1, 'GROUP');
        // As portfolio benchmark and argument benchmark doesn't same so return false
        expect(BenchmarkSelectorUtils['isSelectedBenchmark'](component.portfolio, benchmark)).toBeFalsy();

        component.portfolio.benchmark = benchmark;
        expect(BenchmarkSelectorUtils['isSelectedBenchmark'](component.portfolio, benchmark)).toBeTruthy();

        // Same for 'NONE' portfolio
        benchmark = Benchmark.create(BenchmarkConstants.NONE_BENCH);
        expect(BenchmarkSelectorUtils['isSelectedBenchmark'](component.portfolio, benchmark)).toBeFalsy();

        component.portfolio.benchmark = benchmark;
        expect(BenchmarkSelectorUtils['isSelectedBenchmark'](component.portfolio, benchmark)).toBeTruthy();
    });

    it('isSelectedBenchmark test case - for bench-aggregate', () => {
        component.portfolio.benchmark = Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, 1);

        // type and order both match
        expect(BenchmarkSelectorUtils['isSelectedBenchmark'](component.portfolio, Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, 1, BenchmarkConstants.BENCH_PRIMARY)))
            .toBeTruthy();

        // only type matches
        expect(BenchmarkSelectorUtils['isSelectedBenchmark'](component.portfolio, Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, 2, BenchmarkConstants.BENCH_PRIMARY)))
            .toBeFalsy();
    });

    describe('onPortfolioChangeClicked Test', () => {
        it('should reset all the settings for cancel click', () => {
            component.onPortfolioChangeClicked(true);
            expect(component.searchMode).toBeFalsy();
            expect(component.whatIfLoaded).toBeFalsy();
            expect(component.whatIfSearchMode).toBeFalsy();
            expect(component.enableCancelButton).toBeFalsy();
        });

        it('should test portfolio settings', () => {
            component.isWhatIfSelected = false;
            component.onPortfolioChangeClicked();
            expect(component.searchMode).toBeTruthy();
            expect(component.whatIfSearchMode).toBeFalsy();
            expect(component.enableCancelButton).toBeTruthy();
        });
    });

    it('initialize component in cell editor', () => {
        const portfolio: AbstractFavoriteConfig = new Portfolio();
        portfolio.deserialize(dummyScheduledJobs.portfolioTableData[0].portfolio);
        component.agInit({
            portfolio,
            batchRunAs: true,
            disablePopover: true,
            allowOther: true,
            isDisabled: true,
            showLabel: true,
            triggerWidgetReloadEvents: true
        } as any);
        expect(component.portfolio.datePicker.getDateAsText()).toEqual((portfolio as Portfolio).datePicker.getDateAsText());
        expect(component.portfolio.datePicker.calCode).toEqual((portfolio as Portfolio).datePicker.calCode);
        expect(component.inAgGrid).toBeTruthy();
        expect(component.batchRunAs).toBeTruthy();
        expect(component.disablePopover).toBeTruthy();
        expect(component.allowOther).toBeTruthy();
        expect(component.isDisabled).toBeTruthy();
        expect(component.showLabel).toBeTruthy();
        expect(component.triggerWidgetReloadEvents).toBeTruthy();
    });
});
