import { db } from '../db/client';
import { UserBlockRepository } from '../repositories/userBlockRepository';
import type { CreateUserBlock, UserBlock } from '../schemas/userBlockSchema';
import { AdaptiveQuizService } from '../services/adaptiveQuizService';
import { PlacementQuizService } from '../services/placementQuizService';
import { UserBlockService } from '../services/userBlockService';

export class UserBlockFacade {
	private userBlockService: UserBlockService;
	private adaptiveQuizService: AdaptiveQuizService;
	private placementQuizService: PlacementQuizService;
	constructor() {
		this.userBlockService = new UserBlockService();
		this.adaptiveQuizService = new AdaptiveQuizService();
		this.placementQuizService = new PlacementQuizService();
	}

	async handleUserBlockLogic(createUserBlockData: CreateUserBlock): Promise<UserBlock> {
		return await db.transaction(async (tx) => {
			const userBlock = await this.userBlockService.getByBothIdsOrUndefined(
				createUserBlockData,
				tx
			);
			if (userBlock) {
				return userBlock;
			}

			const createdUserBlock = await this.userBlockService.create(createUserBlockData, tx);

			const placementQuiz = await this.placementQuizService.getByBlockId(
				createdUserBlock.blockId,
				tx
			);
			await this.adaptiveQuizService.create(
				{
					userBlockId: createdUserBlock.id,
					baseQuizId: placementQuiz.baseQuizId,
					placementQuizId: placementQuiz.id,
					readyForAnswering:true
				},
				tx
			);

			return createdUserBlock;
		});
	}
}
