import { CollapsibleCard } from "../../components/ui/CollapsibleCard";

export function OrganizationSettings() {
    return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "32px", color: "var(--text-primary)" }}>Organization</h1>

            <CollapsibleCard title="Structure" description="How files and albums are organized.">
                <div style={{ color: "var(--text-secondary)", fontSize: "14px", fontStyle: "italic" }}>
                    Organization settings coming soon.
                </div>
            </CollapsibleCard>
        </div>
    );
}
