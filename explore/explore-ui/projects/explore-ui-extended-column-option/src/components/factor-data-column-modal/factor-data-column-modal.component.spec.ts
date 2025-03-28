import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FactorDataColumnModalComponent} from './factor-data-column-modal.component';
import {ColumnConfig, ColumnConstants, ColumnType} from '@blk/explore-ui-core';
import {ColumnSet} from '@blk/explore-ui-column-option';

describe('FactorDataModalComponent', () => {
    let component: FactorDataColumnModalComponent;
    let fixture: ComponentFixture<FactorDataColumnModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [FactorDataColumnModalComponent]
        });
        fixture = TestBed.createComponent(FactorDataColumnModalComponent);
        component = fixture.componentInstance;

        component.widgetConfigInput = {
            inputConfigType: 'columns',
            inputName: ColumnType.COLUMNS,
            inputTitle: 'columns',
        };

        component.isOpen = true;
        const columnSet = new ColumnSet();

        const col1 = {
            columnTag: 'factor1',
            columnKey: 'factor1145a',
            title: 'factor 1',
            positionColumnType: ColumnConstants.FACTOR_MODEL,
            optionValues: [],
        };
        columnSet.columns = [ new ColumnConfig(col1) ];

        component.inputs = new Map();
        component.inputs.set(ColumnType.COLUMNS, columnSet);

        component.columnType = ColumnType.COLUMNS;

        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test ngOnInit', () => {
        expect(component.updatedInputs.get(ColumnType.COLUMNS)).not.toBeUndefined();
    });

    it('test onDoneClicked', () => {
        jest.spyOn(component.modalClosed, 'emit');
        (component.updatedInputs.get(ColumnType.COLUMNS) as ColumnSet).columns[0].columnTitle = 'abc';

        component.onDoneClicked();
        expect(component.isOpen).toBeFalsy();
        expect(component.modalClosed.emit).toHaveBeenCalledWith(true);
        (component.inputs.get(ColumnType.COLUMNS) as ColumnSet).columns[0].columnTitle = 'abc';
    });

    it('test closeModal with false', () => {
        jest.spyOn(component.modalClosed, 'emit');
        (component.updatedInputs.get(ColumnType.COLUMNS) as ColumnSet).columns[0].columnTitle = 'abc';

        component.closeModal(false);
        expect(component.isOpen).toBeFalsy();
        expect(component.modalClosed.emit).toHaveBeenCalledWith(false);
        (component.inputs.get(ColumnType.COLUMNS) as ColumnSet).columns[0].columnTitle = 'factor 1';
    });
});
