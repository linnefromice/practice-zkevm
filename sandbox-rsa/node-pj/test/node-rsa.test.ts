import NodeRSA from "node-rsa"

describe("test node-rsa", () => {
  const key = new NodeRSA({ b: 2048 })
  const text = "Hello RSA!"

  it("encrypt <-> decrypt", () => {
    const encrypted = key.encrypt(text, "base64")
    const decrypted = key.decrypt(encrypted, "utf8")
    expect(decrypted).toEqual(text)
  })
  
  it("sign -> verify", () => {
    const signed = key.sign(text)
    expect(key.verify(text, signed)).toBeTruthy()
  })

  it("sign (by getDataForEncrypt) -> verify", () => {
    const dataForEncrypt = (key as any)["$getDataForEncrypt"](text, null)
    const signed = (key as any)["keyPair"]["sign"](dataForEncrypt)
    const isVerified = (key as any)["keyPair"]["verify"](dataForEncrypt, signed, null)
    expect(isVerified).toBeTruthy()
  })
})