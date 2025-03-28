import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';
import {BreakdownTreeComponent} from './breakdown-tree.component';
import {AppStore} from '../../../../app.store';
import {FavoriteService, NotificationService} from '../../../../shared/services';
import {CUSTOM_ELEMENTS_SCHEMA, SimpleChange} from '@angular/core';
import {
    Breakdown,
    BreakdownBuilderSettings,
    BreakdownConstants,
    BreakdownSectorSelectorOption,
    BreakdownSectorSelectorOptionType,
    BreakdownTreeNode,
    ColumnSector,
    ColumnSectorRule,
    CustomSector,
    GroupRule,
    LinkedFavoriteSector,
    NumericColumnSector, SchemaSector,
    SectorConstants
} from '@blk/explore-ui-breakdown';
import {
    ExploreDialogParam,
    AlertConstants,
    CoreDefinitionStore,
    ErrorTypeConstants,
    UIErrorParameters
} from '@blk/explore-ui-core';
import {CommonConstants} from '../../../../constants';
import {BehaviorSubject, of, throwError} from 'rxjs';
import {TestUtils} from '@utils/test.utils';
import {GpBreakdownColumnDefinition} from '@models/definitions/column-definitions/gp-breakdown-column-definition.model';
import {BreakdownUtils} from '@utils/breakdown.utils';
import {isEmpty, omit} from 'lodash';
import {NotificationConstants} from '@constants/notification.constants';
import {ColumnDefinition, CoreColumnUtils, CoreUserMetaDataStore, UserMetaData} from '@blk/explore-ui-core';
import {AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {FavoriteConstants} from '@constants/favorite.constants';

describe('BreakdownTreeComponent', () => {
    let component: BreakdownTreeComponent;
    let fixture: ComponentFixture<BreakdownTreeComponent>;

    const favoriteServiceMock = {
        getFavorite$: jest.fn()
    };

    const notificationServiceMock = {
        openDialog: jest.fn(),
        error: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [BreakdownTreeComponent],
            providers: [
                AppStore,
                {provide: FavoriteService, useValue: favoriteServiceMock},
                {provide: NotificationService, useValue: notificationServiceMock}],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(BreakdownTreeComponent);
        component = fixture.componentInstance;
        component.breakdownBuilderSettings = new BreakdownBuilderSettings();
        component.breakdownBuilderSettings.fieldToUse = 'columnTag';
        component.topDownEligibleCols = ['product_asset_class', 'product_geo_focus', 'product_investment_style', 'portfolio_tree'];
    });

    describe('Test validateAndUpdateBreakdown', () => {
        it('invalid breakdown', () => {
            const breakdownTreeNodeTotal = new BreakdownTreeNode();
            breakdownTreeNodeTotal.label = 'Total';
            breakdownTreeNodeTotal.sectorModel = new Breakdown();
            const breakdownTreeNodeSecType = new BreakdownTreeNode();
            breakdownTreeNodeSecType.label = 'Security Type';
            const secTypeColumnSector = new ColumnSector();
            secTypeColumnSector.columnName = 'Security Type';
            breakdownTreeNodeSecType.sectorModel = secTypeColumnSector;
            breakdownTreeNodeTotal.children = [breakdownTreeNodeSecType];
            component.breakdownTreeData = [breakdownTreeNodeTotal];
            component.breakdown = new Breakdown();
            component.validateAndUpdateBreakdown();
            expect(notificationServiceMock.openDialog)
                .toHaveBeenLastCalledWith(new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT,
                    AlertConstants.HEADER.INVALID_BREAKDOWN,
                    AlertConstants.BODY.INVALID_BREAKDOWN,
                    AlertConstants.BTN.OK
                ));
            expect(component.breakdownTreeData[0].sectorModel).toEqual(new Breakdown());
            expect(component.breakdown).toEqual(new Breakdown());
        });
        it('Valid breakdown', () => {
            const breakdownTreeNodeTotal = new BreakdownTreeNode();
            breakdownTreeNodeTotal.label = 'Total';
            breakdownTreeNodeTotal.sectorModel = new Breakdown();
            const breakdownTreeNodeSecType = new BreakdownTreeNode();
            breakdownTreeNodeSecType.label = 'Security Type';
            const secTypeColumnSector = new ColumnSector();
            secTypeColumnSector.columnName = 'Security Type';
            secTypeColumnSector.columnTag = 'secType';
            breakdownTreeNodeSecType.sectorModel = secTypeColumnSector;
            const breakdownTreeNodeSecGroup = new BreakdownTreeNode();
            breakdownTreeNodeSecGroup.label = 'Security Group';
            const secGroupColumnSector = new ColumnSector();
            secGroupColumnSector.columnName = 'Security Group';
            secGroupColumnSector.columnTag = 'secGroup';
            breakdownTreeNodeSecGroup.sectorModel = secGroupColumnSector;
            breakdownTreeNodeTotal.children = [breakdownTreeNodeSecType];
            breakdownTreeNodeSecType.children = [breakdownTreeNodeSecGroup];
            component.breakdownTreeData = [breakdownTreeNodeTotal];
            const expectedBreakdown = new Breakdown();
            expectedBreakdown.children = [secTypeColumnSector];
            secTypeColumnSector.children = [secGroupColumnSector];
            component.breakdown = new Breakdown();
            notificationServiceMock.openDialog = jest.fn();
            component.validateAndUpdateBreakdown();
            expect(notificationServiceMock.openDialog).toHaveBeenCalledTimes(0);
            expect(component.breakdownTreeData[0].sectorModel).toEqual(expectedBreakdown);
            expect(component.breakdown).toEqual(expectedBreakdown);
        });

        it('preset breakdown', () => {
            const breakdownTreeNodeTotal = new BreakdownTreeNode();
            breakdownTreeNodeTotal.label = 'Total';
            breakdownTreeNodeTotal.isExpanded = true;
            breakdownTreeNodeTotal.parent = undefined;
            breakdownTreeNodeTotal.sectorModel = new Breakdown();
            breakdownTreeNodeTotal.type = 'root';
            breakdownTreeNodeTotal.isSelected = true;
            breakdownTreeNodeTotal.uid = '123';

            const presetBreakdown = new Breakdown();
            presetBreakdown.presetBreakdownId = 'iaa_breakdown';
            presetBreakdown.isConfigured = true;
            presetBreakdown.title = 'IAA Breakdown';

            component.breakdownTreeData = [breakdownTreeNodeTotal];
            component.breakdown = presetBreakdown;
            component.placeholderBreakdownNodeInserted = true;

            component.validateAndUpdateBreakdown();

            expect(component.breakdownTreeData[0].sectorModel).toEqual(presetBreakdown);
        });
    });

    describe('Test ngOnChanges breakdown change', () => {
        it('null/empty breakdown', () => {
            component.breakdown = undefined;
            component.ngOnChanges({
                breakdown: new SimpleChange(undefined, undefined, true)
            });
            expect(component.breakdownTreeData).toEqual([]);
            expect(component.original).toBeFalsy();
            component.breakdown = new Breakdown();
            component.ngOnChanges({
                breakdown: new SimpleChange(undefined, new Breakdown(), true)
            });
            const breakdownTreeNodeTotal = new BreakdownTreeNode();
            breakdownTreeNodeTotal.label = 'Total';
            breakdownTreeNodeTotal.isExpanded = true;
            breakdownTreeNodeTotal.parent = undefined;
            breakdownTreeNodeTotal.sectorModel = component.breakdown;
            breakdownTreeNodeTotal.type = 'root';
            breakdownTreeNodeTotal.isSelected = true;
            breakdownTreeNodeTotal.enableContextMenu();
            TestUtils.removeUIDFromAdvanceTreeListNodes(component.breakdownTreeData);
            expect(component.breakdownTreeData).toEqual([breakdownTreeNodeTotal]);
            expect(component.original).toBeFalsy();
        });

        it('Not Null breakdown', () => {
            const breakdown = new Breakdown();
            const secTypeColumnSector = new ColumnSector();
            secTypeColumnSector.columnName = 'Security Type';
            const customSector = new CustomSector();
            customSector.title = 'Custom Sector';
            const linkedSector = new LinkedFavoriteSector();
            linkedSector.sector = customSector;
            breakdown.children = [secTypeColumnSector, linkedSector];
            const breakdownTreeNodeTotal = new BreakdownTreeNode();
            breakdownTreeNodeTotal.label = 'Total';
            breakdownTreeNodeTotal.isExpanded = true;
            breakdownTreeNodeTotal.parent = undefined;
            breakdownTreeNodeTotal.sectorModel = breakdown;
            breakdownTreeNodeTotal.type = 'root';
            breakdownTreeNodeTotal.isSelected = true;
            breakdownTreeNodeTotal.enableContextMenu();
            const breakdownTreeNodeCustomSector = new BreakdownTreeNode();
            breakdownTreeNodeCustomSector.label = 'Custom Sector';
            breakdownTreeNodeCustomSector.type = 'custom';
            breakdownTreeNodeCustomSector.isExpanded = true;
            breakdownTreeNodeCustomSector.parent = breakdownTreeNodeTotal;
            breakdownTreeNodeCustomSector.sectorModel = linkedSector;
            breakdownTreeNodeCustomSector.enableContextMenu();
            breakdownTreeNodeCustomSector.isDeletable = true;
            const breakdownTreeNodeSecType = new BreakdownTreeNode();
            breakdownTreeNodeSecType.label = 'Security Type';
            breakdownTreeNodeSecType.type = 'groupBy';
            breakdownTreeNodeSecType.isExpanded = true;
            breakdownTreeNodeSecType.parent = breakdownTreeNodeTotal;
            breakdownTreeNodeSecType.sectorModel = secTypeColumnSector;
            breakdownTreeNodeSecType.enableContextMenu();
            breakdownTreeNodeSecType.isDeletable = true;
            breakdownTreeNodeTotal.children = [breakdownTreeNodeSecType, breakdownTreeNodeCustomSector];
            component.breakdown = breakdown;
            component.ngOnChanges({
                breakdown: new SimpleChange(undefined, breakdown, true)
            });
            TestUtils.removeUIDFromAdvanceTreeListNodes(component.breakdownTreeData);
            expect(component.breakdownTreeData).toEqual([breakdownTreeNodeTotal]);
            expect(component.original).toBeFalsy();
            // Breakdown with id, original should be true
            breakdown.id = 456;
            component.ngOnChanges({
                breakdown: new SimpleChange(undefined, breakdown, true)
            });
            TestUtils.removeUIDFromAdvanceTreeListNodes(component.breakdownTreeData);
            expect(component.breakdownTreeData).toEqual([breakdownTreeNodeTotal]);
            expect(component.original).toBeTruthy();
        });
    });

    it('Test Load Breakdown', () => {
        CoreUserMetaDataStore.userMetaData = new UserMetaData();
        CoreUserMetaDataStore.userMetaData.login = 'simsingh';
        component.breakdown = new Breakdown();
        const breakdown = new Breakdown();
        breakdown.id = 231;
        jest.spyOn(favoriteServiceMock, 'getFavorite$').mockReturnValue(
            of(breakdown)
        );
        jest.spyOn(component.breakdownUpdated, 'emit');
        component['loadBreakdown'](231, 'loading favorite', false, false);
        expect(component.breakdown).toEqual(breakdown);
        expect(component.breakdownUpdated.emit).toHaveBeenCalled();

        // In case of error while loading breakdown
        component.breakdown = new Breakdown();
        jest.spyOn(favoriteServiceMock, 'getFavorite$').mockReturnValue(
            throwError('error')
        );
        component['loadBreakdown'](231, 'loading favorite', false, false);
        expect(notificationServiceMock.error).toHaveBeenLastCalledWith('failed to load breakdown with id: 231', ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_GET_FAVORITE_ERROR);
    });

    it('Test loadBreakdown preset breakdown', () => {
        component.placeholderBreakdownNodeInserted = false;
        component.breakdown = new Breakdown();
        component['loadBreakdown'](undefined, 'loading preset', false, false, 'IAA Breakdown', 'iaa_breakdown');

        expect(component.breakdown.presetBreakdownId).toEqual('iaa_breakdown');
        expect(component.breakdown.title).toEqual('IAA Breakdown');
        expect(component.breakdown.owner).toEqual(FavoriteConstants.PORTFOLIO_SPECIFIC_USER);
        expect(component.placeholderBreakdownNodeInserted).toEqual(true);
        expect(component.breakdownTreeData[0].children[0].label).toEqual('IAA Breakdown');
    });

    it('Test onRemoveItemClick', () => {
        const breakdownTreeNodeTotal = new BreakdownTreeNode();
        breakdownTreeNodeTotal.label = 'Total';
        breakdownTreeNodeTotal.isExpanded = true;
        breakdownTreeNodeTotal.parent = undefined;
        breakdownTreeNodeTotal.sectorModel = new Breakdown();
        breakdownTreeNodeTotal.type = 'root';
        breakdownTreeNodeTotal.isSelected = true;
        breakdownTreeNodeTotal.uid = '123';
        const breakdownTreeNodeCustomSector = new BreakdownTreeNode();
        breakdownTreeNodeCustomSector.label = 'Custom Sector';
        breakdownTreeNodeCustomSector.type = 'custom';
        breakdownTreeNodeCustomSector.isExpanded = true;
        breakdownTreeNodeCustomSector.parent = breakdownTreeNodeTotal;
        breakdownTreeNodeCustomSector.sectorModel = new LinkedFavoriteSector();
        breakdownTreeNodeCustomSector.enableContextMenu();
        breakdownTreeNodeCustomSector.isDeletable = true;
        breakdownTreeNodeCustomSector.uid = '546';
        breakdownTreeNodeTotal.children = [breakdownTreeNodeCustomSector];
        component.breakdownTreeData = [breakdownTreeNodeTotal];
        breakdownTreeNodeTotal.sectorModel.children = [breakdownTreeNodeCustomSector.sectorModel];
        component.onRemoveItemClick({detail: {value: breakdownTreeNodeCustomSector}} as any);
        expect(component.selectedSectorNode).toBe(breakdownTreeNodeTotal);
        expect(breakdownTreeNodeTotal.children.includes(breakdownTreeNodeCustomSector)).toBeFalsy();
        expect(breakdownTreeNodeTotal.sectorModel.children.includes(breakdownTreeNodeCustomSector.sectorModel)).toBeFalsy();
    });

    it('Test onRemoveAllClick', () => {
        const breakdownTreeNodeTotal = new BreakdownTreeNode();
        breakdownTreeNodeTotal.label = 'Total';
        breakdownTreeNodeTotal.isExpanded = true;
        breakdownTreeNodeTotal.parent = undefined;
        breakdownTreeNodeTotal.sectorModel = new Breakdown();
        breakdownTreeNodeTotal.type = 'root';
        breakdownTreeNodeTotal.isSelected = true;
        breakdownTreeNodeTotal.uid = '123';
        const breakdownTreeNodeCustomSector = new BreakdownTreeNode();
        breakdownTreeNodeCustomSector.label = 'Custom Sector';
        breakdownTreeNodeCustomSector.type = 'custom';
        breakdownTreeNodeCustomSector.isExpanded = true;
        breakdownTreeNodeCustomSector.parent = breakdownTreeNodeTotal;
        breakdownTreeNodeCustomSector.sectorModel = new LinkedFavoriteSector();
        breakdownTreeNodeCustomSector.enableContextMenu();
        breakdownTreeNodeCustomSector.isDeletable = true;
        breakdownTreeNodeCustomSector.uid = '546';
        breakdownTreeNodeTotal.children = [breakdownTreeNodeCustomSector];
        component.breakdownTreeData = [breakdownTreeNodeTotal];
        component.breakdown = new Breakdown();
        component.onRemoveAllClick({preventDefault: jest.fn()} as any);
        expect(breakdownTreeNodeTotal.children).toBeUndefined();
        expect(component.selectedSectorNode).toEqual(breakdownTreeNodeTotal);
    });

    it('Test onRemoveAllClick with preset breakdown selected', () => {
        const breakdownTreeNodeTotal = new BreakdownTreeNode();
        breakdownTreeNodeTotal.label = 'Total';
        breakdownTreeNodeTotal.isExpanded = true;
        breakdownTreeNodeTotal.parent = undefined;
        breakdownTreeNodeTotal.sectorModel = new Breakdown();
        breakdownTreeNodeTotal.type = 'root';
        breakdownTreeNodeTotal.isSelected = true;
        breakdownTreeNodeTotal.uid = '123';
        const presetBreakdown = new Breakdown();
        presetBreakdown.presetBreakdownId = 'iaa_breakdown';
        presetBreakdown.isConfigured = true;
        presetBreakdown.title = 'IAA Breakdown';
        const presetBreakdownNode = BreakdownUtils.convertPlaceholderBreakdownToNode(presetBreakdown, breakdownTreeNodeTotal);
        breakdownTreeNodeTotal.children = [presetBreakdownNode];

        component.breakdownTreeData = [breakdownTreeNodeTotal];
        component.breakdown = presetBreakdown;
        component.placeholderBreakdownNodeInserted = true;

        component.onRemoveAllClick({preventDefault: jest.fn()} as any);

        expect(component.breakdown.presetBreakdownId).toBeUndefined();
        expect(component.breakdown.title).toBeUndefined();
        expect(component.breakdownTreeData[0].children).toBeUndefined();
        expect(component.placeholderBreakdownNodeInserted).toEqual(false);
    });

    describe('Test onContextMenuClick', () => {
        const breakdownTreeNodeTotal = new BreakdownTreeNode();
        breakdownTreeNodeTotal.label = 'Total';
        breakdownTreeNodeTotal.isExpanded = true;
        breakdownTreeNodeTotal.parent = undefined;
        breakdownTreeNodeTotal.type = 'root';
        breakdownTreeNodeTotal.isSelected = true;
        breakdownTreeNodeTotal.uid = '123';
        beforeEach(() => {
            breakdownTreeNodeTotal.children = [];
            component.breakdownTreeData = [breakdownTreeNodeTotal];
        });

        describe('Test copy/paste', () => {
            let breakdownTreeNodeCustomSector;
            let breakdownTreeNodeSecType;
            beforeEach(() => {
                breakdownTreeNodeCustomSector = new BreakdownTreeNode();
                breakdownTreeNodeCustomSector.label = 'Custom Sector';
                breakdownTreeNodeCustomSector.type = 'custom';
                breakdownTreeNodeCustomSector.isExpanded = true;
                breakdownTreeNodeCustomSector.parent = breakdownTreeNodeTotal;
                breakdownTreeNodeCustomSector.enableContextMenu();
                breakdownTreeNodeCustomSector.isDeletable = true;
                breakdownTreeNodeCustomSector.uid = '1234';
                breakdownTreeNodeSecType = new BreakdownTreeNode();
                breakdownTreeNodeSecType.label = 'Security Type';
                breakdownTreeNodeSecType.type = 'groupBy';
                breakdownTreeNodeSecType.isExpanded = true;
                breakdownTreeNodeSecType.enableContextMenu();
                breakdownTreeNodeSecType.isDeletable = true;
                breakdownTreeNodeSecType.parent = breakdownTreeNodeTotal;
                breakdownTreeNodeSecType.uid = '1235';
                breakdownTreeNodeCustomSector.children = [breakdownTreeNodeSecType];
                breakdownTreeNodeTotal.children = [breakdownTreeNodeCustomSector];
            });

            it('Test Copy selected node', () => {
                component.onContextMenuClick({
                    detail:
                        {
                            label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.COPY_NODE,
                            value:
                                {
                                    uid: '1234'
                                }
                        }
                } as any);
                expect(component.breakdownTreeNodeCopyAction.copyChildren).toBeFalsy();
                expect(breakdownTreeNodeTotal.contextMenu[0].isDisabled).toBeFalsy();
                expect(breakdownTreeNodeSecType.contextMenu[4].isDisabled).toBeFalsy();
                expect(breakdownTreeNodeCustomSector.contextMenu[4].isDisabled).toBeFalsy();
                component.onContextMenuClick({
                    detail:
                        {
                            label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.PASTE,
                            value:
                                {
                                    uid: '1235'
                                }
                        }
                } as any);
                expect(omit(breakdownTreeNodeSecType.children[0], 'parent', 'children', 'uid', 'isSelected')).toEqual(omit(breakdownTreeNodeCustomSector, 'parent', 'children', 'uid', 'isSelected'));
                expect(isEmpty(breakdownTreeNodeSecType.children[0].children)).toBeTruthy();
                expect(breakdownTreeNodeSecType.children[0].isSelected).toBeTruthy();
            });
            it('Test Copy selected node and child', () => {
                component.onContextMenuClick({
                    detail:
                        {
                            label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.COPY_NODE_AND_CHILD,
                            value:
                                {
                                    uid: '1234'
                                }
                        }
                } as any);
                expect(component.breakdownTreeNodeCopyAction.copyChildren).toBeTruthy();
                expect(breakdownTreeNodeTotal.contextMenu[0].isDisabled).toBeFalsy();
                expect(breakdownTreeNodeSecType.contextMenu[4].isDisabled).toBeFalsy();
                expect(breakdownTreeNodeCustomSector.contextMenu[4].isDisabled).toBeFalsy();
                component.onContextMenuClick({
                    detail:
                        {
                            label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.PASTE,
                            value:
                                {
                                    uid: '1235'
                                }
                        }
                } as any);
                expect(omit(breakdownTreeNodeSecType.children[0], 'parent', 'children', 'uid', 'isSelected')).toEqual(omit(breakdownTreeNodeCustomSector, 'parent', 'children', 'uid', 'isSelected'));
                expect(isEmpty(breakdownTreeNodeSecType.children[0].children)).toBeFalsy();
                expect(omit(breakdownTreeNodeSecType.children[0].children[0], 'parent', 'children', 'uid', 'isSelected')).toEqual(omit(breakdownTreeNodeCustomSector.children[0], 'parent', 'children', 'uid', 'isSelected'));
                expect(breakdownTreeNodeSecType.children[0].isSelected).toBeTruthy();
            });
        });
        it('Test deleteNode menus', () => {
            component.breakdownTreeData = [breakdownTreeNodeTotal];
            jest.spyOn<any, any>(component, 'deleteNode').mockReturnValue(null);
            component.onContextMenuClick({
                detail:
                    {
                        label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.DELETE_NODE,
                        value:
                            {
                                uid: '123'
                            }
                    }
            } as any);
            expect(component['deleteNode']).toHaveBeenCalledWith(breakdownTreeNodeTotal, false);
            component.onContextMenuClick({
                detail:
                    {
                        label: BreakdownConstants.BREAKDOWN_TREE_CONTEXT_MENU_LABELS.DELETE_NODE_AND_CHILD,
                        value:
                            {
                                uid: '123'
                            }
                    }
            } as any);
            expect(component['deleteNode']).toHaveBeenCalledWith(breakdownTreeNodeTotal, true);
        });
    });

    it('Test onNodeDoubleClick', () => {
        const breakdownTreeNodeTotal = new BreakdownTreeNode();
        breakdownTreeNodeTotal.label = 'Total';
        breakdownTreeNodeTotal.isExpanded = true;
        breakdownTreeNodeTotal.parent = undefined;
        breakdownTreeNodeTotal.type = 'root';
        breakdownTreeNodeTotal.isSelected = true;
        breakdownTreeNodeTotal.uid = '123';
        const breakdownTreeNodeCustomSector = new BreakdownTreeNode();
        breakdownTreeNodeCustomSector.label = 'Custom Sector';
        breakdownTreeNodeCustomSector.type = 'custom';
        breakdownTreeNodeCustomSector.isExpanded = true;
        breakdownTreeNodeCustomSector.parent = breakdownTreeNodeTotal;
        breakdownTreeNodeCustomSector.enableContextMenu();
        breakdownTreeNodeCustomSector.isDeletable = true;
        breakdownTreeNodeCustomSector.uid = '546';
        breakdownTreeNodeTotal.children = [breakdownTreeNodeCustomSector];
        component.breakdownTreeData = [breakdownTreeNodeTotal];
        jest.spyOn<any, any>(component, 'deleteNode').mockReturnValue(null);
        component.onNodeDoubleClick({detail: {value: {uid: '546'}}} as CustomEvent);
        expect(component['deleteNode']).toHaveBeenCalledWith(breakdownTreeNodeCustomSector, true);
    });

    describe('Test updateBreakdownTreeData', () => {
        let breakdownTreeNodeTotal: BreakdownTreeNode;
        let breakdownTreeNodeCustomSector: BreakdownTreeNode;
        let breakdownTreeNodeSecType: BreakdownTreeNode;
        beforeEach(() => {
            const breakdown = new Breakdown();
            const secTypeColumnSector = new ColumnSector();
            secTypeColumnSector.columnName = 'Security Type';
            const customSector = new CustomSector();
            customSector.title = 'Custom Sector';
            const linkedSector = new LinkedFavoriteSector();
            linkedSector.sector = customSector;
            linkedSector.children = [secTypeColumnSector];
            breakdown.children = [linkedSector];
            breakdownTreeNodeTotal = new BreakdownTreeNode();
            breakdownTreeNodeTotal.label = 'Total';
            breakdownTreeNodeTotal.isExpanded = true;
            breakdownTreeNodeTotal.parent = undefined;
            breakdownTreeNodeTotal.sectorModel = breakdown;
            breakdownTreeNodeTotal.type = 'root';
            breakdownTreeNodeTotal.isSelected = true;
            breakdownTreeNodeCustomSector = new BreakdownTreeNode();
            breakdownTreeNodeCustomSector.label = 'Custom Sector';
            breakdownTreeNodeCustomSector.type = 'custom';
            breakdownTreeNodeCustomSector.isExpanded = true;
            breakdownTreeNodeCustomSector.parent = breakdownTreeNodeTotal;
            breakdownTreeNodeCustomSector.sectorModel = linkedSector;
            breakdownTreeNodeCustomSector.enableContextMenu();
            breakdownTreeNodeCustomSector.isDeletable = true;
            breakdownTreeNodeSecType = new BreakdownTreeNode();
            breakdownTreeNodeSecType.label = 'Security Type';
            breakdownTreeNodeSecType.type = 'groupBy';
            breakdownTreeNodeSecType.isExpanded = true;
            breakdownTreeNodeSecType.parent = breakdownTreeNodeCustomSector;
            breakdownTreeNodeSecType.sectorModel = secTypeColumnSector;
            breakdownTreeNodeSecType.enableContextMenu();
            breakdownTreeNodeSecType.isDeletable = true;
            breakdownTreeNodeCustomSector.children = [breakdownTreeNodeSecType];
            breakdownTreeNodeTotal.children = [breakdownTreeNodeCustomSector];
            component.breakdownTreeData = [breakdownTreeNodeTotal];
        });

        it('column sector, parent having column sector as child', () => {
            const secGroupColumnSector = new ColumnSector();
            secGroupColumnSector.columnName = 'Security Group';
            const breakdownTreeNodeSecGroup = new BreakdownTreeNode();
            breakdownTreeNodeSecGroup.label = 'Security Group';
            breakdownTreeNodeSecGroup.type = 'groupBy';
            breakdownTreeNodeSecGroup.isExpanded = true;
            breakdownTreeNodeSecGroup.parent = breakdownTreeNodeCustomSector;
            breakdownTreeNodeSecGroup.sectorModel = secGroupColumnSector;
            breakdownTreeNodeSecGroup.enableContextMenu();
            breakdownTreeNodeSecGroup.isDeletable = true;
            component['updateBreakdownTreeData'](breakdownTreeNodeSecGroup);
            expect(breakdownTreeNodeSecGroup.children).toEqual([breakdownTreeNodeSecType]);
            expect(breakdownTreeNodeCustomSector.children).toEqual([breakdownTreeNodeSecGroup]);
        });
        it('column sector, parent having no child', () => {
            const secGroupColumnSector = new ColumnSector();
            secGroupColumnSector.columnName = 'Security Group';
            const breakdownTreeNodeSecGroup = new BreakdownTreeNode();
            breakdownTreeNodeSecGroup.label = 'Security Group';
            breakdownTreeNodeSecGroup.type = 'groupBy';
            breakdownTreeNodeSecGroup.isExpanded = true;
            breakdownTreeNodeSecGroup.parent = breakdownTreeNodeSecType;
            breakdownTreeNodeSecGroup.sectorModel = secGroupColumnSector;
            breakdownTreeNodeSecGroup.enableContextMenu();
            breakdownTreeNodeSecGroup.isDeletable = true;
            component['updateBreakdownTreeData'](breakdownTreeNodeSecGroup);
            expect(breakdownTreeNodeSecGroup.children).toBeUndefined();
            expect(breakdownTreeNodeSecType.children).toEqual([breakdownTreeNodeSecGroup]);
        });
        it('custom sector, parent having column sector as child', () => {
            const customSector = new CustomSector();
            customSector.title = 'Custom Sector';
            const linkedSector = new LinkedFavoriteSector();
            linkedSector.sector = customSector;
            const breakdownTreeNodeNewCustomSector = new BreakdownTreeNode();
            breakdownTreeNodeNewCustomSector.label = 'Custom';
            breakdownTreeNodeNewCustomSector.type = 'groupBy';
            breakdownTreeNodeNewCustomSector.isExpanded = true;
            breakdownTreeNodeNewCustomSector.parent = breakdownTreeNodeCustomSector;
            breakdownTreeNodeNewCustomSector.sectorModel = linkedSector;
            breakdownTreeNodeNewCustomSector.enableContextMenu();
            breakdownTreeNodeNewCustomSector.isDeletable = true;
            component['updateBreakdownTreeData'](breakdownTreeNodeNewCustomSector);
            expect(breakdownTreeNodeCustomSector.children).toEqual([breakdownTreeNodeNewCustomSector, breakdownTreeNodeSecType]);
        });
        it('custom sector, parent having no child', () => {
            const customSector = new CustomSector();
            customSector.title = 'Custom Sector';
            const linkedSector = new LinkedFavoriteSector();
            linkedSector.sector = customSector;
            const breakdownTreeNodeNewCustomSector = new BreakdownTreeNode();
            breakdownTreeNodeNewCustomSector.label = 'Custom';
            breakdownTreeNodeNewCustomSector.type = 'groupBy';
            breakdownTreeNodeNewCustomSector.isExpanded = true;
            breakdownTreeNodeNewCustomSector.parent = breakdownTreeNodeSecType;
            breakdownTreeNodeNewCustomSector.sectorModel = linkedSector;
            breakdownTreeNodeNewCustomSector.enableContextMenu();
            breakdownTreeNodeNewCustomSector.isDeletable = true;
            component['updateBreakdownTreeData'](breakdownTreeNodeNewCustomSector);
            expect(breakdownTreeNodeSecType.children).toEqual([breakdownTreeNodeNewCustomSector]);
        });
    });

    describe('Test deleteNode', () => {
        let breakdownTreeNodeTotal: BreakdownTreeNode;
        let breakdownTreeNodeCustomSector: BreakdownTreeNode;
        let breakdownTreeNodeSecType: BreakdownTreeNode;
        beforeEach(() => {
            const breakdown = new Breakdown();
            const secTypeColumnSector = new ColumnSector();
            secTypeColumnSector.columnName = 'Security Type';
            const customSector = new CustomSector();
            customSector.title = 'Custom Sector';
            const linkedSector = new LinkedFavoriteSector();
            linkedSector.sector = customSector;
            linkedSector.children = [secTypeColumnSector];
            breakdown.children = [linkedSector];
            breakdownTreeNodeTotal = new BreakdownTreeNode();
            breakdownTreeNodeTotal.label = 'Total';
            breakdownTreeNodeTotal.isExpanded = true;
            breakdownTreeNodeTotal.parent = undefined;
            breakdownTreeNodeTotal.sectorModel = breakdown;
            breakdownTreeNodeTotal.type = 'root';
            breakdownTreeNodeTotal.isSelected = true;
            breakdownTreeNodeCustomSector = new BreakdownTreeNode();
            breakdownTreeNodeCustomSector.label = 'Custom Sector';
            breakdownTreeNodeCustomSector.type = 'custom';
            breakdownTreeNodeCustomSector.isExpanded = true;
            breakdownTreeNodeCustomSector.parent = breakdownTreeNodeTotal;
            breakdownTreeNodeCustomSector.sectorModel = linkedSector;
            breakdownTreeNodeCustomSector.enableContextMenu();
            breakdownTreeNodeCustomSector.isDeletable = true;
            breakdownTreeNodeSecType = new BreakdownTreeNode();
            breakdownTreeNodeSecType.label = 'Security Type';
            breakdownTreeNodeSecType.type = 'groupBy';
            breakdownTreeNodeSecType.isExpanded = true;
            breakdownTreeNodeSecType.parent = breakdownTreeNodeCustomSector;
            breakdownTreeNodeSecType.sectorModel = secTypeColumnSector;
            breakdownTreeNodeSecType.enableContextMenu();
            breakdownTreeNodeSecType.isDeletable = true;
            breakdownTreeNodeCustomSector.children = [breakdownTreeNodeSecType];
            breakdownTreeNodeTotal.children = [breakdownTreeNodeCustomSector];
            component.breakdownTreeData = [breakdownTreeNodeTotal];
            component.breakdownBuilderSettings = new BreakdownBuilderSettings();
        });

        it('Delete children', () => {
            component['deleteNode'](breakdownTreeNodeCustomSector, true);
            expect(breakdownTreeNodeTotal.children.indexOf(breakdownTreeNodeCustomSector) >= 0).toBeFalsy();
            expect(breakdownTreeNodeTotal.sectorModel.children.indexOf(breakdownTreeNodeCustomSector.sectorModel) >= 0).toBeFalsy();
        });
        it('group-by items same level warning', () => {
            const secGroupColumnSector = new ColumnSector();
            secGroupColumnSector.columnName = 'Security Group';
            const breakdownTreeNodeSecGroup = new BreakdownTreeNode();
            breakdownTreeNodeSecGroup.label = 'Security Group';
            breakdownTreeNodeSecGroup.type = 'groupBy';
            breakdownTreeNodeSecGroup.isExpanded = true;
            breakdownTreeNodeSecGroup.parent = breakdownTreeNodeTotal;
            breakdownTreeNodeSecGroup.sectorModel = secGroupColumnSector;
            breakdownTreeNodeSecGroup.enableContextMenu();
            breakdownTreeNodeSecGroup.isDeletable = true;
            breakdownTreeNodeTotal.sectorModel.children.push(secGroupColumnSector);
            breakdownTreeNodeTotal.children.push(breakdownTreeNodeSecGroup);
            component['deleteNode'](breakdownTreeNodeCustomSector, false);
            expect(notificationServiceMock.error).toHaveBeenCalled();
            expect(breakdownTreeNodeTotal.children.indexOf(breakdownTreeNodeCustomSector) >= 0).toBeTruthy();
            expect(breakdownTreeNodeTotal.sectorModel.children.indexOf(breakdownTreeNodeCustomSector.sectorModel) >= 0).toBeTruthy();
        });
        it('Delete children false', () => {
            component['deleteNode'](breakdownTreeNodeCustomSector, false);
            expect(breakdownTreeNodeTotal.children.indexOf(breakdownTreeNodeCustomSector) >= 0).toBeFalsy();
            expect(breakdownTreeNodeTotal.sectorModel.children.indexOf(breakdownTreeNodeCustomSector.sectorModel) >= 0).toBeFalsy();
            expect(breakdownTreeNodeTotal.children.indexOf(breakdownTreeNodeSecType) >= 0).toBeTruthy();
            expect(breakdownTreeNodeTotal.sectorModel.children.indexOf(breakdownTreeNodeSecType.sectorModel) >= 0).toBeTruthy();
        });
        it('Root node', () => {
            component.singleLevelNodeInserted = true;
            component['deleteNode'](breakdownTreeNodeTotal, false);
            expect(breakdownTreeNodeTotal.isEmpty()).toBeTruthy();
            expect(breakdownTreeNodeTotal.sectorModel.children.length === 0).toBeTruthy();
            expect(component.singleLevelNodeInserted).toBeFalsy();
        });
        it('deleteNode for preset breakdown', () => {
            breakdownTreeNodeTotal = new BreakdownTreeNode();
            breakdownTreeNodeTotal.label = 'Total';
            breakdownTreeNodeTotal.isExpanded = true;
            breakdownTreeNodeTotal.parent = undefined;
            breakdownTreeNodeTotal.sectorModel = new Breakdown();
            breakdownTreeNodeTotal.type = 'root';
            breakdownTreeNodeTotal.isSelected = true;
            breakdownTreeNodeTotal.uid = '123';
            const presetBreakdown = new Breakdown();
            presetBreakdown.presetBreakdownId = 'iaa_breakdown';
            presetBreakdown.isConfigured = true;
            presetBreakdown.title = 'IAA Breakdown';
            const presetBreakdownNode = BreakdownUtils.convertPlaceholderBreakdownToNode(presetBreakdown, breakdownTreeNodeTotal);
            breakdownTreeNodeTotal.children = [presetBreakdownNode];
            breakdownTreeNodeTotal.sectorModel = new ColumnSector();

            component.breakdownTreeData = [breakdownTreeNodeTotal];
            component.breakdown = presetBreakdown;
            component.placeholderBreakdownNodeInserted = true;

            component['deleteNode'](presetBreakdownNode, true);

            expect(component.breakdown.presetBreakdownId).toBeUndefined();
            expect(component.breakdown.title).toBeUndefined();
            expect(component.breakdownTreeData[0].children).toBeUndefined();
            expect(component.placeholderBreakdownNodeInserted).toEqual(false);
        });
    });

    it('Test onSectorTitleChange', () => {
        const breakdownTreeNodeTotal = new BreakdownTreeNode();
        breakdownTreeNodeTotal.label = 'Total';
        breakdownTreeNodeTotal.isExpanded = true;
        breakdownTreeNodeTotal.parent = undefined;
        breakdownTreeNodeTotal.sectorModel = new Breakdown();
        breakdownTreeNodeTotal.type = 'root';
        breakdownTreeNodeTotal.isSelected = true;
        breakdownTreeNodeTotal.uid = '123';
        const secGroupColumnSector = new ColumnSector();
        secGroupColumnSector.columnName = 'Security Group';
        const breakdownTreeNodeSecGroup = new BreakdownTreeNode();
        breakdownTreeNodeSecGroup.label = 'Security Group';
        breakdownTreeNodeSecGroup.type = 'groupBy';
        breakdownTreeNodeSecGroup.isExpanded = true;
        breakdownTreeNodeSecGroup.parent = breakdownTreeNodeTotal;
        breakdownTreeNodeSecGroup.sectorModel = secGroupColumnSector;
        breakdownTreeNodeSecGroup.enableContextMenu();
        breakdownTreeNodeSecGroup.isDeletable = true;
        breakdownTreeNodeSecGroup.uid = '453';
        breakdownTreeNodeTotal.children = [breakdownTreeNodeSecGroup];
        component.breakdownTreeData = [breakdownTreeNodeTotal];
        component.selectedSectorNode = breakdownTreeNodeSecGroup;
        secGroupColumnSector.columnName = 'Test';
        component.onSectorTitleChange();
        expect(component.selectedSectorNode.label).toEqual('Test');
    });

    describe('Test getSectorBreakdownTreeNode', () => {

        it('Test getColumnSectorNode && sector Type Individual Measures', () => {
            const columnDefinition = new ColumnDefinition();
            columnDefinition.columnTag = 'sec_type';
            columnDefinition.uses = 'All';
            columnDefinition.title = 'Security Type';
            columnDefinition.dataType = 'STRING';
            const columnSector = new ColumnSector();
            columnSector.useNoneBuckets = true;
            columnSector.columnTag = columnDefinition.columnTag;
            columnSector.columnName = columnDefinition.title;
            columnSector.dataType = 'STRING';
            columnSector.positionColumnType = 'All';
            expect(component['getSectorBreakdownTreeNode'](new BreakdownSectorSelectorOption('Positions', undefined, undefined,
                BreakdownSectorSelectorOptionType.INDIVIDUAL_MEASURES, columnDefinition, false)).sectorModel).toEqual(columnSector);
        });

        it('tests getColumnSectorNode', () => {
            const columnDefinition: ColumnDefinition = new ColumnDefinition({
                columnTag: 'a_b',
                field: 'b_b',
                title: 'sample'
            });
            component.breakdownBuilderSettings = new BreakdownBuilderSettings();
            component.breakdownBuilderSettings.fieldToUse = 'columnTag';
            expect((component['getColumnSectorNode'](columnDefinition).sectorModel as ColumnSector).columnTag).toBe('a_b');
            component.breakdownBuilderSettings.fieldToUse = 'field';
            expect((component['getColumnSectorNode'](columnDefinition).sectorModel as ColumnSector).columnTag).toBe('b_b');
        });

        it('Test getFavoriteCustomSectorNode', fakeAsync(() => {
            const favCustomSector = new CustomSector();
            favCustomSector.title = 'Test Custom Sector';
            favCustomSector.id = 342;
            favCustomSector.owner = 'simsingh';
            jest.spyOn(favoriteServiceMock, 'getFavorite$').mockReturnValue(
                of(favCustomSector)
            );
            const expectedSectorAdded = new LinkedFavoriteSector();
            expectedSectorAdded.sector = new CustomSector();
            expectedSectorAdded.sector.title = 'Test Custom Sector';
            expectedSectorAdded.sector.id = 342;
            expectedSectorAdded.sector.owner = 'simsingh';
            let favoriteNode: AuxAdvancedTreeListInterface;
            favoriteNode = {label: 'Test Custom Sector', eventData: {favoriteId: 342}};
            let breakdownTreeNode = component['getSectorBreakdownTreeNode'](favoriteNode);
            tick();
            expect(breakdownTreeNode.sectorModel).toEqual(expectedSectorAdded);
            jest.spyOn(favoriteServiceMock, 'getFavorite$').mockReturnValue(
                throwError('Error')
            );
            expectedSectorAdded.sector.title = 'Failed to load: Test Custom Sector';
            expectedSectorAdded.sector.owner = undefined;
            breakdownTreeNode = component['getSectorBreakdownTreeNode'](favoriteNode);
            tick();
            expect(breakdownTreeNode.sectorModel).toEqual(expectedSectorAdded);
        }) as any);

        describe('Test getGPBreakdownNode', () => {
            it('Is GpBreakdownColumnDefinition', () => {
                const gpBreakdownColumnDefinition = new GpBreakdownColumnDefinition();
                gpBreakdownColumnDefinition.columnTag = 'gp_column';
                gpBreakdownColumnDefinition.uses = 'ALL';
                gpBreakdownColumnDefinition.title = 'GP Column';
                gpBreakdownColumnDefinition.dataType = 'STRING';
                gpBreakdownColumnDefinition.levelColumns = ['gp_column_level_1', 'gp_column_level_2'];
                jest.spyOn(CoreColumnUtils, 'getColumnDefByTagAndUse').mockImplementation((columnTag: string, positionColumnType: string) => {
                    const column = new ColumnDefinition();
                    column.columnTag = columnTag;
                    column.title = columnTag.toUpperCase();
                    column.uses = 'ALL';
                    column.dataType = 'STRING';
                    return column;
                });
                const breakdownTreeNodeLevel1SectorModel = new ColumnSector();
                breakdownTreeNodeLevel1SectorModel.useNoneBuckets = false;
                breakdownTreeNodeLevel1SectorModel.columnTag = 'gp_column_level_1';
                breakdownTreeNodeLevel1SectorModel.columnName = 'GP_COLUMN_LEVEL_1';
                breakdownTreeNodeLevel1SectorModel.dataType = 'STRING';
                breakdownTreeNodeLevel1SectorModel.positionColumnType = 'ALL';
                const breakdownTreeNodeLevel1 = BreakdownUtils.convertBreakdown(breakdownTreeNodeLevel1SectorModel, undefined);
                const breakdownTreeNodeLevel2SectorModel = new ColumnSector();
                breakdownTreeNodeLevel2SectorModel.useNoneBuckets = false;
                breakdownTreeNodeLevel2SectorModel.columnTag = 'gp_column_level_2';
                breakdownTreeNodeLevel2SectorModel.columnName = 'GP_COLUMN_LEVEL_2';
                breakdownTreeNodeLevel2SectorModel.dataType = 'STRING';
                breakdownTreeNodeLevel2SectorModel.positionColumnType = 'ALL';
                const breakdownTreeNodeLevel2 = BreakdownUtils.convertBreakdown(breakdownTreeNodeLevel2SectorModel, undefined);
                breakdownTreeNodeLevel1.children = [breakdownTreeNodeLevel2];
                breakdownTreeNodeLevel2.parent = breakdownTreeNodeLevel1;
                const gpBreakdownNodeTree = component['getSectorBreakdownTreeNode'](new BreakdownSectorSelectorOption('Common Hr', undefined, undefined,
                    BreakdownSectorSelectorOptionType.COMMON_HIERARCHIES, gpBreakdownColumnDefinition, false));
                TestUtils.removeUIDFromAdvanceTreeListNodes([gpBreakdownNodeTree]);
                TestUtils.removeUIDFromAdvanceTreeListNodes([breakdownTreeNodeLevel1]);
                expect(gpBreakdownNodeTree).toEqual(breakdownTreeNodeLevel1);
            });
            it('Is performance breakdown', () => {
                component.breakdownTreeData = [new BreakdownTreeNode()];
                component.singleLevelNodeInserted = false;
                const perfColDef = new ColumnDefinition();
                perfColDef.columnTag = 'perf_column';
                perfColDef.uses = 'ALL';
                perfColDef.title = 'Performance Column';
                perfColDef.dataType = 'STRING';
                const perfOption = new BreakdownSectorSelectorOption(' Performance Column', undefined, undefined,
                    BreakdownSectorSelectorOptionType.COMMON_HIERARCHIES, perfColDef, false);
                perfOption.parent = new BreakdownSectorSelectorOption(BreakdownConstants.BREAKDOWN_TYPE.PERFORMANCE_BREAKDOWN);
                const breakdownTreeNodeSectorModel = new ColumnSector();
                breakdownTreeNodeSectorModel.useNoneBuckets = true;
                breakdownTreeNodeSectorModel.columnTag = 'perf_column';
                breakdownTreeNodeSectorModel.columnName = 'Performance Column';
                breakdownTreeNodeSectorModel.dataType = 'STRING';
                breakdownTreeNodeSectorModel.positionColumnType = 'ALL';
                const breakdownTreeNode = BreakdownUtils.convertBreakdown(breakdownTreeNodeSectorModel, undefined);
                const actualBreakdownNode = component['getSectorBreakdownTreeNode'](perfOption);
                TestUtils.removeUIDFromAdvanceTreeListNodes([breakdownTreeNode]);
                TestUtils.removeUIDFromAdvanceTreeListNodes([actualBreakdownNode]);
                expect(actualBreakdownNode).toEqual(breakdownTreeNode);
                expect(component.singleLevelNodeInserted).toBeTruthy();
            });
            it('Please remove existing nodes to add performance breakdown. notification', () => {
                component.breakdownTreeData = [new BreakdownTreeNode()];
                component.breakdownTreeData[0].children = [new BreakdownTreeNode()];
                component.singleLevelNodeInserted = false;
                const perfColDef = new ColumnDefinition();
                perfColDef.columnTag = 'perf_column';
                perfColDef.uses = 'ALL';
                perfColDef.title = 'Performance Column';
                perfColDef.dataType = 'STRING';
                const perfOption = new BreakdownSectorSelectorOption(' Performance Column', undefined, undefined,
                    BreakdownSectorSelectorOptionType.COMMON_HIERARCHIES, perfColDef, false);
                perfOption.parent = new BreakdownSectorSelectorOption(BreakdownConstants.BREAKDOWN_TYPE.PERFORMANCE_BREAKDOWN);
                expect(component['getSectorBreakdownTreeNode'](perfOption)).toBeUndefined();
                expect(notificationServiceMock.error).toHaveBeenCalledWith('Please remove existing nodes to add performance breakdown.', ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SECTOR_NODE_INSERTION_ERROR);
                expect(component.singleLevelNodeInserted).toBeFalsy();
            });

            it('Please remove existing nodes to add Factor model mapping. notification', () => {
                component.breakdownTreeData = [new BreakdownTreeNode()];
                component.breakdownTreeData[0].children = [new BreakdownTreeNode()];
                component.singleLevelNodeInserted = false;
                const definition = new ColumnDefinition();
                definition.columnTag = 'MACRO';
                definition.uses = 'ALL';
                definition.title = 'Macro Model Global';
                definition.dataType = 'STRING';
                const selectorOption = new BreakdownSectorSelectorOption(' Factor Mapping Column', undefined, undefined,
                    BreakdownSectorSelectorOptionType.INDIVIDUAL_MEASURES, definition, false);
                selectorOption.parent = new BreakdownSectorSelectorOption(BreakdownConstants.BREAKDOWN_TYPE.FACTOR_MAPPINGS);
                expect(component['getSectorBreakdownTreeNode'](selectorOption)).toBeUndefined();
                expect(notificationServiceMock.error).toHaveBeenCalledWith(NotificationConstants.FACTOR_MAPPING_SECTOR_INSERT_ERROR_MSG, ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_SECTOR_NODE_INSERTION_ERROR);
                expect(component.singleLevelNodeInserted).toBeFalsy();
            });

            it('Test - Add macro factor breakdown', () => {
                component.breakdownTreeData = [new BreakdownTreeNode()];
                component.breakdownTreeData[0].children = [];
                component.singleLevelNodeInserted = false;
                const definition = new ColumnDefinition();
                definition.columnTag = 'MACRO';
                definition.uses = 'ALL';
                definition.title = 'Macro Model-Global';
                definition.dataType = 'STRING';
                const selectorOption = new BreakdownSectorSelectorOption(' Factor Mapping Column', undefined, undefined,
                    BreakdownSectorSelectorOptionType.INDIVIDUAL_MEASURES, definition, false);
                selectorOption.parent = null;

                const breakdownTreeNodeSectorModel = new ColumnSector();
                breakdownTreeNodeSectorModel.useNoneBuckets = true;
                breakdownTreeNodeSectorModel.columnTag = 'MACRO';
                breakdownTreeNodeSectorModel.columnName = 'Macro Model-Global';
                breakdownTreeNodeSectorModel.dataType = 'STRING';
                breakdownTreeNodeSectorModel.positionColumnType = 'ALL';
                const breakdownTreeNode = BreakdownUtils.convertBreakdown(breakdownTreeNodeSectorModel, undefined);

                const actualBreakdownNode = component['getSectorBreakdownTreeNode'](selectorOption);
                TestUtils.removeUIDFromAdvanceTreeListNodes([breakdownTreeNode]);
                TestUtils.removeUIDFromAdvanceTreeListNodes([actualBreakdownNode]);
                expect(actualBreakdownNode).toEqual(breakdownTreeNode);
            });
            it('Test adding Market Value breakdown (explore_sectors)', () => {
                component.breakdownTreeData = [new BreakdownTreeNode()];
                component.singleLevelNodeInserted = false;
                const colDef = new ColumnDefinition();
                colDef.columnTag = 'market_val';
                colDef.uses = 'PORT';
                colDef.title = 'Market Value';
                colDef.dataType = 'DOUBLE';
                colDef.columnReports = ['explore_sectors'];
                const option = new BreakdownSectorSelectorOption('Market Value', undefined, undefined,
                    BreakdownSectorSelectorOptionType.INDIVIDUAL_MEASURES, colDef, false);
                option.parent = new BreakdownSectorSelectorOption('Position');
                const breakdownTreeNodeSectorModel = new NumericColumnSector();
                breakdownTreeNodeSectorModel.useNoneBuckets = true;
                breakdownTreeNodeSectorModel.columnTag = 'market_val';
                breakdownTreeNodeSectorModel.columnName = 'Market Value';
                breakdownTreeNodeSectorModel.dataType = 'DOUBLE';
                breakdownTreeNodeSectorModel.positionColumnType = 'PORT';
                const breakdownTreeNode = BreakdownUtils.convertBreakdown(breakdownTreeNodeSectorModel, undefined);
                const actualBreakdownNode = component['getSectorBreakdownTreeNode'](option);
                TestUtils.removeUIDFromAdvanceTreeListNodes([breakdownTreeNode]);
                TestUtils.removeUIDFromAdvanceTreeListNodes([actualBreakdownNode]);
                expect(actualBreakdownNode).toEqual(breakdownTreeNode);
                expect(component.singleLevelNodeInserted).toBeTruthy();
            });
        });
    });

    it('Test addSectorSubject$', fakeAsync(() => {
        component.breakdown = new Breakdown();
        jest.spyOn(component as any, 'getSectorBreakdownTreeNode').mockReturnValue(undefined);
        component.addSectorSubject$ = new BehaviorSubject<AuxAdvancedTreeListInterface>(null);
        component.ngOnInit();
        tick();
        expect(component['getSectorBreakdownTreeNode']).not.toHaveBeenCalled();
        jest.spyOn(component as any, 'addBreakdownNode').mockReturnValue(undefined);
        jest.spyOn(component as any, 'addGPBreakdownTree');
        component.addSectorSubject$.next(new BreakdownSectorSelectorOption('Test'));
        tick();
        expect(component['getSectorBreakdownTreeNode']).toHaveBeenCalled();
        expect(component['addBreakdownNode']).not.toHaveBeenCalled();
        expect(component['addGPBreakdownTree']).not.toHaveBeenCalled();
        const breakdownTreeNode = new BreakdownTreeNode();
        breakdownTreeNode.sectorModel = new ColumnSector();
        jest.spyOn(component as any, 'getSectorBreakdownTreeNode').mockReturnValue(breakdownTreeNode);
        component.addSectorSubject$.next(new BreakdownSectorSelectorOption('Test'));
        expect(component['addBreakdownNode']).toHaveBeenCalled();
        expect(component['addGPBreakdownTree']).not.toHaveBeenCalled();
        // Mimicking gp breakdown tree
        breakdownTreeNode.children = [new BreakdownTreeNode()];
        component.addSectorSubject$.next(new BreakdownSectorSelectorOption('Test'));
        expect(component['addBreakdownNode']).toHaveBeenCalledTimes(3);
        expect(component['addGPBreakdownTree']).toHaveBeenCalled();
    }) as any);

    it('Test addSectorSubject$ - mandate default breakdown', () => {
        component.breakdownTreeData = [];
        component.breakdown = new Breakdown();
        component.addSectorSubject$ = new BehaviorSubject<AuxAdvancedTreeListInterface>(null);
        component.ngOnInit();
        const spyBreakdownUpdated = jest.spyOn(component.breakdownUpdated, 'emit');
        component.addSectorSubject$.next(BreakdownUtils.MANDATE_DEFAULT_BKD_OPTION);
        expect(component.breakdown.isMandateDefaultBreakdown).toEqual(true);
        expect(component.breakdown.title).toEqual(BreakdownConstants.MANDATE_DEFAULT_BREAKDOWN_TITLE);
        expect(component.breakdown.children).toEqual([]);

        expect(component.placeholderBreakdownNodeInserted).toEqual(true);
        expect(component.breakdownTreeData).toHaveLength(1);
        const rootNode = component.breakdownTreeData[0];
        expect(rootNode.label).toEqual('Total');
        expect(rootNode.type).toEqual(BreakdownTreeNode.TYPE_ROOT);
        expect(rootNode.children).toHaveLength(1);

        expect(rootNode.children[0].label).toEqual(BreakdownConstants.MANDATE_DEFAULT_BREAKDOWN_TITLE);
        expect(rootNode.children[0].type).toEqual(BreakdownTreeNode.TYPE_PLACEHOLDER);

        expect(rootNode.sectorModel).toBeInstanceOf(Breakdown);
        expect((rootNode.sectorModel as Breakdown).isMandateDefaultBreakdown).toEqual(true);

        expect(spyBreakdownUpdated).toHaveBeenCalledTimes(1);
    });

    it('Test addSectorSubject$ - user defined schema', () => {
        const breakdownTreeNodeTotal = new BreakdownTreeNode();
        breakdownTreeNodeTotal.label = 'Total';
        breakdownTreeNodeTotal.uid = '546';
        breakdownTreeNodeTotal.sectorModel = new Breakdown();
        component.breakdownTreeData = [breakdownTreeNodeTotal];
        component.selectedSectorNode = breakdownTreeNodeTotal;

        component.breakdown = new Breakdown();
        component.addSectorSubject$ = new BehaviorSubject<AuxAdvancedTreeListInterface>(null);
        component.ngOnInit();
        component.addSectorSubject$.next(BreakdownUtils.FACTOR_SPACE_USER_SCHEMA);
        expect(component.breakdown.children.length).toEqual(1);
        expect(component.breakdown.children[0] instanceof SchemaSector).toBeTruthy();
        expect(component.breakdown.children[0].getTitle()).toEqual(BreakdownConstants.FACTOR_SPACE_USER_SPECIFIED_SCHEMA_TITLE);

        expect(component.singleLevelNodeInserted).toEqual(true);
        expect(component.breakdownTreeData).toHaveLength(1);
        expect(component.breakdownTreeData[0].label).toEqual('Total');
        expect(component.breakdownTreeData[0].children).toHaveLength(1);
        expect(component.breakdownTreeData[0].children[0].label).toEqual(BreakdownConstants.FACTOR_SPACE_USER_SPECIFIED_SCHEMA_TITLE);
        expect(component.breakdownTreeData[0].children[0].sectorModel instanceof SchemaSector).toBeTruthy();
        expect(component.breakdownTreeData[0].children[0].sectorModel.getTitle()).toEqual(BreakdownConstants.FACTOR_SPACE_USER_SPECIFIED_SCHEMA_TITLE);
    });

    describe('Test addBreakdownNode', () => {
        let breakdownTreeNodeSecType: BreakdownTreeNode;
        let breakdownTreeNodeTotal: BreakdownTreeNode;
        beforeEach(() => {
            breakdownTreeNodeTotal = new BreakdownTreeNode();
            breakdownTreeNodeTotal.label = 'Total';
            breakdownTreeNodeTotal.uid = '546';
            breakdownTreeNodeTotal.sectorModel = new Breakdown();
            component.breakdownTreeData = [breakdownTreeNodeTotal];
            breakdownTreeNodeSecType = new BreakdownTreeNode();
            breakdownTreeNodeSecType.uid = '657';
            breakdownTreeNodeSecType.label = 'Security Type';
            const secTypeColumnSector = new ColumnSector();
            secTypeColumnSector.columnName = 'Security Type';
            breakdownTreeNodeSecType.sectorModel = secTypeColumnSector;
            breakdownTreeNodeTotal.children = [breakdownTreeNodeSecType];
            component.selectedSectorNode = breakdownTreeNodeTotal;
            jest.spyOn(component as any, 'updateBreakdownTreeData').mockReturnValue(null);
            component.breakdownBuilderSettings = new BreakdownBuilderSettings();
        });
        it('node is Undefined', () => {
            component['addBreakdownNode'](undefined);
            expect(component['updateBreakdownTreeData']).not.toHaveBeenCalled();
        });
        it('parent is undefined', () => {
            const breakdownTreeNode = new BreakdownTreeNode();
            component['addBreakdownNode'](breakdownTreeNode);
            expect(component.selectedSectorNode).toEqual(breakdownTreeNode);
            expect(breakdownTreeNode.parent).toEqual(breakdownTreeNodeTotal);
        });
        it('parent is defined', () => {
            const breakdownTreeNode = new BreakdownTreeNode();
            component['addBreakdownNode'](breakdownTreeNode, breakdownTreeNodeSecType);
            expect(component.selectedSectorNode).toEqual(breakdownTreeNode);
            expect(breakdownTreeNode.parent).toEqual(breakdownTreeNodeSecType);
        });
        it('parent is defined and selectNode as false', () => {
            const breakdownTreeNode = new BreakdownTreeNode();
            component['addBreakdownNode'](breakdownTreeNode, breakdownTreeNodeSecType, false);
            expect(component.selectedSectorNode).not.toEqual(breakdownTreeNode);
            expect(breakdownTreeNode.parent).toEqual(breakdownTreeNodeSecType);
        });
    });

    it('Test createNewCustomSector', () => {
        const expectedDefaultSector = new LinkedFavoriteSector();
        expectedDefaultSector.sector = new CustomSector();
        expectedDefaultSector.sector.title = SectorConstants.DEFAULT_CUSTOM_SECTOR_TITLE;
        expectedDefaultSector.sector.rule = new ColumnSectorRule();
        expectedDefaultSector.sector.includeOtherBucket = true;
        let addedBreakdownNode: BreakdownTreeNode = null;
        let parentNode: BreakdownTreeNode = null;
        jest.spyOn(component as any, 'addBreakdownNode').mockImplementation((breakdownTreeNode: BreakdownTreeNode, parent: BreakdownTreeNode) => {
            parentNode = parent;
            addedBreakdownNode = breakdownTreeNode;
        });
        component.createNewCustomSector();
        expect(parentNode).toBeUndefined();
        expect(addedBreakdownNode.sectorModel).toEqual(expectedDefaultSector);
        expectedDefaultSector.sector.title = 'Test';
        expectedDefaultSector.sector.rule = new GroupRule();
        component.createNewCustomSector('Test', new GroupRule(), new BreakdownTreeNode());
        expect(parentNode).toEqual(new BreakdownTreeNode());
        expect(addedBreakdownNode.sectorModel).toEqual(expectedDefaultSector);
    });

    describe('Test drag and drop scenarios', () => {
        describe('Test canDropNode', () => {
            let dropTarget = new BreakdownTreeNode();
            let droppedNode = new BreakdownTreeNode();
            beforeEach(() => {
                dropTarget = new BreakdownTreeNode();
                droppedNode = new BreakdownTreeNode();
                droppedNode.label = 'Test Node 1';
                droppedNode.uid = '435';
                dropTarget.label = 'Test Node 2';
                dropTarget.uid = '876';
            });
            it('dropNode is Undefined', () => {
                expect(component['canDropNode'](undefined, dropTarget, CommonConstants.DROP_POSITION.MIDDLE)).toBeFalsy();
            });
            it('targetNode is Undefined', () => {
                expect(component['canDropNode'](droppedNode, undefined, CommonConstants.DROP_POSITION.MIDDLE)).toBeFalsy();
            });
            it('dropping in middle of parent', () => {
                droppedNode.parent = dropTarget;
                expect(component['canDropNode'](droppedNode, dropTarget, CommonConstants.DROP_POSITION.MIDDLE)).toBeFalsy();
            });
            it('dropping on itself', () => {
                expect(component['canDropNode'](droppedNode, droppedNode, CommonConstants.DROP_POSITION.MIDDLE)).toBeFalsy();
            });
            it('dropping on top or bottom of root node', () => {
                dropTarget.type = 'root';
                expect(component['canDropNode'](droppedNode, dropTarget, CommonConstants.DROP_POSITION.TOP)).toBeFalsy();
                expect(component['canDropNode'](droppedNode, dropTarget, CommonConstants.DROP_POSITION.BOTTOM)).toBeFalsy();
                expect(component['canDropNode'](droppedNode, dropTarget, CommonConstants.DROP_POSITION.MIDDLE)).toBeTruthy();
            });
            it('dropping parent node on any descendent node', () => {
                dropTarget.type = 'root';
                droppedNode.children = [dropTarget];
                expect(component['canDropNode'](droppedNode, dropTarget, CommonConstants.DROP_POSITION.BOTTOM)).toBeFalsy();
            });
        });
        describe('Test drag and drop', () => {
            let breakdownTreeNodeSecType: BreakdownTreeNode;
            let breakdownTreeNodeSecGroup: BreakdownTreeNode;
            let breakdownTreeNodeTotal: BreakdownTreeNode;
            beforeEach(() => {
                component.draggedNodeSubject$ = new BehaviorSubject<AuxAdvancedTreeListInterface>(null);
                breakdownTreeNodeTotal = new BreakdownTreeNode();
                breakdownTreeNodeTotal.label = 'Total';
                breakdownTreeNodeTotal.uid = '546';
                breakdownTreeNodeTotal.sectorModel = new Breakdown();
                component.breakdownTreeData = [breakdownTreeNodeTotal];
                breakdownTreeNodeSecType = new BreakdownTreeNode();
                breakdownTreeNodeSecType.uid = '657';
                breakdownTreeNodeSecType.label = 'Security Type';
                const secTypeColumnSector = new ColumnSector();
                secTypeColumnSector.columnName = 'Security Type';
                breakdownTreeNodeSecType.sectorModel = secTypeColumnSector;
                breakdownTreeNodeSecGroup = new BreakdownTreeNode();
                breakdownTreeNodeSecGroup.uid = '879';
                breakdownTreeNodeSecGroup.label = 'Security Group';
                const secGroupColumnSector = new ColumnSector();
                secGroupColumnSector.columnName = 'Security Group';
                breakdownTreeNodeSecGroup.sectorModel = secGroupColumnSector;
                jest.spyOn(component as any, 'refreshTree').mockReturnValue(null);
            });
            it('Test drop in middle', () => {
                breakdownTreeNodeTotal.children = [breakdownTreeNodeSecType, breakdownTreeNodeSecGroup];
                breakdownTreeNodeSecType.parent = breakdownTreeNodeTotal;
                breakdownTreeNodeSecGroup.parent = breakdownTreeNodeTotal;
                // on Drag start
                component.onDragStart(({detail: {groupNode: [breakdownTreeNodeSecGroup]}} as any) as CustomEvent);
                // on Drag Enter
                component.onDragEnter(({detail: {value: {position: CommonConstants.DROP_POSITION.MIDDLE}}} as any) as CustomEvent);
                // on drop
                component.onDropNode(({
                    detail: {value: {uid: '657'}},
                    preventDefault: jest.fn()
                } as any) as CustomEvent);
                expect(breakdownTreeNodeTotal.children).toEqual([breakdownTreeNodeSecType]);
                expect(breakdownTreeNodeSecType.children).toEqual([breakdownTreeNodeSecGroup]);
                expect(breakdownTreeNodeSecGroup.parent).toEqual(breakdownTreeNodeSecType);
            });
            it('Test drop in for reordering with sibling', () => {
                breakdownTreeNodeTotal.children = [breakdownTreeNodeSecType, breakdownTreeNodeSecGroup];
                breakdownTreeNodeSecType.parent = breakdownTreeNodeTotal;
                breakdownTreeNodeSecGroup.parent = breakdownTreeNodeTotal;
                // on Drag start
                component.onDragStart(({detail: {groupNode: [breakdownTreeNodeSecGroup]}} as any) as CustomEvent);
                // on Drag Enter
                component.onDragEnter(({detail: {value: {position: CommonConstants.DROP_POSITION.TOP}}} as any) as CustomEvent);
                // on drop
                component.onDropNode(({
                    detail: {value: {uid: '657'}},
                    preventDefault: jest.fn()
                } as any) as CustomEvent);
                expect(breakdownTreeNodeTotal.children[0]).toBe(breakdownTreeNodeSecGroup);
                expect(breakdownTreeNodeTotal.children[1]).toBe(breakdownTreeNodeSecType);
                // on Drag Enter
                component.onDragEnter(({detail: {value: {position: CommonConstants.DROP_POSITION.BOTTOM}}} as any) as CustomEvent);
                // on drop
                component.onDropNode(({
                    detail: {value: {uid: '657'}},
                    preventDefault: jest.fn()
                } as any) as CustomEvent);
                expect(breakdownTreeNodeTotal.children[1]).toBe(breakdownTreeNodeSecGroup);
                expect(breakdownTreeNodeTotal.children[0]).toBe(breakdownTreeNodeSecType);
            });
            it('Test drop on parent top || bottom', () => {
                breakdownTreeNodeTotal.children = [breakdownTreeNodeSecType];
                breakdownTreeNodeSecType.children = [breakdownTreeNodeSecGroup];
                breakdownTreeNodeSecType.parent = breakdownTreeNodeTotal;
                breakdownTreeNodeSecGroup.parent = breakdownTreeNodeSecType;
                // on Drag start
                component.onDragStart(({detail: {groupNode: [breakdownTreeNodeSecGroup]}} as any) as CustomEvent);
                // on Drag Enter
                component.onDragEnter(({detail: {value: {position: CommonConstants.DROP_POSITION.TOP}}} as any) as CustomEvent);
                // on drop
                component.onDropNode(({
                    detail: {value: {uid: '657'}},
                    preventDefault: jest.fn()
                } as any) as CustomEvent);
                expect(breakdownTreeNodeTotal.children[0]).toBe(breakdownTreeNodeSecGroup);
                expect(breakdownTreeNodeTotal.children[1]).toBe(breakdownTreeNodeSecType);
                expect(breakdownTreeNodeSecGroup.parent).toBe(breakdownTreeNodeTotal);
                expect(breakdownTreeNodeSecType.isEmpty()).toBeTruthy();
            });
            it('Test sector drop middle', () => {
                breakdownTreeNodeTotal.children = [breakdownTreeNodeSecType];
                breakdownTreeNodeSecType.parent = breakdownTreeNodeTotal;
                jest.spyOn(component as any, 'getSectorBreakdownTreeNode').mockReturnValue(
                    breakdownTreeNodeSecGroup
                );
                component.draggedNodeSubject$.next(new BreakdownSectorSelectorOption('Test Node'));
                // on Drag Enter
                component.onDragEnter(({detail: {value: {position: CommonConstants.DROP_POSITION.MIDDLE}}} as any) as CustomEvent);
                // on drop
                component.onDropNode(({
                    detail: {value: {uid: '657'}},
                    preventDefault: jest.fn()
                } as any) as CustomEvent);
                expect(breakdownTreeNodeTotal.children).toEqual([breakdownTreeNodeSecType]);
                expect(breakdownTreeNodeSecType.children).toEqual([breakdownTreeNodeSecGroup]);
                expect(breakdownTreeNodeSecGroup.parent).toEqual(breakdownTreeNodeSecType);
            });
            it('Test sector drop on top || bottom', () => {
                breakdownTreeNodeTotal.children = [breakdownTreeNodeSecType];
                breakdownTreeNodeSecType.parent = breakdownTreeNodeTotal;
                jest.spyOn(component as any, 'getSectorBreakdownTreeNode').mockReturnValue(
                    breakdownTreeNodeSecGroup
                );
                component.draggedNodeSubject$.next(new BreakdownSectorSelectorOption('Test Node'));
                // on Drag Enter
                component.onDragEnter(({detail: {value: {position: CommonConstants.DROP_POSITION.TOP}}} as any) as CustomEvent);
                // on drop
                component.onDropNode(({
                    detail: {value: {uid: '657'}},
                    preventDefault: jest.fn()
                } as any) as CustomEvent);
                expect(breakdownTreeNodeTotal.children[0]).toBe(breakdownTreeNodeSecGroup);
                expect(breakdownTreeNodeTotal.children[1]).toBe(breakdownTreeNodeSecType);
                expect(breakdownTreeNodeSecGroup.parent).toBe(breakdownTreeNodeTotal);
            });
            it('Test drop/drop - mandate default breakdown from selector', () => {
                const spyBreakdownUpdated = jest.spyOn(component.breakdownUpdated, 'emit');

                component.draggedNodeSubject$ = new BehaviorSubject<AuxAdvancedTreeListInterface>(BreakdownUtils.MANDATE_DEFAULT_BKD_OPTION);
                component.dropPosition = CommonConstants.DROP_POSITION.MIDDLE;
                breakdownTreeNodeTotal = new BreakdownTreeNode();
                breakdownTreeNodeTotal.label = 'Total';
                breakdownTreeNodeTotal.uid = '546';
                breakdownTreeNodeTotal.sectorModel = new Breakdown();
                component.breakdownTreeData = [breakdownTreeNodeTotal];
                component.breakdown = new Breakdown();

                component.onDropNode(({
                    detail: {value: {uid: '546'}},
                    preventDefault: jest.fn()
                } as any) as CustomEvent);
                expect(component.breakdown.isMandateDefaultBreakdown).toEqual(true);
                expect(component.breakdown.title).toEqual(BreakdownConstants.MANDATE_DEFAULT_BREAKDOWN_TITLE);
                expect(component.breakdown.children).toEqual([]);

                expect(component.placeholderBreakdownNodeInserted).toEqual(true);
                expect(component.breakdownTreeData).toHaveLength(1);
                const rootNode = component.breakdownTreeData[0];
                expect(rootNode.label).toEqual('Total');
                expect(rootNode.type).toEqual(BreakdownTreeNode.TYPE_ROOT);
                expect(rootNode.children).toHaveLength(1);

                expect(rootNode.children[0].label).toEqual(BreakdownConstants.MANDATE_DEFAULT_BREAKDOWN_TITLE);
                expect(rootNode.children[0].type).toEqual(BreakdownTreeNode.TYPE_PLACEHOLDER);

                expect(rootNode.sectorModel).toBeInstanceOf(Breakdown);
                expect((rootNode.sectorModel as Breakdown).isMandateDefaultBreakdown).toEqual(true);

                expect(spyBreakdownUpdated).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('checkAndSetSingleLevelNodeIfPresent Test', () => {
        beforeEach(() => {
            component.addSectorSubject$ = new BehaviorSubject(null);
            component.singleLevelNodeInserted = false;
            component.breakdown = new Breakdown();
        });
        it('should set singleLevelNodeInserted for market value % breakdown', () => {
            const pctMVColumnDef = new ColumnDefinition();
            pctMVColumnDef.title = 'Market Value %';
            pctMVColumnDef.columnTag = 'pct_mv';
            pctMVColumnDef.columnReports = ['prism_all', 'explore_sectors', 'prism_dataagg'];
            CoreDefinitionStore.columnTagColumnsPairs.set('pct_mv', [pctMVColumnDef]);

            const exploreSector = new NumericColumnSector();
            exploreSector.columnTag = 'pct_mv';
            component.breakdown.addChild(exploreSector);

            component.ngOnInit();

            expect(component.singleLevelNodeInserted).toBe(true);
        });
        it('should set singleLevelNodeInserted for performance breakdown', () => {
            const blkAnalystAusColumnDef = new ColumnDefinition();
            blkAnalystAusColumnDef.title = ' (BLK_ANALYST_AUS)';
            blkAnalystAusColumnDef.columnTag = 'BLK_ANALYST_AUS';
            blkAnalystAusColumnDef.praadaBreakdown = true;
            CoreDefinitionStore.columnTagColumnsPairs.set('BLK_ANALYST_AUS', [blkAnalystAusColumnDef]);

            const performanceSector = new ColumnSector();
            performanceSector.columnTag = 'BLK_ANALYST_AUS';
            component.breakdown.addChild(performanceSector);

            component.ngOnInit();

            expect(component.singleLevelNodeInserted).toBe(true);
        });
        it('should set singleLevelNodeInserted for factor mapping breakdown', () => {
            const macroModelGlobalColumnDef = new ColumnDefinition();
            macroModelGlobalColumnDef.title = 'Macro Model - Global';
            macroModelGlobalColumnDef.columnTag = 'MACRO';
            macroModelGlobalColumnDef.groups = ['Factor Mappings'];
            CoreDefinitionStore.columnTagColumnsPairs.set('MACRO', [macroModelGlobalColumnDef]);

            const factorMappingSector = new NumericColumnSector();
            factorMappingSector.columnTag = 'MACRO';
            component.breakdown.addChild(factorMappingSector);

            component.ngOnInit();

            expect(component.singleLevelNodeInserted).toBe(true);
        });
    });

    it('tests captureTopDownColAndUpdateFlag', () => {
        component.breakdown = new Breakdown();
        component.breakdown.isTopBottomSectoring = false;

        const node: BreakdownTreeNode = new BreakdownTreeNode();
        expect(component['captureTopDownColAndUpdateFlag'](node)).toBeTruthy();
        expect(component.breakdown.isTopBottomSectoring).toBeFalsy();
        expect(component.topDownSelectCols.size).toBe(0);

        node.sectorModel = new ColumnSector();
        expect(component['captureTopDownColAndUpdateFlag'](node)).toBeTruthy();
        expect(component.breakdown.isTopBottomSectoring).toBeFalsy();
        expect(component.topDownSelectCols.size).toBe(0);

        (node.sectorModel as ColumnSector).columnTag = 'abc';
        expect(component['captureTopDownColAndUpdateFlag'](node)).toBeTruthy();
        expect(component.breakdown.isTopBottomSectoring).toBeFalsy();
        expect(component.topDownSelectCols.size).toBe(0);

        (node.sectorModel as ColumnSector).columnTag = 'portfolio_tree';
        expect(component['captureTopDownColAndUpdateFlag'](node)).toBeTruthy();
        expect(component.breakdown.isTopBottomSectoring).toBeTruthy();
        expect(component.topDownSelectCols.size).toBe(1);

        expect(component['captureTopDownColAndUpdateFlag'](node)).toBeFalsy();
    });

    it('tests initTopDownSelectedCols', () => {
        let topDownSelectedCols: Set<string> = new Set();
        component['initTopDownSelectedCols'](null, topDownSelectedCols);
        expect(topDownSelectedCols.size).toBe(0);

        topDownSelectedCols = new Set();
        component['initTopDownSelectedCols']([], topDownSelectedCols);
        expect(topDownSelectedCols.size).toBe(0);

        topDownSelectedCols = new Set();
        const node: BreakdownTreeNode = new BreakdownTreeNode();
        component['initTopDownSelectedCols']([node], topDownSelectedCols);
        expect(topDownSelectedCols.size).toBe(0);

        topDownSelectedCols = new Set();
        node.sectorModel = new ColumnSector();
        component['initTopDownSelectedCols']([node], topDownSelectedCols);
        expect(topDownSelectedCols.size).toBe(0);

        (node.sectorModel as ColumnSector).columnTag = 'abc';
        component['initTopDownSelectedCols']([node], topDownSelectedCols);
        expect(topDownSelectedCols.size).toBe(0);

        (node.sectorModel as ColumnSector).columnTag = 'portfolio_tree';
        component['initTopDownSelectedCols']([node], topDownSelectedCols);
        expect(topDownSelectedCols.size).toBe(1);

        const childNode: BreakdownTreeNode = new BreakdownTreeNode();
        childNode.sectorModel = new ColumnSector();
        (childNode.sectorModel as ColumnSector).columnTag = 'bcd';
        node.children = [childNode];
        component['initTopDownSelectedCols']([node], topDownSelectedCols);
        expect(topDownSelectedCols.size).toBe(1);

        (childNode.sectorModel as ColumnSector).columnTag = 'product_asset_class';
        node.children = [childNode];
        component['initTopDownSelectedCols']([node], topDownSelectedCols);
        expect(topDownSelectedCols.size).toBe(2);
    });

    it('tests updateTopDownPropsAfterDelete', () => {
        component.breakdown = new Breakdown();
        component.topDownSelectCols = new Set(component.topDownEligibleCols);
        const node: BreakdownTreeNode = new BreakdownTreeNode();
        component['updateTopDownPropsAfterDelete'](node);
        expect(component.topDownSelectCols.size).toBe(4);

        node.sectorModel = new ColumnSector();
        component['updateTopDownPropsAfterDelete'](node);
        expect(component.topDownSelectCols.size).toBe(4);

        (node.sectorModel as ColumnSector).columnTag = 'abc';
        component['updateTopDownPropsAfterDelete'](node);
        expect(component.topDownSelectCols.size).toBe(4);

        (node.sectorModel as ColumnSector).columnTag = 'portfolio_tree';
        component['updateTopDownPropsAfterDelete'](node);
        expect(component.topDownSelectCols.size).toBe(3);

        component.topDownSelectCols = new Set(component.topDownEligibleCols);
        const childNode: BreakdownTreeNode = getNodeWithColumnSectorTag('product_asset_class');
        childNode.children = [getNodeWithColumnSectorTag('product_geo_focus')];
        childNode.children[0].children = [getNodeWithColumnSectorTag('product_investment_style')];
        node.children = [childNode];
        component['updateTopDownPropsAfterDelete'](node);
        expect(component.topDownSelectCols.size).toBe(0);
    });
});

function getNodeWithColumnSectorTag(colTag: string): BreakdownTreeNode {
    const childNode: BreakdownTreeNode = new BreakdownTreeNode();
    childNode.sectorModel = new ColumnSector();
    (childNode.sectorModel as ColumnSector).columnTag = colTag;
    return childNode;
}
