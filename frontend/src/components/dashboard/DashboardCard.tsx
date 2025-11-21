import Card from '../ui/Card';

interface DashboardCardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

export default function DashboardCard({ title, description, onClick }: DashboardCardProps) {
  return (
    <Card hover className="cursor-pointer" onClick={onClick}>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </Card>
  );
}
