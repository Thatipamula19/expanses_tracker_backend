import { HttpException, HttpStatus } from "@nestjs/common"

export class userAlreadyExitsException extends HttpException {
    constructor( filedName: string, filedValue: string){
        super(`User with the given ${filedName}: '${filedValue}' is already exits`, HttpStatus.CONFLICT);
    }
}