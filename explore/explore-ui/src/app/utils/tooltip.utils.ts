import { AuxColumnSelectorConfig, AuxAdvancedTreeListInterface } from '@blk/aladdin-angular-components';
import { isEmpty } from 'lodash';

export class TooltipUtils {
    /**
     * Config that is called when a tooltip is required.
     */
    static getTooltipConfig(isExpanded: boolean): AuxColumnSelectorConfig {
        return {
            sourceList: { paddingLeft: 12, indentation: 12 },
            allowedTags: ['strong', 'br', 'div'],
            popoverOpenCloseDelay: 600,
            targetList: { paddingLeft: -8 },
            shouldExpandOnClick: isExpanded
        };
    }

    /**
     * Event handler that is called when a tooltip is required for enterprise description.
     */
    static getEnterpriseDescriptionTooltip(optionData: AuxAdvancedTreeListInterface): Promise<string> {
        if (isEmpty(optionData)) {
            return Promise.resolve('');
        }
        
        return new Promise<string>((resolve) => {
            let tooltip = '';
            if (optionData?.isLearnLink && optionData.eventData?.enterpriseDescription?.length > 0) {
                tooltip = (`<div style="width: 300px; white-space: pre-line"><div style="font-weight: bold">${optionData.label}</div>\n${optionData.eventData.enterpriseDescription}</div>`);
            }
            resolve(tooltip);
        });
    }
}