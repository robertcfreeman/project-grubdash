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

const validateDishName = (req, res) => {
  const {data: {name} = {}} = req.body;
  if (name) {
    return next();
  };
  return next({
    status: 400,
    message: "Dish must include a name"
  })
};

const validateDishDescription = (req, res) => {
  const {data: {description} ={}} = req.body;
  if (description) {
    return next();
  };
  return next({
    status: 400,
    message: "Dish must include a description"
  })
};

const validateDishPrice = (req, res) => {
  const {data: {price} ={}} = req.body;
  if (price === undefined) {
    return next({
      status: 400,
      message: "Dish must include a price"
    });
  } else if (price <= 0 || parseInt(price)) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0"
    });
  };
  return next();
};

const validateDishImageURL = (req, res) => {
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
}