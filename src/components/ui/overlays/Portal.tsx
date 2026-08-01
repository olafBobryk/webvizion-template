import {
	type ComponentPropsWithoutRef,
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useId,
	useState,
} from "react";
import { createPortal } from "react-dom";

interface PortalProps {
	children: ReactNode;
	target?: string; // optional id
}

type PortalScopeValue = {
	id: string;
	root: HTMLElement | null;
};

const PortalScopeContext = createContext<PortalScopeValue | null>(null);

export function PortalScope({
	children,
	...props
}: ComponentPropsWithoutRef<"div">) {
	const [scopeRoot, setScopeRoot] = useState<HTMLDivElement | null>(null);
	const scopeId = useId();

	return (
		<PortalScopeContext.Provider value={{ id: scopeId, root: scopeRoot }}>
			<div ref={setScopeRoot} {...props}>
				{children}
			</div>
		</PortalScopeContext.Provider>
	);
}

export function usePortalScopeId() {
	return useContext(PortalScopeContext)?.id ?? null;
}

const Portal: React.FC<PortalProps> = ({ children, target }) => {
	const [mounted, setMounted] = useState(false);
	const scopeRoot = useContext(PortalScopeContext)?.root ?? null;

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) return null;

	const defaultTarget = document.body;
	const scopedTarget = target
		? scopeRoot?.querySelector<HTMLElement>(`#${CSS.escape(target)}`)
		: scopeRoot;
	const portalTarget = target
		? (scopedTarget ??
			scopeRoot ??
			document.getElementById(target) ??
			defaultTarget)
		: (scopedTarget ?? defaultTarget);

	return createPortal(children, portalTarget);
};

export default Portal;
