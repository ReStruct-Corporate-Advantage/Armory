import ArmoryEntity from "./ArmoryEntity";
import {v4 as uuid} from "uuid";
import {Descriptor, Meta} from "./";
import Network from "../utils/network";
export default class Component extends ArmoryEntity {
    private _armamentCategory: String;
    private _componentName: String;
    private _descriptor: Descriptor;
    private _displayName: String;
    private _index: Number;
    private _left: Number;
    private _meta: Meta;
    private _name: String;
    private _owner: String;
    private _state: String;
    private _top: Number;
    private _uuid: String;
    private _visibility: String;

    constructor (config: any) {
        super(config ? config.createdAt : new Date(), config ? config.createdBy : "");
        this._armamentCategory = config ? config.armamentCategory : "";
        this._componentName = config ? config.componentName : "";
        this._descriptor = new Descriptor(config ? config.descriptor : {});
        this._displayName = config ? config.displayName : "";
        this._index = config ? config.index : -1;
        this._left = config ? config.left : 0;
        this._meta = new Meta(config ? config.meta : {});
        this._name = config ? config.name : "";
        this._owner = config ? config.owner : "";
        this._state = config ? config.state : "";
        this._top = config ? config.top : "";
        this._uuid = config ? config.uuid : "";
        this._visibility = config ? config.visibility : "private";
    }

    createContainer (userDetails: any) {
        const UID = uuid();
        const username = userDetails.username;
        const meta = new Meta({tags: ["Container"], createdBy: username})
        this.componentName = "Container-" + username + "--" + UID;
        this.displayName = "Container-" + username;
        this.owner = username;
        this.state = "DRAFT";
        this.visibility = "public";
        this.meta = meta;
        this.createdBy = username;
        return this.save();
    }

    save () {
        let transformedComponent = {};
        Object.keys(this).forEach(key => {
            if (key !== "__proto__" && key.startsWith("_")) {
                const trimmedKey = key.substring(1);
                transformedComponent[trimmedKey] = this[key];
            }
        });
        return Network.post("/api/armory?withContainer=true", transformedComponent)
    }

    public get armamentCategory(): String {
        return this._armamentCategory;
    }
    public set armamentCategory(value: String) {
        this._armamentCategory = value;
    }
    public get componentName(): String {
        return this._componentName;
    }
    public set componentName(value: String) {
        this._componentName = value;
    }
    public get descriptor(): Descriptor {
        return this._descriptor;
    }
    public set descriptor(value: Descriptor) {
        this._descriptor = value;
    }
    public get displayName(): String {
        return this._displayName;
    }
    public set displayName(value: String) {
        this._displayName = value;
    }
    public get index(): Number {
        return this._index;
    }
    public set index(value: Number) {
        this._index = value;
    }
    public get left(): Number {
        return this._left;
    }
    public set left(value: Number) {
        this._left = value;
    }
    public get meta(): Meta {
        return this._meta;
    }
    public set meta(value: Meta) {
        this._meta = value;
    }
    public get name(): String {
        return this._name;
    }
    public set name(value: String) {
        this._name = value;
    }
    public get owner(): String {
        return this._owner;
    }
    public set owner(value: String) {
        this._owner = value;
    }
    public get state(): String {
        return this._state;
    }
    public set state(value: String) {
        this._state = value;
    }
    public get top(): Number {
        return this._top;
    }
    public set top(value: Number) {
        this._top = value;
    }
    public get uuid(): String {
        return this._uuid;
    }
    public set uuid(value: String) {
        this._uuid = value;
    }
    public get visibility(): String {
        return this._visibility;
    }
    public set visibility(value: String) {
        this._visibility = value;
    }


}