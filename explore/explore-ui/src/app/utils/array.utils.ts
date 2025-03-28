import {isEmpty, isNil} from 'lodash';

export class ArrayUtils {

    /**
     * Method to move item in array to particular index
     */
    static moveItemInArray(index: number, item: any, array: any[]) {
        const currentIndex: number = array.indexOf(item);

        // if item is not present in the array, skip it.
        if (currentIndex === -1) {
            return;
        }
        array.splice(currentIndex, 1);
        array.splice(index, 0, item);
    }

    /**
     * method to split array into smaller chunks
     */
    static splitArrayIntoChunks(array: any[], chunkSize: number): any[][] {
        if (isNil(array) || isEmpty(array)) {
            return array;
        }
        const arrayChunks: any[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            arrayChunks.push(array.slice(i, i + chunkSize));
        }
        return arrayChunks;
    }
}
