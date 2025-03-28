import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {DateService, DateValue, TimePeriod} from '@blk/explore-ui-core';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Http2BmsService} from '@services/bms';
import {TestUtils} from '@utils/test.utils';
import {Observable, of} from 'rxjs';
import {WorkspaceStore} from '../../../stores';
import {PerformanceTimePeriodSettingsService} from './performance-time-period-settings.service';

describe('PerformanceTimePeriodSettingsService', () => {
    let service: PerformanceTimePeriodSettingsService;

    const httpServiceStub = {
        post$: jest.fn((url: string, requestParams: any) => {
            return of ({data: {
                startDate: '10/07/2014',
                endDate: '10/07/2016',
                fullName: 'Year to Date'
            }});
        })
    };
    const dateServiceStub = {
        parseDateString$: jest.fn(
            (code: string, dateString: string): Observable<Date> => {
                if (dateString === 'T-1') {
                    return of(new Date('10/14/2020'));
                } else {
                    return of(new Date('10/13/2020'));
                }
            }
        )
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: DateService, useValue: dateServiceStub},
                {provide: Http2BmsService, useValue: httpServiceStub}
            ]
        });
        service = TestBed.inject(PerformanceTimePeriodSettingsService);

        PerformanceTimePeriodSettingsService.portfolio = new Portfolio('PEP');
        PerformanceTimePeriodSettingsService.portfolio.isIndexResearchPortfolio = false;
        PerformanceTimePeriodSettingsService.portfolio.datePicker = new DateValue({calCode: 'INDEX_ALL_Calendar', dateString: false, date: '10/07/2016'});
        PerformanceTimePeriodSettingsService.portfolio.timePeriods = [
            {
                Value: 'YTD',
                interval: 'Year',
                maxPeriods: 7,
                type: 'To Date'
            }, {
                Value: 'Years',
                interval: 'Year',
                maxPeriods: 7,
                type: 'Rolling'
            }, {
                Value: 'WTD',
                interval: 'Week',
                maxPeriods: 3,
                type: 'To Date'
            }];
    });

    it('should be created', () => {
        const serviceInstance: PerformanceTimePeriodSettingsService = TestBed.inject(PerformanceTimePeriodSettingsService);
        expect(serviceInstance).toBeTruthy();
    });

    describe('modifyTimePeriod$ Test', () => {
        it('should test modifyTimePeriod$ in regular scenario', (done) => {
            const timePeriod = new TimePeriod('Year to Date', 2, 'YTD');


            jest.spyOn<any>(service, 'setDatesFromTimePeriod$').mockImplementation(function (timePeriodInstance: TimePeriod) {
                return new Observable((subscriber) => {
                    timePeriodInstance.fromDateValue = '10/07/2014';
                    timePeriodInstance.toDateValue = '10/07/2016';
                    timePeriodInstance.timePeriodName = 'Year to Date';
                    subscriber.next(timePeriodInstance);
                });
            });

            const sbsc1 = service.populateTimePeriodFromValue$(timePeriod)
                .subscribe((value) => {
                    const sbsc2 = service.modifyTimePeriod$(value).subscribe((retValue) => {
                        expect(retValue.shortName).toEqual('YTD');
                        expect(retValue.fromDateValue).toEqual('10/07/2014');
                        expect(retValue.toDateValue).toEqual('10/07/2016');
                        expect(retValue.numberOfPeriods).toEqual(2);
                        expect(retValue.timePeriodName).toEqual('Year to Date');
                        done();
                    });
                sbsc2.unsubscribe();
            });
            sbsc1.unsubscribe();
        });

        it('should not call getDatesForTimePeriod$ to fetch the time data in custom case scenario', () => {
            jest.spyOn(service, 'setDatesFromTimePeriod$' as any);
            jest.spyOn(service, 'getDatesForTimePeriod$').mockReturnValue(of({
                startDate: '10/07/2014',
                endDate: '10/07/2016',
                fullName: 'Year to Date'
            }));

            const timePeriod = new TimePeriod('Year to Date', 2, 'CUSTOM');

            const sbsc = service.modifyTimePeriod$(timePeriod)
                .subscribe(() => {
                    expect(service['setDatesFromTimePeriod$']).not.toHaveBeenCalled();
                    expect(service.getDatesForTimePeriod$).not.toHaveBeenCalled();
                });
            sbsc.unsubscribe();
        });
    });

    describe('populateTimePeriodFromValue$ Test', () => {
        it('should test populateTimePeriodFromValue$ in regular scenario', (done) => {
            const timePeriod = new TimePeriod('Week to Date', 2, 'WTD');
            jest.spyOn<any>(service, 'setDatesFromTimePeriod$').mockImplementation((timePeriodInstance: TimePeriod) => {
                return new Observable((subscriber) => {
                    timePeriodInstance.fromDateValue = '10/07/2014';
                    timePeriodInstance.toDateValue = '10/14/2014';
                    timePeriodInstance.timePeriodName = 'Week to Date';
                    subscriber.next(timePeriodInstance);
                });
            });

            // const sbsc = service.populateTimePeriodFromValue$(timePeriod, datePicker, portfolioTimePeriods, 'PEP', false)
            const sbsc = service.populateTimePeriodFromValue$(timePeriod)
                .subscribe((value) => {
                    expect(timePeriod.shortName).toEqual('WTD');
                    expect(timePeriod.fromDateValue).toEqual('10/07/2014');
                    expect(timePeriod.toDateValue).toEqual('10/14/2014');
                    expect(timePeriod.numberOfPeriods).toEqual(2);
                    expect(timePeriod.timePeriodName).toEqual('Week to Date');
                    done();
                });
            sbsc.unsubscribe();
        });

        describe('populateTimePeriodFromValue$ - in custom case scenarios', () => {
            beforeEach(() => {
                jest.spyOn(service['dateService'], 'parseDateString$');
            });

            afterEach(() => {
                jest.clearAllMocks();
            });

            it('should call parseDateString$ two times for both fromDateValue and toDateValue', (done) => {
                const timePeriod = new TimePeriod('Week to Date', 2, 'CUSTOM', 'T-2', 'T-1');
                expect(timePeriod.fromDate.date).toBeUndefined();
                expect(timePeriod.toDate.date).toBeUndefined();
                // const sbsc = service.populateTimePeriodFromValue$(timePeriod, datePicker, portfolioTimePeriods, 'PEP', false)
                const sbsc = service.populateTimePeriodFromValue$(timePeriod)
                    .subscribe(() => {
                        expect(service['dateService'].parseDateString$).toHaveBeenCalledTimes(2);
                        expect(timePeriod.fromDate.date).toBe('10/13/2020');
                        expect(timePeriod.toDate.date).toBe('10/14/2020');
                        done();
                    });

                sbsc.unsubscribe();
            });

            it('should call parseDateString$ for fromDate only', (done) => {
                const timePeriod = new TimePeriod('Week to Date', 2, 'CUSTOM', 'T-2', '10/14/2020');
                expect(timePeriod.fromDate.date).toBeUndefined();

                // const sbsc = service.populateTimePeriodFromValue$(timePeriod, datePicker, portfolioTimePeriods, 'PEP', false)
                const sbsc = service.populateTimePeriodFromValue$(timePeriod)
                    .subscribe(() => {
                        expect(service['dateService'].parseDateString$).toHaveBeenCalledTimes(1);
                        expect(timePeriod.fromDate.date).toBe('10/13/2020');
                        done();
                    });

                sbsc.unsubscribe();
            });

            it('should call parseDateString$ for toDate only', (done) => {
                const timePeriod = new TimePeriod('Week to Date', 2, 'CUSTOM', '10/13/2020', 'T-1');
                expect(timePeriod.toDate.date).toBeUndefined();

                // const sbsc = service.populateTimePeriodFromValue$(timePeriod, datePicker, portfolioTimePeriods, 'PEP', false)
                const sbsc = service.populateTimePeriodFromValue$(timePeriod)
                    .subscribe(() => {
                        expect(service['dateService'].parseDateString$).toHaveBeenCalledTimes(1);
                        expect(timePeriod.toDate.date).toBe('10/14/2020');
                        done();
                    });

                sbsc.unsubscribe();
            });
        });
    });

    it('getAvailableTypes', () => {
        const availableTypes = service.getAvailableTypes();
        expect(availableTypes).toEqual(['To Date', 'Rolling']);
    });

    it('getAvailableIntervals', () => {
        const timePeriod = new TimePeriod('Year to Date', 2, 'YTD');

        jest.spyOn<any>(service, 'setDatesFromTimePeriod$').mockImplementation((timePeriod1: TimePeriod) => {
            timePeriod1.fromDateValue = '10/07/2014';
            timePeriod1.toDateValue = '10/07/2016';
            timePeriod1.timePeriodName = 'Year to Date';
        });

        service.populateTimePeriodFromValue$(timePeriod);
        const availableIntervals = service.getAvailableIntervals(timePeriod);
        expect(availableIntervals).toEqual(['Year', 'Week']);
    });

    it('getTimePeriodByShortName', () => {
        const timePeriod = service['getTimePeriodByShortName']('YTD');
        expect(JSON.stringify(timePeriod)).toEqual('{"Value":"YTD","interval":"Year","maxPeriods":7,"type":"To Date"}');
    });

    it('getIntervalsByType', () => {
        const intervals = service.getIntervalsByType('To Date');
        expect(intervals).toEqual(['Year', 'Week']);
    });

    it('setCustomTimePeriodDetails', () => {
        const intervals = service.getIntervalsByType('To Date');
        expect(intervals).toEqual(['Year', 'Week']);
    });

    it('setDatesFromTimePeriod$', (done) => {
        WorkspaceStore.init();
        const datePicker = PerformanceTimePeriodSettingsService.portfolio.datePicker;
        const timePeriod = new TimePeriod('Year to Date', 2, 'YTD');
        jest.spyOn(service, 'getDatesForTimePeriod$').mockReturnValue(of({
            startDate: '10/07/2014',
            endDate: '10/07/2016',
            fullName: 'Year to Date'
        }));
        const sbsc = service['setDatesFromTimePeriod$'](timePeriod)
            .subscribe(() => {
                expect(timePeriod.fromDateValue).toEqual('10/07/2014');
                expect(timePeriod.toDateValue).toEqual('10/07/2016');
                expect(timePeriod.timePeriodName).toEqual('Year to Date');
                expect(service.getDatesForTimePeriod$).toHaveBeenCalledWith(timePeriod.shortName, timePeriod.numberOfPeriods, datePicker.date, datePicker.calCode, 'PEP', false);
                done();
            });
        sbsc.unsubscribe();
    });

    it('getDatesForTimePeriod$', (done) => {
        PerformanceTimePeriodSettingsService.timePeriodDatesCache.clear();
        service.getDatesForTimePeriod$('YTD', 2, '10/07/2016', 'INDEX_ALL_Calendar', 'PEP', true)
            .subscribe((data) => {
                expect(data.startDate).toBe('10/07/2014');
                expect(data.endDate).toBe('10/07/2016');
                expect(data.fullName).toBe('Year to Date');
                expect(httpServiceStub.post$).toHaveBeenCalled();
                expect(PerformanceTimePeriodSettingsService.timePeriodDatesCache.size === 1);
                done();
            });
    });

    it('getDatesForTimePeriod$ from cache', (done) => {
        PerformanceTimePeriodSettingsService.timePeriodDatesCache.clear();
        const requestParams: any = {
            timePeriodShortName: 'YTD',
            numberOfPeriods: 2,
            asOfDate: '10/07/2016',
            holidayCalendar: 'INDEX_ALL_Calendar',
            portfolioName: 'PEP',
            isIndexHistoryPort: true
        };
        PerformanceTimePeriodSettingsService.timePeriodDatesCache.set(JSON.stringify(requestParams), {endDate: '10/07/2016', fullName: 'Year to Date', startDate: '10/07/2014'});
        service.getDatesForTimePeriod$('YTD', 2, '10/07/2016', 'INDEX_ALL_Calendar', 'PEP', true)
            .subscribe((data) => {
                expect(data.startDate).toBe('10/07/2014');
                expect(data.endDate).toBe('10/07/2016');
                expect(data.fullName).toBe('Year to Date');
                expect(httpServiceStub.post$).not.toHaveBeenCalled();
                expect(PerformanceTimePeriodSettingsService.timePeriodDatesCache.size === 1);
                done();
            });
    });

    it('getDatesForTimePeriod$ not from cache since key is different', (done) => {
        PerformanceTimePeriodSettingsService.timePeriodDatesCache.clear();
        const requestParams: any = {
            timePeriodShortName: 'YTD',
            numberOfPeriods: 2,
            asOfDate: '10/07/2016',
            holidayCalendar: 'INDEX_ALL_Calendar',
            portfolioName: 'PEP',
            isIndexHistoryPort: true
        };
        PerformanceTimePeriodSettingsService.timePeriodDatesCache.set(JSON.stringify(requestParams), {endDate: '10/07/2016', fullName: 'Year to Date', startDate: '10/07/2014'});
        service.getDatesForTimePeriod$('YTD', 3, '10/07/2016', 'INDEX_ALL_Calendar', 'PEP', true)
            .subscribe((data) => {
                expect(data.startDate).toBe('10/07/2014');
                expect(data.endDate).toBe('10/07/2016');
                expect(data.fullName).toBe('Year to Date');
                expect(httpServiceStub.post$).toHaveBeenCalled();
                expect(PerformanceTimePeriodSettingsService.timePeriodDatesCache.size === 2);
                done();
            });
    });
});
