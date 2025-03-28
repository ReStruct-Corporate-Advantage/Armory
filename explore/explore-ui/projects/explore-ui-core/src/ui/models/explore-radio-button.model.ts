import {AuxRadioInterface} from '@blk/aladdin-angular-components';

/**
 * Model class for radio button in Explore
 */
export class ExploreRadioButton implements AuxRadioInterface {
    label: string;
    checked: boolean;
    disabled: boolean;
    isRadioVisible: boolean;
    eventData: any;

    constructor(label: string, checked: boolean, disabled: boolean, eventData?: any, isRadioVisible?: boolean) {
        this.label = label;
        this.checked = checked;
        this.disabled = disabled;
        this.eventData = eventData;
        this.isRadioVisible = isRadioVisible;
    }
}
