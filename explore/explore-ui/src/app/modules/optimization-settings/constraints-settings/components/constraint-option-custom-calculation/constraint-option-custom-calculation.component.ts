import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {
    AuxButtonSizeEnum,
    AuxButtonTypeEnum
} from '@blk/aladdin-angular-components';
import {CustomCalculationColumnOption, CustomCalculationColumnOptionComponent} from '@blk/explore-ui-column-option';
import {ColumnConfig, ColumnConstants, CoreFavoriteConstants, CoreWidgetConfigStore, RestrictedOptionInterface, SubscribableComponent, WidgetConfigType} from '@blk/explore-ui-core';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {OptionValueComponent} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {FavoriteService} from '@services/favorite';
import {NotificationService} from '@services/notification';
import {isNil} from 'lodash';
import {takeUntil} from 'rxjs/operators';
import {AppStore} from '../../../../../app.store';
import {ExploreOptimizationSettingsService} from '@optimization-settings/service/explore-optimization-settings.service';

@Component({
    selector: 'app-constraint-option-custom-calculation',
    templateUrl: './constraint-custom-calculation.component.html',
    styleUrls: ['./constraint-custom-calculation.component.scss']
})
export class ConstraintOptionCustomCalculationComponent extends SubscribableComponent implements OnInit, OptionValueComponent <any, OptimizationSettings> {
    readonly CoreFavoriteConstants = CoreFavoriteConstants;
    readonly AuxButtonSizeEnum = AuxButtonSizeEnum;
    readonly AuxButtonTypeEnum = AuxButtonTypeEnum;

    @ViewChild('customcalculationComponent', {static: false}) customCalculationComponent: CustomCalculationColumnOptionComponent;

    @Input() options: ConstraintOption<CustomCalculationColumnOption>[];
    @Input() columnConfig: ColumnConfig;
    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<CustomCalculationColumnOption | string>> = new EventEmitter();

    /**
     *  Column option to be restricted from rendering.
     */
    restrictedColumnOptions: RestrictedOptionInterface;

    widgetType = WidgetConfigType.RISK_EXPOSURE;
    isOpen = false;
    readonly CUSTOM_CALC_PASCAL = CoreFavoriteConstants.CUSTOM_CALC_PASCAL;
    readonly CUSTOM_CALCULATION = ColumnConstants.COLUMN_HANDLERS.CUSTOM_CALCULATION;

    constructor(protected favoriteService: FavoriteService,
                protected appStore: AppStore, protected notificationService: NotificationService,
                private exploreOptimizationSettingsService: ExploreOptimizationSettingsService) {
        super();
    }

    ngOnInit() {
        this.openNotifyModal();
        const widgetConfig = CoreWidgetConfigStore.getChartConfigForType(this.widgetType);
        this.restrictedColumnOptions = widgetConfig.customCalculationColumn.restrictedOptoColumnOptions;
        const option: ConstraintOption<CustomCalculationColumnOption> = this.options[0];
        option.value$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: CustomCalculationColumnOption) => {
            if (!isNil(value)) {
                const columnOptionValue = this.columnConfig.optionValues.find(optionValue => optionValue instanceof CustomCalculationColumnOption);
                if (!columnOptionValue) {
                    this.columnConfig.optionValues.push(value);
                } else {
                    (columnOptionValue as CustomCalculationColumnOption).expression = value.expression;
                    (columnOptionValue as CustomCalculationColumnOption).measureMapping = value.measureMapping;
                }
            }
        });
        this.exploreOptimizationSettingsService.columnConfigSubject$.pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((favorite: ColumnConfig) => {
                // Update columnConfig when loading a favorite and reinitialize child component
                this.columnConfig = favorite;
                this.customCalculationComponent.updateOptionValues();
                this.customCalculationComponent.initializeComponent();
                this.onCustomCalcUpdate();
            });
    }

    onCustomCalcUpdate(): void {
        this.updated.emit({
            key: this.CUSTOM_CALCULATION,
            value: this.columnConfig.optionValues.find(optionValue => optionValue.configType === CustomCalculationColumnOption.CONFIG_TYPE) as CustomCalculationColumnOption
        });
    }

    /**
     * Open notify modal
     */
    private openNotifyModal(): void {
        this.isOpen = true;
    }

    /**
     * Called upon close of modal
     */
    closeNotifyModal(): void {
        this.isOpen = false;
    }
}
