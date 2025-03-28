import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';
import { MultiPortfolioAnalysisSelectMenuComponent } from './multi-portfolio-analysis-select-menu.component';
import { PortfolioService } from '@services/portfolio';
import { TestUtils } from '@utils/test.utils';
import { WorkspaceStore } from '@stores/workspace.store';
import { ReportGroup } from '@models/workspace/report-group.model';
import { Report } from '@models/workspace/report.model';
import { Portfolio } from '@models/portfolio/portfolio.model';
import { ExploreCheckbox, ExploreSelectOption, ExploreSelectOptionGroup } from '@blk/explore-ui-core';
import { ComparisonConfig } from '@models/config/comparison-config.model';
import { AppStore } from '../../../../app.store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import {AuxSelectOption, AuxSelectSelectionChangedDetailInterface} from '@blk/aladdin-angular-components';

describe('SelectGroupModalPortfolioMenuComponent', () => {
    let component: MultiPortfolioAnalysisSelectMenuComponent;
    let fixture: ComponentFixture<MultiPortfolioAnalysisSelectMenuComponent>;
    let reportGroup: ReportGroup;
    let port1: Portfolio;
    let port2: Portfolio;

    const portfolioServiceStub = {
        fetchPortfolioInformation$: jest.fn(() => of())
    };

    beforeAll((done) => {
        TestUtils.initialize(done);
        WorkspaceStore.init();
        const comparisonConfigMap: Map<number, ComparisonConfig> = new Map<number, ComparisonConfig>();
        const comparisonConfig: ComparisonConfig = new ComparisonConfig();
        comparisonConfig.portComparisonList = ['PEP12345', 'CORE-HQ54321'];
        comparisonConfig.portAnchorId = 'PEP12345';
        comparisonConfigMap.set(1, comparisonConfig);
        WorkspaceStore.currentReport$ = new BehaviorSubject<Report>(new Report());
        reportGroup = new ReportGroup();
        port1 = new Portfolio('PEP');
        port2 = new Portfolio('CORE-HQ');
        reportGroup.portfolios = [port1, port2];
        reportGroup.reports = [new Report('Report 1'), new Report('Report 2')];
        reportGroup.comparisonConfigMap = comparisonConfigMap;

        WorkspaceStore.currentWorkpad$ = new BehaviorSubject<ReportGroup>(reportGroup);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [MultiPortfolioAnalysisSelectMenuComponent],
            imports: [HttpClientTestingModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                { provide: PortfolioService, useValue: portfolioServiceStub },
                AppStore
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(MultiPortfolioAnalysisSelectMenuComponent);
        component = fixture.componentInstance;
    });

    describe('when dropdown is enabled', () => {
        beforeEach(() => {
            // Mock the input properties

            component.reportGroups = [reportGroup];
            component.selectedReportGroup = reportGroup;

            component.ngOnInit();
            fixture.detectChanges();
        });

        it('should create component', () => {
            expect(component).toBeTruthy();
            expect(component.isComparisonListEmpty$.getValue()).toBeTruthy();
        });

        it('should initialize isReportSelected to false', () => {
            expect(component.isReportSelected).toBeFalsy();
        });

        it('should set isReportSelected to false in ngOnInit', () => {
            component.ngOnInit();
            expect(component.isReportSelected).toBeFalsy();
        });


        describe('setSelectedReportGroupValue', () => {
            let event: CustomEvent<AuxSelectSelectionChangedDetailInterface>;

            beforeEach(() => {
                event = new CustomEvent('selectionChanged', {
                    detail: {
                        value: { value: '1'} as AuxSelectOption
                    }
                });
                component.reportGroupOptions = [
                    {
                        values: [
                            { value: '1', isSelected: false },
                            { value: '2', isSelected: false }
                        ]
                    }
                ];
            });

            it('should update selected item and set selectedReportGroup when workspace and workpads are defined', () => {
                const workspace = {
                    workpads: [
                        { id: '1', reports: [{ title: 'Report 1', comparisonConfigId: '1', id: '1', key: 'key1' }], portfolios: [] } as ReportGroup,
                        { id: '2', reports: [], portfolios: [] } as ReportGroup
                    ]
                };
                jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(workspace);
                jest.spyOn(component, 'populateReportOptions');
                jest.spyOn(component, 'constructComparisonStackedData');

                component.setSelectedReportGroupValue(event);

                expect(component.reportGroupOptions[0].values[0].isSelected).toBeTruthy();
                expect(component.selectedReportGroup).toEqual(workspace.workpads[0]);
                expect(component.populateReportOptions).toHaveBeenCalled();
                expect(component.constructComparisonStackedData).toHaveBeenCalled();
                expect(component.isGroupSelected).toBeTruthy();
                expect(component.isReportSelected).toBeFalsy();
            });


        });


        describe('setSelectedReportValue', () => {
            let event: CustomEvent<AuxSelectSelectionChangedDetailInterface>;
            beforeEach(() => {
                event = new CustomEvent('selectionChanged', {
                    detail: {
                        value: { value: {
                                comparisonConfigId: '1',
                                reportKey: 'key1'
                            }} as AuxSelectOption
                    }
                });
                component.reportOptions = [
                    {
                        values: [
                            { value: {
                                    comparisonConfigId: '1',
                                    reportKey: 'key1'
                                }, isSelected: false },
                            { value: {
                                    comparisonConfigId: '1',
                                    reportKey: 'key1'
                                }, isSelected: false }
                        ]
                    }
                ];
            });


            it('should update selected report and set isReportSelected to true', () => {
                jest.spyOn(component, 'constructAnchorOptions');
                jest.spyOn(component, 'updateComparisonStackedData');
                // Mock the return value of the find method
                jest.spyOn(component.selectedReportGroup.reports, 'find').mockReturnValue({
                    key: 'key1',
                    comparisonConfigId: '1'
                });

                component.setSelectedReportValue(event);

                expect(component.reportOptions[0].values[0].isSelected).toBeTruthy();
                expect(component.reportOptions[0].values[1].isSelected).toBeTruthy();
                expect(component.constructAnchorOptions).toHaveBeenCalled();
                expect(component.updateComparisonStackedData).toHaveBeenCalledWith('1');
                expect(component.isReportSelected).toBeTruthy();
            });

        });

        describe('updateComparisonStackedData Test', () => {
            let selectedValue: number;

            beforeEach(() => {
                selectedValue = 1;
                component.selectedReportGroup = {
                    portfolios: [
                        { portId: '1', title: 'Portfolio 1' },
                        { portId: '2', title: 'Portfolio 2' }
                    ],
                    reports: [
                        { title: 'Report 1', comparisonConfigId: 1, id: '1', key: 'key1' },
                        { title: 'Report 2', comparisonConfigId: 2, id: '2', key: 'key2' }
                    ],
                    comparisonConfigMap: new Map<number, any>([
                        [1, { config: 'config1', portComparisonList: ['1'] }],
                        [2, { config: 'config2', portComparisonList: ['2'] }]
                    ])
                } as ReportGroup;
            });

            it('should update comparisonConfig when reportKey is found in comparisonConfigMap', () => {
                const oldComparisonConfig = { config: 'oldConfig', portComparisonList: [] };
                component.comparisonConfig = oldComparisonConfig;
                jest.spyOn(component, 'updateComparisonStackedDataFromPortfolios');
                jest.spyOn(component, 'updateAnchorOptions');

                component.updateComparisonStackedData(selectedValue);

                expect(component.comparisonConfig).toEqual({ config: 'config1', portComparisonList: ['1'] });
                expect(component.updateComparisonStackedDataFromPortfolios).toHaveBeenCalled();
                expect(component.updateAnchorOptions).toHaveBeenCalledWith(selectedValue);
            });

            it('should retain old comparisonConfig when reportKey is not found in comparisonConfigMap', () => {
                const oldComparisonConfig = { config: 'oldConfig', portComparisonList: [] };
                component.comparisonConfig = oldComparisonConfig;
                component.selectedReportGroup.comparisonConfigMap.delete(1);
                jest.spyOn(component, 'updateComparisonStackedDataFromPortfolios');
                jest.spyOn(component, 'updateAnchorOptions');

                component.updateComparisonStackedData(selectedValue);

                expect(component.comparisonConfig).toEqual(oldComparisonConfig);
                expect(component.updateComparisonStackedDataFromPortfolios).toHaveBeenCalled();
                expect(component.updateAnchorOptions).toHaveBeenCalledWith(selectedValue);
            });
        });


        describe('updateAnchorEnableState Test', () => {
            it('should update anchor enable state correctly', () => {
                component.comparisonStackedData = [
                    new ExploreCheckbox('Portfolio 1', true, false),
                    new ExploreCheckbox('Portfolio 2', false, false)
                ];
                component.updateAnchorEnableState();
                expect(component.isComparisonListEmpty$.getValue()).toBeFalsy();

                component.comparisonStackedData[0].checked = false;
                component.updateAnchorEnableState();
                expect(component.isComparisonListEmpty$.getValue()).toBeTruthy();
            });
        });

        describe('onCheckboxGroupChanged Test', () => {
            it('should update anchor options when checkbox group changes', () => {
                jest.spyOn(component, 'updateAnchorEnableState');
                jest.spyOn(component, 'constructAnchorOptions');

                component.onCheckboxGroupChanged();

                expect(component.updateAnchorEnableState).toHaveBeenCalled();
                expect(component.constructAnchorOptions).toHaveBeenCalled();
            });
        });

        describe('setSelectedAnchorValue Test', () => {
            it('should update selected anchor value', () => {
                component.anchorOptions = [new ExploreSelectOptionGroup([
                    new ExploreSelectOption('None', 'None', false),
                    new ExploreSelectOption('Portfolio 1', '1', true),
                    new ExploreSelectOption('Portfolio 2', '2', false)
                ])];

                const event = new CustomEvent('change', {
                    detail: { value: { value: '2' } }
                });

                component.setSelectedAnchorValue(event);

                expect(component.anchorOptions[0].values[1].isSelected).toBeFalsy();
                expect(component.anchorOptions[0].values[2].isSelected).toBeTruthy();
            });
        });



        describe('populateReportOptions Test', () => {
            it('should populate report options correctly', () => {
                component.selectedReportGroup = reportGroup;
                component.selectedReportGroup.reports = [
                    { title: 'Report 1', comparisonConfigId: '1', id: '1', key: 'key1' }
                ];

                component.populateReportOptions();

                expect(component.reportOptions[0].values.length).toBe(1);
                expect(component.reportOptions[0].values[0].value.comparisonConfigId).toBe('1');
            });
        });

        describe('cancelCompareChange Test', () => {
            it('should cancel comparison changes and close modal', () => {
                jest.spyOn(component, 'closeModal');

                component.cancelCompareChange();

                expect(component.closeModal).toHaveBeenCalled();
            });
        });


        describe('closeSelectGroupModalPortfolioMenuModal Test', () => {
            it('should close the modal', () => {
                component.isOpen = true;
                component.closeSelectGroupModalPortfolioMenuModal();
                expect(component.isOpen).toBeFalsy();
            });
        });

        describe('isAddPortfolioModalOpen Tests', () => {
            it('should set isAddPortfolioModalOpen to true', () => {
                component.isAddPortfolioModalOpen = true;
                expect(component.isAddPortfolioModalOpen).toBe(true);
            });

            it('should set isAddPortfolioModalOpen to undefined if value is undefined', () => {
                component.isAddPortfolioModalOpen = undefined;
                expect(component.isAddPortfolioModalOpen).toBe(undefined);
            });

            it('should get isAddPortfolioModalOpen value', () => {
                component.isAddPortfolioModalOpen = true;
                expect(component.isAddPortfolioModalOpen).toBe(true);
                component.isAddPortfolioModalOpen = false;
                expect(component.isAddPortfolioModalOpen).toBe(false);
            });
        });

        describe('WorkspaceStore.getWorkspace() Coverage', () => {
            beforeEach(() => {
                // Mock the workspace with a report group
                const workspace = {
                    workpads: [reportGroup]
                };
                jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(workspace);
            });

            it('should populate anchor options correctly', () => {
                component.reportGroupOptions = [new ExploreSelectOptionGroup([
                    new ExploreSelectOption('Group 1', '1', false),
                    new ExploreSelectOption('Group 2', '2', true)
                ])];

                component.constructAnchorOptions();

                expect(component.anchorOptions[0].values.length).toBeGreaterThan(0);
            });




            it('should apply modal correctly', () => {
                component.selectedReportGroup = reportGroup;
                component.selectedReportGroup.reports = [
                    { title: 'Report 1', comparisonConfigId: '1', id: '1', key: 'key1' }
                ];

                component.reportGroupOptions = [new ExploreSelectOptionGroup([
                    new ExploreSelectOption('Group 1', '1', false),
                    new ExploreSelectOption('Group 2', '2', true)
                ])];

                component.reportOptions = [new ExploreSelectOptionGroup([
                    new ExploreSelectOption('Report 1', { comparisonConfigId: '1', reportId: '1', reportKey: 'key1' }, true)
                ])];


                // Mock comparisonStackedData to have checked items
                component.comparisonStackedData = [
                    new ExploreCheckbox('Portfolio 1', true, false, '1'),
                    new ExploreCheckbox('Portfolio 2', false, false, '2')
                ];

                const event = new CustomEvent('apply');
                jest.spyOn(component, 'closeModal');

                component.applyModal(event);

                expect(component.comparisonConfig.portComparisonList.length).toBeGreaterThan(0);
            });

        });

        it('should handle report group and selected report correctly in applyModal', () => {
            component.reportGroupOptions = [new ExploreSelectOptionGroup([
                new ExploreSelectOption('Group 1', '1', false),
                new ExploreSelectOption('Group 2', '2', true)
            ])];

            component.reportOptions = [new ExploreSelectOptionGroup([
                new ExploreSelectOption('Report 1', { comparisonConfigId: '1', reportId: '1', reportKey: 'key1' }, true)
            ])];

            component.reportGroup = reportGroup;
            component.reportGroup.reports = [
                { comparisonConfigId: '1', id: '1', key: 'key1' }
            ];
            component.reportGroup.comparisonConfigMap.set('1', new ComparisonConfig());

            // Mock comparisonStackedData to have checked items
            component.comparisonStackedData = [
                new ExploreCheckbox('Portfolio 1', true, false, '1'),
                new ExploreCheckbox('Portfolio 2', false, false, '2')
            ];

            const event = new CustomEvent('apply');
            jest.spyOn(component, 'closeModal');

            component.applyModal(event);

            expect(component.comparisonConfig.portComparisonList.length).toBeGreaterThan(0);
        });

        describe('constructAnchorOptions Test', () => {
            it('should construct anchor options correctly when selectedReportGroup is defined', () => {
                component.selectedReportGroup = reportGroup;
                component.comparisonStackedData = [
                    new ExploreCheckbox('Portfolio 1', true, false, '1'),
                    new ExploreCheckbox('Portfolio 2', false, false, '2')
                ];

                component.constructAnchorOptions();

                expect(component.anchorOptions[0].values.length).toBe(1);
            });

            it('should construct anchor options correctly when selectedReportGroup is undefined', () => {
                component.selectedReportGroup = undefined;

                component.constructAnchorOptions();

                expect(component.anchorOptions[0].values.length).toBe(1);
                expect(component.anchorOptions[0].values[0].value).toBe(component.NONE_ANCHOR_OPTION_LABEL);
            });
        });






        describe('Helper Functions Coverage', () => {
            it('should update comparison config for anchor options', () => {
                const reportGroup = new ReportGroup();
                reportGroup.reports = [
                    { comparisonConfigId: '1', id: '1', key: 'key1' }
                ];
                reportGroup.comparisonConfigMap = new Map();
                reportGroup.comparisonConfigMap.set('1', new ComparisonConfig());

                component.comparisonConfig = new ComparisonConfig();
                component.updateComparisonConfigforAnchorOptions(reportGroup, 1);

                expect(component.comparisonConfig).toStrictEqual(reportGroup.comparisonConfigMap.get('1'));
            });

            it('should add checked portfolios to anchor options', () => {
                const reportGroup = new ReportGroup();
                reportGroup.portfolios = [
                    { portId: 'PEP', portName: 'Portfolio 1' },
                    { portId: 'CORE-HQ', portName: 'Portfolio 2' }
                ];

                component.comparisonStackedData = [
                    new ExploreCheckbox('Portfolio 1', true, false, 'PEP'),
                    new ExploreCheckbox('Portfolio 2', false, false, 'CORE-HQ')
                ];

                component.anchorOptions = [new ExploreSelectOptionGroup()];
                component.comparisonConfig = new ComparisonConfig();
                component.comparisonConfig.portAnchorId = 'PEP';
                component.constructAnchorOptions();
                component.addCheckedPortfoliosToAnchorOptions(reportGroup);

                expect(component.anchorOptions[0].values.length).toBe(2);
                expect(component.anchorOptions[0].values[0].value).toBe('None');
            });


        });
    });

    describe('when dropdown is not enabled', () => {
        beforeEach(() => {
            // Mock the input properties
            component.reportGroups = [];
            component.selectedReportGroup = reportGroup;

            component.ngOnInit();
            fixture.detectChanges();
        });

        it('should create component', () => {
            expect(component).toBeTruthy();
            expect(component.isComparisonListEmpty$.getValue()).toBeTruthy();
        });



        describe('updateAnchorEnableState Test', () => {
            it('should update anchor enable state correctly', () => {
                component.comparisonStackedData = [
                    new ExploreCheckbox('Portfolio 1', true, false),
                    new ExploreCheckbox('Portfolio 2', false, false)
                ];
                component.updateAnchorEnableState();
                expect(component.isComparisonListEmpty$.getValue()).toBeFalsy();

                component.comparisonStackedData[0].checked = false;
                component.updateAnchorEnableState();
                expect(component.isComparisonListEmpty$.getValue()).toBeTruthy();
            });
        });

        describe('onCheckboxGroupChanged Test', () => {
            it('should update anchor options when checkbox group changes', () => {
                jest.spyOn(component, 'updateAnchorEnableState');
                jest.spyOn(component, 'constructAnchorOptions');

                component.onCheckboxGroupChanged();

                expect(component.updateAnchorEnableState).toHaveBeenCalled();
                expect(component.constructAnchorOptions).toHaveBeenCalled();
            });
        });

        describe('setSelectedAnchorValue Test', () => {
            it('should update selected anchor value', () => {
                component.anchorOptions = [new ExploreSelectOptionGroup([
                    new ExploreSelectOption('None', 'None', false),
                    new ExploreSelectOption('Portfolio 1', '1', true),
                    new ExploreSelectOption('Portfolio 2', '2', false)
                ])];

                const event = new CustomEvent('change', {
                    detail: { value: { value: '2' } }
                });

                component.setSelectedAnchorValue(event);

                expect(component.anchorOptions[0].values[1].isSelected).toBeFalsy();
                expect(component.anchorOptions[0].values[2].isSelected).toBeTruthy();
            });
        });



        describe('populateReportOptions Test', () => {
            it('should populate report options correctly', () => {
                component.selectedReportGroup = reportGroup;
                component.selectedReportGroup.reports = [
                    { title: 'Report 1', comparisonConfigId: '1', id: '1', key: 'key1' }
                ];

                component.populateReportOptions();

                expect(component.reportOptions[0].values.length).toBe(1);
                expect(component.reportOptions[0].values[0].value.comparisonConfigId).toBe('1');
            });
        });

        describe('cancelCompareChange Test', () => {
            it('should cancel comparison changes and close modal', () => {
                jest.spyOn(component, 'closeModal');

                component.cancelCompareChange();

                expect(component.closeModal).toHaveBeenCalled();
            });
        });


        describe('closeSelectGroupModalPortfolioMenuModal Test', () => {
            it('should close the modal', () => {
                component.isOpen = true;
                component.closeSelectGroupModalPortfolioMenuModal();
                expect(component.isOpen).toBeFalsy();
            });
        });

        describe('isAddPortfolioModalOpen Tests', () => {
            it('should set isAddPortfolioModalOpen to true', () => {
                component.isAddPortfolioModalOpen = true;
                expect(component.isAddPortfolioModalOpen).toBe(true);
            });

            it('should set isAddPortfolioModalOpen to undefined if value is undefined', () => {
                component.isAddPortfolioModalOpen = undefined;
                expect(component.isAddPortfolioModalOpen).toBe(undefined);
            });

            it('should get isAddPortfolioModalOpen value', () => {
                component.isAddPortfolioModalOpen = true;
                expect(component.isAddPortfolioModalOpen).toBe(true);
                component.isAddPortfolioModalOpen = false;
                expect(component.isAddPortfolioModalOpen).toBe(false);
            });
        });

        describe('WorkspaceStore.getWorkspace() Coverage', () => {
            beforeEach(() => {
                // Mock the workspace with a report group
                const workspace = {
                    workpads: [reportGroup]
                };
                jest.spyOn(WorkspaceStore, 'getWorkspace').mockReturnValue(workspace);
            });

            it('should populate anchor options correctly', () => {
                component.reportGroupOptions = [new ExploreSelectOptionGroup([
                    new ExploreSelectOption('Group 1', '1', false),
                    new ExploreSelectOption('Group 2', '2', true)
                ])];

                component.constructAnchorOptions();

                expect(component.anchorOptions[0].values.length).toBeGreaterThan(0);
            });


        });



        describe('constructAnchorOptions Test', () => {
            it('should construct anchor options correctly when selectedReportGroup is defined', () => {
                component.selectedReportGroup = reportGroup;
                component.comparisonStackedData = [
                    new ExploreCheckbox('Portfolio 1', true, false, '1'),
                    new ExploreCheckbox('Portfolio 2', false, false, '2')
                ];

                component.constructAnchorOptions();

                expect(component.anchorOptions[0].values.length).toBe(1);
            });

            it('should construct anchor options correctly when selectedReportGroup is undefined', () => {
                component.selectedReportGroup = undefined;

                component.constructAnchorOptions();

                expect(component.anchorOptions[0].values.length).toBe(1);
                expect(component.anchorOptions[0].values[0].value).toBe(component.NONE_ANCHOR_OPTION_LABEL);
            });
        });






        describe('Helper Functions Coverage', () => {
            it('should update comparison config for anchor options', () => {
                const reportGroup = new ReportGroup();
                reportGroup.reports = [
                    { comparisonConfigId: '1', id: '1', key: 'key1' }
                ];
                reportGroup.comparisonConfigMap = new Map();
                reportGroup.comparisonConfigMap.set('1', new ComparisonConfig());

                component.comparisonConfig = new ComparisonConfig();
                component.updateComparisonConfigforAnchorOptions(reportGroup, 1);

                expect(component.comparisonConfig).toStrictEqual(reportGroup.comparisonConfigMap.get('1'));
            });

            it('should add checked portfolios to anchor options', () => {
                const reportGroup = new ReportGroup();
                reportGroup.portfolios = [
                    { portId: 'PEP', portName: 'Portfolio 1' },
                    { portId: 'CORE-HQ', portName: 'Portfolio 2' }
                ];

                component.comparisonStackedData = [
                    new ExploreCheckbox('Portfolio 1', true, false, 'PEP'),
                    new ExploreCheckbox('Portfolio 2', false, false, 'CORE-HQ')
                ];

                component.anchorOptions = [new ExploreSelectOptionGroup()];
                component.comparisonConfig = new ComparisonConfig();
                component.comparisonConfig.portAnchorId = 'PEP';
                component.constructAnchorOptions();
                component.addCheckedPortfoliosToAnchorOptions(reportGroup);

                expect(component.anchorOptions[0].values.length).toBe(2);
                expect(component.anchorOptions[0].values[0].value).toBe('None');
            });


        });
    });


});
