import {Component, EventEmitter, Input, OnChanges, Output} from '@angular/core';
import {ColumnConstants, ExploreSelectOption, ExploreSelectOptionGroup} from '@blk/explore-ui-core';
import {CommonConstants} from '@constants/common.constants';
import {SecuritySearchItem} from '@interfaces/security-search-item.interface';

@Component({
    selector: 'app-security-selection-modal',
    templateUrl: './security-selection-modal.component.html',
    styleUrls: ['./security-selection-modal.component.scss']
})

/**
 * Security selection modal component. Contains the modal which allows user to select a security in case a security identifier maps to multiple securities
 */
export class SecuritySelectionModalComponent implements OnChanges {

    @Output() modalClosed = new EventEmitter<Map<string, SecuritySearchItem>>();
    @Input() isOpen: boolean;
    @Input() securityIdentifiers: IterableIterator<string>;
    @Input() searchResults: SecuritySearchItem[];
    readonly DONE_TEXT = CommonConstants.BUTTON_TEXT.DONE;
    readonly CANCEL_TEXT = CommonConstants.BUTTON_TEXT.CANCEL;

    selectedSecuritiesForISIN = new Map<string, SecuritySearchItem>();
    ISINKeys: string[];
    mapForISINKeys = new Map<string, SecuritySearchItem[]>();
    mapForSelectOptions = new Map<string, ExploreSelectOptionGroup[]>();

    /**
     * ngOnChanges
     */
    ngOnChanges(): void {
        // Separate the ISIN keys from all the identifiers
        this.ISINKeys = Array.from(this.securityIdentifiers).filter(securityIdentifier => securityIdentifier.split(CommonConstants.COLON)[CommonConstants.SECURITY_INDEX].length === 12);
        this.ISINKeys.forEach((key: string) => {
            const isin = key.split(CommonConstants.COLON)[CommonConstants.SECURITY_INDEX];
            // Populate map for multiple securities that maps to a same ISIN
            this.mapForISINKeys.set(key, this.searchResults.filter(securitySearchItem => isin === securitySearchItem.isin));
            // Populate dropdown options
            const selectedCusip = this.mapForISINKeys.get(key)[0].cusip;
            this.mapForSelectOptions.set(key, [new ExploreSelectOptionGroup(this.mapForISINKeys
                .get(key)
                .map(securitySearchItem => new ExploreSelectOption(
                    ColumnConstants.CUSIP_IDENTIFIER_COLUMN.title + ' : ' + securitySearchItem.cusip,
                    securitySearchItem,
                    selectedCusip === securitySearchItem.cusip
                )))]);
            // Set the first security by default
            this.selectedSecuritiesForISIN.set(key, this.mapForISINKeys.get(key)[0]);
        });
    }

    /**
     * Update selected security
     */
    onSelectionChanged(securitySearchItem: SecuritySearchItem): void {
        this.selectedSecuritiesForISIN.set(securitySearchItem.isin, securitySearchItem);
    }

    /**
     * Close modal
     */
    closeModal(doneClicked?: boolean): void {
        // Clear selected securities if user hits cancel, In this scenario we won't add the securities to the grid which maps to same identifier
        if (!doneClicked) {
            this.selectedSecuritiesForISIN.clear();
        }
        this.modalClosed.emit(this.selectedSecuritiesForISIN);
    }

}
