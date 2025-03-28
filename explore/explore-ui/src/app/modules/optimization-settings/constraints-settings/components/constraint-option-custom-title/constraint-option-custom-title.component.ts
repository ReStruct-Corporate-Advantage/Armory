import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {AuxButtonSizeEnum, AuxButtonTypeEnum} from '@blk/aladdin-angular-components';
import {
    ColumnConfig,
    ColumnOptionMetaDataInterface,
    CoreFavoriteConstants,
    CoreWidgetConfigStore,
    ErrorTypeConstants,
    RestrictedOptionInterface,
    SubscribableComponent, UIErrorParameters,
    WidgetConfigType
} from '@blk/explore-ui-core';
import {
    OptionValueComponent
} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {FavoriteService} from '@services/favorite';
import {AppStore} from '../../../../../app.store';
import {NotificationService} from '@services/notification';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {Subject} from 'rxjs';
import {Dictionary, isEmpty, isNil} from 'lodash';
import {
    ConstraintOptionValueUpdate
} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {
    ColumnOptionUpdate,
    CustomCalculationColumnOption,
    CustomTitleColumnOption,
    CustomTitleColumnOptionComponent
} from '@blk/explore-ui-column-option';
import {distinctUntilChanged, pluck, takeUntil} from 'rxjs/operators';
import {SaveFavoriteAction} from '@models/favorite/save-favorite-action.model';
import {LoadFavoriteAction} from '@models/favorite/load-favorite-action.model';
import {ExploreOptimizationSettingsService} from '@optimization-settings/service/explore-optimization-settings.service';

/**
 * Component to create custom title and saving/loading for custom calculation constraint
 */
@Component({
  selector: 'app-constraint-option-custom-title',
  templateUrl: './constraint-option-custom-title.component.html',
  styleUrls: ['./constraint-option-custom-title.component.scss']
})
export class ConstraintOptionCustomTitleComponent extends SubscribableComponent implements OnInit, OptionValueComponent <any, OptimizationSettings> {

    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    readonly AuxButtonSizeEnum = AuxButtonSizeEnum;
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;

    @ViewChild('customTitleColumnOptionComponent', {static: false}) customTitleColumnOptionComponent: CustomTitleColumnOptionComponent;

    @Input() options: ConstraintOption<any>[];
    @Input() optionValues$: Subject<Dictionary<any>>;
    @Input() columnConfig: ColumnConfig;
    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<CustomCalculationColumnOption | string>> = new EventEmitter();

    restrictedColumnOptions: RestrictedOptionInterface;
    widgetType = WidgetConfigType.RISK_EXPOSURE;
    columnOptionUpdated$ = new Subject<ColumnOptionUpdate>();
    optionMetaData: ColumnOptionMetaDataInterface;
    readonly CUSTOM_CALC_PASCAL = CoreFavoriteConstants.CUSTOM_CALC_PASCAL;

    constructor(protected favoriteService: FavoriteService,
                protected appStore: AppStore, protected notificationService: NotificationService, private exploreOptimizationSettingsService: ExploreOptimizationSettingsService) {
        super();
    }

    ngOnInit() {
        this.optionMetaData = this.getOptionMetaData();
        const widgetConfig = CoreWidgetConfigStore.getChartConfigForType(this.widgetType);
        this.restrictedColumnOptions = widgetConfig.customCalculationColumn.restrictedOptoColumnOptions;
        this.optionValues$.pipe(pluck('constraintTitle'), distinctUntilChanged(), takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
            if (!isNil(value)) {
                const columnOptionValue = this.columnConfig.optionValues.find(optionValue => optionValue instanceof CustomTitleColumnOption);
                if (!columnOptionValue) {
                    this.columnConfig.optionValues.push(new CustomTitleColumnOption({customTitle: value}));
                } else {
                    (columnOptionValue as CustomTitleColumnOption).customTitle = value;
                }
            }
        });
    }

    /**
     * Open load custom calc favorite modal
     */
    openLoadCustomCalcModal(): void {
        this.appStore.openLoadFavoriteModal$.next(
            new LoadFavoriteAction({
                type: CoreFavoriteConstants.OPTO_CUSTOM_CALC_COLUMN,
                treeType: CoreFavoriteConstants.CUSTOM_CALC_COLUMN_FOLDER,
                displayName: CoreFavoriteConstants.CUSTOM_CALC_COLUMN_LOWER + 's',
                callback: this.loadCustomCalcColumn,
                headerDisplayName: CoreFavoriteConstants.CUSTOM_CALC_COLUMN_LOWER
            }));
    }

    /**
     * Load a favorite column set
     * this function is used as callback so need arrow to get the right scope
     */
    loadCustomCalcColumn = (favId: number, loadingMessage: string): void => {
        this.favoriteService
            .getFavorite$(favId, loadingMessage)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((column: ColumnConfig) => {
                    this.columnConfig.deserialize(column);
                    this.customTitleColumnOptionComponent.optionValue = (this.columnConfig.optionValues[0]) as CustomTitleColumnOption;
                    const title =  ((this.columnConfig.optionValues[0]) as CustomTitleColumnOption).customTitle;
                    this.columnConfig.columnTitle = title;
                    this.customTitleColumnOptionComponent.initializeComponent();
                    if (!isEmpty(title)) {
                        this.updated.emit({
                            key: 'constraintTitle',
                            value: title
                        });
                    }

                    // Send loaded columnConfig to other components of customCalculationConstraint
                    this.exploreOptimizationSettingsService.columnConfigSubject$.next(this.columnConfig);
                },
                (error) => {
                    this.notificationService.error('failed to load column with id: ' + favId, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_ERROR);
                    console.error(error);
                });
    }

    /**
     * Open save custom calc favorite modal
     */
    openSaveCustomCalcModal(): void {
        this.appStore.saveFavoriteAction$.next(
            new SaveFavoriteAction(
                this.columnConfig,
                CoreFavoriteConstants.CUSTOM_CALC_COLUMN_LOWER,
                CoreFavoriteConstants.OPTO_CUSTOM_CALC_COLUMN,
                CoreFavoriteConstants.CUSTOM_CALC_COLUMN_FOLDER
            ));
    }

    /**
     * prepare column options metadata from options
     * @private
     */
    getOptionMetaData(): ColumnOptionMetaDataInterface {
        return {
            columnOptionKey: 'customColumnTitle',
            columnOptionConfigType: 'customColumnTitle',
            columnOptionAttributes: this.options.map(option => option.optionAttribute)
        } as ColumnOptionMetaDataInterface;
    }

    updateTitle() {
        const title =  ((this.columnConfig.optionValues[0]) as CustomTitleColumnOption).customTitle;
        this.updated.emit({
            key: 'constraintTitle',
            value: !isEmpty(title) ? title : this.CUSTOM_CALC_PASCAL
        });
    }
}
