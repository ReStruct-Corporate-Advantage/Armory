export default class Meta {
    private _tags: Array<String>;
    private _createdBy: String;

    constructor (meta: any) {
        this._tags = meta ? meta.tags : [];
        this._createdBy = meta ? meta.createdBy : "";
    }

    public get tags(): Array<String> {
        return this._tags;
    }
    public set tags(value: Array<String>) {
        this._tags = value;
    }
    public get createdBy(): String {
        return this._createdBy;
    }
    public set createdBy(value: String) {
        this._createdBy = value;
    }
}