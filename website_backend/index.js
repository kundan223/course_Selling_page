import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Razorpay from "razorpay";
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

mongoose
  .connect('mongodb://127.0.0.1:27017/test', { useNewUrlParser: true, useUnifiedTopology: true })
  .catch(error => console.log(error));

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const User = new mongoose.model("User", userSchema);


// Routes
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      if (password === existingUser.password) {
        res.send({ message: "Login Successful"+ existingUser.name , user: existingUser });
      } else {
        res.send({ message: "Password didn't match" });
      }
    } else {
      res.send({ message: "User not registered" });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post("/"), async (req,res)=>{
  const {email, password} = req.body;
}

app.post("/order", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const options = req.body;
    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ error: "Order creation failed" });
    }

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message }); // Sending the actual error message
  }
});



app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      res.send({ message: "User already registered" });
    } else {
      const user = new User({
        name,
        email,
        password
      });

      await user.save();

      res.send({ message: "Successfully registered" });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(9002, () => {
  console.log("BE started at port 9002");
});
