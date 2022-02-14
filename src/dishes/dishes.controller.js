const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
const list = (req, res) => {
  res.json({data: dishes});
};

const create = (req, res) => {
  const {
    data: {
      name,
      description,
      price,
      image_url
    }
  } = req.body;
  
  const newId = nextId();
  const newDish = {
    id: newId,
    name,
    description,
    price,
    image_url
  };
  dishes.push(newDish);
  res.status(201).json({data: newDish});
};

const read = (req, res) => {
  res.status(200).json({data: res.locals.dish});
};

const update = (req, res) => {
  const dish = res.locals.dish;
  const originalDish = dish;
  const {data: {id = {}, name, description, price, image_url}} = req.body;
  dish.id = id;
  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({data: dish});
}

const dishExists = (req, res, next) => {
  const {dishId} = req.params;
  const foundDish = dishes.find(({id}) => id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  };
  return next({
    status: 404,
    message: `Dish does not exist: ${dishId}.`
  });
};

const validateIdAgainstRoute = (req, res, next) => {
  const {dishId} = req.params;
  const {data: {id}} = req.body;
  if (!id || id === dishId) {
    return next();
  } else if (id !== dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
    })
  }
}

const validateDishName = (req, res, next) => {
  const {data: {name} = {}} = req.body;
  if (name) {
    return next();
  };
  return next({
    status: 400,
    message: "Dish must include a name"
  })
};

const validateDishDescription = (req, res, next) => {
  const {data: {description} ={}} = req.body;
  if (description) {
    return next();
  };
  return next({
    status: 400,
    message: "Dish must include a description"
  })
};

const validateDishPrice = (req, res, next) => {
  const {data: {price} ={}} = req.body;
  if (price === undefined) {
    return next({
      status: 400,
      message: "Dish must include a price"
    });
  } else if (price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0"
    });
  };
  return next();
};

const validateDishImageURL = (req, res, next) => {
  const {data: {image_url} ={}} = req.body;
  if (image_url) {
    return next();
  };
  return next({
    status: 400,
    message: "Dish must include a image_url"
  });
};

module.exports = {
  list,
  create: [
    validateDishName,
    validateDishDescription,
    validateDishPrice,
    validateDishImageURL,
    create,
  ],
  read: [dishExists, read],
  update: [
    dishExists,
    validateIdAgainstRoute,
    validateDishName,
    validateDishDescription,
    validateDishPrice,
    validateDishImageURL,
    update,
  ]
}