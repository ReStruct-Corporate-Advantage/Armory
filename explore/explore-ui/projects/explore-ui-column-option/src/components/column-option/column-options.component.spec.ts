import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ColumnConfig, ColumnOptionFactory} from '@blk/explore-ui-core';
import {of} from 'rxjs';
import {CustomCalculationConstants} from '../../constants/custom-calculation.constants';
import {ActiveCalculationColumnOption} from '../../models/column-option/active-calculation-column-option.model';
import {OverrideDateColumnOption} from '../../models/column-option/override-date-column-option.model';
import {ColumnOptionService} from '../../services/column-option.service';
import {ColumnOptionsComponent} from './column-options.component';
import {ColumnOptionUtils} from '../../utils';
import {By} from '@angular/platform-browser';

describe('ColumnOptionsComponent', () => {
    let component: ColumnOptionsComponent;
    let fixture: ComponentFixture<ColumnOptionsComponent>;

    const activeColumnOption = [{
        columnOptionKey: 'activeCalculationColumnOption',
        columnOptionTitle: 'Active Calculation',
        columnOptionConfigType: 'activeCalculationColumnOption',
        columnOptionAttributes: [{
            title: 'Type',
            key: '',
            dataType: ''
        }]
    }];

    const columnOptionsServiceMock = {
        fetchColumnOptions$: jest.fn(() => of([{colTag: 'pct_mv', use: 'ACTIVE', options: activeColumnOption}])),
        updateColumnOptionBehaviorSubject: jest.fn(() => of([{selectedSectionName: 'Highlight'}])),
        getCopyModalHeader: jest.fn(() => of()),
        copyColumnOptionButtonEmitter: jest.fn(() => of([{event: MouseEvent}])),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ColumnOptionsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: ColumnOptionService, useValue: columnOptionsServiceMock
                }
            ]
        });

        fixture = TestBed.createComponent(ColumnOptionsComponent);
        component = fixture.componentInstance;

        // Set the column.
        const column = new ColumnConfig();
        column.columnTag = 'pct_mv';
        column.positionColumnType = 'ACTIVE';
        column.optionValues.push(new ActiveCalculationColumnOption());
        component.column = column;

        fixture.detectChanges();
        component.ngOnChanges(null);
    });

    it('should receive Active Calculation', () => {
        const sectionOptions = component.sections;
        expect(sectionOptions[0].optionTitle).toBe('Active Calculation');
        expect(sectionOptions.length).toBe(1);
        expect(component.selectedSectionName).toBe('Active Calculation');
        expect(component.selectedSectionIndex).toBe(0);
    });

    it('should receive activeCalculationColumnOption', () => {
        const sectionOptions = component.sectionOptions.get('Active Calculation');
        expect(sectionOptions.length).toBe(1);
        expect(sectionOptions[0].columnOptionConfigType).toBe('activeCalculationColumnOption');
    });

    it('should filter out activeCalculationColumnOption', async () => {
        component.restrictedColumnOptions = {sections: ['activeCalculationColumnOption']};
        // add another column option to prevent null pointer of selectedSectionName
        // once activeCalculationColumnOption is filtered out,
        // selectedSectionName is used to populate copy button label
        component.columnOptionsToAdd = [{
            columnOptionKey: 'highlight',
            columnOptionTitle: 'Highlight',
            columnOptionConfigType: 'highlight',
            columnOptionAttributes: [{
                title: 'Compare Type',
                key: 'compareType',
                dataType: 'S'
            }]
        }];
        let updatedColumnOptions = ColumnOptionFactory.getFilteredColumnOptions(undefined, component.columnOptions, component.restrictedColumnOptions);
        updatedColumnOptions = updatedColumnOptions.concat(component.columnOptionsToAdd);
        jest.spyOn(ColumnOptionUtils, 'updateColumnOptions').mockReturnValueOnce(updatedColumnOptions);
        fixture.detectChanges();
        await component.ngOnChanges(null);
        const sectionOptions = component.sectionOptions.get('Active Calculation');
        expect(sectionOptions).toBeUndefined();
    });

    it('should add column options passed on as input', async () => {
        component.columnOptionsToAdd = [{
            columnOptionKey: 'customCalculationNodeType',
            columnOptionConfigType: 'customCalculationNodeType',
            columnOptionTitle: 'Formula Settings',
            columnOptionAttributes: [{
                title: 'Pick value from:',
                key: 'customCalculationNodeType',
                dataType: 'S'
            }]
        }];
        const updatedColumnOptions = component.columnOptions.concat(component.columnOptionsToAdd);
        jest.spyOn(ColumnOptionUtils, 'updateColumnOptions').mockReturnValueOnce(updatedColumnOptions);
        fixture.detectChanges();
        await component.ngOnChanges(null);
        expect(component.columnOptions.length).toBe(2);
        expect(component.columnOptions[1].columnOptionKey === 'customCalculationNodeType').toBeTruthy();
    });

    it('should modify column options passed on as input', async () => {
        const fnSpy = jest.spyOn(ColumnOptionFactory, 'modifyColumnOptions');
        component.columnOptionsToModify = new Map<string, Function>();
        component.columnOptionsToModify.set(OverrideDateColumnOption.CONFIG_TYPE, jest.fn());
        fixture.detectChanges();
        await component.ngOnChanges(null);
        expect(fnSpy).toHaveBeenCalled();
    });

    it('Test getIsExpanded', () => {
        expect(component.getIsExpanded('Display options')).toBeTruthy();
        expect(component.getIsExpanded('Aggregation')).toBeFalsy();

        // Set the column to be CustomCalc
        component.column.columnTag = CustomCalculationConstants.CUSTOM_CALCULATION;
        expect(component.getIsExpanded('Display options')).toBeFalsy();
        expect(component.getIsExpanded('Calculate expression/script')).toBeTruthy();
    });

    describe('onAccordionChanged Test', () => {
        it('should update the section name and the index', () => {
            const event = new CustomEvent<any>('');
            event.initCustomEvent('', true, true, {header: 'Highlight', tabIndex: 1});
            component.sections = [{
                optionTitle: 'Display',
                isExpanded: false
            },
                {
                    optionTitle: 'Highlight',
                    isExpanded: false
                }];

            component.onAccordionChanged(event);
            expect(component.selectedSectionName).toBe('Highlight');
            expect(component.selectedSectionIndex).toBe(1);
            expect(component.sections[1].isExpanded).toBeTruthy();
        });
        it('Collapse event', () => {
            const event = new CustomEvent<any>('');
            event.initCustomEvent('', true, true, {header: 'Highlight', tabIndex: 1});
            component.sections = [{
                optionTitle: 'Display',
                isExpanded: false
            },
                {
                    optionTitle: 'Highlight',
                    isExpanded: false
                }];
            component.selectedSectionName = 'Highlight';
            component.selectedSectionIndex = 1;
            component.onAccordionChanged(event);
            expect(component.selectedSectionName).toBeUndefined();
            expect(component.selectedSectionIndex).toBe(-1);
            expect(component.sections[1].isExpanded).toBeFalsy();
        });
    });

    describe('onCopyColumnOptionButton Test', () => {
        it('should emit columnOptionMetaData', () => {
            jest.spyOn(component.copyButtonClickEvent, 'emit');
            const columnOptionMetaData = {
                'columnOptionAttributes': [
                    {
                        'title': 'Compare Type',
                        'key': 'compareType',
                        'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                        'dataType': 'S'
                    },
                    {
                        'title': 'Compare Value',
                        'key': 'compareValue',
                        'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                        'dataType': 'S'
                    },
                    {
                        'title': 'Highlight Color',
                        'key': 'highlightColor',
                        'CLASS_TYPE': 'com.bfm.prism.data.column.options.attributes.ColumnOptionAttribute',
                        'dataType': 'S'
                    }
                ],
                'columnOptionConfigType': 'highlight',
                'columnOptionTitle': 'Highlight',
                'CLASS_TYPE': 'com.bfm.prism.data.column.options.general.HighlightColumnOptions',
                'columnOptionKey': 'highlight'
            };
            component.onCopyColumnOptionButton(columnOptionMetaData);
            expect(component.copyButtonClickEvent.emit).toHaveBeenCalledWith(columnOptionMetaData);
        });
    });

    describe('onShouldHideCopyColumnOptionButton Test', () => {
        it('should hide copy button if shouldHideCopyColumnOptionButton is true', () => {
            component.shouldHideCopyColumnOptionButton = true;
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css('.copy-button'))).toBeNull();
        });

        it('should not hide copy button if shouldHideCopyColumnOptionButton is false', () => {
            component.shouldHideCopyColumnOptionButton = false;
            fixture.detectChanges();
            expect(fixture.debugElement.query(By.css('.copy-button'))).not.toBeNull();
        });
    });
});
