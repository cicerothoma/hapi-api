const Hapi = require("@hapi/hapi");
const Joi = require("@hapi/joi");
Joi.objectId = require("joi-objectid")(Joi);

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: "localhost",
    routes: {
      cors: {
        origin: ["*"],
        headers: ["Accept", "Content-type"],
      },
    },
  });

  await server.register({
    plugin: require("hapi-mongodb"),
    options: {
      url:
        "mongodb+srv://admin:YFz3ZWRddO5UjNzA@cluster0.lct01.mongodb.net/todo?retryWrites=true&w=majority",
      settings: {
        useUnifiedTopology: true,
      },
      decorate: true,
    },
  });

  // Gets all Todos
  server.route({
    method: "GET",
    path: "/todos",
    handler: async (req, h) => {
      const todos = await await req.mongo.db
        .collection("todos")
        .find({})
        .toArray();
      return todos;
    },
  });

  // Get A Todo
  server.route({
    method: "GET",
    path: "/todos/{id}",
    options: {
      validate: {
        params: Joi.object({
          id: Joi.objectId(),
        }),
      },
    },
    handler: async (req, h) => {
      const id = req.params.id;
      const ObjectID = req.mongo.ObjectID;
      const todo = await req.mongo.db
        .collection("todos")
        .findOne({ _id: new ObjectID(id) });
      return todo;
    },
  });

  // Add a Todo
  server.route({
    method: "POST",
    path: "/todo",
    handler: async (req, h) => {
      const payload = req.payload;
      const status = await req.mongo.db.collection("todos").insertOne(payload);
      return status;
    },
  });

  // Delete a Todo

  server.route({
    method: "DELETE",
    path: "/todos/{id}",
    options: {
      validate: {
        params: Joi.object({
          id: Joi.objectId(),
        }),
      },
    },
    handler: async (req, h) => {
      const id = req.params.id;
      const ObjectID = req.mongo.ObjectID;
      const payload = req.payload;
      const status = await req.mongo.db
        .collection("todos")
        .deleteOne({ _id: ObjectID(id) });
      return status;
    },
  });

  await server.start();
  console.log("Server running on %s", server.info.uri);
};

init();
