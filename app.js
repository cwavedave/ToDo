//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// Run EJS View Engine
app.set('view engine', 'ejs');

// Run Body Parser
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.use( function(req, res, next) {
  if (req.originalUrl && req.originalUrl.split("/").pop() === 'favicon.ico') {
    return res.sendStatus(204);
  }
  return next();
});

// Sets Database Server URL
var conn = mongoose.connect("mongodb+srv://cwavedave:icWN4Lk7wYU3w7hU@todo-project1-ev84n.mongodb.net/todoDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
})

// Create Items Schema
const itemsSchema = {
  name: String
};

// Item Model
const Item = mongoose.model("Item", itemsSchema);

// Create Items
let item1 = new Item({
  name: "This is some default filler text"
});
let item2 = new Item({
  name: "Hit the + button to add a new item"
});
let item3 = new Item({
  name: "<---- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

// Create Lists Schema
const listsSchema = {
  name: String,
  items: [itemsSchema]
};

// Item Model
const List = mongoose.model("Lists", listsSchema);

const day = date.getDate();


/// Something is acting up here when the page needs to reload with the list.

app.get("/", function(req, res) {
  let newListInput = "";
  // Looks in Lists
    List.find({}, function(err, lists){

      // For Each Loop counting list names
      lists.forEach(function(list){
        const listNames = list.name;
      });

    Item.find({}, function(err, items) {
    if (items.length === 0) {
    console.log("if length script block active")
    // On 2nd iteration, Error starts here.
    Item.insertMany(defaultItems, function(err) {
     if (err) {
       console.log("Error made");
       console.log(err);
// Ends Here
     } else {
       console.log("Succesfully Added default Items to Avoid blank list");
       res.redirect("/");
     }
   });
 } else {
  Item.find({}, function(err, items) {
        res.render("list", {
        listTitle: day,
        newListItems: items,
        lists: lists,
        newListInput: newListInput
          });
        })
      }
    });
  });
});


app.get("/about", function(req, res) {
  res.render("about", {
    listTitle: day,
  });});


app.get("/:customListName", function(req, res) {


    const requestedListName = _.capitalize(req.params.customListName);
    let newListInput = "";
    List.find({}, function(err, lists){
      lists.forEach(function(list){
        const listNames = list.name;
      });

    List.findOne({name: requestedListName}, function(err, foundList) {
      if (!err) {
        if (!foundList) {
          const list = new List({
            name: requestedListName,
            items: defaultItems
          });
          list.save();
          console.log(requestedListName + " List has been created")
          res.redirect("/" + requestedListName);

        } else {
          res.render("list", {
            listTitle: foundList.name,
            listId: foundList._id,
            newListItems: foundList.items,
            lists: lists,
            newListInput: newListInput
          })
        };
      }});
    });
  });


app.post("/", function(req, res) {

  const listName = req.body.listName;
  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  if (listName === day) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});



///////// ************** DELETE ******************
app.post("/delete", function(req, res) {

  const itemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === day) {
    Item.findByIdAndRemove(itemId, function(err) {
      if (!err) {
        console.log("Item" + itemId + " Was Succesfully Deleted from the Database");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, function(err, foundList) {
    if (!err) {
      res.redirect("/" + listName);
    }
  });
}
});

///////// ************** DELETE ******************
app.post("/deleteList", function(req, res) {

  const deletedList = req.body.listName;

  if (deletedList === day) {
    console.log("test")
    res.redirect("/")
  } else {
    List.find({}, function(err, lists) {
      lists.forEach(function(list) {

        const listName = list.name;
        if (deletedList === listName) {
          List.deleteOne({name: deletedList}, function(err) {
            console.log(err);
          });
          console.log("redirecting to homepage after deleting list..")
          res.redirect("/");
        } else {
          console.log(lists.name);
          console.log("Delete List not functioning correctly");
        }
      })
    })
  }
});


app.post("/resetDB", function(req, res) {
  mongoose.connect('mongodb+srv://cwavedave:icWN4Lk7wYU3w7hU@todo-project1-ev84n.mongodb.net/todoDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false }, function(){
    mongoose.connection.db.dropDatabase();

  });
  function myFunc() {
    res.redirect("/");  }
setTimeout(myFunc, 1000);
});



app.post("/newlist", function(req, res) {

const newList = req.body.newListInput

List.find({}, function(err, lists){
  lists.forEach(function(list){
    const listNames = list.name; });

  if (newList === lists.name) {
    res.write("List already exists"); }
    else {
      res.redirect("/" + newList);
    }
  });
});


// Dynamic custom page List Request
// Dynamic custom post check

// Allows Heroku to assign a port or run on 3000 if local.
app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
