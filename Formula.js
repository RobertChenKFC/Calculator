const Types = { 
	NUM: "num",
	OP: "op",
	BRAC: "brac"
};

const Operators = {
	ADD: '+',
	SUB: '-',
	MULT: '*',
	DIV: '/'
};

const Brackets = {
	LFT: '(',
	RHT: ')'
};

const Type = (elem) => {
	if(typeof elem === "string" && elem.length === 1) {
		if(elem === Operators.ADD || elem === Operators.SUB ||
			elem === Operators.MULT || elem === Operators.DIV) return Types.OP;
		if(elem === Brackets.LFT || elem === Brackets.RHT) return Types.BRAC;
	}
	return Types.NUM;
};

class Formula {
	constructor() {
		this.form = [];
		this.latex = [];	
	}

	copy() {
		let cp = new Formula();
		this.form.forEach((elem) => {
			if(Type(elem) === Types.NUM) cp.form.push(elem.copy());
			else cp.form.push(elem);
		});
		this.latex.forEach((elem) => {
			cp.latex.push(elem);
		});
		return cp;
	}

	setFormula(str) {
		this.form = [];
		this.latex = [];

		let prevType = Type(str.charAt(0)), curType, curStr = str.charAt(0); 
		for(let i = 1; i < str.length; i++) {
			let c = str.charAt(i);
			curType = Type(c);

			if(curType !== prevType || curType !== Types.NUM) {
				if(prevType === Types.NUM) this.form.push(new Frac(curStr));
				else this.form.push(curStr);
				this.latex.push(curStr);

				curStr = c;
				prevType = curType;
			}
			else curStr += c;
		}
		if(prevType === Types.NUM) this.form.push(new Frac(curStr));
		else this.form.push(curStr);		
		this.latex.push(curStr);
	}

	calculateLatex(begin, end) {
		// Remove all brackets recursively
		const brackStk = [];
		let cur;
		for(let i = begin; i < end; i++) {
			cur = this.latex[i];
			if(Type(cur) === Types.BRAC) {
				if(brackStk.length === 0 && cur === Brackets.RHT)
					throw "Invalid bracket placement";

				if(cur === Brackets.LFT) brackStk.push(i);
				else {
					const newBegin = brackStk.pop() + 1, newEnd = i;
					const originalLen = this.latex.length;
					const res = this.calculateLatex(newBegin, newEnd);
					const newLen = this.latex.length;

					i = newBegin - 1;
					this.latex[i] = res;
					this.latex.splice(i + 1, 2);
					end -= 2 + (originalLen - newLen);
				}
			}
		} 

		// Division
		for(let i = begin; i < end; i++) {
			cur = this.latex[i];
			if(cur === Operators.DIV) {
				if(i === begin || i === end - 1 || 
					Type(this.latex[i - 1]) !== Types.NUM ||
					Type(this.latex[i + 1]) !== Types.NUM)
					throw "Invalid operand for operator \'/\'";
				
				// Remove brackets since fractions maintain it
				let a = this.latex[i - 1], b = this.latex[i + 1];
				if(a.charAt(0) === Brackets.LFT) 
					a = a.substr(1, a.length - 2);
				if(b.charAt(0) === Brackets.LFT)
					b = b.substr(1, b.length - 2);
				
				const res = "\\frac{" + a + "}{" + b + "}";

				i--;
				this.latex[i] = res;
				this.latex.splice(i + 1, 2);
				end -= 2;
			}
		}
		
		// Multiplication
		for(let i = begin; i < end; i++) {
			cur = this.latex[i];
			if(cur === Operators.MULT) {
				if(i === begin || i === end - 1 || 
					Type(this.latex[i - 1]) !== Types.NUM ||
					Type(this.latex[i + 1]) !== Types.NUM)
					throw "Invalid operand for operator \'*\'";
				
				const a = this.latex[i - 1], b = this.latex[i + 1];

				const res = a + "\\times" + b;

				i--;
				this.latex[i] = res;
				this.latex.splice(i + 1, 2);
				end -= 2;
			}
		}

		// Addition and subtraction
		for(let i = begin; i < end; i++) {
			cur = this.latex[i];
			if(cur === Operators.ADD || cur === Operators.SUB) {
				if(i === end - 1 || 
					Type(this.latex[i - 1]) !== Types.NUM ||
					Type(this.latex[i + 1]) !== Types.NUM)
					throw "Invalid operand for operator \'" + cur + "\'";
				
				const a = (i === begin) ? "" : this.latex[i - 1], 
					b = this.latex[i + 1];

				const res = a + cur + b;

				const isOperator = i != begin;
				if(isOperator) i--;
				this.latex[i] = res;
				this.latex.splice(i + 1, 1);
				end--;
				// Only remove another element if it is actually and operator
				// and not just a plus/minus sign
				if(isOperator) {
					this.latex.splice(i + 1, 1);
					end--;
				}
			}
		}

		// Add brackets for previous recursive call
		this.latex[begin] = Brackets.LFT + this.latex[begin] + Brackets.RHT;

		return this.latex[begin];
	}

