const TENS_POW = [ 1, 10, 100, 1000, 10000, 100000, 1000000, 10000000, 100000000, 
	  1000000000, 10000000000, 100000000000, 1000000000000, 10000000000000, 
	  100000000000000, 1000000000000000, 10000000000000000 ];

const Gcd = (a, b) => {
	if(b !== 0) while((a %= b) !== 0 && (b %= a) !== 0);
	return a + b;
};

const Lcm = (a, b) => {
	return a * b / Gcd(a, b);
}

class Frac {
	constructor(q, p) {
		if(typeof q !== 'undefined') {
			// Normal fraction
			if(typeof p !== 'undefined') {
				this.q = q;
				this.p = p;	
			}
			// A single number 
			else {
				const str = (typeof q === "string") ? q : q.toString();
				// Double
				if(typeof str.indexOf('.') !== 'undefined') {
					const len = str.length;
					this.q = q * TENS_POW[len];
					this.p = TENS_POW[len];
				}
				// Integer
				else {
					this.q = q;	
					this.p = 1;
				}
			}
		}
	}

	copy() {
		return new Frac(this.q, this.p);	
	}

	reduce() {
		const gcd = Gcd(this.p, this.q);
		this.p /= gcd;
		this.q /= gcd;
			
		if((this.p > 0 && this.q >= 0) || (this.p < 0 && this.q <= 0)) {
			this.p = abs(this.p);
			this.q = abs(this.q);
		}
		else {
			this.p = abs(this.p);
			this.q = -abs(this.q);
		}
	}

	add(rhs) {
		this.reduce();
		rhs.reduce();
	
		const newP = Lcm(this.p, rhs.p);
		const newQ = this.q * (newP / this.p) + rhs.q * (newP / rhs.p);
		this.p = newP;
		this.q = newQ;
	}	

	static add(a, b) {
		const r = a.copy();
		r.add(b);
		return r;
	}

	sub(rhs) {
		this.reduce();
		rhs.reduce();
	
		const newP = Lcm(this.p, rhs.p);
		const newQ = this.q * (newP / this.p) - rhs.q * (newP / rhs.p);
		this.p = newP;
		this.q = newQ;
	}	

	static sub(a, b) {
		const r = a.copy();
		r.sub(b);
		return r;
	}

	multReduce(rhs) {
		this.reduce();
		rhs.reduce();

		let gcd = Gcd(this.q, rhs.p);
		this.q /= gcd;
		rhs.p /= gcd;

		gcd = Gcd(this.p, rhs.q);
		this.p /= gcd;
		rhs.q /= gcd;
	}

	mult(rhs) {
		this.multReduce(rhs);

		this.p *= rhs.p;
		this.q *= rhs.q;
	}

	static mult(a, b) {
		const r = a.copy();
		r.mult(b);
		return r;
	}

	divReduce(rhs) {
		this.reduce();
		rhs.reduce();

		let gcd = Gcd(this.q, rhs.q);
		this.q /= gcd;
		rhs.q /= gcd;

		gcd = Gcd(this.p, rhs.p);
		this.p /= gcd;
		rhs.p /= gcd;
	}

	div(rhs) {
		this.divReduce(rhs);

		this.p *= rhs.q;
		this.q *= rhs.p;
	}

	static div(a, b) {
		const r = a.copy();
		r.div(b);
		return r;
	}

	toLatex() {
		const f = new Formula();
		this.reduce();
		if(this.p === 1 || this.q === 0) f.setFormula(this.q.toString());
		else f.setFormula(this.q.toString() + "/" + this.p.toString());
		return f.getLatex();
	}

	getApprox() {
		return this.q / this.p;	
	}
}

