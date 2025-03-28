import {TestBed} from '@angular/core/testing';
import {of} from 'rxjs';
import {async as _async} from 'rxjs/internal/scheduler/async';
import {AbstractWidgetService} from '@services/widget/abstract-widget.service';
import {DataRequestConstants} from '@constants/data-request.constants';
import {Report} from '@models/workspace/report.model';
import {Widget} from '@models/widget/widget.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Breakdown, ColumnSector, Sector} from '@blk/explore-ui-breakdown';
import {ExploreDataRequestService} from '@services/widget-data/explore-data-request.service';
import {ColumnConfig, WidgetConfigType} from '@blk/explore-ui-core';
import {WorkspaceStore} from '../../../stores';
import {FlatWorkpad} from '../../../models/workspace/flat-workpad.model';

/**
 * Performs required initialisation for the "beforeAll" test setup method required by a data service test.
 * @return ExploreDataRequestService mocked instance
 */
export function beforAllDataServiceTest(): ExploreDataRequestService {
    const exploreServiceStub = {
        getData$: jest.fn(() => {
            return of({data: {}}, _async);
        }),
        clearDataFromCache: jest.fn()
    };

    TestBed.configureTestingModule({
        providers: [{provide: ExploreDataRequestService, useValue: exploreServiceStub}],
        teardown: {
            destroyAfterEach: false
        }
    });

    return TestBed.inject(ExploreDataRequestService);
}

/**
 * Validates widget config type and the static static params
 */
export function validateService(
    service: AbstractWidgetService,
    expectedWidgetConfigTypes: WidgetConfigType[],
    expectedIsSectorViewParam: string
): void {
    expect(service.getWidgetConfigTypes().length).toBe(expectedWidgetConfigTypes.length);
    expect(service.getWidgetConfigTypes()).toStrictEqual(expectedWidgetConfigTypes);

    const expectedStaticRequestParams = {
        dataFormat: DataRequestConstants.DATA_FORMAT.COMPACT_JSON
    };

    if ('Y' === expectedIsSectorViewParam) {
        expectedStaticRequestParams['isSectorView'] = 'Y';
    }
    if (WidgetConfigType.PGS === expectedWidgetConfigTypes[0] || WidgetConfigType.PGS_BAR === expectedWidgetConfigTypes[0] || WidgetConfigType.PGS_TS === expectedWidgetConfigTypes[0]) {
        expectedStaticRequestParams['isPortGroupSummaryRequest'] = 'Y';
    }
    expect(service.getStaticWidgetRequestParams()).toStrictEqual(expectedStaticRequestParams);
}

/**
 * Runs validateInputs on the given service for the scenario when the report is a comparison report.
 * It checks that the validateInputs returns a notification.
 */
export function runValidateInputsAndCheckItFailsOnComparisonMode(service: AbstractWidgetService) {
    const report = new Report();
    WorkspaceStore.init();
    WorkspaceStore.currentWorkpad$.next(new FlatWorkpad());

    const notification = service['validateInputs'](new Widget(), new Portfolio(), report);
    expect(notification).not.toBeNull();
}

/**
 * Utility function to create a multi level breakdown for tests.
 */
export function createMultiLevelBreakdown(columns: string[]): Breakdown {
    const breakdown: Breakdown = new Breakdown();
    breakdown.title = '';

    let nodeToAddChild: Sector = breakdown;
    columns.forEach((column) => {
        const sector: ColumnSector = new ColumnSector();
        sector.columnTag = column;
        sector.columnName = column;
        sector.positionColumnType = 'ALL';
        nodeToAddChild.addChild(sector);

        nodeToAddChild = sector;
    });

    return breakdown;
}

/**
 * Mocks ColumnConfig.createColumn
 * @return a spy on ColumnConfig.createColumn
 */
export function mockColumnCreation(): any {
    const columnConfigSpy = jest.spyOn(ColumnConfig, 'createColumn');
    columnConfigSpy.mockImplementation((columnTag: string, positionColumnType: string, columnKey?: string) => {
        const columnConfig = new ColumnConfig();
        columnConfig.columnTag = columnTag;
        columnConfig.columnKey = columnKey;
        return columnConfig;
    });

    return columnConfigSpy;
}
