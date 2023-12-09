const express = require("express");
const app = express();

const PORT = process.env.PORT || 4000; // PORT used in production or 4000

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index"); // automatically find the index.ejs
});

app.get("/users/register", (req, res) => {
  res.render("register"); // automatically find the index.ejs
});

app.get("/users/login", (req, res) => {
  res.render("login"); // automatically find the index.ejs
});

app.get("/users/dashboard", (req, res) => {
  res.render("dashboard", { user: "Conner" }); // automatically find the index.ejs
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});