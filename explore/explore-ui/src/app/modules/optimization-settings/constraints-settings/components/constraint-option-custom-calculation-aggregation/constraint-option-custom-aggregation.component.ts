import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {
    ColumnConfig, ColumnOptionMetaDataInterface, CoreWidgetConfigStore,
    RestrictedOptionInterface,
    SubscribableComponent, WidgetConfigType
} from '@blk/explore-ui-core';
import {OptionValueComponent} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';
import {CustomAggregationColumnOption, CustomCalculationColumnOptionComponent} from '@blk/explore-ui-column-option';
import {ConstraintOption} from '@optimization-settings-configuration/constraints-settings/models/constraint-option';
import {ConstraintOptionValueUpdate} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-value-update';
import {Dictionary, isNil} from 'lodash';
import {ConstraintOptionTypeKey} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {Subject} from 'rxjs';
import {distinctUntilChanged, pluck, takeUntil} from 'rxjs/operators';
import {ExploreOptimizationSettingsService} from '@optimization-settings/service/explore-optimization-settings.service';
/**
 * Component to create custom aggregation options for custom calculation constraint
 */
@Component({
    selector: 'app-constraint-option-custom-aggregation',
    templateUrl: './constraint-option-custom-aggregation.component.html',
    styleUrls: ['./constraint-option-custom-aggregation.component.scss']
})
export class ConstraintOptionCustomAggregationComponent extends SubscribableComponent implements OnInit, OptionValueComponent<any, any> {

    constructor(private exploreOptimizationSettingsService: ExploreOptimizationSettingsService) {
        super();
    }

    @ViewChild('customAggregationColumnOptionComponent', {static: false}) customAggregationComponent: CustomCalculationColumnOptionComponent;


    @Input() options: ConstraintOption<any>[];
    @Input() optionValues$: Subject<Dictionary<any>>;
    @Input() columnConfig: ColumnConfig;
    @Output() updated: EventEmitter<ConstraintOptionValueUpdate<any>> = new EventEmitter();

    /**
     *  Column option to be restricted from rendering.
     */
    restrictedColumnOptions: RestrictedOptionInterface;

    widgetType = WidgetConfigType.RISK_EXPOSURE;
    optionMetaData: ColumnOptionMetaDataInterface;

    /**
     * onInit hook
     */
    ngOnInit(): void {
        this.optionMetaData = this.getOptionMetaData();
        const widgetConfig = CoreWidgetConfigStore.getChartConfigForType(this.widgetType);
        this.restrictedColumnOptions = widgetConfig.customCalculationColumn.restrictedOptoColumnOptions;
        this.optionValues$.pipe(pluck(ConstraintOptionTypeKey.CUSTOM_AGGREGATION), distinctUntilChanged(), takeUntil(this.ngUnsubscribe))
            .subscribe((value: CustomAggregationColumnOption) => {
                if (!isNil(value)) {
                    const columnOptionValue = this.columnConfig.optionValues.find(optionValue => optionValue instanceof CustomAggregationColumnOption);
                    if (!columnOptionValue) {
                        this.columnConfig.optionValues.push(new CustomAggregationColumnOption(value));
                    } else {
                        columnOptionValue.deserialize(value);
                    }
                }
            });
        this.exploreOptimizationSettingsService.columnConfigSubject$.pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((favorite: ColumnConfig) => {
                // Update columnConfig when loading a favorite and reinitialize child component
                this.columnConfig = favorite;
                this.customAggregationComponent.updateOptionValues();
                this.customAggregationComponent.initializeComponent();
                this.onCustomAggregationUpdate();
            });
    }

    /**
     * prepare column options metadata from options
     * @private
     */
    getOptionMetaData(): ColumnOptionMetaDataInterface {
        return {
            columnOptionKey: ConstraintOptionTypeKey.CUSTOM_AGGREGATION,
            columnOptionConfigType: ConstraintOptionTypeKey.CUSTOM_AGGREGATION,
            columnOptionAttributes: this.options.map(option => option.optionAttribute)
        } as ColumnOptionMetaDataInterface;
    }

    /**
     * update the customAggregation option values
     */
    onCustomAggregationUpdate(): void {
        this.updated.emit({
            key: ConstraintOptionTypeKey.CUSTOM_AGGREGATION,
            value: this.columnConfig.optionValues.find(optionValue => optionValue.configType === CustomAggregationColumnOption.CONFIG_TYPE) as CustomAggregationColumnOption
        });
    }
}
