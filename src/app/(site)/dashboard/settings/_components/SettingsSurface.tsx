import {
	SettingsSurfaceClient,
	SettingsSurfaceSkeletonClient,
} from "./SettingsSurface.client";

export function SettingsSurface() {
	return <SettingsSurfaceClient />;
}

export function SettingsSurfaceSkeleton() {
	return <SettingsSurfaceSkeletonClient />;
}
