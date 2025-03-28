import {Report} from './report.model';
import {Workspace} from './workspace.model';
import {FlatWorkpad} from './flat-workpad.model';
import {ReportGroup} from './report-group.model';
import {Widget} from '../widget/widget.model';
import {Portfolio} from '../portfolio/portfolio.model';
import {TestUtils} from '../../utils/test.utils';
import {WidgetConfigType} from '@blk/explore-ui-core';
import {WorkspaceStore} from '../../stores';

/**
 * Test cases for Workspace model
 */
describe('Workspace', () => {
    let workspace: Workspace;
    let workpad: FlatWorkpad;
    let portfolio: Portfolio;
    let report: Report;
    let widget: Widget;

    beforeAll((done) => {
        TestUtils.initialize(done);
        WorkspaceStore.init();
    });

    beforeEach(() => {
        workspace = new Workspace();
        workpad = new FlatWorkpad();
        portfolio = new Portfolio();
        report = new Report();
        widget = new Widget(WidgetConfigType.RISK_EXPOSURE);
        WorkspaceStore.currentWorkpad$.next(workpad);

        workspace.title = 'My workspace';
        workspace.workpads = [workpad];
        workpad.portfolio = new Portfolio();
        workpad.reports = [report];
        report.widgets = [widget];
        widget.id = 123;
    });


    describe('configType Test', () => {
        it('should return workspace', () => {
            expect(Workspace.configType).toBe('workspace');
        });
    });

    describe('getConfigType Test', () => {
        it('should return Workspace.configType', () => {
            expect(workspace.getConfigType()).toEqual(Workspace.configType);
        });
    });

    describe('Test Generate Workspace URL method', () => {
        it('Returns null if workspace not saved', () => {
            const testWorkspace1 = new Workspace({id: null});
            expect(testWorkspace1.generateWorkspaceUrl()).toBeUndefined();
        });
        it('Returns workspace URL if workspace saved', () => {
            const testWorkspace2 = new Workspace({id: 1252888});
            const expectedWorkspaceURL = 'https://dev.blackrock.com/apps/explore-beta/?workspace=1252888';
            expect(testWorkspace2.generateWorkspaceUrl()).toEqual(expectedWorkspaceURL);
        });
        it('Returns workspace URL if workspace already has URL param', () => {
            // If the URL already contains a workspace URL param, just replace the workspace ID.
            const testWorkspace3 = new Workspace({id: 1252888});
            const expectedWorkspaceURL = 'https://dev.blackrock.com/apps/explore-beta/?workspace=1252888';
            expect(testWorkspace3.generateWorkspaceUrl()).toEqual(expectedWorkspaceURL);
        });
    });

    describe('doCopyFrom Test', () => {
        it('should copy object', () => {
            const newWorkspace = new Workspace();
            newWorkspace.copyFrom(workspace);
            expect(newWorkspace.title).toBe('My workspace');
            expect(newWorkspace.workpads.length).toBe(1);
            expect(newWorkspace.workpads[0].reports.length).toBe(1);
            expect(newWorkspace.workpads[0].reports[0].widgets.length).toBe(1);
            expect(newWorkspace.workpads[0].reports[0].widgets[0].id).toEqual(123);

            const newReport = new Report();
            newReport.copyFrom(workspace);
            expect(newReport.widgets.length).toBe(0);
        });
    });

    describe('doSerialize/doDeserialize Test', () => {
        it('should serialize/deserialize', () => {
            const data = workspace.serialize();
            const newWorkspace = new Workspace(data);
            expect(newWorkspace.title).toBe('My workspace');
            expect(newWorkspace.workpads.length).toBe(1);
            expect(newWorkspace.workpads[0].reports.length).toBe(1);
            expect(newWorkspace.workpads[0].reports[0].widgets.length).toBe(1);
            expect(newWorkspace.workpads[0].reports[0].availableDataStores.size).toBe(1);
        });

        it('should not deserialize blank workpad', () => {
            const data: any = { workpads : [{portfolios: []}, {}]};
            const newWorkspace = new Workspace(data);
            expect(newWorkspace.workpads.length).toBe(0);
        });
    });

    describe('addWorkpads Test', () => {
        it('should add one workpad to workspace', () => {
            workspace.addWorkpads(new ReportGroup());
            expect(workspace.workpads.length).toBe(2);
            expect(workspace.workpads[1] instanceof ReportGroup).toBeTruthy();
        });

        it('should add many workpads to workspace', () => {
            workspace.addWorkpads([new ReportGroup(), new FlatWorkpad()]);
            expect(workspace.workpads.length).toBe(3);
            expect(workspace.workpads[2] instanceof FlatWorkpad).toBeTruthy();
        });
    });

    describe('removeWorkpad Test', () => {
        it('should remove workapd from workspace', () => {
            workspace.removeWorkpad(workpad);
            expect(workspace.workpads.length).toBe(0);
        });
    });

    describe('getReportGroups Test', () => {
        it('should return all ReportGroups from the workpads list', () => {
            const reportGroup = new ReportGroup();
            reportGroup.title = 'Test Report Group';
            workspace.addWorkpads(reportGroup);

            const returnedValue = workspace.getReportGroups();
            expect(returnedValue.length).toBe(1);
            expect(returnedValue[0]).toBe(reportGroup);
        });
    });
});
