import {AuxSelectOptionGroup} from '@blk/aladdin-angular-components';
import {MandateSettings} from '../models/mandate/mandate-settings.model';
import {Mandate} from '../models/mandate/mandate.model';
import {isNil} from 'lodash';
import {Favorite} from '@blk/explore-ui-core';

/**
 * MandateStore to contain data for mandate settings controller component (Admin screen)
 */
export class MandateStore {
    // holds all data to create mandate settings (row) in MandateSettingsComponent
    static mandateSettingsList: MandateSettings[] = new Array<MandateSettings>();

    // holds all mandate data to create mandate options (first column) in MandateSettingsComponent in aux-select-option format
    static auxMandateOptions: AuxSelectOptionGroup[] = [];

    // holds all data to create options ('BREAKDOWN', 'PERF_BKD', 'FAC_BKD', 'WIDGETS_REPORT', 'COLUMN_SET') in MandateSettingsComponent
    static mandateTypeFavorites: Map<string, Favorite[]> = new Map<string, Favorite[]>();

    /**
     * Given a mandate, return the mandate map row
     */
    static getMandateSettings(mandate: Mandate, assetType: string): MandateSettings {
        // We need to check if we can find a match on the mandates based on the mandate, then type then assetType.
        // NOTE: The order here is important as we want to make sure we match on the lowest level first.
        const itemsToCheck: string[] = [];
        if (!isNil(mandate)) {
            itemsToCheck.push(mandate.value);
            itemsToCheck.push(mandate.mandateType);
        }
        itemsToCheck.push(assetType);

        // Loop the items and find the match.
        for (const itemToCheck of itemsToCheck) {
            const mandateSettings = MandateStore.mandateSettingsList.find(item => item.mandate === itemToCheck);
            // If we got one get out of here.
            if (mandateSettings) {
                return mandateSettings;
            }
        }

        // If we got to here then there is no matching mandate.
        return undefined;
    }
}
