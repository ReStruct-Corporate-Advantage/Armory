import {TestBed} from '@angular/core/testing';
import {ColumnSet} from '@blk/explore-ui-column-option';
import {WidgetConfigType, WidgetInputType} from '@blk/explore-ui-core';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {TestUtils} from '@utils/test.utils';
import {WorkspaceStore} from '../../../stores';
import {CommitmentHorizon} from '@models/widget/inputs/commitment-risk/commitment-horizon.model';
import {CommitmentRiskScenario} from '@models/widget/inputs/commitment-risk/commitment-risk-scenario.model';
import {CommitmentRiskGrouping} from '@models/widget/inputs/commitment-risk/commitment-risk-grouping.model';
import {
    CommitmentRiskExcludedFundsLauncherService
} from '@services/spritelet-launcher/commitment-risk-excluded-funds-launcher.service';

describe('CommitmentRiskExcludedFundsLauncherService', () => {
    let service: CommitmentRiskExcludedFundsLauncherService;

    let parentWidget: Widget;

    beforeAll((done) => {
        TestUtils.initialize(done);
    });

    beforeEach(() => {
        WorkspaceStore.init();
        WorkspaceStore.updateCurrentReport(new Report());

        TestBed.configureTestingModule({
            providers: [CommitmentRiskExcludedFundsLauncherService]
        });
        service = TestBed.inject(CommitmentRiskExcludedFundsLauncherService);

        parentWidget = new Widget(WidgetConfigType.COMMITMENT_RISK);

        (parentWidget.getCombinedInputs().get(WidgetInputType.COMMITMENT_HORIZON) as CommitmentHorizon).horizon = 10;
        (parentWidget.getCombinedInputs().get(WidgetInputType.COMMITMENT_RISK_SCENARIO) as CommitmentRiskScenario).scenario = 'stress_scenario_1';
        (parentWidget.getCombinedInputs().get(WidgetInputType.COMMITMENT_RISK_GROUPING) as CommitmentRiskGrouping).groupBy = 'asset_type';
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
        expect(service.getSpriteletActionKey()).toBe('OPEN_COMMITMENT_RISK_EXCLUDED_FUNDS');
    });

    it('should create commitment risk excluded funds widget and copy parent meta', () => {
        service.launchSpritelet(parentWidget);
        const spriteletWidget = WorkspaceStore.getCurrentReport().widgets[0];

        expect(spriteletWidget.configType).toBe(WidgetConfigType.COMMITMENT_RISK_EXCLUDED_FUNDS);
        expect(spriteletWidget.showSettings).toBe(false);
        expect(spriteletWidget.title).toBe('Funds Excluded From Aladdin Commitment Risk Projections');

        expect(spriteletWidget.dataStore.isDependentOnParentForMetaData).toBe(true);

        expect(spriteletWidget.getCombinedInputs().get(WidgetInputType.COMMITMENT_HORIZON)).toEqual(parentWidget.getCombinedInputs().get(WidgetInputType.COMMITMENT_HORIZON));
        expect(spriteletWidget.getCombinedInputs().get(WidgetInputType.COMMITMENT_RISK_SCENARIO)).toEqual(parentWidget.getCombinedInputs().get(WidgetInputType.COMMITMENT_RISK_SCENARIO));
        expect(spriteletWidget.getCombinedInputs().get(WidgetInputType.COMMITMENT_RISK_GROUPING)).toEqual(parentWidget.getCombinedInputs().get(WidgetInputType.COMMITMENT_RISK_GROUPING));
    });
});
