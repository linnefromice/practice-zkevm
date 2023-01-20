import * as path from "path";
const snarkjs = require("snarkjs");

describe("circuit - PowerMod", () => {
  const circuitPath = path.join(process.cwd(), "../circom-pj/src")

  it("out witness & check", async () => {
    const conditions = [
			{ in: { base: 12, exp: 3, modulus: 15 }, out: [BigInt(1), BigInt(3)] },
			{ in: { base: 10, exp: 5, modulus: 323 }, out: [BigInt(1), BigInt(193)] },
			{ in: { base: 8, exp: 3, modulus: 33 }, out: [BigInt(1), BigInt(17)] },
			{ in: { base: 17, exp: 7, modulus: 33 }, out: [BigInt(1), BigInt(8)] },
			// { in: { base: 1371, exp: 1241, modulus: 2279 }, out: [BigInt(1), BigInt(2003)] }, // overflow?
			// { in: { base: 2003, exp: 1649, modulus: 2279 }, out: [BigInt(1), BigInt(1371)] }, // overflow?
			// { in: { base: 16836, exp: 43291, modulus: 130733 }, out: [BigInt(1), BigInt(73724)] }, // overflow?
			// { in: { base: 73724, exp: 105691, modulus: 130733 }, out: [BigInt(1), BigInt(16836)] }, // overflow?
    ]
    const outputs = await Promise.all(conditions.map(async (v, idx) => {
			const wtnsName = `witness-powerMod-${idx}.wtns`
			await snarkjs.wtns.calculate(
				v.in,
				path.join(circuitPath, "PowerMod_js/PowerMod.wasm"),
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