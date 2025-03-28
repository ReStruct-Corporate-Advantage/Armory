import {LoadAllDataRequest} from './load-all-data-request.model';
import {Portfolio} from '@models/portfolio/portfolio.model';
import {Report} from '@models/workspace/report.model';
import {Widget} from '@models/widget/widget.model';

/**
 * Tests for LoadAllDataRequest
 */
describe('LoadAllDataRequest', () => {
    it('should create an instance', () => {
        const loadAllDataRequest = new LoadAllDataRequest(new Portfolio('PEP'), new Report(), new Widget());
        expect(loadAllDataRequest.portfolio.portName).toBe('PEP');
        expect(loadAllDataRequest.report).toBeDefined();
        expect(loadAllDataRequest.widget).toBeDefined();
        expect(loadAllDataRequest.workpadPortfolios).not.toBeDefined();
    });
});
