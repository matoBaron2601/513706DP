import { GalleryThumbnailsIcon } from '@lucide/svelte';
import { db } from '../db/client';
import { UserBlockRepository } from '../repositories/userBlockRepository';
import type { CreateUserBlock, UserBlock } from '../schemas/userBlockSchema';
import { AdaptiveQuizService } from '../services/adaptiveQuizService';
import { ConceptProgressService } from '../services/conceptProgressService';
import { PlacementQuizService } from '../services/placementQuizService';
import { UserBlockService } from '../services/userBlockService';
import { ConceptService } from '../services/conceptService';

export class UserBlockFacade {
	private userBlockService: UserBlockService;
	private adaptiveQuizService: AdaptiveQuizService;
	private placementQuizService: PlacementQuizService;
	private conceptProgressService: ConceptProgressService;
	private conceptService: ConceptService;
	constructor() {
		this.userBlockService = new UserBlockService();
		this.adaptiveQuizService = new AdaptiveQuizService();
		this.placementQuizService = new PlacementQuizService();
		this.conceptProgressService = new ConceptProgressService();
		this.conceptService = new ConceptService();
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
					readyForAnswering: true
				},
				tx
			);

			const concepts = await this.conceptService.getManyByBlockId(createdUserBlock.blockId, tx);
			await this.conceptProgressService.createMany(
				concepts.map((c) => ({
					userBlockId: createdUserBlock.id,
					conceptId: c.id
				})),
				tx
			);

			return createdUserBlock;
		});
	}
}
