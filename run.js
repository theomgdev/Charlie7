const fs = require('fs');
const debug = true;

String.prototype.tokenize = function(len = 3) {
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

function debugProgressBar(current, total) {
    if (debug) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`Progress: ${current}/${total} (${Math.round((current / total) * 100)}%)`);
    }
}

function train(text, tokenTree = {}, context = 100) { // -1 for unlimited context
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

        debugProgressBar(src, tokens.length - 1);
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
            suggestions[destToken] = (suggestions[destToken] + prob) / 2;
        }
    }

    suggestions = Object.keys(suggestions).sort((a, b) => {
        return suggestions[b] - suggestions[a];
    });

    suggestions = suggestions.slice(0, limit);

    return suggestions;
}

function complete(tokenTree, text, length = 100, limit = 5,  random = false) {
    debugLog("[START OF COMPLETION]");
    debugLog(text, true);

    for (let repeat = 0; repeat < length; repeat++) {
        const nextTokens = next(tokenTree, text, limit);

        if (nextTokens.length === 0) {
            break;
        }
        let selectIdx = random ? Math.round(Math.random() * (nextTokens.length - 1)) : 0;
        const nextToken = nextTokens[selectIdx];

        debugLog(nextToken, true);

        text = text + nextToken;
    }

    debugLog("\n[END OF COMPLETION]");

    return text;
}

function test() {
    let data = fs.readFileSync('ottoman_wikipedia.txt').toString();
    let tree = train(data);

    console.log(next(tree, 'Well I don\'t want to talk about it', 5));

    complete(tree, 'Well I don\'t want to talk about it', 100);
}

test();