export default class Model {
    constructor() {
        this.tokens = [];
        this.connections = new Map();
        this.lookup = new Map();
        this.owners = [];
    }

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

    connect(token, context, owner) {

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
}
