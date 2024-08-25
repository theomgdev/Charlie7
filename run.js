const fs = require('fs');

const debug = true;

String.prototype.tokenize = function(len = 3) {
    return this.toLowerCase().match(new RegExp(`.{1,${len}}`, 'g'));
}

function debugLog(message, inline = false) {
    if (debug) {
        if (inline) {
            process.stdout.write(message);
        } else {
            console.log(message);
        }
    }
}

function train(text, tokenTree = {}) {
    let tokens = text.tokenize();

    for (let src = 0; src < tokens.length - 1; src++) {
        const srcToken = tokens[src];

        if (!tokenTree[srcToken]) {
            tokenTree[srcToken] = {};
        }

        for (let dest = src + 1; dest < tokens.length; dest++) {
            const destToken = tokens[dest];
            const dist = dest - src;

            tokenTree[srcToken][dist] = tokenTree[srcToken][dist] || {};
            tokenTree[srcToken][dist][destToken] = tokenTree[srcToken][dist][destToken] || 0;
            tokenTree[srcToken][dist][destToken] += 0.000001;
        }
    }

    return tokenTree;
}

function next(tokenTree, text, limit = 5) {
    let tokens = text.tokenize();
    let lastToken = tokens[tokens.length - 1];

    if (!tokenTree[lastToken]) {
        return [];
    }

    let suggestions = {};

    for (let token in tokenTree[lastToken]) {
        suggestions[token] = suggestions[token] || 0;
        suggestions[token] += tokenTree[lastToken][token];
    }

    suggestions = Object.keys(suggestions).sort((a, b) => {
        return suggestions[b] - suggestions[a];
    });

    suggestions = suggestions.slice(0, limit);

    return suggestions;
}

function complete(tokenTree, text, length = 100) {
    tokenTree = train(text, tokenTree, 1);

    debugLog("[START OF COMPLETION]");
    debugLog(text, true);

    for (let repeat = 0; repeat < length; i++) {
        const nextTokens = next(tokenTree, text, 1);

        if (nextTokens.length === 0) {
            break;
        }

        const nextToken = nextTokens[0];

        debugLog(nextToken, true);

        text = text + nextTokens[0];
    }

    debugLog("\n[END OF COMPLETION]");

    return text;
}

function test() {
    let data = fs.readFileSync('movie_lines.txt').toString();
    let tree = train("Benim adım Cahit. Benim adım halit değil.");

    console.log(tree);

    //complete(tree, 'well what', 100);
}

test();