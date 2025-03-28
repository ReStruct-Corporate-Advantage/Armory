import {ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {cloneDeep} from 'lodash';
import {SubscribableComponent} from '@blk/explore-ui-core';
import {AddPortfolioService} from '../add-portfolio.service';
import {AuxPicklist, AuxPicklistDetailInterface} from '@blk/aladdin-angular-components';
import {ExploreIndexSearchService, SearchedIndexData} from '@services/explore-index-search/explore-index-search.service';
import {takeUntil} from 'rxjs/operators';
import {IndexResearchTreeUtils} from '@utils/index-research-tree.utils';

@Component({
    selector: 'app-add-index-research',
    templateUrl: './add-index-research.component.html',
    styleUrls: ['./add-index-research.component.scss']
})
export class AddIndexResearchComponent extends SubscribableComponent implements OnInit {

    @Output() selectedPortfolioTickersChanged = new EventEmitter();
    @ViewChild('auxPickList', {static: false}) auxPickList: AuxPicklist;

    /**
     * the original list of indexes. This is used to "reset" the picklist after some changes
     * For example, if the user selects an index and adds it to the selectedPortTickerList, then clicks the Add button,
     * when they return to the modal, the selected indexes from the previous modal's "session" should not be selected
     */
    auxOriginalPicklist = [];

    // track if any tickers have been marked in picklist, to enable add button
    isTickerMarked = false;

    constructor(private indexSearchService: ExploreIndexSearchService, private addPortfolioService: AddPortfolioService, private cdRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        // get the indexes and create the picklist tree
        this.indexSearchService.searchIndex$(true)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data: SearchedIndexData) => {
                this.auxPickList.sourceData = IndexResearchTreeUtils.createIndexTree(data.searchResults);
                if (this.auxPickList.sourceData) {
                    this.auxOriginalPicklist = cloneDeep(this.auxPickList.sourceData);
                }
            });
    }

    /**
     * when the user clicks the > button, get the selected items in the picklist and add them to the selectedPortTickerList
     * in the iterateThroughSelectedIndexes method
     */
    onGetIndexesFromSearchButtonClick() {
        this.auxPickList.getSourceSelection().then(sourceData => {
            this.iterateThroughSelectedIndexes(sourceData);
        });
    }

    /**
     * recursively loop through the children of each index to get all selected tickers
     */
    iterateThroughSelectedIndexes(data: any[]) {
        data.forEach(child => {
            if (child.children && child.children.length > 0) {
                this.iterateThroughSelectedIndexes(child.children);
            } else {
                this.addPortfolioService.selectedPortfolioTickers.add(child);
            }
        });
        this.cdRef.detectChanges();
        this.selectedPortfolioTickersChanged.emit();
    }

    /**
     * Called when tickers are selected (checkbox checked) in picklist.  Used to enable add button.
     * @param event  Event emitted by picklist that contains all selected tickers
     */
    onTickerClicked(event: CustomEvent<AuxPicklistDetailInterface>): void {
        const markedTickers: any[] = event.detail.value;
        this.isTickerMarked = markedTickers.length > 0;
    }
}
