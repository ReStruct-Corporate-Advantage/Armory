const ARMORY_GET_API_DEFINITION = {
  get: {
    tags: [{$ref: "#/tags/name"}],
    description: "Get armory",
    operationId: "getArms",
    parameters: [
      {$ref: "#/components/parameters/accessToken"},
    ],
    responses: {
      "200": {
        description: "Armory is obtained",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/Armory",
            },
          },
        },
      },
      "404": {
        description: "Armory is not found",
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

export default ARMORY_GET_API_DEFINITION;
