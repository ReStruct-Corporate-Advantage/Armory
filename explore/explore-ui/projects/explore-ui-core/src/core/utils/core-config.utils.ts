import {RequestParamsCreator, RequestParamsWithFavCreator, SupportAlternateConfigType} from '../interfaces';

export class CoreConfigUtils {
    static doesSupportAlternateConfigType(obj: any): obj is SupportAlternateConfigType {
        return obj && 'getAltConfigType' in obj;
    }

    /**
     * Utility method to check if the object is an instance of this.
     */
    static isRequestParamsCreator(object: any): object is RequestParamsCreator {
        return 'addRequestParams' in object;
    }

    /**
     * Utility method to check if the object is an instance of this.
     */
     static isRequestParamsWithFavCreator(object: any): object is RequestParamsWithFavCreator {
        return 'addRequestParamsWithFavId' in object;
    }

     /**
     * Utility method to check if the object is an instance of this.
     */
      static isRetainFavIdParamCreator(object: any): object is RequestParamsCreator {
        return 'addRequestParams' in object;
    }
}
