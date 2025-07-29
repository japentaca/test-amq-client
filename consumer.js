import amqp from 'amqplib';
import 'dotenv/config';

const queueName = 'my_queue';
const topicName = 'my_topic';
const exchangeName = 'my_exchange';

async function connectAndConsume() {
  try {
    const connection = await amqp.connect(process.env.AMQ_URL);
    const channel = await connection.createChannel();

    // Assert queue
    await channel.assertQueue(queueName, { durable: false });

    // Assert exchange
    await channel.assertExchange(exchangeName, 'topic', { durable: false });

    // Bind queue to exchange with topic routing key
    await channel.bindQueue(queueName, exchangeName, topicName);

    // Consume from queue
    channel.consume(queueName, (msg) => {
      if (msg !== null) {
        console.log(`Received from queue: ${msg.content.toString()}`);
        channel.ack(msg);
      }
    }, { noAck: false });

    // Consume from topic
    const topicQueue = await channel.assertQueue('', { exclusive: true });
    channel.bindQueue(topicQueue.queue, exchangeName, topicName);

    channel.consume(topicQueue.queue, (msg) => {
      if (msg !== null) {
        console.log(`Received from topic: ${msg.content.toString()}`);
        channel.ack(msg);
      }
    }, { noAck: false });

    console.log('Waiting for messages...');
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
}

connectAndConsume();