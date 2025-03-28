import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {LibColumnUtils} from '@blk/explore-ui-column-option';
import {
    BreakdownBuilderSettings, BreakdownSectorSelectorOption,
    BreakdownTreeNode,
    ColumnSector,
    CustomSector,
    SchemaSector,
    SectorConstants,
    SectorRuleBuilderConfig
} from '@blk/explore-ui-breakdown';
import {BehaviorSubject} from 'rxjs';
import {
    AuxAdvancedTreeListInterface,
    AuxCheckboxChangedDetailInterface,
    AuxTextInputValueChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {ColumnDefinition, CoreCommonConstants, WidgetConfigType} from '@blk/explore-ui-core';

@Component({
    selector: 'app-breakdown-options',
    templateUrl: './breakdown-options.component.html',
    styleUrls: ['./breakdown-options.component.scss']
})
export class BreakdownOptionsComponent implements OnChanges {
    // used in HTML
    BreakdownTreeNode = BreakdownTreeNode;

    @Input()
    selectedNode: BreakdownTreeNode;

    @Input()
    breakdownBuilderSettings: BreakdownBuilderSettings;

    @Input()
    sectorTitleChangeCallback: Function;

    @Input()
    draggedSector$: BehaviorSubject<AuxAdvancedTreeListInterface>;

    @Input()
    breakdownTree: BreakdownTreeNode;

    @Input()
    createNewCustomSector: Function;

    @Input()
    refreshBreakdownTreeCallback: Function;

    @Input()
    widgetType: WidgetConfigType;

    @Input()
    selectedSector: BreakdownSectorSelectorOption;

    readonly SUPPORTED_COLUMN_GROUP_FOR_RETURN_WIDGET_QUANTILE: string[] = ['ESG', 'Company Fundamentals'];

    sectorRuleBuilderConfig: SectorRuleBuilderConfig;

    selectedNodeDataType: string;

    breakdownNodeDataType = SectorConstants.SECTOR_DATA_TYPE;

    customSector: CustomSector;

    hideQuantiles: boolean;

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.selectedNode) {
            this.selectedNodeDataType = this.getSectorType();
            if (this.selectedNodeDataType === this.breakdownNodeDataType.CUSTOM) {
                this.customSector = this.selectedNode.getCustomSector();
                this.sectorRuleBuilderConfig = new SectorRuleBuilderConfig(
                    LibColumnUtils.makeColumnTree(this.breakdownBuilderSettings.customSectorColumnFilter, this.breakdownBuilderSettings.fieldToUse),
                    this.selectedNode, false, this.breakdownBuilderSettings.showFundSectoringTabs, undefined, this.breakdownTree);
                this.sectorRuleBuilderConfig.createNewCustomSector = this.createNewCustomSector;
                this.sectorRuleBuilderConfig.refreshBreakdownTreeCallback = this.refreshBreakdownTreeCallback;
            }
        }
        if (changes.breakdownTree && this.sectorRuleBuilderConfig) {
            this.sectorRuleBuilderConfig.breakdownTree = this.breakdownTree;
        }

        this.setHideQuantile();
    }

    /**
     * Set hideQuantiles flag to true if column type is 'ESG' or 'Company Fundamentals' in return widget breakdown
     */
    setHideQuantile() {
        if (this.breakdownBuilderSettings.hideQuantiles ||
            (this.widgetType === WidgetConfigType.RETURNS
                && this.selectedSector?.eventData instanceof ColumnDefinition
                && (!this.SUPPORTED_COLUMN_GROUP_FOR_RETURN_WIDGET_QUANTILE.some(s => (this.selectedSector.eventData as ColumnDefinition).groups?.includes(s))))) {
            this.hideQuantiles = true;
        }

    }

    /**
     * Gets the type of the sector selected.
     */
    private getSectorType(): string {
        if (!this.selectedNode) {
            return CoreCommonConstants.EMPTY_STRING;
        } else {
            return this.selectedNode.sectorModel?.getDataType();
        }
    }

    onIncludeNoneBucketsChange(event: CustomEvent<AuxCheckboxChangedDetailInterface>) {
        (this.selectedNode.sectorModel as ColumnSector).useNoneBuckets = event.detail.value.checked;
    }

    /**
     * Is called when schema text field value is updated.
     */
    onSchemaValueChanged(event: CustomEvent<AuxTextInputValueChangedDetailInterface>) {
        (this.selectedNode.sectorModel as SchemaSector).userSpecifiedSchema = event.detail.value;
    }
}
