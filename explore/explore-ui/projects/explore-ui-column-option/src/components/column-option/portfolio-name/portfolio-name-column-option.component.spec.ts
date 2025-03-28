import {PortfolioNameColumnOption} from '../../../models/column-option/portfolio-name-column-option.model';
import {ColumnOptionTestBed} from '../../../test-utils';
import {PortfolioNameColumnOptionComponent} from './portfolio-name-column-option.component';

describe('PortfolioNameOptionsComponent', () => {
    let testBed: ColumnOptionTestBed<PortfolioNameColumnOptionComponent, PortfolioNameColumnOption>;

    beforeEach(() => {
        // Create the mocked column option to validate this component.
        const mockedOption = {
            'columnOptionAttributes': [{
                'title': 'Show Portfolio Short Name',
                'key': 'showShortNameForPortfolio'
            }, {
                'title': 'Show Portfolio Group Short Name',
                'key': 'showShortNameForPortGroup'
            }]
        };

        const portfolioNameOption: PortfolioNameColumnOption = new PortfolioNameColumnOption();
        portfolioNameOption.initialize(mockedOption);

        // Create the testbed for testing the component.
        testBed = new ColumnOptionTestBed<PortfolioNameColumnOptionComponent, PortfolioNameColumnOption>(PortfolioNameColumnOptionComponent, portfolioNameOption, mockedOption);
    });

    it('Validate init of the component', () => {
        expect(testBed).not.toBeUndefined();
        expect(testBed).not.toBeNull();
        expect(testBed.component.optionValue.showShortNameForPortfolio).toBeTruthy();
        expect(testBed.component.optionValue.showShortNameForPortGroup).toBeTruthy();

        const displayMockData = [{
                'label': 'Short name',
                'checked': true,
                'disabled': false
            },
            {'label': 'Long name', 'checked': false, 'disabled': false}];

        testBed.component.initializeComponent();
        expect(testBed.component.displayDataForPortfolioNames).toStrictEqual(displayMockData);
        expect(testBed.component.displayDataForPortGroupNames).toStrictEqual(displayMockData);
    });

    it('Test  updatePortGroupNames', function () {
        testBed.component.displayDataForPortGroupNames[0].checked = true;
        testBed.component.updatePortGroupNames();
        expect(testBed.component.optionValue.showShortNameForPortGroup).toBeTruthy();

        testBed.component.displayDataForPortGroupNames[0].checked = false;
        testBed.component.updatePortGroupNames();
        expect(testBed.component.optionValue.showShortNameForPortGroup).toBeFalsy();
    });

    it('Test  updatePortfolioNames', function () {
        testBed.component.displayDataForPortfolioNames[0].checked = true;
        testBed.component.updatePortfolioNames();
        expect(testBed.component.optionValue.showShortNameForPortfolio).toBeTruthy();

        testBed.component.displayDataForPortfolioNames[0].checked = false;
        testBed.component.updatePortfolioNames();
        expect(testBed.component.optionValue.showShortNameForPortfolio).toBeFalsy();
    });

});
