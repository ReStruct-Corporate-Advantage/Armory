import {WidgetSize} from './widget-size.model';

describe('Widget size testcase', () => {
    it('Test serialize and deserialize', function () {
        const widgetSize = new WidgetSize();
        widgetSize.sizeX = 7;
        widgetSize.sizeY = 9;
        let data: any = widgetSize.serialize();
        let deserializedWidgetSize = new WidgetSize();
        deserializedWidgetSize.deserialize(data);
        expect(deserializedWidgetSize.sizeX).toBe(7);
        expect(deserializedWidgetSize.sizeY).toBe(9);

        data = {
            height: 5,
            width: 9
        };
        deserializedWidgetSize = new WidgetSize();
        deserializedWidgetSize.deserialize(data);
        expect(deserializedWidgetSize.sizeX).toBe(9);
        expect(deserializedWidgetSize.sizeY).toBe(5);
    });
});
