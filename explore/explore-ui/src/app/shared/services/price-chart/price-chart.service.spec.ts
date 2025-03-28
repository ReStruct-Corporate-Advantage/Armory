import {TestBed} from '@angular/core/testing';
import {HttpClient, HttpClientModule} from '@angular/common/http';
import {PriceChartService} from './price-chart.service';
import {Observable, of} from 'rxjs';

/**
 * Test cases for PriceChartService
 */
describe('PriceChartService', () => {
    const httpClient = {
        get: jest.fn((url: string): Observable<any> => {
            if (url === '/aladdinresearch/app/get-equity-price-data') {
                return of([
                    {date: '10-JUN-2015', price: 9.35},
                    {date: '11-JUN-2015', price: 9.67}
                ]);
            } else if (url === '/aladdinresearch/app/get-trades-by-date-range') {
                return of([
                    {tradeDate: '10-JUN-2015', portfolioName: 'PEP'}
                ]);
            } else if (url === '/aladdinresearch/search/get-notes-by-date-range') {
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
            } else if (url === '/aladdinresearch/app/get-list-history') {
                return of ({status: 'FAILED'});
            }
        })
    };

    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [HttpClientModule],
            providers: [{provide: HttpClient, useValue: httpClient}]
        })
    );

    it('should be created', () => {
        const service: PriceChartService = TestBed.inject(PriceChartService);
        expect(service).toBeTruthy();
    });

    it('validate equity price, trade data and research notes data service api', () => {
        const service: PriceChartService = TestBed.inject(PriceChartService);
        expect(service.getEquityPriceDataURL('S60068863', new Date(), new Date())).toBeDefined();
        expect(service.getTradesData('PEP', 'S60068863', new Date(), new Date())).toBeDefined();
        expect(service.getNotesByDateRange('S60068863', new Date(), new Date())).toBeDefined();
        expect(service.getListHistoryByDate('S60068863', '', new Date(), new Date())).toBeDefined();
    });

    it('should get equity price data', () => {
        const service: PriceChartService = TestBed.inject(PriceChartService);
        const marketResponse = service.getEquityPriceDataURL('S60068863', new Date(), new Date());
        expect(httpClient.get).toHaveBeenCalled();
        httpClient.get('/aladdinresearch/app/get-equity-price-data').subscribe(data => {
            expect(data.date).toBe('10-JUN-2015');
        });
        marketResponse.subscribe(data => {
            expect(data.length).toBe(2);
            expect(data[0].date).toBe(new Date('10-JUN-2015'));
            expect(data[0].price).toBe(9.35);
            expect(data[1].date).toBe(new Date('11-JUN-2015'));
            expect(data[1].price).toBe(9.67);
        });
    });

    it('should get trade data', () => {
        const service: PriceChartService = TestBed.inject(PriceChartService);
        const tradeResponse = service.getTradesData('PEP', 'S60068863', new Date(), new Date());
        expect(httpClient.get).toHaveBeenCalled();
        httpClient.get('/aladdinresearch/app/get-trades-by-date-range').subscribe(data => {
            expect(data.tradeDate).toBeUndefined();
        });
        tradeResponse.subscribe(data => {
            expect(data.length).toBe(1);
            expect(data[0].tradeDate).toBe(new Date('10-JUN-2015'));
            expect(data[0].portfolioName).toBe('PEP');
        });
    });

    it('should get research notes data', () => {
        const service: PriceChartService = TestBed.inject(PriceChartService);
        const notesResponse = service.getNotesByDateRange('S60068863', new Date(), new Date());
        expect(httpClient.get).toHaveBeenCalled();
        httpClient.get('/aladdinresearch/search/get-notes-by-date-range').subscribe(data => {
            expect(data.analyst_name).toBe('Oisin Crawley');
        });
        notesResponse.subscribe(data => {
            expect(data.length).toBe(1);
            expect(data[0].subject).toBe('Research template AGL AU');
            expect(data[0].analystName).toBe('Oisin Crawley');
            expect(data[0].noteId).toBe(1000000881280);
            expect(data[0].publishTime).toBe(new Date(1434524154000));
        });
    });

    it('should get list history data', () => {
        const service: PriceChartService = TestBed.inject(PriceChartService);
        const historyResponse = service.getListHistoryByDate('S60068863', '', new Date(), new Date());
        expect(httpClient.get).toHaveBeenCalled();
        httpClient.get('/aladdinresearch/app/get-list-history').subscribe(data => {
            expect(data.modifierName).toBeUndefined();
        });
        historyResponse.subscribe(data => {
            expect(data).toThrowError();
        });
    });
});
