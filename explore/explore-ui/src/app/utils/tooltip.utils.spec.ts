import { TooltipUtils } from './tooltip.utils';
import {AuxAdvancedTreeListInterface, AuxColumnSelectorConfig} from '@blk/aladdin-angular-components';

describe('TooltipUtils', () => {
    describe('getTooltipConfig', () => {
        it('should return the correct configuration when isExpanded is true', () => {
            const config: AuxColumnSelectorConfig = TooltipUtils.getTooltipConfig(true);

            expect(config).toEqual({
                sourceList: { paddingLeft: 12, indentation: 12 },
                allowedTags: ['strong', 'br', 'div'],
                popoverOpenCloseDelay: 600,
                targetList: { paddingLeft: -8 },
                shouldExpandOnClick: true
            });
        });

        it('should return the correct configuration when isExpanded is false', () => {
            const config: AuxColumnSelectorConfig = TooltipUtils.getTooltipConfig(false);

            expect(config).toEqual({
                sourceList: { paddingLeft: 12, indentation: 12 },
                allowedTags: ['strong', 'br', 'div'],
                popoverOpenCloseDelay: 600,
                targetList: { paddingLeft: -8 },
                shouldExpandOnClick: false
            });
        });
    });

    describe('getEnterpriseDescriptionTooltip', () => {
        it('should return an empty string if optionData is empty', async () => {
            const result = await TooltipUtils.getEnterpriseDescriptionTooltip({} as AuxAdvancedTreeListInterface);
            expect(result).toBe('');
        });

        it('should return the correct tooltip if optionData has isLearnLink set to true and enterpriseDescription is defined', async () => {
            const optionData: AuxAdvancedTreeListInterface = {
                label: 'Test Label',
                isLearnLink: true,
                eventData: {
                    enterpriseDescription: 'Test Description'
                }
            } as any;

            const result = await TooltipUtils.getEnterpriseDescriptionTooltip(optionData);
            expect(result).toBe('<div style="width: 300px; white-space: pre-line"><div style="font-weight: bold">Test Label</div>\nTest Description</div>');
        });

        it('should return the correct tooltip if optionData has isLearnLink set to true and enterpriseDescription is undefined', async () => {
            const optionData: AuxAdvancedTreeListInterface = {
                label: 'Test Label',
                isLearnLink: true,
                eventData: {}
            } as any;

            const result = await TooltipUtils.getEnterpriseDescriptionTooltip(optionData);
            expect(result).toBe('');
        });

        it('should return an empty string if optionData does not have isLearnLink', async () => {
            const optionData: AuxAdvancedTreeListInterface = {
                label: 'Test Label',
                eventData: {
                    enterpriseDescription: 'Test Description'
                }
            } as any;

            const result = await TooltipUtils.getEnterpriseDescriptionTooltip(optionData);
            expect(result).toBe('');
        });
    });
});
