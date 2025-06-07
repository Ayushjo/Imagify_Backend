import jwt from "jsonwebtoken"

export const userAuth = async(req,res,next)=>{
    const {token} = req.headers

    if(!token){
        return res.json({status:400,message:"Not authorized please login again"})
    }
    else{
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const id = decodedToken.id
        if(!id){
            res.json({status:400,message:"Something went wrong"})
        }
        req.body = req.body || {};
        req.body.userId = id;
        
        next()
    }
}