import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CoreRiskConstants} from '@blk/explore-ui-risk';
import {BreakdownBuilderSettings, BreakdownSectorSelectorOption} from '@blk/explore-ui-breakdown';
import {BreakdownUtils} from '@utils/breakdown.utils';
import {BehaviorSubject} from 'rxjs';
import {AuxAdvancedTreeListInterface, AuxSearchFieldSearchValueChangedDetailInterface} from '@blk/aladdin-angular-components';
import {BreakdownFavoriteConstants} from '@blk/explore-ui-breakdown';
import {ColumnConstants, WidgetConfigType} from '@blk/explore-ui-core';

/**
 * Component to display sector selections that includes Individual Measures(Column Sectors), Common hierarchies and custom sectors
 */
@Component({
    selector: 'app-breakdown-sector-selector',
    templateUrl: './breakdown-sector-selector.component.html',
    styleUrls: ['./breakdown-sector-selector.component.scss']
})
export class BreakdownSectorSelectorComponent implements OnInit {

    @Input()
    breakdownBuilderSettings: BreakdownBuilderSettings;

    @Input()
    isDisabled: boolean;

    @Input()
    addSectorSubject$: BehaviorSubject<AuxAdvancedTreeListInterface>;

    @Output()
    addNewCustomSector = new EventEmitter();

    selectedNodeSubject$: BehaviorSubject<AuxAdvancedTreeListInterface> = new BehaviorSubject<AuxAdvancedTreeListInterface>(null);

    draggedNodeSubject$: BehaviorSubject<AuxAdvancedTreeListInterface> = new BehaviorSubject<AuxAdvancedTreeListInterface>(null);

    // to filter tree data based on the term
    searchTermSubject$: BehaviorSubject<string> = new BehaviorSubject<string>(null);

    individualMeasuresSelections: BreakdownSectorSelectorOption[];

    commonHierarchiesSelections: BreakdownSectorSelectorOption[];

    selectedSector: AuxAdvancedTreeListInterface;

    showCommonHierarchiesSelections = false;

    isExpanded: boolean;

    accordionCustomStyle = {
        'aux-accordion-expansion-panel__container': {
            borderTop: 0,
            borderBottom: 0
        },
        'aux-accordion-expansion-panel__content': {
            paddingTop: 0,
            paddingBottom: 0
        }
    };

    ngOnInit() {
        const showSchemaOption = this.breakdownBuilderSettings.inputName === CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN;
        let columnFilter = this.breakdownBuilderSettings.columnFilter;
        if (this.breakdownBuilderSettings.widgetType === WidgetConfigType.RISK_EXPOSURE || this.breakdownBuilderSettings.widgetType === WidgetConfigType.PRA) {
            // only if it's risk & exposure, we want to skip the "forTopdown" filter
            // because we want to have portfolio attributes from ADAM to be available in the breakdown section
            columnFilter = columnFilter.filter(filterObj => filterObj.key !== ColumnConstants.FOR_TOP_DOWN);
        }
        this.individualMeasuresSelections = BreakdownUtils.createIndividualMeasuresSectorTreeOptions(columnFilter, this.breakdownBuilderSettings.fieldToUse, showSchemaOption);
        if (this.breakdownBuilderSettings.inputName !== CoreRiskConstants.CONFIG_TYPE.RISK_FACTOR_BREAKDOWN && this.breakdownBuilderSettings.favoriteType !== BreakdownFavoriteConstants.FACTOR_BREAKDOWN) {
            this.showCommonHierarchiesSelections = true;
            this.commonHierarchiesSelections = BreakdownUtils.createCommonHierarchiesSectorTreeOptions(this.breakdownBuilderSettings.columnFilter, this.breakdownBuilderSettings.fieldToUse, this.breakdownBuilderSettings.includePerformanceBreakdown);
        }
        this.selectedNodeSubject$.subscribe((selection: AuxAdvancedTreeListInterface) => {
            this.onSelectionChanged(selection);
        });
    }

    /**
     * Method called when any sector selection is changed
     */
    private onSelectionChanged(selection: AuxAdvancedTreeListInterface) {
        this.selectedSector = selection;
    }

    /**
     * Method called on new custom sector link click
     */
    onNewCustomSectorClick(event: MouseEvent) {
        if (event.target['isDisabled']) {
            return;
        }
        this.addNewCustomSector.emit();
        event.preventDefault();
    }

    /**
     * Method called on sector search value change
     */
    sectorSearchValueChanged(event: CustomEvent<AuxSearchFieldSearchValueChangedDetailInterface>) {
        this.searchTermSubject$.next(event.detail.submitValue.searchValue);
        this.isExpanded = !!event.detail.submitValue.searchValue;
    }

}
