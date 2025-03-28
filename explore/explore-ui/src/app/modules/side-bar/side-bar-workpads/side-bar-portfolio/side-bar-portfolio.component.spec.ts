import {ComponentFixture, TestBed} from '@angular/core/testing';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {SideBarPortfolioComponent} from './side-bar-portfolio.component';
import {WorkspaceStore} from '@stores/workspace.store';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {NotificationService} from '@services/notification';
import {AlertConstants, ExploreDialogParam} from '@blk/explore-ui-core';
import {CommonConstants, UserPreference} from '../../../../constants';
import {WhatIfPortfolio} from '@models/portfolio/what-if-portfolio.model';
import {ReportGroup} from '@models/workspace/report-group.model';
import {BehaviorSubject, of} from 'rxjs';
import {PortfolioLoadingStatus} from '@interfaces/portfolio-loading-status.interface';
import {WorkpadUtils} from '@utils/workpad.utils';
import {UserMetaDataStore} from '@stores/user-meta-data.store';
import {PortfolioService} from '@services/portfolio';

describe('SideBarPortfolioComponent', () => {
    let component: SideBarPortfolioComponent;
    let fixture: ComponentFixture<SideBarPortfolioComponent>;

    const notificationServiceStub = {
        openDialog: jest.fn()
    };

    const portfolioServiceStub = {
        fetchPortfolioInformation$: jest.fn()
    };

    beforeAll(() => {
        WorkspaceStore.init();
        WorkspaceStore.portfolioLoadingStatusMap = new Map<string, BehaviorSubject<PortfolioLoadingStatus>>();
        const portfolio = new Portfolio('Port1');
        portfolio.portId = '12345';
        WorkspaceStore.portfolioLoadingStatusMap.set(portfolio.portId, new BehaviorSubject<PortfolioLoadingStatus>({isLoading: true}));
        WorkspaceStore.updateCurrentWorkpad(new FlatWorkpad(), portfolio);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SideBarPortfolioComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: PortfolioService, useValue: portfolioServiceStub}
            ]
        });

        fixture = TestBed.createComponent(SideBarPortfolioComponent);
        component = fixture.componentInstance;
        component.portfolio = new Portfolio('Test Portfolio');
        portfolioServiceStub.fetchPortfolioInformation$.mockReturnValue(of(component.portfolio));
        WorkspaceStore.portfolioLoadingStatusMap.set(component.portfolio.portId, new BehaviorSubject<PortfolioLoadingStatus>({isLoading: true}));
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Test Select Portfolio', () => {
        jest.spyOn(component.emitPortfolioSelected, 'emit');
        component.isSelected = true;
        component.selectPortfolio();
        expect(component.emitPortfolioSelected.emit).toHaveBeenCalledTimes(0);
        component.isSelected = false;
        component.selectPortfolio();
        expect(component.emitPortfolioSelected.emit).toHaveBeenCalledTimes(1);
    });

    describe('ngOnInit Test', () => {
        it('tests ngOnInit - Portfolio', () => {
            const port: Portfolio = new Portfolio('Port1');
            port.portId = '12345';
            WorkspaceStore.currentPortfolio$.next(port);
            component.portfolio = port;

            jest.spyOn(component.isPortfolioLoading$, 'next');
            component.ngOnInit();
            expect(component.isSelected).toBeTruthy();
            expect(component.isWhatIfPortfolio).toBeFalsy();
            expect(component.portfolioSidebarDisplayName).toBe('Port1');
            expect(component.isPortfolioLoading$.next).toHaveBeenCalledWith(true);
        });

        it('tests ngOnInit - What-if Portfolio', () => {
            const port = new WhatIfPortfolio('Port2');
            component.portfolio = port;
            WorkspaceStore.updateCurrentWorkpad(new FlatWorkpad(), port);
            component.ngOnInit();
            expect(component.isSelected).toBeTruthy();
            expect(component.isWhatIfPortfolio).toBeTruthy();
            expect(component.portfolioSidebarDisplayName).toBe('Port2');
            expect(component.portfolio.title).toBe(component.portfolioSidebarDisplayName);
        });

        it('tests ngOnInit - Parent workpad report Group', () => {
            component.parentWorkpad = new ReportGroup();
            component.ngOnInit();
            expect(component.isParentReportGroup).toBeTruthy();
        });

        it('tests ngOnInit - Parent workpad flat workpad', () => {
            component.parentWorkpad = new FlatWorkpad();
            component.ngOnInit();
            expect(component.isParentReportGroup).toBeFalsy();
        });

        it('tests ngOnInit - update the current portfolio name', () => {
            const port: Portfolio = new Portfolio('Port1');
            WorkspaceStore.currentPortfolio$.next(port);
            component.portfolio = port;
            component['appStore'].portfolioNameSubject$.next('Port2');
            expect(component.portfolioSidebarDisplayName).toEqual('Port2');
        });
        it('tests ngOnInit - full portfolio name', () => {
            const port: Portfolio = new Portfolio('Port1');
            port.fullName = 'Full Port Name';
            WorkspaceStore.currentPortfolio$.next(port);
            component.portfolio = port;
            UserMetaDataStore.getPreferenceSubject(UserPreference.DISPLAY_FULL_PORTFOLIO_NAME).next('true');
            component['appStore'].portfolioNameSubject$.next('Port2');
            expect(component.portfolioSidebarDisplayName).toEqual('Full Port Name (Port1)');
        });
        it('tests ngOnInit - full portfolio name - full name undefined', () => {
            component.portfolio = new Portfolio('Port1');
            const portWithFullName = new Portfolio('Port1');
            portWithFullName.fullName = 'Full Port Name';
            portfolioServiceStub.fetchPortfolioInformation$.mockReturnValue(of(portWithFullName));
            UserMetaDataStore.getPreferenceSubject(UserPreference.DISPLAY_FULL_PORTFOLIO_NAME).next('true');
            component['appStore'].portfolioNameSubject$.next('Port2');
            expect(component.portfolioSidebarDisplayName).toEqual('Full Port Name (Port1)');
        });
    });

    describe('deletePortfolio/confirmToDeletePortfolio Test', () => {
        it('should confirm to deletePortfolio', () => {
            jest.spyOn(component['notificationService'], 'openDialog');
            const event = new MouseEvent('click');
            jest.spyOn(event, 'stopPropagation').mockReturnValue();
            component.confirmToDeletePortfolio((event as unknown) as MouseEvent);

            expect(component['notificationService'].openDialog).toHaveBeenCalledWith(
                new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                    AlertConstants.HEADER.DELETE_PORTFOLIO,
                    AlertConstants.BODY.DELETE_PORTFOLIO_2,
                    AlertConstants.BTN.DELETE,
                    AlertConstants.BTN.CANCEL,
                    component.deletePortfolio
                )
            );
            expect(event.stopPropagation).toHaveBeenCalled();
        });

        it('should not open dialog if ctrl is pressed', () => {
            jest.spyOn(component['notificationService'], 'openDialog');
            let newEvent = new MouseEvent('click', {ctrlKey: false});
            jest.spyOn(newEvent, 'stopPropagation').mockReturnValue();
            component['confirmToDeletePortfolio']((newEvent as unknown) as MouseEvent);

            expect(component['notificationService'].openDialog).toHaveBeenCalledWith(
                new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT_WITH_OPTIONS,
                    AlertConstants.HEADER.DELETE_PORTFOLIO,
                    AlertConstants.BODY.DELETE_PORTFOLIO_2,
                    AlertConstants.BTN.DELETE,
                    AlertConstants.BTN.CANCEL,
                    component.deletePortfolio
                )
            );

            const spy = jest.spyOn(component, 'deletePortfolio');
            newEvent = new MouseEvent('click', {ctrlKey: true});
            component['confirmToDeletePortfolio']((newEvent as unknown) as MouseEvent);
            expect(spy).toHaveBeenCalled();
        });

        it('should delete portfolio', () => {
            jest.spyOn(component.emitPortfolioDeleted, 'emit');
            component.deletePortfolio();

            expect(component.emitPortfolioDeleted.emit).toHaveBeenCalled();
        });

        it('should delete WhatIfPortfolio and make expandModellingSubject false', () => {
            jest.spyOn(component.emitPortfolioDeleted, 'emit');
            component.isWhatIfPortfolio = true;
            component.deletePortfolio();

            expect(component.emitPortfolioDeleted.emit).toHaveBeenCalled();
        });
    });

    describe('Test onPortfolioDrag', () => {
        it('Parent Workpad is flat workpad', () => {
            const dragEvent = {
                dataTransfer: {
                    setData: jest.fn()
                }
            };
            component.parentWorkpad = new FlatWorkpad();
            component.portfolio = new Portfolio();
            component.parentWorkpad.addPortfolios(component.portfolio);
            WorkspaceStore.getWorkspace().workpads = [new ReportGroup(), component.parentWorkpad, new FlatWorkpad()];
            component.onPortfolioDrag(dragEvent as any);
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(
                1,
                CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID,
                component.portfolio.portId
            );
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(2, CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX, '1');
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(
                3,
                CommonConstants.DRAG_DROP_PARAMS.DRAGGED_WORKPAD_INDEX + '1',
                undefined
            );
            expect(dragEvent.dataTransfer.setData).toHaveBeenCalledTimes(5);
        });
        it('Parent Workpad is Report Grouo', () => {
            const dragEvent = {
                dataTransfer: {
                    setData: jest.fn()
                }
            };
            component.parentWorkpad = new ReportGroup();
            component.portfolio = new Portfolio();
            component.parentWorkpad.addPortfolios([component.portfolio, new Portfolio()]);
            WorkspaceStore.getWorkspace().workpads = [new ReportGroup(), component.parentWorkpad, new FlatWorkpad()];
            component.onPortfolioDrag(dragEvent as any);
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(
                1,
                CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID,
                component.portfolio.portId
            );
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(2, CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX, '1');
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(
                5,
                CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_INDEX_IN_WORKPAD,
                '0'
            );
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(
                6,
                CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID,
                (component.parentWorkpad as ReportGroup).id
            );
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(
                7,
                (component.parentWorkpad as ReportGroup).id,
                (component.parentWorkpad as ReportGroup).id
            );
            expect(dragEvent.dataTransfer.setData).toHaveBeenCalledTimes(7);
        });
        it('Portfolio is what If', () => {
            const dragEvent = {
                dataTransfer: {
                    setData: jest.fn()
                }
            };
            const whatIfPortfolio = new WhatIfPortfolio();
            const parentPortfolio = new Portfolio();
            component.parentWorkpad = new ReportGroup();
            component.portfolio = whatIfPortfolio;
            whatIfPortfolio.parentPortfolio = parentPortfolio;
            component.parentWorkpad.addPortfolios([parentPortfolio, component.portfolio, new Portfolio()]);
            WorkspaceStore.getWorkspace().workpads = [new ReportGroup(), component.parentWorkpad, new FlatWorkpad()];
            component.onPortfolioDrag(dragEvent as any);
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(
                1,
                CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID,
                component.portfolio.portId
            );
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(2, CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX, '1');
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(
                5,
                CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_INDEX_IN_WORKPAD,
                '1'
            );
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(
                6,
                CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID,
                (component.parentWorkpad as ReportGroup).id
            );
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(
                7,
                (component.parentWorkpad as ReportGroup).id,
                (component.parentWorkpad as ReportGroup).id
            );
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(
                8,
                CommonConstants.DRAG_DROP_PARAMS.WHAT_IF_PORTFOLIO_PARENT + parentPortfolio.portId,
                parentPortfolio.portId
            );
            expect(dragEvent.dataTransfer.setData).toHaveBeenNthCalledWith(
                9,
                CommonConstants.DRAG_DROP_PARAMS.IS_WHAT_IF_PORTFOLIO,
                'true'
            );
            expect(dragEvent.dataTransfer.setData).toHaveBeenCalledTimes(9);
        });
    });

    describe('Test onPortfolioDrop', () => {
        let dragEvent: any;

        beforeEach(() => {
            dragEvent = {
                dataTransfer: {
                    getData: jest.fn()
                },
                preventDefault: jest.fn()
            };
        });

        it('Reorder flat workpad', () => {
            const port1 = new Portfolio();
            const port2 = new Portfolio();
            component.parentWorkpad = new FlatWorkpad();
            component.parentWorkpad.addPortfolios(port1);
            const flatWorkpad = new FlatWorkpad();
            flatWorkpad.addPortfolios(port2);
            WorkspaceStore.getWorkspace().workpads = [component.parentWorkpad, flatWorkpad];
            dragEvent.dataTransfer.getData.mockImplementation((key: string) => {
                if (key === CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX) {
                    return WorkspaceStore.getWorkspace().workpads.indexOf(flatWorkpad);
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID) {
                    return port1.portId;
                }
            });
            component.onPortfolioDrop(dragEvent as any);
            expect(WorkspaceStore.getWorkspace().workpads).toEqual([flatWorkpad, component.parentWorkpad]);
        });

        it('Drop portfolio on flat workpad', () => {
            const port1 = new Portfolio();
            const port2 = new Portfolio('DUMMY');
            component.parentWorkpad = new FlatWorkpad();
            component.parentWorkpad.addPortfolios(port1);
            const reportGroup = new ReportGroup();
            reportGroup.addPortfolios(port2);
            WorkspaceStore.getWorkspace().workpads = [component.parentWorkpad, reportGroup];
            dragEvent.dataTransfer.getData.mockImplementation((key: string) => {
                if (key === CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX) {
                    return WorkspaceStore.getWorkspace().workpads.indexOf(reportGroup);
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID) {
                    return port2.portId;
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID) {
                    return 'abc123x';
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_INDEX_IN_WORKPAD) {
                    return '0';
                }
            });
            component.onPortfolioDrop(dragEvent as any);
            expect(WorkspaceStore.getWorkspace().workpads.length).toBe(3);
            expect(WorkspaceStore.getWorkspace().workpads[0].getAllPortfolios()[0].getDisplayTitle()).toBe('DUMMY');
        });

        it('Dropping workpad on itself no action', () => {
            const port1 = new Portfolio();
            component.parentWorkpad = new FlatWorkpad();
            component.parentWorkpad.addPortfolios(port1);
            WorkspaceStore.getWorkspace().workpads = [component.parentWorkpad];

            dragEvent.dataTransfer.getData.mockImplementation((key: string) => {
                if (key === CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX) {
                    return WorkspaceStore.getWorkspace().workpads.indexOf(component.parentWorkpad);
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID) {
                    return port1.portId;
                }
            });
            jest.spyOn<any, any>(WorkpadUtils, 'reorderWorkpad');
            component.onPortfolioDrop(dragEvent as any);
            expect(WorkpadUtils['reorderWorkpad']).toHaveBeenCalledTimes(0);
        });

        it('Dropping portfolio on itself in report group no action', () => {
            const port1 = new Portfolio();
            component.parentWorkpad = new ReportGroup();
            component.parentWorkpad.addPortfolios(port1);
            component.portfolio = port1;
            WorkspaceStore.getWorkspace().workpads = [component.parentWorkpad];
            dragEvent.dataTransfer.getData.mockImplementation((key: string) => {
                if (key === CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_INDEX_IN_WORKPAD) {
                    return component.parentWorkpad.getAllPortfolios().indexOf(port1);
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID) {
                    return port1.portId;
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID) {
                    return (component.parentWorkpad as ReportGroup).id;
                }
            });
            jest.spyOn<any, any>(component, 'reorderPortfolio');
            component.onPortfolioDrop(dragEvent as any);
            expect(component['reorderPortfolio']).toHaveBeenCalledTimes(0);
        });
        it('Reorder Portfolio', () => {
            const port1 = new Portfolio();
            const port2 = new Portfolio();
            component.parentWorkpad = new ReportGroup();
            component.parentWorkpad.addPortfolios([port1, port2]);
            component.portfolio = port1;
            WorkspaceStore.getWorkspace().workpads = [component.parentWorkpad];
            dragEvent.dataTransfer.getData.mockImplementation((key: string) => {
                if (key === CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_INDEX_IN_WORKPAD) {
                    return component.parentWorkpad.getAllPortfolios().indexOf(port2);
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID) {
                    return port2.portId;
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID) {
                    return (component.parentWorkpad as ReportGroup).id;
                }
            });
            component.onPortfolioDrop(dragEvent as any);
            expect(component.parentWorkpad.getAllPortfolios()).toEqual([port2, port1]);
        });

        it('Reorder Portfolio with what-if portfolios', () => {
            const port1 = new Portfolio();
            const port2 = new Portfolio();
            const whatIfPortfolioPort2_1 = new WhatIfPortfolio();
            const whatIfPortfoliPort2_2 = new WhatIfPortfolio();
            whatIfPortfolioPort2_1.parentPortfolio = port2;
            whatIfPortfoliPort2_2.parentPortfolio = port2;
            const whatIfPortfolioPort1_1 = new WhatIfPortfolio();
            const whatIfPortfoliPort1_2 = new WhatIfPortfolio();
            whatIfPortfolioPort1_1.parentPortfolio = port1;
            whatIfPortfoliPort1_2.parentPortfolio = port1;
            component.parentWorkpad = new ReportGroup();
            component.parentWorkpad.addPortfolios([
                port1,
                whatIfPortfolioPort1_1,
                whatIfPortfoliPort1_2,
                port2,
                whatIfPortfolioPort2_1,
                whatIfPortfoliPort2_2
            ]);
            component.portfolio = port1;
            WorkspaceStore.getWorkspace().workpads = [component.parentWorkpad];
            dragEvent.dataTransfer.getData.mockImplementation((key: string) => {
                if (key === CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_INDEX_IN_WORKPAD) {
                    return component.parentWorkpad.getAllPortfolios().indexOf(port2);
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID) {
                    return port2.portId;
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID) {
                    return (component.parentWorkpad as ReportGroup).id;
                }
            });
            component.onPortfolioDrop(dragEvent as any);
            expect(component.parentWorkpad.getAllPortfolios()).toEqual([
                port2,
                whatIfPortfolioPort2_1,
                whatIfPortfoliPort2_2,
                port1,
                whatIfPortfolioPort1_1,
                whatIfPortfoliPort1_2
            ]);
        });
        it('Add portfolio to non-empty report group', () => {
            const existingPort1 = new Portfolio();
            const existingPort2 = new Portfolio();
            component.parentWorkpad = new ReportGroup();
            component.parentWorkpad.addPortfolios([existingPort1, existingPort2]);
            component.portfolio = existingPort1;

            const portToAdd = new Portfolio();
            const oldWorkpad = new FlatWorkpad();
            oldWorkpad.addPortfolios(portToAdd);

            WorkspaceStore.getWorkspace().workpads = [component.parentWorkpad, oldWorkpad];
            dragEvent.dataTransfer.getData.mockImplementation((key: string) => {
                if (key === CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_INDEX_IN_WORKPAD) {
                    return oldWorkpad.getAllPortfolios().indexOf(portToAdd);
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID) {
                    return portToAdd.portId;
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID) {
                    return '';
                } else if (key === CommonConstants.DRAG_DROP_PARAMS.WORKPAD_INDEX) {
                    return WorkspaceStore.getWorkspace().workpads.indexOf(oldWorkpad);
                }
            });
            component.onPortfolioDrop(dragEvent as any);
            expect(component.parentWorkpad.getAllPortfolios()).toEqual([existingPort1, portToAdd, existingPort2]);
        });
    });

    describe('Test allowDrop', () => {
        it('Allow rearrange within report group', () => {
            const port1 = new Portfolio();
            const port2 = new Portfolio();
            const reportGroup = new ReportGroup();
            component.parentWorkpad = reportGroup;
            component.portfolio = port1;
            component.parentWorkpad.addPortfolios([port1, port2]);
            const dragEvent = {
                dataTransfer: {
                    types: [CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID, reportGroup.id, CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID, CommonConstants.DRAG_DROP_PARAMS.DRAGGED_WORKPAD_INDEX + '0', CommonConstants.DRAG_DROP_PARAMS.DRAGGED_PORTFOLIO_INDEX_IN_WORKPAD + '0']
                },
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                cancelBubble: false
            };
            component.allowDrop(dragEvent as any);
            expect(dragEvent.preventDefault).toHaveBeenCalled();
        });

        it('Not allow drop of portfolio of different report group', () => {
            const port1 = new Portfolio();
            component.parentWorkpad = new ReportGroup();
            component.portfolio = port1;
            component.parentWorkpad.addPortfolios([port1]);
            const dragEvent = {
                dataTransfer: {
                    types: [CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID, 123, CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID]
                },
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                cancelBubble: false
            };
            component.allowDrop(dragEvent as any);
            expect(dragEvent.preventDefault).toHaveBeenCalledTimes(0);
        });

        it('Allow rearrange of flat workpads', () => {
            const port1 = new Portfolio();
            component.parentWorkpad = new FlatWorkpad();
            component.portfolio = port1;
            component.parentWorkpad.addPortfolios([port1]);
            const dragEvent = {
                dataTransfer: {
                    types: [CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID, CommonConstants.DRAG_DROP_PARAMS.DRAGGED_WORKPAD_INDEX + '0', CommonConstants.DRAG_DROP_PARAMS.DRAGGED_PORTFOLIO_INDEX_IN_WORKPAD + '0']
                },
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                cancelBubble: false
            };
            component.allowDrop(dragEvent as any);
            expect(dragEvent.preventDefault).toHaveBeenCalled();
        });

        it('Not allow flat workpad portfolio to drop on report group portfolio', () => {
            const port1 = new Portfolio();
            component.parentWorkpad = new ReportGroup();
            component.portfolio = port1;
            component.parentWorkpad.addPortfolios([port1]);
            const dragEvent = {
                dataTransfer: {
                    types: [CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID]
                },
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                cancelBubble: false
            };
            component.allowDrop(dragEvent as any);
            expect(dragEvent.preventDefault).toHaveBeenCalledTimes(0);
        });

        it('Allow what if portfolio to drop on what if portfolio with same parent portfolio', () => {
            const port1 = new Portfolio();
            const whatIfPortfolio1 = new WhatIfPortfolio();
            whatIfPortfolio1.parentPortfolio = port1;
            const whatIfPortfolio2 = new WhatIfPortfolio();
            whatIfPortfolio2.parentPortfolio = port1;
            const reportGroup = new ReportGroup();
            component.parentWorkpad = reportGroup;
            component.portfolio = whatIfPortfolio1;
            component.isWhatIfPortfolio = true;
            component.parentWorkpad.addPortfolios([port1, whatIfPortfolio1, whatIfPortfolio2]);
            const dragEvent = {
                dataTransfer: {
                    types: [
                        CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID,
                        CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID,
                        reportGroup.id,
                        CommonConstants.DRAG_DROP_PARAMS.WHAT_IF_PORTFOLIO_PARENT + port1.portId.toLowerCase(),
                        CommonConstants.DRAG_DROP_PARAMS.IS_WHAT_IF_PORTFOLIO,
                        CommonConstants.DRAG_DROP_PARAMS.DRAGGED_WORKPAD_INDEX + '0',
                        CommonConstants.DRAG_DROP_PARAMS.DRAGGED_PORTFOLIO_INDEX_IN_WORKPAD + '0'
                    ]
                },
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                cancelBubble: false
            };
            component.allowDrop(dragEvent as any);
            expect(dragEvent.preventDefault).toHaveBeenCalled();
            // Parent portfolio is different
            jest.resetAllMocks();
            dragEvent.dataTransfer.types = [
                CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID,
                CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID,
                reportGroup.id,
                CommonConstants.DRAG_DROP_PARAMS.WHAT_IF_PORTFOLIO_PARENT + 'test',
                CommonConstants.DRAG_DROP_PARAMS.IS_WHAT_IF_PORTFOLIO
            ];
            component.allowDrop(dragEvent as any);
            expect(dragEvent.preventDefault).toHaveBeenCalledTimes(0);
        });

        it('Not allow drop of what-if portfolio on portfolio', () => {
            const port1 = new Portfolio();
            const reportGroup = new ReportGroup();
            component.parentWorkpad = reportGroup;
            component.portfolio = port1;
            component.parentWorkpad.addPortfolios([port1]);
            const dragEvent = {
                dataTransfer: {
                    types: [
                        CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID,
                        CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID,
                        reportGroup.id,
                        CommonConstants.DRAG_DROP_PARAMS.WHAT_IF_PORTFOLIO_PARENT + port1.portId.toLowerCase(),
                        CommonConstants.DRAG_DROP_PARAMS.IS_WHAT_IF_PORTFOLIO
                    ]
                },
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                cancelBubble: false
            };
            component.allowDrop(dragEvent as any);
            expect(dragEvent.preventDefault).toHaveBeenCalledTimes(0);
        });

        it('Not allow drop of portfolio on what-if portfolio', () => {
            const port1 = new WhatIfPortfolio();
            port1.parentPortfolio = new Portfolio();
            const reportGroup = new ReportGroup();
            component.parentWorkpad = reportGroup;
            component.portfolio = port1;
            component.parentWorkpad.addPortfolios([port1]);
            const dragEvent = {
                dataTransfer: {
                    types: [CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID, CommonConstants.DRAG_DROP_PARAMS.REPORT_GROUP_ID, reportGroup.id]
                },
                preventDefault: jest.fn(),
                stopPropagation: jest.fn(),
                cancelBubble: false
            };
            component.allowDrop(dragEvent as any);
            expect(dragEvent.preventDefault).toHaveBeenCalledTimes(0);
        });

        it('is not portfolio', () => {
            const dragEvent = {
                dataTransfer: {
                    types: []
                },
                preventDefault: jest.fn()
            };
            component.allowDrop(dragEvent as any);
            expect(dragEvent.preventDefault).toHaveBeenCalledTimes(0);
        });

        it('Allows adding single portfolio (flat workpad) to non-empty report group', () => {
            const mockAddBorder = jest.spyOn(component, 'addBorder');

            const existingPort1 = new Portfolio();
            const existingPort2 = new Portfolio();
            component.parentWorkpad = new ReportGroup();
            component.parentWorkpad.addPortfolios([existingPort1, existingPort2]);
            component.portfolio = existingPort1;

            const portToAdd = new Portfolio();
            const oldWorkpad = new FlatWorkpad();
            oldWorkpad.addPortfolios(portToAdd);

            WorkspaceStore.getWorkspace().workpads = [component.parentWorkpad, oldWorkpad];

            const mockDragEvent = {
                dataTransfer: {
                    types: [
                        CommonConstants.DRAG_DROP_PARAMS.PORTFOLIO_ID
                    ]
                },
                preventDefault: jest.fn()
            };
            component.allowDrop(mockDragEvent as any);
            expect(mockAddBorder).toHaveBeenCalledTimes(1);
        });
    });
});
