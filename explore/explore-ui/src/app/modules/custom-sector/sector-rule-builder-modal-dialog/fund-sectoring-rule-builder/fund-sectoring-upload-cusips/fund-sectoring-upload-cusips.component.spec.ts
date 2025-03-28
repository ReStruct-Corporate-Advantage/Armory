import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {FundSectoringUploadCusipsComponent} from './fund-sectoring-upload-cusips.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {PortfolioService} from '@services/portfolio';
import {BreakdownTreeNode, ColumnSectorRule, CustomSector, CustomSectorRule, CustomSectorType, GroupRule, LinkedFavoriteSector, Rule, SectorUtils, SectorRuleUtils} from '@blk/explore-ui-breakdown';
import {NotificationService} from '@services/notification';
import {AlertConstants, ExploreDialogParam} from '@blk/explore-ui-core';
import {of} from 'rxjs';
import {CommonConstants} from '@constants/common.constants';
import {TestUtils} from '@utils/test.utils';

describe('FundSectoringUploadCusipsComponent', () => {
    let component: FundSectoringUploadCusipsComponent;
    let fixture: ComponentFixture<FundSectoringUploadCusipsComponent>;
    const notificationServiceStub = {
        openDialog: jest.fn()
    };
    const portfolioServiceStub = {
        getPortfolioCusipData$: jest.fn()
    };
    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FundSectoringUploadCusipsComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            providers: [
                {provide: PortfolioService, useValue: portfolioServiceStub},
                {provide: NotificationService, useValue: notificationServiceStub}
            ]
        });

        fixture = TestBed.createComponent(FundSectoringUploadCusipsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Test createSectorsFromPastedCusipList', () => {
        const createNewCustomSectorStub = jest.fn();
        const addRuleStub = jest.fn();
        beforeEach(() => {
            component.sectorNode = createCustomSectorNode('CurrentCustomSector');
            const parentNode = createCustomSectorNode('Parent Node');
            component.sectorNode.parent = parentNode;
            parentNode.children = [component.sectorNode];
            component.addRule = addRuleStub;
            component.createNewCustomSector = createNewCustomSectorStub;
            component.breakdownTree = new BreakdownTreeNode();
            component.breakdownTree.label = 'Total';
            component.breakdownTree.children = [parentNode];
            parentNode.parent = component.breakdownTree;
            component.assignedRecordsMapping.clear();
        });

        describe('Test custom sector not present ', () => {
            beforeEach(() => {
                component.assignedRecordsMapping.clear();
            });
            it('Custom Sector Type Fund', () => {
                component.customSectorType = CustomSectorType.FUND;
                const newNode = createCustomSectorNode('Custom Sector1');
                let addedRule: ColumnSectorRule | GroupRule | CustomSectorRule;
                let sectorNameAdded: string;
                createNewCustomSectorStub.mockImplementation(
                    (sectorName: string, rule: ColumnSectorRule | GroupRule | CustomSectorRule, tree: BreakdownTreeNode) => {
                        sectorNameAdded = sectorName;
                        addedRule = rule;
                        return newNode;
                    }
                );
                component['createSectorsFromPastedCusipList']([['BRS123', 'Custom Sector1']]);
                const recordKey = SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'BRS123');
                expect(recordKey).toBeDefined();
                expect(component.assignedRecordsMapping.get(recordKey)).toEqual([newNode.getCustomSector()]);
                expect(sectorNameAdded).toEqual('Custom Sector1');
                expect(addedRule.ruleType).toBe('Rule');
            });
            it('Nested Custom Sector Type', () => {
                component.customSectorType = CustomSectorType.PORTFOLIO;
                const newNode = createCustomSectorNode('Custom Sector1');
                let addedRule: ColumnSectorRule | GroupRule | CustomSectorRule;
                let sectorNameAdded: string;
                createNewCustomSectorStub.mockImplementation(
                    (sectorName: string, rule: ColumnSectorRule | GroupRule | CustomSectorRule, tree: BreakdownTreeNode) => {
                        sectorNameAdded = sectorName;
                        addedRule = rule;
                        return newNode;
                    }
                );
                component['createSectorsFromPastedCusipList']([['port1', 'Custom Sector1']], {port1: 'BRS123'});
                const recordKey = SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'port1');
                expect(recordKey).toBeDefined();
                expect(component.assignedRecordsMapping.get(recordKey)).toEqual([newNode.getCustomSector()]);
                expect(sectorNameAdded).toEqual('Custom Sector1');
                expect(SectorRuleUtils.isNestedFundSectorRule(addedRule)).toBeTruthy();
            });
        });
        describe('Test custom sector name not given i.e. Assign to current sector node', () => {
            beforeEach(() => {
                component.assignedRecordsMapping.clear();
            });
            it('Fund already assigned to any other custom sector', () => {
                const customSectorNode = createCustomSectorNode('Test Custom sector');
                component.breakdownTree.children.push(customSectorNode);
                component.assignedRecordsMapping.set({
                    nodeName: 'BRS123',
                    cusip: undefined
                }, [customSectorNode.getCustomSector()]);
                component['createSectorsFromPastedCusipList']([['BRS123', '']]);
                const recordKey = SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'BRS123');
                expect(component.assignedRecordsMapping.get(recordKey)).toEqual([customSectorNode.getCustomSector(), component.sectorNode.getCustomSector()]);
            });
            it('Fund already assigned to current custom sector', () => {
                component.assignedRecordsMapping.set({
                    nodeName: 'BRS123',
                    cusip: undefined
                }, [component.sectorNode.getCustomSector()]);
                component['createSectorsFromPastedCusipList']([['BRS123', '']]);
                const recordKey = SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'BRS123');
                expect(component.assignedRecordsMapping.get(recordKey)).toEqual([component.sectorNode.getCustomSector()]);
            });
            it('Fund already assigned to parent node custom sector', () => {
                component.assignedRecordsMapping.set({
                    nodeName: 'BRS123',
                    cusip: undefined
                }, [component.sectorNode.parent.getCustomSector()]);
                component['createSectorsFromPastedCusipList']([['BRS123', '']]);
                const recordKey = SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'BRS123');
                expect(component.assignedRecordsMapping.get(recordKey)).toEqual([component.sectorNode.parent.getCustomSector(), component.sectorNode.getCustomSector()]);
            });
            it('Fund not assigned to any node', () => {
                component['createSectorsFromPastedCusipList']([['BRS123', '']]);
                const recordKey = SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'BRS123');
                expect(component.assignedRecordsMapping.get(recordKey)).toEqual([component.sectorNode.getCustomSector()]);
            });
        });
        describe('Test custom sector name of existing node(Not current node)', () => {
            const customSectorNode = createCustomSectorNode('Test Custom sector');
            beforeEach(() => {
                component.assignedRecordsMapping.clear();
                component.breakdownTree.children.push(customSectorNode);
            });
            describe('Fund Custom Sector Type', () => {
                beforeEach(() => {
                    component.assignedRecordsMapping.clear();
                    component.customSectorType = CustomSectorType.FUND;
                });
                it('Rule is group rule', () => {
                    const groupRule = new GroupRule();
                    const columnSectorRuleFundType = new ColumnSectorRule();
                    columnSectorRuleFundType.customSectorType = CustomSectorType.FUND;
                    columnSectorRuleFundType.comparisonValues = ['BRS124'];
                    groupRule.subRules = [new ColumnSectorRule(), columnSectorRuleFundType];
                    customSectorNode.getCustomSector().rule = groupRule;
                    component['createSectorsFromPastedCusipList']([['BRS123', 'Test Custom sector']]);
                    const recordKey = SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'BRS123');
                    expect(component.assignedRecordsMapping.get(recordKey)).toEqual([customSectorNode.getCustomSector()]);
                    expect([...columnSectorRuleFundType.comparisonValues]).toEqual(['BRS124', 'BRS123']);
                    // No fund rule in group
                    addRuleStub.mockImplementation(
                        (rule: Rule, sectorNode: BreakdownTreeNode, condition: string) => {
                            expect(rule.ruleType).toEqual('Rule');
                            expect(sectorNode).toBe(customSectorNode);
                            expect(condition).toEqual(CommonConstants.GROUP_RULE_CONDITION.OR);
                        }
                    );
                    component.assignedRecordsMapping.clear();
                    columnSectorRuleFundType.customSectorType = CustomSectorType.ATTRIBUTES;
                    component['createSectorsFromPastedCusipList']([['BRS123', 'Test Custom sector']]);
                    expect(component.addRule).toHaveBeenCalled();
                });
                it('Rule is column sector rule', () => {
                    const columnSectorRuleFundType = new ColumnSectorRule();
                    columnSectorRuleFundType.customSectorType = CustomSectorType.FUND;
                    columnSectorRuleFundType.comparisonValues = ['BRS124'];
                    customSectorNode.getCustomSector().rule = columnSectorRuleFundType;
                    component['createSectorsFromPastedCusipList']([['BRS123', 'Test Custom sector']]);
                    const recordKey = SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'BRS123');
                    expect(component.assignedRecordsMapping.get(recordKey)).toEqual([customSectorNode.getCustomSector()]);
                    expect([...columnSectorRuleFundType.comparisonValues]).toEqual(['BRS124', 'BRS123']);
                    // Rule is not of Fund Sector Type
                    addRuleStub.mockImplementation(
                        (rule: Rule, sectorNode: BreakdownTreeNode, condition: string) => {
                            expect(rule.ruleType).toEqual('Rule');
                            expect(sectorNode).toBe(customSectorNode);
                            expect(condition).toEqual(CommonConstants.GROUP_RULE_CONDITION.OR);
                        }
                    );
                    component.assignedRecordsMapping.clear();
                    columnSectorRuleFundType.customSectorType = CustomSectorType.ATTRIBUTES;
                    component['createSectorsFromPastedCusipList']([['BRS123', 'Test Custom sector']]);
                    expect(component.addRule).toHaveBeenCalled();
                    // Rule is not defined
                    component.assignedRecordsMapping.clear();
                    columnSectorRuleFundType.comparisonValues = undefined;
                    component['createSectorsFromPastedCusipList']([['BRS123', 'Test Custom sector']]);
                    expect(columnSectorRuleFundType.comparisonValues).toEqual(['BRS123']);
                    expect(columnSectorRuleFundType.customSectorType).toBe(CustomSectorType.FUND);
                });
            });
            describe('Nested Custom Sector Type', () => {
                beforeEach(() => {
                    component.assignedRecordsMapping.clear();
                    component.customSectorType = CustomSectorType.PORTFOLIO;
                });
                it('Rule is group rule', () => {
                    const nestedRule: GroupRule = TestUtils.createNestedFundSectorRule(['port1'], ['cusip1'], CustomSectorType.PORTFOLIO);
                    customSectorNode.getCustomSector().rule = nestedRule;
                    component['createSectorsFromPastedCusipList']([['port2', 'Test Custom sector']], {port2: 'BRS123'});
                    const recordKey = SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'port2');
                    expect(component.assignedRecordsMapping.get(recordKey)).toEqual([customSectorNode.getCustomSector()]);
                    expect((nestedRule.subRules[0] as ColumnSectorRule).comparisonValues).toEqual(['port1', 'port2']);
                    expect((nestedRule.subRules[1] as ColumnSectorRule).comparisonValues).toEqual(['cusip1', 'BRS123']);
                });
                it('Rule is column sector rule and not defined', () => {
                    const columnSectorRuleFundType = new ColumnSectorRule();
                    customSectorNode.getCustomSector().rule = columnSectorRuleFundType;
                    addRuleStub.mockImplementation(
                        (rule: Rule, sectorNode: BreakdownTreeNode, condition: string) => {
                            expect(rule.ruleType).toEqual('RuleGroup');
                            expect(sectorNode).toBe(customSectorNode);
                            expect(condition).toEqual(CommonConstants.GROUP_RULE_CONDITION.OR);
                        }
                    );
                    component['createSectorsFromPastedCusipList']([['port2', 'Test Custom sector']], {port2: 'BRS123'});
                    const recordKey = SectorUtils.getRecordKeyFromMap(component.assignedRecordsMapping, 'port2');
                    expect(component.assignedRecordsMapping.get(recordKey)).toEqual([customSectorNode.getCustomSector()]);
                    expect(component.addRule).toHaveBeenCalled();
                });
            });
        });
    });

    describe('Test onDataUpload', () => {
        beforeEach(() => {
            jest.spyOn(<any>component, 'createSectorsFromPastedCusipList').mockReturnValue(null);
            component.refreshBreakdownTreeCallback = jest.fn();
        });

        it('Fund Custom Sector Type', () => {
            component.customSectorType = CustomSectorType.FUND;
            const parsedData = [['', 'cs1'], ['brs123', 'cs1'], ['brs124', 'cs2'], ['brs123', 'cs1'], ['brs125', 'cs3']];
            component.onDataUploaded(parsedData);
            expect(component.refreshBreakdownTreeCallback).toHaveBeenCalledTimes(1);
            expect(component['createSectorsFromPastedCusipList']).toHaveBeenCalledWith([['brs123', 'cs1'], ['brs124', 'cs2'], ['brs125', 'cs3']]);
        });

        it('Nested Sector Type', fakeAsync(() => {
            component.customSectorType = CustomSectorType.PORTFOLIO;
            const parsedData = [['', 'cs1'], ['brs123', 'cs1'], ['brs124', 'cs2'], ['brs123', 'cs1'], ['brs125', 'cs3']];
            portfolioServiceStub.getPortfolioCusipData$.mockReturnValue(
                of({
                    brs123: 'test1',
                    brs124: 'test2'
                })
            );
            component.onDataUploaded(parsedData);
            tick();
            expect(notificationServiceStub.openDialog).toHaveBeenCalledWith(new ExploreDialogParam(
                AlertConstants.TYPE.ALERT,
                AlertConstants.HEADER.INVALID_ENTRY,
                'Could not find portfolio info for brs125',
                AlertConstants.BTN.OK
            ));
            expect(component.refreshBreakdownTreeCallback).toHaveBeenCalledTimes(1);
            expect(component['createSectorsFromPastedCusipList']).toHaveBeenCalledWith([['brs123', 'cs1'], ['brs124', 'cs2']], {
                'brs123': 'test1',
                'brs124': 'test2'
            });
        }));
    });
});

function createCustomSectorNode(label: string, rule?: Rule): BreakdownTreeNode {
    const customSectorNode = new BreakdownTreeNode();
    customSectorNode.label = label;
    const linkedFavoriteSector = new LinkedFavoriteSector();
    linkedFavoriteSector.sector = new CustomSector();
    linkedFavoriteSector.sector.title = label;
    linkedFavoriteSector.sector.rule = rule;
    customSectorNode.sectorModel = linkedFavoriteSector;
    return customSectorNode;
}
