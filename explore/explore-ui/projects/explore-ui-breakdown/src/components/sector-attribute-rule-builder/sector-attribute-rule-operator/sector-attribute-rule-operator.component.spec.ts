import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SectorAttributeRuleOperatorComponent} from './sector-attribute-rule-operator.component';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {ColumnConstants, ColumnDefinition, ExploreSelectOption} from '@blk/explore-ui-core';

describe('SectorAttributeRuleOperatorComponent', () => {
    let component: SectorAttributeRuleOperatorComponent;
    let fixture: ComponentFixture<SectorAttributeRuleOperatorComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SectorAttributeRuleOperatorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(SectorAttributeRuleOperatorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('set operator selected', () => {
        component.setOperatorSelected('Equals');
        expect(component.operatorSelection).toEqual(component.customRuleBuildOperators.EQUALS);
        expect(component.operatorSelection.isSelected).toBeTruthy();
        component.setOperatorSelected(component.customRuleBuildOperators.CONTAINS);
        expect(component.operatorSelection).toEqual(component.customRuleBuildOperators.CONTAINS);
        expect(component.customRuleBuildOperators.EQUALS.isSelected).toBeFalsy();
        component.setOperatorSelected(null);
        expect(component.operatorSelection).toBeNull();
        expect(component.customRuleBuildOperators.CONTAINS.isSelected).toBeFalsy();
    });

    it('Test ngOnChanges', () => {
        jest.spyOn(component, 'setDefaultOperators');
        jest.spyOn(component, 'setOperatorSelected');
        component.ngOnChanges(
            {}
        );
        expect(component.setDefaultOperators).toHaveBeenCalledTimes(0);
        expect(component.setOperatorSelected).toHaveBeenCalledTimes(0);
        component.ngOnChanges(
            {
                isLookThroughRule: new SimpleChange(null, true, false)
            }
        );
        expect(component.setDefaultOperators).toHaveBeenCalled();
        component.ngOnChanges(
            {
                selectedOperator: new SimpleChange(null, 'Contains', true)
            }
        );
        expect(component.setOperatorSelected).toHaveBeenCalled();
        const columnDefinition = new ColumnDefinition();
        columnDefinition.columnTag = 'cur';
        columnDefinition.dataType = ColumnConstants.COLUMN_DATA_TYPE.DATE;
        component.ngOnChanges(
            {
                columnSelected: new SimpleChange(null, null, false)
            }
        );
        expect(component.setOperatorSelected).toHaveBeenCalledTimes(2);
        component.columnSelected = columnDefinition;
        component.operatorSelection = null;
        component.ngOnChanges(
            {
                columnSelected: new SimpleChange(null, columnDefinition, false)
            }
        );
        expect(component.setOperatorSelected).toHaveBeenCalledTimes(3);
        component.operatorSelection = component.customRuleBuildOperators.CONTAINS;
        component.ngOnChanges(
            {
                columnSelected: new SimpleChange(null, columnDefinition, false)
            }
        );
        expect(component.setOperatorSelected).toHaveBeenCalledTimes(4);
    });

    it('Test columnSelected firstChange', () => {
        jest.spyOn(component, 'setOperatorSelected');
        component.ngOnChanges({
            columnSelected: new SimpleChange(null, null, false)
        });
        expect(component.setOperatorSelected).toHaveBeenCalledTimes(1);
        component.ngOnChanges({
            columnSelected: new SimpleChange(null, null, true)
        });
        expect(component.setOperatorSelected).toHaveBeenCalledTimes(1);
    });

    it('On Operator Change', () => {
        jest.spyOn(component.operatorChanged, 'emit');
        expect(component.onOperatorChange({detail: {value: new ExploreSelectOption('Equals', '==')}} as CustomEvent));
        expect(component.operatorChanged.emit).toHaveBeenCalledWith({operator: 'Equals'});
    });

    it('Test get valid operators', () => {
        expect(component['getValidOperatorItems'](undefined)).toEqual(component.defaultRuleBuildOperators);
        component.columnSelected = new ColumnDefinition();
        component.columnSelected.dataType = ColumnConstants.COLUMN_DATA_TYPE.STRING;
        let operators = component['getValidOperatorItems'](component.columnSelected);
        expect(operators.includes(component.customRuleBuildOperators.EQUALS)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.NOT_EQUAL)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.STARTS_WITH)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.CONTAINS)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.DOES_NOT_CONTAIN)).toBeTruthy();
        component.columnSelected.dataType = ColumnConstants.COLUMN_DATA_TYPE.DOUBLE;
        operators = component['getValidOperatorItems'](component.columnSelected);
        expect(operators.includes(component.customRuleBuildOperators.EQUALS)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.NOT_EQUAL)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.LESS_THAN)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.LESS_THAN_OR_EQUAL)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.GREATER_THAN)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.GREATER_THAN_OR_EQUAL)).toBeTruthy();
        component.columnSelected.dataType = ColumnConstants.COLUMN_DATA_TYPE.INT;
        operators = component['getValidOperatorItems'](component.columnSelected);
        expect(operators.includes(component.customRuleBuildOperators.EQUALS)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.NOT_EQUAL)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.LESS_THAN)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.LESS_THAN_OR_EQUAL)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.GREATER_THAN)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.GREATER_THAN_OR_EQUAL)).toBeTruthy();
        component.columnSelected.dataType = ColumnConstants.COLUMN_DATA_TYPE.TIME_SPAN;
        operators = component['getValidOperatorItems'](component.columnSelected);
        expect(operators.includes(component.customRuleBuildOperators.EQUALS)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.NOT_EQUAL)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.LESS_THAN)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.LESS_THAN_OR_EQUAL)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.GREATER_THAN)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.GREATER_THAN_OR_EQUAL)).toBeTruthy();
        component.columnSelected.dataType = ColumnConstants.COLUMN_DATA_TYPE.DATE;
        operators = component['getValidOperatorItems'](component.columnSelected);
        expect(operators.includes(component.customRuleBuildOperators.EQUALS)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.NOT_EQUAL)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.LESS_THAN)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.LESS_THAN_OR_EQUAL)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.GREATER_THAN)).toBeTruthy();
        expect(operators.includes(component.customRuleBuildOperators.GREATER_THAN_OR_EQUAL)).toBeTruthy();
    });

    it('Test setDefaultOperators', () => {
            component.isLookThroughRule = true;
            component.setDefaultOperators();
            expect(component.defaultRuleBuildOperators.includes(component.customRuleBuildOperators.LESS_THAN)).toBeFalsy();
            component.isLookThroughRule = false;
            component.setDefaultOperators();
            expect(component.defaultRuleBuildOperators.includes(component.customRuleBuildOperators.LESS_THAN)).toBeTruthy();
        }
    );
});
