import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SideBarComponent} from './side-bar.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {UserMetaDataStore, WorkspaceStore} from '../../stores';
import {UserPreference} from '../../constants';
import {ReportGroup} from '@models/workspace/report-group.model';
import {CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {NotificationService} from '@services/notification';
import {TelemetryClickService} from '@services/telemetry/telemetry-click.service';
import {PortfolioMenuItemsConstants} from '@constants/portfolio-menu-items.constants';
import {PortfolioType} from '../../shared/components/add-portfolio-modal/portfolio-type.enum';

describe('SideBarComponent', () => {
    let component: SideBarComponent;
    let fixture: ComponentFixture<SideBarComponent>;
    const notificationServiceStub = {
        success: jest.fn()
    };
    const telemetryClickServiceStub = {
        reportGroupClick: jest.fn(),
        sideBarPortfoliosMenuBarClick: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [SideBarComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: NotificationService, useValue: notificationServiceStub},
                {provide: TelemetryClickService, useValue: telemetryClickServiceStub}
            ]
        });

        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        WorkspaceStore.init();
        fixture = TestBed.createComponent(SideBarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
        expect(component.isOpen).toBeTruthy();
    });

    it('create ReportGroup', () => {
        component.createReportGroup();
        const expectedReportGroup = new ReportGroup();
        expectedReportGroup.isOpen = true;
        expect(notificationServiceStub.success).toHaveBeenCalledWith('Report Group added! Drag portfolios into your report group to view shared reports.');
        expect(component['telemetryClickService'].reportGroupClick).toHaveBeenCalled();
        expect((WorkspaceStore.getWorkspace().workpads[0] as ReportGroup).isOpen ).toBeTruthy();
    });

    it('Change the user preference and see that the state changes', async() => {
        UserMetaDataStore.setPreferenceValue(UserPreference.NAVIGATION_DRAWER_OPEN, 'false');
        await expect(component.isOpen).toBeFalsy();
    });
    it('Portfolio Menu Options NgOnit', async () => {
        UserMetaDataStore.setPreferenceValue(UserPreference.DISPLAY_FULL_PORTFOLIO_NAME, 'true');
        await expect(component.displayFullPortfolioName).toBeTruthy();
        expect(component.portfolioMenuOptions).toEqual(
            [
                [
                    {label: PortfolioMenuItemsConstants.LABELS.ADD_PORTFOLIO}
                ],
                [
                    {label: PortfolioMenuItemsConstants.LABELS.ADD_WHAT_IF_PORTFOLIO},
                    {label: PortfolioMenuItemsConstants.LABELS.ADD_CUSTOM_PORTFOLIO},
                    {label: PortfolioMenuItemsConstants.LABELS.ADD_INDEX_RESEARCH}
                ],
                [
                    {label: PortfolioMenuItemsConstants.LABELS.CREATE_NEW_GROUP},
                    {label: PortfolioMenuItemsConstants.LABELS.ENABLE_MULTI_PORTFOLIO_ANALYSIS}
                ],
                [
                    {label: PortfolioMenuItemsConstants.LABELS.SHOW_PORTFOLIO_TICKER}
                ]
            ]);
        UserMetaDataStore.setPreferenceValue(UserPreference.DISPLAY_FULL_PORTFOLIO_NAME, 'false');
        await expect(component.displayFullPortfolioName).toBeFalsy();
        expect(component.portfolioMenuOptions).toEqual([
            [
                {label: PortfolioMenuItemsConstants.LABELS.ADD_PORTFOLIO}
            ],
            [
                {label: PortfolioMenuItemsConstants.LABELS.ADD_WHAT_IF_PORTFOLIO},
                {label: PortfolioMenuItemsConstants.LABELS.ADD_CUSTOM_PORTFOLIO},
                {label: PortfolioMenuItemsConstants.LABELS.ADD_INDEX_RESEARCH}
            ],
            [
                {label: PortfolioMenuItemsConstants.LABELS.CREATE_NEW_GROUP},
                {label: PortfolioMenuItemsConstants.LABELS.ENABLE_MULTI_PORTFOLIO_ANALYSIS}
            ],
            [
                {label: PortfolioMenuItemsConstants.LABELS.SHOW_PORTFOLIO_FULL_NAME}
            ]
        ]);
    });
    it('On portfolio menu clicked', async () => {
        component.onMenuClicked({detail: {element: {label: PortfolioMenuItemsConstants.LABELS.SHOW_PORTFOLIO_TICKER}}} as any);
        expect(component.displayFullPortfolioName).toBeFalsy();
        await expect(UserMetaDataStore.getPreferenceValue(UserPreference.DISPLAY_FULL_PORTFOLIO_NAME) === 'false').toBeTruthy();
        component.onMenuClicked({detail: {element: {label: PortfolioMenuItemsConstants.LABELS.SHOW_PORTFOLIO_FULL_NAME}}} as any);
        expect(component.displayFullPortfolioName).toBeTruthy();
        component.onMenuClicked({detail: {element: {label: PortfolioMenuItemsConstants.LABELS.ADD_PORTFOLIO}}} as any);
        expect(component.isAddPortfolioModalOpen).toBeTruthy();
        expect(component.portfolioType).toEqual(PortfolioType.PORTFOLIO);
        component.onMenuClicked({detail: {element: {label: PortfolioMenuItemsConstants.LABELS.ADD_CUSTOM_PORTFOLIO}}} as any);
        expect(component.portfolioType).toEqual(PortfolioType.CUSTOM);
        component.onMenuClicked({detail: {element: {label: PortfolioMenuItemsConstants.LABELS.ADD_INDEX_RESEARCH}}} as any);
        expect(component.portfolioType).toEqual(PortfolioType.INDEX_RESEARCH);
        component.onMenuClicked({detail: {element: {label: PortfolioMenuItemsConstants.LABELS.ADD_WHAT_IF_PORTFOLIO}}} as any);
        expect(component.portfolioType).toEqual(PortfolioType.WHAT_IF);
        WorkspaceStore.newWorkspace();
        component.onMenuClicked({detail: {element: {label: PortfolioMenuItemsConstants.LABELS.CREATE_NEW_GROUP}}} as any);
        expect(WorkspaceStore.getWorkspace().getReportGroups()[0].editMode).toBeTruthy();
        expect(WorkspaceStore.getWorkspace().getReportGroups()[0].isOpen).toBeTruthy();
        expect(notificationServiceStub.success).toHaveBeenCalledWith('Report Group added! Drag portfolios into your report group to view shared reports.');
        expect(component['telemetryClickService'].reportGroupClick).toHaveBeenCalled();
    });
});
