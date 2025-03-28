import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {BrowserDynamicTestingModule} from '@angular/platform-browser-dynamic/testing';
import {SentenceCasePipe, ColumnConfig} from '@blk/explore-ui-core';
import {ActiveCalculationColumnOption} from '../../models/column-option/active-calculation-column-option.model';
import {ColumnOptionService} from '../../services/column-option.service';
import {columnOptionComponentList} from './column-option-component-list';
import {ColumnOptionComponentFactory} from './column-option-component.factory';
import {ColumnOptionComponent} from './column-option.component';
import {Subject} from 'rxjs';
import {ColumnOptionUpdate} from '../../interfaces';

describe('ColumnOptionComponent', () => {
    let component: ColumnOptionComponent;
    let fixture: ComponentFixture<ColumnOptionComponent>;

    beforeEach(() => {
        const activeColumnOption = [
            {
                columnOptionTitle: 'Active Calculation',
                columnOptionConfigType: 'activeCalculationColumnOption',
                columnOptionAttributes: [{
                    title: 'Type',
                    key: '',
                    dataType: ''
                }]
            }];
        const optionsResponse = [{colTag: 'pct_mv', use: 'ACTIVE', options: activeColumnOption}];
        const columnOptionsServiceMock = new ColumnOptionService(null);
        columnOptionsServiceMock.refreshSelectedColumns = jest.fn();
        jest.spyOn(columnOptionsServiceMock, 'fetchColumnOptions$').mockReturnValue(Promise.resolve(optionsResponse));

        TestBed.configureTestingModule({
            declarations: [
                ColumnOptionComponent,
                ...columnOptionComponentList,
                SentenceCasePipe
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: ColumnOptionService, useValue: columnOptionsServiceMock
                },
                {
                    provide: ColumnOptionComponentFactory,
                    useValue: new ColumnOptionComponentFactory(columnOptionComponentList)
                }
            ]
        }).overrideModule(BrowserDynamicTestingModule, {
            set: {
                entryComponents: [...columnOptionComponentList]
            }
        });

        fixture = TestBed.createComponent(ColumnOptionComponent);
        component = fixture.componentInstance;
        component.optionType = 'activeCalculationColumnOption';
        component.columnOptionUpdated$ = new Subject<ColumnOptionUpdate>();

        // Set the column.
        const column = new ColumnConfig();
        column.optionValues.push(new ActiveCalculationColumnOption());
        component.column = column;

        fixture.detectChanges();
        component.ngAfterViewInit();
    });

    it('The control creates a child correctly', () => {
        expect(component.optionHolder.length).toBe(1);
    });
});
