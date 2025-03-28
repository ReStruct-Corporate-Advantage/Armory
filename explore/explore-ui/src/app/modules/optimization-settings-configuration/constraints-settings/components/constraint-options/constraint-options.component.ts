import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    Inject,
    Input,
    OnChanges,
    Output,
    SimpleChanges, Type, ViewChild
} from '@angular/core';
import {ConstraintOptionValueUpdate} from '../../models/constraint-option-value-update';
import {ConstraintOption, ConstraintOptionAttribute} from '../../models/constraint-option';
import {ConstraintOptionValue} from '../../models/constraint-option-value';
import {Dictionary, isNil} from 'lodash';
import {BehaviorSubject, Observable, ReplaySubject, Subject} from 'rxjs';
import {distinctUntilChanged, map, pluck} from 'rxjs/operators';
import {ConstraintOptionType} from '../../models/constraint-option-type';
import {CONSTRAINTS_SETTINGS_SERVICE} from '../../tokens/constraints-settings-service.token';
import {ConstraintsSettingsService} from '../../interfaces/constraints-settings-service.interface';
import {OptimizationSettings} from '@models/portfolio/optimization/optimization-settings.model';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {BaseColumnOptionComponent, ColumnOptionUpdate, CustomCalculationConstants} from '@blk/explore-ui-column-option';
import {ColumnConfig, ColumnOptionFactory, CommonUtils, WidgetConfigType} from '@blk/explore-ui-core';
import {
    CLIMATE_COLUMNS_GROUP, COMPANY_FUNDAMENTALS_COLUMNS_GROUP,
    ESG_COLUMNS_GROUP
} from '@optimization-settings/constraints-settings/constants/sector-constraint.constants';
import {CompositionUtils} from '@utils/composition.utils';
import {
    ConstraintOptionTypeKey
} from '@optimization-settings/constraints-settings/enums/constraint-option-type-key.enum';
import {AuxAccordion} from '@blk/aladdin-angular-components';

@Component({
    selector: 'app-constraint-options',
    templateUrl: './constraint-options.component.html',
    styleUrls: ['./constraint-options.component.scss']
})
export class ConstraintOptionsComponent<C, P> implements OnChanges {

    CONSTRAINT_SETTINGS_HEADER = 'Constraint Settings';

    @Input() constraint: C;
    @Input() parentConfig: P;

    @Output() updated: EventEmitter<void> = new EventEmitter();

    @ViewChild('accordion') auxAccordion: AuxAccordion;

    sectorConstraintOption: ConstraintOptionValue<any>;
    groupedOptions: ConstraintOptionValue<any>[] = [];
    unGroupedOptions: ConstraintOptionValue<any>[] = [];
    optionValues$: Subject<Dictionary<any>> = new ReplaySubject(1);
    columnOptionUpdated$ = new Subject<ColumnOptionUpdate>();
    title: string;
    // columnConfig is sent to custom calc constraints components for saving/loading purposes
    columnConfig: ColumnConfig;
    // The set of sections to display for this column.
    selectedSectionIndex = 0;
    widgetConfigType = WidgetConfigType.RISK_EXPOSURE;

    constructor(@Inject(CONSTRAINTS_SETTINGS_SERVICE) private constraintsSettingsService: ConstraintsSettingsService<C, any>, private cdRef: ChangeDetectorRef) {}

    ngOnChanges(_changes: SimpleChanges): void {
        if (this.constraint) {
            if ((this.constraint as unknown as Constraint).constraintTag === CustomCalculationConstants.CUSTOM_CALCULATION || [CLIMATE_COLUMNS_GROUP, ESG_COLUMNS_GROUP, COMPANY_FUNDAMENTALS_COLUMNS_GROUP].includes((this.constraint as unknown as Constraint).group)) {
                this.columnConfig = this.getColumnConfig((this.constraint as unknown as Constraint).constraintTag, (this.constraint as unknown as Constraint).positionType);
            }
            this.title = this.constraintsSettingsService.getConstraintTitle(this.constraint);
            const {optionTypes, optionValues}: {optionTypes: ConstraintOptionType<any>[], optionValues: Dictionary<any>} =
                this.constraintsSettingsService.getConstraintOptionTypes(this.constraint);
            const optionValues$ = new BehaviorSubject(optionValues);
            this.unGroupedOptions = [];
            this.groupedOptions = [];
            optionTypes.forEach((optionType: ConstraintOptionType<any>) => {
                const options: ConstraintOption<any>[] = optionType.optionAttributes.map((optionAttribute: ConstraintOptionAttribute<any>) => ({
                    optionAttribute,
                    value$: optionValues$.pipe(pluck(optionAttribute.key), distinctUntilChanged())
                }));
                const isColumnOption = this.constraintsSettingsService.getConstraintOptionComponent(optionType.type).prototype instanceof BaseColumnOptionComponent;
                if (isColumnOption) {
                    this.updateColumnConfig(optionType, options);
                }
                this.populateAllOptions(isColumnOption, optionType, options, optionValues$, optionType.optionTitle);
            });
            this.optionValues$ = optionValues$;
            this.cdRef.detectChanges();
        }
    }

