import { Component } from ".";

export default class Descriptor {
    private _allowChildren: Boolean;
    private _children: Array<Component>;
    private _classes: String;
    private _defaultWidth: String;
    private _defaultHeight: String;
    private _elemType: String;
    private _styles: Map<String, String>;

    constructor (descriptor: any) {
        this._allowChildren = descriptor ? descriptor.allowChildren : false;
        this._children = descriptor ? descriptor.children : [];
        this._classes = descriptor ? descriptor.classes : "bg-grey border-default";
        this._defaultWidth = descriptor ? descriptor.defaultWidth : "20rem";
        this._defaultHeight = descriptor ? descriptor.defaultHeight : "15rem";
        this._elemType = descriptor ? descriptor.elemType : "div";
        this._styles = descriptor ? descriptor.styles : {};
    }

    public get allowChildren(): Boolean {
        return this._allowChildren;
    }
    public set allowChildren(value: Boolean) {
        this._allowChildren = value;
    }
    public get children(): Array<Component> {
        return this._children;
    }
    public set children(value: Array<Component>) {
        this._children = value;
    }
    public get classes(): String {
        return this._classes;
    }
    public set classes(value: String) {
        this._classes = value;
    }
    public get defaultWidth(): String {
        return this._defaultWidth;
    }
    public set defaultWidth(value: String) {
        this._defaultWidth = value;
    }
    public get defaultHeight(): String {
        return this._defaultHeight;
    }
    public set defaultHeight(value: String) {
        this._defaultHeight = value;
    }
    public get elemType(): String {
        return this._elemType;
    }
    public set elemType(value: String) {
        this._elemType = value;
    }
    public get styles(): Map<String, String> {
        return this._styles;
    }
    public set styles(value: Map<String, String>) {
        this._styles = value;
    }
}