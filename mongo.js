const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("give password as argument");
  process.exit(1);
}

const password = process.argv[2];

const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://sallalyyti:${password}@cluster0.htfc4fh.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Note = mongoose.model("Note", noteSchema);

const note = new Note({
  name: name,
  number: number,
});

if (!name || !number) {
  Note.find({}).then((result) => {
    console.log("phonebook:");
    result.forEach((note) => {
      console.log(note.name, note.number);
    });
    mongoose.connection.close();
  });
} else {
  note.save().then(() => {
    console.log("note saved!");
    mongoose.connection.close();
  });
}
