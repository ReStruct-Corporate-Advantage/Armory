import {CoreColumnConstants} from '../core/constants';

export class CoreColumnDefUtils {

    /**
     * When sorting the columns we need to strip the port/bench/active from them
     * @param title - title to be stripped
     * @returns stripped title
     */
    static getStrippedName(title: string): string {
        if (title.startsWith(CoreColumnConstants.COLUMN_PREFIX.PORTFOLIO)) {
            title = title.substring(CoreColumnConstants.COLUMN_PREFIX.PORTFOLIO.length, title.length);
        } else if (title.startsWith(CoreColumnConstants.COLUMN_PREFIX.BENCHMARK)) {
            title = title.substring(CoreColumnConstants.COLUMN_PREFIX.BENCHMARK.length, title.length);
        } else if (title.startsWith(CoreColumnConstants.COLUMN_PREFIX.ACTIVE)) {
            title = title.substring(CoreColumnConstants.COLUMN_PREFIX.ACTIVE.length, title.length);
        }
        return title;
    }

}
