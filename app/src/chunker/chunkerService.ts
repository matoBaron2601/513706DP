import { ChunkerRepository } from './chunkerRepository';

export class ChunkerService {
	private repository: ChunkerRepository;
	constructor() {
		this.repository = new ChunkerRepository();
	}

	async chunk(strategy: 'rtc' | 'semantic', text: string): Promise<string[]> {
		if (strategy === 'rtc') {
			return await this.chunkRTC(text);
		} else {
			return await this.chunkSemantic(text);
		}
	}

	private async chunkRTC(text: string): Promise<string[]> {
		const formData = new FormData();
		formData.append('file', new Blob([text], { type: 'text/plain' }), 'file.txt');
		const response = await this.repository.chunkRTC(formData);
		const data = await response.json();
		return JSON.parse(JSON.stringify(data, null, 2));
	}

	private async chunkSemantic(text: string): Promise<string[]> {
		const formData = new FormData();
		formData.append('file', new Blob([text], { type: 'text/plain' }), 'file.txt');
		const response = await this.repository.chunkSemantic(formData);
		const data = await response.json();
		return JSON.parse(JSON.stringify(data, null, 2));
	}
}
