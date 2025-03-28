import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AddPortfolioComponent} from './add-portfolio.component';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ExplorePortfolioSearchService} from '@services/explore-portfolio-search/explore-portfolio-search.service';
import {AddPortfolioService} from '../add-portfolio.service';
import {Observable, of} from 'rxjs';

describe('AddPortfolioComponent', () => {
    let component: AddPortfolioComponent;
    let fixture: ComponentFixture<AddPortfolioComponent>;
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
        })
    };

    const addPortfolioServiceStub = {
        selectedPortfolioTickers: new Set<string>()
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AddPortfolioComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: ExplorePortfolioSearchService, useValue: portfolioSearchServiceStub},
                {provide: AddPortfolioService, useValue: addPortfolioServiceStub}
            ]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AddPortfolioComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('onAddPortfolioToSelectedListOfPortfolios Test', () => {

        it('should add new portfolio to modal', () => {
            const portfolio: PortfolioSearchItem = new PortfolioSearchItem('TIKR');
            component.onAddPortfolioToSelectedListOfPortfolios(portfolio);
            expect(component['addPortfolioService'].selectedPortfolioTickers.size).toBe(1);
            expect(component['addPortfolioService'].selectedPortfolioTickers.has(portfolio)).toBe(true);
        });
        it('should set isSearchFieldEmpty to true', () => {
            const portfolio: PortfolioSearchItem = new PortfolioSearchItem('TIKR', 'Ticker');
            component.onAddPortfolioToSelectedListOfPortfolios(portfolio);
            expect(component.isSearchFieldEmpty).toBeTruthy();
        });
    });

    describe('onSearchValueChanged Test', () => {
        it('should set isSearchFieldEmpty to true when search term is empty', () => {
            const searchTerm = '';
            component.onSearchValueChanged(searchTerm);
            expect(component.isSearchFieldEmpty).toBeTruthy();
        });
        it('should set isSearchFieldEmpty to false when search term is not empty', () => {
            const searchTerm = 'PEP';
            component.onSearchValueChanged(searchTerm);
            expect(component.isSearchFieldEmpty).toBeFalsy();
        });
    });

    describe('doWhenParsed Test', () => {
        it('should add parsed data to selectedPortfolioTickers', () => {
            const parsedData = [['TIKR1'], ['TIKR2']];
            addPortfolioServiceStub.selectedPortfolioTickers.clear();
            component['doWhenParsed'](parsedData);
            expect(addPortfolioServiceStub.selectedPortfolioTickers.size).toBe(2);

        });

        it('should do nothing if parsed data is empty', () => {
            const parsedData: string[][] = [];
            addPortfolioServiceStub.selectedPortfolioTickers.clear();

            component['doWhenParsed'](parsedData);
            expect(addPortfolioServiceStub.selectedPortfolioTickers.size).toBe(0);
        });
    });

    describe('uploadPortfolios and hideUploadScreen Tests', () => {
        it('should set showUploadScreen to true when uploadPortfolios is called', () => {
            component.uploadPortfolios();
            expect(component.showUploadScreen).toBe(true);
        });

        it('should set showUploadScreen to false when hideUploadScreen is called', () => {
            component.hideUploadScreen();
            expect(component.showUploadScreen).toBe(false);
        });
    });


    it('adds tickers to selectedPortfolioTickers', () => {
        addPortfolioServiceStub.selectedPortfolioTickers = new Set<string>();
        component['doWhenParsed']([['What-if SNP100 1', '40,000', 'ktalwar', 'THROUGH_TIME'], ['POS BASED ILB3', '60,000', 'ktalwar', 'POINT_IN_TIME'], ['pep', '67000'], ['core-hq', '98000']]);
        expect(addPortfolioServiceStub.selectedPortfolioTickers.size).toBe(4);

        component['doWhenParsed']([]);
        expect(addPortfolioServiceStub.selectedPortfolioTickers.size).toBe(4);
    });
});
