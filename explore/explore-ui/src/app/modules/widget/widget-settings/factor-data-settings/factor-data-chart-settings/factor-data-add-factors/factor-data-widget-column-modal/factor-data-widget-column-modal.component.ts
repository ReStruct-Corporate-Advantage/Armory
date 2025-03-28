import {Component, Input} from '@angular/core';
import {FactorDataColumnModalComponent} from '@blk/explore-ui-extended-column-option';

@Component({
  selector: 'app-factor-data-widget-column-modal',
  templateUrl: './factor-data-widget-column-modal.component.html',
  styleUrls: ['./factor-data-widget-column-modal.component.scss']
})
export class FactorDataWidgetColumnModalComponent extends FactorDataColumnModalComponent {

    @Input()
    showFactorViewLevelPerms = false;
}
