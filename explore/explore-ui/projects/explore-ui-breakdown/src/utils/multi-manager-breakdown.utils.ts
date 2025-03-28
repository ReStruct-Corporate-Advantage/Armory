import {ColumnSector} from '../models/sector/column-sector/column-sector.model';
import {Breakdown} from '../models/breakdown/breakdown.model';
import {isEmpty} from 'lodash';

export class MultiManagerBreakdownUtils{


    static createBreakdownTreeForDecisionBenchData(portTreeDecisionLevel: number, topDownCols: any): Breakdown {
        const breakdown = new Breakdown();
        let decisionBenchBreakdownCols = [];
        if (portTreeDecisionLevel > 0 && isEmpty(topDownCols)) {
            decisionBenchBreakdownCols.push('portfolio_tree');
        } else if (!isEmpty(topDownCols)) {
            decisionBenchBreakdownCols = [...topDownCols];
        }
        let children = breakdown.children;
        decisionBenchBreakdownCols.forEach(column => {
            const columnSector = new ColumnSector();
            columnSector.columnTag = column;
            children.push(columnSector);
            columnSector.children = [];
            children = columnSector.children;
        });

        return breakdown;
    }
}
