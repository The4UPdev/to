function runCode() {
    const code = document.getElementById('codeInput').value;
    const outputElement = document.getElementById('output');
    outputElement.textContent = '';

    const interpreter = new ToInterpreter(outputElement);
    interpreter.interpret(code);
}

class ToInterpreter {
    constructor(outputElement) {
        this.variables = {};
        this.outputElement = outputElement;
    }

    parseLine(line) {
        // Remove comments
        line = line.replace(/\/\/.*/, '').trim();
        if (!line) return null;

        // Variable declaration
        if (line.startsWith('let')) {
            const parts = line.split('=');
            const varName = parts[0].trim().split(' ')[1];
            const expression = parts[1].trim();
            return ['assign', varName, expression];
        }

        // Print statement
        if (line.startsWith('print')) {
            const content = line.slice(6, -1).trim(); // Remove 'print(' and ')'
            return ['print', content];
        }

        // If statement
        if (line.startsWith('if')) {
            const condition = line.slice(3).trim();
            return ['if', condition];
        }

        // End statement
        if (line === 'end') return ['end'];

        return ['expression', line];
    }

    evaluateExpression(expression) {
        for (const varName in this.variables) {
            const regex = new RegExp(`\\b${varName}\\b`, 'g');
            expression = expression.replace(regex, this.variables[varName]);
        }
        return eval(expression);
    }

    interpret(code) {
        const lines = code.split('\n');
        let i = 0;

        while (i < lines.length) {
            const line = lines[i].trim();
            const [command, ...args] = this.parseLine(line) || [];

            if (!command) {
                i++;
                continue;
            }

            if (command === 'assign') {
                const [varName, expression] = args;
                this.variables[varName] = this.evaluateExpression(expression);
            } else if (command === 'print') {
                const content = args[0];
                const output = content.split(',').map(part => {
                    part = part.trim();
                    if (part.startsWith('"') && part.endsWith('"')) {
                        return part.slice(1, -1);
                    }
                    return this.evaluateExpression(part);
                }).join('');
                this.outputElement.textContent += output + '\n';
            } else if (command === 'if') {
                const condition = args[0];
                if (!this.evaluateExpression(condition)) {
                    while (i < lines.length && lines[i].trim() !== 'end') {
                        i++;
                    }
                }
            } else if (command === 'end') {
                // No action needed for 'end'
            }

            i++;
        }
    }
}
