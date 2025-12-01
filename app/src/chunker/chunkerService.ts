export class ChunkerService {

	// Selects chunking strategy and delegates to the appropriate method
	async chunk(strategy: 'rtc' | 'semantic', text: string): Promise<string[]> {
		if (strategy === 'rtc') {
			return await this.chunkRTC(text);
		} else {
			return await this.chunkSemantic(text);
		}
	}

	// Chunks text using the RTC strategy
	private async chunkRTC(text: string): Promise<string[]> {
		const formData = new FormData();
		formData.append('file', new Blob([text], { type: 'text/plain' }), 'file.txt');
		const response = await fetch('http://127.0.0.1:5000/rtc', {
			method: 'POST',
			body: formData
		});
		const data = await response.json();
		return JSON.parse(JSON.stringify(data, null, 2));
	}
	
	// Chunks text using the Semantic strategy
	private async chunkSemantic(text: string): Promise<string[]> {
		const formData = new FormData();
		formData.append('file', new Blob([text], { type: 'text/plain' }), 'file.txt');
		const response = await fetch('http://127.0.0.1:5000/semantic', {
			method: 'POST',
			body: formData
		});
		const data = await response.json();
		return JSON.parse(JSON.stringify(data, null, 2));
	}
}
