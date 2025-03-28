import {KrdBucketDetails} from './krd-bucket-details.model';

/**
 * Test Case file of KRD Bucket Details
 */
describe('Krd Bucket Test case file', () => {

    it('Deserialize test', () => {
        const data = {
            bucketName: 'Short',
            colTag: 'krd_3m',
            name: '3 Month',
            value: 'THREE_MONTH'
        };

        const krdBucketCtrl = new KrdBucketDetails(data);
        expect(krdBucketCtrl.bucketName).toBe('Short');
        expect(krdBucketCtrl.colTag).toBe('krd_3m');
        expect(krdBucketCtrl.name).toBe('3 Month');
        expect(krdBucketCtrl.value).toBe('THREE_MONTH');
    });
});
