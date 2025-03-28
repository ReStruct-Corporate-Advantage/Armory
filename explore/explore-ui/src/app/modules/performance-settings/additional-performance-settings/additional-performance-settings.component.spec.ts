import {AdditionalPerformanceSettingsComponent} from './additional-performance-settings.component';
import {
    AdditionalPerformanceSettings,
    CoreDefinitionStore,
    KrdBucketDetails,
    TokenConstants
} from '@blk/explore-ui-core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('AdditionalPerformanceSettingsComponent', () => {
    let fixture: ComponentFixture<AdditionalPerformanceSettingsComponent>;
    let component: AdditionalPerformanceSettingsComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [AdditionalPerformanceSettingsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: []
        });

        fixture = TestBed.createComponent(AdditionalPerformanceSettingsComponent);
        component = fixture.componentInstance;

        const additionalSettings = {
            'asReported': false,
            'showSummary': false,
            'aggregateBMOnlyReturnSecurities': true,
            'removeBMOnlyReturnBucket': false,
            'collapseClosedPositions': false,
            'customPivotPoint': 'ONE_YEAR'
        };
        component.additionalSettings = new AdditionalPerformanceSettings(additionalSettings);
        CoreDefinitionStore.krdBucketDetail = [
            new KrdBucketDetails({
                'bucketName': 'Short',
                'colTag': 'krd_3m',
                'name': '3 Month',
                'value': 'THREE_MONTH'
            }),
            new KrdBucketDetails({
                'bucketName': 'Short',
                'colTag': 'krd_1y',
                'name': '1 Year',
                'value': 'ONE_YEAR'
            }),
            new KrdBucketDetails({
                'bucketName': 'Middle',
                'colTag': 'krd_2y',
                'name': '2 Year',
                'value': 'TWO_YEAR'
            }),
            new KrdBucketDetails({
                'bucketName': 'Middle',
                'colTag': 'krd_3y',
                'name': '3 Year',
                'value': 'THREE_YEAR'
            }),
            new KrdBucketDetails({
                'bucketName': 'Middle',
                'colTag': 'krd_10y',
                'name': '10 Year',
                'value': 'TEN_YEAR'
            }),
            new KrdBucketDetails({
                'bucketName': 'Long',
                'colTag': 'krd_25y',
                'name': '25 Year',
                'value': 'TWENTYFIVE_YEAR'
            }),
            new KrdBucketDetails({
                'bucketName': 'Long',
                'colTag': 'krd_30y',
                'name': '30 Year',
                'value': 'THIRTY_YEAR'
            })
        ];
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit', () => {
        expect(typeof component.additionalSettings).toBeDefined();
        expect(typeof component.ngOnInit).toBe('function');
        expect(typeof component.setAsReported).toBe('function');
        expect(typeof component.setShowSummary).toBe('function');

        component.ngOnInit();
        expect(component.isShowSummaryEnabled).toBe(true);
        expect(component.isAsReportedEnabled).toBe(true);
        expect(component.availableCustomPivotPointsData[0].values).toBeTruthy();
        expect(component.availableCustomPivotPointsData[0].values.length).toBe(7);

        const additionalSettings = {
            'asReported': true,
            'showSummary': false,
            'aggregateBMOnlyReturnSecurities': true,
            'removeBMOnlyReturnBucket': false,
            'collapseClosedPositions': false
        };
        component.additionalSettings = new AdditionalPerformanceSettings(additionalSettings);
        component.ngOnInit();
        // Since asReported was true the showSummaryCheckBox would be disabled
        expect(component.isShowSummaryEnabled).toBe(false);
        expect(component.isAsReportedEnabled).toBe(true);

        component.showAdditionalSettingsAttributes = 8;
        component.ngOnInit();
        expect(component.showAsReported).toBe(false);
        expect(component.showRemBMOnlyRetBucket).toBe(true);
    });

    it('shows/hides gross net returns option based on token value', () => {
        // enabled
        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_PRAADA_NET_GROSS_RETURNS] = 'Y';
        component.ngOnInit();
        fixture.detectChanges();
        expect(fixture.debugElement.nativeElement.querySelector('aux-radio-group')).toMatchSnapshot();

        CoreDefinitionStore.tokens[TokenConstants.EXPLORE_PRAADA_NET_GROSS_RETURNS] = 'N';
        component.ngOnInit();
        fixture.detectChanges();
        expect(fixture.debugElement.nativeElement.querySelector('aux-radio-group')).toBeNull();
    });

    it('setAsReported', () => {
        component.ngOnInit();
        // By default since both as reported and show summary were false the checkboxes are enabled
        expect(component.isShowSummaryEnabled).toBe(true);
        expect(component.isAsReportedEnabled).toBe(true);

        component.setAsReported(true);
        // Now since as reported is true showSummary is disabled
        expect(component.isShowSummaryEnabled).toBe(false);
        expect(component.isAsReportedEnabled).toBe(true);
        expect(component.additionalSettings.asReported).toBe(true);

        component.setAsReported(false);
        // Now since as reported is false showSummary is enabled
        expect(component.isShowSummaryEnabled).toBe(true);
        expect(component.isAsReportedEnabled).toBe(true);
        expect(component.additionalSettings.asReported).toBe(false);
    });

    it('setShowSummary', () => {
        component.ngOnInit();
        // By default since both as reported and show summary were false the checkboxes are enabled
        expect(component.isShowSummaryEnabled).toBe(true);
        expect(component.isAsReportedEnabled).toBe(true);

        component.setShowSummary(true);
        // Now since show summary is true asReported is disabled
        expect(component.isAsReportedEnabled).toBe(false);
        expect(component.isShowSummaryEnabled).toBe(true);
        expect(component.additionalSettings.showSummary).toBe(true);

        component.setShowSummary(false);
        // Now since show summary is false asReported is enabled
        expect(component.isAsReportedEnabled).toBe(true);
        expect(component.isShowSummaryEnabled).toBe(true);
        expect(component.additionalSettings.showSummary).toBe(false);
    });

    it('test set methods', () => {
        component.setAggregateBMOnlyReturnSecurities(false);
        component.setCollapseClosedPositions(true);
        component.setCustomPivot('TWO_YEAR');
        component.setRemoveBMOnlyReturnBucket(true);
        expect(component.additionalSettings.aggregateBMOnlyReturnSecurities).toBeFalsy();
        expect(component.additionalSettings.collapseClosedPositions).toBeTruthy();
        expect(component.additionalSettings.removeBMOnlyReturnBucket).toBeTruthy();
        expect(component.additionalSettings.customPivotPoint).toEqual('TWO_YEAR');
    });

    it('should update isNetReturns flag', () => {
        component.ngOnInit();
        expect(component.additionalSettings.isNetReturn).toBeUndefined();
        expect(component.returnTypeDisplayOptions).toHaveLength(2);
        expect(component.returnTypeDisplayOptions[0].checked).toEqual(true);
        expect(component.returnTypeDisplayOptions[1].checked).toEqual(false);

        // update handled by DS component
        component.returnTypeDisplayOptions[0].checked = false;
        component.returnTypeDisplayOptions[1].checked = true;

        component.updateNetReturn();
        expect(component.additionalSettings.isNetReturn).toEqual(true);
    });
});
