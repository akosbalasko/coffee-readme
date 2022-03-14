"use strict";
/* eslint-disable camelcase */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Updater = void 0;
const fs_1 = require("fs");
/// import { GitHub } from '@actions/github/lib/utils';
const github_1 = require("@actions/github");
const github = __importStar(require("@actions/github"));
class Updater {
    constructor(options) {
        this.octokit = github.getOctokit(options.token);
        this.message = options.message;
        this.defaultBranch = options.branch || null;
        this.committerName = options.committerName;
        this.committerEmail = options.committerEmail;
    }
    updateFile(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const branch = yield this.getBranch();
            const lastRef = yield this.getLastRef(branch);
            const baseTreeSha = lastRef.treeSha;
            const baseCommitSha = lastRef.commitSha;
            const newTreeSha = yield this.createTree(branch, path, baseTreeSha);
            if (newTreeSha === null) {
                return null;
            }
            const newCommitSha = yield this.createCommit(newTreeSha, baseCommitSha);
            const commitSha = yield this.updateRef(newCommitSha, branch);
            return { commitSha, branch };
        });
    }
    createCommit(tree, parent) {
        return __awaiter(this, void 0, void 0, function* () {
            const { message } = this;
            const { data } = yield this.octokit.rest.git.createCommit(Object.assign(Object.assign({}, github_1.context.repo), { message,
                tree, parents: [parent], author: {
                    name: this.committerName,
                    email: this.committerEmail,
                } }));
            return data.sha;
        });
    }
    createTree(branch, filePath, base_tree) {
        return __awaiter(this, void 0, void 0, function* () {
            const tree = (yield this.createTreeItem(filePath, branch));
            if (!tree)
                return null;
            const { data } = yield this.octokit.rest.git.createTree(Object.assign(Object.assign({}, github_1.context.repo), { tree: [tree], base_tree }));
            return data.sha;
        });
    }
    createTreeItem(filePath, branch) {
        return __awaiter(this, void 0, void 0, function* () {
            const remoteContents = yield this.getRemoteContents(filePath, branch);
            const localContents = yield this.getLocalContents(filePath);
            const mode = '100644';
            if (localContents !== null) {
                if (localContents !== remoteContents) {
                    const content = localContents;
                    const { data } = yield this.octokit.rest.git.createBlob(Object.assign(Object.assign({}, github_1.context.repo), { content, encoding: 'base64' }));
                    return {
                        mode,
                        path: filePath,
                        sha: data.sha,
                    };
                }
            }
            else if (remoteContents !== null) {
                return {
                    mode,
                    path: filePath,
                };
            }
            return null;
        });
    }
    getBranch() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.defaultBranch !== null) {
                return Promise.resolve(this.defaultBranch);
            }
            const { data } = yield this.octokit.rest.repos.get(github_1.context.repo);
            return data.default_branch;
        });
    }
    getLastRef(branch) {
        return __awaiter(this, void 0, void 0, function* () {
            const { data } = yield this.octokit.rest.repos.listCommits(Object.assign(Object.assign({}, github_1.context.repo), { per_page: 1, sha: branch }));
            const commitSha = data[0].sha;
            const treeSha = data[0].commit.tree.sha;
            return { treeSha, commitSha };
        });
    }
    getLocalContents(filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, fs_1.existsSync)(filePath)) {
                return (yield (0, fs_1.readFileSync)(filePath)).toString('base64');
            }
            return null;
        });
    }
    getRemoteContents(filePath, branch) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { data } = yield this.octokit.rest.repos.getContent(Object.assign(Object.assign({}, github_1.context.repo), { path: filePath, ref: branch }));
                return data.toString().replace(/\n/gi, '');
            }
            catch (err) {
                // Do nothing
            }
            return null;
        });
    }
    updateRef(sha, branch) {
        return __awaiter(this, void 0, void 0, function* () {
            const ref = `heads/${branch}`;
            const { data } = yield this.octokit.rest.git.updateRef(Object.assign(Object.assign({}, github_1.context.repo), { ref,
                sha }));
            return data.object.sha;
        });
    }
}
exports.Updater = Updater;
