import {Injectable, Type} from '@angular/core';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {Dictionary, isEmpty, isUndefined} from 'lodash';
import {OptimizationConstraint} from '@models/definitions/optimization/optimization-constraint.model';
import {DefinitionsStore} from '../../../../stores';
import {Constraint} from '@models/portfolio/constraints/constraint.model';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {OptionValueComponent} from '@optimization-settings-configuration/constraints-settings/interfaces/option-value-component.interface';
import {ConstraintOptionNumberComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-number/constraint-option-number.component';
import {ConstraintOptionSelectComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-select/constraint-option-select.component';
import {ConstraintOptionBoundsComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-bounds/constraint-option-bounds.component';
import {ConstraintOptionSecurityListComponent} from '../components/constraint-option-security-list/constraint-option-security-list.component';
import {ConstraintOptionRadioComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-radio/constraint-option-radio.component';
import {ConstraintOptionBreakdownComponent} from '../components/constraint-option-breakdown/constraint-option-breakdown.component';
import {ConstraintOptionFilterComponent} from '../components/constraint-option-filter/constraint-option-filter.component';
import {ALL_TYPE, PORTFOLIO, RELATIVE} from '../constants/sector-constraint.constants';
import {ConstraintOptionType, ConstraintOptionTypesWithValues} from '@optimization-settings-configuration/constraints-settings/models/constraint-option-type';
import {ConstraintsSettingsService} from '@optimization-settings-configuration/constraints-settings/interfaces/constraints-settings-service.interface';
import {ConstraintOptionTypeKey} from '../enums/constraint-option-type-key.enum';
import {ConstraintOptionBoundsLongShortComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-bounds-long-short/constraint-option-bounds-long-short.component';
import {SUB_TYPE_FACTOR_CONSTRAINTS} from '@optimization-settings/constants/optimization-types.constants';
import {ConstraintOptionFactorTagComponent} from '@optimization-settings/constraints-settings/components/constraint-option-factor-tag/constraint-option-factor-tag.component';
import {ConstraintOptionQuickFactorBlockComponent} from '@optimization-settings/constraints-settings/components/constraint-option-quick-factor-block/constraint-option-quick-factor-block.component';
import {
    BaseColumnOptionComponent,
    columnOptionComponentList,
    ColumnOptionResponse,
    ColumnOptionService,
    LibColumnUtils
} from '@blk/explore-ui-column-option';
import {ColumnOptionMetaDataInterface, CoreCommonConstants} from '@blk/explore-ui-core';
import {ConstraintOptionCustomCalculationComponent} from '@optimization-settings/constraints-settings/components/constraint-option-custom-calculation/constraint-option-custom-calculation.component';
import {ConstraintOptionEfficientFrontierNumberComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-efficient-frontier-number/constraint-option-efficient-frontier-number.component';
import {ConstraintOptionBoundTypeComponent} from '@optimization-settings/constraints-settings/components/constraint-option-relative-bounds/constraint-option-bound-type/constraint-option-bound-type.component';
import {ConstraintOptionBoundsRelativeComponent} from '@optimization-settings/constraints-settings/components/constraint-option-relative-bounds/constraint-option-bounds-relative/constraint-option-bounds-relative.component';
import {ConstraintOptionCustomAggregationComponent} from '@optimization-settings/constraints-settings/components/constraint-option-custom-calculation-aggregation/constraint-option-custom-aggregation.component';
import {ConstraintOptionEfficientEnabledBoundsRelativeComponent} from '@optimization-settings/constraints-settings/components/constraint-option-relative-bounds/constraint-option-efficient-enabled-bounds-relative/constraint-option-efficient-enabled-bounds-relative.component';
import {ConstraintOptionCustomTitleComponent} from '@optimization-settings/constraints-settings/components/constraint-option-custom-title/constraint-option-custom-title.component';
import {ConstraintOptionEfficientEnabledBoundsComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-efficient-enabled-bounds/constraint-option-efficient-enabled-bounds.component';
import {ConstraintOptionRelativeComponent} from '@optimization-settings/constraints-settings/components/constraint-option-relative-bounds/constraint-option-relative/constraint-option-relative.component';
import {ConstraintOptionCollapsedLookThroughComponent} from '@optimization-settings/constraints-settings/components/constraint-option-collapsed-look-through/constraint-option-collapsed-look-through.component';
import {ConstraintOptionMinTradeSizeComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-min-trade-size/constraint-option-min-trade-size.component';
import {
    MaximizeAlphaStressScenarioComponent
} from '@optimization-settings/objectives-settings/components/maximize-alpha-stress-scenario/maximize-alpha-stress-scenario.component';
import {ConstraintOptionMissingDataComponent} from '@optimization-settings-configuration/constraints-settings/components/constraint-option-missing-data/constraint-option-missing-data.component';

@Injectable({
    providedIn: 'root'
})
export class ExploreConstraintsSettingsService implements ConstraintsSettingsService<Constraint, OptimizationConstraint> {
    optionsComponents: Map<string, Type<OptionValueComponent<any, any> | BaseColumnOptionComponent<any>>>;
    unGroupedOptionsComponents: Map<string, Type<OptionValueComponent<any, any> | BaseColumnOptionComponent<any>>>;

    constructor(private columnOptionService: ColumnOptionService) {
        this.unGroupedOptionsComponents = new Map<string, Type<OptionValueComponent<any, any> | BaseColumnOptionComponent<any>>>([
                ...columnOptionComponentList.map(option => [option.OPTION_KEY, option] as [string, Type<OptionValueComponent<any, any> | BaseColumnOptionComponent<any>>]),
                [ConstraintOptionTypeKey.BREAKDOWN, ConstraintOptionBreakdownComponent],
                [ConstraintOptionTypeKey.FILTER, ConstraintOptionFilterComponent],
                [ConstraintOptionTypeKey.SECURITY_LIST, ConstraintOptionSecurityListComponent],
                [ConstraintOptionTypeKey.SECURITY_CONSTRAINT_FILTER, ConstraintOptionSecurityListComponent],
                [ConstraintOptionTypeKey.COLLAPSED_LOOK_THROUGH, ConstraintOptionCollapsedLookThroughComponent],
                [ConstraintOptionTypeKey.CUSTOM_CALCULATION, ConstraintOptionCustomCalculationComponent],
        ]);
        this.optionsComponents = new Map<string, Type<OptionValueComponent<any, any> | BaseColumnOptionComponent<any>>>([
            ...this.unGroupedOptionsComponents,
            [ConstraintOptionTypeKey.NUMBER, ConstraintOptionNumberComponent],
            [ConstraintOptionTypeKey.EFFICIENT_FRONTIER, ConstraintOptionEfficientFrontierNumberComponent],
            [ConstraintOptionTypeKey.UNIT, ConstraintOptionSelectComponent],
            [ConstraintOptionTypeKey.BOOLEAN, ConstraintOptionSelectComponent],
            [ConstraintOptionTypeKey.BOUNDS, ConstraintOptionBoundsComponent],
            [ConstraintOptionTypeKey.SECURITY_CONSTRAINT_SUBSECTION, ConstraintOptionSecurityListComponent],
            [ConstraintOptionTypeKey.SELECTED_SECURITIES, ConstraintOptionSecurityListComponent],
            [ConstraintOptionTypeKey.SECTOR, ConstraintOptionRadioComponent],
            [ConstraintOptionTypeKey.BOUNDS_LONG_SHORT, ConstraintOptionBoundsLongShortComponent],
            [ConstraintOptionTypeKey.QUICK_FACTOR_BLOCK, ConstraintOptionQuickFactorBlockComponent],
            [ConstraintOptionTypeKey.FACTOR_TAG, ConstraintOptionFactorTagComponent],
            [ConstraintOptionTypeKey.CUSTOM_AGGREGATION, ConstraintOptionCustomAggregationComponent],
            [ConstraintOptionTypeKey.RELATIVE_ABSOLUTE, ConstraintOptionBoundTypeComponent],
            [ConstraintOptionTypeKey.RELATIVE_PORT_BENCH, ConstraintOptionRelativeComponent],
            [ConstraintOptionTypeKey.RELATIVE_BOUNDS, ConstraintOptionBoundsRelativeComponent],
            [ConstraintOptionTypeKey.EFFICIENT_ENABLED_RELATIVE_BOUNDS, ConstraintOptionEfficientEnabledBoundsRelativeComponent],
            [ConstraintOptionTypeKey.EFFICIENT_ENABLED_BOUNDS, ConstraintOptionEfficientEnabledBoundsComponent],
            [ConstraintOptionTypeKey.CUSTOM_TITLE, ConstraintOptionCustomTitleComponent],
            [ConstraintOptionTypeKey.ALLOW_SHORT_POSITIONS, ConstraintOptionSelectComponent],
            [ConstraintOptionTypeKey.MIN_TRADE_SIZE, ConstraintOptionMinTradeSizeComponent],
            [ConstraintOptionTypeKey.STRESS_PNL_SCENARIO, MaximizeAlphaStressScenarioComponent],
            [ConstraintOptionTypeKey.MISSING_DATA_HANDLING, ConstraintOptionMissingDataComponent]
        ]);
    }

    createConstraintMeasures(type: string): AuxAdvancedTreeListInterface[] {
        const result = DefinitionsStore.optimizationConstraint.filter((optimizationConstraint: OptimizationConstraint) => optimizationConstraint.constraintType === type);
        return LibColumnUtils.prepareColumnTree(result);
    }

    createConstraint$(constraintDefinition: OptimizationConstraint): Observable<Constraint> {
        return this.getConstraintOptions$(constraintDefinition.columnTag, constraintDefinition.constraintType)
            .pipe(map((constraintOptions: ColumnOptionMetaDataInterface[]) => this.createConstraint(constraintDefinition, constraintOptions)));
    }

    getConstraintOptionComponent(constraintOptionType: string): Type<OptionValueComponent<any, any> | BaseColumnOptionComponent<any>> {
        return this.optionsComponents.get(constraintOptionType);
    }

    isUnGroupedConstraintOptionComponent(constraintOptionType: string): boolean {
        return this.unGroupedOptionsComponents.has(constraintOptionType);
    }

    isConstraintOptionVisible(constraintOptionType: string, optionValues: Dictionary<any>): boolean {
        switch (constraintOptionType) {
            case ConstraintOptionTypeKey.BREAKDOWN:
                return optionValues.sectorConstraintType === ALL_TYPE;
            case ConstraintOptionTypeKey.RELATIVE_PORT_BENCH:
            case ConstraintOptionTypeKey.RELATIVE_BOUNDS:
            case ConstraintOptionTypeKey.EFFICIENT_ENABLED_RELATIVE_BOUNDS:
                return optionValues.RelativeAbsolute === RELATIVE;
            case ConstraintOptionTypeKey.EFFICIENT_ENABLED_BOUNDS:
            case ConstraintOptionTypeKey.BOUNDS:
                return isUndefined(optionValues.RelativeAbsolute) || optionValues.RelativeAbsolute !== RELATIVE;
            case ConstraintOptionTypeKey.FILTER:
                return optionValues.sectorConstraintType !== PORTFOLIO;
            default:
                return true;
        }
    }

    getConstraintOptionTypes<T>(constraint: Constraint): ConstraintOptionTypesWithValues<T> {
        const {constraintOptions, optionValues}: {constraintOptions: ColumnOptionMetaDataInterface[], optionValues: Dictionary<any>} = constraint;
        const optionTypes: ConstraintOptionType<T>[] = constraintOptions.map((constraintOption: ColumnOptionMetaDataInterface) => ({
            type: constraintOption.columnOptionKey,
            optionAttributes: constraintOption.columnOptionAttributes,
            optionTitle: constraintOption.columnOptionTitle
        }));
        return {
            optionTypes,
            optionValues
        };
    }

    updateOptionValues(constraint: Constraint, key: string, value: any): Dictionary<any> {
        if (constraint.constraintType === SUB_TYPE_FACTOR_CONSTRAINTS) {
            if (key === ConstraintOptionTypeKey.QUICK_FACTOR_BLOCK && !isEmpty(value)) {
                constraint.optionValues[ConstraintOptionTypeKey.FACTOR_TAG] = CoreCommonConstants.EMPTY_STRING;
            }
            if (key === ConstraintOptionTypeKey.FACTOR_TAG && !isEmpty(value)) {
                constraint.optionValues[ConstraintOptionTypeKey.QUICK_FACTOR_BLOCK] = CoreCommonConstants.EMPTY_STRING;
            }
        }
        constraint.optionValues[key] = value;
        return constraint.optionValues;
    }

    updateConstraintEnabled(constraint: Constraint, enabled: boolean): void {
        constraint.enabled = enabled;
    }

    updateConstraintField(constraint: Constraint, _field: string, value: any): void {
        // currently only relaxation value updates
        constraint.relaxationValue = value ? 1 : 0;
    }

    getConstraintTitle(constraint: Constraint): string {
        return constraint.title;
    }

    requiresConstraintOptionsLoad(constraint: Constraint): boolean {
        return !constraint.constraintOptions || constraint.constraintOptions.length === 0;
    }


    loadConstraintOptions$(constraint: Constraint): Observable<boolean> {
        return this.getConstraintOptions$(constraint.constraintTag, constraint.constraintType).pipe(map((constraintOptions: ColumnOptionMetaDataInterface[]) => {
            constraint.constraintOptions = constraintOptions;
            return true;
        }));
    }

    createConstraint(constraintDefinition: OptimizationConstraint, constraintOptions: ColumnOptionMetaDataInterface[]): Constraint {
        const constraint: Constraint = new Constraint();
        constraint.constraintTag = constraintDefinition.columnTag;
        constraint.constraintType = constraintDefinition.constraintType;
        constraint.title = constraintDefinition.title;
        if (constraintDefinition.groups) {
            constraint.group = constraintDefinition.groups[0];
        }
        constraint.isRelaxable = constraintDefinition.isRelaxable;
        constraint.constraintOptions = constraintOptions;
        constraint.relaxationValue = 0;
        constraint.enabled = true;
        constraint.columnFormat = constraintDefinition.columnFormat;
        constraint.dataType = constraintDefinition.dataType;
        constraint.positionType = constraintDefinition.uses;
        return constraint;
    }

    private getConstraintOptions$(constraintTag: string, constraintType: string): Observable<ColumnOptionMetaDataInterface[]> {
        return this.columnOptionService
            .fetchColumnOptions$([{colTag: constraintTag, columnOptionType: constraintType, use: 'ALL'}])
            .pipe(map((response: ColumnOptionResponse[]) => !isEmpty(response) ? response[0].options : []));
    }
}
