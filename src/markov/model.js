export default class Model {
    constructor() {
        this.tokens = [];
        this.connections = new Map();
        this.lookup = new Map();
        this.owners = [];
    }

    /**
     * Get id from token
     * @param {string} token 
     * @returns {integer}
     */

    id(token) {
        return this.lookup.get(token) ?? null;
    }

    /**
     * Get token from id
     * @param {integer} id 
     * @returns {any}
     */

    token(id) {
        return this.tokens[id] ?? null;
    }

    /**
     * Create if doesn't exist and return token id
     * @param {any} value 
     * @param {integer} owner 
     * @returns {integer}
     */

    instantiate(value, owner) {
        let id = this.lookup.get(value);

        if (id === undefined) {
            id = this.tokens.length;
            this.lookup.set(value, id);
            this.tokens.push([value, [owner]]);
        } else {
            const owners = this.tokens[id][1];
            if (!owners.includes(owner)) {
                owners.push(owner);
            }
        }

        return id;
    }

    /**
     * Connect the token to the context
     * @param {any} context 
     * @param {any} token 
     * @param {integer} owner 
     */

    connect(context, token, owner) {

        // Id of the token
        let tokenId = this.instantiate(token, owner);

        // Id of the context
        let contextId = this.instantiate(context, owner)

        let connection = this.connections.get(contextId);

        if (!connection) {
            connection = new Map();
            this.connections.set(contextId, connection);
        }

        connection.set(tokenId, (connection.get(tokenId) ?? 0) + 1);
    }

    /**
     * Build connections from an array of tokens with a context amount
     * @param {array} array 
     * @param {integer} recall 
     * @param {integer} owner 
     */

    /* 
    the only reason this has comments is because i forgot how it worked and i dont want 
    to forget again 
    */
    build(array, recall, owner) {
        // subtract 1 because context must be len - 1 
        // make sure the recall isn't too high
        const layer = Math.min(array.length - 1, recall);
        // [1, 2, 3, 4, 5] len = 5, 5 - 2 = 3
        // 3 possible tokens with a 2 context
        const tokens = array.length - layer;
        if (layer > 0) {
            for (let i = 0; i < tokens; i++) {
                // Array.prototype.slice() will not include the last index
                // join from i to i + layer - 1
                const context = array.slice(i, i + layer).join('');
                // token is i + layer
                const token = array[i + layer];
                // connection
                this.connect(context, token, owner);
            }
        }
    }
}
