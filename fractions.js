// Simple fraction class
class Fraction {
  constructor(n, d = 1) {
    this.n = n;
    this.d = d;
    this.simplify();
  }

  simplify() {
    const g = gcd(Math.abs(this.n), Math.abs(this.d));
    this.n /= g;
    this.d /= g;
    if (this.d < 0) {
      this.n *= -1;
      this.d *= -1;
    }
  }

  add(f) {
    return new Fraction(this.n*f.d + f.n*this.d, this.d*f.d);
  }

  sub(f) {
    return new Fraction(this.n*f.d - f.n*this.d, this.d*f.d);
  }

  mul(f) {
    return new Fraction(this.n*f.n, this.d*f.d);
  }

  div(f) {
    return new Fraction(this.n*f.d, this.d*f.n);
  }

  toString() {
    return this.d === 1 ? `${this.n}` : `${this.n}/${this.d}`;
  }
}

function gcd(a,b){return b===0?a:gcd(b,a%b);}
