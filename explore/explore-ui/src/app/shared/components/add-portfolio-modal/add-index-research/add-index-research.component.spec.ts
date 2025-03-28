import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {Observable, of} from 'rxjs';
import {async as _async} from 'rxjs/internal/scheduler/async';
import {ExploreIndexSearchService, Http2BmsService} from '@services/index';
import {AddPortfolioService} from '../add-portfolio.service';
import {AddIndexResearchComponent} from './add-index-research.component';

describe('AddIndexResearchComponent', () => {
    let component: AddIndexResearchComponent;
    let fixture: ComponentFixture<AddIndexResearchComponent>;

    const http2BmsServiceStub = {
        get$: jest.fn(() => {
            return of({}, _async);
        })
    };

    const indexSearchServiceStub = {
        searchIndex$: jest.fn((): Observable<any> => {
            return of({
                searchResults: [
                    {
                        fullName: 'BARCLAYS',
                        familyTree: [
                            {
                                fullName: 'BBG Barc 144A Ex Euro 300MM Min',
                                familyTree: [],
                                ticker: 'L144AXEURO',
                                CLASS_TYPE: 'com.bfm.app.prismweb.json.PortfolioSearchResultBean'
                            },
                            {
                                fullName: 'BBG Barc US Aggregate 300M 8-plus yr Index',
                                familyTree: [],
                                ticker: 'LEH300M8P',
                                CLASS_TYPE: 'com.bfm.app.prismweb.json.PortfolioSearchResultBean'
                            },
                            {
                                fullName: 'BBG Barc Credit 5-10 Yr Index',
                                familyTree: [],
                                ticker: 'LCRED5-10',
                                CLASS_TYPE: 'com.bfm.app.prismweb.json.PortfolioSearchResultBean'
                            }
                        ],
                        CLASS_TYPE: 'com.bfm.app.prismweb.json.PortfolioSearchResultBean'
                    }
                ]
            });
        })
    };

    const addPortfolioServiceStub = {
        selectedPortfolioTickers: new Set<string>()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AddIndexResearchComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: Http2BmsService, useValue: http2BmsServiceStub},
                {provide: ExploreIndexSearchService, useValue: indexSearchServiceStub},
                {provide: AddPortfolioService, useValue: addPortfolioServiceStub}
            ]
        });

        fixture = TestBed.createComponent(AddIndexResearchComponent);
        component = fixture.componentInstance;
        component.auxPickList = {
            sourceData: []
        } as any;
        fixture.detectChanges();
        component.ngOnInit();
    });

    describe('onGetIndexesFromSearchButtonClick Test', () => {
        it('should add elements to selectedPortTickerList', () => {
            component.auxPickList.getSourceSelection = jest.fn(() => {
                return of([
                    {
                        label: 'BARCLAYS',
                        children: [
                            {
                                ticker: 'LEH300M8P',
                                label: 'LEH300M8P (BBG Barc US Aggregate 300M 8-plus yr Index)',
                                children: undefined
                            },
                            {
                                ticker: 'LCREDLONG',
                                label: 'LCREDLONG (BBG Barc US Long Credit Index)',
                                children: undefined
                            }
                        ]
                    }
                ]).toPromise();
            });
            component.onGetIndexesFromSearchButtonClick();
        });
    });

    describe('onTickerClicked Test', () => {
        it('should set isTickerMarked to true when tickers selected in picklist', () => {
            const testEvent = {};
            testEvent['detail'] = {value:[{
                    ticker: 'LEH300M8P',
                    label: 'LEH300M8P (BBG Barc US Aggregate 300M 8-plus yr Index)',
                    children: undefined
                }]};

            component.onTickerClicked(testEvent as CustomEvent);
            expect(component.isTickerMarked).toBe(true);
        });

        it('should set isTickerMarked to false when no tickers selected in picklist', () => {
            const testEvent = {};
            testEvent['detail'] = {value:[]};

            component.onTickerClicked(testEvent as CustomEvent);
            expect(component.isTickerMarked).toBe(false);
        });
    });
});
