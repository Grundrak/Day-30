
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const PORT = 3000;
const path = require('path');
require('dotenv').config();
let db;
const client = new MongoClient(process.env.URL,  {
  serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
  }
}
);
async function connectmngdb() {
 try{
  await client.connect();
  db = client.db("DataMng"); // connect db to DataMng
  console.log('Great work You are Connected to MongoDb');
 }catch(err){
  console.error(err.message);
  throw err;
 }
}
connectmngdb();

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.set('view engine','ejs');
app.set('views','./views');


app.use('public',(req ,res ,next) =>{
  res.set('Cache-Control', 'public, max-age =2628000');
  const expire = new Date(Date.now() +2628000 * 1000);
  res.set('Expires', expire.toUTCString());
  console.log(expire);
  next()
})

app.get('/products', async (req ,res) => {
    
     try {
      console.log(db);
      const productsmn = db.collection("Products");
      console.log(productsmn);
      const products = await productsmn.find({}).toArray();
      console.log(products);
      res.render("home", { products });
        } catch (err) {
      res.status(500).send('Error fetching data from Mngdb');
    }
})

app.use((req,res,next) => {
  const crDate = new Date();
  const request = req.method;
  const url = req.originalUrl;
  console.log(` The request : ${request} \n Executed at : ${crDate} \n Whit Url :${url}`);
  next();
})

app.get("/products/:id", async (req, res) => {
  const productId = parseInt(req.params.id);
  try{
    const product = await db.collection('Products').findOne({ id: productId });
    if (product) {
      res.render('productDetails',{ product });
    } else {
      res.status(404).send();
    }
  }catch(err){
    res.status(500).send('Error fetching data from Mngdb');
  }


});

app.get("/products/p/search", (req, res) => {
  const searchquery = req.query.q.toLowerCase();
  let minPrice = parseFloat(req.query.minPrice);
  let maxPrice = parseFloat(req.query.maxPrice);

  let product = products.filter(
    (item) =>
      item.name.toLowerCase().includes(searchquery) &&
      item.price >= minPrice &&
      item.price <= maxPrice
  );
  if (product.length > 0) {
    res.status(200).json(product);
  } else {
    res.sendStatus(404);
  }
});

app.post("/products", (req, res) => {
    const {name,price} = req.query
  const createproduct = {id : products.length++, name, price};
  products.push(createproduct);
  if (createproduct) {
    res.status(201).send("Done the product added");
  } else {
    res.status(400).send(); }
});
app.put("/products/:id", (req, res) => {
  const index = products.find((index) => index.id === parseInt(req.params.id));
  const update = req.body;
  if (index !== -1) {
    products[index] = { ...products[index], ...update };
    res.sendStatus(201);
  } else {
    res.sendStatus(404);
  }
});

app.delete("/products/:id", (req, res) => {
  let product = products.find(
    (product) => product.id === parseInt(req.params.id)
  );
  if (product !== -1) {
    products.splice(product, 1);
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

app.listen(PORT, () => {
  console.log(`server on port ${PORT}`);
});


