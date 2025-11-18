export class AppError extends Error {
	status: number;
	code: string;
	details?: unknown;

	constructor(status: number, code: string, message: string, details?: unknown) {
		super(message);
		this.status = status;
		this.code = code;
		this.details = details;
	}
}

export class NotFoundError extends AppError {
	constructor(message = 'Not found', details?: unknown) {
		super(404, 'NOT_FOUND', message, details);
	}
}

export class ValidationError extends AppError {
	constructor(message = 'Validation error', details?: unknown) {
		super(400, 'VALIDATION_ERROR', message, details);
	}
}

export class BadRequestError extends AppError {
	constructor(message: string, details?: unknown) {
		super(400, 'BAD_REQUEST', message, details);
	}
}

export class ConflictError extends AppError {
	constructor(message: string, details?: unknown) {
		super(409, 'CONFLICT', message, details);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = 'Unauthorized', details?: unknown) {
		super(401, 'UNAUTHORIZED', message, details);
	}
}
