import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonConstants} from '@constants/common.constants';
import {PortfolioService} from '@services/portfolio';
import {NotificationService} from '@services/notification';
import {AlertConstants, ColumnConstants, CoreCommonConstants, ExploreDialogParam} from '@blk/explore-ui-core';
import {BreakdownTreeNode, ColumnSectorRule, CustomSector, CustomSectorType, FundSectoringRecordKey, GroupRule, SectorConstants, SectorUtils} from '@blk/explore-ui-breakdown';
import {isUndefined} from 'lodash';
import FundSectoringConfig from '../../../../../../assets/fund-sectoring-config/fund-sectoring-config.json';
import {BehaviorSubject} from 'rxjs';

@Component({
    selector: 'app-fund-sectoring-upload-cusips',
    templateUrl: './fund-sectoring-upload-cusips.component.html',
    styleUrls: ['./fund-sectoring-upload-cusips.component.scss']
})
export class FundSectoringUploadCusipsComponent {

    @Input()
    customSectorType: CustomSectorType;

    @Input()
    sectorNode: BreakdownTreeNode;

    @Input()
    breakdownTree: BreakdownTreeNode;

    @Input()
    addRule: Function;

    @Input()
    createNewCustomSector: Function;

    @Input()
    refreshBreakdownTreeCallback: Function;

    @Input()
    assignedRecordsMapping: Map<FundSectoringRecordKey, CustomSector[]> = new Map<FundSectoringRecordKey, CustomSector[]>();

    @Input()
    isLoading$: BehaviorSubject<boolean>;

    @Output()
    recordsUploaded = new EventEmitter();

    importConfig = {
        caption: 'Import securities by pasting from a spreadsheet or uploading a CSV file',
        title: 'Quick import',
        dataFormat: [['Cusip 1', 'Custom Sector 1'],
            ['Cusip 2', 'Custom Sector 2'],
            ['Cusip 3', 'Custom Sector 2']]
    };

    hideUploadScreen = true;

    constructor(private portfolioService: PortfolioService, private notificationService: NotificationService) {
    }

    /**
     * Method is called when new data is uploaded/imported in upload screen
     * @param parsedData
     */
    onDataUploaded(parsedData: string[][]) {
        const validRecords = this.filterValidRecords(parsedData);
        this.hideUploadScreen = true;
        if (this.customSectorType === CustomSectorType.FUND) {
            this.createSectorsFromPastedCusipList(validRecords);
            this.refreshBreakdownTreeCallback();
            this.recordsUploaded.emit();
        } else {
            this.createPortfolioCusipList(validRecords);
        }
    }

    /**
     * Get the cusip name corresponding to the portfolio name.
     * @param parsedText
     */
    public createPortfolioCusipList(parsedText: string[][]) {
        const portfolioNameList: string[] = parsedText.map((record: string[]) => {
            return record[0];
        });

        this.portfolioService.getPortfolioCusipData$(portfolioNameList).subscribe(
            (portfolioList: {[portName: string]: string}) => {
                // Check for the portfolio for which no cusips were found and remove it from the recordSet.
                const portfolioWithNoCusipName: string[] = [];
                const recordSet = [];
                for (let i = 0; i < parsedText.length; i++) {
                    const portfolioName = parsedText[i][0];
                    if (!portfolioList[portfolioName]) {
                        portfolioWithNoCusipName.push(portfolioName);
                    } else {
                        recordSet.push(parsedText[i]);
                    }
                }
                this.openAlertForCusipInfoNotFound(portfolioWithNoCusipName);
                this.createSectorsFromPastedCusipList(recordSet, portfolioList);
                this.refreshBreakdownTreeCallback();
                this.recordsUploaded.emit();
            }
        );
    }

    /**
     * Method to open dialog to notify user about portfolios with missing cusip info
     * @param portfolioWithNoCusipName
     */
    openAlertForCusipInfoNotFound(portfolioWithNoCusipName: string[]) {
        if (portfolioWithNoCusipName.length > 0) {
            this.notificationService.openDialog(
                new ExploreDialogParam(
                    AlertConstants.TYPE.ALERT,
                    AlertConstants.HEADER.INVALID_ENTRY,
                    'Could not find portfolio info for ' + portfolioWithNoCusipName,
                    AlertConstants.BTN.OK
                )
            );
        }
    }

