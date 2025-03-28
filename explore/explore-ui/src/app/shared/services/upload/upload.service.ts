import {Injectable} from '@angular/core';
import {parse, ParseConfig} from 'papaparse';
import {NumberUtils} from '@utils/number.utils';
import {CompositionConstants} from '@constants/composition.constants';
import {FileParsingLogicParams} from '@services/upload/file-parsing-logic-params.interface';

@Injectable({
    providedIn: 'root'
})
export class UploadService {

    private static REGEX_TO_TRIM_DELIMITERS = /^[\ ,\t,\,]+|[\ ,\t,\,]+$/g;

    private static readonly whatIfTypes = [...CompositionConstants.WHAT_IF_TYPES_ALIAS_MAP.keys()];

    /**
     * Uploads a file and processes the data
     */
    async uploadFile(files: File[], parsingParams: FileParsingLogicParams): Promise<void> {
        // iterate through each file
        files?.forEach((file: File) => {
            const fileReader = new FileReader();
            fileReader.readAsText(file);
            // once file is uploaded, process the data
            fileReader.onload = () => this.parseFileOnLoad(fileReader.result, parsingParams);
        });
    }

    /**
     * provides structure to execute actual parsing logic
     */
    private async parseFileOnLoad(fileContent: string | ArrayBuffer | null, parsingParams: FileParsingLogicParams): Promise<void> {
        // regex strips equals (=) and quotes (") chars possibly inserted by holdings export for improved viewing of csv in Excel
        const rawString = String(fileContent).replace(/[="]/g, '');
        parsingParams.parsingLogic(rawString, parsingParams.optionalArgs)
            .then(parsedData => parsingParams.parsingCallback(parsedData, parsingParams.optionalArgs))
            .catch((reason: string) => parsingParams.parsingRejectCallback?.(reason));
    }

    /**
     * Given CSV data, read the data
     * @param textData
     */
    parseDataFromCsv(textData: string): Promise<string[][]> {
        // Handles % characters in the text
        textData = textData.replace(/% ?/g, '');
        const parseConfig: ParseConfig<string[]> = {skipEmptyLines: true};
        let parsedOutput = parse(textData, parseConfig);
        const knownDelimiters = [',', '\t', ' '];
        knownDelimiters.forEach((knownDelimiter: string) => {
            if (parsedOutput.errors.length > 0) {
                parseConfig.delimiter = knownDelimiter;
                parsedOutput = parse(textData, parseConfig);
            } else {
                return false;
            }
        });
        let parsedData = parsedOutput.data;
        if (parsedData.length <= 0) {
            return Promise.reject('Unable to load data');
        }
        const firstRow = parsedData[0];
        // fallback if PapaParse is still not able to find the delimiter (happens for Excel files)
        if (firstRow.length < 2) {
            // try a space delimited solution
            parsedData = parsedData.map((element: string[]) => {
                return element[0].split(/\s+/);
            });
        }
        if (parsedData.length <= 0) {
            return Promise.reject('No data was provided');
        }
        // This is done if multiple delimiters are given for separating data than trim the remaining delimiters
        parsedData = parsedData.map((rowData: string[]) => {
            return rowData.map((cell: string) => {
                return cell.replace(UploadService.REGEX_TO_TRIM_DELIMITERS, '');
            });
        });
        return Promise.resolve(this.getFinalParsedData(parsedData));
    }

    /**
     * If the value part contained delimeters we must join them back. For example - uploading a csv file which contains 00206R102, 7,141,000
     * @param parsedData
     * @private
     */
    private getFinalParsedData(parsedData: string[][]): string[][] {
        return parsedData.filter(Boolean).map(rowData => rowData.filter(Boolean)).map((rowData: string[]) => {
            // if there are more than 2 elements in rowdata it means the value contained delimeters
            let lastElementIndex = rowData.length;
            let isPortfolioSpecifiedInRowData = false;
            let whatIfTypeIndex;
            if (rowData.some((cell, i) => {
                whatIfTypeIndex = i;
                return UploadService.whatIfTypes.includes(cell);
            })) {
                return [rowData.slice(0, whatIfTypeIndex).join(), rowData.slice(whatIfTypeIndex + 2, rowData.length).join(), rowData[whatIfTypeIndex + 1], rowData[whatIfTypeIndex]];
            } else if (rowData.length >= 2) {
                // if the last element is not numeric then it means the rowData contains portfolio name as last element e.g. "037833100, 40,123, PORT-A"
                if (rowData.length > 2 && !NumberUtils.validateIfStringIsNumber(rowData[rowData.length - 1])) {
                    lastElementIndex = rowData.length - 1;
                    isPortfolioSpecifiedInRowData = true;
                }
                for (let index = 2; index < lastElementIndex; index++) {
                    rowData[1] += rowData[index];
                }
            }
            // if portfolio is specified in input the return [cusip, weight, portname] else [cusip, weight]
            return isPortfolioSpecifiedInRowData ? [rowData[0], rowData[1], rowData[rowData.length - 1]] : [rowData[0], rowData[1]];
        });
    }
}
