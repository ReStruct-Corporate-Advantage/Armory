import {Widget} from '@models/widget/widget.model';
import {PortfolioDefaults, WidgetConfigType} from '@blk/explore-ui-core';
import {PgsChartInputs} from '@models/pgs-chart-inputs.model';
import {TabularWidgetConstants} from '@constants/tabular-widget.constants';
import {ReportGroup} from '@models/workspace/report-group.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Workspace} from '@models/workspace/workspace.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {PgsBarChartSpriteletLauncherService} from '@services/spritelet-launcher/pgs-bar-chart-spritelet-launcher.service';
import {TestBed} from '@angular/core/testing';
import {SpriteletLauncherServiceRegistry} from '@services/spritelet-launcher/spritelet-launcher-service.registry';
import {PgsChartKeyGeneratorService} from '@services/widget/pgs-chart-key-generator.service';
import {FilterExcludeKey, FilterIncludeKey} from '@qbstr/data-cube';
import {PgsLeafBarChartSpriteletLauncherService} from '@services/spritelet-launcher/pgs-leaf-bar-chart-spritelet-launcher.service';

describe('PGS updatePGSChartKeys Test', () => {
    let service: PgsChartKeyGeneratorService;
    let spriteletLauncherService: SpriteletLauncherServiceRegistry;

    const spriteletLauncherServiceRegistryStub = {
        getSpriteletLauncherService: jest.fn(() => new PgsBarChartSpriteletLauncherService(null)),
    };

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: [{provide: SpriteletLauncherServiceRegistry, useValue: spriteletLauncherServiceRegistryStub}]
        });
        spriteletLauncherService = TestBed.inject(SpriteletLauncherServiceRegistry);
        service = new PgsChartKeyGeneratorService(spriteletLauncherService);
    });

    it('Tests  - should update PGS chart keys', async () => {
        const workspace = new Workspace();
        const workpad1 = new FlatWorkpad();
        const workpad2 = new ReportGroup();
        const port1 = new Portfolio('PEP');
        const port2 = new Portfolio('IP');
        const port3 = new Portfolio('CORE-HQ');
        port3.isPortfolioGroup = true;
        port1.portfolioDefaults = new PortfolioDefaults();
        workpad1.portfolio = port1;
        workpad2.portfolios = [port1, port2, port3];
        workspace.workpads = [workpad1, workpad2];
        const widget = new Widget();
        widget.configType = WidgetConfigType.PGS_BAR;
            widget.pgsChartPortfolio = 'CORE-HQ';
            widget.pgsChartInputs = new PgsChartInputs({
                actionKey: TabularWidgetConstants.PGS_BAR_CHART_SPRITELET.ACTION_KEY.toString(),
                level: 1,
                portHierarchy: 'CORE-HQ|->GALIC'
            });

        const widget2 = new Widget();
        widget2.configType = WidgetConfigType.PGS_BAR;
        widget2.pgsChartPortfolio = 'PEP';
        widget2.pgsChartInputs = new PgsChartInputs({
            actionKey: TabularWidgetConstants.PGS_BAR_CHART_SPRITELET.ACTION_KEY.toString(),
            level: 0,
            portHierarchy: 'PEP'
        });
        workpad2.activeReport = {
            widgets: [
                widget
            ]
        };
        service.updatePGSChartKeys(port3, workpad2);
        expect(widget.dataStore.data.customVizConfig).not.toBeNull();
        expect(widget.dataStore.data.customVizConfig.queryKeys[1]['includes']).toStrictEqual(['GALIC']);

        workpad2.activeReport = {
            widgets: [
                widget2
            ]
        };

        service.updatePGSChartKeys(port2, workpad2);
        expect(widget2.dataStore.data.customVizConfig).not.toBeNull();
        expect(widget2.dataStore.data.customVizConfig.queryKeys.length).toBe(2);

        widget2.dataStore.data.customVizConfig = {
            queryKeys: [new FilterIncludeKey('_ROOT_', ['PEP'])]
        };
        service.updatePGSChartKeys(port2, workpad2);
        expect(widget2.dataStore.data.customVizConfig.queryKeys.length).toBe(2);

        widget2.dataStore.data.customVizConfig = {
            queryKeys: [new FilterIncludeKey('_ROOT_', ['PEP'])]
        };
        service.updatePGSChartKeys(port1, workpad2);
        expect(widget2.dataStore.data.customVizConfig.queryKeys.length).toBe(1);

        widget2.pgsChartInputs.actionKey = 'PGS_BAR_CHART_SPRITELET';
        service.updatePGSChartKeys(port3, workpad2);
        expect(widget2.dataStore.data.customVizConfig.queryKeys.length).toBe(1);
        expect(widget2.dataStore.data.customVizConfig.queryKeys[0] instanceof FilterIncludeKey).toBeTruthy();

        widget2.pgsChartInputs.actionKey = 'PGS_LEAF_BAR_CHART_SPRITELET';
        spriteletLauncherServiceRegistryStub.getSpriteletLauncherService = jest.fn(() => new PgsLeafBarChartSpriteletLauncherService(null));
        service.updatePGSChartKeys(port3, workpad2);
        expect(widget2.dataStore.data.customVizConfig.queryKeys.length).toBe(1);
        expect(widget2.dataStore.data.customVizConfig.queryKeys[0] instanceof FilterExcludeKey).toBeTruthy();
    });
});
