/**
 * Interface for the parsing logic of the uploaded file
 * Can be used in general for any file upload parsing logic
 */
export interface FileParsingLogicParams {
    parsingLogic: (raw: string, optionalArgs?: any) => Promise<any>;
    parsingCallback: (parsedData: any, optionalArgs?: any) => void;
    parsingRejectCallback?: (reason: string) => void;
    optionalArgs?: any;
}
