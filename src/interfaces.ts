
export interface RefInfo {
	treeSha: string;
	commitSha: string;
}

export interface TreeItem {
	content?: string;
	mode?: '100644' | '100755' | '040000' | '160000' | '120000';
	path?: string;
	sha?: string;
}

export interface UpdateResult {
	commitSha: string;
	branch: string;
}
