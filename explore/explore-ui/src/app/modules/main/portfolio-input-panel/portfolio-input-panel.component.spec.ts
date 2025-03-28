import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PortfolioInputPanelComponent} from './portfolio-input-panel.component';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {BenchmarkConstants} from '../../../constants';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {BehaviorSubject} from 'rxjs';
import {AuxSelectOptionGroup} from '@blk/aladdin-angular-components';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {DefinitionsStore, WorkspaceStore} from '../../../stores';
import {WorkpadService} from '@services/workspace';
import {
    CommonUtils,
    CoreCommonConstants,
    CoreUserMetaDataStore,
    DateValue,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    UserMetaData
} from '@blk/explore-ui-core';
import {PortfolioWithPositions} from '@models/portfolio/portfolio-with-positions.model';

describe('PortfolioInputPanelComponent', () => {
    let component: PortfolioInputPanelComponent;
    let fixture: ComponentFixture<PortfolioInputPanelComponent>;
    jest.spyOn(CommonUtils, 'generateUniqueIdAsString').mockImplementation(() => '-0.999999');
    WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(new Portfolio('PEP'));
    WorkspaceStore.currentPortfolio$.value.datePicker = new DateValue({
        date: '09/01/2020',
        dateStringValue: 'T-1',
        dateString: true,
        calCode: 'GP_HK_STD'
    });
    WorkspaceStore.currentPortfolio$.value.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'MSAC_APACN');
    WorkspaceStore.currentWorkpad$ = new BehaviorSubject<BaseWorkpad>(new FlatWorkpad());

    const workpadServiceStub = {
        updatePortInfoOnDateChange: jest.fn()
    };

    beforeAll(() => {
        DefinitionsStore.currency = ['USD', 'CAD', 'AUD', 'COP', 'YEN'];
    });

    beforeEach(() => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        TestBed.configureTestingModule({
            declarations: [PortfolioInputPanelComponent],
            schemas: [NO_ERRORS_SCHEMA],
            providers: [
                {provide: WorkpadService, useValue: workpadServiceStub}
            ]
        });

        fixture = TestBed.createComponent(PortfolioInputPanelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('ngOnInit Test', () => {
        it('tests ngOnInit', () => {
            const port: Portfolio = new Portfolio('PEP');
            port.datePicker = new DateValue({
                date: '09/01/2020',
                dateStringValue: 'T-1',
                dateString: true,
                calCode: 'GP_HK_STD'
            });
            port.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'MSAC_APACN');
            component.portfolio = null;
            component.ngOnInit();
            expect(component.portfolio.equals(port)).toBeTruthy();
        });

        it('tests ngOnInit PositionBased Portfolio', () => {
            CoreUserMetaDataStore.userMetaData.login = 'user01';
            const port = new PortfolioWithPositions('PEP');
            port.datePicker = new DateValue({
                date: '09/01/2020',
                dateStringValue: 'T-1',
                dateString: true,
                calCode: 'GP_HK_STD'
            });
            port.benchmark = Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'MSAC_APACN');
            WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(port);

            component.portfolio = null;
            component.ngOnInit();
            expect(component.portfolio.equals(port)).toBeTruthy();
            expect(component.isDateDisabled).toBeTruthy();
        });
    });

    it('should test getCurrencyOptions', () => {
        component.portfolio.currency = 'CAD';
        const currencies: string[] = ['USD', 'CAD', 'AUD', 'COP', 'YEN'];
        const expectedCurrencyOptions: ExploreSelectOptionGroup[] = [
            new ExploreSelectOptionGroup([
                new ExploreSelectOption('USD', 'USD', false),
                new ExploreSelectOption('CAD', 'CAD', true),
                new ExploreSelectOption('AUD', 'AUD', false),
                new ExploreSelectOption('COP', 'COP', false),
                new ExploreSelectOption('YEN', 'YEN', false)
            ])
        ];
        const currencyOptions: AuxSelectOptionGroup[] = component['getCurrencyOptions'](currencies);
        expect(currencyOptions).toEqual(expectedCurrencyOptions);
    });

    it('should test onCurrencyChange', () => {
        jest.spyOn(component['notificationService'], 'invokeWidgetReloadPrompt');
        component.onCurrencyChange('USD');
        expect(component.portfolio.currency).toBe('USD');
        expect(component['notificationService'].invokeWidgetReloadPrompt).toHaveBeenCalled();
    });

    it('should test onDropdownClosed', () => {
        component.currencyDropdown = {
            el: {
                inputValueRaw: 'random'
            }
        };
        component.onDropdownClosed();
        expect(component.currencyDropdown.el.inputValueRaw).toBe(CoreCommonConstants.EMPTY_STRING);
    });

    describe('Tests onDateChange', () => {
        it('should test onDateChange when the dateObject is the same as the portfolio\'s date', () => {
            jest.spyOn(workpadServiceStub, 'updatePortInfoOnDateChange');
            component.portfolio.datePicker = new DateValue({
                date: '09/01/2020',
                dateStringValue: 'T-1',
                dateString: true,
                calCode: 'GP_HK_STD'
            });
            const eventDate: DateValue = new DateValue({
                date: '09/01/2020',
                dateStringValue: 'T-1',
                dateString: true,
                calCode: 'GP_HK_STD'
            });
            component.onDateChange(eventDate);
            expect(workpadServiceStub.updatePortInfoOnDateChange).not.toHaveBeenCalled();
        });

        it('should test onDateChange when the dateObject is different from the portfolio\'s date', () => {
            jest.spyOn(workpadServiceStub, 'updatePortInfoOnDateChange');
            component.portfolio.datePicker = new DateValue({
                date: '09/01/2020',
                dateStringValue: 'T-1',
                dateString: true,
                calCode: 'GP_HK_STD'
            });
            const expectedDate: DateValue = new DateValue({
                date: '09/02/2020',
                dateStringValue: '',
                dateString: false,
                calCode: 'GP_HK_STD'
            });
            jest.spyOn(component['notificationService'], 'invokeWidgetReloadPrompt');
            component.onDateChange(expectedDate);
            expect(workpadServiceStub.updatePortInfoOnDateChange).toHaveBeenCalled();
            expect(component['notificationService'].invokeWidgetReloadPrompt).toHaveBeenCalled();
        });
    });

    describe('Test portfolio settings modal', () => {
        it('Test openPortfolioSettingsModal', () => {
            expect(component.isPortfolioSettingsModalOpen).toBeFalsy();

            // Set the portname to be PEP
            component.portfolio = new Portfolio('PEP');
            component.openPortfolioSettingsModal();
            // Values should now be properly set
            expect(component.isPortfolioSettingsModalOpen).toBeTruthy();
        });

        it('Test closePortfolioSettingsModal', () => {
            // Don't pass in a portfolio
            component.closePortfolioSettingsModal();
            expect(component.isPortfolioSettingsModalOpen).toBeFalsy();
        });
    });
});

export class PortfolioInputPanelComponentSpec {
    static createBenchmarks(): Benchmark[] {
        const benchmarks: Benchmark[] = [];
        benchmarks.push(Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 1, 'MSAC_APACN'));
        benchmarks.push(Benchmark.create(BenchmarkConstants.PERFORM, 4, 'MSAC_APACN'));
        benchmarks.push(Benchmark.create(BenchmarkConstants.BENCH_TYPE_RISK, 3, 'MSAC_APACN'));
        benchmarks.push(Benchmark.create(BenchmarkConstants.MODEL, 5, 'MSAC_APACN'));
        benchmarks.push(Benchmark.create(BenchmarkConstants.MODEL, 2, 'MSAC_APACN'));
        benchmarks.push(Benchmark.create(BenchmarkConstants.BENCH_AGGREGATE, 6, 'MSAC_APACN'));
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
