import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'sentenceCase'
})
/**
 * Custom Pipe to convert any Title case string into Sentence case.
 * This will be useful where we are getting the data from server and we just want to display in sentence case on UI only
 * e.g. Risk And Exposure => Risk and exposure and Book Type => Book type etc.
 */

export class SentenceCasePipe implements PipeTransform {

    /**
     * method to transform the string
     * @param value string that need to be transformed
     */
    transform(value: string): string {
        return value ? value.slice(0, 1).toUpperCase() + value.toLowerCase().slice(1) : value;
    }

}
