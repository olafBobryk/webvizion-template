import fs from "node:fs/promises";
import path from "node:path";

export type TemplateIntelligenceFile = {
	path: string;
	title: string;
	sourceType: string;
	size: number;
	lines: number;
	conceptIds: string[];
	excerpt: string;
};

export type TemplateIntelligenceConcept = {
	id: string;
	title: string;
	summary: string;
	fileCount: number;
	sourceTypes: string[];
};

export type TemplateIntelligenceRelationship = {
	source: string;
	target: string;
	weight: number;
	sharedFiles: string[];
};

export type TemplateIntelligenceAgentMapTopic = {
	id: string;
	title: string;
	aliases: string[];
	paths: string[];
	notes: string;
};

export type TemplateIntelligenceAgentMap = {
	schemaVersion: 1;
	project: string;
	generator: string;
	artifact: string;
	topics: TemplateIntelligenceAgentMapTopic[];
};

export type TemplateIntelligenceIndex = {
	schemaVersion: 1;
	project: string;
	generator: string;
	artifact: string;
	fileCount: number;
	conceptCount: number;
	files: TemplateIntelligenceFile[];
	concepts: TemplateIntelligenceConcept[];
	relationships: TemplateIntelligenceRelationship[];
};

export type TemplateIntelligenceReadResult =
	| {
			status: "ready";
			index: TemplateIntelligenceIndex;
	  }
	| {
			status: "missing";
			path: string;
	  };

export type TemplateIntelligenceAgentMapReadResult =
	| {
			status: "ready";
			agentMap: TemplateIntelligenceAgentMap;
	  }
	| {
			status: "missing";
			path: string;
	  };

const INTELLIGENCE_INDEX_PATH = path.join(
	process.cwd(),
	".template-intelligence/index.json",
);
const INTELLIGENCE_AGENT_MAP_PATH = path.join(
	process.cwd(),
	".template-intelligence/agent-map.json",
);

function isTemplateIntelligenceIndex(
	value: unknown,
): value is TemplateIntelligenceIndex {
	if (!value || typeof value !== "object") return false;

	const candidate = value as Partial<TemplateIntelligenceIndex>;

	return (
		candidate.schemaVersion === 1 &&
		Array.isArray(candidate.files) &&
		Array.isArray(candidate.concepts) &&
		Array.isArray(candidate.relationships)
	);
}

function isTemplateIntelligenceAgentMap(
	value: unknown,
): value is TemplateIntelligenceAgentMap {
	if (!value || typeof value !== "object") return false;

	const candidate = value as Partial<TemplateIntelligenceAgentMap>;

	return candidate.schemaVersion === 1 && Array.isArray(candidate.topics);
}

export async function readTemplateIntelligenceIndex(): Promise<TemplateIntelligenceReadResult> {
	const raw = await fs
		.readFile(INTELLIGENCE_INDEX_PATH, "utf8")
		.catch(() => null);

	if (!raw) {
		return {
			status: "missing",
			path: ".template-intelligence/index.json",
		};
	}

	const parsed = JSON.parse(raw) as unknown;

	if (!isTemplateIntelligenceIndex(parsed)) {
		throw new Error("Template intelligence index has an invalid shape.");
	}

	return {
		status: "ready",
		index: parsed,
	};
}

export async function readTemplateIntelligenceAgentMap(): Promise<TemplateIntelligenceAgentMapReadResult> {
	const raw = await fs
		.readFile(INTELLIGENCE_AGENT_MAP_PATH, "utf8")
		.catch(() => null);

	if (!raw) {
		return {
			status: "missing",
			path: ".template-intelligence/agent-map.json",
		};
	}

	const parsed = JSON.parse(raw) as unknown;

	if (!isTemplateIntelligenceAgentMap(parsed)) {
		throw new Error("Template intelligence agent map has an invalid shape.");
	}

	return {
		status: "ready",
		agentMap: parsed,
	};
}
