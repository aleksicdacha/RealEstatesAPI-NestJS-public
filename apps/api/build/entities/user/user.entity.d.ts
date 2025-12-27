import { Role } from './enums/role.enum';
export declare class User {
    id: number;
    username: string;
    email: string | null;
    password: string;
    role: Role;
    refreshTokenHash: string | null;
    lastLogoutTime: Date | null;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
}
