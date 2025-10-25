import type { BlockWithDocument } from "../../../../../../schemas/blockSchema";

const createCourseBlock = async (blockWithDocumentData: BlockWithDocument) => {
	const formData = new FormData();

	formData.append('courseId', blockWithDocumentData.courseId);
	formData.append('name', blockWithDocumentData.name);
	formData.append('document', blockWithDocumentData.document);

	const response = await fetch(`/api/block`, {
		method: 'POST',
		body: formData
	});

	if (!response.ok) {
		throw new Error('Failed to create course block');
	}
	return await response.json();
};

export default createCourseBlock;
