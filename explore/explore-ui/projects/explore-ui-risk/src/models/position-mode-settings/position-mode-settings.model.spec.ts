import {PositionModeSettings} from './position-mode-settings.model';
import {PositionModeType, PositionModeUtil} from '../../enums/position-mode.enum';


describe('PositionMode Settings test case', () => {

    it('Deserialize test case', () => {
        const data: any = {};
        data.positionMode = PositionModeUtil.typeName(PositionModeType.AS_IS_W);
        const positionModeSettings = getPositionModeSettings();
        positionModeSettings.deserialize(data)
        expect(positionModeSettings.positionModeSelection).toEqual(PositionModeType.AS_IS_W);
    });

    it('Serialize test case', () => {
        const positionModeSettings = getPositionModeSettings();
        const expected = positionModeSettings.serialize();
        expect(expected.positionMode).toEqual('AS_OF_W');
    });

    it('AddRequest Param test case', () => {
        const requestParams: any = {};
        const positionModeSettings = getPositionModeSettings();
        positionModeSettings.addRequestParams(requestParams);
        expect(requestParams.positionMode).toBe('AS_OF_W');
    });

    /**
     *  Create PositionModeSettings for testing.
     */
    function getPositionModeSettings(): PositionModeSettings {
        const positionModeSettings: PositionModeSettings = new PositionModeSettings();
        return positionModeSettings;
    }
});
