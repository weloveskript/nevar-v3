module.exports = class MathUtil{

    /**
     * Check if a is lower than b
     */
    static isLowerThan(a, b){
        return a < b;
    }

    /**
     * Check if a is greater than b
     */
    static isGreaterThan(a, b){
        return a > b;
    }

    /**
     * Check if c is between a and b
     */
    static isBetween(c, a, b) {
        return c >= a && c <= b;
    }

    /**
     * Check if a is negative
     */
    static isNegative(a){
        return a < 0;
    }

    /**
     * Check if a is positive
     */
    static isPositive(a){
        return a > 0;
    }

    /**
     * Check if a is 0
     */
    static isZero(a){
        return a === 0;
    }

    /**
     * Check if a is even
     */
    static isEven(a){
        return a % 2 === 0;
    }

    /**
     * Check if a is odd
     */
    static isOdd(a){
        return a % 2 !== 0;
    }

}

