/**
 * This interface will be implemented by any model that will be serialized and deserialized for favorites
 */
export interface Serializable {

    // Serialize method which returns an object
    serialize(): any;

    // Deserialize method which takes in the data from favorites and populates the instance
    deserialize(data: any);
}
