const Model = require('./markov/model.js');
const tokenize = require('./tokenizer/tokenize.js');
const { sources, contextLimit } = require('./config.json');
const path = require('node:path');
const fs = require('node:fs');

const model = new Model();

for (const source of sources) {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, source.path)));
    const id = model.owners.length;
    model.owners.push([source.color, source.name]);
    console.log(`[+] Training model on ${source.name}`);
    let count = 0;
    for (const sentence of data) {
        model.assemble(tokenize(sentence), contextLimit, id);
        count++;
    }
    console.log(`[+] Training done on ${source.name}, ${count} sentence(s) trained upon`);
}

fs.writeFileSync(path.join(__dirname, './model.rwsm'), model.serialize());
