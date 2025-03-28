import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Security} from '@interfaces/security.interface';
import {isEmpty} from 'lodash';
import {PortfolioObjective} from '@models/portfolio/objectives/portfolio-objective.model';
import {AlphaScorePortfolioObjective} from '@models/portfolio/objectives/alpha-score-portfolio-objective.model';
import {SecuritySearchComponent} from '../../../../../../shared/components';
import {NotificationService} from '@services/notification';
import {AlertConstants, ErrorTypeConstants, UIErrorParameters} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import {OptimizationConstants} from '@constants/optimization.constants';

/**
 * Modal component for upload Alpha
 */
@Component({
    selector: 'app-upload-alpha-score-modal',
    templateUrl: './upload-alpha-score-modal.component.html',
    styleUrls: ['./upload-alpha-score-modal.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadAlphaScoreModalComponent implements OnInit {
    @Input() isOpen: boolean;

    @Input() portfolioObjective: PortfolioObjective;

    @Output() uploadAlphaModalClosed = new EventEmitter<any>();

    @ViewChild('securitySearchComp', {static: false}) securitySearchComp: SecuritySearchComponent;

    selectedSecurities = new Map<string, Security>();

    colConfigForSecuritySearch = OptimizationConstants.UPLOAD_ALPHA_SECURITY_SEARCH_COL_DEF;

    constructor( private notificationService: NotificationService) {}

    ngOnInit() {
        if (this.portfolioObjective instanceof AlphaScorePortfolioObjective && !isEmpty(this.portfolioObjective.uploadedAlpha)) {
            this.portfolioObjective.uploadedAlpha.forEach((value, key) => {
                this.selectedSecurities.set(key, {
                    error: undefined,
                    cusip: key,
                    description: undefined,
                    securityGroup: undefined,
                    currentValue: undefined,
                    newValue: undefined,
                    alpha: value
                });
            });
        }
    }

    /**
     * Called upon close of modal
     */
    onClosed(isSave: boolean) {
        if (isSave && this.portfolioObjective instanceof AlphaScorePortfolioObjective) {
            this.portfolioObjective.isUploadAlpha = true;
            const uploadedAlpha = new Map<string, number>();
            const invalidSecurities = [];
            this.selectedSecurities.forEach(security => {
                if (!security.error) {
                    uploadedAlpha.set(security.cusip, security.alpha);
                } else {
                    invalidSecurities.push(security.cusip);
                }
            });
            if (invalidSecurities.length > 0) {
                let errorMessage = AlertConstants.NOTIFICATION.ERROR_LOADING_SECURITIES + CommonConstants.COLON;
                invalidSecurities.forEach(security => errorMessage += CommonConstants.SINGLE_SPACE + security + CommonConstants.COMMA_SEPARATOR);
                // remove extra ',' at end and show error message
                this.notificationService.error(errorMessage.slice(0, -1), ErrorTypeConstants.UI_VALIDATION_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_ON_CLOSED_ERROR);
                return;
            }
            this.portfolioObjective.uploadedAlpha = uploadedAlpha;
            this.portfolioObjective.alphaScoreMeasure = undefined;
        }
        this.isOpen = false;
        this.uploadAlphaModalClosed.emit();
    }
}
