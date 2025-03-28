import {AuxTextInputValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {Component, OnChanges, SimpleChanges} from '@angular/core';
import {BaseSectorAttributeRuleValueFieldComponent} from '../base-sector-attribute-rule-value-field';

/**
 * This component is used to set comparision value of Column Sector Rule of type attribute, when column data type is string
 */
@Component({
    selector: 'explore-sector-attribute-rule-text-field',
    templateUrl: './sector-attribute-rule-text-field.component.html'
})
export class SectorAttributeRuleTextFieldComponent extends BaseSectorAttributeRuleValueFieldComponent<Array<string>> implements OnChanges {

    stringInputTextData: string;

    onChanges(changes: SimpleChanges): void {
        if (changes.value) {
            this.stringInputTextData = this.value ? this.value.join(',') : '';
            this.valueChange.emit(this.stringInputTextData.split(','));
        }
    }

    /**
     * Is called when text field value is updated.
     */
    onValueChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>) {
        const splitStrings: string[] = event.detail.value.split(',');
        this.valueChange.emit(splitStrings.map((val) => val.trim()));
    }
}
