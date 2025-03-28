import {Component, EventEmitter, Input, Output} from '@angular/core';
import {UploadService} from '@services/upload/upload.service';
import {ErrorTypeConstants, UIErrorParameters, WayToAddSecurity} from '@blk/explore-ui-core';
import {ModellingType} from '@enums/modelling-type.enum';
import {NotificationService} from '@services/notification';
import {AuxUploaderChangedDetailInterface} from '@blk/aladdin-angular-components';
import {FileParsingLogicParams} from '@services/upload/file-parsing-logic-params.interface';

/**
 * Method to import/upload csv file data
 */
@Component({
    selector: 'app-quick-import',
    templateUrl: './quick-import.component.html',
    styleUrls: ['./quick-import.component.scss']
})
export class QuickImportComponent {

    @Input()
    importConfig: QuickImportConfig;

    @Input()
    modelingType?: ModellingType;

    @Input()
    uploadFileParsingLogic = {
        parsingLogic: this.uploadService.parseDataFromCsv.bind(this.uploadService),
        parsingRejectCallback: this.doWhenParseFailed.bind(this),
        optionalArgs: {
            uploadType: WayToAddSecurity.UPLOAD_CSV_FILE
        }
    };


    /** Emits the securities uploaded */
    @Output()
    dataUploaded = new EventEmitter<string[][]>();
    /** Emits flag to parent component signaling to hide upload view */
    @Output()
    hideUploadScreen = new EventEmitter();

    @Output()
    emitUploadType = new EventEmitter<WayToAddSecurity>();

    // flag for if paste area is focused in bulk upload
    pasteAreaFocused = false;

    constructor(private uploadService: UploadService, private notificationService: NotificationService) {
    }

    /**
     * Called when a user pastes in security cells.  Parses input and adds to select securities grid.
     */
    async onDataPasted(event: ClipboardEvent): Promise<void> {
        const clipboardData = event.clipboardData.getData('text');

        if (clipboardData) {
            // convert string blob into individual cells
            this.uploadService.parseDataFromCsv(clipboardData)
                .then(parsedData => this.doWhenParsed(parsedData, {uploadType: WayToAddSecurity.COPY_PASTE_SECURITIES}))
                .catch((reason: string) => this.doWhenParseFailed(reason));
        }
    }

    /**
     * Callback for when file(s) are uploaded.  Reads securities from files, validates, and adds to grid
     */
    async onFileUpload(event: CustomEvent<AuxUploaderChangedDetailInterface>): Promise<void> {
        if (!this.uploadFileParsingLogic?.parsingLogic) {
            return Promise.reject('Parsing logic is not defined while calling for file upload');
        }

        await this.uploadService.uploadFile(
            event.detail.newValue,
            {...this.uploadFileParsingLogic, parsingCallback: this.doWhenParsed.bind(this)} as FileParsingLogicParams
        );
    }

    /**
     * callback after raw string data parsed to individual cells
     */
    private doWhenParsed(parsedData: string[][], {uploadType}: any = {}) {
        if (uploadType in WayToAddSecurity) {
            this.emitUploadType.emit(uploadType);
        }
        this.dataUploaded.emit(parsedData);
    }

    /**
     * reject callback for when parsing fails
     */
    private doWhenParseFailed(reason: string): void {
        this.notificationService.error(reason, ErrorTypeConstants.BACK_END_ERROR, UIErrorParameters.TELEMETRY_FUNCTION_NAME_PARSE_DATA_FROM_CSV_ERROR);
    }
}

export interface QuickImportConfig {
    title: string;
    caption: string;
    tooltip?: string;
    dataFormat: string[][];
}
