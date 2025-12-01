// Base application error with HTTP status, code, and optional details
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

// Specific error for not found resources
export class NotFoundError extends AppError {
	constructor(message = 'Not found', details?: unknown) {
		super(404, 'NOT_FOUND', message, details);
	}
}

// Specific error for validation failures
export class ValidationError extends AppError {
	constructor(message = 'Validation error', details?: unknown) {
		super(400, 'VALIDATION_ERROR', message, details);
	}
}

// Specific error for bad requests
export class BadRequestError extends AppError {
	constructor(message: string, details?: unknown) {
		super(400, 'BAD_REQUEST', message, details);
	}
}

// Specific error for conflict situations
export class ConflictError extends AppError {
	constructor(message: string, details?: unknown) {
		super(409, 'CONFLICT', message, details);
	}
}

// Specific error for unauthorized access
export class UnauthorizedError extends AppError {
	constructor(message = 'Unauthorized', details?: unknown) {
		super(401, 'UNAUTHORIZED', message, details);
	}
}
