import {AbstractColumnOption, ColumnOptionFactory, KrdBucketDetails} from '@blk/explore-ui-core';
import {KeyRateDurationColumnOption} from './key-rate-duration-column-option.model';

describe('KeyRateDurationColumnOption', () => {
    /**
     * Ensure that the configurations are all initialised.
     */
    beforeAll(() => {
        ColumnOptionFactory.registerOptionType(KeyRateDurationColumnOption.CONFIG_TYPE, KeyRateDurationColumnOption);
    });

    let keyRateDurationColumnOption: KeyRateDurationColumnOption;
    let krdBucketsDetails: KrdBucketDetails[];
    beforeEach(() => {
        keyRateDurationColumnOption = new KeyRateDurationColumnOption();
        const krdBucket1 = new KrdBucketDetails({
            name: '3 Month',
            colTag: 'krd_3m',
            bucketName: 'Short',
            value: 'THREE_MONTH'
        });
        const krdBucket2 = new KrdBucketDetails({
            name: '1 Year',
            colTag: 'krd_1y',
            bucketName: 'Short',
            value: 'ONE_YEAR'
        });
        krdBucketsDetails = [krdBucket1, krdBucket2];
    });

    it('Test model initialization', function () {
        const defaultSettings = {
            columnOptionAttributes: [
                {title: 'Enable Buckets', key: 'enableBuckets'},
                {title: 'Buckets', key: 'buckets'}
            ]
        };
        keyRateDurationColumnOption.initialize(defaultSettings);
        expect(keyRateDurationColumnOption).not.toBeUndefined();
        expect(keyRateDurationColumnOption.enableBuckets).toBeFalsy();
        expect(keyRateDurationColumnOption.krdBucketsDetails).toBeUndefined();
    });

    it('test CreateRequest Params', function () {
        let optionValues: any = {};
        keyRateDurationColumnOption.addRequestParams(optionValues);
        expect(optionValues['enableBuckets']).toBeUndefined();
        expect(optionValues['krdBucketDetails']).toBeUndefined();

        keyRateDurationColumnOption.enableBuckets = true;
        keyRateDurationColumnOption.krdBucketsDetails = krdBucketsDetails;
        keyRateDurationColumnOption.krdBucketsDetails[0].bucketName = 'newName';

        optionValues = {};
        keyRateDurationColumnOption.addRequestParams(optionValues);
        expect(optionValues['enableBuckets']).toBeTruthy();
        expect(optionValues['krdBucketDetails']).not.toBeUndefined();
        expect(optionValues['krdBucketDetails'][0].bucketName).toBe('newName');
        expect(optionValues['krdBucketDetails'].length).toBe(2);

        keyRateDurationColumnOption.krdBucketsDetails[0].bucketName = '';
        optionValues = {};
        keyRateDurationColumnOption.addRequestParams(optionValues);
        expect(optionValues['enableBuckets']).toBeTruthy();
        expect(optionValues['krdBucketDetails']).not.toBeUndefined();
        expect(optionValues['krdBucketDetails'][0].bucketName).toBe('Short');
        expect(optionValues['krdBucketDetails'].length).toBe(1);

    });

    it('Test serialize', function () {
        let data: any = keyRateDurationColumnOption.serialize(false);
        expect(data).toBeUndefined();
        keyRateDurationColumnOption.enableBuckets = false;
        data = keyRateDurationColumnOption.serialize(false);
        expect(data.enableBuckets).toBeUndefined();
        keyRateDurationColumnOption.enableBuckets = true;
        keyRateDurationColumnOption.krdBucketsDetails = krdBucketsDetails;
        data = keyRateDurationColumnOption.serialize(false);
        expect(data.configType).toBe(keyRateDurationColumnOption.configType);
        expect(data.enableBuckets).toBe(keyRateDurationColumnOption.enableBuckets);
        expect(data.krdBucketDetails.length).toBe(2);
    });

    it('Test deserialize', function () {
        const data: any = {
            enableBuckets: true,
            krdBucketDetails: krdBucketsDetails
        };
        const newKeyRateDurationColumnOption = new KeyRateDurationColumnOption();
        newKeyRateDurationColumnOption.deserialize(data);
        expect(newKeyRateDurationColumnOption).not.toBeUndefined();
        expect(newKeyRateDurationColumnOption).not.toBeNull();
        expect(newKeyRateDurationColumnOption.enableBuckets).toBeTruthy();
        expect(newKeyRateDurationColumnOption.krdBucketsDetails.length).toBe(2);
        expect(newKeyRateDurationColumnOption.krdBucketsDetails[0].colTag).toBe('krd_3m');
    });

    it('Test create from factory', function () {
        const defaultSettings = {
            columnOptionAttributes: [
                {title: 'Enable Buckets', key: 'enableBuckets'},
                {title: 'Buckets', key: 'buckets'}
            ]
        };
        const model: AbstractColumnOption = ColumnOptionFactory.createNewModel(KeyRateDurationColumnOption.CONFIG_TYPE, defaultSettings);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model instanceof KeyRateDurationColumnOption).toBeTruthy();
    });

    it('Test create legacy model', function () {
        // Try without the required params.
        const data: any = {
            options: ''
        };
        let model: KeyRateDurationColumnOption = KeyRateDurationColumnOption.createModelLegacy(data);
        expect(model).not.toBeDefined();

        // Try with valid options.
        data.enableBuckets = true;
        data.krdBucketDetails = krdBucketsDetails;
        model = KeyRateDurationColumnOption.createModelLegacy(data);
        expect(model).toBeDefined();
        expect(model).not.toBeNull();
        expect(model.enableBuckets).toBeTruthy();
        expect(model.krdBucketsDetails[1].colTag).toBe('krd_1y');
    });

    it('Test equals', function () {
        const model1: KeyRateDurationColumnOption = new KeyRateDurationColumnOption();
        const model2: KeyRateDurationColumnOption = new KeyRateDurationColumnOption();
        expect(model1.equals(model2)).toBeTruthy();
        model1.enableBuckets = false;
        model2.enableBuckets = true;
        expect(model1.equals(model2)).toBeFalsy();

        model2.krdBucketsDetails = krdBucketsDetails;
        const newKrdBucketsDetails = krdBucketsDetails;
        newKrdBucketsDetails[0].bucketName = 'newName';
        model1.krdBucketsDetails = newKrdBucketsDetails;
        expect(model1.equals(model2)).toBeFalsy();

        model2.enableBuckets = false;
        model1.krdBucketsDetails = krdBucketsDetails;
        expect(model1.equals(model2)).toBeTruthy();
    });

    it('Test isValid', function () {
        const model1: KeyRateDurationColumnOption = new KeyRateDurationColumnOption();
        expect(model1.isValid()).toBeFalsy();
        model1.enableBuckets = false;
        expect(model1.isValid()).toBeTruthy();
        model1.krdBucketsDetails = [new KrdBucketDetails()];
        expect(model1.isValid()).toBeTruthy();
    });
});
