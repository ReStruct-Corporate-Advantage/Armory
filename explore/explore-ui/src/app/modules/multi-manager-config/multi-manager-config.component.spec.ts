import {ComponentFixture, TestBed} from '@angular/core/testing';

import {MultiManagerConfigComponent} from './multi-manager-config.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {DecisionLevelConfig} from '@models/portfolio/decisionLevels/decision-level-config.model';
import {DecisionBenchmarkService} from '@services/widget/decision-benchmark-service';
import {Widget} from '@models/widget/widget.model';
import {
    ColumnDefinition,
    CoreDefinitionStore,
    CoreWidgetConfigStore,
    WidgetConfig,
    WidgetConfigType
} from '@blk/explore-ui-core';
import * as riskExposureConfig
    from '../../../../projects/explore-ui-column-option/src/test-utils/widget-configs/risk-and-exposure-widget.json';
import {DefinitionsStore} from '@stores/definitions.store';
import {TreeCube} from '@utils/qbstr/tree-cube';
import {ROOT_LEVEL} from '@utils/qbstr';
import {FilterIncludeKey, QueryKey} from '@qbstr/data-cube';
import {
    AuxRadioGroupChangedDetailInterface,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';

describe('MultiManagerConfigComponent', () => {
    let component: MultiManagerConfigComponent;
    let fixture: ComponentFixture<MultiManagerConfigComponent>;


    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [MultiManagerConfigComponent],
            providers: [{
                provide: DecisionBenchmarkService,
                useValue: {
                    getDecisionBenchmarks: jest.fn(),
                    processResponse: jest.fn(),
                    extractDataAndStore: jest.fn()
                }
            }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });
        CoreWidgetConfigStore.chartConfig.set('riskExposure', new WidgetConfig(riskExposureConfig));
        // Mock DefinitionsStore.topDownEligibleCols
        DefinitionsStore.topDownEligibleCols = ['pct_mv', 'cusip', 'sec_desc'];

        // Mock CoreDefinitionStore.columnTagColumnsPairs
        const pctMVColumnDef = new ColumnDefinition();
        pctMVColumnDef.title = 'Market Value %';
        pctMVColumnDef.columnTag = 'pct_mv';
        CoreDefinitionStore.columnTagColumnsPairs.set('pct_mv', [pctMVColumnDef]);

        const cusipColumnDef = new ColumnDefinition();
        cusipColumnDef.title = 'Cusip';
        cusipColumnDef.columnTag = 'cusip';
        CoreDefinitionStore.columnTagColumnsPairs.set('cusip', [cusipColumnDef]);

        const securityColumnDef = new ColumnDefinition();
        securityColumnDef.title = 'Security Description';
        securityColumnDef.columnTag = 'sec_desc';
        CoreDefinitionStore.columnTagColumnsPairs.set('sec_desc', [securityColumnDef]);

        fixture = TestBed.createComponent(MultiManagerConfigComponent);

        component = fixture.componentInstance;
        component['widget'] = new Widget(WidgetConfigType.RISK_EXPOSURE);
        component['decisionLevelsConfig'] = new DecisionLevelConfig({
            portTreeDecisionLevel: 2,
            arrangeByOption: 'Portfolio attributes',
            topDownCols: ['pct_mv', 'cusip'],
            decisionBenchMap: new Map()
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should get loading label for portfolio attributes for 2 levels', () => {
        expect(component['getLoadingLabel']()).toEqual('Loading Portfolio attributes with Market Value % and Cusip');
    });

    it('should get loading label for portfolio attributes for 3 levels', () => {
        component['decisionLevelsConfig'] = new DecisionLevelConfig({
            portTreeDecisionLevel: 3,
            topDownCols: ['pct_mv', 'cusip', 'sec_desc'],
            decisionBenchMap: new Map()
        });
        expect(component['getLoadingLabel']()).toEqual('Loading Portfolio attributes with Market Value %, Cusip and Security Description');
    });

    it('should get loading label for portfolio tree with single level', () => {
        component['decisionLevelsConfig'] = new DecisionLevelConfig({
            portTreeDecisionLevel: 1,
            arrangeByOption: 'Portfolio tree'
        });
        expect(component['getLoadingLabel']()).toEqual('Loading Portfolio tree with 1 level');
    });

    it('should get loading label for portfolio tree with multiple levels', () => {
        component['decisionLevelsConfig'] = new DecisionLevelConfig({
            portTreeDecisionLevel: 2,
            arrangeByOption: 'Portfolio tree'
        });
        expect(component['getLoadingLabel']()).toEqual('Loading Portfolio tree with 2 levels');
    });

    it('should clear all the decision level benchmarks', ()=>{
        const mockCube = { delete: jest.fn(), port:'MULTI-BII'} as unknown as TreeCube;
        component['widgetPayload'] = { cube: mockCube };
        component['decisionLevelsConfig'].decisionBenchMap.set('MULTI-BII->H2', 'PEP');
        component['decisionLevelsConfig'].decisionBenchMap.set('MULTI-BII->H2->ILB', 'SNP100');
        component['decisionLevelsConfig'].decisionBenchMap.set('MULTI-BII->CORE-HQ', 'BGO');
        component['decisionLevelsConfig'].decisionBenchMap.set('MULTI-BII->CORE-HQ->X-83-RO-AG', 'SNP500');
        component['clearAll']();
        expect(component['decisionLevelsConfig'].decisionBenchMap.size).toEqual(0);
        expect(mockCube.delete).toHaveBeenCalledWith(new QueryKey([
            new FilterIncludeKey(ROOT_LEVEL, [component['widgetPayload'].cube['port']])
        ]));
    });

    it('should update topDownCols and disable options correctly', () => {
        const event = {
            detail: {
                value: { value: 'sec_desc' }
            }
        } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;

        component['onTopDownColChanged'](event, 1);

        expect(component['decisionLevelsConfig'].topDownCols[1]).toBe('sec_desc');
        expect(component['topDownColOptionsMap'][2][0].values.find(option => option.value === 'sec_desc').isDisabled).toBe(true);
    });

    it('should deselect topdown column next in line', () => {
        const event = {
            detail: {
                value: null
            }
        } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
        const decisionMapClearSpy = jest.spyOn(component.decisionLevelsConfig.decisionBenchMap, 'clear').mockImplementation(() => {});
        component['topdownChangeCallback'](event, 0);

        expect(decisionMapClearSpy).toHaveBeenCalledTimes(1);
        expect(component['noColSelectedInTopdownArrangeBy']).toBe(true);
        expect(component['refreshRequired']).toBe(true);
    });

    it('should send request for port tree if column selected', () => {
        const event = {
            detail: {
                value: {value: null}
            }
        } as CustomEvent<AuxSelectSelectionChangedDetailInterface>;
        component['decisionLevelsConfig'].topDownCols = ['cusip', null];
        component['topdownChangeCallback'](event, 0);

        expect(component['noColSelectedInTopdownArrangeBy']).toBe(true);
    });

    it('should throw an error when event is null', () => {
        expect(() => component['onTopDownColChanged'](null, 0)).toThrowError('Something is wrong with Topdown column selection');
    });

    it('should throw an error when event is null for port tree decision level', () => {
        expect(() => component['onPortTreeDecisionLevelChanged'](null)).toThrowError('Something went wrong with selecting portfolio tree decision level');
    });

    it('should update portTreeDecisionLevelOption and call sendRequestForPortTree', () => {
        const event = {
            detail: {
                value: { eventData: 3 }
            }
        } as CustomEvent<AuxRadioGroupChangedDetailInterface>;
        component['onPortTreeDecisionLevelChanged'](event);

        expect(component['decisionLevelsConfig'].portTreeDecisionLevelOption).toBe(3);
        expect(component['refreshRequired']).toBe(true);
    });

    it('should update portTreeDecisionLevelOption with null decisionBenchMap', () => {
        const event = {
            detail: {
                value: { eventData: 2 }
            }
        } as CustomEvent<AuxRadioGroupChangedDetailInterface>;
        component.decisionLevelsConfig.portTreeDecisionLevelOption = 3;
        component.decisionLevelsConfig.decisionBenchMap = null;

        component['onPortTreeDecisionLevelChanged'](event);

        expect(component['decisionLevelsConfig'].portTreeDecisionLevelOption).toBe(2);
        expect(component['refreshRequired']).toBe(true);
    });

    it('should update portTreeDecisionLevelOption and call trim decision bench map', () => {
        const event = {
            detail: {
                value: { eventData: 1 }
            }
        } as CustomEvent<AuxRadioGroupChangedDetailInterface>;

        component.decisionLevelsConfig.decisionBenchMap = new Map([
            ['MULTI-BII->H2->BGO', 'PEP'],
            ['MULTI-BII->H2->ILB', 'SNP100'],
            ['MULTI-BII->CORE-HQ', 'BGO'],
            ['MULTI-BII->CORE-HQ->X-83-RO-AG->H2', 'SNP']
        ]);

        component['onPortTreeDecisionLevelChanged'](event);

        expect(component['decisionLevelsConfig'].decisionBenchMap.size).toBe(1);
    });

    it('should update arrangeByOption and clear decisionBenchMap', () => {
        const event = {
            detail: {
                value: { label: 'Portfolio attributes' }
            }
        } as CustomEvent<AuxRadioGroupChangedDetailInterface>;

        component['onArrangeByChanged'](event);

        expect(component['decisionLevelsConfig'].arrangeByOption).toBe('Portfolio attributes');
        expect(component['decisionLevelsConfig'].decisionBenchMap.size).toBe(0);
    });

    it('should not touch portTreeDecisionLevelOption and mark for check if arrangeByOption is Portfolio attributes and no topdown columns are selected', () => {
        const event = {
            detail: {
                value: { label: 'Portfolio attributes' }
            }
        } as CustomEvent<AuxRadioGroupChangedDetailInterface>;

        component['decisionLevelsConfig'].topDownCols = [];
        // before
        expect(component['decisionLevelsConfig'].portTreeDecisionLevelOption).toBe(2);
        component['onArrangeByChanged'](event);
        // after
        expect(component['decisionLevelsConfig'].portTreeDecisionLevelOption).toBe(2);
        expect(component['noColSelectedInTopdownArrangeBy']).toBe(true);
        expect(component['refreshInProgress']).toBe(false);
    });

    it('should pass dialog param object to open the modal', () => {
        const event = {
            detail: {
                value: {label: 'Portfolio tree'}
            }
        } as CustomEvent<AuxRadioGroupChangedDetailInterface>;
        const dialogSpy = jest.spyOn(component['promptDialog$'], 'next');
        component['onArrangeByChanged'](event);
        expect(dialogSpy).toHaveBeenCalledTimes(1);
    });

    it('should set portTreeDecisionLevelOption to 1 and mark for check if arrangeByOption is Portfolio tree ', () => {
        const event = {
            detail: {
                value: { label: 'Portfolio tree' }
            }
        } as CustomEvent<AuxRadioGroupChangedDetailInterface>;

        component['decisionLevelsConfig'].topDownCols = [];
        // before
        expect(component['decisionLevelsConfig'].portTreeDecisionLevelOption).toBe(2);
        component['arrangeByChangedCallback'](event);
        // after
        expect(component['decisionLevelsConfig'].portTreeDecisionLevelOption).toBe(1);
        expect(component['noColSelectedInTopdownArrangeBy']).toBe(false);
        expect(component['decisionLevelsConfig'].topDownCols).toStrictEqual([]);
    });

    it('reverts to previous state if user cancels dialog', () => {
        component['arrangeByCallBackRevert']();
        expect(component['selectedArrangeByOption']).toEqual('Portfolio attributes');
        expect(component['arrangeByOptions'].find(option => option.label === DecisionLevelConfig.PORT_ATTRIBUTES_CAPTION).checked).toBeTruthy();
    });
});
