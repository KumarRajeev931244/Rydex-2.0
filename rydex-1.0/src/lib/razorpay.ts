import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id:process.env.RAZORPAY_API_ID,
    key_secret:process.env.RAZORPAY_SECRET
})

export default razorpay