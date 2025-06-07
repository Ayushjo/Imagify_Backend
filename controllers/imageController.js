import { User } from "../models/userModels.js";
import FormData from "form-data";
import axios from "axios";
export const generateImage = async (req, res) => {
  try {
    const { userId, prompt } = req.body;
    const user = await User.findById(userId);
    if (!user || !prompt) {
      return res.status(404).json({ message: "Missing Details!" });
    }
    if (user.creditbalance < 0 || user.creditbalance === 0) {
      return res.status(400).json({
       
        message: "Not enough credits",
        credits: user.creditbalance,
      });
    }

    const form = new FormData();
    form.append("prompt", prompt);

    const { data } = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      form,
      {
        headers: {
          "x-api-key": process.env.CLIPDROP_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );
    const base64Image = Buffer.from(data, "binary").toString("base64");
    const resultImage =  `data:image/png;base64,${base64Image}`

    await User.findByIdAndUpdate(user._id,{creditbalance:user.creditbalance-1})
    return res.status(200).json({message:"Image generated",image:resultImage,creditbalance:user.creditbalance-1})

  } catch (error) {
    console.log(error);
    return res.status(400).json({ message:error.message});
  }
};
