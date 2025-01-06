import User from "../models/userModel.js";

export const getUserData = async (req,res) =>{
    try {
        const {userId} = req.body;
        const user = await User.findById(userId);
        if(!user){
            return res.json({sucess :false , message : "user Not found"});   
        };
        res.json({
            success : true,
            userData : {
                name : user.name,
                isAccountVerified : user.isAccountVerified
            }
        })
        
    } catch (error) {
        
    }
}