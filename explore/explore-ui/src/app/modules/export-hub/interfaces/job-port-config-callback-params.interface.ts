import {JobPortRowOp} from '../enums/job-port-row-op.enum';
import {PortfolioSearchItem} from '@blk/explore-ui-portfolio-search';

export interface JobPortConfigCallbackParams {
    rowOp: JobPortRowOp;
    invalidItems?: PortfolioSearchItem[];
    rowIndex?: number;
}
