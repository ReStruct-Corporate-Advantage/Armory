import {Component, OnInit} from '@angular/core';
import {AuxTabBarItemInterface, AuxTabBarSelectedDetailInterface} from '@blk/aladdin-angular-components';
import {JOB_MANAGEMENT, PREVIOUSLY_USED_WIDGETS} from '../../../constants/export-hub.constants';

@Component({
    selector: 'app-main-tabs',
    templateUrl: './main-tabs.component.html',
    styleUrls: ['./main-tabs.component.scss']
})
export class MainTabsComponent implements OnInit {

    readonly JOB_MANAGEMENT = JOB_MANAGEMENT;
    readonly PREVIOUSLY_USED_WIDGETS = PREVIOUSLY_USED_WIDGETS;
    selectedTab: string;

    allMainTabs: AuxTabBarItemInterface[] = [
        {
            'label': 'Job Management',
            'uid': JOB_MANAGEMENT
        }
    ];

    /**
     * OnInit hook
     */
    ngOnInit(): void {
        this.selectedTab = this.allMainTabs[0].uid;
    }

    /**
     * Tab bar item selected event handler
     */
    tabBarItemSelected(event: CustomEvent<AuxTabBarSelectedDetailInterface>): void {
        this.selectedTab = event?.detail?.uid;
    }
}
