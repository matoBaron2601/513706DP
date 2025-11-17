import { db } from '../../db/client';
import type { Transaction } from '../../types';

const getDbClient = (tx?: Transaction) => (tx ? tx : db);

export default getDbClient;

export type GetDbClient = (tx?: Transaction) => any;
