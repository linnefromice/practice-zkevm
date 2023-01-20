import NodeRSA from "node-rsa";

const outKeyInfo = (key: NodeRSA) => {
  const pKey = key.exportKey("components-private")
  console.log("%o", {
    n: pKey.n.toString("hex"),
    // n: parseInt(pKey.n.toString("hex"), 16),
    e: pKey.e,
    d: pKey.d.toString("hex"),
    p: pKey.p.toString("hex"),
    q: pKey.q.toString("hex"),
    // dmp1: pKey.dmp1,
    // dmq1: pKey.dmq1,
    // coeff: pKey.coeff,
  })
}

const targetByteLengths = [
  64,
  256,
  1024,
  2048
]
for (const param of targetByteLengths) {
  console.log(`# length of the key = ${param}`)
  outKeyInfo(new NodeRSA({ b: param }))  
}
