"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.HeatingType = exports.TransactionType = exports.PropertyStatus = exports.PropertyType = void 0;
// Property Types
var PropertyType;
(function (PropertyType) {
    PropertyType["APARTMENT"] = "APARTMENT";
    PropertyType["HOUSE"] = "HOUSE";
    PropertyType["LAND"] = "LAND";
    PropertyType["OFFICE"] = "OFFICE";
    PropertyType["COMMERCIAL"] = "COMMERCIAL";
    PropertyType["GARAGE"] = "GARAGE";
    PropertyType["STUDIO"] = "STUDIO";
    PropertyType["PENTHOUSE"] = "PENTHOUSE";
    PropertyType["VILLA"] = "VILLA";
    PropertyType["COTTAGE"] = "COTTAGE";
})(PropertyType || (exports.PropertyType = PropertyType = {}));
var PropertyStatus;
(function (PropertyStatus) {
    PropertyStatus["AVAILABLE"] = "AVAILABLE";
    PropertyStatus["RESERVED"] = "RESERVED";
    PropertyStatus["SOLD"] = "SOLD";
    PropertyStatus["RENTED"] = "RENTED";
})(PropertyStatus || (exports.PropertyStatus = PropertyStatus = {}));
var TransactionType;
(function (TransactionType) {
    TransactionType["SALE"] = "SALE";
    TransactionType["RENT"] = "RENT";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var HeatingType;
(function (HeatingType) {
    HeatingType["CENTRAL"] = "CENTRAL";
    HeatingType["GAS"] = "GAS";
    HeatingType["ELECTRIC"] = "ELECTRIC";
    HeatingType["DISTRICT"] = "DISTRICT";
    HeatingType["WOOD"] = "WOOD";
    HeatingType["HEAT_PUMP"] = "HEAT_PUMP";
    HeatingType["OTHER"] = "OTHER";
})(HeatingType || (exports.HeatingType = HeatingType = {}));
// User Types
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["AGENT"] = "AGENT";
    UserRole["USER"] = "USER";
})(UserRole || (exports.UserRole = UserRole = {}));
