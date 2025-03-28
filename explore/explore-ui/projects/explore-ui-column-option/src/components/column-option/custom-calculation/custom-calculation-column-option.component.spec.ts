import {ColumnConfig, ColumnOptionFactory, CoreTestUtils, CoreWidgetConfigStore} from '@blk/explore-ui-core';
import {CustomCalculationColumnOption} from '../../../models/column-option/custom-calculation-column-option.model';
import {CustomCalculationMeasureNodeColumnOption} from '../../../models/column-option/custom-calculation-measure-node-column-option.model';
import {ColumnSet} from '../../../models/column-set/column-set.model';
import {CustomCalculationColumnOptionComponent} from './custom-calculation-column-option.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ColumnOptionUpdate} from '../../../interfaces';
import {Subject} from 'rxjs';

describe('CustomCalculationComponent', () => {
    let component: CustomCalculationColumnOptionComponent;
    let fixture: ComponentFixture<CustomCalculationColumnOptionComponent>;
    const colConfig1 = {
        columnTag: 'market_val',
        positionColumnType: 'PORT',
        optionValues: [{
            measureNode: 'firstLevel',
            configType: CustomCalculationMeasureNodeColumnOption.CONFIG_TYPE
        }]
    };

    const colConfig2 = {
        columnTag: 'market_val',
        positionColumnType: 'BENCH',
        optionValues: [{
            measureNode: 'total',
            configType: CustomCalculationMeasureNodeColumnOption.CONFIG_TYPE
        }]
    };

    const mockedOption: any = {
        columnOptionKey: 'customCalculation',
        columnOptionTitle: 'Calculate Expression/Script',
        columnOptionConfigType: 'customCalculation',
        columnOptionAttributes: [{
            title: 'Type'
        }]
    };
    beforeAll(() => {
        CoreTestUtils.initDefinitions();
        ColumnOptionFactory.registerOptionType(CustomCalculationMeasureNodeColumnOption.CONFIG_TYPE, CustomCalculationMeasureNodeColumnOption);
        ColumnOptionFactory.registerOptionType(CustomCalculationColumnOption.CONFIG_TYPE, CustomCalculationColumnOption);
    });

    beforeEach(() => {
        const dummyInputs = {
            'customCalculationColumn': {
                'restrictedColumnOptions': {
                    'sections': [
                        'columnBreakdown',
                        'formatAndScaling',
                        'highlight',
                        'customColumnTitle'
                    ]
                },
                'restrictedOptoColumnOptions': {
                    'sections': [
                        'columnBreakdown',
                        'formatAndScaling',
                        'highlight',
                        'customColumnTitle',
                        'aggregation',
                        'customAggregation'
                    ]
                },
                'measureNodeColumnOption': {
                    'columnOptionConfigType': 'customCalculationNodeType',
                    'columnOptionTitle': 'Formula Settings',
                    'columnOptionAttributes': [
                        {
                            'title': 'Pick value from:',
                            'key': 'customCalculationNodeType',
                            'dataType': 'S'
                        }
                    ]
                }
            }
        };
        jest.spyOn(CoreWidgetConfigStore, 'getChartConfigForType').mockReturnValue(dummyInputs);

        fixture = TestBed.createComponent(CustomCalculationColumnOptionComponent);
        component = fixture.componentInstance;
        component.restrictedColumnOptions = {
            'sections': [
                'columnBreakdown',
                'formatAndScaling',
                'highlight',
                'customColumnTitle'
            ]
        };
        component.option = mockedOption;
       const selObject = {
            'columnTag': 'rfv_contrib_port',
            'columnKey': 'rfv_contrib_port_4',
            'positionColumnType': 'PORT',
            'optionValues': []
        };
        const column = new ColumnConfig(selObject);
        component.column = column;
        component.columnOptionUpdated$ = new Subject<ColumnOptionUpdate>();
    });

    it('Test Control initialises', () => {
        // Create the testbed for testing the component.
      const  columnOption = new CustomCalculationColumnOption({
          expression: 'a-b',
          measures: {
                a: colConfig1,
                b: colConfig2
            }
        });

        component.column.optionValues.push(columnOption);
        component.ngOnInit();
        expect(component).toBeTruthy();
        expect(component.optionValue.expression).toBe('a-b');
        expect(Object.keys(component.optionValue.measureMapping).length).toBe(2);
        expect(component.selectedMeasureSummary.length).toBe(2);
        expect(component.selectedMeasureSummary[0].nodeType).toBe('First Level');
        expect(component.selectedMeasureSummary[0].alias).toBe('a');
        expect(component.selectedMeasureSummary[1].nodeType).toBe('Total');
        expect(component.selectedMeasureSummary[1].alias).toBe('b');
    });

    it('Test Controller initialization with duplicate columns', () => {

        const  columnOption = new CustomCalculationColumnOption({
            expression: 'a-b',
            measures: {
                a: colConfig1,
                b: colConfig1
            }
        });

        component.column.optionValues.push(columnOption);
        component.ngOnInit();

        expect(component).toBeTruthy();
        expect(component.optionValue.expression).toBe('a-b');
        expect(Object.keys(component.optionValue.measureMapping).length).toBe(2);
        expect(component.selectedMeasureSummary.length).toBe(2);
        expect(component.selectedMeasureSummary[0].title).toBe('Market Value');
        expect(component.selectedMeasureSummary[1].title).toBe('Market Value 1');
    });

    /**
     * Upon Clicking shortcuts button, text will be generated which will be feed to textarea
     */
    it('On Clicking button, respective text will be generated', () => {
        const  columnOption = new CustomCalculationColumnOption({
            expression: '',
            measures: {}
        });

        component.column.optionValues.push(columnOption);
        component.ngOnInit();

        component.textAreaComponent = {
            element: {
                nativeElement: {
                    focus: () => {
                    }
                }
            }
        };

        // For + (id=> add), text => +
        const event = {
            target: {label: '+'},
        };
        component.addTextToTextArea(event);
        expect(component.optionValue.expression).toBe('+');

        // For = (id=> equal), text => ===
        event.target.label = 'equals';
        component.addTextToTextArea(event);
        expect(component.optionValue.expression).toBe('+===');

        // For comment (id=> comment), text => //
        event.target.label = 'comment';
        component.addTextToTextArea(event);
        expect(component.optionValue.expression).toBe('+===//');

        // For if/else (id=> if/else)
        event.target.label = 'if/else';
        component.addTextToTextArea(event);
        expect(component.optionValue.expression).toBe('+===//if(var1 === var2) {\n' +
            '  VALUE;\n' +
            '} else {\n' +
            '  VALUE;\n' +
            '}');

        // For max (id=> max), text => Math.max(var1,var2,var3,...,var(n))
        event.target.label = 'max';
        component.addTextToTextArea(event);
        expect(component.optionValue.expression).toBe('+===//if(var1 === var2) {\n' +
            '  VALUE;\n' +
            '} else {\n' +
            '  VALUE;\n' +
            '}Math.max(var1,var2,var3,...,var(n))');
    });

    /**
     * Text will be added where cursor is laying in textarea
     */
    it('TextArea model value test case', () => {
        // Let our text in textarea be => if(var1var2) and after 4th index we want to add ===
        // Our model value would be if(var1var2) and expression would be => ===
        // we'll place our cursor after x, this will make our selection start => 4 selectionEnd => 4

        const  columnOption = new CustomCalculationColumnOption({
            expression: 'if(var1var2)',
            measures: {}
        });

        component.column.optionValues.push(columnOption);
        component.ngOnInit();

        component.textAreaComponent = {
            focus: () => {
            },
            selectionStart: 7,
            selectionEnd: 7
        };

        const element = component.textAreaComponent;
        const event = {
            target: {label: 'equals'},
        };
        component.addTextToTextArea(event);
        expect(element.selectionStart).toBe(component.optionValue.expression.length);
        expect(element.selectionEnd).toBe(component.optionValue.expression.length);
        expect(component.optionValue.expression).toBe('if(var1===var2)');

        // Now If someone wants to replace VALUE in if/else pseudo code with ceiling function
        // So, our model value will be
        // Initial                        Later
        // if(var1 === var2) {                if(var1 === var2) {
        //     VALUE;                       Math.ceil(var1);
        // } else {                     } else {
        //     VALUE;                       VALUE;
        // }                            }

        component.optionValue.expression = 'if(var1 === var2) {\n' +
            '  VALUE;\n' +
            '} else {\n' +
            '  VALUE;\n' +
            '}';

        element.selectionStart = 22;
        element.selectionEnd = 27;
        event.target.label = 'ceiling';
        component.addTextToTextArea(event);
        expect(element.selectionStart).toBe(component.optionValue.expression.length);
        expect(element.selectionEnd).toBe(component.optionValue.expression.length);
        expect(component.optionValue.expression).toBe('if(var1 === var2) {\n' +
            '  Math.ceil(var1);\n' +
            '} else {\n' +
            '  VALUE;\n' +
            '}');
    });

    it('Test alias name more than 26  ', () => {
        const  columnOption = new CustomCalculationColumnOption();
        component.column.optionValues.push(columnOption);
        component.ngOnInit();
        expect(component.getMeasureAlias(0, [])).toBe('a');
        expect(component.getMeasureAlias(26, [])).toBe('aa');
        expect(component.getMeasureAlias(52, [])).toBe('ba');
    });
    it('Test getMeasureAlias for reserved words', () => {
        component.ngOnInit();
        let alias = component.getMeasureAlias(119, ['dn']);
        expect(alias).toBe('dp');
        alias = component.getMeasureAlias(120, ['dn']);
        expect(alias).toBe('dq');
    });
    it('tests onCloseOfColumnMeasuresModal', () => {
        const  columnOption = new CustomCalculationColumnOption();
        component.column.optionValues.push(columnOption);
        component.ngOnInit();

        component.onCloseOfColumnMeasuresModal(null);
        expect(component.showColumnMeasures).toBe(false);

        const columns = [];
        const columnSet = new ColumnSet();
        columnSet.columns = columns;
        component.onCloseOfColumnMeasuresModal(columnSet);
        expect(component.columnMeasures === columns).toBeTruthy();
    });


});
