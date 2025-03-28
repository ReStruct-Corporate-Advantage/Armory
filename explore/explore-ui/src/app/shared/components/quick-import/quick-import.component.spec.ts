import {ComponentFixture, TestBed} from '@angular/core/testing';

import {QuickImportComponent} from './quick-import.component';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {UploadService} from '@services/upload/upload.service';
import {NotificationService} from '../../services';

describe('QuickImportComponent', () => {
    let component: QuickImportComponent;
    let fixture: ComponentFixture<QuickImportComponent>;

    const notificationServiceeStub = {
        error: jest.fn()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [QuickImportComponent],
            providers: [
                UploadService,
                {provide: NotificationService, useValue: notificationServiceeStub}
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        });

        fixture = TestBed.createComponent(QuickImportComponent);
        component = fixture.componentInstance;
        component.importConfig = {
            caption: 'Import securities by pasting from a spreadsheet or uploading a CSV file',
            title: 'Bulk Securities Upload',
            dataFormat: [['Cusip 1', '25%'], ['Cusip 2', '15%'], ['Cusip 3', '10%']]
        };
        fixture.detectChanges();
    });

    it('Test onDataPasted', async () => {
        // Do nothing when clipboard is empty
        const pasteEventMock = {
            clipboardData: {
                getData: jest.fn()
            }
        };
        const uploadServiceParseCsvSpy = jest.spyOn(component['uploadService'], 'parseDataFromCsv');
        await component.onDataPasted(pasteEventMock as unknown as ClipboardEvent);
        expect(uploadServiceParseCsvSpy).not.toHaveBeenCalled();
        // ClipboardEvent cannot be instantiated independently so use mock instead
        pasteEventMock.clipboardData.getData.mockReturnValue('037833100\t40\r\n' + '594918104\t30');
        jest.spyOn(component.dataUploaded, 'emit');
        await component.onDataPasted(pasteEventMock as unknown as ClipboardEvent);
        expect(component.dataUploaded.emit).toHaveBeenCalledWith([['037833100', '40'], ['594918104', '30']]);
    });

    it('Test onFileUpload', async () => {
        const data = '037833100,40%,AAPL\n' + '594918104,30%,MSFT\n';
        const file = new File([data], 'securities-data.csv', {type: 'text/csv'});
        jest.spyOn(component.dataUploaded, 'emit');
        // uploadServiceStub.parseDataFromCsv.mockReturnValue(Promise.resolve([['037833100', '40', 'AAPL'], ['594918104', '30', 'MSFT']]));
        const fileReaderSpy = jest.spyOn(FileReader.prototype, 'readAsText');
        await component.onFileUpload({detail: {newValue: [file]}} as any as CustomEvent);
        expect(fileReaderSpy).toHaveBeenCalled();
    });
    it('should reject the promise when parsing logic is not defined', async () => {
        const file = new File(['data'], 'securities-data.csv', {type: 'text/csv'});
        component.uploadFileParsingLogic = null;

        await expect(component.onFileUpload({detail: {newValue: [file]}} as any as CustomEvent))
            .rejects
            .toEqual('Parsing logic is not defined while calling for file upload');
    });
});
