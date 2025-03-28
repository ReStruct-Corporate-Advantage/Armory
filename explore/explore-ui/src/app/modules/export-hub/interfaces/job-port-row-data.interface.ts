import {DateValue} from '@blk/explore-ui-core';
import {Benchmark} from '@models/portfolio/benchmark.model';
import {AuxIconCellRendererParams} from '@blk/aladdin-angular-components';

export interface JobPortRowData {
    portfolio: string;
    runAs: string;
    date: DateValue;
    currency: string;
    benchmark: Benchmark;
    actionButton: AuxIconCellRendererParams;
    portfolio_settings: AuxIconCellRendererParams;
}
