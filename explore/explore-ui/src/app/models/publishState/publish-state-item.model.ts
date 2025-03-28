import {PublishStateCode} from '../../enums/publish-state-code.enum';
import {PublishStateConstants} from '../../constants/publish-state.constants';

/**
 * Model class for publish state
 */
export class PublishStateItem {
    portfolioName: string;
    publishState = PublishStateConstants.PRELIM_RISK;
    publishDate: string;

    /**
     * Constructor
     */
    constructor(portfolioName: string, publishCode: number, publishDate: string) {
        this.portfolioName = portfolioName;
        this.setPortfolioPublishedState(publishCode || PublishStateCode.UNPUBLISHED);
        this.publishDate = this.isUnpublished() ? PublishStateConstants.NOT_APPLICABLE : publishDate;

    }

    /**
     * @return a boolean to indicate whether the portfolio data is published.
     */
    isUnpublished(): boolean {
        return this.publishState === PublishStateConstants.PRELIM_RISK;
    }

    /**
     * Compares 2 publish state objects
     */
    equals(otherPublishState: PublishStateItem): boolean {
        if (!otherPublishState) {
            return false;
        }

        if (this.portfolioName !== otherPublishState.portfolioName) {
            return false;
        }

        if (this.publishState !== otherPublishState.publishState) {
            return false;
        }

        return this.publishDate === otherPublishState.publishDate;
    }

    /**
     * @return the QC status as string. For use in the publish state popover table.
     */
    private setPortfolioPublishedState(publishState: number): void {
        switch (publishState) {
            case PublishStateCode.LOCK_PUBLISHED:
            case PublishStateCode.UNLOCKED_PUBLISHED:
                this.publishState = PublishStateConstants.RISK_RELEASED;
                break;
            case PublishStateCode.PRE_PUBLISHED:
            case PublishStateCode.UNPUBLISHED:
                this.publishState = PublishStateConstants.PRELIM_RISK;
                break;
            default:
                this.publishState = PublishStateConstants.UNKNOWN;
        }
    }
}
