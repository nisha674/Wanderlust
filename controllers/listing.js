const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  let listing = await Listing.find({});
  res.render("listings/index.ejs", { listing });
};

// module.exports.search = async (req, res) => {
//   let listing = await Listing.find({});
//   res.render("listings/search.ejs", { listing });
// };

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  let lists = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!lists) {
    req.flash("error", "Listing you requested for does not exists!");
    res.redirect("/listings");
  } else {
    res.render("listings/show.ejs", { lists });
  }
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listings);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let lists = await Listing.findById(id);
  if (!lists) {
    req.flash("error", "Listing you requested for does not exists!");
    res.redirect("/listings");
  }
  let originalUrl = lists.image.url;
  originalUrl = originalUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { lists, originalUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listings });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};
