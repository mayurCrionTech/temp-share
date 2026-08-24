const crypto = require('crypto');

const BUSINESS_UNIT_TOKEN_EXPIRY_MINUTES = 5;
const BUSINESS_UNIT_TOKEN_LENGTH = 24;

/**
 * Generates a random numeric BusinessUnitToken of specified length
 * @returns {string} The generated BusinessUnitToken
 */
const generateBusinessUnitToken = () => {
    const digits = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let businessUnitToken = '';
    for (let i = 0; i < BUSINESS_UNIT_TOKEN_LENGTH; i++) {
        businessUnitToken += digits[crypto.randomInt(0, digits.length)];
    }
    return businessUnitToken;
};

/**
 * Checks if an BusinessUnitToken is expired
 * @param {Date} businessUnitTokenCreatedAt - The timestamp when BusinessUnitToken was created
 * @returns {boolean} True if BusinessUnitToken is expired, false otherwise
 */
const isBusinessUnitTokenExpired = (businessUnitTokenCreatedAt) => {
    if (!businessUnitTokenCreatedAt) return true;
    const expiryTime = new Date(businessUnitTokenCreatedAt.getTime() + (BUSINESS_UNIT_TOKEN_EXPIRY_MINUTES * 60 * 1000));
    return new Date() > expiryTime;
};

module.exports = {
    generateBusinessUnitToken,
    isBusinessUnitTokenExpired,
    BUSINESS_UNIT_TOKEN_EXPIRY_MINUTES
}; 