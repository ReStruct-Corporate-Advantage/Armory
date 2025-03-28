import {Component, Input, OnInit} from '@angular/core';
import {ColumnType, WidgetConfigInput, RestrictedOptionInterface, WidgetInput, ModalDirective} from '@blk/explore-ui-core';
import {cloneDeep} from 'lodash';
import {BehaviorSubject} from 'rxjs';
/**
 * Factor Data Column Modal - configure the factors for Factor Data widget
 * this Modal opens on top of WidgetSettingsModal
 */
@Component({
    selector: 'explore-extended-column-option-factor-data-column-modal',
    templateUrl: './factor-data-column-modal.component.html',
    styleUrls: ['./factor-data-column-modal.component.scss']
})
export class FactorDataColumnModalComponent extends ModalDirective<boolean> implements OnInit {

    @Input()
    columnType: ColumnType;
    @Input()
    widgetConfigInput: WidgetConfigInput;
    @Input()
    restrictedColumnOptions: RestrictedOptionInterface;
    @Input()
    inputs: Map<string, WidgetInput>;
    @Input()
    isColumnOptionsDisabled: boolean;
    @Input()
    columnSelectorHeight: string;
    @Input()
    showCustomFactor: boolean;
    @Input() singleColumnOnly = false;

    // used in baseColumnSetSettings at the time of fetching column options
    isApplyButtonDisabled = {value: 0};
    showSpinner$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    updatedInputs: Map<string, WidgetInput>;

    modalSizeClass = 'modal-size-lg';

    ngOnInit(): void {
        // clone the inputs as it gets modified on changes
        this.updatedInputs = cloneDeep(this.inputs);

        if (this.isColumnOptionsDisabled) {
            this.modalSizeClass = 'modal-size-md';
        }
    }

    onDoneClicked(): void {
        // Changes are done in columnSet, so update the columnSet
        this.inputs.set(this.columnType, this.updatedInputs.get(this.columnType));
        this.closeModal(true);
    }

}

