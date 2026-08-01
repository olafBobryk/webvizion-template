import { Text } from "@/components/ui/primitives/Text";
import { StatusFrame } from "./StatusFrame";
import styles from "./Thinking.module.css";

const dots = ["first", "second", "third"] as const;

export function Thinking() {
	return (
		<StatusFrame>
			<Text
				as="p"
				className="leading-[1.65]"
				interactive={false}
				tone="muted"
				variant="body"
			>
				Thinking
				<span aria-hidden>
					{dots.map((dot, index) => (
						<span
							className={styles.dot}
							key={dot}
							style={{ animationDelay: `${index * 150}ms` }}
						>
							.
						</span>
					))}
				</span>
			</Text>
		</StatusFrame>
	);
}
