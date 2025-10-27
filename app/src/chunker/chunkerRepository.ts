export class ChunkerRepository {
	async chunkRTC(formData: FormData) {
		return await fetch('http://127.0.0.1:5000/rtc', {
			method: 'POST',
			body: formData
		});
	}

	async chunkSemantic(formData: FormData) {
		return await fetch('http://127.0.0.1:5000/semantic', {
			method: 'POST',
			body: formData
		});
	}
}
