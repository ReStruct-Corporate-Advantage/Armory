import {ExportConfig} from '@interfaces/export-config.interface';
import {Widget} from '@models/widget/widget.model';
import {Report} from '@models/workspace/report.model';
import {Portfolio} from '@models/portfolio/portfolio.model';

/**
 * Composite Object that is passed to ExportService
 */
export class ExportComposite {
    widget: Widget;

    report: Report;

    portfolio: Portfolio;

    portfolios: Portfolio[] = []; // We may need other portfolios if we're doing comparison exports

    exportConfig: ExportConfig;

    tableData?: any;

    outlineData?: any;

    chartingLib: string;

    isLast: boolean;
}
