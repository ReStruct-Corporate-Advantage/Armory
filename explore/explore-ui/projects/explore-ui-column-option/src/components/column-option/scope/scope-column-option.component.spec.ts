import {ScopeColumnOptionComponent} from './scope-column-option.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Subject} from 'rxjs';
import {ColumnOptionUpdate} from '../../../interfaces';
import {ColumnConfig, ColumnOptionFactory, CoreTestUtils} from '@blk/explore-ui-core';
import {ScopeColumnOption} from '../../../models/column-option/scope-column-option.model';
import {ColumnOptionService} from '../../../services/column-option.service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('ScopeColumnOptionComponent', () => {
    let component: ScopeColumnOptionComponent;
    let fixture: ComponentFixture<ScopeColumnOptionComponent>;
    const columnOptionsServiceMock = {
        fetchColumnOptions$: jest.fn()
    };

    beforeAll(() => {
        CoreTestUtils.initDefinitions();
        ColumnOptionFactory.registerOptionType(ScopeColumnOption.CONFIG_TYPE, ScopeColumnOption);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ScopeColumnOptionComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: ColumnOptionService, useValue: columnOptionsServiceMock
                }
            ]
        });
        fixture = TestBed.createComponent(ScopeColumnOptionComponent);
        component = fixture.componentInstance;

        const selObject = {
            'columnTag': 'market_val',
            'columnKey': 'market_val_1d9ceec0e39d49f',
            'positionColumnType': 'PORT',
            'optionValues': [{
                isApplyBenchmarkSecuritiesChecked: false,
                configType: 'scopeColumnOptionType'
            }]
        };
        component.columnOptionUpdated$ = new Subject<ColumnOptionUpdate>();
        component.column = new ColumnConfig(selObject);
        // Create the testbed for testing the component.
        const columnOption = new ScopeColumnOption({
            isApplyBenchmarkSecuritiesChecked: false
        });

        component.optionValue = columnOption;
    });

    it('Test component initialises with serialized data', () => {
        expect(component).toBeTruthy();
        expect(component.optionValue.isApplyBenchmarkSecuritiesChecked).toBe(false);
    });

    it('Test toggleApplyBenchmarkSecuritiesChecked() for component', () => {
        const event = {detail: {value: {checked: true}}} as CustomEvent;
        expect(component).toBeTruthy();
        component.toggleApplyBenchmarkSecuritiesChecked(event);
        expect(component.optionValue.isApplyBenchmarkSecuritiesChecked).toBe(true);
    });
});
