import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA, Type} from '@angular/core';
import {ExploreUiCoreModule} from '@blk/explore-ui-core';
import {isNil} from 'lodash';
import {Subject} from 'rxjs';
import {AbstractColumnOption} from '@blk/explore-ui-core';
import {ColumnConfig} from '@blk/explore-ui-core';
import {BaseColumnOptionComponent} from '../components/column-option/base-column-option.component';
import {ColumnOptionUpdate} from "../interfaces";

/**
 * Class used to test the column options.  Just reuses the code to setup the control ready to be tested.
 */
export class ColumnOptionTestBed<T extends BaseColumnOptionComponent<any>, S extends AbstractColumnOption> {
    component: T;
    columnOption: S;
    fixture: ComponentFixture<T>;

    constructor(componentType: Type<any>, columnOption: S, mockedOption: any, additionalComponents?: Type<any>[], colTag?: string, positionColumnType?: string, columnConfig?: ColumnConfig, providers?: {provide: any, useValue: any}[]) {
        TestBed.configureTestingModule({
            imports: [ExploreUiCoreModule],
            declarations: [componentType],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers
        });

        const serializedColumn = {
            'columnTag': 'rfv_contrib_port',
            'columnKey': 'rfv_contrib_port_4',
            'positionColumnType': 'PORT',
            'optionValues': [
                {
                    'configType': 'numericColumnFormatColumnOption'
                },
                {
                    'economyRiskSettings': {},
                    'advancedRiskSettings': {},
                    'configType': 'riskSettings'
                },
                {
                    'aggregationType': 0,
                    'configType': 'aggregation'
                }
            ]
        };

        // Create a column with the required option in there.
        const column = isNil(columnConfig) ? new ColumnConfig(serializedColumn) : columnConfig;
        column.optionValues.push(columnOption);
        if (!isNil(colTag)) {
            column.columnTag = colTag;
        }
        if (!isNil(positionColumnType)) {
            column.positionColumnType = positionColumnType;
        }

        // Create the component.
        this.fixture = TestBed.createComponent(componentType);
        this.component = this.fixture.componentInstance;
        this.component.option = mockedOption;
        this.component.column = column;
        this.component.columnOptionUpdated$ = new Subject<ColumnOptionUpdate>();

        this.fixture.detectChanges();
        this.component.ngOnInit();
    }
}
