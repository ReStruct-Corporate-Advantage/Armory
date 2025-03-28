import * as google_type_date_pb from '@blk/aladdin-graph-everything/google/type/date_pb';
import * as baseToArraybuffer from 'base64-arraybuffer';
import {inflate} from 'pako';
import {v4 as uuid} from 'uuid';
import {CommonUtilsConstants} from '../constants/common-utils.constants';
import {AuxTreeListDataInterface, AuxAdvancedTreeListInterface} from '@blk/aladdin-angular-components';
import {sortBy} from 'lodash';

export class CommonUtils {

    /**
     * Get in sentence case
     * eg> COLUMN_SET => Column set
     */
    static getInSentenceCase(stringValue: string): string {
        return (stringValue.charAt(0).toUpperCase() + stringValue.substring(1).toLowerCase()).replace(/_/g, ' ');
    }

    /**
     * Generate unique Id
     */
    static generateUniqueIdAsString(keyLength: number = 15): string {
        // Generate a uuid.
        // Remove the - and then take the first 15 (or idLength) chars of what is left.
        return uuid().split('-').join('').substring(0, keyLength);
    }

    /**
     * Returns a time stamp (time elapsed in app) in microseconds
     */
    static generateUniqueIdAsNumber(): number {
        return parseInt((window.performance.now() * 1000).toString(), null) + Math.floor(Math.pow(10, 6) * Math.random());
    }

    /**
     * Utility method to convert a string to sentence case
     */
    static toSentenceCase(value: string): string {
        // Matches the first upper case character [A-Z] of all words that follow one or more whitespace characters
        const sentenceCaseMatcher = /\s+([A-Z]{1})(?![A-Z])/g;
        // Replaces those upper case characters to lower case
        return value.replace(sentenceCaseMatcher, (word) => word.toLowerCase());
    }

    /**
     * Get URL Param
     */
    static getURLParam(name: string): string {
        const regexArr = (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(CommonUtils.getLocation().search) || [''])[1];
        return regexArr ? decodeURIComponent(regexArr).replace(/\+/g, '%20') : null;
    }

    /**
     * Gets the location object of the browser. This is really only here so we can mock the location in test cases.
     */
    static getLocation(): Location {
        return location;
    }

    /**
     * Creates google protobuf date object
     * @param dateAsString should be in mm/dd/yyyy format
     */
    static createReportingDate(dateAsString: string): google_type_date_pb.Date {
        const [month, day, year] = dateAsString.split('/');
        const reportingDate = new google_type_date_pb.Date();
        reportingDate.setMonth(Number(month));
        reportingDate.setDay(Number(day));
        reportingDate.setYear(Number(year));
        return reportingDate;
    }

    /*
      Create the map of params passed in URl  eg. -> {['loadCuratedReports','false'] , ['fallBackToGPX','true']}
     */
    static getAllURLParams(): Map<string, string> {
        const urlParamsMap: Map<string, string> = new Map<string, string>();
        const urlParams = new URLSearchParams(CommonUtils.getLocation().search?.slice(1));
        urlParams.forEach((val, key) => urlParamsMap.set(key, val));
        return urlParamsMap;
    }

    /**
     * Get date in MM/DD/YYYY format and convert to DD-MM-YYYY format
     */
    static getDateInLTFormat(dateAsString: string): string {
        const [month, day, year] = dateAsString.split('/');
        return  day + '-' + month + '-' + year;
    }

    /**
     * Decompresses the response.
     */
    static decompressResponse(compressedResponse: string, jsonParse = true): any {
        // Decodes the base64 encoded string that we get from server  to byte array
        const decodedByteArray: ArrayBuffer = baseToArraybuffer.decode(compressedResponse);
        // Convert the signed byte array to unsigned byte array
        const decodedUint8Array: Uint8Array = new Uint8Array(decodedByteArray);
        // Decompress using pako.inflate using deflating algorithm (specified by level 8)
        const decompressedResponseInFormOfByteArray = inflate(decodedUint8Array, {level: 8});
        // Convert the resultant byte array to string using TextDecoder. Note- normal String runs out of memory, so have to use Textdecoder
        const decomporessedResponseString = new TextDecoder().decode(decompressedResponseInFormOfByteArray);
        // Parse the string to JSON using JSON.parse
        return jsonParse ? JSON.parse(decomporessedResponseString) : decomporessedResponseString;
    }



