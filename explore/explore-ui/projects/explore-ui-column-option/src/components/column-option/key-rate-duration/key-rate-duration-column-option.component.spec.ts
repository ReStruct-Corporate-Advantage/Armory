import {CoreDefinitionStore, KrdBucketDetails} from '@blk/explore-ui-core';
import {KeyRateDurationColumnOption} from '../../../models/column-option/key-rate-duration-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils';
import {KeyRateDurationColumnOptionComponent} from './key-rate-duration-column-option.component';

describe('KeyRateDurationComponent', () => {
    let testBed: ColumnOptionTestBed<KeyRateDurationColumnOptionComponent, KeyRateDurationColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this control.
        const mockedOption = {
            columnOptionTitle: 'KRD Column Settings',
            columnOptionAttributes: [
                {title: 'Enable Buckets', key: 'enableBuckets'},
                {title: 'Buckets', key: 'buckets'}
            ],
            columnOptionConfigType: 'krdColumnOptions'
        };
        const krdBucket1 = new KrdBucketDetails({name: '3 Month', colTag: 'krd_3m', bucketName: 'Short', value: 'THREE_MONTH'});
        const krdBucket2 = new KrdBucketDetails({name: '1 Year', colTag: 'krd_1y', bucketName: 'Short', value: 'ONE_YEAR'});
        CoreDefinitionStore.krdBucketDetail = [krdBucket1, krdBucket2];

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<KeyRateDurationColumnOptionComponent, KeyRateDurationColumnOption>(KeyRateDurationColumnOptionComponent, new KeyRateDurationColumnOption(), mockedOption);
    });

    it('Validate init of the component', () => {
        // Should have the titles defined.
        expect(testBed.component.enableBucketsKey).toBe('enableBuckets');
        expect(testBed.component.krdBuckets.length).toBe(2);

        // The control should have an aux-checkbox component and a table
        const compiled = testBed.fixture.debugElement.nativeElement;
        expect(compiled.querySelector('aux-checkbox')).not.toBe(null);
        expect(compiled.querySelector('table')).not.toBe(null);
    });

    it('should update enableBuckets on checkbox change', () => {
        testBed.component.optionValue.enableBuckets = false;
        const event = {detail: { value: {checked: true}}};
        testBed.component.onCheckboxChanged(event as CustomEvent);
        expect(testBed.component.optionValue.enableBuckets).toBeTruthy();
        expect(testBed.component.optionValue.krdBucketsDetails).toEqual(testBed.component.krdBuckets);
    });

    it('should update bucketName on text input change', () => {
        testBed.component.optionValue.krdBucketsDetails = testBed.component.krdBuckets;
        const event = {detail: {value:'newName'}};
        const bucket = testBed.component.krdBuckets[0];
        testBed.component.updateBucketName(event as CustomEvent, bucket as KrdBucketDetails);
        expect(testBed.component.optionValue.krdBucketsDetails[0].bucketName).toBe('newName');
    });

});
