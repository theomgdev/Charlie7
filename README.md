# Unique Charlie7 Text Generation Model

The **Unique Charlie7 Text Generation Model** is a sophisticated algorithm designed for generating text based on patterns learned from input data. This model is particularly useful for tasks such as text completion, suggestion, and generation.

## Features

- **Tokenization and Detokenization**: Efficient handling of text into tokens and back.
- **Context-Aware Training**: Learning token relationships within a specified context size.
- **Debug Mode**: Option to enable detailed logging for debugging purposes.
- **Text Completion and Generation**: Capability to complete and generate text based on learned patterns.

## Installation

To use the Unique Charlie7 Text Generation Model, you need to have Node.js installed on your system. Clone this repository and install the required dependencies:

```bash
git clone https://github.com/theomgdev/Charlie7.git
cd unique-charlie7
npm install
```

## Usage

### Training the Model

To train the model, you need a text file containing the training data. Use the `TextGenerator` class to load and train the model:

```javascript
const { TextGenerator } = require('./path/to/charlie7');

async function trainModel() {
    const generator = new TextGenerator({
        tokenizer: 'split',
        tokenLength: 2,
        context: 100,
        debug: true
    });

    await generator.loadAndTrain('path/to/training/data.txt');
}

trainModel();
```

### Generating Text

Once the model is trained, you can generate text using the `generate` method:

```javascript
const generatedText = generator.generate(100, false, 5);
console.log(generatedText);
```

### Text Completion

You can also complete a given text using the `complete` method:

```javascript
const completedText = generator.complete('turkish ', 100, 5, false);
console.log(completedText);
```

## Example

Here is a complete example demonstrating the usage of the Unique Charlie7 Text Generation Model:

```javascript
const { TextGenerator } = require('./path/to/charlie7');

async function test() {
    const generator = new TextGenerator({
        tokenizer: 'split',
        tokenLength: 2,
        context: 100,
        debug: true
    });

    await generator.loadAndTrain('path/to/training/data.txt');

    console.log(generator.next('turkish'));
    generator.complete('turkish ', 100);
    generator.generate();
}

test();
```

## Contributing

Contributions are welcome! Please read the [contributing guidelines](CONTRIBUTING.md) to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please open an issue on the [GitHub repository](https://github.com/theomgdev/Charlie7/issues).