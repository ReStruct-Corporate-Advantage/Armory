import {ExplorePortfolioTypeEnum} from '../enums';
import {Duration} from 'google-protobuf/google/protobuf/duration_pb';

/**
 * Utility class for telemetry
 */
export class TelemetryUtil {

    /**
     * Return a blank if the favorite id passed in is not supported
     * @param favId
     */
    public static getAdjustedFavoriteId(favId: number|string): string {
        return favId ? favId.toString() : undefined;
    }

    /**
     * get Telemetric Type of what if portfolio.
     */
    public static getTelemetricType(type: number): ExplorePortfolioTypeEnum {
        switch (type) {
            case 0:
                return ExplorePortfolioTypeEnum.THROUGH_TIME_ANALYSIS_SECTOR;
            case 1:
                return ExplorePortfolioTypeEnum.POINT_IN_TIME_ANALYSIS;
            case 2:
                return ExplorePortfolioTypeEnum.THROUGH_TIME_ANALYSIS_PORTFOLIO;
        }
    }

    /**
     * Extract column count as number from Display text
     */
    public static getColumnCountAsNumeric(displayColumnCount: string): number {
        const colCountNumeric = parseInt(displayColumnCount.replace(/\D/g, ''), 10);
        return isNaN(colCountNumeric) ? -1 : colCountNumeric;
    }

    /**
     * Get protobuf Duration object from Milli-second time
     */
    public static getDuration(millis: number): Duration {
        let seconds = 0;
        if (millis >= 1000) {
            seconds = Math.floor(millis / 1000);
            millis = millis % 1000;
        }

        const duration = new Duration();
        duration.setSeconds(seconds);
        duration.setNanos(millis * 1000);

        return duration;
    }
}
