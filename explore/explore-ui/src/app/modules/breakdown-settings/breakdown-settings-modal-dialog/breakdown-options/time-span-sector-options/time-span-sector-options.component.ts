import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {TimeSpanColumnSector} from '@blk/explore-ui-breakdown';
import {isUndefined} from 'lodash';
import {AuxTextInputValueChangedDetailInterface} from '@blk/aladdin-angular-components';

/**
 * Component to configure bucket definition for Timespan Column Sector
 */
@Component({
    selector: 'app-time-span-sector-options',
    templateUrl: './time-span-sector-options.component.html',
    styleUrls: ['./time-span-sector-options.component.scss']
})
export class TimeSpanSectorOptionsComponent implements OnChanges {

    @Input()
    sectorModel: TimeSpanColumnSector;
    buckets: string;
    defaultBuckets = [
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30],
        [3, 7, 11, 15],
        [5, 10, 30]
    ];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.sectorModel) {
            // NOTE:  This should only happen from the test cases.
            if (!this.sectorModel) {
                return;
            }

            // if bucket breakpoints are not defined set to first default bucket
            if (isUndefined(this.sectorModel.bucketBreakpoints)) {
                this.sectorModel.bucketBreakpoints = this.defaultBuckets[0].map(String);
            }
            this.buckets = this.sectorModel.bucketBreakpoints.join(', ');
        }
    }

    /**
     * Sets the buckets based on the default options.
     */
    setDefaultBucket(newBuckets: number[]): void {
        // Set this into the model.
        this.sectorModel.bucketBreakpoints = newBuckets.map(String);

        // Update the display text for the buckets.
        this.buckets = this.sectorModel.bucketBreakpoints.join(', ');
    }

    /**
     * Updates the bucket information based on what the user has typed in.
     */
    onBucketsUpdate(event: CustomEvent<AuxTextInputValueChangedDetailInterface>) {
        this.buckets = event.detail.value;
        // Split the string into an array of values.
        const valueArray = this.buckets.split(',');

        // Clear the existing array.
        this.sectorModel.bucketBreakpoints = [];

        // Add back in the breakpoints that are now set.
        valueArray.forEach((item: string) => {
            if (item && item.trim().length !== 0) {
                this.sectorModel.bucketBreakpoints.push(item.trim());
            }
        });
    }

}
