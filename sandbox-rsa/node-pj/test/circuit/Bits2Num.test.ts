import { assert } from "console";
import * as path from "path";
const snarkjs = require("snarkjs");

describe("circuit - Bits2Num", () => {
  const circuitPath = path.join(process.cwd(), "../circom-pj/test")
  it("out witness & check", async () => {
    const conditions = [
        { in: [0, 0, 0, 0, 0, 0, 0, 0], out: [BigInt(1), BigInt(0)] },
        { in: [1, 0, 0, 0, 0, 0, 0, 0], out: [BigInt(1), BigInt(1)] },
        { in: [0, 1, 0, 0, 0, 0, 0, 0], out: [BigInt(1), BigInt(2)] },
        { in: [0, 0, 1, 0, 0, 0, 0, 0], out: [BigInt(1), BigInt(4)] },
        { in: [0, 0, 0, 1, 0, 0, 0, 0], out: [BigInt(1), BigInt(8)] },
        { in: [0, 0, 0, 0, 1, 0, 0, 0], out: [BigInt(1), BigInt(16)] },
        { in: [0, 0, 0, 0, 0, 1, 0, 0], out: [BigInt(1), BigInt(32)] },
        { in: [0, 0, 0, 0, 0, 0, 1, 0], out: [BigInt(1), BigInt(64)] },
        { in: [0, 0, 0, 0, 0, 0, 0, 1], out: [BigInt(1), BigInt(128)] },
        { in: [1, 1, 1, 1, 1, 1, 1, 1], out: [BigInt(1), BigInt(255)] },
    ]
    const outputs = await Promise.all(conditions.map(async (v) => {
      const wtnsName = `witness-bit2num-${v.in}.wtns`
      await snarkjs.wtns.calculate(
        { in: v.in },
        path.join(circuitPath, "bitify/Bits2Num_js/Bits2Num.wasm"),
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