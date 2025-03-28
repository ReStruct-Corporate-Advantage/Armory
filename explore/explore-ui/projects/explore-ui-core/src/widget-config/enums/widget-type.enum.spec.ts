import {WidgetConfigType} from './widget-config-type.enum';
import {getWidgetType, WidgetType} from './widget-type.enum';

describe('widget-type enum functions tests', function () {
    it('getWidgetType', function() {
        // Widget config type is mapped to the widget type in the main widgets' mappings
        expect(getWidgetType(WidgetConfigType.RETURNS)).toStrictEqual(WidgetType.RETURNS);

        // Widget config type is mapped to the widget type in the spritelet widgets' mappings
        expect(getWidgetType(WidgetConfigType.RETURNS_TIME_SERIES)).toStrictEqual(WidgetType.RETURNS_SPRITELET);

        // Widget config  type is not mapped
        expect(getWidgetType('invalidWidgetConfigType')).toBeUndefined();
    });
});