    onUpdated(update: ConstraintOptionValueUpdate<any>): void {
        this.optionValues$.next(this.constraintsSettingsService.updateOptionValues(this.constraint, update.key, update.value));
        if (update.value && this.parentConfig instanceof OptimizationSettings && this.constraint instanceof Constraint) {
            if (CompositionUtils.checkIfConstraintInEfficientFormat(this.constraint)) {
                this.parentConfig.isEfficientFrontierEnabled = true;
                this.parentConfig.efficientEnabledConstraints.add(this.constraint);
            } else {
                this.parentConfig.efficientEnabledConstraints.delete(this.constraint);
            }
        }
        this.updated.emit();
    }

    /**
     * prepare the custom calculation column config
     */
    getColumnConfig(columnType: string, positionType: string): ColumnConfig {
        this.columnConfig = new ColumnConfig(columnType);
        this.columnConfig.positionColumnType = positionType;
        const suffix = CommonUtils.generateUniqueIdAsString();
        this.columnConfig.columnKey = columnType + '_' + suffix;
        return this.columnConfig;
    }

    private isVisible$(constraintOptionType: string, optionValues$: Observable<Dictionary<any>>): Observable<boolean> {
        return optionValues$.pipe(map(
            (optionValues: Dictionary<any>) => this.constraintsSettingsService.isConstraintOptionVisible(constraintOptionType, optionValues)
        ));
    }

    /**
     * Get the constraint option object for html
     * @param isColumnOption
     * @param optionType
     * @param options
     * @param optionValues$
     * @param headerName
     * @private
     */
    private getConstraintOptionObject(isColumnOption: boolean, optionType: ConstraintOptionType<any>, options: ConstraintOption<any>[], optionValues$: BehaviorSubject<Dictionary<any>>, headerName: string): ConstraintOptionValue<any> {
        return {
            component: isColumnOption ? this.constraintsSettingsService.getConstraintOptionComponent(optionType.type) as Type<BaseColumnOptionComponent<any>> : this.constraintsSettingsService.getConstraintOptionComponent(optionType.type),
            options: isColumnOption ? {columnOptionAttributes: optionType.optionAttributes} : options,
            isVisible$: this.isVisible$(optionType.type, optionValues$),
            headerName,
            isColumnOption,
            optionType: optionType.type,
            ...(isNil(this.columnConfig) ? {} : {columnConfig: this.columnConfig})
        };
    }

    /**
     * Populate all options for UI rendering
     * @param isColumnOption
     * @param optionType
     * @param options
     * @param optionValues$
     * @param headerName
     * @private
     */
    private populateAllOptions(isColumnOption: boolean, optionType: ConstraintOptionType<any>, options: ConstraintOption<any>[], optionValues$: BehaviorSubject<Dictionary<any>>, headerName: string): void {
        if (this.constraintsSettingsService.isUnGroupedConstraintOptionComponent(optionType.type)) {
            this.unGroupedOptions.push(this.getConstraintOptionObject(isColumnOption, optionType, options, optionValues$, optionType.optionTitle));
        } else {
            if (optionType.type === ConstraintOptionTypeKey.SECTOR) {
                this.sectorConstraintOption = this.getConstraintOptionObject(isColumnOption, optionType, options, optionValues$, optionType.optionTitle);
                return;
            }
            this.groupedOptions.push(this.getConstraintOptionObject(isColumnOption, optionType, options, optionValues$, optionType.optionTitle));
        }
    }

    /**
     * Update the column config from constraint, initialize it if it's not initialized
     * @param optionType
     * @param options
     * @private
     */
    private updateColumnConfig(optionType: ConstraintOptionType<any>, options: ConstraintOption<any>[]): void {
        if (!isNil((this.constraint as unknown as Constraint).columnConfig)) {
            this.columnConfig = (this.constraint as unknown as Constraint).columnConfig;
        } else {
            (this.constraint as unknown as Constraint).columnConfig = this.columnConfig;
            this.columnConfig.optionValues.push(ColumnOptionFactory.createModel(optionType.type, options));
        }
    }

    tabChangeHandler() {
        if (this.selectedSectionIndex === this.auxAccordion.activeTabIndex) {
            this.auxAccordion.activeTabIndex = this.selectedSectionIndex = -1;
        }
        this.selectedSectionIndex =  this.auxAccordion.activeTabIndex;
    }
}
