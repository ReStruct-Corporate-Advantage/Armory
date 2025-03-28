import {TelemetryUtil} from './telemetry.util';
import {Duration} from 'google-protobuf/google/protobuf/duration_pb';

describe('TelemetryUtil', () => {

    describe('getColumnCountAsNumeric Test', () => {
        it('getColumnCountAsNumeric with proper count format', () => {
            expect(TelemetryUtil.getColumnCountAsNumeric(' (10)')).toEqual(10);
        });

        it('getColumnCountAsNumeric with invalid count format', () => {
            expect(TelemetryUtil.getColumnCountAsNumeric(' (aa)')).toEqual(-1);
        });

        it('getColumnCountAsNumeric with blank text', () => {
            expect(TelemetryUtil.getColumnCountAsNumeric('')).toEqual(-1);
        });
    });

    describe('getDuration Test', () => {

        it('getDuration with seconds and nanos', () => {
            const duration = new Duration();
            duration.setSeconds(3);
            duration.setNanos(23000);
            expect(TelemetryUtil.getDuration(3023)).toEqual(duration);
        });

        it('getDuration with only seconds', () => {
            const duration = new Duration();
            duration.setSeconds(5);
            duration.setNanos(0);
            expect(TelemetryUtil.getDuration(5000)).toEqual(duration);
        });

        it('getDuration with only nanos', () => {
            const duration = new Duration();
            duration.setSeconds(0);
            duration.setNanos(4000);
            expect(TelemetryUtil.getDuration(4)).toEqual(duration);
        });
    });
});
