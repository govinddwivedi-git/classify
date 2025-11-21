import { Card } from "@/components/ui/card";
import { BarChart3, Music, Zap } from "lucide-react";

interface Classification {
  genre: string;
}

interface StatsCardProps {
  history: Classification[];
}

const StatsCard = ({ history }: StatsCardProps) => {
  const totalClassifications = history.length;
  
  // Calculate most common genre
  const genreCounts = history.reduce((acc, item) => {
    acc[item.genre] = (acc[item.genre] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const mostCommonGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 bg-card border-border shadow-lg hover:shadow-glow transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary/20">
            <Music className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Classifications</p>
            <p className="text-2xl font-bold">{totalClassifications}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border shadow-lg hover:shadow-glow transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary/20">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Most Common</p>
            <p className="text-2xl font-bold">{mostCommonGenre ? mostCommonGenre[0] : "N/A"}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card border-border shadow-lg hover:shadow-glow transition-shadow">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-primary/20">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Unique Genres</p>
            <p className="text-2xl font-bold">{Object.keys(genreCounts).length || 0}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default StatsCard;
