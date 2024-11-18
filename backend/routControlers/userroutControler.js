import User from "../Models/userModels.js";
import bcryptjs from 'bcryptjs';
import jwtToken from '../utils/jwtwebToken.js';

export const userRegister = async (req, res) => {
    try {
        const { fullname, username, email, gender, password, profilepic } = req.body;
        console.log(req.body);
        const user = await User.findOne({ username, email });
        if (user) return res.status(500).send({ success: false, message: "Username or email already exists." });
        const hashPassword = bcryptjs.hashSync(password, 10);
        const profileBoy = profilepic || `https://avatar.iran.liara.run/public/boy?username=${username}`;
        const profileGirl = profilepic || `https://avatar.iran.liara.run/public/girl?username=${username}`;

        const newUser = new User({
            fullname,
            username,
            email,
            password: hashPassword,
            gender,
            profilepic: gender === "male" ? profileBoy : profileGirl
        });

        if (newUser) {
            await newUser.save();
            jwtToken(newUser._id, res);
        } else {
            res.status(500).send({ success: false, message: "Invalid user data." });
        }

        res.status(201).send({
            _id: newUser._id,
            fullname: newUser.fullname,
            username: newUser.username,
            profilepic: newUser.profilepic,
            email: newUser.email,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "An error occurred while registering the user.",
        });
        console.log(error);
    }
};

export const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(500).send({ success: false, message: "Email does not exist. Please register first." });
        const comparePasss = bcryptjs.compareSync(password, user.password || "");
        if (!comparePasss) return res.status(500).send({ success: false, message: "Incorrect email or password." });
        
        jwtToken(user._id, res);

        res.status(200).send({
            _id: user._id,
            fullname: user.fullname,
            username: user.username,
            profilepic: user.profilepic,
            email: user.email,
            message: "Successfully logged in."
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "An error occurred while logging in.",
        });
        console.log(error);
    }
};

export const userLogOut = async (req, res) => {
    try {
        res.cookie("jwt", '', {
            maxAge: 0
        });
        res.status(200).send({ success: true, message: "User successfully logged out." });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "An error occurred while logging out.",
        });
        console.log(error);
    }
};
