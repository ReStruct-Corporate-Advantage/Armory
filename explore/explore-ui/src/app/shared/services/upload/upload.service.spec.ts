import {TestBed} from '@angular/core/testing';
import {UploadService} from './upload.service';

describe('UploadService', () => {
    let uploadService: UploadService;

    beforeAll(() => {
        TestBed.configureTestingModule({
            providers: []
        });
        uploadService = TestBed.inject(UploadService);
    });

    describe('parseDataFromCsv tests', () => {
        it('should handle percent signs in cells', async () => {
            const rawString = '037833100\t40%\n' + '594918104\t30%';
            const expectedData = [['037833100', '40'], ['594918104', '30']];

            const parsedData = await uploadService.parseDataFromCsv(rawString);
            expect(parsedData).toStrictEqual(expectedData);
        });

        it('should handle different types of separators', async () => {
            let rawString = '037833100, \t40\r\n' + '594918104  \t  30';
            let expectedData = [['037833100', '40'], ['594918104', '30']];
            let parsedData = await uploadService.parseDataFromCsv(rawString);
            expect(parsedData).toStrictEqual(expectedData);

            rawString = '037833100\t40\r\n' + '594918104\t30';
            parsedData = await uploadService.parseDataFromCsv(rawString);
            expect(parsedData).toStrictEqual(expectedData);

            rawString = '037833100 40\r\n' + '594918104 30';
            parsedData = await uploadService.parseDataFromCsv(rawString);
            expect(parsedData).toStrictEqual(expectedData);

            rawString = '\r\n';
            try {
                await uploadService.parseDataFromCsv(rawString);
            } catch (e) {
                expect(e).toEqual('Unable to load data');
            }

            rawString = '037833100, 40,123\n' + '594918104,  30,123';
            expectedData = [['037833100', '40123'], ['594918104', '30123']];
            parsedData = await uploadService.parseDataFromCsv(rawString);
            expect(parsedData).toStrictEqual(expectedData);

            rawString = '037833100, 40,123, PORT-A\n' + '594918104,  30,123, PORT-B';
            expectedData = [['037833100', '40123', 'PORT-A'], ['594918104', '30123', 'PORT-B']];
            parsedData = await uploadService.parseDataFromCsv(rawString);
            expect(parsedData).toStrictEqual(expectedData);

            rawString = '037833100, 40,123, PORT-A\n' + '594918104,  30,123, X-83-RO-AG';
            expectedData = [['037833100', '40123', 'PORT-A'], ['594918104', '30123', 'X-83-RO-AG']];
            parsedData = await uploadService.parseDataFromCsv(rawString);
            expect(parsedData).toStrictEqual(expectedData);
        });

        it('should parse portfolios and what-if portfolios when uploaded as a list', async () => {
            const rawString = 'What-if SNP100 1\tTHROUGH_TIME\tktalwar\t40\r\nPOS BASED ILB3\tPOINT_IN_TIME\tktalwar\t60\r\npep\t67\r\ncore-hq\t98';
            const expectedData = [['What-if SNP100 1', '40', 'ktalwar', 'THROUGH_TIME'], ['POS BASED ILB3', '60', 'ktalwar', 'POINT_IN_TIME'], ['pep', '67'], ['core-hq', '98']];

            const parsedData = await uploadService.parseDataFromCsv(rawString);
            expect(parsedData).toStrictEqual(expectedData);
        });

        it('should parse portfolios and what-if portfolios when uploaded as a list- comma separated', async () => {
            const rawString = 'What-if SNP100 1,THROUGH_TIME,ktalwar,40\r\nPOS BASED ILB3,POINT_IN_TIME,ktalwar,60\r\npep,67\r\ncore-hq,98';
            const expectedData = [['What-if SNP100 1', '40', 'ktalwar', 'THROUGH_TIME'], ['POS BASED ILB3', '60', 'ktalwar', 'POINT_IN_TIME'], ['pep', '67'], ['core-hq', '98']];

            const parsedData = await uploadService.parseDataFromCsv(rawString);
            expect(parsedData).toStrictEqual(expectedData);
        });

        it('should parse portfolios and what-if portfolios when uploaded as a list- comma separated 2', async () => {
            const rawString = 'What-if SNP100 1,THROUGH_TIME,ktalwar,40,000\r\nPOS BASED ILB3,POINT_IN_TIME,ktalwar,60,000\r\npep,67,000\r\ncore-hq,98,000';
            const expectedData = [['What-if SNP100 1', '40,000', 'ktalwar', 'THROUGH_TIME'], ['POS BASED ILB3', '60,000', 'ktalwar', 'POINT_IN_TIME'], ['pep', '67000'], ['core-hq', '98000']];

            const parsedData = await uploadService.parseDataFromCsv(rawString);
            expect(parsedData).toStrictEqual(expectedData);
        });

        it('should parse portfolios and what-if portfolios when uploaded as a list- comma separated 3', async () => {
            const rawString = 'What-if SNP100 1,THROUGH_TIME,ktalwar,40,000%\r\nPOS BASED ILB3,POINT_IN_TIME,ktalwar,60,000\r\npep,67,000\r\ncore-hq,98,000';
            const expectedData = [['What-if SNP100 1', '40,000', 'ktalwar', 'THROUGH_TIME'], ['POS BASED ILB3', '60,000', 'ktalwar', 'POINT_IN_TIME'], ['pep', '67000'], ['core-hq', '98000']];

            const parsedData = await uploadService.parseDataFromCsv(rawString);
            expect(parsedData).toStrictEqual(expectedData);
        });
    });

    it('parses file on load', async () => {
        const parsingParams = {
            parsingLogic: jest.fn(),
            parsingCallback: jest.fn(),
            parsingRejectCallback: jest.fn()
        };

        const parseLogicSpy = jest.spyOn(parsingParams, 'parsingLogic');

        parseLogicSpy.mockReturnValueOnce(Promise.resolve([['037833100', '40'], ['594918104', '30']]));
        await uploadService['parseFileOnLoad']('037833100,40%\n' + '594918104,30%\n', parsingParams);
        expect(parsingParams.parsingCallback).toHaveBeenCalledWith([['037833100', '40'], ['594918104', '30']], undefined);

        parseLogicSpy.mockReturnValueOnce(Promise.reject('Got an error'));
        await uploadService['parseFileOnLoad']('037833100,40%\n' + '594918104,30%\n', parsingParams);
        expect(parsingParams.parsingRejectCallback).toHaveBeenCalledWith('Got an error');
    });
});
