"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { DashboardDetailField } from "@/app/(site)/dashboard/_components/detail/DashboardDetailField";
import { MemberIdentity } from "@/app/(site)/dashboard/_components/entities/member/MemberIdentity";
import { OrganizationIdentity } from "@/app/(site)/dashboard/_components/entities/organization/OrganizationIdentity";
import { DashboardSection } from "@/app/(site)/dashboard/_components/layout/DashboardSection";
import { updateSupportRequest } from "@/app/(site)/dashboard/_lib/platform/api.client";
import {
	SUPPORT_REQUEST_STATUSES,
	type SupportRequest,
	type SupportRequestStatus,
} from "@/app/(site)/dashboard/_lib/platform/contracts";
import {
	getPlatformMemberPresentation,
	getPlatformOrganizationPresentation,
} from "@/app/(site)/dashboard/_lib/platform/entities";
import {
	formatPlatformDate,
	supportStatusPresentation,
} from "@/app/(site)/dashboard/_lib/platform/presentation";
import {
	SelectInput,
	type SelectOption,
	TextAreaInput,
} from "@/components/ui/input";
import { Button } from "@/components/ui/primitives/Button";
import { Card } from "@/components/ui/primitives/Card";
import { Text } from "@/components/ui/primitives/Text";
import { showToast } from "@/lib/feedback";
import { hrefFor } from "@/lib/routes";
import { SupportStatusChip } from "../../../_components/PlatformStatusChip";

const statusOptions: SelectOption<SupportRequestStatus>[] =
	SUPPORT_REQUEST_STATUSES.map((value) => ({
		label: supportStatusPresentation[value].label,
		value,
	}));

export function PlatformInboxDetailContent({
	initialRequest,
}: {
	initialRequest: SupportRequest;
}) {
	const router = useRouter();
	const [supportRequest, setSupportRequest] = React.useState(initialRequest);
	const [status, setStatus] = React.useState(initialRequest.status);
	const [internalNote, setInternalNote] = React.useState(
		initialRequest.internalNote ?? "",
	);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const member = getPlatformMemberPresentation(supportRequest);
	const organization = getPlatformOrganizationPresentation(supportRequest);
	const mailto = `mailto:${supportRequest.email}?subject=${encodeURIComponent(`Re: ${supportRequest.subject}`)}`;

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isSubmitting) return;
		setIsSubmitting(true);
		try {
			const result = await showToast.promise(
				updateSupportRequest({
					id: supportRequest.id,
					internalNote,
					status,
				}),
				{
					loading: "Updating support request...",
					success: "Support request updated.",
					error: "Unable to update support request.",
				},
			);
			setSupportRequest(result.request);
			setStatus(result.request.status);
			setInternalNote(result.request.internalNote ?? "");
			router.refresh();
		} catch {
			// The shared promise toast reports the failed mutation.
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<DashboardSection
			actions={
				<div className="flex flex-wrap gap-2">
					<Button
						href={hrefFor("dashboard.platform.inbox")}
						variant="secondary"
					>
						All requests
					</Button>
					<Button href={mailto} leadingIcon="mail">
						Email requester
					</Button>
				</div>
			}
			contentClassName="grid min-w-0 gap-5"
			description={supportRequest.id}
			title={supportRequest.subject}
		>
			<div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
				<div className="grid min-w-0 gap-5">
					<Card>
						<Card.Header>
							<Card.Title>Support message</Card.Title>
							<Card.Description>
								Submitted from the authenticated dashboard support form.
							</Card.Description>
							<Card.Action>
								<SupportStatusChip status={supportRequest.status} />
							</Card.Action>
						</Card.Header>
						<Card.Content>
							<Text className="whitespace-pre-wrap break-words" variant="body">
								{supportRequest.message}
							</Text>
						</Card.Content>
					</Card>
					<Card>
						<Card.Header>
							<Card.Title>Requester context</Card.Title>
							<Card.Description>
								Identity and organization facts resolved by the server.
							</Card.Description>
						</Card.Header>
						<Card.Content className="grid gap-5">
							<div className="grid gap-4 sm:grid-cols-2">
								<MemberIdentity presentation={member} variant="compact" />
								<OrganizationIdentity presentation={organization} />
							</div>
							<dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
								<DashboardDetailField
									label="Role"
									value={supportRequest.role}
								/>
								<DashboardDetailField
									label="Email"
									value={supportRequest.email}
								/>
								<DashboardDetailField
									label="Created"
									value={formatPlatformDate(supportRequest.createdAt)}
								/>
								<DashboardDetailField
									label="Updated"
									value={formatPlatformDate(supportRequest.updatedAt)}
								/>
							</dl>
						</Card.Content>
					</Card>
				</div>
				<Card as="form" className="self-start" onSubmit={handleSubmit}>
					<Card.Header>
						<Card.Title>Inbox triage</Card.Title>
						<Card.Description>
							Add an internal note and update the fixture status.
						</Card.Description>
					</Card.Header>
					<Card.Content className="grid gap-4">
						<SelectInput
							disabled={isSubmitting}
							label="Status"
							onChange={setStatus}
							options={statusOptions}
							value={status}
						/>
						<TextAreaInput
							description="Adding a note to a new request moves it to In progress."
							disabled={isSubmitting}
							label="Internal note"
							onChange={setInternalNote}
							placeholder="Record the next step for platform operators."
							rows={6}
							value={internalNote}
						/>
					</Card.Content>
					<Card.Footer className="justify-end">
						<Button
							disabled={isSubmitting}
							loading={isSubmitting}
							type="submit"
						>
							Save triage
						</Button>
					</Card.Footer>
				</Card>
			</div>
		</DashboardSection>
	);
}
