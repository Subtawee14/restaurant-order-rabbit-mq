const client = require('./client');

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  client.getAllMenu(null, (err, data) => {
    if (!err) {
      res.render('menu', {
        results: data.menu,
      });
    }
  });
});

var amqp = require('amqplib/callback_api');

app.post('/placeorder', (req, res) => {
  var orderItem = {
    id: req.body.id,
    name: req.body.name,
    quantity: req.body.quantity,
    category: req.body.category,
  };

  // Send the order msg to RabbitMQ
  amqp.connect('amqp://localhost', function (error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function (error1, channel) {
      if (error1) {
        throw error1;
      }
      const exchange = 'order_routing';
      const severity = orderItem.category;
      const msg = JSON.stringify(orderItem);

      channel.assertExchange(exchange, 'direct', {
        durable: true,
      });

      channel.publish(exchange, severity, Buffer.from(msg));
      console.log(" [x] Sent %s: '%s'", severity, msg);

      return res.redirect('/');
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running at port %d', PORT);
});
