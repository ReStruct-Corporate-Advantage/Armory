import {AuxCheckboxChangedDetailInterface, AuxGridColumnType} from '@blk/aladdin-angular-components';
import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {HorizontalDisplayFormValue} from '../../models/horizontal-display-form-value.model';
import {HorizontalDisplayFormValueEvent} from '../../models/horizontal-display-form-value-event.model';
import {Dictionary} from 'lodash';
import {HorizontalDisplayFormColDef} from '../../models/horizontal-display-form-col-def.model';
import {OptimizationConstants} from '@constants/optimization.constants';
import {RELAXATION_COL_DEF} from '@optimization-settings/constraints-settings/constants/constraint-col-defs.constants';

@Component({
    selector: 'app-horizontal-display-form-row',
    templateUrl: './horizontal-display-form-row.component.html',
    styleUrls: ['./horizontal-display-form-row.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HorizontalDisplayFormRowComponent implements OnChanges {
    protected readonly RELAXATION_COL_DEF = RELAXATION_COL_DEF;

    @Input() cols: HorizontalDisplayFormColDef[];
    @Input() row: Dictionary<any>;
    @Output() enabled: EventEmitter<boolean> = new EventEmitter();
    @Output() updated: EventEmitter<HorizontalDisplayFormValueEvent> = new EventEmitter();
    @Output() deleted: EventEmitter<void> = new EventEmitter();
    @Output() selected: EventEmitter<void> = new EventEmitter();
    @Output() cloned: EventEmitter<void> = new EventEmitter();

    AuxGridColumnType = AuxGridColumnType;
    values: HorizontalDisplayFormValue[];
    readonly constraintContextOptions = {
        options: [{label: 'Clone constraint'}],
        onClick: () => this.cloned.emit()
    };
    readonly ALLOW_SHORT_POSITION_TEXT = OptimizationConstants.ALLOW_SHORT_POSITION;

    ngOnChanges(_changes: SimpleChanges): void {
        this.values = this.cols.map(({field, type, dependsOn}: {field: string, type?: string, dependsOn?: string}) => ({
            value: this.row[field],
            type,
            disabled: !!dependsOn && !this.row[dependsOn],
            field
        }));
    }

    onEnabled(event: CustomEvent<AuxCheckboxChangedDetailInterface>): void {
        this.enabled.emit(event.detail.value.checked);
    }

    onUpdated(event: CustomEvent<AuxCheckboxChangedDetailInterface>, name: string): void {
        this.updated.emit({
            name,
            value: event.detail.value.checked
        });
    }

    onDeleted(): void {
        this.deleted.emit();
    }

    onSelected(): void {
        this.selected.emit();
    }

    getValueId(_index: number, item: HorizontalDisplayFormValue): string {
        return item.field;
    }
}
