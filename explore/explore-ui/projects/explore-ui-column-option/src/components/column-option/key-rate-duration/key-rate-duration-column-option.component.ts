import {
    AuxCheckboxChangedDetailInterface,
    AuxTextInputValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {Component} from '@angular/core';
import {KeyRateDurationColumnOption} from '../../../models/column-option/key-rate-duration-column-option.model';
import {CoreDefinitionStore, KrdBucketDetails} from '@blk/explore-ui-core';
import {cloneDeep} from 'lodash';
import {BaseColumnOptionComponent} from '../base-column-option.component';

/**
 * Component for the key rate duration column options.
 */
@Component({
    selector: 'explore-key-rate-duration-column-option',
    templateUrl: './key-rate-duration-column-option.component.html',
    styleUrls: ['./key-rate-duration-column-option.component.scss']
})
export class KeyRateDurationColumnOptionComponent extends BaseColumnOptionComponent<KeyRateDurationColumnOption> {

    public static OPTION_KEY = 'krdColumnOptions';

    enableBucketsKey: string;
    krdBuckets: KrdBucketDetails[];

    /**
     * Init the component.
     */
    protected initializeComponent(): void {
        super.initializeComponent();

        this.enableBucketsKey = this.option.columnOptionAttributes[0].key;
        this.krdBuckets = this.optionValue.krdBucketsDetails ? this.optionValue.krdBucketsDetails : cloneDeep(CoreDefinitionStore.krdBucketDetail);
    }

    /**
     * Get the config type that this object is configuring.
     */
    getOptionValueConfigType(): string {
        return KeyRateDurationColumnOption.CONFIG_TYPE;
    }

    /**
     * Update enableBuckets checkbox
     */
    onCheckboxChanged(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.optionValue.enableBuckets = event.detail.value.checked;
        if (this.optionValue.enableBuckets) {
            this.optionValue.krdBucketsDetails = this.krdBuckets;
        }
    }

    /**
     * Update bucketName for the existing settings
     */
    updateBucketName(event: CustomEvent<AuxTextInputValueChangedDetailInterface>, bucket: KrdBucketDetails): void {
        bucket.bucketName = event.detail.value;
    }
}