    /**
     * Method creates looks up for sectors in the breakdown tree and assign the uploaded cusips
     * @param records
     * @param portfolioCusipList
     */
    private createSectorsFromPastedCusipList(records: string[][], portfolioCusipList?: {[portName: string]: string}) {
        for (let i = 0; i < records.length; i++) {
            // In case portfolio/Indexes are uploaded we need their corresponding cusip list.
            portfolioCusipList = portfolioCusipList ? portfolioCusipList : {};

            const fundOrPortfolioName: string = records[i][0];
            const sectorName = records[i][1];
            const cusip = portfolioCusipList[fundOrPortfolioName];
            // If the sectorName is not provided along with cusip, then upload the given cusip to the current sector(sectorTitle)
            let breakdownTreeNode: BreakdownTreeNode = sectorName ? this.breakdownTree.getCustomSectorNodeWithLabel(sectorName) : this.sectorNode;
            let recordKey = SectorUtils.getRecordKeyFromMap(this.assignedRecordsMapping, fundOrPortfolioName);
            if (isUndefined(recordKey)) {
                recordKey = {
                    'nodeName': fundOrPortfolioName,
                    'cusip': cusip
                };
            }
            let newBreakdownNode: BreakdownTreeNode;
            if (isUndefined(breakdownTreeNode)) {
                // Case : the sector is not present in the breakdown tree, In that case just create a new sector Node with given sector name at the root level and assign the given cusip to it.
                const rule: ColumnSectorRule | GroupRule = this.createNewRule(fundOrPortfolioName, cusip);
                newBreakdownNode = breakdownTreeNode = this.createNewCustomSector(sectorName, rule, this.breakdownTree, false);
            }
            if (!this.populateAssignedRecordsMapping(breakdownTreeNode, recordKey)) {
                continue;
            }
            if (isUndefined(newBreakdownNode) && breakdownTreeNode !== this.sectorNode) {
                this.processingForExistingSectorNode(breakdownTreeNode, fundOrPortfolioName, cusip);
            }
        }
    }

    /**
     * Method to assign the uploaded record to custom sector
     * @param breakdownTreeNode
     * @param recordKey
     */
    private populateAssignedRecordsMapping(breakdownTreeNode: BreakdownTreeNode, recordKey: FundSectoringRecordKey): boolean {
        const assignedCustomSectors = this.assignedRecordsMapping.get(recordKey);
        if (!isUndefined(assignedCustomSectors) && assignedCustomSectors.length > 0) {
            // Assign this record to to custom sector only if it is not already assigned or if it's assigned to it's parent(If custom sector node).
            if (!assignedCustomSectors.includes(breakdownTreeNode.getCustomSector())) {
                assignedCustomSectors.push(breakdownTreeNode.getCustomSector());
            } else {
                // We will skip this record as it is already assigned to custom sector
                return false;
            }
        } else {
            this.assignedRecordsMapping.set(recordKey, [breakdownTreeNode.getCustomSector()]);
        }
        return true;
    }

    /**
     * Method to assign cusips to the sector already present in the breakdownTree
     * @param sector
     * @param fundOrPortfolioName
     * @param cusip
     */
    private processingForExistingSectorNode(sector: BreakdownTreeNode, fundOrPortfolioName: string, cusip: string) {
        const sectorRule = sector.getCustomSector().rule;
        if (sectorRule instanceof GroupRule) {
            this.processGroupRule(sectorRule, fundOrPortfolioName, cusip, sector);
        } else {
            this.processColumnSectorRule(sectorRule as ColumnSectorRule, fundOrPortfolioName, cusip, sector);
        }
    }

    /**
     * Process the sector which has a ColumnSectorRule
     * @param sectorRule
     * @param fundOrPortfolioName
     * @param cusip
     * @param sector
     */
    private processColumnSectorRule(sectorRule: ColumnSectorRule, fundOrPortfolioName: string, cusip: string, sector: BreakdownTreeNode) {
        if (sectorRule.comparisonValues && sectorRule.comparisonValues.length > 0) {
            // Sector has a rule of same type as that of uploaded cusip
            if (this.customSectorType === sectorRule.customSectorType) {
                sectorRule.comparisonValues.push(fundOrPortfolioName);
            } else {
                // Case : The sector has a rule of different type, in that case, create a group rule
                const rule: ColumnSectorRule | GroupRule = this.createNewRule(fundOrPortfolioName, cusip);
                this.addRule(rule, sector, CommonConstants.GROUP_RULE_CONDITION.OR);
            }
        } else {
            // Case: The sector does not have any rule, assign the created rule to the given sector
            let rule: ColumnSectorRule | GroupRule;
            if (this.customSectorType !== CustomSectorType.FUND) {
                rule = this.createNewGroupRuleofGivenCustomSectorType(fundOrPortfolioName, cusip);
                this.addRule(rule, sector, CommonConstants.GROUP_RULE_CONDITION.OR);
            } else {
                this.createNewCusipBasedRuleforCustomSectorType(fundOrPortfolioName, sectorRule);
            }
        }
    }

