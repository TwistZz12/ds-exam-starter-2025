import { SNSEvent, SNSHandler } from "aws-lambda";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({ region: process.env.REGION });
const queueAUrl = process.env.QUEUE_A_URL || "";
const queueBUrl = process.env.QUEUE_B_URL || "";

export const handler: SNSHandler = async (event: SNSEvent) => {
  try {
    console.log("Event: ", JSON.stringify(event));
    
    for (const record of event.Records) {
      const messageBody = JSON.parse(record.Sns.Message);
      
      // Check if message has the email property
      if (messageBody.email) {
        // Message has email property, send to Queue A
        await sqsClient.send(
          new SendMessageCommand({
            QueueUrl: queueAUrl,
            MessageBody: JSON.stringify(messageBody),
          })
        );
        console.log("Message with email sent to Queue A");
      } else {
        // Message is missing email property, send to Queue B
        await sqsClient.send(
          new SendMessageCommand({
            QueueUrl: queueBUrl,
            MessageBody: JSON.stringify(messageBody),
          })
        );
        console.log("Message missing email sent to Queue B");
      }
    }
    
    return {
      statusCode: 200,
      body: "Message processed successfully",
    };
  } catch (error) {
    console.error("Error processing message:", error);
    throw error;
  }
}; 