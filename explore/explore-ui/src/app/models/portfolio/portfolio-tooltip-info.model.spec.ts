import {PortfolioTooltipInfo} from './portfolio-tooltip-info.model';


describe('Tooltip Model', () => {

    it('Tests the constructor', () => {
        const toolTipInfo: PortfolioTooltipInfo = new PortfolioTooltipInfo();
        expect(toolTipInfo).toBeTruthy();
    });
});
