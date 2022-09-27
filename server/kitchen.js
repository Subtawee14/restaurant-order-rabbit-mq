var amqp = require('amqplib/callback_api');

const severities = ['dessert', 'Thai dishes', 'Italian dishes', 'drinks'];

amqp.connect('amqp://localhost', function (error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function (error1, channel) {
    if (error1) {
      throw error1;
    }

    var exchange = 'order_routing';

    channel.assertExchange(exchange, 'direct', {
      durable: true,
    });

    channel.assertQueue(
      '',
      {
        exclusive: true,
      },
      function (error2, q) {
        if (error2) {
          throw error2;
        }
        console.log(' [*] Waiting for logs. To exit press CTRL+C');

        severities.forEach(function (severity) {
          channel.bindQueue(q.queue, exchange, severity);
        });

        channel.consume(
          q.queue,
          function (msg) {
            var secs = msg.content.toString().split('.').length - 1;
            console.log(`Routing Key:[${msg.fields.routingKey}] Received`);
            console.log(JSON.parse(msg.content));

            setTimeout(function () {
              console.log(' [x] Done');
              channel.ack(msg);
            }, secs * 1000);
          },
          {
            noAck: false,
          }
        );
      }
    );
  });
});
