import {Component, OnInit} from '@angular/core';
import {ColumnOptionService, LibColumnUtils, SelectedColumnSelectorOption} from '@blk/explore-ui-column-option';
import {ColumnConfig, ColumnDefinition, PortfolioRiskColumnCategoryDefinition} from '@blk/explore-ui-core';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {RiskConstants} from '@constants/risk.constants';
import {RiskColumnSettings} from '@models/riskSettings/risk-column-settings.model';
import {FavoriteService} from '@services/favorite';
import {NotificationService} from '@services/notification';
import {ReportColumnService} from '@services/report-column/report-column.service';
import {isUndefined, reject} from 'lodash';
import {filter, finalize, takeUntil} from 'rxjs/operators';
import {AppStore} from '../../../app.store';
import {WidgetSettingsStore} from '../../../modules/widget/widget-settings/widget-settings.store';
import {ColumnSetSettingsComponent} from './column-set-settings.component';

/**
 * Factor Based Column SetSettings Component
 */
@Component({
    selector: 'app-factor-based-column-set-settings',
    templateUrl: './column-set-settings.component.html',
    styleUrls: ['./column-set-settings.component.scss']
})
export class FactorBasedColumnSetSettingsComponent extends ColumnSetSettingsComponent implements OnInit {

    private groupingType: string;

    /**
     * constructor
     */
    constructor(protected columnOptionService: ColumnOptionService, protected favoriteService: FavoriteService, protected appStore: AppStore,
                protected notificationService: NotificationService, protected widgetSettingsStore: WidgetSettingsStore, protected reportColumnService: ReportColumnService) {
        super(columnOptionService, favoriteService, appStore, notificationService);
    }

    /**
     * Performs required initialisation
     * ngOnInit is implemented by the BaseWidgetSettingComponent
     */
    initializeComponent(): void {
        this.displaySeparator = true;
        this.groupingType = this.groupingType || RiskConstants.MATCHING_RISK_CATEGORIES.BELONGS_TO_FACTOR_REPORT;

        this.widgetSettingsStore.groupingTypeChanged$
            .pipe(takeUntil(this.ngUnsubscribe), filter(groupingType => !isUndefined(groupingType)))
            .subscribe((groupingType) => {
                this.onGroupingTypeChanged(groupingType);
            });

        this.widgetSettingsStore.quickColumnSetChanged$
            .pipe(takeUntil(this.ngUnsubscribe), filter(columnSetName => !isUndefined(columnSetName)))
            .subscribe((columnSetName) => {
                this.onColumnSetChanged(columnSetName);
            });

        super.initializeComponent();
    }

    /**
     * Based on grouping type from FBA widget, update column filter and set available column tree.
     */
    private onGroupingTypeChanged(groupingType: string): void {
        this.groupingType = groupingType;
        this.widgetConfigInput.columnFilters = reject(this.widgetConfigInput.columnFilters, function (d) {
            return d.key === RiskConstants.MATCHING_RISK_CATEGORIES_KEY;
        });
        this.widgetConfigInput.columnFilters.push({
            type: '=',
            key: RiskConstants.MATCHING_RISK_CATEGORIES_KEY,
            value: [groupingType]
        });

        this.sourceDataUpdated$.next(this.getAvailableColumns());

        this.filterSelectedColumnsBasedOnGroupingType(groupingType, this.widgetInput.columns);
        this.columnSetUpdated$.next(this.widgetInput);
    }

    /**
     * Based on report changed, fetch column config and them as selected columns.
     */
    private onColumnSetChanged(columnSetName: string): void {
        this.columnSetLoaded$.next(true);
        this.reportColumnService
            .getColumnListFromReport(columnSetName)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe({
                next: (columns) => {
                    const riskColumnSettings = this.inputs.get(CoreRiskConstants.CONFIG_TYPE.RISK_COLUMN_SETTINGS) as RiskColumnSettings;
                    this.filterSelectedColumnsBasedOnGroupingType(riskColumnSettings.groupingTypeSelected.matchingRiskCategory, columns);
                    this.updateColumnOptionsOnColumnSet();
                }
            });
    }

    /**
     * Filter selected columns based on grouping type
     */
    private filterSelectedColumnsBasedOnGroupingType(groupingType: string, columns: ColumnConfig[]) {
        const filteredColumns: ColumnConfig[] = columns.filter(col => {
            const colDef: ColumnDefinition = LibColumnUtils.getColumnDefinition(col);
            if (colDef instanceof PortfolioRiskColumnCategoryDefinition) {
                return colDef.matchingRiskCategories.includes(groupingType);
            }
            return false;
        });
        this.widgetInput.columns = filteredColumns;
    }

    private updateColumnOptionsOnColumnSet() {
        if (this.widgetInput?.columns.length === 0) {
            return;
        }
        const selectedColumns: SelectedColumnSelectorOption[] = this.widgetInput.columns.map(column => new SelectedColumnSelectorOption(column, []));
        this.fetchColumnOptions(selectedColumns)
            .pipe(
                takeUntil(this.ngUnsubscribe),
                finalize(() => {
                    this.columnSetUpdated$.next(this.widgetInput);
                    this.columnSetLoaded$.next(false);
                }),
            )
            .subscribe({
                next:  (_populatedColumns) => {},
            });
    }
}
