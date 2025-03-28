import {Serializable} from '@blk/explore-ui-core';

/**
 * Class used for the favorite user information
 */
export class FavoriteFolderItem implements Serializable {
    title: string;
    type: string;
    tool: string;
    favoriteId: number|string;
    children: FavoriteFolderItem[];

    constructor(data?: any) {
        this.children = [];
        if (data) {
            this.deserialize(data);
        }
    }

    /**
     * serialize
     */
    serialize(): any {
        const data: any = {
            title: this.title,
            type: this.type
        };

        // Only add the other properties if they exists.
        if (this.favoriteId) {
            data.favoriteId = this.favoriteId;
        }

        // Only add child nodes if they exist.
        if (this.children.length) {
            data.children = [];
            for (const child of this.children) {
                data.children.push(child.serialize());
            }
        }

        return data;
    }

    /**
     * deserialize
     */
    deserialize(data: any): void {
        this.title = data.title ? data.title : data.text;
        this.type = data.type;

        if (data.favoriteId) {
            this.favoriteId = data.favoriteId.isNumber ? +data.favoriteId : data.favoriteId;
        } else if (data.data && data.data.id) {
            this.favoriteId = data.data.id.isNumber ? +data.data.id : data.data.id;            
        }

        if (data.children) {
            for (const child of data.children) {
                this.children.push(new FavoriteFolderItem(child));
            }
        }
    }
}
