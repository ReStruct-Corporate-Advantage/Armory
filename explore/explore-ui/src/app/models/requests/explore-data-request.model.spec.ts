import {ExploreDataRequest} from '@models/requests/explore-data-request.model';

describe('data request model test cases', () => {
    it('set report, widget, and workspace title', () => {
        const dataRequest = new ExploreDataRequest();
        dataRequest.reportTitle = 'Report 1';
        dataRequest.widgetTitle = 'Risk and Exposure';
        dataRequest.workspaceTitle = 'RSP Ticket';
        dataRequest.workspaceOwner = '_Admin';

        // Validate.
        expect(dataRequest.reportTitle).toBe('Report 1');
        expect(dataRequest.widgetTitle).toBe('Risk and Exposure');
        expect(dataRequest.workspaceOwner).toBe('_Admin');
        expect(dataRequest.workspaceTitle).toBe('RSP Ticket');
    });
});
