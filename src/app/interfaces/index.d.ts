
import { IRequestUser } from "./IRequestUser.Interface";
declare global {
    namespace Express{
        interface Request{
            user?:IRequestUser
        }
    }
} 