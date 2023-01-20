import { assert } from "console";
import * as path from "path";
import winston from "winston"
const snarkjs = require("snarkjs");

describe("circuit - Num2Bits", () => {
  const circuitPath = path.join(process.cwd(), "../circom-pj/test")
  it("sample", async () => {
    await snarkjs.wtns.calculate(
        { in: 8 },
        path.join(circuitPath, "bitify/Num2Bits_js/Num2Bits.wasm"),
        path.join(__dirname, "witness.wtns")
    )
    await snarkjs.wtns.debug(
        { in: 16 },
        path.join(circuitPath, "bitify/Num2Bits_js/Num2Bits.wasm"),
        path.join(__dirname, "witness.debug.wtns"),
        path.join(circuitPath, "bitify/Num2Bits.sym"),
        { set: false, get: true, trigger: false },
        winston.createLogger({ level: 'info' })
    )
    // console.log(
    //     await snarkjs.wtns.exportJson(
    //         path.join(__dirname, "witness.wtns")
    //     )
    // )
    // console.log(
    //     await snarkjs.wtns.exportJson(
    //         path.join(__dirname, "witness.debug.wtns")
    //     )
    // )
  })
  it("out witness & check", async () => {
    const one = BigInt(1)
    const zero = BigInt(0)
    const conditions = [
        { in: 0, out: [one, zero, zero, zero, zero, zero, zero, zero, zero] },
        { in: 1, out: [one, one, zero, zero, zero, zero, zero, zero, zero] },
        { in: 2, out: [one, zero, one, zero, zero, zero, zero, zero, zero] },
        { in: 4, out: [one, zero, zero, one, zero, zero, zero, zero, zero] },
        { in: 8, out: [one, zero, zero, zero, one, zero, zero, zero, zero] },
        { in: 16, out: [one, zero, zero, zero, zero, one, zero, zero, zero] },
        { in: 32, out: [one, zero, zero, zero, zero, zero, one, zero, zero] },
        { in: 64, out: [one, zero, zero, zero, zero, zero, zero, one, zero] },
        { in: 128, out: [one, zero, zero, zero, zero, zero, zero, zero, one] },
        { in: 255, out: [one, one, one, one, one, one, one, one, one] },
    ]
    const outputs = await Promise.all(conditions.map(async (v) => {
      const wtnsName = `witness2-${v.in}.wtns`
      await snarkjs.wtns.calculate(
        { in: v.in },
        path.join(circuitPath, "bitify/Num2Bits_js/Num2Bits.wasm"),
        path.join(__dirname, wtnsName)
      )
      return await snarkjs.wtns.exportJson(
        path.join(__dirname, wtnsName)
      )
    }))
    for (const [idx, output] of outputs.entries()) {
        expect(output).toEqual(conditions[idx].out)
    }
  })
})