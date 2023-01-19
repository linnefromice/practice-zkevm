describe("Buffer class test", () => {
	test(".alloc", () => {
		const buf = Buffer.alloc(10)
		expect(buf.length).toEqual(10)
		for (const [_, byte] of buf.entries()) {
			expect(byte).toEqual(0)
		}
	})
	test(".alloc & .fill", () => {
		const buf = Buffer.alloc(20).fill(126)
		expect(buf.length).toEqual(20)
		for (const [_, byte] of buf.entries()) {
			expect(byte).toEqual(126)
		}
	})
	test(".from", () => {
		const bufNum = Buffer.from([2, 3, 5, 8, 13])
		expect(bufNum.length).toEqual(5)
		expect(bufNum[0]).toEqual(2)
		expect(bufNum[1]).toEqual(3)
		expect(bufNum[2]).toEqual(5)
		expect(bufNum[3]).toEqual(8)
		expect(bufNum[4]).toEqual(13)

		const bufStr = Buffer.from("abcde")
		expect(bufStr.length).toEqual(5)
		expect(bufStr[0]).toEqual(97)
		expect(bufStr[1]).toEqual(98)
		expect(bufStr[2]).toEqual(99)
		expect(bufStr[3]).toEqual(100)
		expect(bufStr[4]).toEqual(101)

		const bufLimit = Buffer.from([255, 256, 257, -1, -2])
		expect(bufLimit.length).toEqual(5)
		expect(bufLimit[0]).toEqual(255)
		expect(bufLimit[1]).toEqual(0)
		expect(bufLimit[2]).toEqual(1)
		expect(bufLimit[3]).toEqual(255)
		expect(bufLimit[4]).toEqual(254)

		const bufTemp = [
			Buffer.from('Hey'),
			Buffer.from('123'),
			Buffer.from([1,2,3])
		]
		for (const buf of bufTemp) {
			console.log(buf)
			console.log(buf.toString('hex'))
			console.log(parseInt(buf.toString('hex'), 16))
			// 3 * 16**0 + 2 * 16**2 + 1 * 16**4
		}
	})
})