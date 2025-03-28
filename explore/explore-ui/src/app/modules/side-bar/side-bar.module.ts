import {CUSTOM_ELEMENTS_SCHEMA, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AladdinAngularComponentsModule} from '@blk/aladdin-angular-components';
import {SideBarComponent} from './side-bar.component';
import {SideBarPortfolioComponent} from './side-bar-workpads/side-bar-portfolio/side-bar-portfolio.component';
import {SideBarReportGroupComponent} from './side-bar-workpads/side-bar-report-group/side-bar-report-group.component';
import {SideBarWorkpadsComponent} from './side-bar-workpads/side-bar-workpads.component';
import {PortfolioSearchModule} from '@blk/explore-ui-portfolio-search';
import {WorkspaceActionsComponent} from './workspace-actions/workspace-actions.component';
import {FavoriteModule} from '../favorite/favorite.module';
import {DialogModule} from '@blk/explore-ui-core';
import {WorkspaceActionsMenuComponent} from './workspace-actions/workspace-actions-menu/workspace-actions-menu.component';
import {ExportModule} from '../export/export.module';
import {SharedModule} from '../../shared/shared.module';
import {SideBarReportGroupActionsMenuComponent} from './side-bar-workpads/side-bar-report-group/side-bar-report-group-actions-menu/side-bar-report-group-actions-menu.component';
import {
    LoadWorkspaceWarningModalComponent
} from './workspace-actions/workspace-actions-menu/save-workspace-warning-modal/load-workspace-warning-modal.component';

@NgModule({
    declarations: [
        SideBarComponent,
        SideBarPortfolioComponent,
        SideBarReportGroupComponent,
        SideBarWorkpadsComponent,
        WorkspaceActionsComponent,
        WorkspaceActionsMenuComponent,
        SideBarReportGroupActionsMenuComponent,
        LoadWorkspaceWarningModalComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [CommonModule, AladdinAngularComponentsModule, PortfolioSearchModule, SharedModule, DialogModule, FavoriteModule, ExportModule],
    exports: [SideBarComponent]
})
export class SideBarModule {
}
