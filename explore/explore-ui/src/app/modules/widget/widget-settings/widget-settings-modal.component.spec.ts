import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {AuxToggleChangedDetailInterface} from '@blk/aladdin-angular-components';
import {ColumnSet, OverrideDateColumnOption, StyleAnalysisColumnOption, StyleMeasureColumnOptionModel} from '@blk/explore-ui-column-option';
import {AlertConstants, ChartWidgetInputConfigType, ColumnConfig, ColumnDefinition, ColumnType, CoreColumnUtils, CoreWidgetConfigStore, OverrideDateConstants, PerformanceSettings, ReturnsUtilityService, WidgetConfig, WidgetConfigType, WidgetInput, WidgetInputType} from '@blk/explore-ui-core';
import {CoreRiskConstants, RiskSettings} from '@blk/explore-ui-risk';
import {UserPreference} from '@constants/user-preference.constants';
import {Breakdown, ColumnBreakdown, ColumnSector, CustomSector} from '@blk/explore-ui-breakdown';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {ExpandedState} from '@models/widget/inputs/expanded-state.model';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {ROOT_LEVEL} from '@utils/qbstr';
import {TestUtils} from '@utils/test.utils';
import {BehaviorSubject, of} from 'rxjs';
import {WidgetConfigFactory} from '../../../factories';
import {DefinitionsStore, UserMetaDataStore, WorkspaceStore} from '../../../stores';
import {WidgetSettingsModalComponent} from './widget-settings-modal.component';
import {LightLookthrough} from '@models/lookthrough/light-lookthrough.model';
import {RiskAndExposureAdditionalSettings} from '@models/widget/inputs/risk-and-exposure-additional-settings.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {WidgetConstants} from '@constants/widget.constants';
import {isString, mapValues} from 'lodash';
import {FactorDataChartSettings} from '@models/widget/inputs/chart-settings/factor-data-chart-settings.model';
import {ShowAsChartInput} from '@models/widget/inputs/show-as-chart-input.model';
import {FactorTimeSeriesSelectedOption} from '@enums/factor-time-series-selected-option.enum';
import {TimeSeriesSettings} from '@models/widget/inputs/chart-settings/time-series-settings.model';
import {FactorDataHighlightSettings} from '@models/widget/inputs/factor-data-settings/factor-data-highlight-settings.model';
import {FactorDataRiskMatrixSettings} from '@models/widget/inputs/factor-data-settings/factor-data-risk-matrix-settings.model';
import {ComboChartColumnSettings} from '@models/widget/inputs/chart-settings/combo-chart-column-settings.model';
import {ComboChartColumn} from '@models/widget/inputs/chart-settings/combo-chart-column.model';
import {ColumnSeriesChartType} from '@enums/column-series-chart-type.enum';

