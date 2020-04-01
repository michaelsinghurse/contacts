//contacts.js

"use strict";

const express = require('express');
const morgan = require('morgan');
const PORT = 3000;
const app = express();

let contactData = [
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];

const sortContacts = contacts => {
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.firstName > contactB.firstName) {
      return 1;
    } else {
      return 0;
    }
  });
};

function containsOnlyLetters(str) {
  let regexp = /[^A-Za-z]/g;
  return !regexp.test(str);
}

function isFullNameTaken(first, last) {
  return contactData.filter(contact => {
    return contact.firstName === first && contact.lastName === last;
  }).length > 0;
}

function isValidPhoneNumber(str) {
  let regexp = /\d{3}-\d{3}-\d{4}/g;
  return regexp.test(str);
}

app.set("views", "./views");  // note the relative folder path with `./`
app.set("view engine", "pug");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(morgan("common"));

app.get("/", (req, res) => {
  res.redirect("/contacts");
});

app.get("/contacts", (req, res) => {
  res.render("contacts", {
    contacts: sortContacts(contactData),
  });
});

app.get("/contacts/new", (req, res) => {
  res.render("new-contact");
});

app.post("/contacts/new", 
  (req, res, next) => {
    res.locals.errorMessages = [];

    next();
  },
  (req, res, next) => {
    res.locals.firstName = req.body.firstName.trim();
    res.locals.lastName = req.body.lastName.trim();
    res.locals.phoneNumber = req.body.phoneNumber.trim();
    
    next();
  },
  (req, res, next) => {
    let fName = res.locals.firstName; 

    if (fName.length === 0) {
      res.locals.errorMessages.push("First name is required.");
    } else if (fName.length > 25) {
      res.locals.errorMessages.push("First name must not exceed 25 characters.");
    } else if (!containsOnlyLetters(fName)) {
      res.locals.errorMessages.push("First name can only contain letters.");
    }
      
    next();
  },
  (req, res, next) => {
    let lName = res.locals.lastName; 

    if (lName.length === 0) {
      res.locals.errorMessages.push("Last name is required.");
    } else if (lName.length > 25) {
      res.locals.errorMessages.push("Last name must not exceed 25 characters");
    } else if (!containsOnlyLetters(lName)) {
      res.locals.errorMessages.push("Last name can only contain letters.");
    } else if (isFullNameTaken(res.locals.firstName, lName)) {
      res.locals.errorMessages.push("Sorry that name is already taken.");
    }
      
    next();
  },
  (req, res, next) => {
    let phone = res.locals.phoneNumber; 

    if (phone.length === 0) {
      res.locals.errorMessages.push("Phone number is required.");
    } else if (!isValidPhoneNumber(phone)) {
      res.locals.errorMessages.push("Phone number must be of form " +
        "###-###-####");
    }

    next();
  },
  (req, res, next) => {
    if (res.locals.errorMessages.length > 0) {
      res.render("new-contact", {
        errorMessages: res.locals.errorMessages,
        firstName: res.locals.firstName,
        lastName: res.locals.lastName,
        phoneNumber: res.locals.phoneNumber,
      });
    } else {
      next();
    }
  },
  (req, res) => {
    contactData.push({ 
      firstName: res.locals.firstName,
      lastName: res.locals.lastName,
      phoneNumber: res.locals.phoneNumber,
    });
  
    res.redirect("/contacts");
  }
);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});




























