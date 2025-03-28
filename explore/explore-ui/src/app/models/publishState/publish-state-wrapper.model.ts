/**
 * Wrapper for PublishStateModel Model. Belongs to a portfolio object and
 * contains information about publish states for the portfolio.
 */
import moment from 'moment';
import {PublishStateItem} from '@models/publishState/publish-state-item.model';

export class PublishStateWrapper {

    publishedStateResults: PublishStateItem[] = [];
    lastFetchedTime: moment.Moment = moment();
    hasBeenFetched = false;
    isFirstLoad = true; // to disable the qc status button before loading first time
    isNullQC = false; // set QC status to an empty circle at midnight so user needs to run refresh
    isQCDataObsolete = false; // reveal refresh QC button in the popup
}
