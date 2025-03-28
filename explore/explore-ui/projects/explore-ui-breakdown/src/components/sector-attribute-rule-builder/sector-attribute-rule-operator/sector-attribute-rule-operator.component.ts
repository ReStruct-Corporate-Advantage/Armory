import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {cloneDeep} from 'lodash';
import {AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ColumnConstants, ColumnDefinition, ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {SectorConstants} from '../../../constants/sector.constants';

/**
 * Component to set comparision type/operator i.e. Equals, Not Equals etc. of Column Sector Rule of Attribute type
 */
@Component({
    selector: 'explore-sector-attribute-rule-operator',
    templateUrl: './sector-attribute-rule-operator.component.html'
})
export class SectorAttributeRuleOperatorComponent implements OnChanges {

    // Binding to check if the rule is look through
    @Input()
    isLookThroughRule: boolean;

    // Binding for selected column
    @Input()
    columnSelected: ColumnDefinition;

    // Set selected operator value. Used while editing existing column sector rule
    @Input()
    selectedOperator: string;

    // Notify operator change
    @Output()
    operatorChanged = new EventEmitter<{operator: string, isDefault?: boolean}>();

    customRuleBuildOperators: any;

    defaultRuleBuildOperators: ExploreSelectOption[];

    operators: ExploreSelectOptionGroup[];

    operatorSelection: ExploreSelectOption;

    /**
     * Method to return the validity of operator for column types.
     */
    static isValidOperatorForColumn(operator: ExploreSelectOption, column: ColumnDefinition): boolean {
        switch (operator.value) {
            case '=':
            case '!=':
                return true;
            case '>':
            case '<':
            case '>=':
            case '<=': {
                const dt = column.dataType;
                return dt === ColumnConstants.COLUMN_DATA_TYPE.DOUBLE || dt === ColumnConstants.COLUMN_DATA_TYPE.INT || dt === ColumnConstants.COLUMN_DATA_TYPE.DATE || dt === ColumnConstants.COLUMN_DATA_TYPE.RATING || dt === ColumnConstants.COLUMN_DATA_TYPE.TIME_SPAN;
            }
            case '^':
            case '~':
            case '!~': {
                const dt = column.dataType;
                return (dt === ColumnConstants.COLUMN_DATA_TYPE.STRING && !column.isStaticColumn);
            }
            default:
                return true;
        }
    }

    constructor() {
        this.initializeOperatorsSelections();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.isLookThroughRule) {
            this.setDefaultOperators();
        }
        if (changes.selectedOperator) {
            this.setOperatorSelected(this.selectedOperator);
        }
        if (changes.columnSelected) {
            this.operators = [new ExploreSelectOptionGroup(this.getValidOperatorItems(this.columnSelected))];
            if (!this.columnSelected ||
                !this.operatorSelection ||
                !SectorAttributeRuleOperatorComponent.isValidOperatorForColumn(this.operatorSelection, this.columnSelected)) {
                if (changes.columnSelected.firstChange === false) {
                    this.setOperatorSelected(this.customRuleBuildOperators.EQUALS);
                }
            }
        }
    }

    /**
     * Method to initialize list of operators/comparision type
     */
    initializeOperatorsSelections(): void {
        this.customRuleBuildOperators = cloneDeep(SectorConstants.CUSTOM_RULE_BUILDER_OPERATORS);
        this.setDefaultOperators();
    }

    /**
     * Method to set default operators/comparision type depending on whether the rule is look through or not
     */
    setDefaultOperators() {
        if (this.isLookThroughRule) {
            this.defaultRuleBuildOperators = [
                this.customRuleBuildOperators.EQUALS,
                this.customRuleBuildOperators.NOT_EQUAL,
                this.customRuleBuildOperators.STARTS_WITH,
                this.customRuleBuildOperators.CONTAINS,
                this.customRuleBuildOperators.DOES_NOT_CONTAIN
            ];
        } else {
            this.defaultRuleBuildOperators = [
                this.customRuleBuildOperators.EQUALS,
                this.customRuleBuildOperators.NOT_EQUAL,
                this.customRuleBuildOperators.GREATER_THAN,
                this.customRuleBuildOperators.LESS_THAN,
                this.customRuleBuildOperators.GREATER_THAN_OR_EQUAL,
                this.customRuleBuildOperators.LESS_THAN_OR_EQUAL,
                this.customRuleBuildOperators.STARTS_WITH,
                this.customRuleBuildOperators.CONTAINS,
                this.customRuleBuildOperators.DOES_NOT_CONTAIN
            ];
        }
        this.operators = [new ExploreSelectOptionGroup(this.defaultRuleBuildOperators)];
    }

    /**
     * Function to intercept change in column and show the valid operators for rule.
     */
    private getValidOperatorItems(column: ColumnDefinition): ExploreSelectOption[] {
        if (!column) {
            return this.defaultRuleBuildOperators;
        }
        const validOperators = [];
        this.defaultRuleBuildOperators.forEach(operator => {
            if (SectorAttributeRuleOperatorComponent.isValidOperatorForColumn(operator, column)) {
                validOperators.push(operator);
            }
        });
        return validOperators;
    }

    /**
     * Method to set Rule Operator i.e. Comparision Type
     */
    setOperatorSelected(operator: ExploreSelectOption | string) {
        if (this.operatorSelection) {
            this.operatorSelection.isSelected = false;
        }
        if (!operator) {
            this.operatorSelection = null;
            return;
        }
        if (typeof (operator) === 'string') {
            // Get ExploreSelectOption with displayName eg> "Greater Than or Equal To"
            operator = this.defaultRuleBuildOperators.find(selectOption => selectOption.displayValue === operator);
        }
        this.operatorSelection = operator as ExploreSelectOption;
        this.operatorSelection.isSelected = true;
        this.operatorChanged.emit({operator: this.operatorSelection.displayValue, isDefault: true});
    }

    /**
     * Is called when comparision operator is changed
     */
    onOperatorChange(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.operatorSelection = event.detail.value as ExploreSelectOption;
        this.operatorChanged.emit(this.operatorSelection ? {operator: this.operatorSelection.displayValue} : null);
    }

}
