/* eslint-disable camelcase */

import { readFileSync, existsSync } from 'fs';

/// import { GitHub } from '@actions/github/lib/utils';
import { context } from '@actions/github';
import * as github from '@actions/github';

import { UpdaterOptions } from './util';
import { RefInfo, TreeItem, UpdateResult } from './interfaces';


export class Updater {
	private octokit;
	private message: string;
	private defaultBranch: string | null;
	private committerName: string;
	private committerEmail: string;

	constructor(options: UpdaterOptions) {
		this.octokit = github.getOctokit(options.token);

		this.message = options.message;
		this.defaultBranch = options.branch || null;
		this.committerName = options.committerName;
		this.committerEmail = options.committerEmail;
	}

	async updateFile(path: string): Promise<UpdateResult | null> {
		const branch = await this.getBranch();
		const lastRef = await this.getLastRef(branch);

		const baseTreeSha = lastRef.treeSha;
		const baseCommitSha = lastRef.commitSha;

		const newTreeSha = await this.createTree(branch, path, baseTreeSha);
		if (newTreeSha === null) {
			return null;
		}

		const newCommitSha = await this.createCommit(newTreeSha, baseCommitSha);
		const commitSha = await this.updateRef(newCommitSha, branch);

		return { commitSha, branch };
	}

	private async createCommit(tree: string, parent: string): Promise<string> {
		const { message } = this;

		const { data } = await this.octokit.rest.git.createCommit({
			...context.repo,
			message,
			tree,
			parents: [parent],
			author: {
				name: this.committerName,
				email: this.committerEmail,
			},
		});

		return data.sha;
	}

	private async createTree(branch: string, filePath: string, base_tree: string): Promise<string | null> {
		const tree = (
			await this.createTreeItem(filePath, branch)
				
			);

        if (!tree)
            return null;
    
		const { data } = await this.octokit.rest.git.createTree({
			...context.repo,
			tree: [tree],
			base_tree,
		});

		return data.sha;
	}

	private async createTreeItem(
		filePath: string,
		branch: string
	): Promise<TreeItem | null> {
		const remoteContents = await this.getRemoteContents(filePath, branch);
		const localContents = await this.getLocalContents(filePath);
		const mode = '100644';

		if (localContents !== null) {
			if (localContents !== remoteContents) {
				const content = localContents;

				const { data } = await this.octokit.rest.git.createBlob({
					...context.repo,
					content,
					encoding: 'base64',
				});

				return {
					mode,
					path: filePath,
					sha: data.sha,
				};
			}
		} else if (remoteContents !== null) {
			return {
				mode,
				path: filePath,
			};
		}

		return null;
	}

	private async getBranch(): Promise<string> {
		if (this.defaultBranch !== null) {
			return Promise.resolve(this.defaultBranch);
		}

		const { data } = await this.octokit.rest.repos.get(context.repo);
		return data.default_branch;
	}

	private async getLastRef(branch: string): Promise<RefInfo> {
		const { data } = await this.octokit.rest.repos.listCommits({
			...context.repo,
			per_page: 1,
			sha: branch,
		});

		const commitSha = data[0].sha;
		const treeSha = data[0].commit.tree.sha;

		return { treeSha, commitSha };
	}

	private async getLocalContents(filePath: string): Promise<string | null> {
		if (existsSync(filePath)) {
			return (await readFileSync(filePath)).toString('base64');
		}

		return null;
	}

	private async getRemoteContents(
		filePath: string,
		branch: string
	): Promise<string | null> {
		try {
			const { data } = await this.octokit.rest.repos.getContent({
				...context.repo,
				path: filePath,
				ref: branch,
			});
            
			return data.toString().replace(/\n/gi, '');
		} catch (err) {
			// Do nothing
		}

		return null;
	}

	private async updateRef(sha: string, branch: string): Promise<string> {
		const ref = `heads/${branch}`;

		const { data } = await this.octokit.rest.git.updateRef({
			...context.repo,
			ref,
			sha,
		});

		return data.object.sha;
	}
}