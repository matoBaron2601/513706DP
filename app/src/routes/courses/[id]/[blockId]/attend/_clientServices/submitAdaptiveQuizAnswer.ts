import type { CreateAdaptiveQuizAnswer, SubmitAdaptiveQuizAnswer } from '../../../../../../schemas/adaptiveQuizAnswerSchema';
import type { CreateUserBlock } from '../../../../../../schemas/userBlockSchema';

const submitAdaptiveQuizAnswer = async (adaptiveQuizAnswer: SubmitAdaptiveQuizAnswer) => {
    const response = await fetch(`/api/adaptiveQuizAnswer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(adaptiveQuizAnswer)
    });

    if (!response.ok) {
        throw new Error('Failed to get course block');
    }
    return await response.json();
};

export default submitAdaptiveQuizAnswer;
