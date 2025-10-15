import { ComplexQuizService } from '../../services/complexQuizServices/complexQuizService';

export class ComplexQuizFacade {
	constructor(private complexQuizService: ComplexQuizService) {
		this.complexQuizService = new ComplexQuizService();
	}



    
}
