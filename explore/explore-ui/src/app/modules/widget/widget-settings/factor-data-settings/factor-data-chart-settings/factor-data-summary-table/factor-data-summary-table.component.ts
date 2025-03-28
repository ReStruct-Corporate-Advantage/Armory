import {Component, Input} from '@angular/core';
import {ColumnConfig, ColumnOptionMetaDataInterface, ColumnOptionFactory, ColumnType, SubscribableComponent} from '@blk/explore-ui-core';
import {ColumnOptionService, ColumnSet} from '@blk/explore-ui-column-option';
import {takeUntil} from 'rxjs/operators';
import {FactorDataChartSettingsStore} from '../stores/factor-data-chart-settings.store';
import {BehaviorSubject} from 'rxjs';

/**
 * Component for Factor Summary Table in FactorDataChartSettingsComponent
 */
@Component({
    selector: 'app-factor-data-summary-table',
    templateUrl: './factor-data-summary-table.component.html',
    styleUrls: ['/factor-data-summary-table.component.scss'],
})
export class FactorDataSummaryTableComponent extends SubscribableComponent {

    @Input()
    columnType: ColumnType;

    isEditFactorSettingsModalOpen = false;
    column: ColumnConfig;
    factorColumnOptions: ColumnOptionMetaDataInterface[];
    showGridLoadingOverlay$ = new BehaviorSubject<boolean>(false);

    constructor(protected columnOptionService: ColumnOptionService) {
        super();
    }

    /**
     * opens the EditFactorSettingsModal on top of WidgetSettingsModal
     */
    onEditFactorSettingsModalOpened(factorKey: string) {
        this.factorColumnOptions = undefined;
        // find the column to update based on factorKey
        this.column = (FactorDataChartSettingsStore.inputs.get(this.columnType) as ColumnSet).columns.find(col => col.columnKey === factorKey);

        if (!this.column) {
            console.error(`Column with colTag: ${factorKey} does not exists.`);
            return;
        }

        this.showGridLoadingOverlay$.next(true);

        this.columnOptionService.fetchColumnOptions$([{colTag: this.column.columnTag, use: this.column.positionColumnType}])
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((response) => {
                    const restrictedColumnOptions = FactorDataChartSettingsStore.getRestrictedColumnOptions(this.columnType);
                    this.factorColumnOptions = ColumnOptionFactory.getFilteredColumnOptions(undefined, response[0].options, restrictedColumnOptions);
                    this.isEditFactorSettingsModalOpen = true;
                },
                () => {
                    console.error(`Error fetching column options for colTag: ${factorKey}`);
                }, () => {
                    this.showGridLoadingOverlay$.next(false);
                }
            );
    }

    onEditFactorSettingsModalClosed(doneClicked: boolean): void {
        if (typeof doneClicked === 'boolean') {
            this.isEditFactorSettingsModalOpen = false;
            FactorDataChartSettingsStore.getRefreshFactorSummaryGrid$(this.columnType).next(doneClicked);
        }
    }

}
