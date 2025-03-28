import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {WorkspaceStore} from '@stores/workspace.store';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PortfolioFloatingToolbarComponent} from './portfolio-floating-toolbar.component';
import {TestUtils} from '@utils/test.utils';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {DateValue} from '@blk/explore-ui-core';

describe('PortfolioFloatingToolbarComponent', () => {
    let component: PortfolioFloatingToolbarComponent;
    let fixture: ComponentFixture<PortfolioFloatingToolbarComponent>;

    const port = new Portfolio('PEP', new DateValue(), null, 'BGF Pacific Equity Fund', null);
    port.currency = 'USD';
    port.datePicker = new DateValue({
        calCode: 'GREEN_PKG',
        dateString: true,
        dateStringValue: 'T-10',
        date: '10-Mar-2019'
    });
    const benchmarks = [
        {
            'name': 'MSAC_APACN',
            'type': 'BenchAggregate',
            'order': 1
        },
        {
            'name': 'Primary',
            'order': 1
        },
        {
            'name': 'MSAC_APACN',
            'type': 'RISK',
            'order': 1
        },
        {
            'name': 'MSAC_APACN',
            'type': 'RISK',
        }
    ];

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PortfolioFloatingToolbarComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(PortfolioFloatingToolbarComponent);
        component = fixture.componentInstance;
        WorkspaceStore.init();
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(port);
        fixture.detectChanges();
    });

    describe('onInit Test', () => {
        it('should get Portfolio onInit', () => {
            component.ngOnInit();
            expect(component.portfolio.portName).toBe('PEP');
        });
    });

    it('should get Portfolio display information test', function () {
        const date = component.getDisplayDate();
        const currency = component.getCurrency();
        expect(date).toBe('10-Mar-2019');
        expect(currency).toBe('USD');

        expect(component.getBenchmarkDisplayName()).toBe('');

        port.benchmark = new Benchmark(benchmarks[0]);
        expect(component.getBenchmarkDisplayName()).toBe('Group Aggregate - Secondary');

        port.benchmark = new Benchmark(benchmarks[1]);
        expect(component.getBenchmarkDisplayName()).toBe('Primary');

        port.benchmark = new Benchmark(benchmarks[2]);
        expect(component.getBenchmarkDisplayName()).toBe('Primary (MSAC_APACN)');

        port.benchmark = new Benchmark(benchmarks[3]);
        expect(component.getBenchmarkDisplayName()).toBe('MSAC_APACN');
    });
});
