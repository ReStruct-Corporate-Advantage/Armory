import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Observable, of} from 'rxjs';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {PricePopupChartComponent} from './price-popup-chart.component';
import {TestUtils} from '@utils/test.utils';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {PriceChartInputs} from '@models/price-chart-inputs/price-chart-inputs.model';
import {UserMetaDataStore} from '@stores/user-meta-data.store';
import {WorkspaceStore} from '@stores/workspace.store';
import {UserPreference} from '../../../constants';
import {PriceChartService} from '@services/price-chart/price-chart.service';
import {HttpClient} from '@angular/common/http';
import {ExploreConstants} from '../../../constants';
import {CoreUserMetaDataStore, DateValue, UserMetaData} from '@blk/explore-ui-core';

describe('PricePopupChartComponent', () => {
    let component: PricePopupChartComponent;
    let fixture: ComponentFixture<PricePopupChartComponent>;

    beforeAll((done) => {
        TestUtils.initialize(done);
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentPortfolio(new Portfolio('PEP', new DateValue({date: '5/10/2016'})));
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
    });

    const priceChartServiceStub = {
        getEquityPriceDataURL: jest.fn(
            (): Observable<Object> => {
                return of([
                    {date: '10-JUN-2015', price: 9.35},
                    {date: '11-JUN-2015', price: 9.67}
                ]);
            }
        ),
        getTradesData: jest.fn(
            (): Observable<Object> => {
                return of([]);
            }
        ),
        getNotesByDateRange: jest.fn(
            (): Observable<Object> => {
                return of([
                    {
                        id: 1000000881280,
                        analyst_login: 'ocrawley',
                        analyst_name: 'Oisin Crawley',
                        subject: 'Research template AGL AU',
                        pub_time: 1434524154000,
                        pub_time_utc: 1434524154000,
                        attachment: true,
                        status: 'E'
                    }
                ]);
            }
        ),
        getListHistoryByDate: jest.fn(
            (): Observable<Object> => {
                return of([]);
            }
        )
    };

    const httpGetMockFn = jest.fn();
    const httpPostMockFn = jest.fn();

    const httpMock = {
        get: httpGetMockFn,
        post: httpPostMockFn
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [PricePopupChartComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: PriceChartService, useValue: priceChartServiceStub},
                {provide: HttpClient, useValue: httpMock}
            ]
        });

        fixture = TestBed.createComponent(PricePopupChartComponent);
        component = fixture.componentInstance;
        component.priceChartInputs = new PriceChartInputs('cusip0', 'Label');
        component.isOpen = false;
        fixture.detectChanges();
    });

    it('should init', () => {
        expect(component).toBeTruthy();
        expect(component.stockPriceChartDarkMode).toBeFalsy();
        expect(component.isOpen).toBeFalsy();
        component.ngOnInit();
        expect(component.startDate).toBe('05/10/2015');
        expect(component.endDate).toBe('5/10/2016');
        expect(component.stockPriceChartOptions.assetId).toBe('cusip0');
        expect(component.stockPriceChartOptions.portfolio.ticker).toBe('PEP');
        expect(component.stockPriceChartOptions.portfolio.id).toBe(0);
        expect(component.stockPriceChartData$).toBeDefined();
    });

    it('Change the user preference and see that the state changes', async () => {
        UserMetaDataStore.setPreferenceValue(UserPreference.THEME, ExploreConstants.THEME_DARK_MODE);
        await expect(component.stockPriceChartDarkMode).toBeTruthy();
    });

    it('should load stock price chart', async () => {
        jest.spyOn(component.stockPriceChartData$, 'next');
        component.loadStockPriceChart(component.stockPriceChartOptions, component.startDate, component.endDate);
        expect(priceChartServiceStub.getEquityPriceDataURL).toHaveBeenCalled();
        expect(priceChartServiceStub.getTradesData).toHaveBeenCalled();
        expect(priceChartServiceStub.getNotesByDateRange).toHaveBeenCalled();
        expect(priceChartServiceStub.getListHistoryByDate).not.toHaveBeenCalled();
        await expect(component.stockPriceChartData$.next).toHaveBeenCalled();
    });

    it('should onStockPriceChartOptionsChanged', () => {
        component.stockPriceChartOptions.investmentOpinionLists = [
            {
                listId: 'id',
                listName: 'list name'
            }
        ];
        component.stockPriceChartOptions.targetPriceLists = [
            {
                listId: 'priceId',
                listName: 'price list name'
            }
        ];
        jest.spyOn(component.stockPriceChartData$, 'next');
        component.onStockPriceChartOptionsChanged(component.stockPriceChartOptions);
        expect(priceChartServiceStub.getTradesData).toHaveBeenCalled();
        expect(priceChartServiceStub.getListHistoryByDate).toHaveBeenCalledTimes(2);
        expect(component.stockPriceChartData$.next).toHaveBeenCalled();
    });

    it('should close modal', () => {
        component.isOpen = true;
        expect(component.isOpen).toBeTruthy();
        jest.spyOn(component.modalClosed, 'emit');
        component.closeModal();
        expect(component.isOpen).toBeFalsy();
        expect(component.modalClosed.emit).toHaveBeenCalled();
    });
});
