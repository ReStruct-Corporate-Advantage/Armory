import {IndexResearchTreeUtils} from '@utils/index-research-tree.utils';

describe('IndexResearchTreeUtils', () => {
    it('tests createIndexTree', () => {
        const indexTreeItems = [
            {
                familyTree: [
                    {
                        fullName: 'BBG Barc 144A Ex Euro 300MM Min',
                        familyTree: [],
                        ticker: 'L144AXEURO'
                    },
                    {
                        fullName: 'BBG Barc US Aggregate 300M 8-plus yr Index',
                        familyTree: [],
                        ticker: 'LEH300M8P'
                    }
                ],
                fullName: 'BARCLAYS'
            },
            {
                familyTree: [
                    {
                        familyTree: [],
                        fullName: 'Currency / Money Market'
                    },
                    {
                        familyTree: [
                            {
                                familyTree: [
                                    {
                                        fullName: 'ICE BofAML Euro-Sterling Index',
                                        familyTree: [],
                                        ticker: 'V-MLEURCST'
                                    }
                                ],
                                fullName: 'ICE BofAML Euro-Sterling Index'
                            }
                        ],
                        fullName: 'European high grade'
                    }
                ],
                fullName: 'ICE'
            }
        ];

        const indexTree = IndexResearchTreeUtils.createIndexTree(indexTreeItems as any[]);
        expect(indexTree[0].children.length).toBe(2);
        expect(indexTree[1].children.length).toBe(1);
    });
});
