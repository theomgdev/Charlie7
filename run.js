const fs = require('fs');
const debug = true;

const context = 100; // -1 for unlimited context

String.prototype.tokenize = function(len = 2) {
    return this.match(new RegExp(`.{1,${len}}`, 'g'));
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

            if(context && context != -1 && dist > context) {
                break;
            }

            tokenTree[srcToken][dist] = tokenTree[srcToken][dist] || {};
            tokenTree[srcToken][dist][destToken] = tokenTree[srcToken][dist][destToken] || 0;
            tokenTree[srcToken][dist][destToken] += 0.000001;
        }
    }

    return tokenTree;
}

function next(tokenTree, text, limit = 5) {
    let tokens = text.tokenize();

    let suggestions = {};

    for (let src = 0; src < tokens.length - 1; src++) {
        const srcToken = tokens[src];
        const dist = tokens.length - src;

        if (!tokenTree[srcToken] || !tokenTree[srcToken][dist]) {
            continue;
        }

        for (const [destToken, prob] of Object.entries(tokenTree[srcToken][dist])) {
            suggestions[destToken] = suggestions[destToken] || 0;
            suggestions[destToken] += prob / dist;
        }
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

    for (let repeat = 0; repeat < length; repeat++) {
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
    let data = fs.readFileSync('ottoman_wikipedia.txt').toString();
    let tree = train(data);

    console.log(next(tree, 'Osmanlı büyük ve güçlü bir devletti', 5));

    complete(tree, 'Osmanlı büyük ve güçlü bir devletti', 100);
}

test();