describe('WidgetSettingsModalComponent', () => {
    let component: WidgetSettingsModalComponent;
    let fixture: ComponentFixture<WidgetSettingsModalComponent>;

    beforeAll((done) => {
        TestUtils.initialize(done);

        WorkspaceStore.currentWidget$ = new BehaviorSubject<Widget>(undefined);
        WorkspaceStore.currentPortfolio$ = new BehaviorSubject<Portfolio>(new Portfolio('PEP'));
        WorkspaceStore.currentReport$ = new BehaviorSubject<Report>(new Report());
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [WidgetSettingsModalComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(WidgetSettingsModalComponent);
        component = fixture.componentInstance;
    });

    it('should invoke close function of the modal on close event of the component', () => {
        component.isOpen = true;
        jest.spyOn(component.modalClosed, 'emit');
        WorkspaceStore.updateCurrentWidget(new Widget(WidgetConfigType.RISK_EXPOSURE));

        component.closeModal();

        expect(WorkspaceStore.getCurrentWidget()).toBeUndefined();
        expect(component.isOpen).toBeFalsy();
        expect(component.modalClosed.emit).toHaveBeenCalled();
    });

    it('should invoke open function of the modal on open event of the component', () => {
        const loadTabsSpy = jest.spyOn(component, 'loadTabs');
        const TITLE = 'Risk and Exposure';
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        expect(WorkspaceStore.getCurrentWidget()).toBeUndefined();

        component.ngOnInit();

        expect(WorkspaceStore.getCurrentWidget() === component.widget).toBeTruthy();
        expect(component.displayTitle).toBe(TITLE);
        expect(component.inputs.size).toBe(11);
        expect(component.inputs.get('columns').equals(component.widget.dataStore.metaData.inputs.get('columns'))).toBeTruthy();
        expect(
            component.inputs.get('topBottomFilter').equals(component.widget.dataStore.metaData.inputs.get('topBottomFilter'))
        ).toBeTruthy();
        expect(
            component.inputs
                .get('riskAndExposureAdditionalSettings')
                .equals(component.widget.dataStore.metaData.inputs.get('riskAndExposureAdditionalSettings'))
        ).toBeTruthy();

        expect(loadTabsSpy).toBeCalled();
    });

    it('should update tile but keep settings display title', () => {
        const ORIG_TITLE = 'Risk and Exposure';
        const UPDATED_TITLE = 'Custom Title';
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        component.widget.title = UPDATED_TITLE;

        component.ngOnInit();
        expect(component.displayTitle).toBe(UPDATED_TITLE);
        expect(component.settingsDisplayTitle).toBe('Widget Type: '.concat(ORIG_TITLE));
    });

    it('should update tile but keep settings display title for Charts', () => {
        const ORIG_TITLE = 'Bar Chart';
        const UPDATED_TITLE = 'Custom Title';
        component.widget = new Widget(WidgetConfigType.BAR);
        component.widget.title = UPDATED_TITLE;

        component.ngOnInit();
        expect(component.displayTitle).toBe(UPDATED_TITLE);
        expect(component.settingsDisplayTitle).toBe('Widget Type: '.concat(ORIG_TITLE));
    });

    describe('onDone Test', () => {
        it('test onDoneClicked', () => {
            component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            const changedBreakdown = new Breakdown();
            // children comparison
            const customSector1 = new CustomSector();
            customSector1.title = 'Custom Sector';
            changedBreakdown.text = 'Test';
            changedBreakdown.addChild(customSector1);
            component.widget.dataStore.metaData.inputs.set('breakdownTree', changedBreakdown);


            const expandedState = new ExpandedState({expandedPaths: [[ROOT_LEVEL], [ROOT_LEVEL, 'sector1']]});
            component.widget.displayInputs.set(ExpandedState.CONFIG_TYPE, expandedState);

            component.ngOnInit();
            component.inputs.set('breakdownTree', new Breakdown());

            component.onDoneClicked();

            expect(component.widget.displayInputs.get(ExpandedState.CONFIG_TYPE).equals(new ExpandedState({expandedPaths: [[ROOT_LEVEL]]}))).toBeTruthy();
        });

        it('test onDoneClicked with Style Columns', () => {
            const colDef: ColumnDefinition = new ColumnDefinition({columnTag: 'test_column', title: 'Test'});
            colDef.groups = ['Style Analysis'];
            jest.spyOn(CoreColumnUtils, 'getColumnDefByTag')
                .mockImplementation((columnTag) => {
                    return columnTag === 'style_size' ? colDef : null;
                });
            component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            const changedBreakdown = new Breakdown();
            // children comparison
            const customSector1 = new CustomSector();
            customSector1.title = 'Custom Sector';
            changedBreakdown.text = 'Test';
            changedBreakdown.addChild(customSector1);
            component.widget.dataStore.metaData.inputs.set('breakdownTree', changedBreakdown);


            const expandedState = new ExpandedState({expandedPaths: [[ROOT_LEVEL], [ROOT_LEVEL, 'sector1']]});
            component.widget.displayInputs.set(ExpandedState.CONFIG_TYPE, expandedState);

            component.ngOnInit();
            component.inputs.set('breakdownTree', new Breakdown());
            const styleColumn: ColumnConfig = new ColumnConfig();
            styleColumn.columnTag = 'style_size';
            styleColumn.columnKey = 'style_size_1';
            styleColumn.columnTitle = 'Size';
            const colOption = new StyleAnalysisColumnOption();
            const styleMeasureMapping = {
                'style_size_2': new StyleMeasureColumnOptionModel({
                    'min': 200,
                    'max': 400,
                    'weight': 0.25,
                    'isNormal': true
                }),
                'style_size_3': new StyleMeasureColumnOptionModel({
                    'min': 200,
                    'max': 400,
                    'weight': 0.25,
                    'isNormal': true
                }),
                'style_size_4': new StyleMeasureColumnOptionModel({
                    'min': 200,
                    'max': 400,
                    'weight': 0.25,
                    'isNormal': true
                })
            };
            colOption.styleMeasureMapping = mapValues(styleMeasureMapping, value => {
                return new StyleMeasureColumnOptionModel(isString(value) ? JSON.parse(value) : value);
            });
            styleColumn.optionValues.push(colOption);
            (component.inputs.get('columns') as ColumnSet).columns.push(styleColumn);
            component.onDoneClicked();

            expect(component.widget.displayInputs.get(ExpandedState.CONFIG_TYPE).equals(new ExpandedState({expandedPaths: [[ROOT_LEVEL]]}))).toBeTruthy();
        });

        it('test refreshColumnState', () => {
            component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            const breakdown = new Breakdown();
            // children comparison
            const customSector1 = new CustomSector();
            customSector1.title = 'Custom Sector';
            breakdown.text = 'Test';
            breakdown.addChild(customSector1);
            const columnBreakdown = new ColumnBreakdown();
            columnBreakdown.breakdown = breakdown;
            const columnSet = component.widget.getCombinedInputs().get(WidgetInputType.COLUMNS) as ColumnSet;
            columnSet.columnState.columns.push({columnKey: columnSet.columns[2].columnKey + '|' + 'FUND'});
            columnSet.columnState.columns.push({columnKey: columnSet.columns[2].columnKey + '|' + 'MBS'});
            component.ngOnInit();
            // column breakdown is changed
            columnSet.columns[2].optionValues = [columnBreakdown];
            component['refreshColumnState'](component.widget);
            const columnSetUpdated = component.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
            expect(columnSetUpdated.columnState.columns.some(column => column.columnKey === columnSet.columns[2].columnKey + '|' + 'FUND')).toBeFalsy();
            expect(columnSetUpdated.columnState.columns.some(column => column.columnKey === columnSet.columns[2].columnKey + '|' + 'MBS')).toBeFalsy();
            // if column is removed
            columnSetUpdated.columns.splice(2);
            component['refreshColumnState'](component.widget);
            expect(columnSetUpdated.columnState.columns.some(column => column.columnKey === columnSet.columns[2].columnKey)).toBeFalsy();
        });

        it('test refreshColumnState when no updates', () => {
            component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            component.ngOnInit();

            const realWCI = component.widget?.getCombinedInputs;
            const realCI = component.inputs.get;

            component.widget.getCombinedInputs = jest.fn().mockReturnValue({get: jest.fn().mockReturnValue(undefined)});
            component.inputs.get = jest.fn().mockReturnValue(undefined);

            try {
                component['refreshColumnState'](component.widget);
                // confirm above call succeeded
                expect(true).toEqual(true);
            } finally {
                // cleanup
                component.widget.getCombinedInputs = realWCI;
                component.inputs.get = realCI;
            }
        });

        it('test onDoneClicked for bar chart', () => {
            component.widget = new Widget(WidgetConfigType.BAR);
            // const breakdown = new Breakdown();
            const changedBreakdown = new Breakdown();
            // children comparison
            const customSector1 = new CustomSector();
            customSector1.title = 'Custom Sector';
            changedBreakdown.text = 'Test';
            changedBreakdown.addChild(customSector1);
            component.widget.dataStore.metaData.inputs.set('breakdownTree', changedBreakdown);

            component.ngOnInit();
            component.inputs.set('breakdownTree', new Breakdown());

            component.onDoneClicked();

            expect(component.widget.displayInputs.get(ExpandedState.CONFIG_TYPE)).toBeFalsy();
        });

        it('test onDoneClicked for heat map chart', () => {
            component.widget = new Widget(WidgetConfigType.HEATMAP);
            // const breakdown = new Breakdown();
            const changedBreakdown = new Breakdown();
            // children comparison
            const customSector1 = new CustomSector();
            customSector1.title = 'Custom Sector';
            changedBreakdown.text = 'Test';
            changedBreakdown.addChild(customSector1);
            component.widget.dataStore.metaData.inputs.set('breakdownTree', changedBreakdown);

            component.ngOnInit();
            component.inputs.set('breakdownTree', new Breakdown());

            component.onDoneClicked();

            expect(component.widget.displayInputs.get(ExpandedState.CONFIG_TYPE)).toBeFalsy();
        });

        describe('isValid Test', () => {
            beforeAll(() => {
                const workpad = new FlatWorkpad();
                const port = new Portfolio('PEP');
                const report = new Report();
                workpad.addPortfolios(port);
                workpad.addReports(report);
                WorkspaceStore.currentWorkpad$ = new BehaviorSubject(workpad);
                WorkspaceStore.currentReport$ = new BehaviorSubject(report);
                WorkspaceStore.currentPortfolio$ = new BehaviorSubject(port);
            });

            beforeEach(() => {
                jest.spyOn(component['notificationService'], 'error');

                component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
                component.ngOnInit();
            });

            it('should test includeDateVaryAndColumnBreakdown - should return true when date vary and column level breakdown exist in different column', () => {
                const columnBreakdown = new ColumnBreakdown();
                columnBreakdown.initialize();
                const columnSector = new ColumnSector({columnTag: 'sec_group', columnName: 'Security Group', positionColumnType: 'ALL'});
                columnBreakdown.breakdown.addChild(columnSector);
                (component.inputs.get('columns') as ColumnSet).columns[2].optionValues.push(columnBreakdown);

                const esgColumn = new ColumnConfig({columnTag: 'eq_fin_th_ws_344'});
                esgColumn.optionValues.push(new OverrideDateColumnOption({dateType: OverrideDateConstants.DATE_VARY_TYPES.ANALYTIC[0]}));
                (component.inputs.get('columns') as ColumnSet).columns.push(esgColumn);

                expect(component.isValid()).toBeTruthy();
                expect(component['notificationService'].error).not.toBeCalled();
            });

            it('should test includeDateVaryAndColumnBreakdown - should return false when date vary and column level breakdown exist within a same column', () => {
                const esgColumn = new ColumnConfig({columnTag: 'eq_fin_th_ws_344'});
                esgColumn.optionValues.push(new OverrideDateColumnOption({dateType: OverrideDateConstants.DATE_VARY_TYPES.ANALYTIC[0]}));

                const columnBreakdown = new ColumnBreakdown();
                columnBreakdown.initialize();
                const columnSector = new ColumnSector({columnTag: 'sec_group', columnName: 'Security Group', positionColumnType: 'ALL'});
                columnBreakdown.breakdown.addChild(columnSector);

                esgColumn.optionValues.push(columnBreakdown);
                (component.inputs.get('columns') as ColumnSet).columns.push(esgColumn);

                expect(component.isValid()).toBeFalsy();
                expect(component['notificationService'].error).toBeCalledWith(WidgetSettingsModalComponent.DATE_VARY_COL_BREAKDOWN_ERROR_MESSAGE);
            });

            it('should test includeDateVaryAndColumnBreakdown - should return false when date vary and position aggregation exist within same widget', () => {
                const esgColumn = new ColumnConfig({columnTag: 'eq_fin_th_ws_344'});
                esgColumn.optionValues.push(new OverrideDateColumnOption({dateType: OverrideDateConstants.DATE_VARY_TYPES.ANALYTIC[0]}));
                (component.inputs.get('columns') as ColumnSet).columns.push(esgColumn);

                (component.inputs.get(RiskAndExposureAdditionalSettings.configType) as RiskAndExposureAdditionalSettings).closedPositionAggregationType = 'SINGLE_ROW';

                expect(component.isValid()).toBeFalsy();
                expect(component['notificationService'].error).toBeCalledWith(WidgetSettingsModalComponent.DATE_VARY_POSITION_AGGREGATION_ERROR_MESSAGE);
            });

            it('should test if any non numerical columns are present in pgs chart widget', () => {
                const colDef: ColumnDefinition = new ColumnDefinition({columnTag: 'portfolio', title: 'Portfolio', dataType: 'STRING'});
                const colDef2: ColumnDefinition = new ColumnDefinition({columnTag: 'nav_group_0', title: 'Portfolio', dataType: 'DOUBLE'});
                const colDef3: ColumnDefinition = new ColumnDefinition({columnTag: 'cusip', title: 'Portfolio', dataType: 'STRING'});
                jest.spyOn(CoreColumnUtils, 'getColumnDefByTag')
                    .mockImplementation((columnTag) => {
                        if (columnTag === 'portfolio') {return colDef; }
                        if (columnTag === 'nav_group_0') {return colDef2; }
                        if (columnTag === 'cusip') {return colDef3; }
                    });
                const nonNumericalColumn = new ColumnConfig({columnTag: 'portfolio'});
                const columns = [nonNumericalColumn];
                component.widget.configType = WidgetConfigType.PGS_BAR;
                component.inputs.set('columns', new ColumnSet({columns}));

                expect(component.isValid()).toBeFalsy();
                expect(component['notificationService'].error).toBeCalledWith(AlertConstants.NOTIFICATION.PGS_CHART_INVALID_COLUMNS);

                (component.inputs.get('columns') as ColumnSet).columns.push(new ColumnConfig({columnTag: 'nav_group_0'}));
                expect(component.isValid()).toBeTruthy();

                (component.inputs.get('columns') as ColumnSet).columns.push(new ColumnConfig({columnTag: 'cusip'}));
                expect(component.isValid()).toBeFalsy();
                expect(component['notificationService'].error).toBeCalledWith(AlertConstants.NOTIFICATION.PGS_CHART_INVALID_COLUMNS);
            });
        });

    });


    it('should init tabs', () => {
        component.widget = new Widget(WidgetConfigType.BAR);
        component.loadTabs();

        expect(component.inputCategories[0].categoryTitle).toBe('Measures');
    });

    it('should get current report and portfolio', () => {
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);

        component.ngOnInit();

        expect(component.portfolio.portName).toEqual('PEP');
        expect(component.report).toBeDefined();
    });

    it('should get settingsTitle and widgetNameTitle', () => {
        // test for tablular widget
        component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        component.ngOnInit();
        expect(component.isChartWidget).toBeFalsy();
        expect(component.widgetNameTitle).toEqual(WidgetConstants.WIDGET_NAME_TITLE);

        // test for chart widget
        component.widget = new Widget(WidgetConfigType.PIE);
        component.ngOnInit();
        expect(component.isChartWidget).toBeTruthy();
        expect(component.widgetNameTitle).toEqual(WidgetConstants.WIDGET_NAME_TITLE);
    });

    it('test onTabSelected', () => {
        const customEvent = {
            detail: {
                uid: '3'
            }
        };

        // @ts-ignore to mock event with detail 'index' since detail in CustomEvent is readonly property
        component.onTabSelected(customEvent);
        expect(component.activeTabIndex).toBe('3');
    });

    it('should not throw error if no inputCategories', () => {
        // Arrange - act
        component.widget = new Widget(WidgetConfigType.BAR);
        jest.spyOn(CoreWidgetConfigStore, 'getChartConfigForType').mockImplementationOnce(
            () =>
                ({
                    inputCategories: []
                } as WidgetConfig)
        );
        // Assert
        expect(() => {
            component.ngOnInit();
        }).not.toThrow();
    });

    it('Test new columns are added to the columnList on factor update in returns Analysis Widget', () => {
        component.widget = new Widget(WidgetConfigType.RETURNS);
        jest.spyOn(ReturnsUtilityService, 'getCurrentColumnList$').mockReturnValue(of(getColumnConfigDummyData()));
        component.ngOnInit();
        (component.inputs.get('performanceSettings') as PerformanceSettings).attributionSettings.cannedMethod = 'FIXED_INCOME_DX';
        (component.inputs.get('performanceSettings') as PerformanceSettings).attributionSettings.isColumnListUpdateEnabled = true;
        component.preUpdateWidget();

        // input cols are updated
        expect((component.inputs.get('columns') as ColumnSet).columns.length).toEqual(13);
    });

    it('Test when isColumnListUpdateEnabled is set to false, as attribution settings remains unchanged, should NOT ADD new columns', () => {
        component.widget = new Widget(WidgetConfigType.RETURNS);
        jest.spyOn(ReturnsUtilityService, 'getCurrentColumnList$').mockReturnValue(of(getColumnConfigDummyData()));
        component.ngOnInit();
        (component.inputs.get('performanceSettings') as PerformanceSettings).attributionSettings.cannedMethod = 'FIXED_INCOME_DX';
        (component.inputs.get('performanceSettings') as PerformanceSettings).attributionSettings.isColumnListUpdateEnabled = false;
        (component.inputs.get('columns') as ColumnSet).columns = (component.inputs.get('columns') as ColumnSet).columns.slice(0, 3);
        component.preUpdateWidget();
        expect((component.inputs.get('columns') as ColumnSet).columns.length).toEqual(3);
    });
    it('Test when temporaryAttributionColumns are present, as attribution settings remains unchanged, should NOT ADD new columns', () => {
        // reset data
        component.widget = new Widget(WidgetConfigType.RETURNS);
        jest.spyOn(ReturnsUtilityService, 'getCurrentColumnList$').mockReturnValue(of(getColumnConfigDummyData()));
        component.ngOnInit();
        (component.inputs.get('columns') as ColumnSet).columns = (component.inputs.get('columns') as ColumnSet).columns.slice(0, 3);
        component.preUpdateWidget();
        expect((component.inputs.get('columns') as ColumnSet).columns.length).toEqual(3);
    });

    it('Test update preview, , when attribution settings are changed but isColumnListUpdateEnabled is set to false in attribution settings so ColumnList remains unchanged', () => {
        component.widget = new Widget(WidgetConfigType.RETURNS);
        jest.spyOn(ReturnsUtilityService, 'getCurrentColumnList$').mockReturnValue(of(getColumnConfigDummyData()));
        component.ngOnInit();
        (component.inputs.get('performanceSettings') as PerformanceSettings).attributionSettings.cannedMethod = 'MULTI ASSET';
        (component.inputs.get('performanceSettings') as PerformanceSettings).attributionSettings.isColumnListUpdateEnabled = false;
        (component.inputs.get('columns') as ColumnSet).columns = (component.inputs.get('columns') as ColumnSet).columns.slice(0, 3);

        component.onDoneClicked();

        // ensure that columns are not updated and other settings changes are updated even when user clicks on cancel.
        expect((component.inputs.get('columns') as ColumnSet).columns.length).toEqual(3);
        expect((component.inputs.get('performanceSettings') as PerformanceSettings).attributionSettings.cannedMethod).toEqual(
            'MULTI ASSET'
        );
    });

    it('Test checkInputEligibility ', function () {
        component.widget = new Widget(WidgetConfigType.PRA);
        component.ngOnInit();
        let widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.PRA, 'columns');
        let showBreakdown = component.checkInputEligibility(widgetConfigInput);
        expect(showBreakdown).toBeTruthy();
        widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.PRA, CoreRiskConstants.CONFIG_TYPE.BREAKDOWN);
        showBreakdown = component.checkInputEligibility(widgetConfigInput);
        expect(showBreakdown).toBeFalsy();
        // Light look through
        widgetConfigInput = WidgetConfigFactory.getInputsForWidgetConfigByName(WidgetConfigType.RISK_EXPOSURE, LightLookthrough.configType);
        jest.spyOn(component as any, 'checkIfLightLookthroughCanBePerformed').mockReturnValue(true);
        expect(component.checkInputEligibility(widgetConfigInput)).toBeTruthy();
        jest.spyOn(component as any, 'checkIfLightLookthroughCanBePerformed').mockReturnValue(false);
        expect(component.checkInputEligibility(widgetConfigInput)).toBeFalsy();
        expect(component.inputs.get(LightLookthrough.configType)).toBeDefined();
        expect((component.inputs.get(LightLookthrough.configType) as LightLookthrough).isEnabled).toBeFalsy();
    });

    describe('widget preview tests', () => {
        it('should clone widget for preview', () => {
            const widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            component.widget = widget;

            component.ngOnInit();

            expect(component.previewWidget.configType).toEqual(widget.configType);
            expect(component.previewWidget.id).not.toEqual(widget.id);
        });

        it('should initialize showPreview flag with saved user preference', () => {
            UserMetaDataStore.setPreferenceValue(UserPreference.SHOW_WIDGET_PREVIEW, true.toString());
            component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);

            component.ngOnInit();

            expect(component.showPreview).toBe(false);
        });

        it('should show preview widget when toggled on', () => {
            UserMetaDataStore.setPreferenceValue(UserPreference.SHOW_WIDGET_PREVIEW, false.toString());
            component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            component.ngOnInit();

            const previewEvent = new CustomEvent<AuxToggleChangedDetailInterface>('toggleChanged', {
                detail: {
                    value: {checked: true},
                    uid: undefined,
                    srcEvent: undefined
                }
            });
            component.onShowPreviewToggle(previewEvent);
            expect(component.showPreview).toBe(true);
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement.querySelector('.widget-settings-modal-container')).toMatchSnapshot();
        });

        it('should hide preview when toggled off', () => {
            UserMetaDataStore.setPreferenceValue(UserPreference.SHOW_WIDGET_PREVIEW, true.toString());
            component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
            component.ngOnInit();

            const previewEvent = new CustomEvent<AuxToggleChangedDetailInterface>('toggleChanged', {
                detail: {
                    value: {checked: false},
                    uid: undefined,
                    srcEvent: undefined
                }
            });
            component.onShowPreviewToggle(previewEvent);
            expect(component.showPreview).toBe(false);
            fixture.detectChanges();
            expect(fixture.debugElement.nativeElement.querySelector('.widget-settings-modal-container')).toMatchSnapshot();
        });

        describe('Tests checkIfLightLookthroughCanBePerformed()', () => {
            it('widget not eligible for light lookthrough', () => {
                component.widget = new Widget(WidgetConfigType.EXPOST_TIME_SERIES);
                component.ngOnInit();
                expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
            });
            describe('widget eligible for light lookthrough', () => {
                let breakdownTree: Breakdown;
                let stackedBreakdownTree: Breakdown;
                let columnSectorLevel1;
                let columnSectorLevel2;
                beforeEach(() => {
                    breakdownTree = new Breakdown();
                    stackedBreakdownTree = new Breakdown();
                    columnSectorLevel1 = new ColumnSector();
                    columnSectorLevel2 = new ColumnSector();
                    component.widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
                    DefinitionsStore.fundCharacteristicBreakdown = ['ABCD'];
                    component.ngOnInit();
                });
                it('Inputs are undefined', () => {
                    component.inputs = undefined as any;
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
                });
                it('Both breakdownTree and stackedBreakdownTree are not empty', () => {
                    breakdownTree.children = [new ColumnSector()];
                    stackedBreakdownTree.children = [new ColumnSector()];
                    component.inputs.set(WidgetInputType.BREAKDOWN_TREE, breakdownTree);
                    component.inputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, stackedBreakdownTree);
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
                });
                it('Both breakdownTree and stackedBreakdownTree are empty', () => {
                    component.inputs.set(WidgetInputType.BREAKDOWN_TREE, breakdownTree);
                    component.inputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, stackedBreakdownTree);
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
                });
                it('Both breakdownTree and stackedBreakdownTree are undefined', () => {
                    component.inputs.set(WidgetInputType.BREAKDOWN_TREE, undefined);
                    component.inputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, undefined);
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
                });
                it('stackedBreakdownTree has an empty column sector', () => {
                    stackedBreakdownTree.children = [new ColumnSector()];
                    component.inputs.set(WidgetInputType.BREAKDOWN_TREE, undefined);
                    component.inputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, stackedBreakdownTree);
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
                });
                it('stackedBreakdownTree is undefined and breakdownTree has an empty column sector', () => {
                    breakdownTree.children = [new ColumnSector()];
                    component.inputs.set(WidgetInputType.BREAKDOWN_TREE, breakdownTree);
                    component.inputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, undefined);
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
                });
                it('breakdown has a column sector with non-GR tag', () => {
                    columnSectorLevel1 = new ColumnSector();
                    columnSectorLevel1.columnTag = 'sec_group';
                    breakdownTree.children = [columnSectorLevel1];
                    component.inputs.set(WidgetInputType.BREAKDOWN_TREE, breakdownTree);
                    component.inputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, undefined);
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
                });
                it('Breakdown has column sectors (l1 & l2) with GR & non-GR Sector tags respectively', () => {
                    columnSectorLevel1.columnTag = 'grsector`ABCD';
                    columnSectorLevel2.columnTag = 'ABCD';
                    columnSectorLevel1.children = [columnSectorLevel2];
                    breakdownTree.children = [columnSectorLevel1];
                    component.inputs.set(WidgetInputType.BREAKDOWN_TREE, breakdownTree);
                    component.inputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, undefined);
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
                });
                it('Breakdown has column sectors (l1 & l2) with different GR Sector tags', () => {
                    columnSectorLevel1.columnTag = 'grsector`ABCD';
                    columnSectorLevel2.columnTag = 'grsector`CDEF';
                    columnSectorLevel1.children = [columnSectorLevel2];
                    breakdownTree.children = [columnSectorLevel1];
                    component.inputs.set(WidgetInputType.BREAKDOWN_TREE, breakdownTree);
                    component.inputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, undefined);
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
                });
                it('Breakdown has column sectors (l1 & l2) with same GR Sector tags', () => {
                    columnSectorLevel1.columnTag = 'grsector`ABCD';
                    columnSectorLevel2.columnTag = 'grsector`ABCD`2';
                    columnSectorLevel1.children = [columnSectorLevel2];
                    breakdownTree.children = [columnSectorLevel1];
                    component.inputs.set(WidgetInputType.BREAKDOWN_TREE, breakdownTree);
                    component.inputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, undefined);
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeTruthy();
                });
                it('DefinitionsStore.fundCharacteristicBreakdown check', () => {
                    columnSectorLevel1.columnTag = 'grsector`ABCD';
                    columnSectorLevel2.columnTag = 'grsector`ABCD`2';
                    columnSectorLevel1.children = [columnSectorLevel2];
                    breakdownTree.children = [columnSectorLevel1];
                    component.inputs.set(WidgetInputType.BREAKDOWN_TREE, breakdownTree);
                    component.inputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, undefined);
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeTruthy();
                    DefinitionsStore.fundCharacteristicBreakdown = undefined;
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
                    DefinitionsStore.fundCharacteristicBreakdown = ['XYZ'];
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
                });
                it('Column related checks', () => {
                    columnSectorLevel1.columnTag = 'grsector`ABCD';
                    columnSectorLevel2.columnTag = 'grsector`ABCD`2';
                    columnSectorLevel1.children = [columnSectorLevel2];
                    breakdownTree.children = [columnSectorLevel1];
                    component.inputs.set(WidgetInputType.BREAKDOWN_TREE, breakdownTree);
                    component.inputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, undefined);
                    const columnSet = component.inputs.get(WidgetInputType.COLUMNS) as ColumnSet;
                    const columns = columnSet.columns;
                    // removing columns
                    columnSet.columns = [];
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
                    // removing columnset input
                    component.inputs.set(WidgetInputType.COLUMNS, undefined);
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
                    columnSet.columns = columns;
                    component.inputs.set(WidgetInputType.COLUMNS, columnSet);
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeTruthy();
                    // At least one of the mandatory columns must be present for light look-through
                    // Removed % Market Value column
                    columnSet.columns = columnSet.columns.filter(column => column && column.columnTag !== 'pct_mv');
                    expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
                });
            });
        });

        it('should not throw NPE with trackStyleColumnsTelemetry when there is no column set', function () {
            let error = null;
            component.inputs = new Map();
            try {
                component.trackStyleColumnsTelemetry();
            } catch (e) {
                error = e;
            }
            expect(error).toBeNull();
        });

        // it('Tests checkIfLightLookthroughCanBePerformed()', () => {
        //     // Initialize fundCharacteristicBreakdowns
        //     DefinitionsStore.fundCharacteristicBreakdown = ['ABCD'];
        //     component.widget = new Widget(WidgetConfigType.EXPOST_TIME_SERIES);
        //     component.ngOnInit();
        //
        //     // Widget not eligible for light look-through as it is not one of eligible widgets
        //     expect(component['checkIfLightLookthroughCanBePerformed']()).toBeFalsy();
        //
        //     // Widget is eligible for light look-through = R&E widget
        //     ctrl = new createWidgetSettingsController2();
        //     ctrl.inputs.breakdownTree = new Breakdown();
        //     expect(ctrl.checkIfLightLookthroughCanBePerformed()).toBeFalsy();
        //     expect(ctrl.inputs.isLightLookthroughEnabled).toBeFalsy();
        //
        //     // Breakdown has an empty column sector
        //     ctrl.inputs.breakdownTree.children.push(new ColumnSector());
        //     expect(ctrl.checkIfLightLookthroughCanBePerformed()).toBeFalsy();
        //     expect(ctrl.inputs.isLightLookthroughEnabled).toBeFalsy();
        //
        //     // Breakdown has a column sector with non-GR tag
        //     ctrl.inputs.breakdownTree.children[0].columnTag = 'ABCD';
        //     expect(ctrl.checkIfLightLookthroughCanBePerformed()).toBeFalsy();
        //     expect(ctrl.inputs.isLightLookthroughEnabled).toBeFalsy();
        //
        //     // Breakdown has column sectors (l1 & l2) with GR & non-GR Sector tags respectively
        //     ctrl.inputs.breakdownTree.children[0].columnTag = 'grsector`ABCD';
        //     ctrl.inputs.breakdownTree.children[0].children = [];
        //     ctrl.inputs.breakdownTree.children[0].children.push(new ColumnSector());
        //     ctrl.inputs.breakdownTree.children[0].children[0].columnTag = 'CDEF';
        //     expect(ctrl.checkIfLightLookthroughCanBePerformed()).toBeFalsy();
        //     expect(ctrl.inputs.isLightLookthroughEnabled).toBeFalsy();
        //
        //     // Breakdown has column sectors (l1 & l2) with different GR Sector tags
        //     ctrl.inputs.breakdownTree.children[0].children[0].columnTag = 'grsector`CDEF';
        //     expect(ctrl.checkIfLightLookthroughCanBePerformed()).toBeFalsy();
        //     expect(ctrl.inputs.isLightLookthroughEnabled).toBeFalsy();
        //
        //     // Breakdown has column sectors (l1 & l2) with same GR Sector tags
        //     ctrl.inputs.breakdownTree.children[0].children[0].columnTag = 'grsector`ABCD`2';
        //     expect(ctrl.checkIfLightLookthroughCanBePerformed()).toBeTruthy();
        //
        //     // Widget has an empty stacked breakdown
        //     ctrl.inputs.stackedBreakdownTree = new Breakdown();
        //     expect(ctrl.checkIfLightLookthroughCanBePerformed()).toBeTruthy();
        //
        //     // Removed % Market Value column
        //     ctrl.inputs.columns.columns = ctrl.inputs.columns.columns.filter(column => column && column.columnTag !== 'pct_mv');
        //     expect(ctrl.checkIfLightLookthroughCanBePerformed()).toBeFalsy();
        //     expect(ctrl.inputs.isLightLookthroughEnabled).toBeFalsy();
        //
        //     // Widget has a non-empty stacked breakdown
        //     ctrl.inputs.stackedBreakdownTree.children.push(new ColumnSector());
        //     expect(ctrl.checkIfLightLookthroughCanBePerformed()).toBeFalsy();
        //     expect(ctrl.inputs.isLightLookthroughEnabled).toBeFalsy();
        //
        //     // Widget has empty sector & stacked breakdowns
        //     ctrl.inputs.stackedBreakdownTree = new Breakdown();
        //     ctrl.inputs.breakdownTree = new Breakdown();
        //     expect(ctrl.checkIfLightLookthroughCanBePerformed()).toBeFalsy();
        //     expect(ctrl.inputs.isLightLookthroughEnabled).toBeFalsy();
        // });
        //
        // it('Tests(2) checkIfLightLookthroughCanBePerformed() - Tests with ColumnService.fundCharacteristicBreakdowns', function () {
        //     // Initialize fundCharacteristicBreakdowns
        //     ColumnService.fundCharacteristicBreakdowns = undefined;
        //
        //     // Returns widget
        //     let ctrl: WidgetSettingsController = new createWidgetSettingsController2();
        //     ctrl.inputs.breakdownTree = new Breakdown();
        //     ctrl.inputs.breakdownTree.children.push(new ColumnSector());
        //     ctrl.inputs.breakdownTree.children[0].columnTag = 'grsector`ABCD`2';
        //     expect(ctrl.checkIfLightLookthroughCanBePerformed()).toBeFalsy();
        //
        //     ColumnService.fundCharacteristicBreakdowns = [];
        //     expect(ctrl.checkIfLightLookthroughCanBePerformed()).toBeFalsy();
        //
        //     ColumnService.fundCharacteristicBreakdowns.push('CDD');
        //     expect(ctrl.checkIfLightLookthroughCanBePerformed()).toBeFalsy();
        //
        //     ColumnService.fundCharacteristicBreakdowns.push('ABCD');
        //     expect(ctrl.checkIfLightLookthroughCanBePerformed()).toBeTruthy();
        // });
    });

    it('test trackFactorDataRequestTelemetry - Time Series', () => {
        const inputs = new Map();

        const factorChartSettings = new FactorDataChartSettings();
        factorChartSettings.isTimeSeriesMode = true;
        factorChartSettings.factorTimeSeriesSelectedOption = FactorTimeSeriesSelectedOption.FACTOR_LEVELS;

        inputs.set(FactorDataChartSettings.configType, factorChartSettings);
        inputs.set(ColumnType.COLUMNS, new ColumnSet());
        inputs.set(ShowAsChartInput.configType, new ShowAsChartInput({ showAsChart: true }));
        inputs.set(CoreRiskConstants.RISK_SETTINGS, new RiskSettings());
        inputs.set(TimeSeriesSettings.INPUT_CONFIG_NAME, new TimeSeriesSettings());

        component.widget = new Widget(WidgetConfigType.FACTOR_DATA);
        component.widget.dataStore.metaData.inputs = inputs;

        let error = null;
        try {
            component['trackFactorDataRequestTelemetry']();
        } catch (e) {
            error = e;
        }
        expect(error).toBeNull();
    });


    it('test trackFactorDataRequestTelemetry - Risk Matrix', () => {
        const inputs = new Map();

        const factorChartSettings = new FactorDataChartSettings();
        factorChartSettings.isTimeSeriesMode = false;
        factorChartSettings.factorTimeSeriesSelectedOption = FactorTimeSeriesSelectedOption.CORRELATIONS;

        inputs.set(FactorDataChartSettings.configType, factorChartSettings);
        inputs.set(ColumnType.COLUMNS, new ColumnSet());
        inputs.set(FactorDataHighlightSettings.configType, new FactorDataHighlightSettings());
        inputs.set(CoreRiskConstants.RISK_SETTINGS, new RiskSettings());
        inputs.set(FactorDataRiskMatrixSettings.configType, new FactorDataRiskMatrixSettings());

        component.widget = new Widget(WidgetConfigType.FACTOR_DATA);
        component.widget.dataStore.metaData.inputs = inputs;

        let error = null;
        try {
            component['trackFactorDataRequestTelemetry']();
        } catch (e) {
            error = e;
        }
        expect(error).toBeNull();
    });


    it('resetChartTypesInComboChartSettingsIfStackedBreakdownIsNotEmpty', () => {
        const widget = new Widget(WidgetConfigType.BAR);
        const breakdown = new Breakdown();
        breakdown.text = 'Test';
        breakdown.addChild(new CustomSector());
        widget.dataStore.metaData.inputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, breakdown);
        const comboChartSettings: ComboChartColumnSettings = new ComboChartColumnSettings({columns: [new ComboChartColumn({chartType: ColumnSeriesChartType.LINE})]});
        widget.displayInputs.set(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS, comboChartSettings);
        component.resetChartTypesInComboChartSettingsIfStackedBreakdownIsNotEmpty(widget);
        expect(comboChartSettings.columns[0].chartType).toEqual(ColumnSeriesChartType.BAR);

        // when stack breakdown is empty
        comboChartSettings.columns[0].chartType = ColumnSeriesChartType.LINE;
        breakdown.children = [];
        component.resetChartTypesInComboChartSettingsIfStackedBreakdownIsNotEmpty(widget);
        expect(comboChartSettings.columns[0].chartType).toEqual(ColumnSeriesChartType.LINE);
        // when stack breadkown is undefined
        widget.dataStore.metaData.inputs.delete(WidgetInputType.STACKED_BREAKDOWN_TREE);
        component.resetChartTypesInComboChartSettingsIfStackedBreakdownIsNotEmpty(widget);
        expect(comboChartSettings.columns[0].chartType).toEqual(ColumnSeriesChartType.LINE);
    });

    // write test for method checkIfStackBreakdownAndComboChartSettingsMismatch
    it('checkIfStackBreakdownAndComboChartSettingsMismatch', () => {
        component.widget = new Widget(WidgetConfigType.BAR);
        const breakdown = new Breakdown();
        breakdown.text = 'Test';
        breakdown.addChild(new CustomSector());
        component.inputs = new Map<string, WidgetInput>();
        component.inputs.set(WidgetInputType.STACKED_BREAKDOWN_TREE, breakdown);
        const comboChartSettings = new ComboChartColumnSettings({columns: [new ComboChartColumn({chartType: ColumnSeriesChartType.LINE})]});
        component.inputs.set(ChartWidgetInputConfigType.COMBO_CHART_COLUMN_SETTINGS, comboChartSettings);
        expect(component.checkIfStackBreakdownAndComboChartSettingsMismatch()).toBeTruthy();
        // when stack breakdown is empty
        comboChartSettings.columns[0].chartType = ColumnSeriesChartType.BAR;
        breakdown.children = [];
        expect(component.checkIfStackBreakdownAndComboChartSettingsMismatch()).toBeFalsy();
        // when stack breadkown is undefined
        component.inputs.delete(WidgetInputType.STACKED_BREAKDOWN_TREE);
        expect(component.checkIfStackBreakdownAndComboChartSettingsMismatch()).toBeFalsy();
    });

    it('should copy widet customVizConfig to previewWidget', () => {
        const widget = new Widget(WidgetConfigType.PGS_TS);
        widget.dataStore.data = {
            customVizConfig: {
                queryKeys: ['portfolio']
            }
        };
        component.widget = widget;
        component.ngOnInit();
        expect(component.previewWidget.dataStore.data.customVizConfig).toEqual(widget.dataStore.data.customVizConfig);
    });

});

function getColumnConfigDummyData() {
    const performanceSettingsTemporaryColumns: ColumnConfig[] = [];

    const config1 = new ColumnConfig();
    config1.columnTag = 'active_rf_contr';
    config1.columnKey = 'active_rf_contr_1563188651073';
    config1.positionColumnType = 'ACTIVE';
    config1.title = 'Active Risk Free Contribution';
    performanceSettingsTemporaryColumns.push(config1);

    const config2 = new ColumnConfig();
    config2.columnTag = 'active_rldn_contr';
    config2.columnKey = 'active_rldn_contr_1563188651074';
    config2.positionColumnType = 'ACTIVE';
    config2.title = 'Active Rolldown Contribution';
    performanceSettingsTemporaryColumns.push(config2);

    const config3 = new ColumnConfig();
    config3.columnTag = 'active_dur_contr';
    config3.columnKey = 'active_dur_contr_1563188651075';
    config3.positionColumnType = 'ACTIVE';
    config3.title = 'Active Duration Contribution';
    performanceSettingsTemporaryColumns.push(config3);

    return performanceSettingsTemporaryColumns;
}
