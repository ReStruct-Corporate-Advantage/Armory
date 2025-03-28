import {Component, Input, OnInit} from '@angular/core';
import {AuxSelectOption, AuxSelectOptionGroup, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {CommonConstants} from '@constants/index';
import {
    ChartWidgetInputConfigType,
    ColumnConfig,
    ExploreSelectOption,
    ExploreSelectOptionGroup,
    WidgetInput
} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {SecondaryAxis} from '@models/widget/inputs/chart-settings/secondary-axis.model';
import {isNil} from 'lodash';

@Component({
    selector: 'app-secondary-axis-column-settings',
    templateUrl: './secondary-axis-column-settings.component.html',
    styleUrls: ['../chart-settings.component.scss']
})
/**
 * Component for the Secondary Axis Column
 */
export class SecondaryAxisColumnSettingsComponent implements OnInit {

    @Input() inputs: Map<string, WidgetInput>;
    @Input() widgetInput: SecondaryAxis;

    widgetColumns: ColumnConfig[];
    secondaryAxisColumns: AuxSelectOptionGroup[];
    allColumnsSelectOptions: AuxSelectOptionGroup[] = [];

    ngOnInit(): void {
        if (!this.widgetInput) {
            this.widgetInput = new SecondaryAxis();
            this.inputs.set(ChartWidgetInputConfigType.SECONDARY_AXIS, this.widgetInput);
        }
        const columns: ColumnConfig[] = (this.inputs.get(CommonConstants.CONFIG_TYPE.COLUMNS) as ColumnSet)?.[CommonConstants.CONFIG_TYPE.COLUMNS];
        if (columns) {
            this.allColumnsSelectOptions = [new ExploreSelectOptionGroup(columns.map(column => new ExploreSelectOption(column.columnTitle, column.columnKey, !isNil(this.widgetInput.secondaryAxisColumn) && this.widgetInput.secondaryAxisColumn === column.columnKey)))];
        }
    }

    /**
     * Secondary Axis column change handler
     */
    onSecondaryAxisColSelectionChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.widgetInput.secondaryAxisColumn = (event.detail.value as AuxSelectOption)?.value;
    }
}
