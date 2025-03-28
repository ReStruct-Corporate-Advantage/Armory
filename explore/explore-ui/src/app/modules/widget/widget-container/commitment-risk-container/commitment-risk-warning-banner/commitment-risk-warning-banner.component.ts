import {Component, Input, OnInit} from '@angular/core';
import {
    CommitmentRiskExcludedFundsLauncherService
} from '@services/spritelet-launcher/commitment-risk-excluded-funds-launcher.service';
import {Widget} from '@models/widget/widget.model';
import {SpriteletLauncherServiceRegistry} from '@services/spritelet-launcher/spritelet-launcher-service.registry';

@Component({
    selector: 'app-commitment-risk-warning-banner',
    templateUrl: './commitment-risk-warning-banner.component.html',
    styleUrls: ['./commitment-risk-warning-banner.component.scss']
})
export class CommitmentRiskWarningBannerComponent implements OnInit {

    @Input()
    widget: Widget;

    @Input()
    warningData: {[key: string]: any};

    warningMsg: string;

    constructor(private spriteletLauncherServiceRegistry: SpriteletLauncherServiceRegistry) {
    }

    ngOnInit(): void {
        const excludedFundsNumber = this.warningData['excluded_funds_number'] || 0;
        const allFundsNumber = this.warningData['all_funds_number'] || 0;
        let excludedCommitmentPercentage = this.warningData['excluded_commitment_percentage'] || 0;
        excludedCommitmentPercentage = Math.round(Number(excludedCommitmentPercentage));
        let excludedNavPercentage = this.warningData['excluded_nav_percentage'] || 0;
        excludedNavPercentage = Math.round(Number(excludedNavPercentage));
        this.warningMsg = `${excludedFundsNumber} out of ${allFundsNumber} funds in the portfolio are excluded; this amounts to ${excludedNavPercentage}% of the total market value and ${excludedCommitmentPercentage}% of the total commitment of the portfolio.`;
    }

    launchExcludedFundsSpritelet(): void {
        const launcherService = this.spriteletLauncherServiceRegistry.getSpriteletLauncherService(CommitmentRiskExcludedFundsLauncherService.ACTION_KEY);
        launcherService.launchSpritelet(this.widget, null);
    }

}
