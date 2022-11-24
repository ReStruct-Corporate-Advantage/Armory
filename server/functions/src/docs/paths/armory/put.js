const ARMORY_PUT_API_DEFINITION = {
  put: {
    tags: [{$ref: "#/tags/name"}],
    description: "Update armory",
    operationId: "updateArmament",
    parameters: [
      {$ref: "#/components/parameters/accessToken"},
    ],
    responses: {
      "200": {
        description: "Armament is updated",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Armory",
            },
          },
        },
      },
      "404": {
        description: "Armamament is not found",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Error",
              example: {
                message: "We can't find the armory",
                internal_code: "Invalid id",
              },
            },
          },
        },
      },
    },
  },
};

export default ARMORY_PUT_API_DEFINITION;
