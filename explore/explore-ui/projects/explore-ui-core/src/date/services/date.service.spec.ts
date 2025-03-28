import {HTTP_SERVICE_TOKEN} from '../../core/tokens';
import {CalendarDateUtils} from '../utils';
import {DateService} from './date.service';
import {of} from 'rxjs';
import {async as _async} from 'rxjs/internal/scheduler/async';
import {TestBed} from '@angular/core/testing';
import moment from 'moment';

/**
 * Test cases for DateService
 */
describe('Date Service', () => {
    let service: DateService;

    const httpServiceStub = {
        post$: jest.fn(() => {
            return of({'data': '02/18/2020'}, _async);
        })
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [DateService, {provide: HTTP_SERVICE_TOKEN, useValue: httpServiceStub}]
        });
        service = TestBed.inject(DateService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('parseDateString$ Tests', function () {
        it('should return an observable with today\'s date', function (done: any) {
            const calCode = 'GP_HK_STD';
            const dateString = 'T';
            CalendarDateUtils.maxSelectableDate = '0';
            const today: Date = new Date();
            service.parseDateString$(calCode, dateString).subscribe((date: Date) => {
                expect(date.getDate()).toBe(today.getDate());
                expect(date.getMonth()).toBe(today.getMonth());
                expect(date.getFullYear()).toBe(today.getFullYear());
                done();
            });
        });

        it('should handle invalid relative dates', function (done: any) {
            const calCode = 'GP_HK_STD';
            const dateString = 'Tasdasd';
            const today: Date = new Date();
            service.parseDateString$(calCode, dateString).subscribe((date: Date) => {
                expect(date).toBeUndefined();
                done();
            });
        });

        it('should handle invalid relative dates', function (done: any) {
            const calCode = 'GP_HK_STD';
            const dateString = 'T-A1Me';
            const today: Date = new Date();
            service.parseDateString$(calCode, dateString).subscribe((date: Date) => {
                expect(date).toBeUndefined();
                done();
            });
        });

        it('should handle invalid relative dates', function (done: any) {
            const calCode = 'GP_HK_STD';
            const dateString = 'T-1MEA';
            const today: Date = new Date();
            service.parseDateString$(calCode, dateString).subscribe((date: Date) => {
                expect(date).toBeUndefined();
                done();
            });
        });

        it('should return a cached relative date', function (done: any) {
            const calCode = 'GP_HK_STD';
            const dateString = 'T-1';
            const today: moment.Moment = moment();
            const cacheString: string = calCode + today.format('YYYYMMDD') + undefined + '1';
            CalendarDateUtils.relativeDateCache[cacheString] = new Date('02/18/2020');
            service.parseDateString$(calCode, dateString).subscribe((date: Date) => {
                expect(date).toStrictEqual(CalendarDateUtils.relativeDateCache[cacheString]);
                done();
            });
        });

        it('should return a cached relative date', function (done: any) {
            const calCode = 'GP_HK_STD';
            const dateString = 'T-1';
            const today: moment.Moment = moment();
            const cacheString: string = calCode + today.format('YYYYMMDD') + undefined + '1';
            CalendarDateUtils.relativeDateCache[cacheString] = undefined;
            service.parseDateString$(calCode, dateString).subscribe((date: Date) => {
                expect(date).toStrictEqual(CalendarDateUtils.relativeDateCache[cacheString]);
                expect(date).toStrictEqual(new Date('02/18/2020'));
                done();
            });
        });
    });
});
