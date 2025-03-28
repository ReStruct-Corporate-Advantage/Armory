import {Injectable} from '@angular/core';
import {SaveSummariesDisplayInfo} from './save-summaries-display-info.interface';

/**
 * Utility to validate save summaries state efficiently.
 *
 *  This utility ensures that the save button remains disabled until all input boxes are filled.
 *  Instead of rechecking all nested change summaries every time an input boxes are updated,
 *  it uses a counter to track empty fields.
 */
@Injectable()
export class SaveSummariesStateValidationHandler {
    private emptySummariesCount = 0;

    /**
     * Initialize change details validation.
     */
    public initializeChangeDetailsValidation(displayInfo: SaveSummariesDisplayInfo): void {
        this.emptySummariesCount = this.countEmptySummaries(displayInfo);
    }

    /**
     * Recursively count empty changeSummary fields.
     */
    private countEmptySummaries(displayInfo: SaveSummariesDisplayInfo): number {
        let count = this.isChangeSummaryEmpty(displayInfo) ? 1 : 0;

        for (const nestedChange of displayInfo.nestedChanges) {
            count += this.countEmptySummaries(nestedChange);
        }

        return count;
    }

    /**
     * Updates the savable state by checking if all fields are valid.
     *  The state is considered savable when the counter reaches 0.
     *  This method is triggered on every input box value change.
     */
    public isSavable(displayInfo: SaveSummariesDisplayInfo, newValue: string): boolean {
        const wasEmpty = this.isChangeSummaryEmpty(displayInfo);
        const isEmpty = !newValue || newValue.trim() === '';

        if (wasEmpty && !isEmpty) {
            // ChangeSummary became non-empty
            this.emptySummariesCount--;
        } else if (!wasEmpty && isEmpty) {
            // ChangeSummary became empty
            this.emptySummariesCount++;
        }

        return this.emptySummariesCount === 0;
    }

    /**
     * Check if change summary is empty.
     */
    private isChangeSummaryEmpty(displayInfo: SaveSummariesDisplayInfo): boolean {
        return displayInfo.shouldShowSaveSummary && (!displayInfo.changeSummary || displayInfo.changeSummary.trim() === '');
    }
}
