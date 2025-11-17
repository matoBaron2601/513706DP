export type FakeFixtures = {
	selectResult?: any[];
	selectByIdsResult?: any[];
	selectByEmailResult?: any[];
	insertReturn?: any[];
	updateReturn?: any[];
	deleteReturn?: any[];
};

export function makeFakeDbClient(fixtures: FakeFixtures) {
	const calls: { method: string; args?: any[] }[] = [];

	let lastOp: 'select' | 'insert' | 'update' | 'delete' | null = null;

	const api = {
		select() {
			calls.push({ method: 'select' });
			lastOp = 'select';
			return {
				from(_table: any) {
					calls.push({ method: 'from' });
					return {
						where(_expr: any) {
							calls.push({ method: 'where' });
							return Promise.resolve(fixtures.selectResult ?? []);
						}
					};
				}
			};
		},
		insert(_table: any) {
			calls.push({ method: 'insert' });
			lastOp = 'insert';
			return {
				values(v: any) {
					calls.push({ method: 'values', args: [v] });
					return {
						returning() {
							calls.push({ method: 'returning' });
							return Promise.resolve(fixtures.insertReturn ?? []);
						}
					};
				}
			};
		},
		update(_table: any) {
			calls.push({ method: 'update' });
			lastOp = 'update';
			return {
				set(v: any) {
					calls.push({ method: 'set', args: [v] });
					return {
						where(_expr: any) {
							calls.push({ method: 'where' });
							return {
								returning() {
									calls.push({ method: 'returning' });
									return Promise.resolve(fixtures.updateReturn ?? []);
								}
							};
						}
					};
				}
			};
		},
		delete(_table: any) {
			calls.push({ method: 'delete' });
			lastOp = 'delete';
			return {
				where(_expr: any) {
					calls.push({ method: 'where' });
					return {
						returning() {
							calls.push({ method: 'returning' });
							return Promise.resolve(fixtures.deleteReturn ?? []);
						}
					};
				}
			};
		}
	};

	const getDbClient = () => api;
	return { getDbClient, calls };
}
