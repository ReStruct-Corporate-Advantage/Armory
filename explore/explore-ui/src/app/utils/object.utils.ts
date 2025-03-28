/**
 *  This should strictly be a standalone service and should not have any dependency on
 *  any of the other app services or components
 */
export class ObjectUtils {

    /**
     * This function accepts two objects and returns back a merged object with the Spread Operator
     * In the case of a key collision, the right-most (last) object's value wins out
     * This method has been updated as part of ES6 upgrade
     * @param obj1
     * @param obj2
     * @returns {{}}
     */
    public static mergeObjectKeys(obj1: any, obj2: any): any {
        return {...obj1, ...obj2};
    }

    /**
     * Flatten array of objects into a single object.
     * Shallow flattening, repeated keys will get clobbered.
     * @param array
     * @returns {}
     */
    public static flattenToObject(array: any[]): any {
        return array.reduce((acc, cur) => ({...acc, ...cur}), {});
    }
}
