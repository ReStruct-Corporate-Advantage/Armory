import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ColumnType, RestrictedOptionInterface, WidgetConfigInput, WidgetInput} from '@blk/explore-ui-core';

@Component({
  selector: 'app-exposure-based-add-factors',
  templateUrl: './exposure-based-add-factors.component.html',
  styleUrls: ['./exposure-based-add-factors.component.scss']
})
export class ExposureBasedAddFactorsComponent implements OnInit {

    readonly columnType = ColumnType.COLUMNS;

    widgetConfigInput: WidgetConfigInput;
    restrictedColumnOptions: RestrictedOptionInterface;
    isFactorDataColumnModalOpen = false;

    @Input()
    inputs: Map<string, WidgetInput>;

    @Output()
    refreshFactorExposures = new EventEmitter<void>();

    @Output()
    updateInputFactors = new EventEmitter<void>();

    ngOnInit() {
        this.widgetConfigInput = {
            inputConfigType: 'columns',
            inputName: 'columns',
            inputTitle: 'columns',
            valueField: 'columnTag',
            default: {}
        };
        this.restrictedColumnOptions = {
            sections: [
                'customColumnTitle',
                'riskSettingsColumnSettings',
                'fxFactorOptionsColumnOption',
            ]
        };
    }

    onAddFactorsButtonClicked(): void {
        this.updateInputFactors.emit();
        this.isFactorDataColumnModalOpen = true;
    }

    onFactorDataColumnModalClosed(doneClicked: boolean): void {
        this.isFactorDataColumnModalOpen = false;
        if (doneClicked === true) {
            this.refreshFactorExposures.emit();
        }
    }
}
