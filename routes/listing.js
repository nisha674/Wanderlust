const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

/*✅ SEARCH ROUTE — MUST BE ON TOP */
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

router.get("/search", async (req, res) => {
  const { location } = req.query;

  // empty search → go back
  if (!location || location.trim() === "") {
    return res.redirect("/listings");
  }

  const escapedLocation = escapeRegex(location.trim());

  const listings = await Listing.find({
    location: { $regex: escapedLocation, $options: "i" },
  });

  // ❌ NO LISTINGS → redirect + message
  if (listings.length === 0) {
    req.flash("error", `No listings found for "${location}"`);
    return res.redirect("/listings");
  }

  // ✅ LISTINGS FOUND → go to search page
  res.render("listings/search.ejs", {
    listings,
    searchQuery: location,
  });
});

/* INDEX + CREATE */

router
  .route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isLoggedIn,
    upload.single("listings[image]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

/* NEW */
router.get("/new", isLoggedIn, listingController.renderNewForm);

/* SHOW / UPDATE / DELETE */
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing))
  .put(
    isLoggedIn,
    validateListing,
    isOwner,
    upload.single("listings[image]"),
    wrapAsync(listingController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

/* EDIT */
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
