export class Calculator {
  private display: string = '0';
  private expression: string = '';
  private lastOperation: string | null = null;
  private waitingForNewNumber: boolean = true;
  private history: Array<{ expression: string; result: string }> = [];

  getDisplay(): string {
    return this.display;
  }

  getExpression(): string {
    return this.expression;
  }

  getHistory(): Array<{ expression: string; result: string }> {
    return [...this.history];
  }

  inputNumber(num: string): void {
    if (this.waitingForNewNumber) {
      this.display = num;
      this.waitingForNewNumber = false;
    } else {
      this.display = this.display === '0' ? num : this.display + num;
    }
  }

  inputDecimal(): void {
    if (this.waitingForNewNumber) {
      this.display = '0.';
      this.waitingForNewNumber = false;
    } else if (this.display.indexOf('.') === -1) {
      this.display += '.';
    }
  }

  inputOperation(operation: string): void {
    if (!this.waitingForNewNumber) {
      if (this.expression && this.lastOperation) {
        this.calculate();
      } else {
        this.expression = this.display;
      }
    }

    this.lastOperation = operation;
    this.expression += ` ${this.getOperationSymbol(operation)} `;
    this.waitingForNewNumber = true;
  }

  calculate(): void {
    if (!this.expression || !this.lastOperation) return;

    try {
      const fullExpression = this.expression + this.display;
      const result = this.evaluateExpression(fullExpression);
      
      this.history.unshift({
        expression: fullExpression,
        result: result.toString()
      });

      if (this.history.length > 10) {
        this.history = this.history.slice(0, 10);
      }

      this.display = result.toString();
      this.expression = '';
      this.lastOperation = null;
      this.waitingForNewNumber = true;
    } catch (error) {
      this.display = 'Error';
      this.clear();
    }
  }

  clear(): void {
    this.display = '0';
    this.expression = '';
    this.lastOperation = null;
    this.waitingForNewNumber = true;
  }

  clearEntry(): void {
    this.display = '0';
    this.waitingForNewNumber = true;
  }

  backspace(): void {
    if (this.display.length > 1) {
      this.display = this.display.slice(0, -1);
    } else {
      this.display = '0';
      this.waitingForNewNumber = true;
    }
  }

  clearHistory(): void {
    this.history = [];
  }

  private getOperationSymbol(operation: string): string {
    switch (operation) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      case '/': return '÷';
      default: return operation;
    }
  }

  private evaluateExpression(expression: string): number {
    // Replace display symbols with actual operators
    const sanitized = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-');

    // Simple expression evaluation (for production, consider using a proper expression parser)
    return Function('"use strict"; return (' + sanitized + ')')();
  }
}
