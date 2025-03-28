import momentTZ from 'moment-timezone';
import {BatchSchedulerModalComponent} from './batch-scheduler-modal.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FavoriteService} from '@services/favorite';
import {NotificationService} from '@services/notification';
import {BatchExportingStore} from '@stores/batch-exporting.store';
import {BatchReportingTestUtils} from '@services/batch-reporting/batch-reporting.service.spec';
import {of} from 'rxjs';
import {FavoriteConstants} from '@constants/favorite.constants';
import {CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {BatchMonthlyFrequency} from '@models/batch-reporting/scheduled-batch/batch-frequency/batch-monthly-frequency.model';
import {BatchDailyFrequency} from '@models/batch-reporting/scheduled-batch/batch-frequency/batch-daily-frequency.model';

describe('BatchSchedulerModalComponent', () => {
    let component: BatchSchedulerModalComponent;
    let fixture: ComponentFixture<BatchSchedulerModalComponent>;

    const favoriteServiceStub = {
        saveFavorite$: jest.fn()
    };

    const notificationServiceStub = {
        success: jest.fn(),
        error: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BatchSchedulerModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: FavoriteService, useValue: favoriteServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        });

        fixture = TestBed.createComponent(BatchSchedulerModalComponent);
        component = fixture.componentInstance;
        BatchExportingStore.currentScheduledBatchConfig$.next(BatchReportingTestUtils.createDummyScheduledBatchConfig());
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'rolin';
        fixture.detectChanges();
    });

    it('Test ngOnInit', () => {
        component.ngOnInit();
        expect(component.timeZoneOptions.length > 0).toBeTruthy();
        expect(component.frequencyOptions.length > 0).toBeTruthy();
    });

    it('Test initializeFrequencyOptions', () => {
        // Use a monthly batch frequency
        component.batchFrequencySelection = new BatchMonthlyFrequency();
        component.initializeFrequencyOptions();
        // Should be two options (Daily, Monthly)
        expect(component.frequencyOptions[0].values.length).toEqual(2);
        // Monthly should be selected
        expect(component.frequencyOptions[0].values[1].isSelected).toBeTruthy();

        // Should be 7 daily options
        expect(component.dailyFrequencyOptions.length).toEqual(7);
    });

    it('Test onTimeValueChanged', () => {
        let customEvent = new CustomEvent('build', {detail: {value: '', srcEvent: null}});
        // Should be the original timeValue
        expect(component.timeValue).toEqual('18:15');
        component.onTimeValueChanged(customEvent);
        // Should still be the same timeValue as event value doesn't pass regex test
        expect(component.timeValue).toEqual('18:15');

        customEvent = new CustomEvent('build', {detail: {value: '13:14', srcEvent: null}});
        component.onTimeValueChanged(customEvent);
        // The time value should be updated
        expect(component.timeValue).toEqual('13:14');
    });

    it('Test onTimeZoneChanged', () => {
        const customEvent = new CustomEvent('build', {detail: {value: {value: 'America/Los_Angeles', displayValue: 'America/Los_Angeles'}, srcEvent: null}});
        // Should be a blank timeZone
        expect(component.timeZone).toEqual('America/New_York');
        component.onTimeZoneChanged(customEvent);
        // The timeZone should be updated
        expect(component.timeZone).toEqual('America/Los_Angeles');
    });

    it('Test onFrequencyChanged', () => {
        const customEvent = new CustomEvent('build', {detail: {value: {value: 'Daily', displayValue: 'Daily'}, srcEvent: null}});
        component.onFrequencyChanged(customEvent);
        // The frequencySelection should be updated to the dailyFrequencyHolder value
        expect(component.batchFrequencySelection).toBe(component.dailyFrequencyHolder);
    });

    it('Test onDailyFrequencyChanged', () => {
        // Fake event where Sunday, Wednesday, and Saturday are checked
        const customEvent = new CustomEvent('build', {detail: {value: [{label: 'Sunday', checked: true}, {label: 'Monday', checked: false}, {label: 'Tuesday', checked: false}, {label: 'Wednesday', checked: true}, {label: 'Thursday', checked: false}, {label: 'Friday', checked: false}, {label: 'Saturday', checked: true}], srcEvent: null}});
        component.batchFrequencySelection = new BatchDailyFrequency();
        const batchFrequencyToTest = component.batchFrequencySelection as BatchDailyFrequency;

        component.onDailyFrequencyChanged(customEvent);

        // Sunday, Wednesday, and Saturday be true
        expect(batchFrequencyToTest.sunday).toBeTruthy();
        expect(batchFrequencyToTest.wednesday).toBeTruthy();
        expect(batchFrequencyToTest.saturday).toBeTruthy();

        // Test another day
        expect(batchFrequencyToTest.tuesday).toBeFalsy();
    });

    it('Test onMonthlyFrequencyChanged', () => {
        const customEvent = new CustomEvent('build', {detail: {value: 15, srcEvent: null}});
        component.batchFrequencySelection = new BatchMonthlyFrequency();
        const batchFrequencyToTest = component.batchFrequencySelection as BatchMonthlyFrequency;


        // Should default to 1
        expect(batchFrequencyToTest.numericalDay).toEqual(1);

        component.onMonthlyFrequencyChanged(customEvent);
        expect(batchFrequencyToTest.numericalDay).toEqual(15);
    });

    it('Test onDirectoryNameChanged', () => {
        const customEvent = new CustomEvent('build', {detail: {value: 'saveHere', srcEvent: null, host: null}});
        // Should be a blank directory
        expect(component.directory).toEqual('batchFolder');
        component.onDirectoryNameChanged(customEvent);
        // The directory should be updated
        expect(component.directory).toEqual('saveHere');
    });

    it('Test onFileNamePrefixChanged', () => {
        const customEvent = new CustomEvent('build', {detail: {value: 'FILENAMEPREFIX', srcEvent: null, host: null}});
        // Should be a blank fileNamePrefix
        expect(component.fileNamePrefix).toEqual('Prefix');
        component.onFileNamePrefixChanged(customEvent);
        // The fileNamePrefix should be updated
        expect(component.fileNamePrefix).toEqual('FILENAMEPREFIX');
    });

    it('Test disableScheduleButton', () => {
        component.timeValue = '13:14';
        component.timeZone = 'EST';
        component.batchFrequencySelection = new BatchDailyFrequency();
        (component.batchFrequencySelection as BatchDailyFrequency).sunday = true;
        expect(component.disableScheduleButton()).toBeFalsy();
        (component.batchFrequencySelection as BatchDailyFrequency).sunday = false;
        expect(component.disableScheduleButton()).toBeTruthy();
        component.batchFrequencySelection = undefined;
        expect(component.disableScheduleButton()).toBeTruthy();
        component.timeZone = '';
        expect(component.disableScheduleButton()).toBeTruthy();
        component.timeValue = '';
        expect(component.disableScheduleButton()).toBeTruthy();
    });

    it('Test scheduleBatchConfig', () => {
        favoriteServiceStub.saveFavorite$.mockReturnValue(of({status: 'SUCCESS', favoriteId: 6789}));
        component.scheduleBatchConfig();
        expect(component.scheduledBatchConfig.id).toEqual(6789);
        expect(component.scheduledBatchConfig.owner).toEqual(FavoriteConstants.ADMIN_USER);
    });
});
