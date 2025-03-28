import {Component, Input, OnInit} from '@angular/core';
import {UserMetaDataStore} from '@stores/index';
import {UserPreference} from '@constants/user-preference.constants';
import {takeUntil} from 'rxjs/operators';
import {ExploreConstants} from '@constants/explore.constants';
import {SubscribableComponent} from '@blk/explore-ui-core';

@Component({
    selector: 'app-loading-spinner',
    templateUrl: './loading-spinner.component.html',
    styleUrls: ['./loading-spinner.component.scss']
})

/**
 * Loading Spinner Component that utilizes gif image files
 */
export class LoadingSpinnerComponent extends SubscribableComponent implements OnInit {
    @Input() size: string;
    @Input() loadingLabel: string;

    // Flag for light or dark mode
    isLightTheme: boolean = true;

    ngOnInit(): void {
        // Subscribe to changes in the theme.
        UserMetaDataStore.getPreferenceSubject(UserPreference.THEME)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(value => {
                // Update active theme class
                this.isLightTheme = value === ExploreConstants.THEME_LIGHT_MODE;
            });
    }
}
