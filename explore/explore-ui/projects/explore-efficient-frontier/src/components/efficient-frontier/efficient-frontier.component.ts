import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {cloneDeep, isEmpty, isNil} from 'lodash';
import {EfficientFrontierConstants} from '../../efficient-frontier.constants';
import axisColumnsJson from '../../config/axisColumns.json';
import {
    AuxSelectOption,
    AuxSelectOptionGroup,
    AuxSelectSelectionChangedDetailInterface
} from '@blk/aladdin-angular-components';
import {LatestOptimizationRunDetails} from '../../models/latest-optimization-run-details';
import {VizualizationColumnConfigEF} from '../../interfaces/common.interface';

/**
 * Efficient frontier component handles explore specific parts of the initialization.
 * Prepares cube, requestConfig and response
 */
@Component({
    selector: 'explore-efficient-frontier',
    templateUrl: './efficient-frontier.component.html',
    styleUrls: ['./efficient-frontier.component.scss']
})
export class EfficientFrontierComponent implements OnInit, OnChanges {

    // base portfolio name
    @Input() basePortfolioName: string;

    // selected optimization objective type
    @Input() optoObjectiveType: string;

    // portfolio objective type - Stress Scenario/ Alpha score
    @Input() isStressScenarioPortfolioObjective: boolean;

    // optimization solutions
    @Input() latestOptimizationRunDetails: LatestOptimizationRunDetails[];

    @Input() showXAxis: boolean;

    @Input() selectedYAxis: string;

    @Input() xAxisColumns: VizualizationColumnConfigEF[];

    @Output() selectedYAxisValueChanged = new EventEmitter();

    xAxis: AuxSelectOptionGroup[] = [];
    yAxis: AuxSelectOptionGroup[] = [];
    selectedXAxisColumn: VizualizationColumnConfigEF;
    selectedYAxisColumn: VizualizationColumnConfigEF;

    /**
     * OnInit hook
     */
    ngOnInit(): void {
        this.initializeAxisColumns();
    }

    /**
     * this method is invoked when any of the bound property changes
     * we need to re-render the chart
     */
    ngOnChanges(changes: SimpleChanges): void {
        if (changes?.basePortfolioName || changes?.optoObjectiveType || changes?.isStressScenarioPortfolioObjective || changes?.latestOptimizationRunDetails || changes?.showXAxis || changes?.selectedYAxis) {
            this.initializeAxisColumns();
        }
    }

    /**
     * initialize data for xAxis and yAxis dropdown
     */
    initializeAxisColumns() {
        const x_axisColumns: VizualizationColumnConfigEF[] = isEmpty(this.xAxisColumns) ? cloneDeep(axisColumnsJson['xAxisColConfig']) : this.xAxisColumns;
        const y_axisColumns: VizualizationColumnConfigEF[] = cloneDeep(axisColumnsJson['yAxisColConfig']);
        if (this.optoObjectiveType && this.optoObjectiveType !== EfficientFrontierConstants.ACTIVE_OBJECTIVE_TYPE) {
            x_axisColumns.forEach(col => col.columnTitle = col.columnTitle.replace('(Active)', '(Absolute)'));
            y_axisColumns.filter(col => col.columnTitle !== EfficientFrontierConstants.SYSTEMATIC_RISK_ACTIVE).forEach(col => col.columnTitle = col.columnTitle.replace('(Active)', '(Absolute)'));
        }
        // check if stress scenario objective is selected or Alpha score
        // update the column title accordingly
        if (this.isStressScenarioPortfolioObjective) {
            const alphaScoreCol = y_axisColumns.find(col => col.columnTitle.includes(EfficientFrontierConstants.ALPHA_SCORE));
            alphaScoreCol.columnTitle = alphaScoreCol.columnTitle.replace(EfficientFrontierConstants.ALPHA_SCORE, EfficientFrontierConstants.STRESS_SCENARIO);
        }
        this.selectedXAxisColumn = x_axisColumns.length > 1 ? x_axisColumns.find(col => col.columnKey === EfficientFrontierConstants.MAX_TOTAL_RISK) : x_axisColumns[0];
        let columnKey = !isNil(this.selectedYAxis) ? this.selectedYAxis : EfficientFrontierConstants.EXPECTED_RETURN;
        this.selectedYAxisColumn = y_axisColumns.find(col => col.columnKey === columnKey);

        this.xAxis = [];
        this.yAxis = [];
        this.xAxis.push({values: x_axisColumns.map(col => {
                return {
                    displayValue: col.columnTitle,
                    value: col,
                    isSelected: col.columnKey === this.selectedXAxisColumn.columnKey
                };
            })});
        this.yAxis.push({values: y_axisColumns.map(col => {
                return {
                    displayValue: col.columnTitle,
                    value: col,
                    isSelected: col.columnKey === this.selectedYAxisColumn.columnKey
                };
            })});
    }

    /**
     * Method called when yAxis column is changed
     */
    onYAxisColumnChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.selectedYAxisColumn = (event.detail.value as AuxSelectOption).value;
        this.selectedYAxisValueChanged.emit(this.selectedYAxisColumn.columnKey);
    }

    /**
     * Method called when xAxis column is changed
     */
    onXAxisColumnChanged(event: CustomEvent<AuxSelectSelectionChangedDetailInterface>): void {
        this.selectedXAxisColumn = (event.detail.value as AuxSelectOption).value;
    }

}
