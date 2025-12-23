"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_repository_1 = require("./user.repository");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nestjs_typeorm_paginate_1 = require("nestjs-typeorm-paginate");
const query_builder_helper_1 = require("../../common/query-builder.helper");
const nestjs_i18n_1 = require("nestjs-i18n");
let UserService = class UserService {
    userRepository;
    i18n;
    constructor(userRepository, i18n) {
        this.userRepository = userRepository;
        this.i18n = i18n;
    }
    async findAll(options, filters) {
        const queryBuilder = this.userRepository.createQueryBuilder('user');
        query_builder_helper_1.QueryBuilderHelper.applyQueryOptions(queryBuilder, options, filters);
        const totalItems = await queryBuilder.getCount();
        const items = await queryBuilder.getMany();
        return new nestjs_typeorm_paginate_1.Pagination(items, {
            totalItems,
            itemCount: items.length,
            itemsPerPage: options.limit || 10,
            totalPages: Math.ceil(totalItems / (options.limit || 10)),
            currentPage: options.page || 1,
        });
    }
    async findOne(id) {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new common_1.NotFoundException(this.i18n.t('errors.user.notFound', { lang: nestjs_i18n_1.I18nContext.current().lang }));
        }
        return user;
    }
    async create(createUserDto) {
        try {
            console.log('[UserService] Creating user:', createUserDto);
            console.log('[UserService] About to generate salt...');
            const salt = await bcrypt.genSalt();
            console.log('[UserService] Salt generated successfully');
            console.log('[UserService] About to hash password...');
            const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
            console.log('[UserService] Password hashed successfully');
            console.log('[UserService] About to create user entity...');
            const user = this.userRepository.create({
                ...createUserDto,
                password: hashedPassword,
            });
            console.log('[UserService] User entity created:', user);
            console.log('[UserService] About to save user to database...');
            const savedUser = await this.userRepository.save(user);
            console.log('[UserService] User saved to database successfully:', savedUser);
            return savedUser;
        }
        catch (error) {
            console.error('[UserService] Error creating user:', error);
            throw error;
        }
    }
    async updateUser(id, updateData) {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            throw new common_1.NotFoundException(this.i18n.t('errors.user.notFound', { lang: nestjs_i18n_1.I18nContext.current().lang }));
        }
        if (updateData.password) {
            const salt = await bcrypt.genSalt();
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }
        await this.userRepository.update(id, updateData);
        return this.userRepository.findOneBy({ id });
    }
    async deleteUser(id) {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(this.i18n.t('errors.user.notFound', { lang: nestjs_i18n_1.I18nContext.current().lang }));
        }
        return { message: `User with ID ${id} deleted successfully` };
    }
    async findByUsername(username) {
        return this.userRepository.findOne({ where: { username } });
    }
    async validateUser(username, pass) {
        console.log('Validate user fired !!!!');
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            console.log(`User with username ${username} not found.`);
            return null;
        }
        const isPasswordValid = await bcrypt.compare(pass, user.password);
        console.log(`Password comparison result: ${isPasswordValid}`);
        if (!isPasswordValid) {
            return null;
        }
        return user;
    }
    async setRefreshToken(userId, refreshToken) {
        const hashedToken = await bcrypt.hash(refreshToken, 10);
        await this.userRepository.update(userId, { refreshTokenHash: hashedToken });
    }
    async validateRefreshToken(userId, refreshToken) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user || !user.refreshTokenHash)
            return false;
        return bcrypt.compare(refreshToken, user.refreshTokenHash);
    }
    async updateRefreshToken(userId, refreshToken) {
        const salt = await bcrypt.genSalt();
        const hashedToken = await bcrypt.hash(refreshToken, salt);
        await this.userRepository.update(userId, { refreshTokenHash: hashedToken });
    }
    async clearRefreshToken(userId) {
        if (!userId) {
            throw new Error('User ID is required for clearing refresh token');
        }
        await this.userRepository.update({ id: userId }, { refreshTokenHash: null });
    }
    async updateLastLogoutTime(userId) {
        await this.userRepository.update(userId, { lastLogoutTime: new Date() });
    }
    async findByEmail(email) {
        return this.userRepository.findOne({ where: { email } });
    }
    async createPasswordResetToken(userId) {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(resetToken, 10);
        const resetPasswordExpires = new Date(Date.now() + 3600000);
        await this.userRepository.update(userId, {
            resetPasswordToken: hashedToken,
            resetPasswordExpires,
        });
        return resetToken;
    }
    async findByResetToken(token) {
        const users = await this.userRepository
            .createQueryBuilder('user')
            .where('user.resetPasswordToken IS NOT NULL')
            .andWhere('user.resetPasswordExpires > :now', { now: new Date() })
            .getMany();
        for (const user of users) {
            const isValid = await bcrypt.compare(token, user.resetPasswordToken);
            if (isValid) {
                return user;
            }
        }
        return null;
    }
    async resetPassword(userId, newPassword) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        await this.userRepository.update(userId, {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_repository_1.UserRepository)),
    __metadata("design:paramtypes", [user_repository_1.UserRepository,
        nestjs_i18n_1.I18nService])
], UserService);
//# sourceMappingURL=user.service.js.map