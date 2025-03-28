import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {CoreDefinitionStore, ErrorTypeConstants, UIErrorParameters} from '@blk/explore-ui-core';
import {of, throwError} from 'rxjs';

import * as mandateTypeFavoritesMock from '../../../../mocks/mandateTypeFavoritesMock.json';
import * as praadaCannedAttributionMethodsMock from '../../../../mocks/praadaCannedAttributionMethodsMock.json';
import {MandateSettingsCellItem, MandateSettingsModalComponent} from './mandate-settings-modal.component';
import {MandateMappingService, NotificationService} from '../../shared/services';
import {MandateStore} from '../../stores';
import {MandateSettings} from '@models/mandate/mandate-settings.model';
import {CloneDeepPipe} from '../../shared/pipes/clone-deep.pipe';

describe('MandateSettingsModalComponent', () => {
    let component: MandateSettingsModalComponent;
    let fixture: ComponentFixture<MandateSettingsModalComponent>;

    const mandateMappingServiceStub = {
        saveMandateSettings$: jest.fn()
    };
    const notificationServiceStub = {
        success: jest.fn(),
        error: jest.fn()
    };

    let mandateSettingsUIMatrixMock;
    let attributionOptionsMock;
    let breakdownOptionsMock;
    let performanceBreakdownOptionsMock;
    let factorBreakdownOptionsMock;
    let curatedReportOptionsMock;
    let columnSetOptionsMock;
    let originalMandateSettingsList;

    beforeAll(() => {
        const mandateSettings1 = new MandateSettings();
        mandateSettings1.mandate = 'FI_MANDATE';
        mandateSettings1.settings = new Map();
        mandateSettings1.settings.set('ATTRIBUTION_TYPE', 'FIXED_INCOME_DXS');
        mandateSettings1.settings.set('BREAKDOWN', 'false;1210587');
        mandateSettings1.settings.set('PERF_BKD', 'false;1210587');
        mandateSettings1.settings.set('FAC_BKD', null);
        mandateSettings1.settings.set('SINGLE_REPORT', null);
        mandateSettings1.settings.set('CURATED_REPORTS', ['false;1325071', 'false;1325073', 'false;1325075-123456']);

        const mandateSettings2 = new MandateSettings();
        mandateSettings2.mandate = 'EQ_MANDATE';
        mandateSettings2.settings = new Map();
        mandateSettings2.settings.set('ATTRIBUTION_TYPE', 'EQUITY');
        mandateSettings2.settings.set('BREAKDOWN', 'false;1275180');
        mandateSettings2.settings.set('PERF_BKD', null);
        mandateSettings2.settings.set('FAC_BKD', 'false;1435981');
        mandateSettings2.settings.set('SINGLE_REPORT', null);
        mandateSettings2.settings.set('CURATED_REPORTS', ['false;1325090', 'false;1325091', 'false;undefined' , 'false132590']);

        CoreDefinitionStore.praadaCannedAttributionMethods = praadaCannedAttributionMethodsMock.options as any;
        originalMandateSettingsList = [mandateSettings1, mandateSettings2];
        MandateStore.mandateSettingsList = originalMandateSettingsList;

        mandateSettingsUIMatrixMock = [
            [
                new MandateSettingsCellItem('MANDATE', 'FI_MANDATE'),
                new MandateSettingsCellItem('ATTRIBUTION_TYPE', 'FIXED_INCOME_DXS'),
                new MandateSettingsCellItem('BREAKDOWN', 'false;1210587'),
                new MandateSettingsCellItem('PERF_BKD', 'false;1210587'),
                new MandateSettingsCellItem('FAC_BKD', null),
                new MandateSettingsCellItem('CURATED_REPORTS', [
                    {'displayValue': 'Fixed Income Portfolio Summary', 'eventData': 'false;1325071'},
                    {'displayValue': 'Fixed Income Risk Summary', 'eventData': 'false;1325073'},
                    {'displayValue': 'P&L', 'eventData': 'false;1325075-123456'}
                ]),
                new MandateSettingsCellItem('SINGLE_REPORT', null),
            ], [
                new MandateSettingsCellItem('MANDATE', 'EQ_MANDATE'),
                new MandateSettingsCellItem('ATTRIBUTION_TYPE', 'EQUITY'),
                new MandateSettingsCellItem('BREAKDOWN', 'false;1275180'),
                new MandateSettingsCellItem('PERF_BKD', null),
                new MandateSettingsCellItem('FAC_BKD', 'false;1435981'),
                new MandateSettingsCellItem('CURATED_REPORTS', [
                    {'displayValue': 'Equity Portfolio Summary', 'eventData': 'false;1325090'},
                    {'displayValue': 'Equity Risk Summary', 'eventData': 'false;1325091'}
                ]),
                new MandateSettingsCellItem('SINGLE_REPORT', null),
            ]
        ];

        MandateStore.auxMandateOptions = [
            {label: 'Model Portfolio Solutions', values: [
                    {displayValue: 'Model Portfolio Solutions', value: 'MPS_MANDATE'},
                    {displayValue: 'Model - Research', value: 'Model-RESEARCH'}
                ]},
            {label: 'Fixed Income', values: [
                    {displayValue: 'Fixed Income', value: 'FI_MANDATE'},
                    {displayValue: 'FI-Japan Government', value: 'FI-JAP-GOV'}
                ]}
        ];

        attributionOptionsMock = [{
            values: [
                {displayValue: 'Active Equity Attribution', value: 'EQUITY'},
                {displayValue: 'Global Equity Attribution', value: 'EQUITY_xFX'},
                {displayValue: 'Core Fixed Income Attribution', value: 'FIXED_INCOME'},
                {displayValue: 'Hybrid Credit Attribution', value: 'FIXED_INCOME_DXS'}
            ]
        }];

        breakdownOptionsMock = [{
            values: [
                {displayValue: 'MSCI ESG Rating Breakdown', value: 'false;1521634'},
                {displayValue: 'GICS Industry', value: 'false;1275180'}
            ]
        }];

        performanceBreakdownOptionsMock = [{
            values: [
                {displayValue: 'MSCI ESG Rating Breakdown', value: 'false;1521634'},
                {displayValue: 'GICS Industry', value: 'false;1275180'}
            ]
        }];

        factorBreakdownOptionsMock = [{
            values: [
                {displayValue: 'PRA - Global - Factor Breakdow', value: 'false;1306434'},
                {displayValue: 'BY_MODELS', value: 'false;1303592'}
            ]
        }];

        curatedReportOptionsMock = [{
            values: [
                {displayValue: 'Fixed Income Portfolio Summary', value: 'false;1325071'},
                {displayValue: 'Fixed Income Risk Summary', value: 'false;1325073'},
                {displayValue: 'P&L', value: 'false;1325075-123456'},
                {displayValue: 'MA Risk Summary', value: 'false;882944'},
                {displayValue: 'Equity Portfolio Summary', value: 'false;1325090'},
                {displayValue: 'Equity Risk Summary', value: 'false;1325091'},
            ]
        }];

        columnSetOptionsMock = [{
            values: [
                {displayValue: 'TC-ColumnSet-Admin', value: 'false;1458422'},
                {displayValue: 'Column Set 1 admin', value: 'false;1459540'}
            ]
        }];

    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MandateSettingsModalComponent, CloneDeepPipe],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: MandateMappingService, useValue: mandateMappingServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub},
            ]
        });

        fixture = TestBed.createComponent(MandateSettingsModalComponent);
        component = fixture.componentInstance;

        jest.spyOn(MandateStore.mandateTypeFavorites, 'get').mockImplementation((favType: string) => {
            for (const key in mandateTypeFavoritesMock) {
                if (key === favType) {
                    return mandateTypeFavoritesMock[key];
                }
            }
            return null;
        });
        component.ngOnInit();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(fixture.debugElement.nativeElement.querySelector('aux-modal')).toMatchSnapshot();
        expect(fixture.debugElement.nativeElement.querySelector('.mandate-settings-body')).toMatchSnapshot();
    });

    describe('ngOnInit Test', () => {
        it('should update the table with mandateSettingsUIMatrix', () => {
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement.querySelector('.mandate-settings-body')).toMatchSnapshot();
        });

        describe('generateMandateSettingsUIMatrixFromStore Test', () => {
            it('should generate mandateSettingsUIMatrix and the copy originalMandateSettingsUIMatrix', () => {
                expect(component.mandateSettingsUIMatrix).toEqual(mandateSettingsUIMatrixMock);
            });
        });

        describe('generateAllMandateSettingsSelectOptions Test', () => {
            it('should generate table headers', () => {
                expect(component.tableHeaders).toEqual([
                    'Mandate', 'Attribution Setting', 'Sector Breakdown', 'Performance Breakdown', 'Factor Breakdown', 'Curated Report', 'Risk Exposure Column Set', null
                ]);
            });

            it('should set mandateSettingsSelectOptionsList', () => {
                expect(component.mandateSettingsSelectOptionsList).toEqual([
                    MandateStore.auxMandateOptions,
                    attributionOptionsMock,
                    breakdownOptionsMock,
                    performanceBreakdownOptionsMock,
                    factorBreakdownOptionsMock,
                    curatedReportOptionsMock,
                    columnSetOptionsMock
                ]);
            });

            describe('createAuxAttributionOptions Test', () => {
                it('should generate attributionOptions from CoreDefinitionStore.praadaCannedAttributionMethods', () => {
                    expect(component['createAuxAttributionOptions']()).toEqual(attributionOptionsMock);
                });
            });

            describe('createAuxFavoriteOptions Test', () => {
                it('should generate options for BREAKDOWN from MandateStore.mandateTypeFavorites', () => {
                    expect(component['createAuxFavoriteOptions']('BREAKDOWN')).toEqual(breakdownOptionsMock);
                });

                it('should generate options for PERF_BKD from MandateStore.mandateTypeFavorites', () => {
                    expect(component['createAuxFavoriteOptions']('PERF_BKD')).toEqual(performanceBreakdownOptionsMock);
                });

                it('should generate options for FAC_BKD from MandateStore.mandateTypeFavorites', () => {
                    expect(component['createAuxFavoriteOptions']('FAC_BKD')).toEqual(factorBreakdownOptionsMock);
                });

                it('should generate options for WIDGETS_REPORT from MandateStore.mandateTypeFavorites', () => {
                    expect(component['createAuxFavoriteOptions']('WIDGETS_REPORT')).toEqual(curatedReportOptionsMock);
                });

                it('should generate options for COLUMN_SET from MandateStore.mandateTypeFavorites', () => {
                    expect(component['createAuxFavoriteOptions']('COLUMN_SET')).toEqual(columnSetOptionsMock);
                });
            });
        });
    });

    describe('addMandateSettingsItemsRow/closeModal Test', () => {
        it('should add mandateSettingsItemsRow and reset mandateSettingsUIMatrix back to original on modal closed', () => {
            expect(component.mandateSettingsUIMatrix.length).toBe(2);
            component.addMandateSettingsItemsRow();

            expect(component.mandateSettingsUIMatrix.length).toBe(3);
            jest.spyOn(component.modalClosed, 'emit');
            component.closeModal();

            expect(component.isOpen).toBeFalsy();
            expect(component.modalClosed.emit).toHaveBeenCalled();
        });
    });

    describe('removeMandateSettingsItemsRow/closeModal Test', () => {
        it('should remove mandateSettingsItemsRow and reset mandateSettingsUIMatrix back to original on modal closed', () => {
            expect(component.mandateSettingsUIMatrix.length).toBe(2);
            component.removeMandateSettingsItemsRow(1);

            expect(component.mandateSettingsUIMatrix.length).toBe(1);
            jest.spyOn(component.modalClosed, 'emit');
            component.closeModal();

            expect(component.isOpen).toBeFalsy();
            expect(component.modalClosed.emit).toHaveBeenCalled();
        });
    });

    describe('saveMandateSettingsList Test', () => {
        it('should save mandateSettingsList', () => {
            jest.spyOn(component['mandateMappingService'], 'saveMandateSettings$').mockReturnValue(of('success'));
            jest.spyOn(component['notificationService'], 'success');

            component.saveMandateSettingsList();
            expect(component['notificationService'].success).toHaveBeenCalledWith('Mandate Mapping Saved');
        });

        it('should handle error', () => {
            jest.spyOn(component['mandateMappingService'], 'saveMandateSettings$').mockReturnValue(throwError('ERROR'));
            jest.spyOn(component['notificationService'], 'error');

            component.saveMandateSettingsList();
            expect(component['notificationService'].error).toHaveBeenCalledWith('Failed to save Mandate Mapping ERROR', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SAVE_MANDATE_SETTINGS_ERROR);
        });

        describe('createMandateSettingsListToSave Test', () => {
            it('should create mandateSettingsList to save', () => {
                component.removeMandateSettingsItemsRow(1);
                expect(component['createMandateSettingsListToSave']()).toEqual([originalMandateSettingsList[0]]);
            });
        });
    });

    describe('onTypeaheadPillboxChanged Test', () => {
        it('should add pillbox to event.target.pillbox and also to mandateSettingsUIMatrix', () => {
            expect(component.mandateSettingsUIMatrix[0][5]).toEqual({
                key: 'CURATED_REPORTS',
                value: [
                {displayValue: 'Fixed Income Portfolio Summary', eventData: 'false;1325071'},
                {displayValue: 'Fixed Income Risk Summary', eventData: 'false;1325073'},
                {displayValue: 'P&L', eventData: 'false;1325075-123456'},
            ]});

            const addEvent = {
                target: {
                    pillbox: [
                        {displayValue: 'Fixed Income Portfolio Summary', eventData: 'false;1325071'},
                        {displayValue: 'Fixed Income Risk Summary', eventData: 'false;1325073'},
                        {displayValue: 'P&L', eventData: 'false;1325075-123456'}
                    ]
                },
                detail: {
                    type: 'add',
                    pill: {displayValue: 'Canada Risk & Exposure', eventData: 'false;1711101'}
                },
                preventDefault: jest.fn()
            };
            // @ts-ignore - to mock event since detail in CustomEvent is read-only property
            component.onTypeaheadPillboxChanged(addEvent, 0);

            expect(component.mandateSettingsUIMatrix[0][5]).toEqual({
                key: 'CURATED_REPORTS',
                value: [
                    {displayValue: 'Fixed Income Portfolio Summary', eventData: 'false;1325071'},
                    {displayValue: 'Fixed Income Risk Summary', eventData: 'false;1325073'},
                    {displayValue: 'P&L', eventData: 'false;1325075-123456'},
                    {displayValue: 'Canada Risk & Exposure', eventData: 'false;1711101'},
                ]
            });

            expect(addEvent.target.pillbox).toEqual([
                {displayValue: 'Fixed Income Portfolio Summary', eventData: 'false;1325071'},
                {displayValue: 'Fixed Income Risk Summary', eventData: 'false;1325073'},
                {displayValue: 'P&L', eventData: 'false;1325075-123456'},
                {displayValue: 'Canada Risk & Exposure', eventData: 'false;1711101'},
            ]);
        });

        it('should remove pillbox from event.target.pillbox and also from mandateSettingsUIMatrix', () => {
            expect(component.mandateSettingsUIMatrix[0][5]).toEqual({
                key: 'CURATED_REPORTS',
                value: [
                    {displayValue: 'Fixed Income Portfolio Summary', eventData: 'false;1325071'},
                    {displayValue: 'Fixed Income Risk Summary', eventData: 'false;1325073'},
                    {displayValue: 'P&L', eventData: 'false;1325075-123456'},
                ]});

            const removeEvent = {
                target: {
                    pillbox: [
                        {displayValue: 'Fixed Income Portfolio Summary', eventData: 'false;1325071'},
                        {displayValue: 'Fixed Income Risk Summary', eventData: 'false;1325073'},
                        {displayValue: 'P&L', eventData: 'false;1325075-123456'}
                    ]
                },
                detail: {
                    type: 'remove',
                    pill: {displayValue: 'P&L', eventData: 'false;1325075-123456'}
                },
            };
            // @ts-ignore - to mock event since detail in CustomEvent is read-only property
            component.onTypeaheadPillboxChanged(removeEvent, 0);

            expect(component.mandateSettingsUIMatrix[0][5]).toEqual({
                key: 'CURATED_REPORTS',
                value: [
                    {displayValue: 'Fixed Income Portfolio Summary', eventData: 'false;1325071'},
                    {displayValue: 'Fixed Income Risk Summary', eventData: 'false;1325073'}
                ]
            });
        });
    });

    describe('onSelectOptionChanged Test', () => {
        it('should update/remove mandateSettingsUIMatrix with selected option', () => {
            expect(component.mandateSettingsUIMatrix[0][6]).toEqual({key: 'SINGLE_REPORT', value: null});
            const addEvent = {detail: {value:{displayValue: 'TC-ColumnSet-Admin', value: 'false;1458422'}}};
            component.onSelectOptionChanged(addEvent, -1, -1);
            expect(component.mandateSettingsUIMatrix[0][6]).toEqual({key: 'SINGLE_REPORT', value: null});

            const addEvent1 = {detail: {value:undefined}};
            component.onSelectOptionChanged(addEvent1, 0, 6);
            expect(component.mandateSettingsUIMatrix[0][6]).toEqual({key: 'SINGLE_REPORT', value: undefined});

            const addEvent2 = {detail: {value:{displayValue: 'TC-ColumnSet-Admin', value: 'false;1458422'}}};
            // @ts-ignore - to mock event since detail in CustomEvent is read-only property
            component.onSelectOptionChanged(addEvent2, 0, 6);

            expect(component.mandateSettingsUIMatrix[0][6]).toEqual({key: 'SINGLE_REPORT', value: 'false;1458422'});
        });
    });

    describe('MandateSettingsCellItem', () => {
        it('should create an instance with default values', () => {
          const item = new MandateSettingsCellItem();

          expect(item).toBeInstanceOf(MandateSettingsCellItem);
          expect(item.key).toBe(null);
          expect(item.value).toBe(null);
        });

        it('should create an instance with provided values', () => {
          const key = 'someKey';
          const value = 'someValue';

          const item = new MandateSettingsCellItem(key, value);

          expect(item).toBeInstanceOf(MandateSettingsCellItem);
          expect(item.key).toBe(key);
          expect(item.value).toBe(value);
        });

        it('should handle an array value with objects', () => {
          const key = 'someKey';
          const value = [
            { displayValue: 'Value1', eventData: 'Event1' },
            { displayValue: 'Value2', eventData: 'Event2', awId: 'ID2' },
          ];

          const item = new MandateSettingsCellItem(key, value);

          expect(item).toBeInstanceOf(MandateSettingsCellItem);
          expect(item.key).toBe(key);
          expect(item.value).toEqual(value);
        });
      });
});
