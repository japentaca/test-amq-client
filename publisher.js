const amqp = require('amqplib');

const queueName = 'my_queue';
const topicName = 'my_topic';
const exchangeName = 'my_exchange';

async function connectAndPublish() {
  try {
    const connection = await amqp.connect('amqp://143.110.144.65:32771/');
    const channel = await connection.createChannel();

    // Assert queue
    await channel.assertQueue(queueName, { durable: false });

    // Assert exchange
    await channel.assertExchange(exchangeName, 'topic', { durable: false });

    // Publish to queue and topic every 5 seconds
    setInterval(() => {
      const timestamp = new Date().toISOString();
      const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const message = JSON.stringify({ timestamp, randomString });

      channel.sendToQueue(queueName, Buffer.from(message));
      console.log(`Published to queue: ${message}`);

      channel.publish(exchangeName, topicName, Buffer.from(message));
      console.log(`Published to topic: ${message}`);
    }, 5000);

    // Keep connection open indefinitely
    // connection.close();
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
}

connectAndPublish();