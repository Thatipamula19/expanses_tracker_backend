import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ActiveUserType } from "../interfaces/active-user.interface";

export const ActiveUser = createParamDecorator((filed: keyof ActiveUserType | undefined, context: ExecutionContext)=>{
    const request = context.switchToHttp().getRequest();
    const user: ActiveUserType = request.user;
    return filed ? user?.[filed] : user;
})