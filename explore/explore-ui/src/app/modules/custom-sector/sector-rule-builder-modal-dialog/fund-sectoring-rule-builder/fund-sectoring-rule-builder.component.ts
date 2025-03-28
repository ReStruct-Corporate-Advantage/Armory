import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {BreakdownTreeNode, ColumnSectorRule, CustomSector, FundSectoringRecordKey, GroupRule, Rule, SectorConstants, SectorRuleBuilderConfig, SectorUtils, SectorRuleUtils} from '@blk/explore-ui-breakdown';
import FundSectoringConfig from '../../../../../assets/fund-sectoring-config/fund-sectoring-config.json';
import {FundSectoringRuleTableComponent} from './fund-sectoring-rule-table/fund-sectoring-rule-table.component';
import {BehaviorSubject} from 'rxjs';
import {isEmpty} from 'lodash';
import {ColumnConstants} from '@blk/explore-ui-core';

/**
 * Component used to create/update fund sectoring Custom Sector Rule i.e. Portfolio, Index and Fund custom sector type
 */
@Component({
    selector: 'app-fund-sectoring-rule-builder',
    templateUrl: './fund-sectoring-rule-builder.component.html',
    styleUrls: ['./fund-sectoring-rule-builder.component.scss']
})
export class FundSectoringRuleBuilderComponent implements OnInit {

    @Input() sectorRuleBuilderConfig: SectorRuleBuilderConfig;

    @Input() rule: ColumnSectorRule | GroupRule;

    @Input() customSectorType: string;

    @ViewChild(FundSectoringRuleTableComponent, {static: false})
    fundSectoringRuleTable: FundSectoringRuleTableComponent;

    selectedRecords: FundSectoringRecordKey[] = [];

    assignedRecordsMapping: Map<FundSectoringRecordKey, CustomSector[]> = new Map<FundSectoringRecordKey, CustomSector[]>();

    portfolioRule: ColumnSectorRule;

    cusipRule: ColumnSectorRule;

    isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    ngOnInit() {
        if (this.sectorRuleBuilderConfig && this.sectorRuleBuilderConfig.breakdownTree) {
            this.populateRecordsMapping(this.sectorRuleBuilderConfig.breakdownTree);
            this.removeCustomSectorEntriesFromRecordsMapping(this.sectorRuleBuilderConfig.sectorNode.getCustomSector());
            this.setAssignedRecordsMappingForCustomSector(this.getAssignedRecordsFromRule(this.rule), this.sectorRuleBuilderConfig.sectorNode.getCustomSector());
            // This will be executed when nested fund sector rule is loaded
            if (this.rule instanceof GroupRule) {
                this.portfolioRule = this.rule.subRules[0] as ColumnSectorRule;
                this.cusipRule = this.rule.subRules[1] as ColumnSectorRule;
            }
        }
    }

    /**
     * Method to populate assigned Records map with records assigned in breakdown tree
     * @param breakdownTree
     */
    private populateRecordsMapping(breakdownTree: BreakdownTreeNode): void {
        if (breakdownTree.isEmpty()) {
            return;
        }
        for (const childNode of breakdownTree.children) {
            if (childNode.isCustomSectorNode()) {
                const customSector = childNode.getCustomSector();
                let assignedRecords: FundSectoringRecordKey[];
                assignedRecords = this.getAssignedRecordsFromRule(customSector.rule);
                this.setAssignedRecordsMappingForCustomSector(assignedRecords, customSector);
            }
            this.populateRecordsMapping(childNode);
        }
    }

    /**
     * Method to remove all the custom sector records entries  from assigned Records map.
     * @param customSector
     */
    private removeCustomSectorEntriesFromRecordsMapping(customSector: CustomSector) {
        const assignedRecords = this.getAssignedRecordsFromRule(customSector.rule);
        assignedRecords.forEach((assignedRecord: FundSectoringRecordKey) => {
            const record = SectorUtils.getRecordKeyFromMap(this.assignedRecordsMapping, assignedRecord.nodeName);
            if (record) {
                const customSectors = this.assignedRecordsMapping.get(record);
                if (customSectors && customSectors.indexOf(customSector) > -1) {
                    customSectors.splice(customSectors.indexOf(customSector), 1);
                }
            }
        });
    }

    /**
     * populate assigned records map with assigned records of custom sector
     * @param records
     * @param customSector
     */
    private setAssignedRecordsMappingForCustomSector(records: FundSectoringRecordKey[], customSector: CustomSector): void {
        records.forEach((record: FundSectoringRecordKey) => {
            const recordKey = SectorUtils.getRecordKeyFromMap(this.assignedRecordsMapping, record.nodeName);
            if (recordKey && this.assignedRecordsMapping.get(recordKey).indexOf(customSector) < 0) {
                this.assignedRecordsMapping.get(recordKey).push(customSector);
            } else {
                this.assignedRecordsMapping.set(record, [customSector]);
            }
        });
    }

