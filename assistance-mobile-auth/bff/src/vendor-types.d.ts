declare module 'jsbn' {
  export class BigInteger {
    static readonly ONE: BigInteger
    constructor(value: string | number, radix?: number)
    add(value: BigInteger): BigInteger
    subtract(value: BigInteger): BigInteger
    mod(value: BigInteger): BigInteger
    multiply(value: BigInteger): BigInteger
    toByteArray(): number[]
    toString(radix?: number): string
  }
}
