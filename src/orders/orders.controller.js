const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

const list = (req, res) => {
  res.status(200).json({data: orders});
};

const create = (req, res) => {
  const {data: {deliverTo, mobileNumber, dishes}} = req.body;
  const newId = nextId();
  const newOrder = {
    id: newId,
    deliverTo,
    mobileNumber,
    dishes
  };
  orders.push(newOrder);
  
  res.status(201).json({data: newOrder});
};

const read = (req, res) => {
  res.status(200).json({data: res.locals.order});
};

const update = (req, res) => {
  const order = res.locals.order;
  const originalOrder = order;
  const {data: {deliverTo, mobileNumber, status, dishes}} = req.body;
  if (originalOrder.deliverTo !== deliverTo) {
    order.deliverTo = deliverTo;
  };
  if (originalOrder.mobileNumber !== mobileNumber) {
    order.mobileNumber = mobileNumber;
  }
  if (originalOrder.status !== status) {
    order.status = status;
  }
  // if (originalOrder.dishes !== dishes) {
  //   order.dishes = dishes;
  // }
  
  
  res.json({data: order});
};

const destroy = (req, res) => {
  const {orderId} = req.params;
  const index = orders.findIndex(({id}) => id === orderId);
  const deletedOrders = orders.splice(index, 1);
  
  res.sendStatus(204);
}

const orderExists = (req, res, next) => {
  const {orderId} = req.params;
  const foundOrder = orders.find(({id}) => id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  };
  return next({status: 404, message: `No matching order was found, Order Id: ${orderId}`})
};

const validateIdAgainstRoute = (req, res, next) => {
  const {orderId} = req.params;
  const {data: {id}} = req.body;
  if (!id || id === orderId) {
    return next();
  }
  if (orderId !== id) {
    return next({status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`});
 
  }
};

const validateStatusProperty = (req, res, next) => {
  const {data: {status}} = req.body;
  if (status === "pending" || status ==="preparing" || status === "out-for-delivery") {
    return next();
  } else if (status === "delivered") {
    return next({status: 400, message: "A delivered order cannot be changed"})
  }
  return next({status: 400, message: "Order must have a status of pending, preparing, out-for-delivery, delivered"});
};

const validateDeliverToProperty = (req, res, next) => {
  const {data: {deliverTo} = {}} = req.body;
  if (!deliverTo) {
    return next({status: 400, message: "Order must include a deliverTo"});
  }
  return next();
};

const validateMobileNumberProperty = (req, res, next) => {
  const {data: {mobileNumber} = {}} = req.body;
  if (!mobileNumber) {
    return next({status: 400, message: "Order must include a mobileNumber"});
  }
  return next();
};

const validateDishesProperty = (req, res, next) => {
  const {data: {dishes} = {}} = req.body;
  if (!dishes) {
    return next({status: 400, message: "Order must include a dish"})
  } else if (!Array.isArray(dishes) || !dishes.length) {
    return next({status: 400, message: "Order must include a least one dish"})
  }
  return next();
};

const validateQuantityProperty = (req, res, next) => {
  const {data: {dishes} = {}} = req.body;
  for (let i = 0; i < dishes.length; i++) {
    const quantity = dishes[i].quantity;
    if (!quantity || quantity < 0 || !Number.isInteger(quantity)) {
      return next({status: 400, message: `Dish ${i} must have a quantity that is an integer greater than 0`})
    }
  }
  return next();
};

const validateOrderStatus= (req, res, next) => {
  const order = res.locals.order
  if (order.status !== "pending") {
    return next({status: 400, message: "An order cannot be deleted unless it is pending"});
  };
  return next();
}

module.exports = {
  list,
  create: [
    validateDeliverToProperty,
    validateMobileNumberProperty,
    validateDishesProperty,
    validateQuantityProperty,
    create
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    validateIdAgainstRoute,
    validateStatusProperty,
    validateDeliverToProperty,
    validateMobileNumberProperty,
    validateDishesProperty,
    validateQuantityProperty,
    update
  ],
  destroy: [orderExists, validateOrderStatus, destroy]
}