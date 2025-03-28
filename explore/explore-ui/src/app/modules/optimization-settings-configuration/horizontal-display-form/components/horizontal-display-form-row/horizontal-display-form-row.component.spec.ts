import {ComponentFixture, TestBed} from '@angular/core/testing';
import {HorizontalDisplayFormRowComponent} from './horizontal-display-form-row.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {AuxGridColumnType} from '@blk/aladdin-angular-components';

describe('HorizontalDisplayFormRowComponent', () => {
    let component: HorizontalDisplayFormRowComponent;
    let fixture: ComponentFixture<HorizontalDisplayFormRowComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [HorizontalDisplayFormRowComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(HorizontalDisplayFormRowComponent);
        component = fixture.componentInstance;
        component.row = {
            enabled: true
        };
        component.cols = [];
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should update values on changes', () => {
        component.cols = [{
            field: 'col1',
            type: AuxGridColumnType.AUX_CHECKBOX_COLUMN,
            headerName: 'title1'
        }, {
            field: 'col2',
            headerName: 'title2',
            dependsOn: 'dependency1'
        }, {
            field: 'col3',
            type: AuxGridColumnType.AUX_NUMBER_COLUMN,
            headerName: 'title3',
            dependsOn: 'dependency2'
        }];
        component.row = {
            col1: 'val1',
            col2: 'val2',
            col3: 'val3',
            dependency1: true,
            dependency2: false
        };
        component.ngOnChanges({});
        expect(component.values).toEqual([{
            value: 'val1',
            type: AuxGridColumnType.AUX_CHECKBOX_COLUMN,
            disabled: false,
            field: 'col1'
        }, {
            value: 'val2',
            type: undefined,
            disabled: false,
            field: 'col2'
        }, {
            value: 'val3',
            type: AuxGridColumnType.AUX_NUMBER_COLUMN,
            disabled: true,
            field: 'col3'
        }]);
    });

    it('should emit on enabled', () => {
        const emitSpy = jest.spyOn(component.enabled, 'emit');
        component.onEnabled({
            detail: {
                value: {
                    checked: true
                }
            }
        } as any);
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith(true);
    });

    it('should emit on updated', () => {
        const emitSpy = jest.spyOn(component.updated, 'emit');
        component.onUpdated({
            detail: {
                value: {
                    checked: true
                }
            }
        } as any, 'test');
        expect(emitSpy).toHaveBeenCalledTimes(1);
        expect(emitSpy).toHaveBeenCalledWith({
            name: 'test',
            value: true
        });
    });

    it('should emit on deleted', () => {
        const emitSpy = jest.spyOn(component.deleted, 'emit');
        component.onDeleted();
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit on selected', () => {
        const emitSpy = jest.spyOn(component.selected, 'emit');
        component.onSelected();
        expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should get value id', () => {
        expect(component.getValueId(1, {field: 'name'} as any)).toEqual('name');
    });
});
