import {
    AuxTextInputValueChangedDetailInterface,
    Validator
} from '@blk/aladdin-angular-components';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {OptionValueComponent} from '../../interfaces/option-value-component.interface';
import {ConstraintOption} from '../../models/constraint-option';
import {ConstraintOptionValueUpdate} from '../../models/constraint-option-value-update';
import {Observable} from 'rxjs';
import {isEmpty, isNil} from 'lodash';
import {CommonConstants} from '@constants/common.constants';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {OptimizationConstants} from '@constants/optimization.constants';
import {CompositionConstants} from '@constants/composition.constants';

@Component({
               selector: 'app-constraint-option-efficient-frontier-number',
               templateUrl: './constraint-option-efficient-frontier-number.component.html',
               styleUrls: ['./constraint-option-efficient-frontier-number.component.scss']
           })
export class ConstraintOptionEfficientFrontierNumberComponent implements OptionValueComponent<number[] | string, any>, OnInit {
    @Input() options: ConstraintOption<number[] | string>[];
    @Input() parentConfig: OptimizationSettings;
    @Input() customStyle: boolean;
    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<number[] | string>> = new EventEmitter();

    value$: Observable<number[] | string>;
    label: string;
    key: string;
    validator: Validator[];
    efHelpMessageText = OptimizationConstants.EF_HELP_MSG_TXT;
    efHelpMessageTextOption1 = OptimizationConstants.EF_HELP_MSG_TXT_OPTION_1;
    efHelpMessageTextOption2 = OptimizationConstants.EF_HELP_MSG_TXT_OPTION_2;

    /**
     * Checks if passed string qualifies as a number.
     * Takes optional negative sign  along with only digits or
     * digits with decimal point
     * Valid cases -> 0:23 | -.5:3.8 | -1:2 | 4 | -2 | 2,4,5 | -.5,7,8.3
     * Invalid cases -> 2: | 'any string' | 2. | -2. | 5.:0 | 5., | etc
     */
    static validateIfStringIsValidBoundVal(value: string): boolean {
        return /^(-?(\d+)+:-?\d+)$|^(-?\d+)$|^(-?(\d+)(,-?\d+)*)$|^(-?((\d*)+(\.\d+)))$|^(-?((\d+)+(\.\d+)?))+:+(-?((\d*)+(\.\d+)?))+(?<!:)$|^(-?((\d*)+(\.\d+)))+:+(-?((\d*)+(\.\d+)))|^(-?((\d*)+(\.\d+)))+,+(-?((\d*)+(\.\d+)))$|^(-?((\d*)+(\.\d+)?))+(,+(-?((\d*)+(\.\d+)?)))+(?<!,)$/.test(value);
    }

    ngOnInit(): void {
        const option: ConstraintOption<number[] | string> = this.options[0];
        this.value$ = option.value$;
        this.label = option.optionAttribute.title;
        this.key = option.optionAttribute.key;
        this.validator = [{
            validate: (value: string) => {
                return isNil(value) || isEmpty(value) || ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal(value);
            },
            errorMessage: CommonConstants.INVALID_INPUT
        }];
    }

    onValueChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>): void {
        if (!isEmpty(event.detail.value) && !ConstraintOptionEfficientFrontierNumberComponent.validateIfStringIsValidBoundVal(event.detail.value)) {
            return;
        }
        let isEfficient;
        let efficientInput;
        const rawInput = event.detail.value;
        // Check if efficient is  colon format i.e. 2:6 | -.5:3.7 | etc
        if (CompositionConstants.EFF_FRONT_COLON_REGEX.test(rawInput)) {
            isEfficient = true;
            efficientInput = rawInput;
        } else if (CompositionConstants.EFF_FRONT_COMMA_REGEX.test(rawInput)) { // Check if efficient is defined in comma format i.e. 1,5,7 | -.5,2,7.9 | etc.
            isEfficient = true;
            efficientInput = rawInput.split(',').map(function(n) {return Number(n); });
        }

        this.updated.emit({
                              key: this.key,
                              value: isEmpty(event.detail.value) ? undefined : isEfficient ? efficientInput : Number(event.detail.value)
                          });
    }
}
