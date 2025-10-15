import { ChunkerRepository } from './chunkerRepository';

export class ChunkerService {
	private repository: ChunkerRepository;
	constructor() {
		this.repository = new ChunkerRepository();
	}

	async chunkRTC(text: string): Promise<string[]> {
		const formData = new FormData();
		formData.append('file', new Blob([text], { type: 'text/plain' }), 'file.txt');
		const response = await this.repository.chunk(formData);
		const data = await response.json();
		return JSON.parse(JSON.stringify(data, null, 2));
	}
}
