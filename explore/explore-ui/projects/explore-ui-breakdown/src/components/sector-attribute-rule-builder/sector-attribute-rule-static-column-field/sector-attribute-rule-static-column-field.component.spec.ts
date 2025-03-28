import {ComponentFixture, TestBed} from '@angular/core/testing';
import {SectorAttributeRuleStaticColumnFieldComponent} from './sector-attribute-rule-static-column-field.component';
import {of, throwError} from 'rxjs';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {ColumnDefinition, ExploreSelectOptionGroup, NOTIFICATION_SERVICE_TOKEN} from '@blk/explore-ui-core';
import {ColumnStaticValuesService} from '@blk/explore-ui-column-option';

describe('SectorAttributeRuleStaticColumnFieldComponent', () => {
    let component: SectorAttributeRuleStaticColumnFieldComponent;
    let fixture: ComponentFixture<SectorAttributeRuleStaticColumnFieldComponent>;
    const getColumnStaticValuesMock$ = jest.fn();
    const notifyErrorFn = jest.fn();

    const columnStaticValuesServiceMock = {
        getColumnStaticValues$: getColumnStaticValuesMock$
    };

    const notificationServiceMock = {
        error: notifyErrorFn
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SectorAttributeRuleStaticColumnFieldComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [{provide: ColumnStaticValuesService, useValue: columnStaticValuesServiceMock}, {provide: NOTIFICATION_SERVICE_TOKEN, useValue: notificationServiceMock}]
        });

        fixture = TestBed.createComponent(SectorAttributeRuleStaticColumnFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Test ngOnChanges', () => {
        jest.spyOn<any, any>(component, 'fetchStaticValues').mockReturnValue(null);
        jest.spyOn<any, any>(component, 'initializeSelectedOptions').mockReturnValue(null);
        component.ngOnChanges(
            {}
        );
        expect(component['fetchStaticValues']).toHaveBeenCalledTimes(0);
        expect(component['initializeSelectedOptions']).toHaveBeenCalledTimes(0);
        component.value = ['INR'];
        jest.spyOn(component.valueChange, 'emit');
        component.ngOnChanges(
            {
                columnSelected: new SimpleChange(null, null, true),
                value: new SimpleChange(null, ['INR'], true)
            }
        );
        expect(component['fetchStaticValues']).toHaveBeenCalledTimes(0);
        expect(component.selections).toEqual([new ExploreSelectOptionGroup([])]);
        expect(component['initializeSelectedOptions']).toHaveBeenCalled();
        expect(component.valueChange.emit).toHaveBeenLastCalledWith(['INR']);
        const previousColumn = new ColumnDefinition();
        previousColumn.isStaticColumn = true;
        const currentColumn = new ColumnDefinition();
        previousColumn.isStaticColumn = true;
        component.columnSelected = currentColumn;
        component.ngOnChanges(
            {
                columnSelected: new SimpleChange(previousColumn, currentColumn, true)
            }
        );
        expect(component.valueChange.emit).toHaveBeenLastCalledWith(null);
    });

    it('Test fetch static values', () => {
        component.columnSelected = new ColumnDefinition();
        component.columnSelected.columnTag = 'cur';
        getColumnStaticValuesMock$.mockReturnValue(
            of([
                {
                    displayName: 'USD',
                    value: 'USD'
                },
                {
                    displayName: 'CAD',
                    value: 'CAD'
                },
                {
                    displayName: 'INR',
                    value: 'INR'
                }
            ])
        );
        component.value = ['INR'];
        component['fetchStaticValues']();
        expect(component.selections[0].values.length === 3).toBeTruthy();
        expect(component.selections[0].values[2].isSelected).toBeTruthy();
        expect(component.selections[0].values[0].isSelected).toBeFalsy();
        expect(component.selections[0].values[1].isSelected).toBeFalsy();

        getColumnStaticValuesMock$.mockReturnValue(
            of([])
        );
        component['fetchStaticValues']();
        expect(component.selections[0].values.length === 0).toBeTruthy();
        getColumnStaticValuesMock$.mockReturnValue(
            throwError('error')
        );
        component.selections = null;
        component['fetchStaticValues']();
        expect(component.selections[0].values.length === 0).toBeTruthy();
        expect(notifyErrorFn).toHaveBeenCalled();
    });

    it('Test selections change', () => {
        let event = {
            detail: {
                value: [
                    {
                        displayValue: 'USD',
                        value: 'USD'
                    },
                    {
                        displayValue: 'CAD',
                        value: 'CAD'
                    },
                    {
                        displayValue: 'INR',
                        value: 'INR'
                    }
                ]
            }
        };
        jest.spyOn(component.valueChange, 'emit');
        component.onSelectionsChange(event as CustomEvent);
        expect(component.valueChange.emit).toHaveBeenLastCalledWith(['USD', 'CAD', 'INR']);
        event = {detail: null};
        component.onSelectionsChange(event as CustomEvent);
        expect(component.valueChange.emit).toHaveBeenLastCalledWith([]);
    });
});
