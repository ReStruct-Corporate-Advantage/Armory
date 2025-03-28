import {CommonUtils} from '@blk/explore-ui-core';
import {ExploreCachingService} from '@services/widget-data/explore-caching.service';
import {ExploreDataRequest} from '@models/requests/explore-data-request.model';
import * as LZString from 'lz-string';
import {of} from 'rxjs';

describe('ExploreCachingService Test', () => {
    let cachingService;
    let data;
    let prismRequest;
    beforeEach((() => {
        jest.spyOn(CommonUtils, 'getURLParam').mockReturnValue('true');
        data = [{
            'args': null,
            'output': {
                'message': null,
                'data': {
                    'data': {
                        'data': [null, null, 1.0000000000000009],
                        'children': [{
                            'title': 'ABS',
                            'data': [null, null, 0.010753485944388817],
                            'children': [{
                                'data': ['AMCAR_15-2   A3', '03065LAD1', 4.1531446991883026E-4]
                            }, {
                                'data': ['AMCAR_16-1   A3', '03065VAD9', 4.1816843635316135E-4]
                            }, {
                                'data': ['AMCAR_17-1   A3', '03065FAD4', 4.6427000944693415E-5]
                            }, {
                                'data': ['CABMT_14-2    A', '126802CY1', 7.370692768550915E-4]
                            }, {
                                'data': ['CABMT_15-2   A1', '126802DH7', 4.6021006052722913E-4]
                            }, {
                                'data': ['CARMX_14-4   A3', '14313UAC0', 1.657458363020748E-4]
                            }, {
                                'data': ['CARMX_16-1   A3', '14313YAC2', 7.653292671800222E-4]
                            }, {
                                'data': ['CCCIT_07-A8   A8', '17305EDY8', 3.64889680627761E-4]
                            }, {
                                'data': ['CCCIT_17-A3   A3', '17305EGB5', 2.1881283227179608E-4]
                            }, {
                                'data': ['CHAIT_15-A2   A2', '161571GT5', 4.6406926998510557E-4]
                            }, {
                                'data': ['CNH_16-A   A3', '12594BAD4', 4.6310276000378095E-4]
                            }, {
                                'data': ['DCENT_14-A5    A', '254683BL8', 4.5600404902059404E-4]
                            }, {
                                'data': ['FORDF_14-2    A', '34528QDA9', 0.0010166468298250671]
                            }, {
                                'data': ['JDOT_17-B   A3', '47788BAD6', 2.639423449094532E-4]
                            }, {
                                'data': ['NAVSL_14-CT    A 144A', '63938HAA5', 9.498617521086546E-5]
                            }, {
                                'data': ['NAVSL_15-2   A2', '63939GAB4', 4.5715906664855604E-4]
                            }, {
                                'data': ['NAVSL_15-AA  A2A 144A', '63939EAB9', 3.492993911997866E-4]
                            }, {
                                'data': ['NAVSL_16-AA  A2A 144A', '63939NAB9', 2.9007984253582285E-4]
                            }, {
                                'data': ['SDART_16-1   A3', '80285EAD9', 4.1571742882541264E-4]
                            }, {
                                'data': ['SDART_16-2   A3', '80285CAF8', 7.730637528241024E-5]
                            }, {
                                'data': ['SLMA_12-D   A2 144A', '78447CAB6', 1.2294460840375491E-4]
                            }, {
                                'data': ['SMB_15-C   A3 144A', '78448RAD8', 3.046198287021341E-4]
                            }, {
                                'data': ['SYNCT_15-1    A', '87165LAF8', 2.970466673389138E-4]
                            }, {
                                'data': ['WFNMT_12-A    A', '981464CW8', 7.89233348064743E-4]
                            }, {
                                'data': ['WFNMT_12-C    A', '981464DG2', 4.4356208396478504E-4]
                            }, {
                                'data': ['WFNMT_15-B    A', '981464EY2', 4.545222943280135E-4]
                            }, {
                                'data': ['WFNMT_16-B    A', '981464FP0', 4.0127671915896166E-4]
                            }
                            ]
                        }, {
                            'title': 'BND',
                            'data': [null, null, 0.8791714046281657],
                            'children': [{
                                'data': ['ABBOTT LABORATORIES', '002824BD1', 4.738482073166316E-5]
                            }, {
                                'data': ['ABBVIE INC', '00287YAL3', 3.953267742980271E-5]
                            }, {
                                'data': ['ACE INA HOLDINGS INC', '00440EAV9', 1.5375180769844246E-4]
                            }, {
                                'data': ['ACE INA HOLDINGS INC', '00440EAP2', 9.83226421817804E-4]
                            }, {
                                'data': ['ACTAVIS FUNDING SCS', '00507UAS0', 6.529119461177907E-5]
                            }, {
                                'data': ['ACTAVIS FUNDING SCS', '00507UAR2', 6.496512176846171E-5]
                            }, {
                                'data': ['AETNA INC', '00817YAQ1', 7.807673945671049E-5]
                            }, {
                                'data': ['AETNA INC', '00817YAV0', 1.5731235449830086E-5]
                            }, {
                                'data': ['AETNA INC', '008117AP8', 6.22851367806451E-4]
                            }, {
                                'data': ['AIR LEASE CORPORATION', '00912XAV6', 1.5776532516617505E-5]
                            }, {
                                'data': ['AIR LIQUIDE FINANCE SA     144A', '00913RAD8', 3.004409944921534E-4]
                            }, {
                                'data': ['ALTRIA GROUP INC', '02209SAN3', 7.886726134654257E-6]
                            }, {
                                'data': ['ALTRIA GROUP INC', '02209SAU7', 3.781610372483772E-5]
                            }, {
                                'data': ['AMAZONCOM INC', '023135AN6', 1.666977674919152E-4]
                            }, {
                                'data': ['AMERICAN INTL GROUP', '026874DH7', 1.226320415027799E-4]
                            }, {
                                'data': ['AMGEN INC', '031162CK4', 9.17389419627564E-4]
                            }, {
                                'data': ['AMGEN INC', '031162CM0', 3.128604477372304E-5]
                            }, {
                                'data': ['AMGEN INC', '031162BW9', 3.124505520473729E-6]
                            }, {
                                'data': ['AMGEN INC', '031162CJ7', 7.403986744746981E-6]
                            }, {
                                'data': ['AMGEN INC.', '031162BN9', 9.817881951156276E-5]
                            }, {
                                'data': ['ANALOG DEVICES INC', '032654AN5', 2.3916318408493124E-5]
                            }, {
                                'data': ['ANHEUSER-BUSCH INBEV FINANCE INC', '035242AJ5', 9.733287526005969E-4]
                            }, {
                                'data': ['ANHEUSER-BUSCH INBEV FINANCE INC', '035242AP1', 0.0015332031844912117]
                            }, {
                                'data': ['AON PLC', '00185AAK0', 2.7989788235412582E-5]
                            }, {
                                'data': ['APPLE INC', '037833CQ1', 0.001859715650639675]
                            }, {
                                'data': ['APPLE INC', '037833CD0', 3.9096751983965284E-5]
                            }, {
                                'data': ['APPLE INC', '037833BZ2', 5.760236803921584E-4]
                            }, {
                                'data': ['APPLE INC', '037833BY5', 8.184553871921862E-4]
                            }, {
                                'data': ['APPLE INC', '037833BD1', 4.8547546439399263E-4]
                            }, {
                                'data': ['APPLE INC', '037833AQ3', 0.0020570348722888515]
                            }, {
                                'data': ['APPLE INC', '037833AL4', 9.348767471255419E-5]
                            }, {
                                'data': ['APPLE INC', '037833BX7', 1.926774603321447E-4]
                            }, {
                                'data': ['APPLE INC', '037833CJ7', 3.9081912392817327E-4]
                            }, {
                                'data': ['APPLE INC', '037833AR1', 0.0017353142025918046]
                            }, {
                                'data': ['APPLE INC', '037833CR9', 1.8277323357949595E-4]
                            }, {
                                'data': ['APPLIED MATERIALS INC', '038222AL9', 2.564680987435785E-4]
                            }, {
                                'data': ['ARCH CAPITAL FINANCE LLC', '03939CAA1', 2.4499966410779134E-5]
                            }, {
                                'data': ['AT&T INC', '00206RDB5', 9.014508111387306E-5]
                            }, {
                                'data': ['AT&T INC', '00206RCM2', 9.399421872051565E-5]
                            }, {
                                'data': ['AT&T INC', '00206RDQ2', 4.8878006647429774E-5]
                            }, {
                                'data': ['AT&T INC', '00206RCZ3', 1.4691061799723746E-4]
                            }, {
                                'data': ['AUTODESK INC', '052769AE6', 3.8900525649035845E-5]
                            }, {
                                'data': ['AVALONBAY COMMUNITIES INC MTN', '05348EAW9', 9.658166642871633E-5]
                            }, {
                                'data': ['AVNET INC', '053807AS2', 1.6375065905747783E-5]
                            }, {
                                'data': ['BALTIMORE GAS AND ELECTRIC CO', '059165EG1', 3.7017358810319424E-4]
                            }, {
                                'data': ['BANK NEDERLANDSE GEMEENTEN NV 144A', '62944BBJ2', 7.294616264085712E-4]
                            }, {
                                'data': ['BANK OF AMERICA CORP', '06051GEX3', 0.0013254001603244061]
                            }, {
                                'data': ['BANK OF AMERICA CORP', '060505DP6', 6.406647000739905E-4]
                            }, {
                                'data': ['BANK OF AMERICA CORP MTN', '06051GFU8', 7.346305583922884E-5]
                            }, {
                                'data': ['BANK OF AMERICA CORP MTN', '06051GFN4', 0.0012033639169248436]
                            }, {
                                'data': ['BANK OF AMERICA CORP MTN', '06051GFP9', 6.76521673284463E-5]
                            }, {
                                'data': ['BANK OF AMERICA CORP MTN', '06051GEU9', 6.367458757757072E-5]
                            }, {
                                'data': ['BANK OF AMERICA CORP MTN', '06051GFM6', 9.617786499676821E-5]
                            }, {
                                'data': ['BANK OF AMERICA CORP MTN', '06051GFW4', 3.1450203270634224E-5]
                            }, {
                                'data': ['BANK OF AMERICA CORP MTN', '06051GFS3', 1.0554523649648412E-4]
                            }, {
                                'data': ['BANK OF AMERICA CORP MTN', '06051GGF0', 2.862865861429886E-4]
                            }, {
                                'data': ['BANK OF AMERICA CORP MTN', '06051GET2', 2.574885155851885E-4]
                            }, {
                                'data': ['BANK OF AMERICA CORP MTN', '06051GFH7', 9.094261199777052E-5]
                            }, {
                                'data': ['BANK OF AMERICA CORP MTN', '06051GGK9', 5.649610305296384E-4]
                            }, {
                                'data': ['BANK OF AMERICA NA', '06050TMC3', 0.0013354310045974069]
                            }, {
                                'data': ['BANK OF MONTREAL MTN', '06367THQ6', 2.0007021668416142E-4]
                            }, {
                                'data': ['BANK OF NEW YORK MELLON CORP MTN', '06406HDA4', 2.340607265442669E-5]
                            }, {
                                'data': ['BANK OF NEW YORK MELLON CORP/THE MTN', '06406FAC7', 2.3157145806855287E-5]
                            }, {
                                'data': ['BANK OF NEW YORK MELLON CORP/THE MTN', '06406FAB9', 6.206726212954274E-4]
                            }, {
                                'data': ['BANK OF NEW YORK MELLON CORP/THE MTN', '06406YAA0', 4.346636133274644E-4]
                            }, {
                                'data': ['BANK OF NEW YORK MELLON CORP/THE MTN', '06406HCV9', 5.6782896534044E-4]
                            }, {
                                'data': ['BANK OF NEW YORK MELLON CORP/THE MTN', '06406HDD8', 1.7322434147878707E-4]
                            }, {
                                'data': ['BANK OF NEW YORK MELLON CORP/THE MTN', '06406GAA9', 7.660795322835155E-5]
                            }, {
                                'data': ['BANK OF NEW YORK MELLON CORP/THE MTN', '06406RAB3', 0.0019199258179368483]
                            }, {
                                'data': ['BARCLAYS PLC', '06738EAN5', 3.2606562835769276E-4]
                            }, {
                                'data': ['BARCLAYS PLC', '06738EAD7', 4.41413053030193E-4]
                            }, {
                                'data': ['BAXALTA INC', '07177MAB9', 1.1369281644709004E-4]
                            }, {
                                'data': ['BAYER US FINANCE LLC       144A', '07274EAF0', 7.039445986601085E-4]
                            }, {
                                'data': ['BECTON DICKINSON AND COMPANY', '075887BF5', 1.925678409487664E-5]
                            }, {
                                'data': ['BECTON DICKINSON AND COMPANY', '075887BE8', 2.2059141508189308E-5]
                            }, {
                                'data': ['BERKSHIRE HATHAWAY INC', '084670BR8', 1.594319978466326E-4]
                            }, {
                                'data': ['BERKSHIRE HATHAWAY INC', '084670BS6', 1.1200980982520707E-4]
                            }, {
                                'data': ['BLACK HILLS CORPORATION', '092113AM1', 1.5201787857659062E-5]
                            }, {
                                'data': ['BNP PARIBAS SA MTN', '05574LFY9', 7.476565622950362E-4]
                            }, {
                                'data': ['BNP PARIBAS SA MTN 144A', '05581KAB7', 3.227077070833277E-4]
                            }, {
                                'data': ['BOEING CO', '097023BN4', 4.66840442355972E-5]
                            }, {
                                'data': ['BOEING CO', '097023BM6', 2.802706924267684E-4]
                            }, {
                                'data': ['BOEING CO', '097023BG9', 1.3121210442055815E-4]
                            }, {
                                'data': ['BOEING CO', '097023BJ3', 4.462346092227135E-5]
                            }, {
                                'data': ['BPCE SA MTN', '05578DAW2', 3.9452315416947024E-4]
                            }, {
                                'data': ['BRANCH BANKING AND TRUST COMPANY', '07330MAB3', 4.128365715108879E-4]
                            }, {
                                'data': ['BRISTOL-MYERS SQUIBB CO', '110122BB3', 6.929906470134289E-5]
                            }, {
                                'data': ['BURLINGTON NORTHERN SANTA FE LLC', '12189LAM3', 6.473149923173846E-6]
                            }, {
                                'data': ['BURLINGTON NORTHERN SANTA FE LLC', '12189LAY7', 1.0006754339208468E-4]
                            }, {
                                'data': ['CANADA (GOVERNMENT)', '135087C77', 1.9541208460750232E-4]
                            }, {
                                'data': ['CAPITAL ONE BANK USA NA', '140420NH9', 3.8782084868366787E-4]
                            }, {
                                'data': ['CAPITAL ONE BANK USA NA', '140420NE6', 7.78912703134907E-4]
                            }, {
                                'data': ['CAPITAL ONE FINANCIAL CORP', '14040HBD6', 8.612639006663357E-4]
                            }, {
                                'data': ['CAPITAL ONE FINANCIAL CORPORATION', '14040HBK0', 1.3075746534304975E-4]
                            }, {
                                'data': ['CAPITAL ONE FINANCIAL CORPORATION', '14040HBP9', 2.11612037884593E-4]
                            }, {
                                'data': ['CAPITAL ONE NA', '14042E5V8', 3.88636762434609E-4]
                            }, {
                                'data': ['CAPITAL ONE NA/MCLEAN VA', '14042RFH9', 9.010635139613621E-4]
                            }, {
                                'data': ['CAPITAL ONE NA/MCLEAN VA', '14042E4L1', 0.002505661384291971]
                            }, {
                                'data': ['CC HOLDINGS GS V LLC', '14987BAE3', 2.8073964340964664E-4]
                            }, {
                                'data': ['CDP FINANCIAL INC 144A', '125094AD4', 0.0015552975780032223]
                            }, {
                                'data': ['CELGENE CORPORATION', '151020AQ7', 4.7531830324971244E-5]
                            }, {
                                'data': ['CELGENE CORPORATION', '151020AH7', 3.194451797174629E-5]
                            }, {
                                'data': ['CHARLES SCHWAB CORPORATION (THE)', '808513AM7', 2.6236875062543607E-4]
                            }, {
                                'data': ['CHEVRON CORP', '166764BT6', 8.476670929638789E-4]
                            }, {
                                'data': ['CHEVRON CORP', '166764BL3', 9.40999263266458E-5]
                            }, {
                                'data': ['CIGNA CORPORATION', '125509BU2', 1.903363934014567E-4]
                            }, {
                                'data': ['CIMAREX ENERGY CO.', '171798AC5', 1.7837345009126635E-4]
                            }, {
                                'data': ['CIMAREX ENERGY CO.', '171798AD3', 1.2752137576365103E-4]
                            }, {
                                'data': ['CISCO SYSTEMS INC', '17275RAH5', 3.9622901326273103E-4]
                            }, {
                                'data': ['CISCO SYSTEMS INC', '17275RBD3', 8.426727151121548E-4]
                            }, {
                                'data': ['CISCO SYSTEMS INC', '17275RBJ0', 6.661915776914364E-4]
                            }, {
                                'data': ['CISCO SYSTEMS INC', '17275RBL5', 5.310317254656437E-4]
                            }, {
                                'data': ['CISCO SYSTEMS INC', '17275RBH4', 1.467028621244803E-4]
                            }, {
                                'data': ['CITIGROUP INC', '172967JJ1', 4.675250832086902E-5]
                            }, {
                                'data': ['CITIGROUP INC', '172967KB6', 4.73557304036641E-5]
                            }, {
                                'data': ['CITIGROUP INC', '172967JH5', 0.001922260690097396]
                            }, {
                                'data': ['CITIGROUP INC', '172967KE0', 6.222820304699571E-5]
                            }, {
                                'data': ['CITIGROUP INC', '172967HU8', 3.985857943889691E-4]
                            }, {
                                'data': ['CITIGROUP INC', '172967HC8', 1.5408627140044503E-4]
                            }, {
                                'data': ['CITIZENS FINANCIAL GROUP INC', '174610AN5', 5.397806462683591E-5]
                            }, {
                                'data': ['COACH INC', '189754AB0', 2.3276126044139022E-5]
                            }, {
                                'data': ['COACH INC', '189754AC8', 4.6979703991140914E-5]
                            }, {
                                'data': ['COCA-COLA CO', '191216BT6', 1.5595899312398757E-4]
                            }, {
                                'data': ['COCA-COLA CO', '191216BZ2', 1.8733856594148056E-4]
                            }, {
                                'data': ['COMCAST CORP', '20030NBA8', 0.0010080014515353856]
                            }, {
                                'data': ['COMCAST CORPORATION', '20030NBY6', 4.400746400345548E-4]
                            }, {
                                'data': ['COMCAST CORPORATION', '20030NBR1', 5.232953025609404E-4]
                            }, {
                                'data': ['COMCAST CORPORATION', '20030NBW0', 1.4237090963902844E-4]
                            }, {
                                'data': ['COMCAST CORPORATION', '20030NBV2', 3.4055069082808886E-4]
                            }, {
                                'data': ['COMCAST CORPORATION', '20030NBS9', 7.790023090950794E-4]
                            }, {
                                'data': ['COMCAST CORPORATION', '20030NBL4', 1.4580661100458485E-4]
                            }, {
                                'data': ['CONOCOPHILLIPS CO', '20826FAQ9', 3.708116236540409E-4]
                            }, {
                                'data': ['CREDIT SUISSE GROUP FUNDING GUERNS MTN', '225433AD3', 3.956100516863584E-4]
                            }, {
                                'data': ['CREDIT SUISSE NEW YORK NY MTN', '22546QAP2', 4.1027436578993753E-4]
                            }, {
                                'data': ['CREDIT SUISSE NEW YORK NY MTN', '22546QAN7', 0.001362922879536657]
                            }, {
                                'data': ['CSX CORP', '126408HE6', 2.9902421773596398E-5]
                            }, {
                                'data': ['CVS CAREMARK CORP', '126650CF5', 4.770056993669399E-5]
                            }, {
                                'data': ['CVS HEALTH CORP', '126650CL2', 2.1176821329577512E-5]
                            }, {
                                'data': ['DAIMLER FINANCE NORTH AMERICA LLC 144A', '233851BP8', 7.398769947247062E-4]
                            }, {
                                'data': ['DELPHI CORP', '247126AJ4', 2.1684372377587137E-5]
                            }, {
                                'data': ['DEUTSCHE BANK AG (LONDON BRANCH)', '25152RYD9', 2.4740306848574002E-5]
                            }, {
                                'data': ['DISCOVER BANK', '25466AAD3', 4.117839931744767E-4]
                            }, {
                                'data': ['DISCOVERY COMMUNICATIONS LLC', '25470DAL3', 2.523986886877973E-5]
                            }, {
                                'data': ['DOLLAR GENERAL CORPORATION', '256677AD7', 8.178163420036725E-5]
                            }, {
                                'data': ['DOMINION ENERGY INC', '25746UCT4', 2.3468310257317633E-5]
                            }, {
                                'data': ['DTE ELECTRIC CO', '23338VAC0', 2.4533652721653407E-4]
                            }, {
                                'data': ['DTE ENERGY COMPANY', '233331AT4', 4.0684893459601193E-4]
                            }, {
                                'data': ['DTE ENERGY COMPANY', '233331AV9', 3.20033546767613E-5]
                            }, {
                                'data': ['DUKE ENERGY CAROLINAS', '26442CAC8', 1.575455049654185E-4]
                            }, {
                                'data': ['DUKE ENERGY CAROLINAS LLC', '26442CAS3', 3.135272848563039E-4]
                            }, {
                                'data': ['DUKE ENERGY CORP', '26441CAP0', 2.4606628623855323E-4]
                            }, {
                                'data': ['DUKE ENERGY CORP', '26441CAN5', 3.716758240341913E-4]
                            }, {
                                'data': ['DUKE ENERGY PROGRESS INC', '26442UAA2', 3.999631374434928E-4]
                            }, {
                                'data': ['E I DU PONT DE NEMOURS AND CO', '263534CL1', 1.8797215227578243E-4]
                            }, {
                                'data': ['EASTMAN CHEMICAL CO', '277432AR1', 2.604082584041802E-5]
                            }, {
                                'data': ['EATON CORPORATION', '278062AC8', 7.519382372025245E-4]
                            }, {
                                'data': ['ECOLAB INC', '278865AR1', 6.252894778332366E-5]
                            }, {
                                'data': ['ENERGY TRANSFER PARTNERS LP', '29273RBG3', 3.2545745896963594E-5]
                            }, {
                                'data': ['ENERGY TRANSFER PARTNERS LP', '29273RBD0', 2.3914515930472798E-4]
                            }, {
                                'data': ['ENTERGY CORPORATION', '29364GAJ2', 2.2897439939333886E-5]
                            }, {
                                'data': ['ENTERPRISE PRODUCTS OPERATING LLC', '29379VBE2', 1.3643782060228864E-4]
                            }, {
                                'data': ['ENTERPRISE PRODUCTS OPERATING LLC', '29379VBG7', 3.10414265656695E-5]
                            }, {
                                'data': ['ENTERPRISE PRODUCTS OPERATING LLC', '29379VBH5', 3.18065309409737E-5]
                            }, {
                                'data': ['EOG RESOURCES INC', '26875PAP6', 2.801937785908576E-4]
                            }, {
                                'data': ['ERP OPERATING LIMITED PARTNERSHIP', '26884ABD4', 1.3570669695470595E-4]
                            }, {
                                'data': ['EXELON CORPORATION', '30161NAH4', 9.521784569782176E-5]
                            }, {
                                'data': ['EXELON CORPORATION', '30161NAT8', 7.821292370214366E-6]
                            }, {
                                'data': ['EXELON CORPORATION', '30161NAU5', 2.1384300506124766E-4]
                            }, {
                                'data': ['EXPORT DEVELOPMENT CANADA  144A', '30216BGH9', 3.088586987882713E-4]
                            }, {
                                'data': ['FEDEX CORP', '31428XBF2', 3.185975565587172E-5]
                            }, {
                                'data': ['FHLB', '3130A07B0', 2.846768439650377E-4]
                            }, {
                                'data': ['FHLB', '3133XG6E9', 0.004526750260427129]
                            }, {
                                'data': ['FHLB', '3133XGAY0', 7.638077568818963E-4]
                            }, {
                                'data': ['FIDELITY NATIONAL INFORMATION SERV', '31620MAR7', 2.4819326074407666E-5]
                            }, {
                                'data': ['FIFTH THIRD BANK/CINCINATI OH MTN', '31677QBD0', 3.1966577319487917E-4]
                            }, {
                                'data': ['FLORIDA POWER AND LIGHT CO', '341081FM4', 6.09634373050073E-4]
                            }, {
                                'data': ['FLORIDA POWER CORPORATION', '341099CP2', 3.6784469305188903E-4]
                            }, {
                                'data': ['FMS WERTMANAGEMENT AOR', '30254WAD1', 9.100210558019049E-4]
                            }, {
                                'data': ['FNMA', '31358DDG6', 2.1607918304783052E-4]
                            }, {
                                'data': ['FNMA', '31359YBH9', 2.068269429227221E-4]
                            }, {
                                'data': ['FNMA MTN', '31358DDR2', 0.0013548485834563272]
                            }, {
                                'data': ['FORD MOTOR COMPANY', '345370CR9', 1.2838906606978836E-4]
                            }, {
                                'data': ['FORD MOTOR CREDIT CO LLC', '345397VT7', 3.201763684257007E-4]
                            }, {
                                'data': ['FORD MOTOR CREDIT COMPANY LLC', '345397WR0', 3.102051169828786E-4]
                            }, {
                                'data': ['GENERAL DYNAMICS CORPORATION', '369550AX6', 1.2477593557288285E-4]
                            }, {
                                'data': ['GENERAL ELECTRIC CAPITAL CORP MTN', '36962G4J0', 2.955950040963417E-4]
                            }, {
                                'data': ['GENERAL ELECTRIC CO', '369604BD4', 0.0010601896553592716]
                            }, {
                                'data': ['GENERAL ELECTRIC CO', '369604BG7', 5.690357699363934E-4]
                            }, {
                                'data': ['GENERAL MOTORS FINANCIAL CO INC', '37045XBS4', 3.822462467163759E-4]
                            }, {
                                'data': ['GEORGIA POWER COMPANY', '373334KH3', 1.4253000841712865E-4]
                            }, {
                                'data': ['GEORGIA POWER COMPANY', '373334KG5', 3.902488730126916E-4]
                            }, {
                                'data': ['GEORGIA-PACIFIC LLC', '373298CF3', 9.485558772517049E-5]
                            }, {
                                'data': ['GILEAD SCIENCES INC', '375558BC6', 2.9296746625116337E-4]
                            }, {
                                'data': ['GILEAD SCIENCES INC', '375558BM4', 7.424342058905127E-4]
                            }, {
                                'data': ['GILEAD SCIENCES INC', '375558BF9', 3.3637947992159117E-4]
                            }, {
                                'data': ['GILEAD SCIENCES INC', '375558BL6', 2.568115835401958E-4]
                            }, {
                                'data': ['GILEAD SCIENCES INC', '375558AW3', 5.479485949253684E-4]
                            }, {
                                'data': ['GOLDMAN SACHS GROUP INC', '38148LAE6', 1.684314594200794E-4]
                            }, {
                                'data': ['GOLDMAN SACHS GROUP INC', '38141GFM1', 3.4105610871929416E-4]
                            }, {
                                'data': ['GOLDMAN SACHS GROUP INC', '38141GFG4', 3.316736351727693E-4]
                            }, {
                                'data': ['GOLDMAN SACHS GROUP INC/THE', '38141GWB6', 1.7489573610861305E-4]
                            }, {
                                'data': ['GOLDMAN SACHS GROUP INC/THE', '38145GAJ9', 4.5276689747343813E-4]
                            }, {
                                'data': ['GOLDMAN SACHS GROUP INC/THE', '38147MAA3', 0.0022290504583392335]
                            }, {
                                'data': ['GOLDMAN SACHS GROUP INC/THE', '38148FAB5', 0.0017501242804617038]
                            }, {
                                'data': ['GOLDMAN SACHS GROUP INC/THE', '38148LAA4', 3.185034218927993E-4]
                            }, {
                                'data': ['GOLDMAN SACHS GROUP INC/THE', '38141GWL4', 5.199811802156779E-4]
                            }, {
                                'data': ['GOLDMAN SACHS GROUP INC/THE', '38143U8H7', 5.24151105506807E-5]
                            }, {
                                'data': ['GOLDMAN SACHS GROUP INC/THE', '38141GVK7', 6.931428535336536E-4]
                            }, {
                                'data': ['GOLDMAN SACHS GROUP INC/THE', '38141GRC0', 0.001047947573469553]
                            }, {
                                'data': ['GOLDMAN SACHS GROUP INC/THE', '38145XAA1', 1.6110042273697706E-4]
                            }, {
                                'data': ['HARRIS CORPORATION', '413875AQ8', 6.315150011725123E-5]
                            }, {
                                'data': ['HARTFORD FINANCIAL SERVICES GROUP', '416518AB4', 2.8042837601587056E-4]
                            }, {
                                'data': ['HOME DEPOT INC', '437076BM3', 1.585493521570049E-5]
                            }, {
                                'data': ['HONEYWELL INTERNATIONAL INC', '438516BM7', 9.38806726076991E-4]
                            }, {
                                'data': ['HONEYWELL INTERNATIONAL INC', '438516BJ4', 7.872475641083139E-4]
                            }, {
                                'data': ['HOST HOTELS & RESORTS LP', '44107TAT3', 1.1070116194618248E-4]
                            }, {
                                'data': ['HSBC HOLDINGS PLC', '404280AV1', 6.494528159081789E-4]
                            }, {
                                'data': ['HSBC HOLDINGS PLC', '404280BH1', 3.267902500516689E-4]
                            }, {
                                'data': ['HSBC HOLDINGS PLC', '404280BJ7', 6.418114614627675E-4]
                            }, {
                                'data': ['HSBC USA INC', '40428HPN6', 7.615506643884739E-4]
                            }, {
                                'data': ['HSBC USA INC', '40428HPR7', 0.0018196041250769395]
                            }, {
                                'data': ['HSBC USA INC', '40434CAD7', 6.446661736375672E-4]
                            }, {
                                'data': ['HSBC USA INC', '40428HPV8', 4.4985531404519364E-4]
                            }, {
                                'data': ['HSBC USA INC', '40428HPQ9', 1.6363070640419212E-4]
                            }, {
                                'data': ['HYUNDAI CAPITAL AMERICA MTN 144A', '44891AAC1', 2.3425853273972537E-4]
                            }, {
                                'data': ['HYUNDAI CAPITAL AMERICA MTN 144A', '44891AAL1', 1.40695159291489E-4]
                            }, {
                                'data': ['HYUNDAI CAPITAL AMERICA MTN 144A', '44891AAD9', 5.685172099817297E-4]
                            }, {
                                'data': ['INTEL CORPORATION', '458140AM2', 1.1094559932527469E-4]
                            }, {
                                'data': ['INTEL CORPORATION', '458140BB5', 7.372143773315104E-4]
                            }, {
                                'data': ['INTERCONTINENTAL EXCHANGE INC', '45866FAD6', 3.3046142563221143E-4]
                            }, {
                                'data': ['INTERNATIONAL BUSINESS MACHINES CO', '459200HE4', 7.172709674596456E-4]
                            }, {
                                'data': ['INTERNATIONAL BUSINESS MACHINES CO', '459200JC6', 1.5965343842596694E-4]
                            }, {
                                'data': ['INTERNATIONAL BUSINESS MACHINES CO', '459200JN2', 0.0012128066276071974]
                            }, {
                                'data': ['INTERNATIONAL LEASE FINANCE CORP', '459745GQ2', 6.687237960027697E-5]
                            }, {
                                'data': ['JOHN DEERE CAPITAL CORP', '24422ETG4', 0.0016620174130842279]
                            }, {
                                'data': ['JOHN DEERE CAPITAL CORP MTN', '24422ETL3', 3.790933076929437E-4]
                            }, {
                                'data': ['JOHNSON & JOHNSON', '478160CE2', 2.3884719944600088E-5]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46625HRW2', 6.313480970283991E-4]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '48127HAA7', 9.258019886215414E-4]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46625HJG6', 3.221559017348532E-4]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46625HRV4', 0.0015602572125844143]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46625HRL6', 4.047136626465082E-4]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46647PAF3', 0.0010765700394821138]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46625HGY0', 0.001723213849154031]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46625HJF8', 3.7277412708994293E-4]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46625HRS1', 0.0016902793541085535]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46625HJE1', 8.905840339881522E-5]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46625HJD3', 0.001094985839235296]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46625HNJ5', 5.1516109985874676E-5]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46625HLW8', 0.001163482062238775]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46625HRY8', 0.0010067764828269304]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '48128BAB7', 3.5400068776582713E-4]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46647PAE6', 0.0034184916037753774]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46625HHU7', 4.17259298830111E-4]
                            }, {
                                'data': ['JPMORGAN CHASE & CO', '46625HNX4', 9.312171711412806E-4]
                            }, {
                                'data': ['JPMORGAN CHASE & CO MTN', '46623EKD0', 0.0019482914899320658]
                            }, {
                                'data': ['JPMORGAN CHASE & CO MTN', '46625HKA7', 0.001257607539772341]
                            }, {
                                'data': ['JUNIPER NETWORKS INC', '48203RAJ3', 8.266699116724698E-6]
                            }, {
                                'data': ['KEYBANK NATIONAL ASSOCIATION', '49327M2S2', 3.8901315064240416E-4]
                            }, {
                                'data': ['KEYCORP MTN', '49326EEF6', 8.002246731475669E-5]
                            }, {
                                'data': ['KFW', '500769GV0', 4.038693263719696E-4]
                            }, {
                                'data': ['KFW', '500769GS7', 0.0010967043863065859]
                            }, {
                                'data': ['KINDER MORGAN INC', '49456BAE1', 1.5845921666713983E-5]
                            }, {
                                'data': ['KINDER MORGAN INC', '49456BAF8', 9.751167349387336E-5]
                            }, {
                                'data': ['KINDER MORGAN INC', '49456BAD3', 2.328933663632261E-5]
                            }, {
                                'data': ['KLA-TENCOR CORP', '482480AE0', 3.427471442500723E-6]
                            }, {
                                'data': ['KRAFT FOODS GROUP INC', '50076QAU0', 3.336196784260542E-5]
                            }, {
                                'data': ['KRAFT FOODS GROUP INC', '50076QAZ9', 1.4527973456760857E-4]
                            }, {
                                'data': ['KRAFT HEINZ FOODS CO', '50077LAD8', 1.4971093282188602E-5]
                            }, {
                                'data': ['LAM RESEARCH CORPORATION', '512807AN8', 3.266351861055045E-5]
                            }, {
                                'data': ['LAM RESEARCH CORPORATION', '512807AR9', 3.793297387485191E-5]
                            }, {
                                'data': ['LEHMAN BROS HLDG INC ESC 5249087M6', '524ESC7M6', 6.180719305033451E-11]
                            }, {
                                'data': ['LLOYDS BANKING GROUP PLC', '53944YAC7', 6.262531488041605E-4]
                            }, {
                                'data': ['LOCKHEED MARTIN CORP', '539830AY5', 3.2780952895418016E-5]
                            }, {
                                'data': ['LOCKHEED MARTIN CORPORATION', '539830BH1', 1.6167283960656336E-5]
                            }, {
                                'data': ['LOCKHEED MARTIN CORPORATION', '539830BF5', 5.533916688852482E-5]
                            }, {
                                'data': ['LOEWS CORP', '540424AQ1', 2.4226235491938328E-4]
                            }, {
                                'data': ['LOWES COMPANIES INC', '548661DM6', 2.249343956548311E-5]
                            }, {
                                'data': ['LYB INTERNATIONAL FINANCE BV', '50247VAA7', 4.117651076432669E-5]
                            }, {
                                'data': ['MANITOBA (PROVINCE OF)', '563469UD5', 2.074856542089204E-4]
                            }, {
                                'data': ['MARSH & MCLENNAN COMPANIES INC', '571748BB7', 3.149724695719125E-5]
                            }, {
                                'data': ['MARSH & MCLENNAN COMPANIES INC', '571748AX0', 4.260181315218942E-4]
                            }, {
                                'data': ['MARSH & MCLENNAN COMPANIES INC', '571748AZ5', 9.348027091645889E-4]
                            }, {
                                'data': ['MASSACHUSETTS ST SCH BLDG AUTH SAL', '576000LP6', 8.006635128025565E-5]
                            }, {
                                'data': ['MCDONALDS CORPORATION', '58013MEJ9', 3.23705565329594E-5]
                            }, {
                                'data': ['MCDONALDS CORPORATION MTN', '58013MFB5', 3.23575773314548E-5]
                            }, {
                                'data': ['MEDTRONIC INC', '585055BR6', 3.258815249886202E-4]
                            }, {
                                'data': ['MEDTRONIC INC', '585055BS4', 0.002043015180758743]
                            }, {
                                'data': ['MEDTRONIC INC', '585055BG0', 3.6476697899655243E-4]
                            }, {
                                'data': ['MICROSOFT CORPORATION', '594918CA0', 5.0669366223305424E-5]
                            }, {
                                'data': ['MICROSOFT CORPORATION', '594918BR4', 0.0016411676839685509]
                            }, {
                                'data': ['MICROSOFT CORPORATION', '594918BT0', 5.403733946759066E-4]
                            }, {
                                'data': ['MICROSOFT CORPORATION', '594918BP8', 6.996887625724457E-4]
                            }, {
                                'data': ['MICROSOFT CORPORATION', '594918BJ2', 9.669384833831849E-5]
                            }, {
                                'data': ['MICROSOFT CORPORATION', '594918BV5', 6.762577071758897E-4]
                            }, {
                                'data': ['MICROSOFT CORPORATION', '594918BQ6', 6.085811111793296E-4]
                            }, {
                                'data': ['MICROSOFT CORPORATION', '594918BY9', 0.0020603288102590796]
                            }, {
                                'data': ['MITSUBISHI UFJ FINANCIAL GROUP INC', '606822AL8', 7.887137049476053E-5]
                            }, {
                                'data': ['MITSUBISHI UFJ FINANCIAL GROUP INC', '606822AP9', 6.368122258489528E-4]
                            }, {
                                'data': ['MIZUHO FINANCIAL GROUP INC', '60687YAH2', 3.1778754445043584E-4]
                            }, {
                                'data': ['MONSANTO COMPANY', '61166WAU5', 2.1017648269532426E-4]
                            }, {
                                'data': ['MORGAN STANLEY', '61761JB32', 0.0021900805207572833]
                            }, {
                                'data': ['MORGAN STANLEY', '61746BEF9', 1.7368605211297517E-4]
                            }, {
                                'data': ['MORGAN STANLEY', '61747YDW2', 5.652044909172794E-4]
                            }, {
                                'data': ['MORGAN STANLEY', '61746BDM5', 4.374712780729382E-4]
                            }, {
                                'data': ['MORGAN STANLEY', '61746BDJ2', 0.001366273407529017]
                            }, {
                                'data': ['MORGAN STANLEY', '61761JVM8', 0.0013570945824256148]
                            }, {
                                'data': ['MORGAN STANLEY MTN', '6174466Q7', 0.002411957720876949]
                            }, {
                                'data': ['MORGAN STANLEY MTN', '61761JZN2', 1.1937280193621217E-4]
                            }, {
                                'data': ['MORGAN STANLEY MTN', '6174467U7', 5.149438475751748E-4]
                            }, {
                                'data': ['MORGAN STANLEY MTN', '61746BED4', 6.729757298761306E-4]
                            }, {
                                'data': ['MORGAN STANLEY MTN', '6174468B8', 3.042829921061019E-4]
                            }, {
                                'data': ['MORGAN STANLEY MTN', '61761J3R8', 0.0012730530136121788]
                            }, {
                                'data': ['MORGAN STANLEY MTN', '61746BDZ6', 3.711685930203936E-5]
                            }, {
                                'data': ['MOTOROLA SOLUTIONS INC', '620076BF5', 2.1001981789135384E-5]
                            }, {
                                'data': ['MPLX LP', '55336VAK6', 1.1239323442138907E-4]
                            }, {
                                'data': ['MYLAN INC', '628530BD8', 6.531619589606656E-5]
                            }, {
                                'data': ['MYLAN NV', '62854AAN4', 3.784307856773903E-5]
                            }, {
                                'data': ['NATIONAL AUSTRALIA BANK LTD (NEW Y', '63254AAV0', 9.347839535658337E-4]
                            }, {
                                'data': ['NBCUNIVERSAL ENTERPRISE INC 144A', '63946CAD0', 0.001117473720969215]
                            }, {
                                'data': ['NBCUNIVERSAL ENTERPRISE INC 144A', '63946CAG3', 6.357189382881069E-4]
                            }, {
                                'data': ['NBCUNIVERSAL MEDIA LLC', '63946BAD2', 1.1068438254658184E-4]
                            }, {
                                'data': ['NBCUNIVERSAL MEDIA LLC', '63946BAE0', 2.5424311834040765E-4]
                            }, {
                                'data': ['NEW YORK LIFE GLOBAL FUNDING 144A', '64952WBT9', 0.0017175300335847518]
                            }, {
                                'data': ['NEXTERA ENERGY CAPITAL HOLDINGS IN', '65339KAT7', 1.3746305542619317E-4]
                            }, {
                                'data': ['NOMURA HOLDINGS INC MTN', '65535HAG4', 3.1598517562281604E-5]
                            }, {
                                'data': ['NORFOLK SOUTHERN CORPORATION', '655844BS6', 2.9443522899704404E-5]
                            }, {
                                'data': ['NORTHROP GRUMMAN CORP', '666807BG6', 8.05878260363905E-5]
                            }, {
                                'data': ['NORTHROP GRUMMAN CORP', '666807BK7', 3.160304885362811E-5]
                            }, {
                                'data': ['NOVARTIS CAPITAL CORP', '66989HAK4', 4.137665370089908E-4]
                            }, {
                                'data': ['NOVARTIS CAPITAL CORP', '66989HAN8', 4.766581121951429E-4]
                            }, {
                                'data': ['NVIDIA CORPORATION', '67066GAE4', 1.5666629300873803E-5]
                            }, {
                                'data': ['OHIO ST UNIV GEN RCPTS', '677632MV0', 4.708922837171287E-5]
                            }, {
                                'data': ['ONE GAS INC', '68235PAE8', 1.7886883714889472E-4]
                            }, {
                                'data': ['ONTARIO (PROVINCE OF)', '68323ADY7', 9.07499949522527E-4]
                            }, {
                                'data': ['ORACLE CORP', '68389XAK1', 5.428115415809841E-4]
                            }, {
                                'data': ['ORACLE CORPORATION', '68389XBM6', 0.002190751389070252]
                            }, {
                                'data': ['ORACLE CORPORATION', '68389XBB0', 2.362002832259229E-4]
                            }, {
                                'data': ['ORACLE CORPORATION', '68389XBA2', 0.0013884475920309615]
                            }, {
                                'data': ['ORACLE CORPORATION', '68389XBC8', 6.319132956522343E-4]
                            }, {
                                'data': ['ORACLE CORPORATION', '68389XBL8', 1.63721385951874E-4]
                            }, {
                                'data': ['ORIX CORPORATION', '686330AH4', 9.376588615843361E-5]
                            }, {
                                'data': ['PACIFICORP', '695114CK2', 0.0012246528736987489]
                            }, {
                                'data': ['PACIFICORP', '695114CH9', 5.853751081512767E-4]
                            }, {
                                'data': ['PEPSICO INC', '713448DN5', 5.724304786031164E-4]
                            }, {
                                'data': ['PFIZER INC', '717081EA7', 3.4661707050865785E-4]
                            }, {
                                'data': ['PFIZER INC', '717081DV2', 3.0972631726071533E-4]
                            }, {
                                'data': ['PIONEER NATURAL RESOURCES COMPANY', '723787AK3', 1.962237916321195E-5]
                            }, {
                                'data': ['PIONEER NATURAL RESOURCES COMPANY', '723787AM9', 1.3367095468193527E-4]
                            }, {
                                'data': ['PLAINS ALL AMERICAN PIPELINE LP', '72650RAZ5', 2.3442309670899167E-5]
                            }, {
                                'data': ['PNC BANK NATIONAL ASSOCIATION', '69353RDD7', 0.0020143957554042665]
                            }, {
                                'data': ['PNC BANK NATIONAL ASSOCIATION MTN', '69353REW4', 7.789311439977001E-4]
                            }, {
                                'data': ['PRINCIPAL FINANCIAL GROUP INC', '74251VAM4', 1.562101169511576E-5]
                            }, {
                                'data': ['PRINCIPAL FINANCIAL GROUP INC', '74251VAH5', 2.0732554590989998E-5]
                            }, {
                                'data': ['PROGRESS ENERGY CAROLINAS INC', '144141CZ9', 5.707030694362162E-4]
                            }, {
                                'data': ['PUBLIC SERVICE ELECTRIC AND GAS CO', '74456QAX4', 2.7452542112074094E-4]
                            }, {
                                'data': ['PUBLIC SERVICE ELECTRIC AND GAS CO MTN', '74456QBG0', 8.62442398158474E-4]
                            }, {
                                'data': ['QUALCOMM INCORPORATED', '747525AP8', 1.797536921538067E-4]
                            }, {
                                'data': ['QUALCOMM INCORPORATED', '747525AF0', 4.2940144983715444E-4]
                            }, {
                                'data': ['QUEBEC (PROVINCE OF)', '748149AJ0', 3.195717339369481E-4]
                            }, {
                                'data': ['REALTY INCOME CORPORATION', '756109AS3', 4.481145064179959E-5]
                            }, {
                                'data': ['REPUBLIC SERVICES INC', '760759AR1', 2.307270242468119E-5]
                            }, {
                                'data': ['RESOLUTION FUNDING CORP', '76116FAG2', 0.0012177480470729348]
                            }, {
                                'data': ['RESOLUTION FUNDING CORP', '76116EHL7', 5.277611065080888E-4]
                            }, {
                                'data': ['REYNOLDS AMERICAN INC', '761713BF2', 3.2897219402047556E-5]
                            }, {
                                'data': ['REYNOLDS AMERICAN INC', '761713BG0', 5.0308282987352E-5]
                            }, {
                                'data': ['RFCSP STRIP PRINCIPAL', '76116FAD9', 9.137858497505625E-4]
                            }, {
                                'data': ['ROCK-TENN CO', '772739AL2', 1.9035142558038446E-5]
                            }, {
                                'data': ['ROCKWELL COLLINS INC.', '774341AH4', 7.923682303570868E-5]
                            }, {
                                'data': ['ROGERS COMMUNICATIONS INC', '775109BE0', 2.4166193532923904E-5]
                            }, {
                                'data': ['ROYAL BANK OF CANADA', '78011DAG9', 3.8520494102074694E-4]
                            }, {
                                'data': ['ROYAL BANK OF CANADA MTN', '78012KCB1', 5.022468110152695E-4]
                            }, {
                                'data': ['ROYAL BANK OF CANADA MTN', '78012KC62', 2.5119077507336095E-4]
                            }, {
                                'data': ['ROYAL BANK OF CANADA MTN', '78010USN8', 4.4738509197107796E-4]
                            }, {
                                'data': ['RPM INTERNATIONAL INC', '749685AV5', 1.609877715974665E-5]
                            }, {
                                'data': ['SABINE PASS LIQUEFACTION LLC', '785592AD8', 3.4842025034966233E-4]
                            }, {
                                'data': ['SAN DIEGO GAS & ELECTRIC CO', '797440BN3', 8.403610734529462E-4]
                            }, {
                                'data': ['SANTANDER UK GROUP HOLDINGS PLC', '80281LAC9', 1.5848943059840253E-5]
                            }, {
                                'data': ['SANTANDER UK GROUP HOLDINGS PLC MTN', '80281LAD7', 1.4268744709866211E-4]
                            }, {
                                'data': ['SANTANDER UK PLC', '80283LAJ2', 2.0896625482214057E-4]
                            }, {
                                'data': ['SANTANDER UK PLC', '80283LAN3', 1.970760194439161E-4]
                            }, {
                                'data': ['SANTANDER UK PLC MTN', '80283LAF0', 1.3933951276789934E-4]
                            }, {
                                'data': ['SHELL INTERNATIONAL FINANCE BV', '822582BD3', 5.155257864712236E-5]
                            }, {
                                'data': ['SHERWIN-WILLIAMS COMPANY (THE)', '824348AU0', 7.824191805730682E-5]
                            }, {
                                'data': ['SIMON PROPERTY GROUP LP', '828807CQ8', 0.0018847121255549618]
                            }, {
                                'data': ['SOUTHERN CALIFORNIA EDISON CO', '842400GC1', 6.356405427183121E-4]
                            }, {
                                'data': ['SPECTRA ENERGY PARTNERS LP', '84756NAH2', 6.223474430826021E-5]
                            }, {
                                'data': ['SPECTRA ENERGY PARTNERS LP', '84756NAD1', 8.600016175115512E-5]
                            }, {
                                'data': ['STATE STREET CORP', '857477AM5', 2.0906551116514678E-4]
                            }, {
                                'data': ['STATE STREET CORP', '857477AW3', 7.642047372720195E-5]
                            }, {
                                'data': ['STATE STREET CORP', '857477AS2', 0.0011651078095953902]
                            }, {
                                'data': ['STATE STREET CORP', '857477AV5', 2.3240508722035872E-5]
                            }, {
                                'data': ['STRYKER CORPORATION', '863667AN1', 1.623421035163973E-4]
                            }, {
                                'data': ['SYNCHRONY FINANCIAL', '87165BAE3', 1.7945486192103648E-4]
                            }, {
                                'data': ['SYNCHRONY FINANCIAL', '87165BAJ2', 5.4598250998582177E-5]
                            }, {
                                'data': ['TARGET CORPORATION', '87612EBE5', 5.38329531736312E-4]
                            }, {
                                'data': ['TBA 33 CENT CLAIMS         Prvt', 'BRSQ34E97', 4.914075139436248E-8]
                            }, {
                                'data': ['TEACHERS INSUR & ANNUITY   144A', '878091BC0', 1.3023262029218385E-5]
                            }, {
                                'data': ['TEACHERS INSURANCE AND ANNUITY ASS 144A', '878091BD8', 3.577269697383384E-5]
                            }, {
                                'data': ['TEVA PHARMACEUTICAL FINANCE COMPAN', '88165FAG7', 9.664884732798577E-5]
                            }, {
                                'data': ['TEVA PHARMACEUTICAL FINANCE NETHER', '88167AAD3', 9.475141113128448E-5]
                            }, {
                                'data': ['TEVA PHARMACEUTICAL FINANCE NETHER', '88167AAE1', 1.0002226823251347E-4]
                            }, {
                                'data': ['THERMO FISHER SCIENTIFIC INC', '883556BR2', 1.5360220295844753E-5]
                            }, {
                                'data': ['THERMO FISHER SCIENTIFIC INC', '883556BE1', 3.4295821488723136E-4]
                            }, {
                                'data': ['THERMO FISHER SCIENTIFIC INC', '883556BX9', 1.5437702325281257E-5]
                            }, {
                                'data': ['TIME WARNER INC', '887317BB0', 9.281050425318176E-5]
                            }, {
                                'data': ['TIME WARNER INC', '887317AZ8', 9.499476860136478E-6]
                            }, {
                                'data': ['TIME WARNER INC', '887317AW5', 2.9755343373430647E-5]
                            }, {
                                'data': ['TRAVELERS COMPANIES INC', '89417EAL3', 1.56850692193904E-5]
                            }, {
                                'data': ['TREASURY BOND', '912810RU4', 0.0012015543438662537]
                            }, {
                                'data': ['TREASURY BOND', '912810FT0', 5.976875520982669E-4]
                            }, {
                                'data': ['TREASURY BOND', '912810PT9', 1.359732803504523E-4]
                            }, {
                                'data': ['TREASURY BOND', '912810RM2', 1.6359054111175788E-4]
                            }, {
                                'data': ['TREASURY BOND', '912810QT8', 0.0015708716186430707]
                            }, {
                                'data': ['TREASURY BOND', '912810RH3', 6.07411765160795E-4]
                            }, {
                                'data': ['TREASURY BOND', '912810RQ3', 0.00147664774111955]
                            }, {
                                'data': ['TREASURY BOND', '912810QS0', 0.0016216737000403008]
                            }, {
                                'data': ['TREASURY BOND', '912810RN0', 3.249537569920434E-4]
                            }, {
                                'data': ['TREASURY BOND', '912810QE1', 2.3841549750027293E-4]
                            }, {
                                'data': ['TREASURY BOND (2OLD)', '912810RV2', 1.5920269810827575E-4]
                            }, {
                                'data': ['TREASURY BOND (OLD)', '912810RX8', 0.0012193711686382899]
                            }, {
                                'data': ['TREASURY NOTE', '912828N30', 0.003940149726391324]
                            }, {
                                'data': ['TREASURY NOTE', '912828W71', 0.006136250036342457]
                            }, {
                                'data': ['TREASURY NOTE', '912828VZ0', 0.013631029559603462]
                            }, {
                                'data': ['TREASURY NOTE', '912828X96', 0.044082639538785134]
                            }, {
                                'data': ['TREASURY NOTE', '912828XG0', 0.0076551386115178855]
                            }, {
                                'data': ['TREASURY NOTE', '912828ST8', 0.059196255317042305]
                            }, {
                                'data': ['TREASURY NOTE', '912828G87', 0.002122396214788887]
                            }, {
                                'data': ['TREASURY NOTE', '912828VV9', 0.010322629807522694]
                            }, {
                                'data': ['TREASURY NOTE', '912828XH8', 0.007853920463444752]
                            }, {
                                'data': ['TREASURY NOTE', '912828WZ9', 0.007859263846090148]
                            }, {
                                'data': ['TREASURY NOTE', '912828U24', 0.00534479852358756]
                            }, {
                                'data': ['TREASURY NOTE', '912828XQ8', 0.007502631433764761]
                            }, {
                                'data': ['TREASURY NOTE', '912828WS5', 0.03641870593501969]
                            }, {
                                'data': ['TREASURY NOTE', '912828VP2', 0.02411407442426137]
                            }, {
                                'data': ['TREASURY NOTE', '912828TJ9', 0.011160527630842477]
                            }, {
                                'data': ['TREASURY NOTE', '912828X21', 0.024561921397860755]
                            }, {
                                'data': ['TREASURY NOTE', '912828WW6', 0.04145258356160107]
                            }, {
                                'data': ['TREASURY NOTE', '912828U81', 0.011458073119776056]
                            }, {
                                'data': ['TREASURY NOTE', '912828R77', 0.01261000284066277]
                            }, {
                                'data': ['TREASURY NOTE', '912828X70', 0.002041429053958807]
                            }, {
                                'data': ['TREASURY NOTE (2OLD)', '912828XT2', 0.07426341443482093]
                            }, {
                                'data': ['TREASURY NOTE (2OLD)', '912828V98', 0.0076857146760099145]
                            }, {
                                'data': ['TREASURY NOTE (2OLD)', '912828XU9', 0.02283778393686814]
                            }, {
                                'data': ['TREASURY NOTE (OLD)', '912828XX3', 0.013016219350829977]
                            }, {
                                'data': ['TREASURY NOTE (OLD)', '912828XV7', 0.08356100569367453]
                            }, {
                                'data': ['TREASURY NOTE (OLD)', '912828X88', 0.012983658931570666]
                            }, {
                                'data': ['TREASURY NOTE (OLD)', '912828XW5', 0.08612579583355626]
                            }, {
                                'data': ['TREASURY NOTE (OTR)', '9128282Q2', 0.002994370859008686]
                            }, {
                                'data': ['TREASURY NOTE (OTR)', '9128282P4', 0.0055618483528044604]
                            }, {
                                'data': ['TREASURY NOTE (OTR)', '9128282R0', 0.005901567341571918]
                            }, {
                                'data': ['TREASURY NOTE (OTR)', '9128282N9', 0.001100325563225731]
                            }, {
                                'data': ['TREASURY NOTE (OTR)', '9128282K5', 0.0018650959376533245]
                            }, {
                                'data': ['TRINITY ACQUISITION PLC', '89641UAA9', 1.6509160525526046E-5]
                            }, {
                                'data': ['TYCO ELECTRONICS GROUP SA', '902133AR8', 4.030987987639991E-5]
                            }, {
                                'data': ['UBS GROUP FUNDING SWITZERLAND AG 144A', '90352JAA1', 6.403666098192548E-4]
                            }, {
                                'data': ['UNILEVER CAPITAL CORP', '904764AV9', 0.0013688821569575373]
                            }, {
                                'data': ['UNITED TECHNOLOGIES CORP', '913017BV0', 1.769170225974528E-4]
                            }, {
                                'data': ['UNITED TECHNOLOGIES CORPORATION', '913017CM9', 3.4154691273750366E-4]
                            }, {
                                'data': ['UNITED TECHNOLOGIES CORPORATION', '913017CR8', 4.3839392609899206E-4]
                            }, {
                                'data': ['UNITED TECHNOLOGIES CORPORATION', '913017BZ1', 0.002625012894294003]
                            }, {
                                'data': ['UNITED TECHNOLOGIES CORPORATION', '913017AS8', 1.4507368900976256E-4]
                            }, {
                                'data': ['UNITEDHEALTH GROUP INC', '91324PCV2', 9.367518910214743E-4]
                            }, {
                                'data': ['UNITEDHEALTH GROUP INC', '91324PCN0', 7.561960001586173E-4]
                            }, {
                                'data': ['UNITEDHEALTH GROUP INC', '91324PCP5', 4.935675161872118E-5]
                            }, {
                                'data': ['UNITEDHEALTH GROUP INC', '91324PCH3', 1.1984727219326725E-4]
                            }, {
                                'data': ['UNITEDHEALTH GROUP INC', '91324PCL4', 4.114128718838061E-4]
                            }, {
                                'data': ['UNITEDHEALTH GROUP INCORPORATED', '91324PBY7', 3.648803951957998E-4]
                            }, {
                                'data': ['US BANCORP MTN', '91159HHM5', 7.040789365426973E-5]
                            }, {
                                'data': ['US BANCORP MTN', '91159HHN3', 0.001916136209466355]
                            }, {
                                'data': ['US BANCORP MTN', '91159HHR4', 0.0010758818268947214]
                            }, {
                                'data': ['US BANK NATIONAL ASSOCIATION', '90331HML4', 9.88236842009767E-4]
                            }, {
                                'data': ['USAA CAPITAL CORP 144A', '903280AD7', 3.667957632902281E-4]
                            }, {
                                'data': ['VENTAS REALTY LP', '92277GAD9', 1.0476401348339466E-4]
                            }, {
                                'data': ['VERIZON COMMUNICATIONS INC', '92343VCC6', 5.55040527221826E-4]
                            }, {
                                'data': ['VERIZON COMMUNICATIONS INC', '92343VDY7', 2.2716930795886524E-4]
                            }, {
                                'data': ['VERIZON COMMUNICATIONS INC', '92343VDD3', 1.004580776525146E-4]
                            }, {
                                'data': ['VERIZON COMMUNICATIONS INC', '92343VCH5', 3.309650898215729E-5]
                            }, {
                                'data': ['VERIZON COMMUNICATIONS INC', '92343VBQ6', 3.6302980531468566E-4]
                            }, {
                                'data': ['VERIZON COMMUNICATIONS INC', '92343VDZ4', 8.355029187577174E-4]
                            }, {
                                'data': ['VIRGINIA ELEC & POWER CO', '927804FX7', 2.2882192702277897E-4]
                            }, {
                                'data': ['VIRGINIA ELECTRIC AND POWER COMPAN', '927804FU3', 3.952724474922023E-5]
                            }, {
                                'data': ['VIRGINIA ELECTRIC AND POWER COMPAN', '927804FV1', 1.5580117171857987E-5]
                            }, {
                                'data': ['VIRGINIA ELECTRIC AND POWER COMPAN', '927804FS8', 3.642907723436676E-4]
                            }, {
                                'data': ['VISA INC', '92826CAD4', 0.0020793178027612783]
                            }, {
                                'data': ['VISA INC', '92826CAC6', 2.462238511269411E-4]
                            }, {
                                'data': ['WAL-MART STORES INC', '931142DG5', 5.813841249852271E-5]
                            }, {
                                'data': ['WALGREENS BOOTS ALLIANCE INC', '931427AQ1', 4.6739678229217655E-5]
                            }, {
                                'data': ['WALGREENS BOOTS ALLIANCE INC', '931427AH1', 5.028070429675892E-5]
                            }, {
                                'data': ['WALT DISNEY CO MTN', '25468PDF0', 8.045635235063351E-5]
                            }, {
                                'data': ['WATSON PHARMACEUTICALS INC', '942683AF0', 2.3257619579877912E-4]
                            }, {
                                'data': ['WELLPOINT INC', '94973VBE6', 9.028590244224797E-4]
                            }, {
                                'data': ['WELLS FARGO & COMPANY', '949746SK8', 1.264912377493688E-4]
                            }, {
                                'data': ['WELLS FARGO & COMPANY', '949746SH5', 0.002427142766917215]
                            }, {
                                'data': ['WELLS FARGO & COMPANY', '949746SA0', 0.0013074553001352976]
                            }, {
                                'data': ['WELLS FARGO & COMPANY', '95000U2B8', 0.0027957874790045696]
                            }, {
                                'data': ['WELLS FARGO & COMPANY', '94974BFK1', 0.002236377216506957]
                            }, {
                                'data': ['WELLS FARGO & COMPANY', '949746RW3', 1.385321743872833E-4]
                            }, {
                                'data': ['WELLS FARGO & COMPANY MTN', '94974BFY1', 8.310127266708053E-4]
                            }, {
                                'data': ['WELLS FARGO & COMPANY MTN', '94974BGP9', 2.4402864528486626E-4]
                            }, {
                                'data': ['WELLS FARGO & COMPANY MTN', '94974BGL8', 0.0012679596704091474]
                            }, {
                                'data': ['WELLS FARGO & COMPANY MTN', '94974BGR5', 7.069255510309311E-4]
                            }, {
                                'data': ['WELLS FARGO & COMPANY MTN', '94974BGM6', 0.0014891902935483753]
                            }, {
                                'data': ['WELLS FARGO & COMPANY MTN', '95000U2A0', 7.54803922054662E-4]
                            }, {
                                'data': ['WILLIS NORTH AMERICA INC', '970648AF8', 1.347195420884033E-4]
                            }, {
                                'data': ['WISCONSIN ENERGY CORPORATION', '976657AK2', 3.378891705898287E-4]
                            }, {
                                'data': ['XILINX INC', '983919AJ0', 1.9700565860748587E-4]
                            }
                            ]
                        }, {
                            'title': 'CASH',
                            'data': [null, null, -0.23983449949425337],
                            'children': [{
                                'data': ['AUD CASH(Alpha Committed)', 'AUD_CCASH', -0.004171333649413287]
                            }, {
                                'data': ['AUD/USD', 'BRTCAB4MP', 0.004341793906062017]
                            }, {
                                'data': ['AUD/USD', 'BRTCAB4MR', -0.004326483354060087]
                            }, {
                                'data': ['CASH', 'USD_ICASH', 1.7246932824874624E-4]
                            }, {
                                'data': ['CNH CASH(Alpha Committed)', 'CNH_CCASH', -4.528194043051929E-10]
                            }, {
                                'data': ['EUR CASH(Alpha Committed)', 'EUR_CCASH', -5.043318082909622E-6]
                            }, {
                                'data': ['EUR/USD', 'BRTCAS6UR', -2.2606253949572034E-7]
                            }, {
                                'data': ['EUR/USD', 'BRTCAS7DP', -3.149652972844342E-5]
                            }, {
                                'data': ['EUR/USD', 'BRTC9G12R', 7.475428609525726E-8]
                            }, {
                                'data': ['EUR/USD', 'BRTCA4X1R', -2.888093852459028E-5]
                            }, {
                                'data': ['EUR/USD', 'BRTC9G12P', -7.50962201550443E-8]
                            }, {
                                'data': ['EUR/USD', 'BRTC9G1AR', 2.508358548696843E-5]
                            }, {
                                'data': ['EUR/USD', 'BRTCAS7DR', 3.135178771293164E-5]
                            }, {
                                'data': ['EUR/USD', 'BRTC9G1AP', -2.5236752728000702E-5]
                            }, {
                                'data': ['EUR/USD', 'BRTCA4WVP', 3.2587588983814606E-5]
                            }, {
                                'data': ['EUR/USD', 'BRTCA4X1P', 2.903712874631128E-5]
                            }, {
                                'data': ['EUR/USD', 'BRTCAS6UP', 2.2499010343451446E-7]
                            }, {
                                'data': ['EUR/USD', 'BRTCA4WVR', -3.2406809433005595E-5]
                            }, {
                                'data': ['GBP CASH(Alpha Committed)', 'GBP_CCASH', 1.9349089220629636E-7]
                            }, {
                                'data': ['GBP/USD', 'BRTCA4XXP', -1.8089569519348304E-9]
                            }, {
                                'data': ['GBP/USD', 'BRTCA4XJR', -5.9296419978039E-7]
                            }, {
                                'data': ['GBP/USD', 'BRTCAS7QP', -6.095891951076228E-10]
                            }, {
                                'data': ['GBP/USD', 'BRTCAS7QR', 6.09288019184136E-10]
                            }, {
                                'data': ['GBP/USD', 'BRTCA4XJP', 5.954221132444625E-7]
                            }, {
                                'data': ['GBP/USD', 'BRTCAS73P', -7.865077108619223E-7]
                            }, {
                                'data': ['GBP/USD', 'BRTCA4XXR', 1.7976002243707138E-9]
                            }, {
                                'data': ['GBP/USD', 'BRTCAS73R', 7.833717384740392E-7]
                            }, {
                                'data': ['HKD CASH(Alpha Committed)', 'HKD_CCASH', 0.003546231426682995]
                            }, {
                                'data': ['HKD/USD', 'BRTCAB90R', 0.0034863097456183526]
                            }, {
                                'data': ['HKD/USD', 'BRTC9QC9P', -5.4262491609279594E-5]
                            }, {
                                'data': ['HKD/USD', 'BRTC9QC9R', 5.424293808469747E-5]
                            }, {
                                'data': ['HKD/USD', 'BRTCAB90P', -0.0034879007555057517]
                            }, {
                                'data': ['INR CASH(Alpha Committed)', 'INR_CCASH', 7.374725031920697E-5]
                            }, {
                                'data': ['JPY CASH(Alpha Committed)', 'JPY_CCASH', 3.590023858117222E-5]
                            }, {
                                'data': ['KRW CASH(Alpha Committed)', 'KRW_CCASH', 8.121464211442055E-12]
                            }, {
                                'data': ['MYR CASH(Alpha Committed)', 'MYR_CCASH', 1.6661404646714357E-4]
                            }, {
                                'data': ['SGD CASH(Alpha Committed)', 'SGD_CCASH', 1.4068560806695761E-5]
                            }, {
                                'data': ['THB CASH(Alpha Committed)', 'THB_CCASH', 4.088017230800648E-5]
                            }, {
                                'data': ['TWD CASH(COMMITTED)', 'TWD_CCASH', 8.90836994018635E-5]
                            }, {
                                'data': ['USD CASH(Committed)', 'USD_CCASH', -0.23981104724078625]
                            }
                            ]
                        }, {
                            'title': 'CMBS',
                            'data': [null, null, 0.005865431209111131],
                            'children': [{
                                'data': ['BANK_17-BNK4   A4', '06541FBA6', 2.8575113268577854E-4]
                            }, {
                                'data': ['CD_07-CD5  AMA', '12514AAH4', 3.2286651594510196E-4]
                            }, {
                                'data': ['CD_17-CD3   A4', '12515GAD9', 1.8030405178052968E-4]
                            }, {
                                'data': ['CGCMT_14-GC21     AS', '17322MAY2', 2.819702475949522E-4]
                            }, {
                                'data': ['COMM_12-LC4   A4', '126192AD5', 8.043448960127178E-5]
                            }, {
                                'data': ['COMM_14-CR17   A5', '12631DBB8', 3.166397142607731E-4]
                            }, {
                                'data': ['COMM_14-CR18   A5', '12632QAX1', 1.730334195144242E-4]
                            }, {
                                'data': ['COMM_14-CR20   A4', '12592LBJ0', 1.0582043201917385E-4]
                            }, {
                                'data': ['COMM_15-CR25   A4', '12593PAW2', 1.3185526276445625E-4]
                            }, {
                                'data': ['COMM_15-DC1   A5', '12629NAF2', 2.1589260884178807E-4]
                            }, {
                                'data': ['CORE_15-TEXW    A 144A', '21870PAA5', 4.141130596205621E-4]
                            }, {
                                'data': ['FHMS_K066   A2', '3137F2LJ3', 1.2849805673666403E-4]
                            }, {
                                'data': ['FNMA_17-M1   A2', '3136AUG21', 4.2506856640489344E-4]
                            }, {
                                'data': ['GAHR_15-NRF AFL1 144A', '36143WAA9', 7.840361102495526E-5]
                            }, {
                                'data': ['GSMS_12-GCJ9   A3', '36192PAJ5', 8.675432392693534E-5]
                            }, {
                                'data': ['GSMS_13-GC12   A3', '36197XAJ3', 3.1572864795842035E-4]
                            }, {
                                'data': ['JPMBB_14-C18   A5', '46641JAW6', 1.677570081784664E-4]
                            }, {
                                'data': ['JPMCC_04-LN2   A2', '46625YCV3', 2.252108701438557E-6]
                            }, {
                                'data': ['JPMCC_13-C10   A2', '46639JAB6', 8.767588022769976E-5]
                            }, {
                                'data': ['LBUBS_07-C7   AM', '52109RBP5', 4.120487619868013E-4]
                            }, {
                                'data': ['MSBAM_15-C25   A5', '61765TAF0', 4.990633649227928E-4]
                            }, {
                                'data': ['WFCM_15-C30   A4', '94989NBE6', 8.179275571972694E-6]
                            }, {
                                'data': ['WFCM_16-NXS6   A4', '95000KBB0', 6.946879516306295E-5]
                            }, {
                                'data': ['WFRBS_13-C14   A4', '92890PAD6', 8.774508552280174E-5]
                            }, {
                                'data': ['WFRBS_13-C14  ASB', '92890PAF1', 5.558824952456004E-4]
                            }, {
                                'data': ['WFRBS_14-LC14   A3FL 144A', '96221TBC0', 4.322242929098147E-4]
                            }
                            ]
                        }, {
                            'title': 'CMO',
                            'data': [null, null, 0.008600798642247307],
                            'children': [{
                                'data': ['FHLMC_3743   PB', '3137GAHS9', 5.147988424921493E-4]
                            }, {
                                'data': ['FHLMC_3997   PB', '3137AMCQ8', 0.0015428044519575227]
                            }, {
                                'data': ['FNMA_10-136   CY', '31398STJ2', 6.676529868123894E-4]
                            }, {
                                'data': ['FNMA_11-112   PB', '3136A1G82', 0.0015524308746320673]
                            }, {
                                'data': ['FNMA_11-131   PB', '3136A2M67', 0.002710164498825207]
                            }, {
                                'data': ['FNMA_12-4C   NB', '3136A3Q79', 1.7548287975405132E-4]
                            }, {
                                'data': ['FNMA_14-2   PX', '3136AJBN5', 0.0012306012592500463]
                            }, {
                                'data': ['FNMA_16-64G   LD', '3136ATVD3', 2.0686284852387477E-4]
                            }
                            ]
                        }, {
                            'title': 'EQUITY',
                            'data': [null, null, 0.24939278481468327],
                            'children': [{
                                'data': ['ADVANCED INFO SERVICE NON-VOTING D', 'S64126097', 0.002272131387726578]
                            }, {
                                'data': ['AGL ENERGY LTD', 'SBSS7GP55', 0.002767167360438263]
                            }, {
                                'data': ['AIA GROUP LTD', 'SB4TX8S14', 7.489483721179007E-4]
                            }, {
                                'data': ['AJINOMOTO INC', 'S60109063', 0.0028033641573978183]
                            }, {
                                'data': ['ALIBABA GROUP HOLDING ADR REPRESEN', '01609W102', 0.003197416534812494]
                            }, {
                                'data': ['ALS LTD', 'BRSFHQFH8', 0.003049381606364478]
                            }, {
                                'data': ['ALUMINA LTD', 'S69549855', 0.0032454574924424442]
                            }, {
                                'data': ['ALUMINUM CORPORATION OF CHINA CORP', 'S64253958', 0.002605812003189392]
                            }, {
                                'data': ['AMMB HOLDINGS', 'S60470234', 0.0013310656229071215]
                            }, {
                                'data': ['AUSTRALIA AND NEW ZEALAND BANKING', 'S60655867', 0.005177789269695514]
                            }, {
                                'data': ['AXIS BANK LTD', 'SBPFJHC71', 0.0012266915245806836]
                            }, {
                                'data': ['BANDAI NAMCO HOLDINGS INC', 'SB0JDQD42', 0.002241564693750508]
                            }, {
                                'data': ['BANK NEGARA INDONESIA (PERSERO) OR', 'S67271213', 0.0036074766234321194]
                            }, {
                                'data': ['BANK OF CHINA LTD H', 'SB1545645', 0.004732587572129456]
                            }, {
                                'data': ['BHP BILLITON LTD', 'S61446902', 0.0037306807817436586]
                            }, {
                                'data': ['CALBEE INC', 'BRSBP26G3', 0.002095549810074612]
                            }, {
                                'data': ['CATHAY FINANCIAL HOLDING LTD', 'S64256639', 0.002989674166581545]
                            }, {
                                'data': ['CHINA LIFE INSURANCE LTD H', 'B0A0JPWY3', 0.002552822629450736]
                            }, {
                                'data': ['CHINA LONGYUAN POWER GROUP CORP LT', 'SB4Q2TX38', 0.001089214734942211]
                            }, {
                                'data': ['CHINA MOBILE LTD', 'S60735560', 0.004195122250683995]
                            }, {
                                'data': ['CHINA OILFIELD SERVICES LTD H', 'S65609950', 0.0016802239246783465]
                            }, {
                                'data': ['CHINA PETROLEUM AND CHEMICAL CORP', 'S62918198', 0.0025125163423666973]
                            }, {
                                'data': ['CHONGQING RURAL COMMERCIAL BANK LT', 'SB4Q1Y570', 0.0013455005549286136]
                            }, {
                                'data': ['CIKARANG LISTRINDO', 'BRT1T9YP4', 0.0012688891456447827]
                            }, {
                                'data': ['CITI DBS HOLDING PN 8FEB2018', 'BRSZWN965', 0.002444073742826272]
                            }, {
                                'data': ['CONCORDIA FINANCIAL GROUP LTD', 'SBD97JW75', 0.002467562633619094]
                            }, {
                                'data': ['CTBC FINANCIAL HOLDING CO LTD', 'S65276669', 0.0016315174848270167]
                            }, {
                                'data': ['CTCI CORP.', 'S62391875', 0.0012446806322011935]
                            }, {
                                'data': ['DB SHENZHEN AIRPORT CO PN 03172023', 'BRT1Y7BB8', 0.0017522937301089215]
                            }, {
                                'data': ['DBS GROUP HOLDINGS LTD', 'S61752036', 8.709718099418012E-4]
                            }, {
                                'data': ['DELTA ELECTRONICS INC.', 'S62607346', 0.003773308468722677]
                            }, {
                                'data': ['DENKI KAGAKU KOGYO', 'S63098206', 0.0053369656075334185]
                            }, {
                                'data': ['DOOSAN BOBCAT INC', 'BRT4YVWS9', 0.00488240432759657]
                            }, {
                                'data': ['FAIRFAX MEDIA LTD', 'S64670748', 0.002814717396303467]
                            }, {
                                'data': ['GRAINCORP LTD', 'S61023313', 0.002668013793013757]
                            }, {
                                'data': ['HITACHI METALS LTD', 'S64292014', 0.0033125823279258845]
                            }, {
                                'data': ['HOYA CORP', 'S64415060', 0.002955916582821295]
                            }, {
                                'data': ['HSBC HOLDINGS PLC', 'S61581633', 0.00309267383942636]
                            }, {
                                'data': ['ILUKA RESOURCES LTD', 'S69575751', 0.002799643356122088]
                            }, {
                                'data': ['INCITEC PIVOT LTD', 'S66730425', 0.0035003143650414806]
                            }, {
                                'data': ['INTL LEASE FIN', '459745600', 2.1632517567617084E-13]
                            }, {
                                'data': ['JASA MARGA (PERSERO)', 'SB28T1S79', 0.001083042324442079]
                            }, {
                                'data': ['JFE HOLDINGS INC', 'S65437923', 0.004691116029436256]
                            }, {
                                'data': ['JSR CORP', 'S64709868', 0.0030273137513872283]
                            }, {
                                'data': ['JSW ENERGY LTD', 'SB4X3ST88', 3.6904979468836284E-4]
                            }, {
                                'data': ['JXTG HOLDINGS INC', 'SB627LW99', 0.005435537814932587]
                            }, {
                                'data': ['KASIKORNBANK PUBLIC NON-VOTING DR', 'S63647663', 0.0033698477579098434]
                            }, {
                                'data': ['KOMATSU LTD', 'S64965841', 0.004570928419412279]
                            }, {
                                'data': ['KOSE CORP', 'S61944682', 0.0017159474554904336]
                            }, {
                                'data': ['KUMHO PETRO CHEMICAL LTD', 'S64993231', 0.0016344636226358735]
                            }, {
                                'data': ['KWEICHOW MOUTAI LTD A', 'SBP3R2F12', 0.0017163367521073748]
                            }, {
                                'data': ['KYUSHU RAILWAY', 'SBD2BST61', 0.0024214064985919872]
                            }, {
                                'data': ['LARGAN PRECISION LTD', 'S64516685', 0.004242850602012006]
                            }, {
                                'data': ['LI NING LTD', 'SB01JCK97', 8.719073340211841E-4]
                            }, {
                                'data': ['LIXIL VIVA CORP', 'SBYXWLY17', 0.001598358368046904]
                            }, {
                                'data': ['MEDIBANK PRIVATE LTD', 'BRSQ82VQ9', 0.0024093308918319923]
                            }, {
                                'data': ['METRO BANK & TRUST TRUST', 'S65144420', 0.0016211422900458056]
                            }, {
                                'data': ['MITSUBISHI HEAVY INDUSTRIES LTD', 'S65970675', 0.0023001887050597856]
                            }, {
                                'data': ['MITSUBISHI UFJ FINANCIAL GROUP ADR', '606822104', 6.853974961249431E-4]
                            }, {
                                'data': ['MITSUBISHI UFJ FINANCIAL GROUP INC', 'S63351712', 0.009577198411333651]
                            }, {
                                'data': ['MURATA MANUFACTURING LTD', 'S66104035', 0.0036917471690255657]
                            }, {
                                'data': ['NTPC LTD', 'SB037HF18', 0.00355748086419967]
                            }, {
                                'data': ['OMRON CORP', 'S66594284', 0.0034134438630723683]
                            }, {
                                'data': ['ORIX CORP', 'S66611443', 0.0051452592197641115]
                            }, {
                                'data': ['PERUSAHAAN GAS NEGARA (PERSERO) OR', 'S67197640', 9.647929362036058E-4]
                            }, {
                                'data': ['PIGEON CORP', 'S66880808', 0.002232080575564208]
                            }, {
                                'data': ['POSCO', 'S66932336', 0.005073758883403147]
                            }, {
                                'data': ['PROJECT DASH A-17 Prvt', 'BRSUMDQT0', 0.002321079569563244]
                            }, {
                                'data': ['PROJECT DASH A-18', 'BRT1T4T30', 9.500699330545882E-4]
                            }, {
                                'data': ['PURE GOLD PRICE CLUB INC', 'SB725S298', 0.0013759134549611873]
                            }, {
                                'data': ['QBE INSURANCE GROUP LTD', 'S67157404', 0.0026501495065756374]
                            }, {
                                'data': ['ROHM LTD', 'S67472043', 0.003029773891108362]
                            }, {
                                'data': ['RYOHIN KEIKAKU LTD', 'S67584557', 0.002570566447252287]
                            }, {
                                'data': ['SAMSUNG ELECTRONICS LTD', 'S67717207', 0.008741669300990408]
                            }, {
                                'data': ['SCSK CORP', 'S68584747', 0.0020012048495758115]
                            }, {
                                'data': ['SEMICONDUCTOR MANUFACTURING INTERN', 'SBDFBM132', 2.988834972332893E-4]
                            }, {
                                'data': ['SEVEN & I HOLDINGS LTD', 'SB0FS5D65', 0.0030407452755806196]
                            }, {
                                'data': ['SHINHAN FINANCIAL GROUP LTD', 'S63975023', 0.004717317023489061]
                            }, {
                                'data': ['SHIONOGI LTD', 'S68046820', 0.0013023140999683523]
                            }, {
                                'data': ['SKYLARK LTD', 'SBQQD1674', 0.0012263628773050025]
                            }, {
                                'data': ['SOFTBANK GROUP CORP', 'S67706200', 0.004149472937822321]
                            }, {
                                'data': ['TAIHEIYO CEMENT CORP', 'S66602046', 0.004921733161192601]
                            }, {
                                'data': ['TAISEI CORP', 'S68701002', 0.0017167861394862744]
                            }, {
                                'data': ['TAIWAN SEMICONDUCTOR MANUFACTURING', 'S68891068', 0.004196633836525803]
                            }, {
                                'data': ['TATA MOTORS LTD', 'BRSCUC384', 0.003431329133943309]
                            }, {
                                'data': ['TENCENT HOLDINGS LTD', 'SBMMV2K87', 0.006386184043637287]
                            }, {
                                'data': ['THK LTD', 'S68691310', 0.0026996538922787953]
                            }, {
                                'data': ['TOYOTA MOTOR CORP', 'S69006435', 0.0010415309026882706]
                            }, {
                                'data': ['YES BANK LTD', 'SB06LL921', 0.0011887945493799046]
                            }
                            ]
                        }, {
                            'title': 'FUND',
                            'data': [null, null, 0.018504673258628968],
                            'children': [{
                                'data': ['AIM SHORT TERM INV GOV CL INSTI', '825252885', 0.0015524018577001103]
                            }, {
                                'data': ['JPMORGAN 100% US TRS SEC CL CAP', '4812A0375', 0.011966530388500395]
                            }, {
                                'data': ['SSB INSTITUTIONAL INVESTMENT TRUST', 'BRT7F5BB0', 0.004985741012428463]
                            }
                            ]
                        }, {
                            'title': 'IBND',
                            'data': [null, null, 0.005171184102518168],
                            'children': [{
                                'data': ['TREASURY (CPI) NOTE', '912828V49', 0.005171184102518168]
                            }
                            ]
                        }, {
                            'title': 'MBS',
                            'data': [null, null, 0.062374736894510875],
                            'children': [{
                                'data': ['FGOLD 15YR 2.5% LLB 85K 2015', 'R1524B2XC', 2.7932680417596404E-5]
                            }, {
                                'data': ['FGOLD 15YR 2.5% MLB 110K 2015', 'R1524B3XC', 1.2587471602676722E-4]
                            }, {
                                'data': ['FGOLD 15YR 2.5% MLB 125K 2015', 'R1524B4XC', 4.814588442481291E-5]
                            }, {
                                'data': ['FGOLD 15YR 3% LLB 85K 2015', 'R1530B2XC', 6.010356510530068E-6]
                            }, {
                                'data': ['FGOLD 15YR 3.5% HLB 150K 2015', 'R1534B5XC', 8.904583888733935E-5]
                            }, {
                                'data': ['FGOLD 15YR 3.5% HLB 150K 2016', 'R1534B5XD', 1.672898784797269E-5]
                            }, {
                                'data': ['FGOLD 15YR 3.5% MLB 125K 2016', 'R1534B4XD', 6.30413666638733E-6]
                            }, {
                                'data': ['FGOLD 30YR 1999 PRODUCTION', 'FG083230K', 2.278576753017323E-6]
                            }, {
                                'data': ['FGOLD 30YR 2000 PRODUCTION', 'FG083230L', 3.8422832829927213E-5]
                            }, {
                                'data': ['FGOLD 30YR 2001 PRODUCTION', 'FG073230M', 7.423733445616077E-5]
                            }, {
                                'data': ['FGOLD 30YR 2001 PRODUCTION', 'FG080030M', 3.6496923022603133E-6]
                            }, {
                                'data': ['FGOLD 30YR 2007 PRODUCTION', 'FG053230T', 1.9907207754555947E-4]
                            }, {
                                'data': ['FGOLD 30YR 2009 PRODUCTION', 'FG043230V', 1.0652396221273972E-5]
                            }, {
                                'data': ['FGOLD 30YR 2010 PRODUCTION', 'FG040030W', 1.8572027328837826E-4]
                            }, {
                                'data': ['FGOLD 30YR 2010 PRODUCTION', 'FG033230W', 5.993317019520927E-5]
                            }, {
                                'data': ['FGOLD 30YR 2011 PRODUCTION', 'FG040030X', 1.1546596924142015E-6]
                            }, {
                                'data': ['FGOLD 30YR 2011 PRODUCTION', 'FG043230X', 6.771407450407267E-5]
                            }, {
                                'data': ['FGOLD 30YR 2011 PRODUCTION', 'FG050030X', 2.6421159476548836E-4]
                            }, {
                                'data': ['FGOLD 30YR 2012 PRODUCTION', 'FG033230Z', 5.3212528037969366E-5]
                            }, {
                                'data': ['FGOLD 30YR 2013 PRODUCTION', 'FG030030A', 4.402133875138761E-4]
                            }, {
                                'data': ['FGOLD 30YR 2015 PRODUCTION', 'FG030030C', 0.003593192981313313]
                            }, {
                                'data': ['FGOLD 30YR 2016 PRODUCTION', 'FG030030D', 0.0017031398143293678]
                            }, {
                                'data': ['FGOLD 30YR 3% HLB 150K 2012', 'R3030B5XZ', 1.5890236000527184E-4]
                            }, {
                                'data': ['FGOLD 30YR 3% HLB 150K 2013', 'R3030B5XA', 4.5097600403142614E-4]
                            }, {
                                'data': ['FGOLD 30YR 3% HLB 150K 2016', 'R3030B5XD', 5.1702626266314206E-5]
                            }, {
                                'data': ['FGOLD 30YR 3% LLB 85K 2016', 'R3030B2XD', 1.3146984161171333E-5]
                            }, {
                                'data': ['FGOLD 30YR 3% M 90-95 LTV 2013', 'R3030M4XA', 1.0367399273797147E-4]
                            }, {
                                'data': ['FGOLD 30YR 3% MLB 110K 2016', 'R3030B3XD', 2.1798169584402653E-5]
                            }, {
                                'data': ['FGOLD 30YR 3% MLB 125K 2016', 'R3030B4XD', 2.3089708838176543E-4]
                            }, {
                                'data': ['FGOLD 30YR 3% SHLB 175K 2012', 'R3030B6XZ', 1.0962133957603882E-4]
                            }, {
                                'data': ['FGOLD 30YR 3% SHLB 175K 2016', 'R3030B6XD', 1.0429524944660335E-4]
                            }, {
                                'data': ['FGOLD 30YR 3.5% 100% NY 2013', 'R3034NYXA', 1.4521610671327725E-5]
                            }, {
                                'data': ['FGOLD 30YR 3.5% FICO <700 2012', 'R3034FIXZ', 1.830996728705219E-5]
                            }, {
                                'data': ['FGOLD 30YR 3.5% HLB 150K 2012', 'R3034B5XZ', 1.7789921067057973E-5]
                            }, {
                                'data': ['FGOLD 30YR 3.5% Investor 2012', 'R3034INXZ', 5.803434030094129E-5]
                            }, {
                                'data': ['FGOLD 30YR 3.5% LLB 85K 2015', 'R3034B2XC', 6.705032029478555E-6]
                            }, {
                                'data': ['FGOLD 30YR 3.5% MLB 110K 2011', 'R3034B3XX', 1.0445448255886949E-4]
                            }, {
                                'data': ['FGOLD 30YR 3.5% MLB 110K 2017', 'R3034B3XE', 1.1918666639006678E-4]
                            }, {
                                'data': ['FGOLD 30YR 3.5% SHLB 175K 2015', 'R3034B6XC', 1.9674062773750273E-4]
                            }, {
                                'data': ['FGOLD 30YR 4% LLB 85K 2015', 'R3040B2XC', 1.1180679248176244E-5]
                            }, {
                                'data': ['FGOLD 30YR 4% MLB 110K 2015', 'R3040B3XC', 1.3508031681181887E-5]
                            }, {
                                'data': ['FGOLD 30YR 4% SHLB 175K 2015', 'R3040B6XC', 7.290307481496622E-5]
                            }, {
                                'data': ['FGOLD 30YR 4% SHLB 175K 2016', 'R3040B6XD', 1.452888162308401E-4]
                            }, {
                                'data': ['FGOLD 30YR 4.5% Investor 2014', 'R3044INXB', 2.025071240897811E-4]
                            }, {
                                'data': ['FGOLD 30YR 4.5% M 100-105 LTV 2012', 'R3044M2XZ', 8.620036435002455E-5]
                            }, {
                                'data': ['FGOLD 30YR TBA(REG A)', 'BRTBFBUN1', -0.005630257150478393]
                            }, {
                                'data': ['FGOLD 30YR TBA(REG A)', 'BRTB8M8D2', -1.8115810352259322E-4]
                            }, {
                                'data': ['FGOLD 30YR TBA(REG A)', 'BRTB3VUN0', 0.0029421683623341095]
                            }, {
                                'data': ['FNMA  15YR 2005 PRODUCTION', 'FN053215R', 5.481977788095077E-5]
                            }, {
                                'data': ['FNMA  30YR 1998 PRODUCTION', 'FN070030J', 1.251862255248123E-5]
                            }, {
                                'data': ['FNMA  30YR 1999 PRODUCTION', 'FN080030K', 3.438614322901824E-5]
                            }, {
                                'data': ['FNMA  30YR 2000 PRODUCTION', 'FN080030L', 9.720395178012773E-6]
                            }, {
                                'data': ['FNMA  30YR 2000 PRODUCTION', 'FN083230L', 3.923987864727812E-4]
                            }, {
                                'data': ['FNMA  30YR 2001 PRODUCTION', 'FN080030M', 4.461283897456204E-5]
                            }, {
                                'data': ['FNMA  30YR 2001 PRODUCTION', 'FN070030M', 7.947787102158807E-5]
                            }, {
                                'data': ['FNMA  30YR 2003 PRODUCTION', 'FN050030P', 6.743926906323662E-4]
                            }, {
                                'data': ['FNMA  30YR 2004 PRODUCTION', 'FN053230Q', 5.932080980313469E-4]
                            }, {
                                'data': ['FNMA  30YR 2004 PRODUCTION', 'FN050030Q', 1.484459354030033E-4]
                            }, {
                                'data': ['FNMA  30YR 2005 PRODUCTION', 'FN060030R', 3.4985000084979644E-4]
                            }, {
                                'data': ['FNMA  30YR 2007 PRODUCTION', 'FN060030T', 1.1465829527667672E-4]
                            }, {
                                'data': ['FNMA  30YR 2008 PRODUCTION', 'FN060030U', 1.3928290667073836E-5]
                            }, {
                                'data': ['FNMA  30YR TBA(REG A)', 'BRTAXY8W8', 0.0033608808620152375]
                            }, {
                                'data': ['FNMA  30YR TBA(REG A)', 'BRTBBTR42', -6.761562702922812E-4]
                            }, {
                                'data': ['FNMA  30YR TBA(REG A)', 'BRTBJ0W33', -1.645798760341331E-4]
                            }, {
                                'data': ['FNMA  30YR TBA(REG A)', 'BRTB12H43', -7.147588695185646E-4]
                            }, {
                                'data': ['FNMA  30YR TBA(REG A)', 'BRTAWXWP9', -0.0014489081481407313]
                            }, {
                                'data': ['FNMA 15YR 2.5% HLB 150K 2015', 'F1524B5XC', 8.631147125847001E-5]
                            }, {
                                'data': ['FNMA 15YR 2.5% HLB 150K 2016', 'F1524B5XD', 1.2455364670571133E-5]
                            }, {
                                'data': ['FNMA 15YR 2.5% HLB 150K 2017', 'F1524B5XE', 3.954197620206226E-5]
                            }, {
                                'data': ['FNMA 15YR 2.5% LLB 85K 2015', 'F1524B2XC', 1.4138212256025125E-5]
                            }, {
                                'data': ['FNMA 15YR 2.5% LLB 85K 2016', 'F1524B2XD', 4.8415659090832647E-4]
                            }, {
                                'data': ['FNMA 15YR 2.5% LLB 85K 2017', 'F1524B2XE', 3.2267360884915E-5]
                            }, {
                                'data': ['FNMA 15YR 2.5% MLB 110K 2015', 'F1524B3XC', 5.8555518499902055E-5]
                            }, {
                                'data': ['FNMA 15YR 2.5% MLB 110K 2016', 'F1524B3XD', 3.447203119436381E-4]
                            }, {
                                'data': ['FNMA 15YR 2.5% MLB 110K 2017', 'F1524B3XE', 2.5332509088313952E-5]
                            }, {
                                'data': ['FNMA 15YR 2.5% MLB 125K 2015', 'F1524B4XC', 2.24764615838351E-5]
                            }, {
                                'data': ['FNMA 15YR 2.5% MLB 125K 2016', 'F1524B4XD', 2.1741188167514466E-4]
                            }, {
                                'data': ['FNMA 15YR 2.5% MLB 125K 2017', 'F1524B4XE', 2.052888378767517E-5]
                            }, {
                                'data': ['FNMA 15YR 2.5% SHLB 175K 2015', 'F1524B6XC', 3.109699797926623E-5]
                            }, {
                                'data': ['FNMA 15YR 2.5% SHLB 175K 2017', 'F1524B6XE', 4.200699643367985E-5]
                            }, {
                                'data': ['FNMA 15YR 2009 PRODUCTION', 'FN040015V', 3.5285217938941756E-4]
                            }, {
                                'data': ['FNMA 15YR 2011 PRODUCTION', 'FN040015X', 1.5946473984418847E-4]
                            }, {
                                'data': ['FNMA 15YR 2016 PRODUCTION', 'FN023215D', 1.0288997908441093E-4]
                            }, {
                                'data': ['FNMA 15YR 2016 PRODUCTION', 'FN033215D', 8.018183878273605E-5]
                            }, {
                                'data': ['FNMA 15YR 3% HLB 150K 2015', 'F1530B5XC', 1.8986773224614737E-4]
                            }, {
                                'data': ['FNMA 15YR 3% HLB 150K 2016', 'F1530B5XD', 5.9054273477683E-4]
                            }, {
                                'data': ['FNMA 15YR 3% LLB 85K 2014', 'F1530B2XB', 1.0813595574260547E-4]
                            }, {
                                'data': ['FNMA 15YR 3% LLB 85K 2015', 'F1530B2XC', 6.0794607982565566E-5]
                            }, {
                                'data': ['FNMA 15YR 3% MLB 110K 2014', 'F1530B3XB', 3.0282439658838587E-4]
                            }, {
                                'data': ['FNMA 15YR 3% MLB 110K 2015', 'F1530B3XC', 9.865493430197629E-5]
                            }, {
                                'data': ['FNMA 15YR 3% SHLB 175K 2016', 'F1530B6XD', 1.3795821935207178E-4]
                            }, {
                                'data': ['FNMA 15YR 3.5% HLB 150K 2015', 'F1534B5XC', 7.217578761878339E-6]
                            }, {
                                'data': ['FNMA 15YR 3.5% LLB 85K 2014', 'F1534B2XB', 3.159604234548605E-4]
                            }, {
                                'data': ['FNMA 15YR 3.5% LLB 85K 2015', 'F1534B2XC', 3.2522263864763973E-5]
                            }, {
                                'data': ['FNMA 15YR 3.5% MLB 110K 2011', 'F1534B3XX', 2.5852650078513306E-4]
                            }, {
                                'data': ['FNMA 15YR 3.5% MLB 110K 2014', 'F1534B3XB', 1.0130954437804476E-4]
                            }, {
                                'data': ['FNMA 15YR 3.5% MLB 110K 2016', 'F1534B3XD', 2.1802766601858266E-5]
                            }, {
                                'data': ['FNMA 15YR 3.5% SHLB 175K 2014', 'F1534B6XB', 6.353642085694072E-5]
                            }, {
                                'data': ['FNMA 20YR 2016 PRODUCTION', 'FN030020D', 1.456440814521399E-4]
                            }, {
                                'data': ['FNMA 30YR 2007 PRODUCTION', 'FN063230T', 9.645860751273211E-5]
                            }, {
                                'data': ['FNMA 30YR 2009 PRODUCTION', 'FN043230V', 1.8047826662796323E-4]
                            }, {
                                'data': ['FNMA 30YR 2009 PRODUCTION', 'FN040030V', 4.7264652782024514E-5]
                            }, {
                                'data': ['FNMA 30YR 2010 PRODUCTION', 'FN043230W', 5.400138509528941E-4]
                            }, {
                                'data': ['FNMA 30YR 2010 PRODUCTION', 'FN040030W', 0.0016832136136591233]
                            }, {
                                'data': ['FNMA 30YR 2011 PRODUCTION', 'FN043230X', 0.001094950191739682]
                            }, {
                                'data': ['FNMA 30YR 2011 PRODUCTION', 'FN040030X', 5.902351112042434E-4]
                            }, {
                                'data': ['FNMA 30YR 2011 PRODUCTION', 'FN033230X', 4.921478988386632E-4]
                            }, {
                                'data': ['FNMA 30YR 2011 PRODUCTION', 'FN050030X', 4.6150533667701593E-4]
                            }, {
                                'data': ['FNMA 30YR 2012 PRODUCTION', 'FN033230Z', 4.452924346174442E-5]
                            }, {
                                'data': ['FNMA 30YR 2012 PRODUCTION', 'FN040030Z', 0.006966515764370087]
                            }, {
                                'data': ['FNMA 30YR 2013 PRODUCTION', 'FN033230A', 6.408171512350535E-5]
                            }, {
                                'data': ['FNMA 30YR 2013 PRODUCTION', 'FN030030A', 1.0589314494363542E-4]
                            }, {
                                'data': ['FNMA 30YR 2014 PRODUCTION', 'FN040030B', 4.6557746483733004E-5]
                            }, {
                                'data': ['FNMA 30YR 2016 PRODUCTION', 'FN030030D', 0.004048022860309113]
                            }, {
                                'data': ['FNMA 30YR 3% FICO <660 2016', 'F3030FIXD', 2.669065618669767E-5]
                            }, {
                                'data': ['FNMA 30YR 3% HLB 150K 2012', 'F3030B5XZ', 7.127720784866322E-4]
                            }, {
                                'data': ['FNMA 30YR 3% HLB 150K 2016', 'F3030B5XD', 1.884794124265348E-4]
                            }, {
                                'data': ['FNMA 30YR 3% LLB 85K 2013', 'F3030B2XA', 1.078314408800874E-4]
                            }, {
                                'data': ['FNMA 30YR 3% LLB 85K 2016', 'F3030B2XD', 3.3078087763342306E-5]
                            }, {
                                'data': ['FNMA 30YR 3% M 80-90 LTV 2013', 'F3030M5XA', 2.2962907275773578E-5]
                            }, {
                                'data': ['FNMA 30YR 3% M 90-95 LTV 2013', 'F3030M4XA', 9.182982405786358E-5]
                            }, {
                                'data': ['FNMA 30YR 3% M 95-100 LTV 2013', 'F3030M3XA', 1.8787824618674953E-4]
                            }, {
                                'data': ['FNMA 30YR 3% MLB 110K 2012', 'F3030B3XZ', 3.556214717023594E-4]
                            }, {
                                'data': ['FNMA 30YR 3% MLB 110K 2013', 'F3030B3XA', 9.055503955940475E-4]
                            }, {
                                'data': ['FNMA 30YR 3% MLB 110K 2016', 'F3030B3XD', 1.706831698376888E-4]
                            }, {
                                'data': ['FNMA 30YR 3% MLB 125K 2013', 'F3030B4XA', 2.600914504796701E-4]
                            }, {
                                'data': ['FNMA 30YR 3% MLB 125K 2016', 'F3030B4XD', 3.642850981906346E-4]
                            }, {
                                'data': ['FNMA 30YR 3% SHLB 175K 2016', 'F3030B6XD', 1.9571624230836114E-4]
                            }, {
                                'data': ['FNMA 30YR 3.5% FICO <660 2016', 'F3034FIXD', 0.007773023532972982]
                            }, {
                                'data': ['FNMA 30YR 3.5% HLB 150K 2016', 'F3034B5XD', 1.73318654201082E-4]
                            }, {
                                'data': ['FNMA 30YR 3.5% Investor 2013', 'F3034INXA', 2.9050921694511473E-6]
                            }, {
                                'data': ['FNMA 30YR 3.5% LLB 85K 2012', 'F3034B2XZ', 3.2386653275758297E-4]
                            }, {
                                'data': ['FNMA 30YR 3.5% LLB 85K 2013', 'F3034B2XA', 2.1961810365005976E-4]
                            }, {
                                'data': ['FNMA 30YR 3.5% LLB 85K 2016', 'F3034B2XD', 3.8648155851382865E-4]
                            }, {
                                'data': ['FNMA 30YR 3.5% M 100-105 LTV 2012', 'F3034M2XZ', 4.8000135355920484E-5]
                            }, {
                                'data': ['FNMA 30YR 3.5% M 80-90 LTV 2012', 'F3034M5XZ', 6.13577174726152E-5]
                            }, {
                                'data': ['FNMA 30YR 3.5% M 90-95 LTV 2012', 'F3034M4XZ', 1.735441286323726E-5]
                            }, {
                                'data': ['FNMA 30YR 3.5% MLB 110K 2016', 'F3034B3XD', 3.5773476016508356E-4]
                            }, {
                                'data': ['FNMA 30YR 3.5% MLB 110K 2017', 'F3034B3XE', 3.9773297793026377E-5]
                            }, {
                                'data': ['FNMA 30YR 3.5% MLB 125K 2013', 'F3034B4XA', 4.2044790373824164E-4]
                            }, {
                                'data': ['FNMA 30YR 3.5% MLB 125K 2014', 'F3034B4XB', 1.0492065268681431E-4]
                            }, {
                                'data': ['FNMA 30YR 3.5% MLB 125K 2016', 'F3034B4XD', 1.4518770129898665E-4]
                            }, {
                                'data': ['FNMA 30YR 3.5% SHLB 175K 2012', 'F3034B6XZ', 2.057437382490417E-5]
                            }, {
                                'data': ['FNMA 30YR 3.5% SHLB 175K 2013', 'F3034B6XA', 5.6444954334804165E-5]
                            }, {
                                'data': ['FNMA 30YR 3.5% SHLB 175K 2015', 'F3034B6XC', 4.1787521346834056E-4]
                            }, {
                                'data': ['FNMA 30YR 3.5% SHLB 175K 2016', 'F3034B6XD', 3.248508690049376E-4]
                            }, {
                                'data': ['FNMA 30YR 3.5% SHLB 175K 2017', 'F3034B6XE', 1.5138537365558473E-5]
                            }, {
                                'data': ['FNMA 30YR 4% Investor 2012', 'F3040INXZ', 9.210327155816777E-5]
                            }, {
                                'data': ['FNMA 30YR 4% LLB 85K 2011', 'F3040B2XX', 2.612369121340715E-4]
                            }, {
                                'data': ['FNMA 30YR 4% LLB 85K 2012', 'F3040B2XZ', 7.045013951421618E-5]
                            }, {
                                'data': ['FNMA 30YR 4% LLB 85K 2013', 'F3040B2XA', 4.272731412350677E-4]
                            }, {
                                'data': ['FNMA 30YR 4% LLB 85K 2015', 'F3040B2XC', 8.022217904277035E-5]
                            }, {
                                'data': ['FNMA 30YR 4% LLB 85K 2016', 'F3040B2XD', 5.393535933188797E-4]
                            }, {
                                'data': ['FNMA 30YR 4% M 100-105 LTV 2015', 'F3040M2XC', 1.8731798519290298E-4]
                            }, {
                                'data': ['FNMA 30YR 4% M 105-125 LTV 2010', 'F3040M1XW', 1.890162535190429E-5]
                            }, {
                                'data': ['FNMA 30YR 4% MLB 110K 2015', 'F3040B3XC', 2.3395635694564522E-4]
                            }, {
                                'data': ['FNMA 30YR 4% MLB 125K 2015', 'F3040B4XC', 1.6440699558045363E-4]
                            }, {
                                'data': ['FNMA 30YR 4% MLB 125K 2016', 'F3040B4XD', 6.739999925906714E-4]
                            }, {
                                'data': ['FNMA 30YR 4% SHLB 175K 2012', 'F3040B6XZ', 3.663959793880977E-5]
                            }, {
                                'data': ['FNMA 30YR 4% SHLB 175K 2016', 'F3040B6XD', 5.128438480177961E-5]
                            }, {
                                'data': ['FNMA 30YR 4% SHLB 175K 2017', 'F3040B6XE', 6.570744396811557E-5]
                            }, {
                                'data': ['FNMA 30YR 4.5% SHLB 175K 2015', 'F3044B6XC', 5.1589431653312395E-6]
                            }, {
                                'data': ['FNMA 30YR 6.0% HLB 150K 2007', 'F3060B5XT', 2.9062581128462653E-5]
                            }, {
                                'data': ['FNMA 40YR 4.0% REPERFORMING MLB 12', 'F4040B4I0', 0.004843838317737069]
                            }, {
                                'data': ['GNMA  30YR 2003 PRODUCTION', 'GN050030P', 4.610996747554186E-5]
                            }, {
                                'data': ['GNMA  30YR 2003 PRODUCTION', 'GN043230P', 3.594498702761013E-5]
                            }, {
                                'data': ['GNMA  30YR 2005 PRODUCTION', 'GN050030R', 1.6500649704675563E-4]
                            }, {
                                'data': ['GNMA 30YR 2009 PRODUCTION', 'GN050030V', 1.1976354329573182E-4]
                            }, {
                                'data': ['GNMA 30YR 2009 PRODUCTION', 'GN043230V', 2.590214962525611E-5]
                            }, {
                                'data': ['GNMA 30YR 2010 PRODUCTION', 'GN043230W', 2.94476782475812E-4]
                            }, {
                                'data': ['GNMA 30YR 2010 PRODUCTION', 'GN050030W', 6.839379067605353E-5]
                            }, {
                                'data': ['GNMA 30YR 2011 PRODUCTION', 'GN040030X', 9.135455850457322E-5]
                            }, {
                                'data': ['GNMA 30YR 2011 PRODUCTION', 'GN043230X', 8.291839329423956E-5]
                            }, {
                                'data': ['GNMA 30YR 3.5% SHLB 175K 2016', 'G3034B6XD', 3.245991290011693E-5]
                            }, {
                                'data': ['GNMA2 30YR', 'H3034B5XD', 3.842718893593732E-5]
                            }, {
                                'data': ['GNMA2 30YR', 'H3034B3XD', 1.5422144460397728E-5]
                            }, {
                                'data': ['GNMA2 30YR', 'H3034B4XD', 1.3368625505402577E-5]
                            }, {
                                'data': ['GNMA2 30YR', 'H3034B2XD', 1.578375101695026E-5]
                            }, {
                                'data': ['GNMA2 30YR 2009 PRODUCTION', 'G2043230V', 3.7119019680062777E-6]
                            }, {
                                'data': ['GNMA2 30YR 2009 PRODUCTION', 'G2050030V', 5.322709475563807E-5]
                            }, {
                                'data': ['GNMA2 30YR 2010 PRODUCTION', 'G2043230W', 5.186772092892538E-5]
                            }, {
                                'data': ['GNMA2 30YR 2010 PRODUCTION', 'G2040030W', 5.082386690301297E-4]
                            }, {
                                'data': ['GNMA2 30YR 2011 PRODUCTION', 'G2050030X', 2.175442974442351E-5]
                            }, {
                                'data': ['GNMA2 30YR 2011 PRODUCTION', 'G2043230X', 2.2222080234626435E-4]
                            }, {
                                'data': ['GNMA2 30YR 2011 PRODUCTION', 'G2033230X', 1.592504166052801E-4]
                            }, {
                                'data': ['GNMA2 30YR 2012 PRODUCTION', 'G2033230Z', 8.425385204562956E-5]
                            }, {
                                'data': ['GNMA2 30YR 2012 PRODUCTION', 'G2040030Z', 7.411577012898203E-5]
                            }, {
                                'data': ['GNMA2 30YR 2013 PRODUCTION', 'G2043230A', 1.4874920514095494E-4]
                            }, {
                                'data': ['GNMA2 30YR 2014 PRODUCTION', 'G2043230B', 8.237570174179705E-5]
                            }, {
                                'data': ['GNMA2 30YR 2015 PRODUCTION', 'G2033230C', 0.0015752540653050408]
                            }, {
                                'data': ['GNMA2 30YR 2017 PRODUCTION', 'G2033230E', 0.0026820582874564126]
                            }, {
                                'data': ['GNMA2 30YR TBA(REG C)', 'BRTBNZVL2', -1.5952438071471165E-4]
                            }, {
                                'data': ['GNMA2 30YR TBA(REG C)', 'BRTBJ2F95', 0.0025179014304845277]
                            }, {
                                'data': ['GNMA2 30YR TBA(REG C)', 'BRTBNZVM0', 0.001530920117063073]
                            }, {
                                'data': ['GNMA2 30YR TBA(REG C)', 'BRTB6P318', -9.026249677932374E-4]
                            }
                            ]
                        }
                        ]
                    },
                    'columns': ['sec_desc', 'cusip_0', 'pct_mv_1']
                },
                'gaussian': '6xwWS97nC5jkqrelLFpuoFn4dgzSDCgg9KI6o8e30bJZ6SaTUwYraqd0EO5hFWEKxsZbg4zX8w==',
                'CLASS_TYPE': 'com.bfm.app.prismweb.response.PrismWebResponse',
                'status': 'SUCCESS'
            },
            'headers': {
                'msgSize': 2618
            },
            'transactionContext': {
                'bmsTimeStamp': '2017-12-07T18:32:26.411Z',
                'detailedID': 'a683c61e-f292-4b07-9077-627a7bc945a5.2618.1512671546411',
                'IDWithContextChain': 'a683c61e-f292-4b07-9077-627a7bc945a5',
                'chain': [],
                'bmsMsgSize': 2618,
                'transactionId': 'a683c61e-f292-4b07-9077-627a7bc945a5',
                'CLASS_TYPE': 'com.bfm.util.TransactionContext'
            },
            'return_val': 'SUCCESS',
            'command': 'getPrismData',
            'transactionId': 'a683c61e-f292-4b07-9077-627a7bc945a5'
        }];
        prismRequest = new ExploreDataRequest([{
            'title': 'Pie Chart',
            'columns': [{
                'columnKey': 'cusip',
                'columnTag': 'cusip',
                'positionColumnType': 'ALL',
                'title': 'CUSIP',
                'identifierColumn': true
            }, {
                'columnTag': 'pct_notional_val',
                'columnKey': 'pct_notional_val_0',
                'positionColumnType': 'PORT',
                'title': 'Notional Market Value %'
            }],
            'type': 'pie',
            'breakdownTree': '{"breakdown":{"breakdownTitle":"Barclays Four Pillar","subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"Barclays Four Pillar Sectors (gp_BARCSECT4P) - Level 1","columnTag":"grsector`gp_BARCSECT4P`1","dataType":"STRING"},"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"Barclays Four Pillar Sectors (gp_BARCSECT4P) - Level 2","columnTag":"grsector`gp_BARCSECT4P`2","dataType":"STRING"},"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"Barclays Four Pillar Sectors (gp_BARCSECT4P) - Level 3","columnTag":"grsector`gp_BARCSECT4P`3","dataType":"STRING"},"subSectors":[{"breakdownRuleType":"String","useNoneBuckets":true,"groupByColumn":{"columnName":"Barclays Four Pillar Sectors (gp_BARCSECT4P) - Level 4","columnTag":"grsector`gp_BARCSECT4P`4","dataType":"STRING"}}]}]}]}]},"title":"Barclays Four Pillar"}',
            'filter': null,
            'normalizedWidgetFilter': null,
            'riskFactorBreakdown': '',
            'createNestedNoneBuckets': true,
            'createNestedOtherBuckets': true,
            'layout': 'Report 2',
            'todayDate': '03/11/2016',
            'portfolioRiskSettings': {},
            'isAnchorPortfolio': false,
            'performanceSettings': {'cannedAttributionMethod': 'FIXED_INCOME_DXS'},
            'compositionFilter': null,
            'portfolio': 'IP',
            'fullPortfolioName': 'International Paper Defined Benefit Account',
            'portfolioIdentifier': 'IP',
            'forDate': '03/10/2016',
            'currency': 'USD',
            'holidayCalendar': 'GreenPkg',
            'includeAliasPortfolios': false,
            'filterTargetType': 'BOTH',
            'benchmark': 'LEH_AGG',
            'benchSelection': 'RISK',
            'benchOrder': 1,
            'isLookthroughEnabled': 'N',
            'ltSecurityTypes': '',
            'ltSecurityProxyTypes': '',
            'lookthroughRules': [],
            'splitPositionTypes': 'XC,XF,XH,XS,SW,O',
            'isSectorView': 'Y'
        }]);
        cachingService = new ExploreCachingService();
        cachingService.clearIndexDbStorage();
    }));

    it('Test caching enabled', function() {
        expect(cachingService.isCachingEnabled).toBe(true);
    });

    it('Test caching data', (() => {
        prismRequest['cacheKey'] = 'cacheKey1';
        // Make sure this request is not cached
        expect(cachingService.isCached(prismRequest)).toBe(false);

        // Cache the data
        cachingService.addDataToCache(prismRequest, data[0].output);

        // Expect data to be in the cache
        expect(cachingService.isCached(prismRequest)).toBe(true);
    }));

    it('Test get cached data', ((done: any) => {
        prismRequest['cacheKey'] = 'cacheKey1';
        // Here, we are really testing if the compression/decompression logic works fine
        jest.spyOn(cachingService, 'getDataFromCache$').mockImplementation(() => {
            const compressedData = LZString.compress(JSON.stringify(data));
            return of(JSON.parse(LZString.decompress(compressedData)));
        });

        // Cache the data
        cachingService.addDataToCache(prismRequest, data);

        cachingService.getDataFromCache$(prismRequest).subscribe((response: any) => {
            expect(JSON.stringify(response[0])).toEqual(JSON.stringify(data[0]));
            done();
        });
    }));


    describe('Tests update cached response methods', () => {
        it('Tests updateKeysInResponse method', () => {
            // Create a dummy cached object with all different scenarios of what we want to replace
            const originalObject = {
                string1 : 'replaceMe',
                string2: 'test',
                number: 0,
                undefined: undefined,
                nil: null,
                arrayOfString: ['test', 'replaceMe', 'replaceMe|test', undefined, null],
                arrayOfNumber: [1, 2, undefined, null],
                arrayOfObject: [
                    {
                        string1 : 'replaceMe',
                        string2: 'test',
                        number: 0,
                        undefined: undefined,
                        nil: null,
                        arrayOfString: ['test', 'replaceMe', 'replaceMe|test', undefined, null],
                        arrayOfNumber: [1, 2, undefined, null],
                        replaceMe: {},
                        replaceMeKey: {}
                    },
                    {
                        string1 : 'replaceMe',
                        string2: 'test',
                        number: 0,
                        undefined: undefined,
                        nil: null,
                        arrayOfString: ['test', 'replaceMe', 'replaceMe|test', undefined, null],
                        arrayOfNumber: [1, 2, undefined, null],
                        replaceMe: {},
                        replaceMeKey: {}
                    }
                ],
                object: {
                    string1 : 'replaceMe',
                    string2: 'test',
                    number: 0,
                    undefined: undefined,
                    nil: null,
                    arrayOfString: ['test', 'replaceMe', 'replaceMe|test', undefined, null],
                    arrayOfNumber: [1, 2, undefined, null],
                    replaceMe: {},
                    replaceMeKey: {}
                },
                replaceMe: {},
                replaceMeKey: {}
            };

            // We will replace all of the 'replaceMe' with a new string
            const updatedObject = ExploreCachingService.updateKeysInResponse(originalObject, 'replaceMe', 'newString');
            // Expect all keys and values to replaced properly
            expect(updatedObject).toEqual({
                string1 : 'newString',
                string2: 'test',
                number: 0,
                undefined: undefined,
                nil: null,
                arrayOfString: ['test', 'newString', 'newString|test', undefined, null],
                arrayOfNumber: [1, 2, undefined, null],
                arrayOfObject: [
                    {
                        string1 : 'newString',
                        string2: 'test',
                        number: 0,
                        undefined: undefined,
                        nil: null,
                        arrayOfString: ['test', 'newString', 'newString|test', undefined, null],
                        arrayOfNumber: [1, 2, undefined, null],
                        newString: {},
                        newStringKey: {}
                    },
                    {
                        string1 : 'newString',
                        string2: 'test',
                        number: 0,
                        undefined: undefined,
                        nil: null,
                        arrayOfString: ['test', 'newString', 'newString|test', undefined, null],
                        arrayOfNumber: [1, 2, undefined, null],
                        newString: {},
                        newStringKey: {}
                    }
                ],
                object: {
                    string1 : 'newString',
                    string2: 'test',
                    number: 0,
                    undefined: undefined,
                    nil: null,
                    arrayOfString: ['test', 'newString', 'newString|test', undefined, null],
                    arrayOfNumber: [1, 2, undefined, null],
                    newString: {},
                    newStringKey: {}
                },
                newString: {},
                newStringKey: {}
            });
        });

        it('Tests getColumnKeyDiffMapping function', () => {
            const cachedColumns = [
                {
                    'columnTag': 'security_description',
                    'columnKey': 'security_description',
                    'positionColumnType': 'ALL',
                    'title': 'Security Description'
                },
                {
                    'columnTag': 'cusip',
                    'columnKey': 'cusip_0',
                    'positionColumnType': 'ALL',
                    'title': 'CUSIP'
                },
                {
                    'columnTag': 'pct_mv',
                    'columnKey': 'pct_mv_1',
                    'positionColumnType': 'PORT',
                    'title': 'Market Value %',
                    'optionValues': {
                        'aggregationType': 2,
                        'decimalPlaces': 1,
                        'useThousandsSeparator': true,
                        'scaling': 0.01
                    }
                },
                {
                    'columnTag': 'pct_notional_val',
                    'columnKey': 'pct_notional_val_1567548460133',
                    'positionColumnType': 'PORT',
                    'title': 'Notional Market Value %',
                    'optionValues': {
                        'aggregationType': 2,
                        'decimalPlaces': 1,
                        'useThousandsSeparator': true,
                        'scaling': 0.01
                    }
                }
            ];

            const newColumns = [
                {
                    'columnTag': 'security_description',
                    'columnKey': 'security_description',
                    'positionColumnType': 'ALL',
                    'title': 'Security Description'
                },
                {
                    'columnTag': 'cusip',
                    'columnKey': 'cusip_0',
                    'positionColumnType': 'ALL',
                    'title': 'CUSIP'
                },
                {
                    'columnTag': 'pct_mv',
                    'columnKey': 'pct_mv_123',
                    'positionColumnType': 'PORT',
                    'title': 'Market Value %',
                    'optionValues': {
                        'aggregationType': 2,
                        'decimalPlaces': 1,
                        'useThousandsSeparator': true,
                        'scaling': 0.01
                    }
                },
                {
                    'columnTag': 'pct_notional_val',
                    'columnKey': 'pct_notional_val_567',
                    'positionColumnType': 'PORT',
                    'title': 'Notional Market Value %',
                    'optionValues': {
                        'aggregationType': 2,
                        'decimalPlaces': 1,
                        'useThousandsSeparator': true,
                        'scaling': 0.01
                    }
                }
            ];

            const columnkeyDiffMap = ExploreCachingService.getColumnKeyDiffMapping(cachedColumns, newColumns);
            expect(columnkeyDiffMap.get('pct_notional_val_567')).toBe('pct_notional_val_1567548460133');
            expect(columnkeyDiffMap.get('pct_mv_123')).toBe('pct_mv_1');
        });
    });

});

