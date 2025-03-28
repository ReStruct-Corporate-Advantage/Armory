import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {
    ColumnConfig,
} from '@blk/explore-ui-core';
import {BehaviorSubject, Subject} from 'rxjs';
import {FactorColumnSelectorComponent} from './factor-column-selector.component';
import {
    ColumnSet,
    ColumnOptionUpdate,
    ColumnSelectorOption,
    CustomTitleColumnOption,
    SelectedColumnSelectorOption,
} from '@blk/explore-ui-column-option';

describe('FactorColumnSelectorComponent', () => {
    let component: FactorColumnSelectorComponent;
    let fixture: ComponentFixture<FactorColumnSelectorComponent>;
    let componentEl: HTMLElement;
    let eventMock: any;

    const column1 = ColumnConfig.createColumn('security_description', 'ALL', 'security_description_1', 'Security Description');
    const columnSelectorOption1: any = {
        'label': 'Security Description',
        'uid': '7aca32a0-e09b-4b71-bb1c-f89d937a46f3',
        'eventData': {
            'column': column1,
            'columnOptions': []
        },
        'isSelected': false,
        'nestedLevel': 0,
        'isDeletable': true,
        'key': 0,
        'match': false,
        'isExpanded': false,
        'isHidden': false
    };

    const column2 = ColumnConfig.createColumn('cusip', 'ALL', 'cusip_0', 'CUSIP');
    const columnSelectorOption2: any = {
        'label': 'CUSIP',
        'uid': '2bcf3372-9f53-4191-bc20-d1980bf42999',
        'eventData': {
            'column': column2,
            'columnOptions': []
        },
        'isSelected': false,
        'nestedLevel': 0,
        'isDeletable': true,
        'key': 1,
        'match': false,
        'isExpanded': false,
        'isHidden': false
    };

    let targetAreaColumnsMock: any;

    const columnSelectorMock: any = {
        getSourceRef: () => Promise.resolve({dataMoved: jest.fn()}),
        getTargetRef: () => Promise.resolve({getData: jest.fn(() => targetAreaColumnsMock), dataMoved: jest.fn()}),
        getSourceSelection: () => Promise.resolve([]),
        getTargetSelection: () => Promise.resolve([]),
        changeTargetListItemLabel: () => Promise.resolve([]),
        targetData: []
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FactorColumnSelectorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(FactorColumnSelectorComponent);
        component = fixture.componentInstance;
        component.columnSet = new ColumnSet();
        component.columnSelector = columnSelectorMock;
        component.sourceDataUpdated$ = new Subject();
        component.columnSetUpdated$ = new Subject();
        component.columnOptionCopied$ = new Subject();
        component.columnOptionsFetched$ = new Subject();
        component.columnOptionUpdated$ = new Subject<ColumnOptionUpdate>();
        component.selectedColumnConfig$ = new BehaviorSubject(null);
        component.searchTermSubject$ = new BehaviorSubject(null);
        targetAreaColumnsMock = [
            columnSelectorOption1,
            columnSelectorOption2,
        ];
        componentEl = fixture.nativeElement;

        eventMock = {stopPropagation: () => {}, detail: {}};

        component.ngOnInit();
        component.ngAfterViewInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('test createColumnSelectorOption', () => {
        it('test createColumnSelectorOption for column', () => {
            const expectedColumnSelectorOption = new ColumnSelectorOption(column1.columnTitle);
            expectedColumnSelectorOption.eventData = new SelectedColumnSelectorOption(column1, []);

            const columnSelectorOption = component['createColumnSelectorOption'](column1);

            expect(columnSelectorOption).not.toBeNull();
            expect(columnSelectorOption).toEqual(expectedColumnSelectorOption);
        });

        it('test createColumnSelectorOption for column1', () => {
            column1.optionValues.push(new CustomTitleColumnOption({ customTitle: 'abc'}));

            const expectedColumnSelectorOption = new ColumnSelectorOption('abc');
            expectedColumnSelectorOption.eventData = new SelectedColumnSelectorOption(column1, []);

            const columnSelectorOption = component['createColumnSelectorOption'](column1);

            expect(columnSelectorOption).not.toBeNull();
            expect(columnSelectorOption).toEqual(expectedColumnSelectorOption);
        });
    });

});
