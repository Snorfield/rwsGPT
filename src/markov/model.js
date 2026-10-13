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

        // Id of the context
        let contextId = this.instantiate(context, owner)

        // Id of the token
        let tokenId = this.instantiate(token, owner);

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

    /**
     * Build model from all context values in the range 1 to max
     * @param {array} array 
     * @param {integer} max 
     * @param {integer} owner 
     */

    assemble(array, max, owner) {
        const context = Math.min(array.length - 1, max);

        if (context > 0) {
            for (let i = 1; i <= max; i++) {
                this.build(array, i, owner);
            }
        }
    }

    /**
     * Deserialize from a valid json string
     * @param {string} json 
     * @returns {Model}
     */

    static deserialize(json) {
        json = JSON.parse(json);

        if (!json.tokens || !json.connections) {
            throw new Error('Fatal error: Field(s) missing from JSON')
        };

        const model = new Model();

        model.tokens = json.tokens;
        model.owners = json.owners;

        for (let i = 0; i < model.tokens.length; i++) {
            model.lookup.set(model.tokens[i], i);
        }

        for (const values of json.connections) {
            const transitions = new Map();
            for (let i = 1; i < values.length; i += 2) {
                transitions.set(values[i], values[i + 1]);
            }
            model.connections.set(values[0], transitions);
        }

        return model;
    }

    /**
     * Serialize the model into a string
     * @returns {string}
     */

    serialize() {
        let model = { version: 1.0, owners: this.owners, tokens: this.tokens, connections: [] };
        for (const [key, value] of this.connections) {
            let transitions = [key];
            for (const [token, count] of value) {
                transitions.push(...[token, count]);
            }
            model.connections.push(transitions);
        }

        return JSON.stringify(model);
    }
}
