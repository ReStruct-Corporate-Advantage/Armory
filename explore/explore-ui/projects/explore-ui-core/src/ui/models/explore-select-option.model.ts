import {AuxSelectOption} from '@blk/aladdin-angular-components';

export class ExploreSelectOption implements AuxSelectOption {
    displayValue: string;
    value: any;
    isSelected?: boolean;
    isDisabled?: boolean;
    childOptions?: ExploreSelectOption[];
    auxId?: string;

    constructor(displayName?: string, value?: any, isSelected?: boolean, isDisabled?: boolean, auxId?: string) {
        this.displayValue = displayName;
        this.value = value;
        this.isSelected = isSelected;
        this.isDisabled = isDisabled;
        this.auxId = auxId;
    }
}
