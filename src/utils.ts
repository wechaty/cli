export function reverseObject(obj: any) {
	const newkeys = Object.keys(obj).reverse()
	const newobj: any = {}
	newkeys.forEach(k => newobj[k] = obj[k])
	return newobj;
}