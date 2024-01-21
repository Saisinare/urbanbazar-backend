const User = require("../../models/User");

exports.getUser = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findById(userId).select(
      "-password -_id -__v -cart"
    );
    if (user) {
      res.status(200).json({ msg: "User Retrive SuccessFully", user: user });
    } else {
      res.status(404).json({ err: "User Not Found" });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.putUser = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findByIdAndUpdate(userId, { isSeller: true });
    if (user) {
      res.status(200).json({ msg: "User Updated SuccessFully", user: user });
    } else {
      res.status(200).json({ msg: "No User Found" });
    }
  } catch (err) {
    res.status(400).json({ err: "Updation Failed" });
  }
};

exports.updateUser = async (req, res) => {
  const userId = req.userid;
  const updateInfo = req.body;
  const restrictedFields = ["_id", "password"];

  for (const key in updateInfo) {
    if (restrictedFields.includes(key)) {
      console.log("hello");
      return res
        .status(500)
        .json({ success: false, err: "Some Internal Error" });
    }
  }
  try {
    const user = await User.findOneAndUpdate(userId, updateInfo);
    if (user) {
      res
        .status(200)
        .json({ success: true, msg: "Information Update Successfully..!" });
    } else {
      console.log("not hello");
      res.status(500).json({ success: false, err: "Some Internal Error" });
    }
  } catch (err) {
    res.status(500).json({ success: false, err: "Some Internal Error" });
  }
};

exports.postProfilePhoto = async (req, res) => {
  const userId = req.userId;
  const filename = req.file.filename;
  try {
    const user = await User.findOneAndUpdate({_id:userId}, {
      profilePhoto: filename,
    });
    if (user) {
      res
        .status(200)
        .json({ success: true, msg: "profile photo uploaded succesfully" ,profilePhoto:filename});
    }else{
      res
      .status(500)
      .json({ success: true, msg: "internal server error" });
    }
  } catch (err) {
    console.log(err);
  }
};
