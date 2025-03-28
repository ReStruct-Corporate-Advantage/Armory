import {JITATierInfo} from './jita-tier-info.model';

describe('JITATierInfo test', () => {
    let jitaTierInfo: JITATierInfo;

    beforeEach(() => {
        jitaTierInfo = new JITATierInfo();
    });

    it('Test model initialization', () => {
        expect(jitaTierInfo).toBeDefined();
    });

    it('Test deserialize', () => {
        const data: any = {
            jitaTier: 1, title: 'Tier-1'
        };
        jitaTierInfo.deserialize(data);

        expect(jitaTierInfo.jitaTier).toBe(1);
        expect(jitaTierInfo.title).toBe('Tier-1');
    });

    it('Test addRequestParams', function () {
        let requestParam: any = {};
        jitaTierInfo.jitaTier=1;
        jitaTierInfo.title='Tier-1';
        jitaTierInfo.addRequestParams(requestParam);
        expect(requestParam).toBeDefined();
        expect(requestParam.jitaTier).toBe(1);
        expect(requestParam.title).toBe('Tier-1');
    });

    it('Test serialize', function () {
        let data: any = {
            jitaTier: 1, title: 'Tier-1'
        };
        jitaTierInfo.deserialize(data);
        data = jitaTierInfo.serialize();
        expect(data).not.toBeUndefined();
        expect(data).not.toBeNull();
        // all options were populated according to default values
        expect(data.jitaTier).toBe(1);
        expect(data.title).toBe('Tier-1');
    });
});
