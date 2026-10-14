const Model = require('../markov/model.js');
const fs = require('node:fs');
const path = require('node:path');
const tokenize = require('../tokenizer/tokenize.js');

const model = Model.deserialize(fs.readFileSync(path.join(__dirname, '../model.rwsm'), 'utf-8'));

function hexToRgb(hex) {
    hex = hex.replace(/^#/, "");

    if (hex.length === 3) {
        hex = hex.split("").map(c => c + c).join("");
    }

    const bigint = parseInt(hex, 16);
    return [
        ((bigint >> 16) & 255),
        ((bigint >> 8) & 255),
        (bigint & 255)
    ];
}

function markov(seed, recall, limit, type) {

    // inital tokens
    let tokens = tokenize(seed);
    let raw = [...tokens];

    while (tokens.length <= limit) {
        // calculate max context
        let context = Math.min(tokens.length, recall);
        let match = false;
        let id = null;

        while (!match && context > 0) {
            // slice -context
            const token = tokens.slice(-context).join('');

            // generate variants of the token
            const variants = [
                token,
                token.toLowerCase(),
                token.trim(),
                token.toLowerCase().trim(),
                " " + token,
                " " + token.toLowerCase()
            ];

            for (const variant of variants) {
                // try to find a matching token
                const pointer = model.id(variant);
                // if ptr isn't null we know it's valid
                if (pointer !== null) {
                    // id is now the pointer
                    id = pointer;
                    // while loop will break
                    match = true;
                    break;
                }
            }

            // if no match from all variants, then reduce the context
            if (!match) {
                context--;
            }
        }

        // if no match was found max -> 1 context then we break
        if (!match) break;

        // get a ptr to the prediction
        const prediction = model.predict(id, type);

        // if not null (prediction will always return null if there isn't one), then add the token value to the tokens
        if (prediction !== null) {
            tokens.push(model.token(prediction)[0]);
            raw.push(model.token(prediction));
        } else {
            // if the prediction is null, there is no prediction. break NOW
            break;
        }
    }

    return raw;
}

function getANSI(r, g, b) {
    return `\u001b[38;2;${r};${g};${b}m`
}

function getANSIGradient(colors, text) {
    const characters = Array.from(text);
    if (characters.length === 0 || colors.length === 0) return '';

    const lastColor = colors.length - 1;
    return characters.map((character, index) => {
        const position = characters.length === 1 ? 0.5 : index / (characters.length - 1);
        const segment = Math.min(Math.floor(position * lastColor), lastColor - 1);
        const amount = position * lastColor - segment;
        const color = colors.length === 1
            ? colors[0]
            : colors[segment].map((channel, channelIndex) =>
                Math.round(channel + (colors[segment + 1][channelIndex] - channel) * amount)
            );

        return `${getANSI(color[0], color[1], color[2])}${character}`;
    }).join('');
}

function resetANSI() {
    return "\u001b[0m";
}

async function generate(interaction) {
    const seed = interaction.options.getString('seed');
    const type = interaction.options.getInteger('type') ?? 1;
    const context = interaction.options.getInteger('context') ?? 2;
    const colored = interaction.options.getBoolean('show_owner') ?? false;
    const limit = interaction.options.getInteger('tokens') ?? 50;

    const tokens = markov(seed, context, limit, type);

    if (colored) {
        const codeblock = '\`\`\`'

        let string = '';

        for (const token of tokens) {
            if (Array.isArray(token)) {
                if (token[1].length >= 2) {
                    // Make a gradient
                    string += getANSIGradient(token[1].map(x => hexToRgb(model.owners[x][0])), token[0])
                } else {
                    const rgb = hexToRgb(model.owners[token[1][0]][0]);
                    string += `${getANSI(rgb[0], rgb[1], rgb[2])}${token[0]}`
                }
            } else {
                string += `${resetANSI()}${token}`;
            }
        }
        interaction.reply(`${codeblock}ansi\n${string}${codeblock}`);
    } else {
        const array = tokens.map((token) => {
            if (Array.isArray(token)) {
                return token[0];
            } else {
                return token;
            }
        });
        interaction.reply(array.join(''));
    }
}

async function ping(interaction) {
    return interaction.reply('Pong');
}

async function owner(interaction) {
    const string = interaction.options.getString('token');
    const id = model.id(string);

    function message(id, variant) {
        const token = model.token(id);
        const owners = token[1];
        let text = '';
        for (let i = 0; i < owners.length; i++) {
            text += `${model.owners[owners[i]][1]}${(i === owners.length - 1) ? '' : ', '}`
        }
        return `${variant ? 'That doesn\'t exist but I found something similar.\n' : ''}\`${token[0]}\` was contributed by ${text}`;
    }

    if (id !== null) {
        return interaction.reply(message(id, false));
    } else {

        const variants = [
            string.toLowerCase(),
            ' ' + string,
            string.toUpperCase(),
            string.trim()
        ]

        for (const variant of variants) {
            let variantId = model.id(variant);
            if (variantId !== null) {
                return interaction.reply(message(variantId, true));
            }
        }

        return interaction.reply('Nah nobody owns that.')
    }
}

module.exports = {
    generate,
    ping,
    owner
};
