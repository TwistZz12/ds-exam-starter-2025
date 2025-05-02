import { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  DeleteCommand,
  GetCommand
} from "@aws-sdk/lib-dynamodb";
import { MovieCrewRole } from "../shared/types";

const client = createDDbDocClient();
const tableName = process.env.TABLE_NAME;

export const handler: APIGatewayProxyHandlerV2 = async (event, context) => {
  try {
    console.log("Event: ", JSON.stringify(event));

    
    if (event.pathParameters && event.pathParameters.role && event.pathParameters.movieId) {
      const role = event.pathParameters.role;
      const movieId = parseInt(event.pathParameters.movieId);
      
      
      const params = {
        TableName: tableName,
        Key: {
          movieId: movieId,
          role: role
        }
      };

      const response = await client.send(new GetCommand(params));
      
      if (!response.Item) {
        return {
          statusCode: 404,
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({ message: `Can't find Movie ID ${movieId}  ${role} ` }),
        };
      }
      
      return {
        statusCode: 200,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(response.Item),
      };
    }

    return {
      statusCode: 400,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ message: "Missing required path parameters" }),
    };
  } catch (error: any) {
    console.log(JSON.stringify(error));
    return {
      statusCode: 500,
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ error }),
    };
  }
};

function createDDbDocClient() {
  const ddbClient = new DynamoDBClient({ region: process.env.REGION });
  const marshallOptions = {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  };
  const unmarshallOptions = {
    wrapNumbers: false,
  };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
