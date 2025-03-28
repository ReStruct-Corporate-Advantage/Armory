import {ComponentFixture, TestBed} from '@angular/core/testing';

import {CommitmentRiskExcludedFundsTableComponent} from './commitment-risk-excluded-funds-table.component';
import {RightClickHandlerRegistry} from '../right-click-handler/right-click-handler.registry';
import {WIDGET_RIGHT_CLICK_HANDLER} from '../../../modules/widget/widget.injectable.tokens';
import {BaseRightClickHandler} from '../right-click-handler/base-right-click.handler';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {data1} from '@mocks/test-data/qbstr-test-data';
import {Widget} from '@models/widget/widget.model';
import {WidgetPayload} from '@models/widget/widget-payload.model';
import {TestUtils} from '@utils/test.utils';
import {RequestAdapterConfig} from '@interfaces/request.interface';
import {ICellRendererParams} from 'ag-grid-community';

describe('CommitmentRiskExcludedFundsTableComponent', () => {
    let component: CommitmentRiskExcludedFundsTableComponent;
    let fixture: ComponentFixture<CommitmentRiskExcludedFundsTableComponent>;

    let widgetPayload: WidgetPayload;

    beforeAll((done) => {
        TestUtils.initialize(done);
        const requestConfig = {
            portfolio: 'PEP',
            columns: [
                {
                    columnKey: 'acrm_ex_cusip',
                    columnTitle: 'Cusip',
                    formatter: undefined,
                    dataType: 'STRING',
                    columnTag: 'acrm_ex_cusip',
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'acrm_ex_contributions',
                    columnTitle: 'Contributions',
                    formatter: undefined,
                    dataType: 'DOUBLE',
                    columnTag: 'acrm_ex_contributions',
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'acrm_ex_asset_type',
                    columnTitle: 'APACS Asset Type',
                    formatter: undefined,
                    dataType: 'STRING',
                    columnTag: 'acrm_ex_asset_type',
                    isHidden: false,
                    isSubtotalable: false
                },
                {
                    columnKey: 'acrm_ex_supp_apacs',
                    columnTitle: 'Has Supported APACS Asset Type',
                    formatter: undefined,
                    dataType: 'STRING',
                    columnTag: 'acrm_ex_supp_apacs',
                    isHidden: true,
                    isSubtotalable: false
                },
            ]
        } as RequestAdapterConfig;

        const responseConfig = data1.data as any;
        responseConfig.columns = ['acrm_ex_cusip', 'acrm_ex_contributions', 'acrm_ex_asset_type', 'acrm_ex_supp_apacs'];

        widgetPayload = {
            widgetConfigType: WidgetConfigType.COMMITMENT_RISK_EXCLUDED_FUNDS,
            breakdownLevels: [],
            requestConfig,
            responseConfig
        };
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommitmentRiskExcludedFundsTableComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {
                    provide: WIDGET_RIGHT_CLICK_HANDLER, useValue: BaseRightClickHandler,
                    multi: true
                },
                {
                    provide: RightClickHandlerRegistry, useClass: RightClickHandlerRegistry
                }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(CommitmentRiskExcludedFundsTableComponent);
        component = fixture.componentInstance;
        component.widget = new Widget(WidgetConfigType.COMMITMENT_RISK_EXCLUDED_FUNDS);
        component.widgetPayload = widgetPayload;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should generate table ColDefs', () => {
        const colDefs = component['createTableColDefs'](widgetPayload);
        expect(colDefs.length).toBe(4);
        expect(colDefs[0].cellRenderer).toBeUndefined();
        expect(colDefs[0].filter).toEqual('agTextColumnFilter');
        expect(colDefs[1].cellRenderer).toBeDefined();
        expect(colDefs[1].filter).toEqual('agTextColumnFilter');
        expect(colDefs[2].cellRenderer).toBeDefined();
        expect(colDefs[2].filter).toEqual('agTextColumnFilter');
        expect(colDefs[3].cellRenderer).toBeUndefined();
        expect(colDefs[3].filter).toEqual('agTextColumnFilter');
    });

    it('should add badge to cell when value is "No Data"', () => {
        const params = {
            value: 'No Data',
            formatValue: (value: string) => value
        } as ICellRendererParams<any, any, any>;
        const result = component['noDataCellRenderer'](params);
        expect(result).toContain('aux-badge');
    });

    it('should not add badge to cell when value is not "No Data"', () => {
        const params = {
            value: '2020',
            formatValue: (value: string) => value
        } as ICellRendererParams<any, any, any>;
        const result = component['noDataCellRenderer'](params);
        expect(result).not.toContain('aux-badge');
        expect(result).toEqual('2020');
    });

    it('should add badge to cell when Asset Type is unsupported', () => {
        const params = {
            value: 'Corporation',
            formatValue: (value: string) => value,
            data: {
                acrm_ex_supp_apacs: 'No'
            }
        } as ICellRendererParams<any, any, any>;
        const result = component['assetTypeCellRenderer'](params);
        expect(result).toContain('aux-badge');
    });

    it('should not add badge to cell when Asset Type is supported', () => {
        const params = {
            value: 'Corporation',
            formatValue: (value: string) => value,
            data: {
                acrm_ex_supp_apacs: 'Yes'
            }
        } as ICellRendererParams<any, any, any>;
        const result = component['assetTypeCellRenderer'](params);
        expect(result).not.toContain('aux-badge');
        expect(result).toEqual('Corporation');
    });
});
