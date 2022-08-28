import { ITEM_TYPE } from "../../constants/types";

class ArmTypeResolver {

    constructor(type) {
        this.type = type;
    }

    handle () {
        switch (this.type) {
            case ITEM_TYPE.DATA_SOURCE:
            case ITEM_TYPE.ARMAMENT:
            default:

        }
    }
}

export default ArmTypeResolver;