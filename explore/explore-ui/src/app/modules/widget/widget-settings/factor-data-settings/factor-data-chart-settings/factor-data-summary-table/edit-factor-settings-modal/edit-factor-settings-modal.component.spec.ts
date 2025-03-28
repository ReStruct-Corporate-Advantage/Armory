import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {EditFactorSettingsModalComponent} from './edit-factor-settings-modal.component';
import {CustomTitleColumnOption, FxFactorOptionsColumnOption} from '@blk/explore-ui-column-option';
import {ColumnConfig, ColumnConstants} from '@blk/explore-ui-core';
import {RiskSettings} from '@blk/explore-ui-risk';

describe('EditFactorSettingsModalComponent', () => {
    let component: EditFactorSettingsModalComponent;
    let fixture: ComponentFixture<EditFactorSettingsModalComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [EditFactorSettingsModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        });

        fixture = TestBed.createComponent(EditFactorSettingsModalComponent);
        component = fixture.componentInstance;

        component.column = new ColumnConfig({
            columnTag: 'factor1',
            columnKey: 'factor1145a',
            title: 'factor 1',
            positionColumnType: ColumnConstants.FACTOR_MODEL,
            optionValues: [],
        });

        component.column.optionValues.push(new CustomTitleColumnOption({ customTitle: 'factor'}));
        component.column.optionValues.push(new RiskSettings());
        component.column.optionValues.push(new FxFactorOptionsColumnOption());

        component.options = [ {
            'columnOptionAttributes': [
                {
                    'title': 'Title',
                    'key': 'title',
                    'dataType': 'S'
                }
            ],
            'columnOptionConfigType': 'customColumnTitle',
            'columnOptionTitle': 'Display options',
            'columnOptionKey': 'customColumnTitle'
        },
            {
                'columnOptionAttributes': [
                    {
                        'title': 'Depends on Economy',
                        'key': 'DEPENDS-ON-ECONOMY',
                        'dataType': 'B'
                    },
                    {
                        'title': 'Depends on Exposure',
                        'key': 'DEPENDS-ON-EXPOSURE',
                        'dataType': 'B'
                    }
                ],
                'columnOptionConfigType':   'riskSettings',
                'columnOptionTitle':   'Risk settings ',
                'columnOptionKey':   'riskSettingsColumnSettings'
            },
            {
                'columnOptionAttributes': [
                    {
                        'title':   'FX Currencies',
                        'key':   'fxCurrencies',
                        'dataType':   'S',
                        'values': [
                            {
                                'value':   'USD',
                                'label':   '0'
                            },
                            {
                                'value':   'AUD',
                                'label':   '1'
                            }
                        ]
                    }
                ],
                'columnOptionConfigType':   'fxFactorOptionsColumnOption',
                'columnOptionTitle':   'FX Factor Options',
                'columnOptionKey':   'fxFactorOptionsColumnOption'
            }
        ];

        fixture.detectChanges();
        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('test ngOnInit', () => {
        expect(component.updatedColumn).not.toBeUndefined();
        expect(component.customTitleOption).not.toBeUndefined();
        expect(component.riskSettings).not.toBeUndefined();
        expect(component.fxFactorOption).not.toBeUndefined();
    });

    it('test onDoneClicked', () => {
        component.isOpen = true;

        (component.updatedColumn.optionValues[0] as CustomTitleColumnOption).customTitle = 'updatedFactor';

        jest.spyOn(component.modalClosed, 'emit');
        component.onDoneClicked();

        expect(component.isOpen).not.toBeTruthy();
        expect(component.modalClosed.emit).toHaveBeenCalledWith(true);
        expect(component.column.optionValues).toBe(component.updatedColumn.optionValues);
    });
});
