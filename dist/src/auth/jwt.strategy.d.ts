import { ConfigService } from '@nestjs/config';
import { UserService } from '@src/entities/user/user.service';
declare const JwtStrategy_base: any;
export declare class JwtStrategy extends JwtStrategy_base {
    private userService;
    private configService;
    constructor(userService: UserService, configService: ConfigService);
    validate(payload: any): Promise<{
        id: number;
        username: any;
        role: any;
    }>;
}
export {};
