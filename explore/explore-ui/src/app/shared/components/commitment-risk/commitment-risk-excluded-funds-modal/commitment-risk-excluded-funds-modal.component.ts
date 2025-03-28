import {Component, Input} from '@angular/core';
import {AuxTargetAtrEnum} from '@blk/aladdin-angular-components';
import {CommonUtils, CoreUrlConstants, ModalDirective} from '@blk/explore-ui-core';

@Component({
  selector: 'app-commitment-risk-excluded-funds-modal',
  templateUrl: './commitment-risk-excluded-funds-modal.component.html',
  styleUrls: ['./commitment-risk-excluded-funds-modal.component.scss']
})
export class CommitmentRiskExcludedFundsModalComponent extends ModalDirective {
    protected readonly AuxTargetAtrEnum = AuxTargetAtrEnum;

    @Input()
    isLaunchedFromTable = false;

    warningFAQs = CommonUtils.getApplicationUrl(CoreUrlConstants.EXPLORE_ACRM_FAQS_PATH);
}
