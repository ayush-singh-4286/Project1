const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    caption: {
        type: String
    },
    folderName: {
        type: String,
        required: true, // 🔥 Har photo kisi na kisi folder (e.g., "Bali Trip") ke andar jayegi
        trim: true
    },
    isThumbnail: {
        type: Boolean,
        default: false // 🔥 Agar true hoga, toh landing page par yeh us folder ka cover dikhega
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true }); // ⏱️ Isse automatic createdAt aur updatedAt milega, jisse date-time display hoga!

const postModel = mongoose.model("post", postSchema);
module.exports = postModel;