	getLatex() {
		const cp = this.copy();
		let res = cp.calculateLatex(0, cp.latex.length);
		res = res.substr(1, res.length - 2);
		return res;
	}

	calculateValue(begin, end) {
		// Remove all brackets recursively
		const brackStk = [];
		let cur;
		for(let i = begin; i < end; i++) {
			cur = this.form[i];
			if(Type(cur) === Types.BRAC) {
				if(brackStk.length === 0 && cur === Brackets.RHT)
					throw "Invalid bracket placement";

				if(cur === Brackets.LFT) brackStk.push(i);
				else {
					const newBegin = brackStk.pop() + 1, newEnd = i;
					const originalLen = this.form.length;
					const res = this.calculateValue(newBegin, newEnd);
					const newLen = this.form.length;

					i = newBegin - 1;
					this.form[i] = res;
					this.form.splice(i + 1, 2);
					end -= 2 + (originalLen - newLen);
				}
			}
		} 

		// Division and multiplication
		for(let i = begin; i < end; i++) {
			cur = this.form[i];
			if(cur === Operators.DIV) {
				if(i === begin || i === end - 1 || 
					Type(this.form[i - 1]) !== Types.NUM ||
					Type(this.form[i + 1]) !== Types.NUM)
					throw "Invalid operand for operator \'/\'";
				
				const a = this.form[i - 1], b = this.form[i + 1];
								
				const res = Frac.div(a, b);

				i--;
				this.form[i] = res;
				this.form.splice(i + 1, 2);
				end -= 2;
			}
			else if(cur === Operators.MULT) {
				if(i === begin || i === end - 1 || 
					Type(this.form[i - 1]) !== Types.NUM ||
					Type(this.form[i + 1]) !== Types.NUM)
					throw "Invalid operand for operator \'*\'";
				
				const a = this.form[i - 1], b = this.form[i + 1];

				const res = Frac.mult(a, b);

				i--;
				this.form[i] = res;
				this.form.splice(i + 1, 2);
				end -= 2;
			}
		}
		
		// Addition and subtraction
		for(let i = begin; i < end; i++) {
			cur = this.form[i];
			if(cur === Operators.ADD) {
				if(i === end - 1 || 
					Type(this.form[i - 1]) !== Types.NUM ||
					Type(this.form[i + 1]) !== Types.NUM)
					throw "Invalid operand for operator \'+\'";
				
				const a = (i === begin) ? (new Frac()) : this.form[i - 1], 
					b = this.form[i + 1];

				const res = Frac.add(a, b);

				const isOperator = i != begin;
				if(isOperator) i--;
				this.form[i] = res;
				this.form.splice(i + 1, 1);
				end--;
				// Only remove another element if it is actually and operator
				// and not just a plus sign
				if(isOperator) {
					this.form.splice(i + 1, 1);
					end--;
				}
			}
			else if(cur === Operators.SUB) {
				if(i === end - 1 || 
					Type(this.form[i - 1]) !== Types.NUM ||
					Type(this.form[i + 1]) !== Types.NUM)
					throw "Invalid operand for operator \'-\'";
				
				const a = (i === begin) ? (new Frac()) : this.form[i - 1], 
					b = this.form[i + 1];

				const res = Frac.sub(a, b);

				const isOperator = i != begin;
				if(isOperator) i--;
				this.form[i] = res;
				this.form.splice(i + 1, 1);
				end--;
				// Only remove another element if it is actually and operator
				// and not just a minus sign
				if(isOperator) {
					this.form.splice(i + 1, 1);
					end--;
				}

			}
		}

		return this.form[begin];
	}

	getValue() {
		const cp = this.copy();
		return cp.calculateValue(0, cp.form.length);
	}
}
