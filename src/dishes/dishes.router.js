const router = require("express").Router();

const { route } = require("express/lib/application");
// TODO: Implement the /dishes routes needed to make the tests pass
const controller = require("./dishes.controller");
router
  .route("/:dishId")
  .get(controller.read)
  .put(controller.update)

router
  .route("/")
  .get(controller.list)
  .post(controller.create)

module.exports = router;