    /**
     * Return true if URL is for localhost.
     */
    static isLocalHost(): boolean {
        return CommonUtils.getLocation().origin.includes(CommonUtilsConstants.LOCALHOST);
    }

    /**
     * Check the instance of front end we are running i.e. explore-beta or prism
     */
    static isExploreBeta(): boolean {
        if (CommonUtils.getLocation().pathname.toString().indexOf(CommonUtilsConstants.LOCALHOST) >= 0) {
            return false;
        }
        return CommonUtils.getLocation().pathname.toString().indexOf(CommonUtilsConstants.EXPLORE_BETA) >= 0;
    }

    /**
     * Check the instance of front end we are running i.e. explore-gamma
     */
    static isExploreGamma(): boolean {
        if (CommonUtils.getLocation().pathname.toString().indexOf(CommonUtilsConstants.LOCALHOST) >= 0) {
            return false;
        }
        return CommonUtils.getLocation().pathname.toString().indexOf(CommonUtilsConstants.EXPLORE_GAMMA) >= 0;
    }

    /**
     * Returns a callback method to launch application for given URL.
     */
    static launchApplicationCallBack = (url: string, newTab = true): () => {} => {
        return () => window.open(url, newTab ? '_blank' : '_self');
    }

    /**
     * Get Mode Sensitive Application URL for given path and query
     */
    static getModeSensitiveApplicationUrl(primePath: string, betaPath: string, query?: string): string {
        const isPrimeVersion = !CommonUtils.isExploreBeta() && !CommonUtils.isExploreGamma();
        return CommonUtils.getApplicationUrl(isPrimeVersion ? primePath : betaPath, query);
    }

    /**
     * Get Application URL for given path and query
     */
    static getApplicationUrl(path: string, query?: string): string {
        const url = CommonUtils.getURLOrigin() + path;
        return query ? url + query : url;
    }

    /**
     * Get URL Origin i.e. https://<client>.blackrock.com
     */
    static getURLOrigin(): string {
        return CommonUtils.isLocalHost() ? CommonUtilsConstants.DEV_URL : CommonUtils.getLocation().origin;
    }

    static populateUidOnTreeList(i: number, rawInfo: AuxTreeListDataInterface[], auxTreeData: AuxAdvancedTreeListInterface[], sourceDataCategoriesToUidMap?: Map<string, string>) {
        auxTreeData[i] = {label: ''};
        if (sourceDataCategoriesToUidMap && sourceDataCategoriesToUidMap.has(rawInfo[i].header)) {
            auxTreeData[i].uid = sourceDataCategoriesToUidMap.get(rawInfo[i].header);
        } else {
            auxTreeData[i].uid = CommonUtils.generateUniqueIdAsString();
        }
    }

    /**
     * created advanced tree list data from raw data
     */
    static initializeDataForAdvTreeList(rawInfo: AuxTreeListDataInterface[], auxTreeData: AuxAdvancedTreeListInterface[], sourceDataCategoriesToUidMap?: Map<string, string>) {
        for (let i = 0; i < rawInfo.length; i++) {
            this.populateUidOnTreeList(i, rawInfo, auxTreeData, sourceDataCategoriesToUidMap);
            this.createDataForAdvTreeList(auxTreeData[i], rawInfo[i]);
        }
    }

    /**
     * transforms raw object to advanced tree list data
     */
    static createDataForAdvTreeList(auxTreeData: AuxAdvancedTreeListInterface, rawInfo: AuxTreeListDataInterface) {
        auxTreeData.label = rawInfo.header;
        auxTreeData.eventData = rawInfo.eventData;
        if (rawInfo.children) {
            if (!auxTreeData.children) {
                auxTreeData.children = [];
            }
            for (let i = 0; i < rawInfo.children.length; i++) {
                const treeChildren: AuxAdvancedTreeListInterface = {label: ''};
                auxTreeData.children.push(treeChildren);
                this.createDataForAdvTreeList(auxTreeData.children[i], rawInfo.children[i]);
            }
        }
    }

    /**
     * This method compares the previous and current stringified rule values
     */
    public static compareTheValues(comparisonValues: any, value: any[]): boolean {
        return JSON.stringify(sortBy(comparisonValues, CommonUtils.getIteratees)) === JSON.stringify(sortBy(value, CommonUtils.getIteratees));
    }

    private static getIteratees(num: string | number): string | number {
        return num;
    }
}
