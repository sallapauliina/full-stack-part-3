const morgan = require("morgan");
const cors = require("cors");

require("dotenv").config();
const express = require("express");

const Note = require("./models/person");
const app = express();

const requestLogger = (request, response, next) => {
  next();
};

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

app.use(cors());
app.use(express.static("dist"));
app.use(express.json());
app.use(requestLogger);

const mongoose = require("mongoose");

const password = process.argv[2];

const name = process.argv[3];
const number = process.argv[4];

// const url = `mongodb+srv://sallalyyti:${password}@cluster0.htfc4fh.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`;

// mongoose.set("strictQuery", false);
// mongoose.connect(url);

// let notes = [
//   {
//     id: 1,
//     content: "HTML is easy",
//     important: true,
//   },
//   {
//     id: 2,
//     content: "Browser can execute only JavaScript",
//     important: false,
//   },
//   {
//     id: 3,
//     content: "GET and POST are the most important methods of HTTP protocol",
//     important: true,
//   },
// ];

// let persons = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ];

app.use(express.json());

morgan.token("body", (request) => JSON.stringify(request.body));

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/", (request, response) => {
  response.send("<h1>Hello World!!!</h1>");
});

// app.get("/api/notes", (request, response) => {
//   response.json(notes);
// });

// app.get("/api/persons", (request, response) => {
//   response.json(persons);
// });

app.get("/info", (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people.</p>
    <p>${new Date()}</p>`
  );
});

// app.get("/api/persons/:id", (request, response) => {
//   const id = Number(request.params.id);
//   const person = persons.find((person) => person.id === id);
//   if (person) {
//     response.json(person);
//   } else {
//     response.status(404).end();
//   }
// });

app.get("/api/persons/:id", (request, response, next) => {
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        response.json(note);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// const generateId = () => {
//   const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
//   return maxId + 1;
// };

// app.post("/api/notes", (request, response) => {
//   const body = request.body;

//   if (!body.content) {
//     return response.status(400).json({
//       error: "Content is missing.",
//     });
//   }

//   const note = {
//     content: body.content,
//     important: body.important || false,
//     id: generateId(),
//   };

//   notes = notes.concat(note);

//   response.json(note);
// });

// app.get("/api/notes/:id", (request, response) => {
//   const id = Number(request.params.id);
//   const note = notes.find((note) => note.id === id);
//   if (note) {
//     response.json(note);
//   } else {
//     console.log("x");
//     response.status(404).end();
//   }
// });

app.get("/api/persons", (request, response) => {
  Note.find({}).then((persons) => {
    response.json(persons);
  });
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  Note.findByIdAndDelete(id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// app.delete("/api/persons/:id", (request, response) => {
//   const id = Number(request.params.id);
//   persons = persons.filter((person) => person.id !== id);

//   response.status(204).end();
// });

// app.post("/api/persons", (request, response) => {
//   const body = request.body;

//   if (!body.name || !body.number) {
//     return response.status(400).json({
//       error: "Name or number is missing.",
//     });
//   }

//   const nameExists = persons.some((person) => person.name === body.name);
//   if (nameExists) {
//     return response.status(400).json({
//       error: "Name already exixts.",
//     });
//   }

//   const newPerson = {
//     id: Math.floor(Math.random() * 100000),
//     name: body.name,
//     number: body.number,
//   };

//   persons = persons.concat(newPerson);
//   response.json(newPerson);
// });

const phonePattern = /^[0-9]{2,3}-[0-9]{5,}$/;

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "Name or number is missing.",
    });
  }

  if (body.number.length < 8) {
    return response.status(400).json({
      error: "Number is too short.",
    });
  }

  if (!phonePattern.test(body.number)) {
    return response.status(400).json({
      error: "Invalid phone number.",
    });
  }

  const newPerson = new Note({
    name: body.name,
    number: body.number,
  });

  newPerson
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => {
      next(error);
    });
  // .catch(next);
  // .catch((error) => {
  //   console.log(error);
  //   console.error("Error saving person:", error);
  //   response.status(400).json({
  //     error: "Name or number is missing.",
  //   });
  // });
});

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;
  Note.findById(request.params.id)
    .then((note) => {
      if (note) {
        note.name = name;
        note.number = number;
        return note.save().then((updatedNote) => {
          response.json(updatedNote);
        });
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

const unkonwnEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unkonwnEndpoint);

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
