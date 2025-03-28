import {Component} from '@angular/core';
import {BaseWidgetSettingComponent} from '@blk/explore-ui-column-option';
import {CommitmentHorizon} from '@models/widget/inputs/commitment-risk/commitment-horizon.model';
import {AuxButtonTypeEnum, AuxNumericStepperValueChangedDetailInterface} from '@blk/aladdin-angular-components';

@Component({
    selector: 'app-commitment-horizon',
    templateUrl: './commitment-horizon.component.html',
    styleUrls: ['./commitment-horizon.component.scss']
})

export class CommitmentHorizonComponent extends BaseWidgetSettingComponent<CommitmentHorizon> {

    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;

    public readonly HORIZON_LABEL: string = 'Time Horizon (Years)';

    onNumericValueChange(event: CustomEvent<AuxNumericStepperValueChangedDetailInterface>) {
        this.widgetInput.horizon = Number(event.detail.value);
    }

    initializeComponent(): void {
        if (!this.widgetInput.horizon) {
            this.widgetInput.horizon = this.widgetConfigInput.default;
        }
    }
}
