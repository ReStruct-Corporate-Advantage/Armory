import {ComponentFixture, TestBed} from '@angular/core/testing';
import {PerformanceTimePeriodSettingsService} from '../../performance-settings/services/performance-time-period-settings.service';
import {ExpostTimePeriodSettingsComponent} from './expost-time-period-settings.component';
import {AssetType, DateValue, TimePeriod} from '@blk/explore-ui-core';
import {TestUtils} from '@utils/test.utils';
import {Portfolio} from '../../../models/portfolio/portfolio.model';
import {WorkspaceStore} from '../../../stores';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {find} from 'lodash';

describe('ExpostTimePeriodSettingsComponent', () => {
    let component: ExpostTimePeriodSettingsComponent;
    let fixture: ComponentFixture<ExpostTimePeriodSettingsComponent>;
    WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(getPortfolio());

    const performanceTimePeriodSettingsServiceStub = {
        getDatesForTimePeriod$: jest.fn((timePeriod: string, numberOfPeriods: number, date: string, calCode: string, portfolioName: string, isIndexResearchPortfolio: boolean) => {
            return getResponse(timePeriod, numberOfPeriods);
        })
    };

    beforeAll(() => {
        TestUtils.initDefinitions();
    });

    /**
     * Performs required initialisation before each test is run
     */
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ExpostTimePeriodSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: PerformanceTimePeriodSettingsService, useValue: performanceTimePeriodSettingsServiceStub
                }
            ]
        });

        fixture = TestBed.createComponent(ExpostTimePeriodSettingsComponent);
        component = fixture.componentInstance;
        component.expostTimePeriod = new TimePeriod('', 1, 'Months');
    });

    describe('Test Component initialization with ngOnInit method', () => {
        it('Component should initialize with appropriate values', () => {
            component.ngOnInit();
            expect(performanceTimePeriodSettingsServiceStub.getDatesForTimePeriod$).toHaveBeenCalledTimes(6);
            expect(component.portfolio).toBeDefined();
            expect(component.supportedExpostTimeSeriesPeriods).toEqual(getExpectedExpostTimeSeriesPeriods());
            expect(component.expostTimePeriod.timePeriodName).toEqual('1 Month');
            expect(component.displayDataForExpostTimeSeriesPeriods[0].values.length).toBe(6);
            const selectedOption = find(component.displayDataForExpostTimeSeriesPeriods[0].values, {value: '1 Month'});

            expect(selectedOption.isSelected).toBe(true);
            expect(component.displayDataForExpostTimeSeriesPeriods[0].values[0].displayValue).toBe('1 Month(09-Feb-2017  -  09-Mar-2017)');
            expect(component.displayDataForExpostTimeSeriesPeriods[0].values[1].displayValue).toBe('6 Months(09-Sep-2016  -  09-Mar-2017)');
            expect(component.displayDataForExpostTimeSeriesPeriods[0].values[2].displayValue).toBe('1 Year(09-Mar-2016  -  09-Mar-2017)');
            expect(component.displayDataForExpostTimeSeriesPeriods[0].values[3].displayValue).toBe('3 Years(09-Mar-2014  -  09-Mar-2017)');
            expect(component.displayDataForExpostTimeSeriesPeriods[0].values[4].displayValue).toBe('5 Years(09-Mar-2012  -  09-Mar-2017)');
            expect(component.displayDataForExpostTimeSeriesPeriods[0].values[5].displayValue).toBe('Inception to Date(09-Mar-2010  -  09-Mar-2017)');
        });
    });

    describe('Test changeTimePeriod method', () => {
        it('changeTimePeriod should change the expostTimePeriod', async() => {
            component.ngOnInit();
            expect(component.expostTimePeriod).toEqual(new TimePeriod('1 Month', 1, 'Months'));
            const timePeriodName = '1 Year';
            component.changeTimePeriod(timePeriodName);
            expect(component.expostTimePeriod).toEqual(new TimePeriod('1 Year', 1, 'Years'));
        });
    });

    /**
     * Get the mock portfolio
     */
    function getPortfolio(): Portfolio {
        const port = new Portfolio('PEP');
        port.currency = 'USD';
        port.assetType = AssetType.EQUITY;
        port.datePicker = new DateValue({calCode: 'INDEX_ALL_Calendar', dateString: false, date: '03/09/2017'});
        return port;
    }

    /**
     * Function to get mock data returned by getDatesForTimePeriod$
     */
    function getResponse(timePeriod: string, numberOfPeriods: number): Observable<{endDate: string, fullName: string, startDate: string}> {
        if (timePeriod === 'Months' && numberOfPeriods === 1) {
            return of({startDate: '09-FEB-2017', fullName: '1 Month', endDate: '09-MAR-2017'});
        }
        if (timePeriod === 'Months' && numberOfPeriods === 6) {
            return of({startDate: '09-Sep-2016', fullName: '6 Months', endDate: '09-MAR-2017'});
        }
        if (timePeriod === 'Years' && numberOfPeriods === 1) {
            return of({startDate: '09-Mar-2016', fullName: '1 Year', endDate: '09-MAR-2017'});
        }
        if (timePeriod === 'Years' && numberOfPeriods === 3) {
            return of({startDate: '09-Mar-2014', fullName: '3 Years', endDate: '09-MAR-2017'});
        }
        if (timePeriod === 'Years' && numberOfPeriods === 5) {
            return of({startDate: '09-Mar-2012', fullName: '5 Years', endDate: '09-MAR-2017'});
        }
        if (timePeriod === 'ITD' && numberOfPeriods === 1) {
            return of({startDate: '09-Mar-2010', fullName: 'Inception to Date', endDate: '09-MAR-2017'});
        }
    }

    /**
     * * Expected expost time series periods
     */
    function getExpectedExpostTimeSeriesPeriods (): TimePeriod[] {
        const supportedTimePeriods: TimePeriod[] = [];
        supportedTimePeriods.push(new TimePeriod('1 Month', 1, 'Months'));
        supportedTimePeriods.push(new TimePeriod('6 Months', 6, 'Months'));
        supportedTimePeriods.push(new TimePeriod('1 Year', 1, 'Years'));
        supportedTimePeriods.push(new TimePeriod('3 Years', 3, 'Years'));
        supportedTimePeriods.push(new TimePeriod('5 Years', 5, 'Years'));
        supportedTimePeriods.push(new TimePeriod('Inception to Date', 1, 'ITD'));
        return supportedTimePeriods;
    }

});
