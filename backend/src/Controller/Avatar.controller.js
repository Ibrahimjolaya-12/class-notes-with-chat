import Avatar from "../Models/Avatar.Model.js";
import { v2 as cloudinary } from "cloudinary";
import { uploadOnCloudinary } from "../Utils/Cloudinary.js";
import { User } from "../Models/Auth.model.js";

export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const localFilePath = req.file?.path;

    if (!localFilePath) {
      return res.status(400).json({ success: false, message: "Please select an image!" });
    }

    const uploadedResponse = await uploadOnCloudinary(localFilePath);
    if (!uploadedResponse) {
      return res.status(500).json({ success: false, message: "Upload to Cloudinary failed" });
    }

    const oldAvatar = await Avatar.findOne({ user: userId });
    if (oldAvatar?.publicId) {
      await cloudinary.uploader.destroy(oldAvatar.publicId);
    }

    const avatar = await Avatar.findOneAndUpdate(
      { user: userId },
      { 
        avatarUrl: uploadedResponse.secure_url, 
        publicId: uploadedResponse.public_id 
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Avatar saved successfully",
      avatar,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyAvatar = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    const avatar = await Avatar.findOne({ user: userId });

    if (avatar) {
      return res.status(200).json({
        success: true,
        avatar: avatar.avatarUrl,
      });
    }

    return res.status(200).json({
      success: true,
      avatar: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateSemester = async (req, res) => {
  try {
    const { semester } = req.body;
    if (!semester) {
      return res.status(400).json({ success: false, message: "Semester is required" });
    }

    const userId = req.user?.id || req.user?._id;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { semester },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      success: true,
      semester: updatedUser.semester,
    });
  } catch (error) {
    console.error("SEMESTER UPDATE ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, semester } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name: name.trim(), 
        ...(semester && { semester }) 
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        semester: updatedUser.semester,
      },
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};