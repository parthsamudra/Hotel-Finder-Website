const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {listingSchema} =require("../schema.js");
const {isLoggedIn} = require("../middleware.js");
const {isOwner, validateListing} = require("../middleware.js");


//Index Route
router.get(
    "/", 
    wrapAsync(async (req, res) => {
        const allListings = await Listing.find({});
        res.render("listings/index.ejs", { allListings});
    })
);


//Listings
router.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings});
}));

//New Route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
router.get("/:id",wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
  .populate({path: "reviews",
    populate: {
    path: "author",
  },
})
  .populate("owner");
  if(!listing) {
    req.flash("error", "Listing Does Not Exits!");
    res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
}));

//Create Route
router.post("/",isLoggedIn,  wrapAsync(async (req, res, next) => {
    let result = listingSchema.validate(req.body);
    console.log(result);
    const newListing = new Listing (req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
 

}));

//Edit Route
router.get("/:id/edit", isLoggedIn,isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if(!listing) {
    req.flash("error", "Listing Does Not Exits!");
    res.redirect("/listings");
  }
  res.render("listings/edit.ejs", {listing});
}));

//Update Route
router.put("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  await Listing.findByIdAndUpdate(id, {...req.body.listing});
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
}));

module.exports = router;