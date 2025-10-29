import { TypesenseService } from '../typesense/typesenseService';
import { ChunkerService } from './chunkerService';

export class ChunkerFacade {
	private chunkerService: ChunkerService;
	private typesenseService: TypesenseService;
	constructor() {
		this.chunkerService = new ChunkerService();
		this.typesenseService = new TypesenseService();
	}
}
