import { statusCodes } from "better-auth";
import status from "http-status";
import z from "zod/v3";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interfaces";



export const handleZodError=(err:z.ZodError):TErrorResponse=>{


    
   const  statusCodes=status.BAD_REQUEST;
   const  message=" zod validation error";
   const errorSources:TErrorSources[] =[];

    err.issues.forEach(issue =>{
      errorSources.push({
        path:issue.path.join(" "),
        message:issue.message

      })
    })

    return{
        success:false,
        message,
        errorSources,
      statusCodes
    }


}