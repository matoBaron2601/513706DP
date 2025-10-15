export class ChunkerRepository {
	async chunk(formData: FormData) {
		return await fetch('http://127.0.0.1:5000/rtc', {
			method: 'POST',
			body: formData
		});
	}
}
