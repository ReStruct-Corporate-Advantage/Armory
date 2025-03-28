import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Observable, of} from 'rxjs';

import {PortfolioSearchComponent, PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {ExplorePortfolioSearchService} from '@services/index';
import {AddPortfolioService} from '../add-portfolio.service';
import {AddWhatIfPortfolioComponent} from './add-whatif-portfolio.component';

describe('AddWhatIfPortfolioComponent', () => {
    let component: AddWhatIfPortfolioComponent;
    let fixture: ComponentFixture<AddWhatIfPortfolioComponent>;

    const portfolioSearchServiceStub = {
        searchPortfolio: jest.fn((): Observable<any> => {
            return of({
                searchResults: [
                    {
                        code: '9214',
                        currency: 'USD',
                        familyTree: [],
                        fullName: 'BGF Pacific Equity Fund',
                        ticker: 'PEP'
                    }, {
                        code: '-74272',
                        currency: 'USD',
                        familyTree: [],
                        fullName: 'Perf Benchmark for PEP-AU',
                        ticker: 'PEP--HP'
                    }, {
                        code: '-551466',
                        currency: 'USD',
                        familyTree: [],
                        fullName: '1885 PRIVATE OPPORTUNITIES FUND, L.P.',
                        ticker: 'PEP-1885'
                    }
                ]
            });
        }),
        enableWhatIfSearch: jest.fn()
    };

    const addPortfolioServiceStub = {
        selectedPortfolioTickers: new Set<string>()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AddWhatIfPortfolioComponent, PortfolioSearchComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ExplorePortfolioSearchService, useValue: portfolioSearchServiceStub},
                {provide: AddPortfolioService, useValue: addPortfolioServiceStub}
            ]
        });

        fixture = TestBed.createComponent(AddWhatIfPortfolioComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('onAddPortfolioToSelectedListOfPortfolios Test', () => {

        it('should add new portfolio to modal', () => {
            const portfolio: PortfolioSearchItem = new PortfolioSearchItem('TIKR');
            component.onAddPortfolioToSelectedListOfPortfolios(portfolio);
            expect(component['addPortfolioService'].selectedPortfolioTickers.size).toBe(1);
            expect(component['addPortfolioService'].selectedPortfolioTickers.has(portfolio)).toBe(true);
        });
    });
});
