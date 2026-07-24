"use client";

import { RecordCollectionClientRoot } from "./RecordCollectionImplementation";
import { RecordCollectionClientSkeleton } from "./RecordCollectionSkeleton";

export const RecordCollectionClient = Object.assign(
	RecordCollectionClientRoot,
	{ Skeleton: RecordCollectionClientSkeleton },
);
