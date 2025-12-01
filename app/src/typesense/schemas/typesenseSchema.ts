import dotenv from 'dotenv';

dotenv.config();

const typesenseSchema = {
	name: 'typesenseSchema',
	fields: [
		{ name: 'block_id', type: 'string' },
		{ name: 'content', type: 'string' },
		{ name: 'documentPath', type: 'string' },
		{
			name: 'vector',
			type: 'float[]',
			embed: {
				from: ['content'],
				model_config: {
					model_name: 'openai/text-embedding-3-large',
					api_key: process.env.OPENAI_API_KEY || ''
				}
			},
			optional: true
		}
	]
};

export default typesenseSchema;
