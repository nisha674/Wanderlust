const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.signUp = (async (req, res) => {
    try{
        let { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser , (err)=>{
        if(err){
            return next(err);
        }else{
            req.flash("success", "Welcome to wanderlust");
            res.redirect("/listings");
        }
    })
    }catch(e){
        req.flash("error" , e.message);
        res.redirect("/signup");
    }
});

module.exports.renderLoginForm=(req, res) => {
    res.render("users/login.ejs");
}

module.exports.login=async(req, res) => {
        req.flash("success" , "Welcome back! you logged in");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
}

module.exports.logout=(req , res , next)=>{
    req.logOut((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success" , "You logged out!");
        res.redirect("/listings");
    })
}
