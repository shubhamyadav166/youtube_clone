import mongoose, { Schema } from 'mongoose';
const subscriptionSchema = new Schema({
    subscriber: {
        type: mongoose.Schema.Types.ObjectId, // subsciber channel id 
        ref: "User",
    },
    channel: {
        type: mongoose.Schema.Types.ObjectId, //Channel id to whome "subscriber is  subscribing"
        ref: "User"
    }
}, { timestamps: true })

export const Subscription = mongoose.model("Subscription", subscriptionSchema)