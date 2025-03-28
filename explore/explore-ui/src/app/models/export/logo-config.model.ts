import {isObject} from 'lodash';
import {PDFLogoPosition} from '@enums/export/pdf-logo-position.enum';

/**
 * Class that represents PDF Logo configurations and details
 */
export class LogoConfig {
    logoPresent = false;
    logoPosition: PDFLogoPosition = PDFLogoPosition.TOP_RIGHT;
    logoImageFile: string;
    showLogoPreview: boolean;
    logoWidth: number;
    logoHeight: number;

    constructor(data?: any) {
        if (isObject(data)) {
            this.deserialize(data);
        }
    }

    /**
     * Serialize the config to json
     */
    serialize(): any {
        // Return undefined if this LogoConfig has the default settings
        // Then, the JSON favorite won't serialize any value for logoConfig for undefined
        if (!this.logoPresent && this.logoPosition === PDFLogoPosition.TOP_RIGHT && !this.logoImageFile) {
            return undefined;
        }

        const data: any = {
            logoPresent: this.logoPresent,
            logoPosition: this.logoPosition,
            logoImageFile: this.logoImageFile,
            showLogoPreview: this.showLogoPreview,
            logoWidth: this.logoWidth,
            logoHeight: this.logoHeight
        };
        return data;
    }

    /**
     * Deserialize the json data into this object
     */
    deserialize(data: any): void {
        if (data) {
            // Set the values if present, else set to default ones
            this.logoPresent = !!(data.logoPresent);
            this.logoPosition = data.logoPosition;
            this.logoImageFile = data.logoImageFile;
            this.showLogoPreview = data.showLogoPreview;
            this.logoWidth = data.logoWidth;
            this.logoHeight = data.logoHeight;
        }
    }

    /**
     * Returns true if the logo has a valid width and height (also implying the logo image has been loaded)
     */
    hasValidWidthAndHeight(): boolean {
        return !!this.logoWidth && !!this.logoHeight;
    }
}

/**
 * Class to hold logo dimensions for exporting purposes
 */
export class LogoInfo {
    public width: number;
    public height: number;

    constructor(w: number, h: number) {
        this.width = w;
        this.height = h;
    }
}
