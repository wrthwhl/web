import { Card, CardContent, CardHeader, CardTitle } from '@wrthwhl/ui';

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-[var(--spacing-phi-lg)]">
      <h1 className="text-2xl font-bold mb-[var(--spacing-phi-lg)]">
        Analytics Dashboard
      </h1>

      <div className="grid gap-[var(--spacing-phi-md)] md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unique Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">-</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Referrer</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">-</p>
          </CardContent>
        </Card>
      </div>

      <p className="mt-[var(--spacing-phi-lg)] text-[hsl(var(--muted-foreground))]">
        Stats API coming soon...
      </p>
    </div>
  );
}
