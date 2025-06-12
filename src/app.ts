import express, { Express, Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

dotenv.config();

const app:Application = express();
const port = process.env.PORT || 5000;
const address = process.env.ADDRESS || "127.0.0.1";

async function connectToDb() {
  await mongoose.connect(`mongodb://${address}/app`);
}

const notesSchema = new mongoose.Schema({
  content: {
    type: String
  }
});

const Note = mongoose.models.note || mongoose.model('note', notesSchema);

app.use(cors())
app.use(express.json());
connectToDb();

app.get('/notes', async (req:Request, res:Response) => {
  const notes = await Note.find();
  res.json(notes);
});

app.post('/notes', async (req:Request, res:Response) => {
  try {
    const noteToSave = new Note(req.body);
    await noteToSave.save();
    res.status(201).json(noteToSave);
  } catch (err:any) {
    res.status(400).json({ message: err.message });
  }
});

app.put('/notes/:id', async (req:Request, res:Response) => {
  try {
    const noteToEdit = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!noteToEdit) {
      res.status(404).json({ message: `Note with id ${req.params.id} not found` })
    } else {
      res.status(200).json(noteToEdit);
    }
  } catch (err:any) {
    res.status(500).json({ message: err.message });
  }
});

app.delete('/notes/:id', async (req:Request, res:Response) => {
  try {
    const noteToDelete = await Note.findByIdAndDelete(req.params.id);
    if (!noteToDelete) {
      res.status(404).json({ message: `Note with id ${req.params.id} not found` })
    } else {
      res.status(200).json(`Note with id ${req.params.id} deleted`);
    }
  } catch (err:any) {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://${address}:${port}`);
});