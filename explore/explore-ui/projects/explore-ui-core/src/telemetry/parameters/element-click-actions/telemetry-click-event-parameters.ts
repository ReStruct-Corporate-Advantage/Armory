/**
 * ClickEventParameters captures information related to explore click events we like to push to SnowFlake
 */
import {ExploreClickableElementType} from '../../enums';

export class ClickEventParameters {
    // UI element type e.g. BUTTON, MENU_ITEM, RADIO, CHECKBOX etc
    elementType: ExploreClickableElementType;
    // UI element label
    elementLabel: string;
    // UI element source
    elementSource: string;
    // UI element source context
    contextPath: string;
    // UI element's associated parent component
    parentElementSource: string;
    // Additional internal details
    addlDetails: Map<string, string>;

    constructor(elementType: ExploreClickableElementType, elementLabel: string, elementSource: string, contextPath: string, parentElementSource?: string, addlDetails?: Map<string, string>) {
        this.elementType = elementType;
        this.elementLabel = elementLabel;
        this.elementSource = elementSource;
        this.contextPath = contextPath;
        this.parentElementSource = parentElementSource;
        this.addlDetails = addlDetails;
    }
}
