var path = require('path');

const PROTO_PATH = path.join('', 'restaurant.proto');

var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

var packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  arrays: true,
});

var restaurantProto = grpc.loadPackageDefinition(packageDefinition);

const { v4: uuidv4 } = require('uuid');

const server = new grpc.Server();
const menu = [
  {
    id: 'a68b823c-7ca6-44bc-b721-fb4d5312cafc',
    name: 'desserts',
    price: 500,
    category: 'dessert',
  },
  {
    id: '34415c7c-f82d-4e44-88ca-ae2a1aaa92b7',
    name: 'Thai dishes',
    price: 60,
    category: 'Thai dishes',
  },
  {
    id: '8551887c-f82d-4e44-88ca-ae2a1ccc92b7',
    name: 'Italian dishes',
    price: 120,
    category: 'Italian dishes',
  },
  {
    id: '18b8f73d-9e8d-400a-91cd-98975e626bca',
    name: 'drinks',
    price: 30,
    category: 'drinks',
  },
];

server.addService(restaurantProto.RestaurantService.service, {
  getAllMenu: (_, callback) => {
    callback(null, { menu });
  },
  get: (call, callback) => {
    let menuItem = menu.find((n) => n.id == call.request.id);

    if (menuItem) {
      callback(null, menuItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'Not found',
      });
    }
  },
  insert: (call, callback) => {
    let menuItem = call.request;

    menuItem.id = uuidv4();
    menu.push(menuItem);
    callback(null, menuItem);
  },
  update: (call, callback) => {
    let existingMenuItem = menu.find((n) => n.id == call.request.id);

    if (existingMenuItem) {
      existingMenuItem.name = call.request.name;
      existingMenuItem.price = call.request.price;
      callback(null, existingMenuItem);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'Not Found',
      });
    }
  },
  remove: (call, callback) => {
    let existingMenuItemIndex = menu.findIndex((n) => n.id == call.request.id);

    if (existingMenuItemIndex != -1) {
      menu.splice(existingMenuItemIndex, 1);
      callback(null, {});
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'NOT Found',
      });
    }
  },
});

server.bindAsync(
  '127.0.0.1:30043',
  grpc.ServerCredentials.createInsecure(),
  () => {
    server.start();
    console.log('Server running at http://127.0.0.1:30043');
  }
);
