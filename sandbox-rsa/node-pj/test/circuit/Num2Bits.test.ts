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
  it("sample2", async () => {
    const inputs = [0, 1, 2, 4, 8, 16, 32, 64, 128, 255]
    const outputs = await Promise.all(inputs.map(async (v) => {
      const wtnsName = `witness2-${v}.wtns`
      await snarkjs.wtns.calculate(
        { in: v },
        path.join(circuitPath, "bitify/Num2Bits_js/Num2Bits.wasm"),
        path.join(__dirname, wtnsName)
      )
      return await snarkjs.wtns.exportJson(
        path.join(__dirname, wtnsName)
      )
    }))
    for (const output of outputs) {
      console.log(output)
    }
  })
})