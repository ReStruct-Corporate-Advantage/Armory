import {HighlightComparisonType} from '../../enums';
import {HighlightSettings} from '../highlight/highlight-settings.model';
import {HighlightColumnOption} from './highlight-column-option.model';
import {cloneDeep} from 'lodash';

describe('HighlightColumnOption', () => {

    let highlightColumnOption: HighlightColumnOption;

    it('should initialize a model with defaults', () => {
        highlightColumnOption = new HighlightColumnOption();
        highlightColumnOption.initialize(null);
        expect(highlightColumnOption.highlightSettings).toBeDefined();
        expect(highlightColumnOption.highlightSettings.length).toBe(0);
        expect(highlightColumnOption.highlightOnlyLeaf).toBe(true);
    });

    it('should serialize and deserialize the model', () => {
        const highlightSetting = new HighlightSettings();
        // properties required for a highlight rule to be saved
        highlightSetting.comparisonType = HighlightComparisonType.EQUALS;
        highlightSetting.comparisonRawValues = [50];

        // highlight column option to serialize
        highlightColumnOption = new HighlightColumnOption();
        highlightColumnOption.highlightSettings = [highlightSetting];
        highlightColumnOption.highlightOnlyLeaf = false;
        jest.spyOn(highlightColumnOption, 'doSerialize');
        const serializedData = highlightColumnOption.serialize();
        expect(highlightColumnOption.doSerialize).toHaveBeenCalled();

        // highlight column option to deserialize
        const newHighlightColumnOption = new HighlightColumnOption();
        jest.spyOn(newHighlightColumnOption, 'deserialize');
        newHighlightColumnOption.deserialize(serializedData);
        expect(newHighlightColumnOption.deserialize).toHaveBeenCalled();
        expect(newHighlightColumnOption.equals(highlightColumnOption)).toBe(true);
    });

    it('should return false if column options are not equal', () => {
        const highlightColumnOption1 = new HighlightColumnOption();
        highlightColumnOption1.highlightSettings = [new HighlightSettings()];

        const highlightColumnOption2 = cloneDeep(highlightColumnOption1);

        highlightColumnOption2.highlightOnlyLeaf = !highlightColumnOption1.highlightOnlyLeaf;
        expect(highlightColumnOption1.equals(highlightColumnOption2)).toBeFalsy();

        highlightColumnOption2.highlightOnlyLeaf = highlightColumnOption1.highlightOnlyLeaf;
        highlightColumnOption2.highlightSettings = [];
        expect(highlightColumnOption1.equals(highlightColumnOption2)).toBeFalsy();
    });
});