    /**
     * Process the sector which is has a groupRule
     * @param sectorRule
     * @param fundOrPortfolioName
     * @param cusip
     * @param sector
     */
    private processGroupRule(sectorRule: GroupRule, fundOrPortfolioName: string, cusip: string, sector: BreakdownTreeNode) {
        let isRulePresent = false;
        // incase the group rule is a nestedFundRule with same customSectorType then we will have to treat it differently i.e assign both portfolio and cusip values.
        if (this.customSectorType !== CustomSectorType.FUND && this.customSectorType === (sectorRule.subRules[0] as ColumnSectorRule).customSectorType) {
            const portfolioRule = sectorRule.subRules[0] as ColumnSectorRule;
            portfolioRule.comparisonValues.push(fundOrPortfolioName);
            const cusipRule = sectorRule.subRules[1] as ColumnSectorRule;
            cusipRule.comparisonValues.push(cusip);
            isRulePresent = true;
        } else {
            for (const subRule of sectorRule.subRules) {
                // Sector has a rule of same type as that of uploaded cusip
                const sectorSubRule = (subRule as ColumnSectorRule);
                if (this.customSectorType === sectorSubRule.customSectorType) {
                    sectorSubRule.comparisonValues.push(fundOrPortfolioName);
                    isRulePresent = true;
                    break;
                }
            }
        }

        if (!isRulePresent) {
            // Case : The sector has a rule of different type, in that case, create a group rule
            const rule: ColumnSectorRule | GroupRule = this.createNewRule(fundOrPortfolioName, cusip);
            this.addRule(rule, sector, CommonConstants.GROUP_RULE_CONDITION.OR);
        }
    }

    /**
     * Creates new Rule depending upon the type of customSectorType
     * Fund --> ColumnSectorRule
     * Portfolio/ Index --> GroupRule
     * @param fundOrPortfolioName
     * @param cusip
     */
    private createNewRule = (fundOrPortfolioName: string, cusip?: string): GroupRule | ColumnSectorRule => {
        let rule: ColumnSectorRule | GroupRule;
        if (this.customSectorType !== CustomSectorType.FUND) {
            rule = this.createNewGroupRuleofGivenCustomSectorType(fundOrPortfolioName, cusip);
        } else {
            rule = this.createNewCusipBasedRuleforCustomSectorType(fundOrPortfolioName);
        }
        return rule;
    };

    /**
     * Creates a new GroupRule and assigns the provided cusip in the comparisonValue and the rest of the attributes according to the customSectorType of selected rule
     * @param portfolioName
     * @param cusip
     */
    private createNewGroupRuleofGivenCustomSectorType(portfolioName: string, cusip: string): GroupRule {
        // Create the first columnSectorRule i.e portfolio/Index equals ****
        const selectedColumn = FundSectoringConfig.portfolioColumn;

        const portfolioOrIndexRule = new ColumnSectorRule();
        // set the customSectorType
        portfolioOrIndexRule.customSectorType = this.customSectorType;

        ColumnSectorRule.updateRule(portfolioOrIndexRule, selectedColumn, SectorConstants.CUSTOM_RULE_BUILDER_OPERATORS.EQUALS.displayValue, portfolioName, ColumnConstants.COLUMN_DATA_TYPE.STRING);

        const cusipRule = this.createNewCusipBasedRuleforCustomSectorType(cusip);
        // Create a group rule from the 2 above created rules.
        const groupRule = new GroupRule();
        groupRule.groupType = CommonConstants.GROUP_RULE_CONDITION.OR;
        groupRule.addSubRule(portfolioOrIndexRule);
        groupRule.addSubRule(cusipRule);
        return groupRule;
    }

    /**
     * Creates a new customSector and assigns the provided cusip in the comparisonValue and the rest of the attributes according to the customSectorType of selected rule
     * @param cusip
     * @param sectorRule
     */
    private createNewCusipBasedRuleforCustomSectorType(cusip: string, sectorRule?: ColumnSectorRule): ColumnSectorRule {
        const rule = sectorRule ? sectorRule : new ColumnSectorRule();
        rule.customSectorType = this.customSectorType;
        const selectedColumn = FundSectoringConfig.cusipColumn;
        ColumnSectorRule.updateRule(rule, selectedColumn, SectorConstants.CUSTOM_RULE_BUILDER_OPERATORS.EQUALS.displayValue, [cusip], ColumnConstants.COLUMN_DATA_TYPE.STRING);
        return rule;
    }

    /**
     * filter the parsed data for duplicate values and empty strings.
     * @param parsedData
     */
    private filterValidRecords(parsedData: string[][]): string[][] {
        // check if there are any empty strings.
        const nonEmptyRecords = parsedData.filter((record: string[]) => {
            return record[0] !== CoreCommonConstants.EMPTY_STRING;
        });
        // Check for duplicate entries.
        const uniqueRecordSet = [];
        const pastedRecordsMap = new Map<string, string[]>();
        for (let i = 0; i < nonEmptyRecords.length; i++) {
            // Get record sets one by one
            const record = nonEmptyRecords[i];
            // Create keys of those record sets
            const recordKey: string = record[0] + record[1]; // cusip + sector name
            // Check if the key is already present in the map. If not then it has appeared for the first time.
            if (!pastedRecordsMap.get(recordKey)) {
                uniqueRecordSet.push(record);
                // Put the key value in the map to mark it as duplicate
                pastedRecordsMap.set(recordKey, record);
            }
        }
        return uniqueRecordSet;
    }

}
