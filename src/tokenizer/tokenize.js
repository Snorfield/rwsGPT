/**
 * Is the character a symbol?
 * @param {string} character 
 * @returns 
 */

function symbol(character) {
    return [
        '.',
        '-',
        '!',
        '?',
        ':',
        ',',
        '"',
        '(',
        ')',
        '[',
        ']',
        '{',
        '}'
    ].includes(character);
}

/**
 * Is the character a space?
 * @param {string} character 
 * @returns 
 */

function space(character) {
    return character === ' ';
}

/**
 * Is the character a letter?
 * @param {string} character 
 * @returns {boolean}
 */

function letter(character) {
    return /\p{L}/u.test(character);
}

/**
 * Decide on if to proceed or end the token
 * @param {string} w
 * @param {string} x 
 * @param {string} y 
 * @param {string} z 
 * @returns {boolean}
 */

function ruleset(w, x, y, z) {
    if (y === null) return false;
    if (space(y)) return false;
    if (space(w) && symbol(x) && (letter(y) || (y === null))) return false;
    if (letter(x) && symbol(y) && (symbol(z) || space(z) || (z === null))) return false;
    return true;
}

/**
 * Tokenize input strings and return an array of tokens
 * @param {string} string
 * @returns {array} 
 */

export default function tokenize(string) {
    let tokens = [];

    let token = '';

    for (let i = 0; i < string.length; i++) {
        
        // Context window
        const w = string[i - 1] ?? null;
        const x = string[i];
        const y = string[i + 1] ?? null;
        const z = string[i + 2] ?? null;

        token += x;

        if (!ruleset(w, x, y, z)) {
            tokens.push(token);
            token = '';
        }
    }

    return tokens;
}
