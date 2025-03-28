import {Component, Input} from '@angular/core';
import {Vizualization} from '../../../../vizualizations/vizualization';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {Widget} from '@models/widget/widget.model';

@Component({
  selector: 'app-commitment-risk-excluded-funds',
  templateUrl: './commitment-risk-excluded-funds.component.html',
  styleUrls: ['./commitment-risk-excluded-funds.component.scss']
})
export class CommitmentRiskExcludedFundsComponent extends Vizualization {

    @Input() widgetPayload: WidgetPayload;
    @Input() widget: Widget;

    isFundInfoDialogOpen = false;
}
