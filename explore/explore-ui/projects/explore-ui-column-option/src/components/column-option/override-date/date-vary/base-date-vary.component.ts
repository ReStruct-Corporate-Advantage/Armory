import {Component, EventEmitter, Input, Output} from '@angular/core';
import {EconomyExposureDateVaryColumnOptionModel} from '../../../../models/column-option/economy-exposure-date-vary-column-option.model';
import {OverrideDateColumnOptionsComponent} from '../override-date-column-options.component';

@Component({
    selector: 'explore-base-date-vary',
    templateUrl: './base-date-vary.component.html'
})
export class BaseDateVaryComponent extends OverrideDateColumnOptionsComponent<EconomyExposureDateVaryColumnOptionModel> {
    static OPTION_KEY = EconomyExposureDateVaryColumnOptionModel.CONFIG_TYPE;

    @Input()
    riskColumnFlags: string[];

    @Input()
    optionValue: any;

    @Output()
    dateVaryOptionChanged = new EventEmitter<null>();

    protected getOptionValueConfigType(): string {
        return BaseDateVaryComponent.OPTION_KEY;
    }
}
