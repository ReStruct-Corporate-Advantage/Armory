import {Component} from '@angular/core';
import {CoverageMeasureColumnOption} from '../../../models/column-option/coverage-measure-column-option.model';
import {CoreWidgetConfigStore, RestrictedOptionInterface} from '@blk/explore-ui-core';
import {BaseColumnTitleModifiableColumnOptionComponent} from '../base-column-title-modifiable-column-option.component';
import {union} from 'lodash';
import {ColumnSet} from '../../../models/column-set/column-set.model';

@Component({
    selector: 'explore-coverage-measure-column-option',
    templateUrl: './coverage-measure-column-option.component.html',
    styleUrls: ['./coverage-measure-column-option.component.scss']
})
export class CoverageMeasureColumnOptionComponent extends BaseColumnTitleModifiableColumnOptionComponent<CoverageMeasureColumnOption> {
    public static readonly OPTION_KEY = 'coverageMeasure';

    title: string;

    isMeasureSelectionModalOpen = false;

    modifiedRestrictedColumnOptions: RestrictedOptionInterface;

    protected getOptionValueConfigType(): string {
        return CoverageMeasureColumnOptionComponent.OPTION_KEY;
    }

    protected initializeComponent(): void {
        super.initializeComponent();
        if (!this.option) {
            return;
        }

        this.title = this.option.columnOptionAttributes[0].title;

        this.modifyRestrictedColumnOptions();
    }

    private modifyRestrictedColumnOptions(): void {
        const widgetConfig = CoreWidgetConfigStore.getChartConfigForType(this.widgetType);
        this.modifiedRestrictedColumnOptions = {
            sections: union(this.restrictedColumnOptions?.sections, widgetConfig?.customCoverageColumn?.restrictedColumnOptions?.sections),
            options: [{section: 'singleSelectOptions', options: ['spawnsChildColumns']}]
        };
    }

    onMeasureSelected(columnSet: ColumnSet | undefined): void {
        this.isMeasureSelectionModalOpen = false;
        if (columnSet instanceof ColumnSet) {
            this.optionValue.column = columnSet.columns[0];
            this.updateColumnTitle();
        }
    }

    openMeasureSelectionModel(): void {
        this.isMeasureSelectionModalOpen = true;
    }
}