    /**
     * get list of records assigned to rule
     */
    private getAssignedRecordsFromRule(rule: Rule): FundSectoringRecordKey[] {
        if (rule instanceof ColumnSectorRule) {
            if (this.isValidColumnSectorRule(rule)) {
                return this.createRecords(rule.comparisonValues);
            }
        } else if (rule instanceof GroupRule) {
            if (SectorRuleUtils.isNestedFundSectorRule(rule)) {
                return this.getAssignedRecordsFromNestedFundSectorRule(rule);
            } else {
                return this.getAssignedRecordsFromGroupRule(rule);
            }
        }
        return [];
    }


    /**
     * get list of records assigned to group rule
     */
    private getAssignedRecordsFromGroupRule(groupRule: GroupRule): FundSectoringRecordKey[] {
        const records: FundSectoringRecordKey[] = new Array<FundSectoringRecordKey>();
        for (const rule of groupRule.subRules) {
            const subRuleRecords = this.getAssignedRecordsFromRule(rule);
            records.push(...subRuleRecords.filter((record: FundSectoringRecordKey) => {
                return records.findIndex((subRecord: FundSectoringRecordKey) => {
                    return subRecord.nodeName === record.nodeName && subRecord.cusip === record.cusip;
                }) === -1;
            }));
        }
        return records;
    }

    /**
     * get list of records assigned to nested fund sector rule
     */
    private getAssignedRecordsFromNestedFundSectorRule(nestedFundSectorRule: GroupRule): FundSectoringRecordKey[] {
        const portfolioRule = nestedFundSectorRule.subRules[0];
        const cusipRule = nestedFundSectorRule.subRules[1];
        if (this.isValidColumnSectorRule(portfolioRule) && this.isValidColumnSectorRule(cusipRule)) {
            const comparisonValuesOfPortfolioRule = (nestedFundSectorRule.subRules[0] as ColumnSectorRule).comparisonValues;
            const comparisonValuesOfCusipRule = (nestedFundSectorRule.subRules[1] as ColumnSectorRule).comparisonValues;
            return this.createRecords(comparisonValuesOfPortfolioRule, comparisonValuesOfCusipRule);
        }
        return [];
    }

    /**
     * Create list of records from comparison values assigned to rules.
     */
    private createRecords(nodeNames: Array<string|number>, cusipValues?: Array<string|number>): FundSectoringRecordKey[] {
        const cusipComparisonValues = cusipValues ? cusipValues : [];
        const selectedValuesLength = nodeNames.length;
        const records = [];
        for (let i = 0; i < selectedValuesLength; i++) {
            records.push({
                nodeName: nodeNames[i] as string,
                cusip: cusipComparisonValues[i] ? cusipComparisonValues[i] as string : undefined
            });
        }
        return records;
    }


    /**
     * Checks if the customSector is valid for Fund Sectoring or not
     */
    public isValidColumnSectorRule(rule: Rule): boolean {
        // A rule is valid for fund sectoring if:
        // the type of current sector in a breakdown is same as the sector type of the sector opened
        // rule is ColumnSectorType
        // columnTag of rule is either portfolio_name or cusip
        return rule instanceof ColumnSectorRule && this.customSectorType === rule.customSectorType && rule.comparisonValues !== undefined && (rule.columnTag === 'portfolio_name' || rule.columnTag === 'cusip');
    }

    /**
     * Method to validate fund sectoring rule
     */
    validateRule(): boolean {
        return !!this.selectedRecords.length;
    }

    /**
     * Method to check if user prompt is needed to switch between custom sector types tabs
     */
    shouldDisplayWarningDialogForTabSwitch(): boolean {
        return !isEmpty(this.selectedRecords) || this.assignedRecordsMapping.size > 0;
    }

    /**
     * Method to update fund sectoring rule
     */
    updateRule(): boolean {
        if (!this.validateRule()) {
            return false;
        }
        if (this.rule instanceof ColumnSectorRule) {
            const values = this.selectedRecords.map((record: FundSectoringRecordKey) => {
                return record.nodeName;
            });
            return ColumnSectorRule.updateRule(this.rule, FundSectoringConfig.cusipColumn, SectorConstants.CUSTOM_RULE_BUILDER_OPERATORS.EQUALS.displayValue, values, ColumnConstants.COLUMN_DATA_TYPE.STRING);
        }
        return this.updateNestedFundSectorRule();
    }

    /**
     * Method to update nested fund sector rule
     */
    private updateNestedFundSectorRule(): boolean {
        const portfolioColumnValues = this.selectedRecords.map((record: FundSectoringRecordKey) => {
            return record.nodeName;
        });
        const cusipColumnValues = this.selectedRecords.map((record: FundSectoringRecordKey) => {
            return record.cusip;
        });

        ColumnSectorRule.updateRule(this.cusipRule, FundSectoringConfig.cusipColumn, SectorConstants.CUSTOM_RULE_BUILDER_OPERATORS.EQUALS.displayValue, cusipColumnValues, ColumnConstants.COLUMN_DATA_TYPE.STRING);
        return ColumnSectorRule.updateRule(this.portfolioRule, FundSectoringConfig.portfolioColumn, SectorConstants.CUSTOM_RULE_BUILDER_OPERATORS.EQUALS.displayValue, portfolioColumnValues, ColumnConstants.COLUMN_DATA_TYPE.STRING);
    }
}
