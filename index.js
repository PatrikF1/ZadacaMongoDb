import express from 'express'
import cors from 'cors' 
import { connectToDatabase } from './db.js'
import { ObjectId } from 'mongodb'
const app = express()
app.use(cors())
const db = await connectToDatabase()

app.use(express.json())

/*app.get('/', (req, res) => {
  res.send('Pizza app')
})

app.get('/pizze', (req, res) => {
  res.status(200).json(pizze)
})

app.get('/pizze/:id', (req, res) => {
  const id = req.params.id
  const pizza = pizze.find(pizza => pizza.id === id) // Oprez, ovo je metoda Array.find() koja dohvaća prvi element koji zadovoljava callback predikat
  res.status(200).json(pizza)
}) */

app.get('/pizze', async (req, res) => {
  let pizze_collection = db.collection('pizze_data') // referenca na kolekciju 'pizze'
  let allPizze = await pizze_collection.find().toArray() // pretvorba u Array
  res.status(200).json(allPizze)
})

app.get('/pizze/:naziv', async (req, res) => {
  let pizze_collection = db.collection('pizze_data')
  let naziv_param = req.params.naziv
  let pizza = await pizze_collection.findOne({ naziv: naziv_param })
  res.status(200).json(pizza)
})

app.post('/pizze', async (req, res) => {
  let pizze_collection = db.collection('pizze_data')
  let novaPizza = req.body
  try {
    let result = await pizze_collection.insertOne(novaPizza)
    res.status(201).json({ insertedId: result.insertedId })
  } catch (error) {
    console.log(error.errorResponse)
    res.status(400).json({ error: error.errorResponse })
  }
})

app.post('/narudzbe', async (req, res) => {
  let narudzbe_collection = db.collection('narudzbe')
  let novaNarudzba = req.body
  let obavezniKljucevi = ['kupac', 'adresa', 'broj_telefona', 'narucene_pizze']
  let obavezniKljuceviStavke = ['naziv']
  if (!obavezniKljucevi.every(kljuc => kljuc in novaNarudzba)) {
    return res.status(400).json({ error: 'Nedostaju obavezni ključevi' })
  }

  if (
    !novaNarudzba.narucene_pizze.every(stavka =>
      obavezniKljuceviStavke.every(kljuc => kljuc in stavka)
    )
  ) {
    return res
      .status(400)
      .json({ error: 'Nedostaju obavezni ključevi u stavci narudžbe' })
  }
  // dodajemo dodatne provjere za svaku stavku narudžbe
  // negacija uvjeta: budući da 'every' vraća true ako je za svaki element polja uvjet
  ispunjen
  if (
    !novaNarudzba.narucene_pizze.every(stavka => {
      // provjeravamo 3 uvjeta: količina je integer i veća od 0, veličina je jedna od

      return (
        Number.isInteger(stavka.količina) &&
        stavka.količina > 0 &&
        ['mala', 'srednja', 'velika'].includes(stavka.veličina)
      )
    })
  ) {
    return res
      .status(400)
      .json({ error: 'Neispravni podaci u stavci narudžbe' })
  }
  try {
    let result = await narudzbe_collection.insertOne(novaNarudzba)
    res.status(201).json({ insertedId: result.insertedId })
  } catch (error) {
    console.log(error.errorResponse)
    res.status(400).json({ error: error.errorResponse })
  }
})

app.patch('/pizze/:naziv', async (req, res) => {
  let pizze_collection = db.collection('pizze_data')
  let naziv_param = req.params.naziv
  let novaCijena = req.body.cijena
  try {
    let result = await pizze_collection.updateOne(
      { naziv: naziv_param },
      { $set: { cijena: novaCijena } }
    )

    if (modifiedCount === 0) {
      return res.status(404).json({ error: 'Pizza nije pronadena' })
    }

    res.status(200).json({ modifiedCount: result.modifiedCount })
  } catch (error) {
    console.log(error.errorResponse)
    res.status(400).json({ error: error.errorResponse })
  }
})

app.patch('/narudzbe/:id', async (req, res) => {
  let narudzbe_collection = db.collection('narudzbe')
  let id_param = req.params.id
  let noviStatus = req.body.status // npr. 'isporučeno', 'u pripremi', 'otkazano'
  try {
    let result = await narudzbe_collection.updateOne(
      { _id: new ObjectId(id_param) },
      {
        $set: { status: noviStatus }
      }
    )
    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Narudžba nije pronađena' })
    }
    res.status(200).json({ modifiedCount: result.modifiedCount })
  } catch (error) {
    console.log(error.errorResponse)
    res.status(400).json({ error: error.errorResponse })
  }
})

// 1. način
app.put('/pizze', async (req, res) => {
  let pizze_collection = db.collection('pizze')
  let noviMeni = req.body
  try {
    await pizze_collection.drop() // brišemo cijelu kolekciju
    let result = await pizze_collection.insertMany(noviMeni)
    res.status(200).json({ insertedCount: result.insertedCount })
  } catch (error) {
    console.log(error.errorResponse)
    res.status(400).json({ error: error.errorResponse })
  }
})

app.delete('/pizze/:naziv', async (req, res) => {
  let pizze_collection = db.collection('pizze')
  let naziv_param = req.params.naziv
  try {
    let result = await pizze_collection.deleteOne({ naziv: naziv_param }) // brišemo pizzu prema nazivu
    res.status(200).json({ deletedCount: result.deletedCount })
  } catch (error) {
    console.log(error.errorResponse)
    res.status(400).json({ error: error.errorResponse })
  }
})

app.delete('/pizze', async (req, res) => {
  let pizze_collection = db.collection('pizze')
  try {
    let result = await pizze_collection.deleteMany({}) // brišemo sve pizze iz kolekcije
    res.status(200).json({ deletedCount: result.deletedCount })
  } catch (error) {
    console.log(error.errorResponse)
    res.status(400).json({ error: error.errorResponse })
  }
})

const PORT = 3000
app.listen(PORT, error => {
  if (error) {
    console.log('Greška prilikom pokretanja servera', error)
  }
  console.log(`Pizza poslužitelj dela na http://localhost:${PORT}`)
})
