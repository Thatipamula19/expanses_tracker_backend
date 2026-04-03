import { UserRole } from "@/common/enums";

export interface ActiveUserType {
    sub: number;
    email: string;
    role: UserRole;
}