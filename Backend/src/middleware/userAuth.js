import jwt from "jsonwebtoken";

const userAuth = async(req,res,next)=>{
    try {
        const {token} = req.cookies;
        if(!token){
            return res.status(400).json({success : false , message : "Not Authorized Login Again"})
        }

        //verify the token
        const decode = jwt.verify(token,process.env.JWT_SECRET);
        if(decode.id){
            req.body.userId = decode.id;
        }else{
            return res.status(400).json({success : false , message : "Not Authorized.Login Again"})
        } 
        next();

    } catch (error) {
        console.log("error in userAuth middleware",error.message)
        res.status(500).json({success : false , message : error.message})    
    }
}

export default userAuth; 