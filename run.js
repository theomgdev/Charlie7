const fs = require('fs');

/**
 * Charlie7 class for text generation using Unique Charlie7 algorithm
 */
class Charlie7 {
    /**
     * @param {Object} options - Configuration options
     * @param {number} options.tokenLength - Length of each token
     * @param {number} options.context - Context size for token relationships
     * @param {boolean} options.debug - Enable debug mode
     */
    constructor(options = {}) {
        this.tokenizer = options.tokenizer || 'split';
        this.tokenLength = options.tokenLength || 2;
        this.context = options.context || 100;
        this.debug = options.debug || false;
        this.tokenTree = {};
    }

    /**
     * Tokenize a string
     * @param {string} str - String to tokenize
     * @returns {string[]} Array of tokens
     */
    tokenize(str) {
        switch (this.tokenizer) {
            default:
                return str.match(new RegExp(`.{1,${this.tokenLength}}`, 'gs')) || [];
        }
    }

    /**
     * Detokenize an array of tokens
     * @param {string[]} tokens - Array of tokens
     * @returns {string} Detokenized string
     */
    detokenize(tokens) {
        switch (this.tokenizer) {
            default:
                return Array.isArray(tokens) ? tokens.join('') : tokens;
        }
    }

    /**
     * Log debug messages
     * @param {string} message - Message to log
     * @param {boolean} inline - Whether to log inline
     */
    debugLog(message, inline = false) {
        if (this.debug) {
            if (inline) {
                process.stdout.write(message);
            } else {
                console.log(message);
            }
        }
    }

    /**
     * Display debug progress bar
     * @param {number} current - Current progress
     * @param {number} total - Total steps
     */
    debugProgressBar(current, total) {
        if (this.debug) {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`Progress: ${current}/${total} (${Math.round((current / total) * 100)}%)`);
        }
    }

    /**
     * Train the Unique Charlie7 model
     * @param {string} text - Input text for training
     */
    train(text) {
        const tokens = this.tokenize(text);

        for (let src = 0; src < tokens.length - 1; src++) {
            const srcToken = tokens[src];

            if (!this.tokenTree[srcToken]) {
                this.tokenTree[srcToken] = {};
            }

            for (let dest = src + 1; dest < tokens.length && (this.context === -1 || dest - src <= this.context); dest++) {
                const destToken = tokens[dest];
                const dist = dest - src;

                if (!this.tokenTree[srcToken][dist]) {
                    this.tokenTree[srcToken][dist] = {};
                }

                if (!this.tokenTree[srcToken][dist][destToken]) {
                    this.tokenTree[srcToken][dist][destToken] = 0;
                }

                this.tokenTree[srcToken][dist][destToken] += 0.000001;
            }

            this.debugProgressBar(src, tokens.length - 1);
        }
    }

    /**
     * Get next token suggestions
     * @param {string} text - Input text
     * @param {number} limit - Limit of suggestions
     * @returns {string[]} Array of suggested tokens
     */
    next(text, limit = 5) {
        const tokens = this.tokenize(text);
        const suggestions = {};

        for (let src = 0; src < tokens.length; src++) {
            const srcToken = tokens[src];
            const dist = tokens.length - src;

            if (this.tokenTree[srcToken] && this.tokenTree[srcToken][dist]) {
                for (const [destToken, prob] of Object.entries(this.tokenTree[srcToken][dist])) {
                    if (!suggestions[destToken]) {
                        suggestions[destToken] = 0;
                    }

                    suggestions[destToken] += prob;
                }
            }
        }

        return Object.entries(suggestions)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit)
            .map(([token]) => token);
    }

    /**
     * Complete the given text
     * @param {string} text - Input text to complete
     * @param {number} length - Desired completion length
     * @param {number} limit - Limit of suggestions for each step
     * @param {boolean} random - Whether to choose random suggestions
     * @returns {string} Completed text
     */
    complete(text, length = 100, limit = 5, random = false) {
        this.debugLog("[START OF COMPLETION]");
        this.debugLog(text, true);

        for (let i = 0; i < length; i++) {
            const nextTokens = this.next(text, limit);

            if (nextTokens.length === 0) break;

            const selectIdx = random ? Math.floor(Math.random() * nextTokens.length) : 0;
            const nextToken = this.detokenize(nextTokens[selectIdx]);

            this.debugLog(nextToken, true);
            text += nextToken;
        }

        this.debugLog("\n[END OF COMPLETION]");
        return text;
    }
}

/**
 * TextGenerator class that uses Charlie7 for text generation
 */
class TextGenerator extends Charlie7 {
    /**
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        super(options);
    }

    /**
     * Load and train the model
     */
    loadAndTrain(path) {
        try {
            const data = fs.readFileSync(path, 'utf8');
            this.train(data);
            console.log("Model trained successfully.");
        } catch (error) {
            console.error("Error loading or training the model:", error.message);
        }
    }

    /**
     * Generate text based on a random seed
     * @param {number} length - Desired generation length
     * @param {boolean} random - Whether to use random selection
     * @returns {string} Generated text
     */
    generate(length = 100, random = false, limit = 5) {
        const seed = (Math.random() + 1).toString(36).substring(7, 7 + this.tokenLength);
        return this.complete(seed, length, limit, random);
    }
}

// Example usage
function test() {
    const generator = new TextGenerator({
        tokenizer: 'split',
        tokenLength: 2,
        context: 100,
        debug: true
    });

    generator.loadAndTrain('DATA/ottoman_wikipedia.txt');

    console.log(generator.next('turkish'));
    generator.complete('turkish ', 100);
    generator.generate();
}

test();

module.exports = { Charlie7, TextGenerator };