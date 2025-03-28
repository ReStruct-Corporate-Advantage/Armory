import { TestBed } from '@angular/core/testing';
import { FactorColumnSetSettingsService } from './factor-column-set-settings.service';
import {DataRequestConstants} from '@constants/data-request.constants';
import {ColumnConfig, DateValue} from '@blk/explore-ui-core';
import {WorkspaceStore} from '@stores/workspace.store';
import {TestUtils} from '@utils/test.utils';
import { Portfolio } from '@models/portfolio/portfolio.model';

describe('FactorColumnSetSettingsService', () => {
    let service: FactorColumnSetSettingsService;

    beforeAll((done: any) => {
        WorkspaceStore.init();
        const datePicker = DateValue.newDate('03/15/2021');
        datePicker.calCode = 'ab';
        WorkspaceStore.currentPortfolio$.next(new Portfolio('PEP', datePicker));
        TestUtils.initialize(done);
    });
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FactorColumnSetSettingsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have getWidgetConfigInputForBreakdown method', () => {
        expect(service.getWidgetConfigInputForBreakdown).toBeDefined();
        const breakdown = service.getWidgetConfigInputForBreakdown();
        expect(breakdown).toBeDefined();
    });

    it('should have updateColumnWithDerivedSettings method', () => {
        expect(service.updateColumnWithDerivedSettings).toBeDefined();
    });

    it('should have createSpecifiedShocksRequest method', () => {
        expect(service.createSpecifiedShocksRequest).toBeDefined();
        let requestParams = service.createSpecifiedShocksRequest(true);
        let expectedRequestParams: any = {
            'riskFactorBreakdown': '{\"breakdown\":{\"breakdownTitle\":\"\",\"subSectors\":[{\"breakdownRuleType\":\"String\",\"useNoneBuckets\":true,\"groupByColumn\":{\"columnTag\":\"BRS_GOLD_5\",\"columnName\":\"BRS Standard Factor Tree Level 1\",\"positionColumnType\":\"ALL\",\"dataType\":\"STRING\"},\"subSectors\":[{\"breakdownRuleType\":\"String\",\"useNoneBuckets\":true,\"groupByColumn\":{\"columnTag\":\"BRS_GOLD_4\",\"columnName\":\"BRS Standard Factor Tree Level 2\",\"positionColumnType\":\"ALL\",\"dataType\":\"STRING\"},\"subSectors\":[{\"breakdownRuleType\":\"String\",\"useNoneBuckets\":true,\"groupByColumn\":{\"columnTag\":\"BRS_GOLD_3\",\"columnName\":\"BRS Standard Factor Tree Level 3\",\"positionColumnType\":\"ALL\",\"dataType\":\"STRING\"},\"subSectors\":[{\"breakdownRuleType\":\"String\",\"useNoneBuckets\":true,\"groupByColumn\":{\"columnTag\":\"BRS_GOLD_2\",\"columnName\":\"BRS Standard Factor Tree Level 4\",\"positionColumnType\":\"ALL\",\"dataType\":\"STRING\"},\"subSectors\":[{\"breakdownRuleType\":\"String\",\"useNoneBuckets\":true,\"groupByColumn\":{\"columnTag\":\"BRS_GOLD_1\",\"columnName\":\"BRS Standard Factor Tree Level 5\",\"positionColumnType\":\"ALL\",\"dataType\":\"STRING\"}}]}]}]}]}]}}'
        };
        expect(requestParams).toEqual(expectedRequestParams);

        requestParams = service.createSpecifiedShocksRequest(false);
        expectedRequestParams = {
            'dataFormat': 'COMPACT_JSON',
            'forDate': '03/15/2021',
            'holidayCalendar': 'ab',
            'includeAliasPortfolios': false,
            'isPortGroupSummaryRequest': false,
            'portId': WorkspaceStore.getCurrentPortfolio().portId,
            'portfolio': 'PEP',
            'portfolioIdentifier': 'PEP',
            'positionMode': 'AS_OF_W',
            'riskFactorBreakdown': '{\"breakdown\":{\"breakdownTitle\":\"\",\"subSectors\":[{\"breakdownRuleType\":\"String\",\"useNoneBuckets\":true,\"groupByColumn\":{\"columnTag\":\"BRS_GOLD_5\",\"columnName\":\"BRS Standard Factor Tree Level 1\",\"positionColumnType\":\"ALL\",\"dataType\":\"STRING\"},\"subSectors\":[{\"breakdownRuleType\":\"String\",\"useNoneBuckets\":true,\"groupByColumn\":{\"columnTag\":\"BRS_GOLD_4\",\"columnName\":\"BRS Standard Factor Tree Level 2\",\"positionColumnType\":\"ALL\",\"dataType\":\"STRING\"},\"subSectors\":[{\"breakdownRuleType\":\"String\",\"useNoneBuckets\":true,\"groupByColumn\":{\"columnTag\":\"BRS_GOLD_3\",\"columnName\":\"BRS Standard Factor Tree Level 3\",\"positionColumnType\":\"ALL\",\"dataType\":\"STRING\"},\"subSectors\":[{\"breakdownRuleType\":\"String\",\"useNoneBuckets\":true,\"groupByColumn\":{\"columnTag\":\"BRS_GOLD_2\",\"columnName\":\"BRS Standard Factor Tree Level 4\",\"positionColumnType\":\"ALL\",\"dataType\":\"STRING\"},\"subSectors\":[{\"breakdownRuleType\":\"String\",\"useNoneBuckets\":true,\"groupByColumn\":{\"columnTag\":\"BRS_GOLD_1\",\"columnName\":\"BRS Standard Factor Tree Level 5\",\"positionColumnType\":\"ALL\",\"dataType\":\"STRING\"}}]}]}]}]}]}}',
            'splitPositionTypes': '',
            'todayDate': '06/03/2024',
            'type': 'praAgGrid'
        };
        requestParams['todayDate'] = '06/03/2024';
        expect(requestParams).toEqual(expectedRequestParams);
    });

    it('should have createAuxGridColDefs method', () => {
        expect(service.createAuxGridColDefs).toBeDefined();
        const columns = [new ColumnConfig()];
        columns[0].columnTag = 'rfv_ftitle';
        columns[0].columnKey = 'rfv_ftitle12323';
        columns[0].columnTitle = ' Title';
        service.createAuxGridColDefs(columns).forEach((colDef: any, index) => {
            expect(colDef.headerName).toEqual(columns[index].columnTitle);
            expect(colDef.field).toEqual(columns[index].columnKey);
            expect(colDef.colTag).toEqual(columns[index].columnTag);
        });
    });

    it('should have getSpecifiedScenarioDataUrl method', () => {
        expect(service.getSpecifiedScenarioDataUrl).toBeDefined();
        expect(service.getSpecifiedScenarioDataUrl(true)).toEqual(DataRequestConstants.DATA_REQUEST_URL.FACTOR_TREE_DATA);
        expect(service.getSpecifiedScenarioDataUrl(false)).toEqual(DataRequestConstants.DATA_REQUEST_URL.RISK_DATA);
    });
});
