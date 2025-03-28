import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {OptionValueComponent} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {ConstraintOptionTypeKey} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {BaseFactorConstraintOptionComponent} from '@optimization-settings/constraints-settings/components/base-factor-constraint-option.component';
import {AppStore} from '../../../../../app.store';
import {RestrictedOptionInterface, WidgetConfigInput, WidgetInput, ColumnType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
/**
 * component for factor tag constraint
 */
@Component({
    selector: 'app-constraint-factor-tag',
    templateUrl: './constraint-option-factor-tag.component.html',
    styleUrls: ['./constraint-option-factor-tag.component.scss']
})
export class ConstraintOptionFactorTagComponent extends BaseFactorConstraintOptionComponent implements OnInit, OptionValueComponent<string, OptimizationSettings> {

    readonly columnType = ColumnType.COLUMNS;

    widgetConfigInput: WidgetConfigInput;
    restrictedColumnOptions: RestrictedOptionInterface;
    inputs: Map<string, WidgetInput>;
    isFactorsModalOpen = false;
    columnSet: ColumnSet = new ColumnSet();

    constructor(appStore: AppStore, cdRef: ChangeDetectorRef) {
        super(appStore, cdRef);
    }

    ngOnInit() {
        super.ngOnInit();
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
        this.inputs = new Map();
        this.inputs.set(ColumnType.COLUMNS, this.columnSet);
    }

    /**
     * on factor tag value updated by the user
     */
    onUpdated(event: ConstraintOptionValueUpdate<string>): void {
        super.onUpdated(event, ConstraintOptionTypeKey.QUICK_FACTOR_BLOCK);
    }

    /**
     * on selection of factor tag radio button
     */
    disableOtherField(): void {
        super.disableOtherField(ConstraintOptionTypeKey.QUICK_FACTOR_BLOCK);
    }

    getKeyToDisable(): string {
        return ConstraintOptionTypeKey.FACTOR_TAG;
    }

    onAddFactorsButtonClicked(): void {
        this.isFactorsModalOpen = true;
    }

    onFactorsModalClosed(event: any): void {
        this.isFactorsModalOpen = false;
        if (event) {
            super.onUpdated({
                key: 'factorTagList',
                value: (this.inputs.get(ColumnType.COLUMNS) as ColumnSet).columns[0]?.columnTag
            }, ConstraintOptionTypeKey.QUICK_FACTOR_BLOCK);
        }
    }
}
