/**
 * This interface will be implemented by class who's not meant to serialized
 */
export interface Deserialize {

    // Adding deserialize method
    deserialize(data: any);
}
