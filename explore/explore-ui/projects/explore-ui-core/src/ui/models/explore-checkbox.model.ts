import {AuxCheckboxInterface} from '@blk/aladdin-angular-components';

/**
 * Model class for check-boxes in Explore
 */
export class ExploreCheckbox implements AuxCheckboxInterface {
    label: string;
    checked: boolean;
    disabled: boolean;
    uid?: string;
    showCheckbox: boolean;

    constructor(label: string, checked: boolean, disabled: boolean, uid?: string, showCheckbox?: boolean) {
        this.label = label;
        this.checked = checked;
        this.disabled = disabled;
        this.uid = uid;
        this.showCheckbox = showCheckbox;
    }
}
