import { CookieOptions } from "better-auth";
import { Request, Response } from "express";
import ms from "ms";


const setCookie=(res:Response,key:string,value:string,options:CookieOptions)=>{
res.cookie(key,value,options as any)
}

const getCookie=(req:Request,key:string)=>{

    return req.cookies[key]
}

const clearCookie=(res:Response,key:string,options:CookieOptions)=>{
    res.clearCookie(key,options as any)
}



const setAccessTokenCookie=(res:Response,token:string)=>{
    const maxAge= ms(Number(process.env.ACCESS_TOKEN_EXPIRES_IN)!);
   setCookie(res,"accessToken",token,{

        httpOnly:true,
        secure:true,
        sameSite:"none",
        path:"/",
        maxAge:Number(maxAge)

    })
}

const setRefreshTokenCookie=(res:Response,token:string)=>{
    const maxAge= ms(Number(process.env.REFRESH_TOKEN_EXPIRES_IN)!);
    setCookie(res,"refreshToken",token,{
        httpOnly:true,
        secure:true,
        sameSite:"none",
        path:"/",
        maxAge:Number(maxAge)
    })
}

const setBetterAuthSessionCookie=(res:Response,sessionId:string)=>{
    const maxAge= ms(Number(process.env.REFRESH_TOKEN_EXPIRES_IN)!);
    setCookie(res,"betterAuthSession",sessionId,{      
        httpOnly:true,      
        secure:true,
        sameSite:"none",        
        path:"/",
        maxAge:Number(maxAge)
     })
}

export const cookieUtils={
    setCookie,
    getCookie,
    clearCookie,
    setAccessTokenCookie,
    setRefreshTokenCookie,
    setBetterAuthSessionCookie
}


