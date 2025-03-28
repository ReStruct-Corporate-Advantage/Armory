import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';
import {HorizontalDisplayFormIndexEvent} from '../../models/horizontal-display-form-index-event.model';
import {HorizontalDisplayFormValueEvent} from '../../models/horizontal-display-form-value-event.model';
import {Dictionary} from 'lodash';
import {HorizontalDisplayFormColDef} from '../../models/horizontal-display-form-col-def.model';
import {AuxGridColumnType} from '@blk/aladdin-angular-components';
import {Observable} from 'rxjs';
import {RELAXATION_COL_DEF} from '@optimization-settings/constraints-settings/constants/constraint-col-defs.constants';

@Component({
    selector: 'app-horizontal-display-form',
    templateUrl: './horizontal-display-form.component.html',
    styleUrls: ['./horizontal-display-form.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class HorizontalDisplayFormComponent {
    protected readonly RELAXATION_COL_DEF = RELAXATION_COL_DEF;

    @Input() cols: HorizontalDisplayFormColDef[];
    @Input() rows: Array<Observable<Dictionary<any>>>;
    @Input() selectedIndex: number;
    @Output() enabled: EventEmitter<HorizontalDisplayFormIndexEvent<boolean>> = new EventEmitter();
    @Output() updated: EventEmitter<HorizontalDisplayFormIndexEvent<HorizontalDisplayFormValueEvent>> = new EventEmitter();
    @Output() deleted: EventEmitter<number> = new EventEmitter();
    @Output() selected: EventEmitter<number> = new EventEmitter();
    @Output() cloned: EventEmitter<number> = new EventEmitter();

    AuxGridColumnType = AuxGridColumnType;

    onEnabled(index: number, value: boolean): void {
        this.enabled.emit({index, value});
    }

    onUpdated(index: number, value: HorizontalDisplayFormValueEvent): void {
        this.updated.emit({index, value});
    }

    onDeleted(index: number): void {
        this.deleted.emit(index);
    }

    onSelected(index: number): void {
        this.selected.emit(index);
    }

    onCloned(index: number): void {
        this.cloned.emit(index);
    }

}
