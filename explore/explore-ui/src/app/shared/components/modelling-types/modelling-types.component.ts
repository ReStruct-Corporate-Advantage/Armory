import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {ModellingType} from '@enums/modelling-type.enum';
import {cloneDeep} from 'lodash';
import {CompositionConstants} from '@constants/composition.constants';

@Component({
    selector: 'app-modelling-types',
    templateUrl: './modelling-types.component.html',
    styleUrls: ['./modelling-types.component.scss']
})
export class ModellingTypesComponent implements OnInit {

    modellingDescription: Record<ModellingType, string> = cloneDeep(CompositionConstants.MODELLING_TYPE_DESCRIPTION);
    modellingLabel: Record<ModellingType, string> = cloneDeep(CompositionConstants.MODELLING_MAIN_TYPE_LABEL);
    modellingTypeHeader = 'Select a What-if Model Type';

    @Output() setModellingTypeAtParent: EventEmitter<number> = new EventEmitter<number>();
    @Input() modelingCategories: Record<string, number[]>; // Categories and options holder
    @Input() useCustomPortStyling: boolean;

    ngOnInit() {
        if (this.useCustomPortStyling) {
            this.modellingDescription = cloneDeep(CompositionConstants.MODELLING_TYPE_DESCRIPTION_CUSTOM_PORT);
            this.modellingLabel = cloneDeep(CompositionConstants.MODELLING_MAIN_TYPE_LABEL_CUSTOM_PORT);
            this.modellingTypeHeader = this.modellingTypeHeader.replace('What-if Model', 'Custom Portfolio');
        }
    }

    /**
     * Preserve natural key order
     */
    maintainNaturalOrder(): number {
        return 0;
    }

    /**
     * Set the type of modelling action the user has selected and wishes to do
     */
    setModellingType(type: number): void {
        this.setModellingTypeAtParent.emit(type);
    }
}
