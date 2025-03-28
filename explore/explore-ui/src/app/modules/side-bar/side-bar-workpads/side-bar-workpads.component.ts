import {ChangeDetectorRef, Component, OnInit} from '@angular/core';

import {ReportGroup} from '@models/workspace/report-group.model';
import {WorkspaceStore} from '../../../stores/workspace.store';
import {BaseWorkpad} from '@models/workspace/base-workpad.model';
import {FlatWorkpad} from '@models/workspace/flat-workpad.model';
import {Workspace} from '@models/workspace/workspace.model';
import {takeUntil} from 'rxjs/operators';
import {AppStore} from '../../../app.store';
import {SubscribableComponent} from '@blk/explore-ui-core';

/**
 * This component contains all the workpads i.e. FlatWorkpads and ReportGroups
 * It contains list of SideBarPortfolioComponent and SideBarReportGroupComponent
 */
@Component({
    selector: 'app-side-bar-workpads',
    templateUrl: './side-bar-workpads.component.html',
    styleUrls: ['./side-bar-workpads.component.scss']
})
export class SideBarWorkpadsComponent extends SubscribableComponent implements OnInit {

    workspace: Workspace;

    constructor(private changeDetectorRef: ChangeDetectorRef, private appStore: AppStore) {
        super();
    }

    ngOnInit(): void {
        WorkspaceStore.getWorkspace$()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((workspace: Workspace) => {
                this.workspace = workspace;
                this.changeDetectorRef.markForCheck();
            });
    }

    /**
     * Deletes workpad from workspace
     */
    deleteWorkpad(workpad: BaseWorkpad) {
        WorkspaceStore.portfolioLoadingStatusMap.delete(workpad.getAllPortfolios()[0].portId);
        WorkspaceStore.removeWorkpadAndUpdateCurrent(workpad, true);
    }

    /**
     * Selects the flat workpad and portfolio in it.
     */
    flatWorkpadSelected(workpad: FlatWorkpad) {
        if (WorkspaceStore.getCurrentWorkpad() !== workpad) {
            // if this is the flat Workpad then get the portfolio and update current workpad
            WorkspaceStore.validateWorkpadAndUpdate(workpad);
        }
    }

    /**
     * Checks if the workpad is a flat one.
     */
    isFlatWorkpad(workpad: BaseWorkpad): boolean {
        return workpad instanceof FlatWorkpad;
    }

    /**
     * Checks if the workpad is a report group.
     */
    isReportGroup(workpad: BaseWorkpad): boolean {
        return workpad instanceof ReportGroup;
    }

    /**
     * Returns as a ReportGroup
     */
    asReportGroup(workpad: BaseWorkpad): ReportGroup {
        return workpad as ReportGroup;
    }
}
